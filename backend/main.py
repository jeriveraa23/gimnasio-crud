from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import clientes, membresias, planes, reportes
from routers import evaluaciones

app = FastAPI(title="Gimnasio CRUD API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(planes.router, prefix="/planes", tags=["Planes"])
app.include_router(clientes.router, prefix="/clientes", tags=["Clientes"])
app.include_router(membresias.router, prefix="/membresias", tags=["Membresias"])
app.include_router(reportes.router, prefix="/reportes", tags=["Reportes"])
app.include_router(evaluaciones.router, prefix="/evaluaciones", tags=["Evaluaciones"])

@app.get("/")
def root():
    return {"mensaje": "API Gimnasio funcionando"}