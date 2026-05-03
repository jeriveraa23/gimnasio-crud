from fastapi import APIRouter, HTTPException
from database import supabase
from schemas import PlanCreate

router = APIRouter()

@router.get("/")
def obtener_planes():
    response = supabase.table("planes").select("*").execute()
    return response.data

@router.get("/{plan_id}")
def obtener_plan(plan_id: int):
    response = supabase.table("planes").select("*").eq("id", plan_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return response.data[0]

@router.post("/")
def crear_plan(plan: PlanCreate):
    response = supabase.table("planes").insert(plan.model_dump()).execute()
    return response.data[0]

@router.put("/{plan_id}")
def actualizar_plan(plan_id: int, plan: PlanCreate):
    response = supabase.table("planes").update(plan.model_dump()).eq("id", plan_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return response.data[0]

@router.delete("/{plan_id}")
def eliminar_plan(plan_id: int):
    response = supabase.table("planes").delete().eq("id", plan_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return {"mensaje": "Plan eliminado correctamente"}