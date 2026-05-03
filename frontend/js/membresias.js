const API_URL = "https://gimnasio-crud-api.onrender.com";
let editandoId = null;
let planes = [];

async function cargarSelects() {
    const [resClientes, resPlanes] = await Promise.all([
        fetch(`${API_URL}/clientes/`),
        fetch(`${API_URL}/planes/`)
    ]);

    const clientes = await resClientes.json();
    planes = await resPlanes.json();

    const selectCliente = document.getElementById("cliente_id");
    const selectPlan = document.getElementById("plan_id");

    selectCliente.innerHTML = '<option value="">Selecciona un cliente</option>';
    clientes.forEach(c => {
        selectCliente.innerHTML += `<option value="${c.id}">${c.nombre} ${c.apellido}</option>`;
    });

    selectPlan.innerHTML = '<option value="">Selecciona un plan</option>';
    planes.forEach(p => {
        selectPlan.innerHTML += `<option value="${p.id}" data-dias="${p.duracion_dias}" data-precio="${p.precio}">${p.nombre} - $${p.precio.toLocaleString()}</option>`;
    });
}

function calcularFechaFin() {
    const selectPlan = document.getElementById("plan_id");
    const fechaInicio = document.getElementById("fecha_inicio").value;
    const selectedOption = selectPlan.options[selectPlan.selectedIndex];

    if (!fechaInicio || !selectedOption.dataset.dias) return;

    const dias = parseInt(selectedOption.dataset.dias);
    const precio = parseFloat(selectedOption.dataset.precio);
    const inicio = new Date(fechaInicio);
    inicio.setDate(inicio.getDate() + dias);

    document.getElementById("fecha_fin").value = inicio.toISOString().split("T")[0];
    document.getElementById("precio").value = precio;
}

async function cargarMembresias() {
    const res = await fetch(`${API_URL}/membresias/`);
    const membresias = await res.json();
    const tbody = document.getElementById("tabla-membresias");
    tbody.innerHTML = "";

    membresias.forEach(m => {
        const badge = getBadge(m.estado);
        const cliente = m.clientes ? `${m.clientes.nombre} ${m.clientes.apellido}` : m.cliente_id;
        const plan = m.planes ? m.planes.nombre : m.plan_id;

        tbody.innerHTML += `
            <tr>
                <td>${m.id}</td>
                <td>${cliente}</td>
                <td>${plan}</td>
                <td>${m.fecha_inicio}</td>
                <td>${m.fecha_fin}</td>
                <td>$${parseFloat(m.precio).toLocaleString()}</td>
                <td><span class="badge ${badge.clase}">${badge.texto}</span></td>
                <td>
                    <button class="btn btn-edit" onclick="editarMembresia(${m.id})">Editar</button>
                    <button class="btn btn-danger" onclick="eliminarMembresia(${m.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function getBadge(estado) {
    if (estado === "Activa") return { clase: "badge-activa", texto: "Activa" };
    if (estado === "Vencida") return { clase: "badge-vencida", texto: "Vencida" };
    return { clase: "badge-por-vencer", texto: "Por vencer" };
}

async function guardarMembresia() {
    const data = {
        cliente_id: parseInt(document.getElementById("cliente_id").value),
        plan_id: parseInt(document.getElementById("plan_id").value),
        fecha_inicio: document.getElementById("fecha_inicio").value,
        fecha_fin: document.getElementById("fecha_fin").value,
        precio: parseFloat(document.getElementById("precio").value)
    };

    if (!data.cliente_id || !data.plan_id || !data.fecha_inicio || !data.fecha_fin || !data.precio) {
        mostrarMensaje("Todos los campos son obligatorios", "error");
        return;
    }

    try {
        let res;
        if (editandoId) {
            res = await fetch(`${API_URL}/membresias/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch(`${API_URL}/membresias/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        if (res.ok) {
            mostrarMensaje(editandoId ? "Membresía actualizada" : "Membresía creada", "ok");
            limpiarFormulario();
            cargarMembresias();
        } else {
            mostrarMensaje("Error al guardar la membresía", "error");
        }
    } catch (e) {
        mostrarMensaje("Error de conexión con el servidor", "error");
    }
}

async function editarMembresia(id) {
    const res = await fetch(`${API_URL}/membresias/${id}`);
    const m = await res.json();

    document.getElementById("cliente_id").value = m.cliente_id;
    document.getElementById("plan_id").value = m.plan_id;
    document.getElementById("fecha_inicio").value = m.fecha_inicio;
    document.getElementById("fecha_fin").value = m.fecha_fin;
    document.getElementById("precio").value = m.precio;
    document.getElementById("form-titulo").textContent = "Editar Membresía";

    editandoId = id;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminarMembresia(id) {
    if (!confirm("¿Estás seguro de eliminar esta membresía?")) return;

    const res = await fetch(`${API_URL}/membresias/${id}`, { method: "DELETE" });
    if (res.ok) {
        mostrarMensaje("Membresía eliminada", "ok");
        cargarMembresias();
    } else {
        mostrarMensaje("Error al eliminar", "error");
    }
}

function limpiarFormulario() {
    document.getElementById("cliente_id").value = "";
    document.getElementById("plan_id").value = "";
    document.getElementById("fecha_inicio").value = "";
    document.getElementById("fecha_fin").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("form-titulo").textContent = "Nueva Membresía";
    editandoId = null;
}

function mostrarMensaje(texto, tipo) {
    const el = document.getElementById("mensaje");
    el.textContent = texto;
    el.className = `mensaje mensaje-${tipo}`;
    el.style.display = "block";
    setTimeout(() => el.style.display = "none", 3000);
}

cargarSelects();
cargarMembresias();