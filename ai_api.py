from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/api/ai/detect-pests')
async def detect_pests(image: UploadFile = File(...)):
    contents = await image.read()
    img = Image.open(io.BytesIO(contents))
    # Dummy response
    return {
        "predictions": [
            {"class": "Powdery Mildew", "score": 0.92, "bbox": [10, 10, 100, 100]}
        ]
    }
