from fastapi import FastAPI, HTTPException
from app.routes import router

app = FastAPI(title="Misinformation Detection API", version="1.0")

app.include_router(router)
