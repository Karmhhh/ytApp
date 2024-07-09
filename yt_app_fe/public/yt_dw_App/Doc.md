# Documentazione API FastAPI Video Manager

## Panoramica
Questa applicazione FastAPI permette agli utenti di caricare, eliminare e scaricare video da YouTube. Supporta formati video e audio e gestisce una lista di oggetti video.

## Endpoints

### Carica Video
**Endpoint:** `POST /uploadVideo`

Carica un video sul server.

**Corpo della richiesta:**
```json
{
  "video_url": "string",
  "ex": "string"
}
```
- `video_url`: L'URL del video di YouTube da caricare.
- `ex`: L'estensione del file da scaricare (ad esempio, `.mp3` per l'audio).

**Risposte:**
- `200 OK`: Ritorna la lista aggiornata di video caricati.

### Visualizza Video
**Endpoint:** `GET /videos`

Visualizza la lista di tutti i video caricati.

**Risposte:**
- `200 OK`: Ritorna la lista dei video caricati.

### Elimina Video
**Endpoint:** `GET /delete/{index}`

Elimina un video specificato dall'indice.

**Parametri:**
- `index`: L'indice del video da eliminare.

**Risposte:**
- `200 OK`: Messaggio di successo indicando che il video è stato eliminato.
- `404 Not Found`: Se il video con l'indice specificato non è trovato.

### Scarica Video
**Endpoint:** `GET /download`

Scarica tutti i video nella lista. A seconda dell'estensione specificata (`.mp3` o altro), scarica il video come audio o video.

**Risposte:**
- `200 OK`: Messaggio di successo indicando che il download è completato.
- `404 Not Found`: Se non ci sono video caricati.

## Configurazione Middleware CORS
L'applicazione è configurata per consentire richieste da tutte le origini.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## Variabili di Configurazione
- `VIDEO_DOWNLOAD_DIR`: Directory dove i video saranno scaricati.
- `AUDIOS_DOWNLOAD_DIR`: Directory dove gli audio saranno scaricati.

## Esempio di Implementazione
```python
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
    info = yt_dlp.YoutubeDL({'quiet':True ,'extract_flat':True}).extract_info(request.video_url, download=False)
    title = info.get('title', None)
    video = YouTube(request.video_url)
    arrayVideos.append({"title": title, "video": video, "ex": request.ex, "url": request.video_url, "index": uuid.uuid4()})
    return arrayVideos

@app.get("/videos")
async def get_videos():
    return arrayVideos

# Configura il logging
logging.basicConfig(level=logging.INFO)

@app.get("/delete/{index}")
async def delete_video(index: str):
    logging.info(f"Received request to delete video with index: {index}")
    logging.info(f"Current videos: {arrayVideos}")
    
    # Trova l'oggetto video con la proprietà specificata index
    video = next((video for video in arrayVideos if video.get("index") == uuid.UUID(index)), None)

    # Verifica se l'oggetto video è stato trovato
    if video is None:
        logging.error(f"Video with index {index} not found")
        raise HTTPException(status_code=404, detail="Video not found")

    # Rimuovi l'oggetto video dall'array
    arrayVideos.remove(video)

    # Log successo
    logging.info(f"Video {video['title']} deleted successfully")

    # Ritorna un messaggio di successo
    return {"message": f"Video {video['title']} deleted successfully"}

@app.get("/download")
async def download_video():
    if len(arrayVideos) > 0:
        for item in arrayVideos:
            if item.get("ex") == ".mp3":
                audio_stream = item.get("video").streams.filter(only_audio=True).first()
                audio_stream.download(AUDIOS_DOWNLOAD_DIR, filename=item.get("title") + ".mp3")
            else:
                video_stream = item.get("video").streams.get_highest_resolution()
                video_stream.download(VIDEO_DOWNLOAD_DIR)  
        arrayVideos.clear()         
        return {"message": "Download completato."}
    else:
        raise HTTPException(status_code=404, detail="Nessun video caricato.")
```
