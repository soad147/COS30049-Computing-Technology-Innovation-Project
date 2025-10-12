from fastapi import APIRouter, HTTPException
from app.model_loader import predict_text
from app.schemas import PredictionRequest, PredictionResponse

router = APIRouter()

@router.get("/")
def root():
    return {"message": "Welcome to the Misinformation Detection API"}

@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    try:
        prediction, confidence = predict_text(request.text)
        return PredictionResponse(label=prediction, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
