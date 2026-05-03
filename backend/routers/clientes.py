from fastapi import APIRouter, HTTPException
from database import supabase
from schemas import ClienteCreate

router = APIRouter()

@router.get("/")
def obtener_clientes():
    response = supabase.table("clientes").select("*").execute()
    return response.data

@router.get("/{cliente_id}")
def obtener_cliente(cliente_id: int):
    response = supabase.table("clientes").select("*").eq("id", cliente_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return response.data[0]

@router.post("/")
def crear_cliente(cliente: ClienteCreate):
    data = cliente.model_dump()
    if data.get("fecha_nacimiento"):
        data["fecha_nacimiento"] = str(data["fecha_nacimiento"])
    response = supabase.table("clientes").insert(data).execute()
    return response.data[0]

@router.put("/{cliente_id}")
def actualizar_cliente(cliente_id: int, cliente: ClienteCreate):
    data = cliente.model_dump()
    if data.get("fecha_nacimiento"):
        data["fecha_nacimiento"] = str(data["fecha_nacimiento"])
    response = supabase.table("clientes").update(data).eq("id", cliente_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return response.data[0]

@router.delete("/{cliente_id}")
def eliminar_cliente(cliente_id: int):
    response = supabase.table("clientes").delete().eq("id", cliente_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"mensaje": "Cliente eliminado correctamente"}