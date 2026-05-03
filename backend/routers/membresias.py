from fastapi import APIRouter, HTTPException
from database import supabase
from schemas import MembresiaCreate
from datetime import date

router = APIRouter()

def calcular_estado(fecha_fin: str) -> str:
    hoy = date.today()
    fin = date.fromisoformat(fecha_fin)
    diferencia = (fin - hoy).days

    if diferencia < 0:
        return "Vencida"
    elif diferencia <= 7:
        return "Por vencer"
    else:
        return "Activa"

@router.get("/")
def obtener_membresias():
    response = supabase.table("membresias").select(
        "*, clientes(nombre, apellido), planes(nombre)"
    ).execute()
    
    membresias = []
    for m in response.data:
        m["estado"] = calcular_estado(m["fecha_fin"])
        membresias.append(m)
    
    return membresias

@router.get("/{membresia_id}")
def obtener_membresia(membresia_id: int):
    response = supabase.table("membresias").select(
        "*, clientes(nombre, apellido), planes(nombre)"
    ).eq("id", membresia_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Membresía no encontrada")
    
    m = response.data[0]
    m["estado"] = calcular_estado(m["fecha_fin"])
    return m

@router.post("/")
def crear_membresia(membresia: MembresiaCreate):
    data = membresia.model_dump()
    data["fecha_inicio"] = str(data["fecha_inicio"])
    data["fecha_fin"] = str(data["fecha_fin"])
    response = supabase.table("membresias").insert(data).execute()
    return response.data[0]

@router.put("/{membresia_id}")
def actualizar_membresia(membresia_id: int, membresia: MembresiaCreate):
    data = membresia.model_dump()
    data["fecha_inicio"] = str(data["fecha_inicio"])
    data["fecha_fin"] = str(data["fecha_fin"])
    response = supabase.table("membresias").update(data).eq("id", membresia_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Membresía no encontrada")
    return response.data[0]

@router.delete("/{membresia_id}")
def eliminar_membresia(membresia_id: int):
    response = supabase.table("membresias").delete().eq("id", membresia_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Membresía no encontrada")
    return {"mensaje": "Membresía eliminada correctamente"}