from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import upload, process, dashboard, analisa_ganda_dalam, analisa_ganda_antar, analisa_potensial_dalam, analisa_potensial_antar
from app.routers import analisa_anomali_umur
from app.routers import analisa_anomali_kelamin
from app.routers import analisa_fuzzy
from app.routers import analisa_fuzzy_antar
from app.routers import analisa_outlier_nkk_prov
from app.routers import model_rekap





app = FastAPI(title="PDPB Analisa API")

# CORS (biar frontend nanti aman)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REGISTER ROUTER
app.include_router(upload.router)
app.include_router(process.router)
app.include_router(dashboard.router)
app.include_router(analisa_ganda_dalam.router)
app.include_router(analisa_ganda_antar.router)
app.include_router(analisa_potensial_dalam.router)
app.include_router(analisa_potensial_antar.router)
app.include_router(analisa_anomali_umur.router)
app.include_router(analisa_anomali_kelamin.router)
app.include_router(analisa_fuzzy.router)
app.include_router(analisa_fuzzy_antar.router)
app.include_router(analisa_outlier_nkk_prov.router)
app.include_router(model_rekap.router)







@app.get("/")
def root():
    return {"status": "API berjalan"}
