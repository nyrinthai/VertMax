import collections
import os
import urllib.request
from dataclasses import dataclass
from typing import Optional

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

LEFT_SHOULDER, RIGHT_SHOULDER = 11, 12
LEFT_HIP, RIGHT_HIP = 23, 24

MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
    "pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "pose_landmarker_lite.task")


def ensure_model() -> str:
    if not os.path.exists(MODEL_PATH):
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    return MODEL_PATH


@dataclass
class JumpResult:
    takeoff_time: Optional[float]
    landing_time: Optional[float]
    error: Optional[str] = None


def _average(values):
    return float(np.mean(values)) if values else 0.0


def _find_stable_baseline_window(hip_ys, search_frac=0.6, window_frames=8):
    """
    Instead of blindly trusting the first few frames (which may capture
    setup/walk-in movement, not actual standing), scan the first
    `search_frac` of the clip for the window with the LOWEST variance in
    hip position -- i.e. the steadiest moment -- and use that as the
    calibration baseline. Much more robust to clips that don't start
    with the person already standing still and ready.
    """
    search_end = max(window_frames + 1, int(len(hip_ys) * search_frac))
    best_start = 0
    best_variance = float("inf")

    for start in range(0, max(1, search_end - window_frames)):
        window = hip_ys[start:start + window_frames]
        variance = float(np.var(window))
        if variance < best_variance:
            best_variance = variance
            best_start = start

    return best_start, best_start + window_frames


def _detect_from_samples(
    samples: list[tuple[float, float, float]],  # (t, hip_y, torso_len)
    takeoff_thresh: float = 0.15,
    land_thresh: float = 0.06,
    smoothing_window: int = 3,
    min_air_frames: int = 2,
    max_flight_seconds: float = 1.2,
) -> JumpResult:
    if len(samples) < 10:
        return JumpResult(None, None, error="Video too short or too few frames with a detected pose.")

    times = [s[0] for s in samples]
    hip_ys = [s[1] for s in samples]
    torso_lens = [s[2] for s in samples]

    calib_start, calib_end = _find_stable_baseline_window(hip_ys)
    baseline_y = _average(hip_ys[calib_start:calib_end])
    baseline_scale = _average(torso_lens[calib_start:calib_end])

    if baseline_scale < 1e-6:
        return JumpResult(None, None, error="Could not establish a stable body-scale baseline.")

    smoothed = []
    buf = collections.deque(maxlen=smoothing_window)
    for y in hip_ys:
        buf.append(y)
        smoothed.append(float(np.mean(buf)))

    avg_dt = (times[-1] - times[0]) / max(1, len(times) - 1)
    max_flight_frames = max(1, int(max_flight_seconds / avg_dt)) if avg_dt > 0 else len(samples)

    state = "ground"
    air_count = 0
    takeoff_idx = None
    landing_idx = None

    start_scan = calib_end
    for i in range(start_scan, len(samples)):
        displacement = (baseline_y - smoothed[i]) / baseline_scale

        if state == "ground":
            if displacement > takeoff_thresh:
                air_count += 1
                if air_count >= min_air_frames:
                    state = "air"
                    takeoff_idx = i - min_air_frames + 1
            else:
                air_count = 0
        elif state == "air":
            if displacement < land_thresh:
                landing_idx = i
                break
            if takeoff_idx is not None and (i - takeoff_idx) > max_flight_frames:
                return JumpResult(
                    None, None,
                    error=(
                        "Detected takeoff but no plausible landing within "
                        f"{max_flight_seconds}s. The clip may include extra "
                        "footage before/after the jump, or the camera/framing "
                        "changed mid-clip. Try trimming the video to just the jump."
                    ),
                )

    if takeoff_idx is None or landing_idx is None:
        return JumpResult(
            None, None,
            error="Could not detect a clear jump in this clip (no takeoff/landing found)."
        )

    return JumpResult(takeoff_time=times[takeoff_idx], landing_time=times[landing_idx])


def analyze_jump(video_path: str) -> JumpResult:
    """
    Runs pose detection over the full video and returns detected
    takeoff/landing timestamps in seconds (matching player.currentTime
    units on the RN side).
    """
    model_path = ensure_model()

    base_options = mp_python.BaseOptions(model_asset_path=model_path)
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    landmarker = vision.PoseLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return JumpResult(None, None, error="Could not open the uploaded video file.")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    samples = []
    frame_idx = 0

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break

            timestamp_ms = int((frame_idx / fps) * 1000)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            result = landmarker.detect_for_video(mp_image, timestamp_ms)

            if result.pose_landmarks:
                lm = result.pose_landmarks[0]
                hip_y = (lm[LEFT_HIP].y + lm[RIGHT_HIP].y) / 2.0
                shoulder_y = (lm[LEFT_SHOULDER].y + lm[RIGHT_SHOULDER].y) / 2.0
                torso_len = abs(hip_y - shoulder_y)
                samples.append((timestamp_ms / 1000.0, hip_y, torso_len))

            frame_idx += 1
    finally:
        cap.release()
        landmarker.close()

    return _detect_from_samples(samples)