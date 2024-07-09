import logging
import uuid
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pytube import YouTube
from fastapi.middleware.cors import CORSMiddleware 
import yt_dlp

app = FastAPI()
# Configura il middleware CORS per consentire le richieste da tutti gli origini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

VIDEO_DOWNLOAD_DIR = "../Downloads/Videos"
AUDIOS_DOWNLOAD_DIR = "../Downloads/Audios"

arrayVideos = []

class VideoObj(BaseModel):
    video_url: str
    ex: str


@app.post("/uploadVideo")
async def uploadVideo(request: VideoObj):
    info = yt_dlp.YoutubeDL({'quiet':True ,'extract_flat':True}).extract_info(request.video_url,download=False)
    title = info.get('title',None)
    video = YouTube(request.video_url)
    arrayVideos.append({"title":title,"video":video,"ex":request.ex,"url":request.video_url, "index": uuid.uuid4()})
    return arrayVideos

@app.get("/videos")
async def uploadVideo():
      return arrayVideos
# Configure logging
logging.basicConfig(level=logging.INFO)

@app.get("/delete/{index}")
async def delete_video(index: str):
    logging.info(f"Received request to delete video with index: {index}")
    logging.info(f"Current videos: {arrayVideos}")
    
    # Find the video object with the specified index property
    video = next((video for video in arrayVideos if video.get("index") == uuid.UUID(index)), None)

    # Check if the video object was found
    if video is None:
        logging.error(f"Video with index {index} not found")
        raise HTTPException(status_code=404, detail="Video not found")

    # Remove the video object from the array
    arrayVideos.remove(video)

    # Log success
    logging.info(f"Video {video['title']} deleted successfully")

    # Return a success message
    return {"message": f"Video {video['title']} deleted successfully"}

@app.get("/download")
async def download_video():
    if len(arrayVideos) > 0:
        for item in arrayVideos:
            if item.get("ex") == ".mp3":
                audio_stream = item.get("video").streams.filter(only_audio=True).first()
                audio_stream.download(AUDIOS_DOWNLOAD_DIR, filename = item.get("title")+".mp3" )
            else:
                video_stream = item.get("video").streams.get_highest_resolution()
                video_stream.download(VIDEO_DOWNLOAD_DIR)  
        arrayVideos.clear()         
        return {"message": "Download Completed."}
    else:
        raise HTTPException(status_code=404, detail="No Videos Uploaded.") 
