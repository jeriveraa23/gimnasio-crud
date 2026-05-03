const API_URL = "https://gimnasio-crud-api.onrender.com";
let xmlContent = "";

async function cargarEstadisticas() {
    const res = await fetch(`${API_URL}/reportes/json`);
    const data = await res.json();

    const grid = document.getElementById("stats-grid");
    grid.innerHTML = `
        <div class="stat-card">
            <div class="valor">${data.total_membresias}</div>
            <div class="label">Total Membresías</div>
        </div>
        <div class="stat-card">
            <div class="valor">$${data.total_ingresos.toLocaleString()}</div>
            <div class="label">Total Ingresos (COP)</div>
        </div>
        <div class="stat-card">
            <div class="valor" style="color: #27ae60">${data.porcentajes.activas}</div>
            <div class="label">Membresías Activas</div>
        </div>
        <div class="stat-card">
            <div class="valor" style="color: #c0392b">${data.porcentajes.vencidas}</div>
            <div class="label">Membresías Vencidas</div>
        </div>
        <div class="stat-card">
            <div class="valor" style="color: #f39c12">${data.porcentajes.por_vencer}</div>
            <div class="label">Por Vencer</div>
        </div>
    `;
}

async function cargarXML() {
    const res = await fetch(`${API_URL}/reportes/xml`);
    xmlContent = await res.text();

    const container = document.getElementById("xml-tree");
    container.innerHTML = renderXMLTree(xmlContent);
}

function renderXMLTree(xmlStr) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, "application/xml");
    return `<pre>${colorearXML(xmlStr)}</pre>`;
}

function colorearXML(xml) {
    return xml
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/(&lt;\/?[\w]+)/g, '<span style="color:#e63946">$1</span>')
        .replace(/([\w]+="[^"]*")/g, '<span style="color:#f39c12">$1</span>')
        .replace(/(&gt;)([^&<]+)(&lt;)/g, '$1<span style="color:#a8d8a8">$2</span>$3');
}

async function descargarXML() {
    if (!xmlContent) {
        await cargarXML();
    }
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_gimnasio.xml";
    a.click();
    URL.revokeObjectURL(url);
}

cargarEstadisticas();