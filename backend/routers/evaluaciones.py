from fastapi import APIRouter, HTTPException
from database import supabase
from schemas import EvaluacionCreate
from datetime import date
import json

router = APIRouter()

@router.get("/")
def obtener_evaluaciones():
    response = supabase.table("evaluaciones").select("*, clientes(nombre, apellido)").execute()
    return response.data

@router.get("/cliente/{cliente_id}")
def obtener_evaluaciones_cliente(cliente_id: int):
    response = supabase.table("evaluaciones").select("*").eq("cliente_id", cliente_id).order("fecha", desc=False).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No hay evaluaciones para este cliente")
    return response.data

@router.post("/")
def crear_evaluacion(evaluacion: EvaluacionCreate):
    data = evaluacion.model_dump()
    data["fecha"] = str(data["fecha"])
    response = supabase.table("evaluaciones").insert(data).execute()
    return response.data[0]

@router.get("/{evaluacion_id}")
def obtener_evaluacion(evaluacion_id: int):
    response = supabase.table("evaluaciones").select("*, clientes(nombre, apellido)").eq("id", evaluacion_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada")
    return response.data[0]

@router.put("/{evaluacion_id}")
def actualizar_evaluacion(evaluacion_id: int, evaluacion: EvaluacionCreate):
    data = evaluacion.model_dump()
    data["fecha"] = str(data["fecha"])
    response = supabase.table("evaluaciones").update(data).eq("id", evaluacion_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada")
    return response.data[0]

@router.delete("/{evaluacion_id}")
def eliminar_evaluacion(evaluacion_id: int):
    response = supabase.table("evaluaciones").delete().eq("id", evaluacion_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada")
    return {"mensaje": "Evaluación eliminada correctamente"}

@router.get("/progreso/{cliente_id}")
def obtener_progreso(cliente_id: int):
    """Retorna progreso del cliente con estadísticas"""
    response = supabase.table("evaluaciones").select("*").eq("cliente_id", cliente_id).order("fecha", desc=False).execute()
    
    if not response.data:
        return {"error": "No hay evaluaciones", "cliente_id": cliente_id}
    
    evaluaciones = response.data
    
    # Calcular cambios
    primera = evaluaciones[0]
    ultima = evaluaciones[-1]
    
    cambio_peso = float(ultima["peso"]) - float(primera["peso"])
    cambio_cintura = float(ultima["cintura"]) - float(primera["cintura"])
    cambio_pecho = float(ultima["pecho"]) - float(primera["pecho"])
    cambio_brazos = float(ultima["brazos"]) - float(primera["brazos"])
    cambio_muslos = float(ultima["muslos"]) - float(primera["muslos"])
    
    return {
        "cliente_id": cliente_id,
        "evaluaciones": len(evaluaciones),
        "primera_evaluacion": primera["fecha"],
        "ultima_evaluacion": ultima["fecha"],
        "cambios": {
            "peso": cambio_peso,
            "cintura": cambio_cintura,
            "pecho": cambio_pecho,
            "brazos": cambio_brazos,
            "muslos": cambio_muslos
        },
        "datos": evaluaciones
    }
