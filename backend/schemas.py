from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

# --- PLANES ---
class PlanBase(BaseModel):
    nombre: str
    duracion_dias: int
    precio: float
    descripcion: Optional[str] = None

class PlanCreate(PlanBase):
    pass

class Plan(PlanBase):
    id: int
    class Config:
        from_attributes = True

# --- CLIENTES ---
class ClienteBase(BaseModel):
    nombre: str
    apellido: str
    email: str
    telefono: Optional[str] = None
    fecha_nacimiento: Optional[date] = None

class ClienteCreate(ClienteBase):
    pass

class Cliente(ClienteBase):
    id: int
    fecha_registro: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- MEMBRESIAS ---
class MembresiaBase(BaseModel):
    cliente_id: int
    plan_id: int
    fecha_inicio: date
    fecha_fin: date
    precio: float

class MembresiaCreate(MembresiaBase):
    pass

class Membresia(MembresiaBase):
    id: int
    estado: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True