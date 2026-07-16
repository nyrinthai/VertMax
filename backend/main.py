import os
import tempfile
import shutil

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from jump_detection import analyze_jump

app = FastAPI(title="VerticalTracker Jump Detection API")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze-jump")
async def analyze_jump_endpoint(video: UploadFile = File(...)):
    if not video.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    suffix = os.path.splitext(video.filename)[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        shutil.copyfileobj(video.file, tmp)

    try:
        result = analyze_jump(tmp_path)
    finally:
        os.remove(tmp_path)

    if result.error:
        return JSONResponse(
            status_code=422,
            content={"error": result.error},
        )

    return {
        "takeoffTime": result.takeoff_time,
        "landingTime": result.landing_time,
    }