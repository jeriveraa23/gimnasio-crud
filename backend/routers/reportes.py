from fastapi import APIRouter
from fastapi.responses import Response
from database import supabase
from datetime import date
import xml.etree.ElementTree as ET

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

@router.get("/xml")
def reporte_xml():
    # Obtener datos
    membresias = supabase.table("membresias").select(
        "*, clientes(nombre, apellido), planes(nombre)"
    ).execute().data

    # Calcular totales
    total_ingresos = sum(float(m["precio"]) for m in membresias)
    total_membresias = len(membresias)

    activas = 0
    vencidas = 0
    por_vencer = 0

    # Raíz del árbol XML
    root = ET.Element("gimnasio")
    root.set("fecha_reporte", str(date.today()))

    # Nodo resumen
    resumen = ET.SubElement(root, "resumen")
    ET.SubElement(resumen, "total_membresias").text = str(total_membresias)
    ET.SubElement(resumen, "total_ingresos").text = f"{total_ingresos:.2f}"

    # Nodo membresías agrupadas
    nodo_membresias = ET.SubElement(root, "membresias")

    for m in membresias:
        estado = calcular_estado(m["fecha_fin"])

        if estado == "Activa":
            activas += 1
        elif estado == "Vencida":
            vencidas += 1
        else:
            por_vencer += 1

        nodo_m = ET.SubElement(nodo_membresias, "membresia")
        nodo_m.set("id", str(m["id"]))
        nodo_m.set("estado", estado)

        cliente = m.get("clientes", {})
        ET.SubElement(nodo_m, "cliente").text = f"{cliente.get('nombre', '')} {cliente.get('apellido', '')}"

        plan = m.get("planes", {})
        ET.SubElement(nodo_m, "plan").text = plan.get("nombre", "")

        ET.SubElement(nodo_m, "fecha_inicio").text = m["fecha_inicio"]
        ET.SubElement(nodo_m, "fecha_fin").text = m["fecha_fin"]
        ET.SubElement(nodo_m, "precio").text = f"{float(m['precio']):.2f}"

    # Nodo porcentajes
    porcentajes = ET.SubElement(resumen, "porcentajes")
    if total_membresias > 0:
        ET.SubElement(porcentajes, "activas").text = f"{(activas / total_membresias * 100):.1f}%"
        ET.SubElement(porcentajes, "vencidas").text = f"{(vencidas / total_membresias * 100):.1f}%"
        ET.SubElement(porcentajes, "por_vencer").text = f"{(por_vencer / total_membresias * 100):.1f}%"
    else:
        ET.SubElement(porcentajes, "activas").text = "0%"
        ET.SubElement(porcentajes, "vencidas").text = "0%"
        ET.SubElement(porcentajes, "por_vencer").text = "0%"

    # Convertir a string con indentación
    ET.indent(root, space="  ")
    xml_str = ET.tostring(root, encoding="unicode", xml_declaration=False)
    xml_output = '<?xml version="1.0" encoding="UTF-8"?>\n' + xml_str

    return Response(content=xml_output, media_type="application/xml")


@router.get("/json")
def reporte_json():
    membresias = supabase.table("membresias").select(
        "*, clientes(nombre, apellido), planes(nombre)"
    ).execute().data

    total_ingresos = sum(float(m["precio"]) for m in membresias)
    total_membresias = len(membresias)

    activas = sum(1 for m in membresias if calcular_estado(m["fecha_fin"]) == "Activa")
    vencidas = sum(1 for m in membresias if calcular_estado(m["fecha_fin"]) == "Vencida")
    por_vencer = sum(1 for m in membresias if calcular_estado(m["fecha_fin"]) == "Por vencer")

    return {
        "total_membresias": total_membresias,
        "total_ingresos": round(total_ingresos, 2),
        "porcentajes": {
            "activas": f"{(activas / total_membresias * 100):.1f}%" if total_membresias > 0 else "0%",
            "vencidas": f"{(vencidas / total_membresias * 100):.1f}%" if total_membresias > 0 else "0%",
            "por_vencer": f"{(por_vencer / total_membresias * 100):.1f}%" if total_membresias > 0 else "0%"
        },
        "membresias": [
            {**m, "estado": calcular_estado(m["fecha_fin"])}
            for m in membresias
        ]
    }