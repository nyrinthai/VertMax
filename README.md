# VertMax
A mobile app built with Expo and React Native that measures vertical jump height from a video.

## Overview
### Users can:
1. Record a jump using their device's camera
2. Review the video
3. Automatically detect takeoff and landing
4. View the estimated vertical in inches

## Technology
- Mobile app: Expo and React Native
- Backend API: FastAPI
- Jump detection: OpenCV reads uploaded video frames, MediaPipe Pose Landmarker Lite tracks body landmarks, and NumPy smooths hip movement to detect takeoff and landing from video.
