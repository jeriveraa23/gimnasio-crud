const API_URL = "https://gimnasio-crud-api.onrender.com";
let editandoId = null;

async function cargarClientes() {
    const res = await fetch(`${API_URL}/clientes/`);
    const clientes = await res.json();
    const tbody = document.getElementById("tabla-clientes");
    tbody.innerHTML = "";

    clientes.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.id}</td>
                <td>${c.nombre} ${c.apellido}</td>
                <td>${c.email}</td>
                <td>${c.telefono || "-"}</td>
                <td>${c.fecha_nacimiento || "-"}</td>
                <td>
                    <button class="btn btn-edit" onclick="editarCliente(${c.id})">Editar</button>
                    <button class="btn btn-danger" onclick="eliminarCliente(${c.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

async function guardarCliente() {
    const data = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        email: document.getElementById("email").value,
        telefono: document.getElementById("telefono").value,
        fecha_nacimiento: document.getElementById("fecha_nacimiento").value || null
    };

    if (!data.nombre || !data.apellido || !data.email) {
        mostrarMensaje("Nombre, apellido y email son obligatorios", "error");
        return;
    }

    try {
        let res;
        if (editandoId) {
            res = await fetch(`${API_URL}/clientes/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch(`${API_URL}/clientes/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        if (res.ok) {
            mostrarMensaje(editandoId ? "Cliente actualizado" : "Cliente creado", "ok");
            limpiarFormulario();
            cargarClientes();
        } else {
            mostrarMensaje("Error al guardar el cliente", "error");
        }
    } catch (e) {
        mostrarMensaje("Error de conexión con el servidor", "error");
    }
}

async function editarCliente(id) {
    const res = await fetch(`${API_URL}/clientes/${id}`);
    const c = await res.json();

    document.getElementById("nombre").value = c.nombre;
    document.getElementById("apellido").value = c.apellido;
    document.getElementById("email").value = c.email;
    document.getElementById("telefono").value = c.telefono || "";
    document.getElementById("fecha_nacimiento").value = c.fecha_nacimiento || "";
    document.getElementById("form-titulo").textContent = "Editar Cliente";

    editandoId = id;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminarCliente(id) {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;

    const res = await fetch(`${API_URL}/clientes/${id}`, { method: "DELETE" });
    if (res.ok) {
        mostrarMensaje("Cliente eliminado", "ok");
        cargarClientes();
    } else {
        mostrarMensaje("Error al eliminar", "error");
    }
}

function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";
    document.getElementById("email").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("fecha_nacimiento").value = "";
    document.getElementById("form-titulo").textContent = "Nuevo Cliente";
    editandoId = null;
}

function mostrarMensaje(texto, tipo) {
    const el = document.getElementById("mensaje");
    el.textContent = texto;
    el.className = `mensaje mensaje-${tipo}`;
    el.style.display = "block";
    setTimeout(() => el.style.display = "none", 3000);
}

cargarClientes();