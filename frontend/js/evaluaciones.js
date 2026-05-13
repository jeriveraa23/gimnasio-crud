const API_URL = "https://gimnasio-crud-api.onrender.com";
let clientesCache = [];
let evaluacionesCache = [];
let chart = null;

// CARGAR CLIENTES
async function cargarClientes() {
    try {
        const response = await fetch(`${API_URL}/clientes`);
        clientesCache = await response.json();
        
        // Llenar selects
        const selectPrincipal = document.getElementById("clienteSelect");
        const selectProgreso = document.getElementById("clienteProgresoSelect");
        
        selectPrincipal.innerHTML = '<option value="">Seleccionar cliente...</option>';
        selectProgreso.innerHTML = '<option value="">Seleccionar cliente...</option>';
        
        clientesCache.forEach(cliente => {
            const option1 = document.createElement("option");
            option1.value = cliente.id;
            option1.textContent = `${cliente.nombre} ${cliente.apellido}`;
            selectPrincipal.appendChild(option1);
            
            const option2 = document.createElement("option");
            option2.value = cliente.id;
            option2.textContent = `${cliente.nombre} ${cliente.apellido}`;
            selectProgreso.appendChild(option2);
        });
    } catch (error) {
        console.error("Error cargando clientes:", error);
        alert("Error al cargar los clientes");
    }
}

// CARGAR EVALUACIONES
async function cargarEvaluaciones() {
    try {
        const response = await fetch(`${API_URL}/evaluaciones`);
        evaluacionesCache = await response.json();
        mostrarTabla();
    } catch (error) {
        console.error("Error cargando evaluaciones:", error);
    }
}

// MOSTRAR TABLA
function mostrarTabla() {
    const tbody = document.querySelector("#evaluacionesTable tbody");
    tbody.innerHTML = "";
    
    evaluacionesCache.forEach(eval => {
        const cliente = clientesCache.find(c => c.id === eval.cliente_id);
        const nombre = cliente ? `${cliente.nombre} ${cliente.apellido}` : "N/A";
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${nombre}</td>
            <td>${eval.fecha}</td>
            <td>${parseFloat(eval.peso).toFixed(1)} kg</td>
            <td>${parseFloat(eval.cintura).toFixed(1)} cm</td>
            <td>${parseFloat(eval.pecho).toFixed(1)} cm</td>
            <td>${parseFloat(eval.brazos).toFixed(1)} cm</td>
            <td>${parseFloat(eval.muslos).toFixed(1)} cm</td>
            <td>
                <button class="btn btn-small" onclick="editarEvaluacion(${eval.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="eliminarEvaluacion(${eval.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// CREAR EVALUACIÓN
async function crearEvaluacion() {
    const clienteId = document.getElementById("clienteSelect").value;
    const fecha = document.getElementById("fechaInput").value;
    const peso = document.getElementById("pesoInput").value;
    const cintura = document.getElementById("cinturaInput").value;
    const pecho = document.getElementById("pechoInput").value;
    const brazos = document.getElementById("brazosInput").value;
    const muslos = document.getElementById("muslosInput").value;
    
    if (!clienteId || !fecha || !peso || !cintura || !pecho || !brazos || !muslos) {
        alert("Por favor completa todos los campos");
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/evaluaciones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cliente_id: parseInt(clienteId),
                fecha,
                peso: parseFloat(peso),
                cintura: parseFloat(cintura),
                pecho: parseFloat(pecho),
                brazos: parseFloat(brazos),
                muslos: parseFloat(muslos)
            })
        });
        
        if (response.ok) {
            alert("Evaluación registrada correctamente");
            limpiarFormulario();
            cargarEvaluaciones();
        } else {
            alert("Error al guardar la evaluación");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al guardar la evaluación");
    }
}

// LIMPIAR FORMULARIO
function limpiarFormulario() {
    document.getElementById("clienteSelect").value = "";
    document.getElementById("fechaInput").value = "";
    document.getElementById("pesoInput").value = "";
    document.getElementById("cinturaInput").value = "";
    document.getElementById("pechoInput").value = "";
    document.getElementById("brazosInput").value = "";
    document.getElementById("muslosInput").value = "";
}

// MOSTRAR PROGRESO
async function mostrarProgreso() {
    const clienteId = document.getElementById("clienteProgresoSelect").value;
    
    if (!clienteId) {
        document.getElementById("graficoContainer").style.display = "none";
        document.getElementById("resumenProgreso").style.display = "none";
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/evaluaciones/progreso/${clienteId}`);
        const data = await response.json();
        
        if (data.error) {
            alert(data.error);
            document.getElementById("graficoContainer").style.display = "none";
            document.getElementById("resumenProgreso").style.display = "none";
            return;
        }
        
        mostrarGrafico(data);
        mostrarResumenProgreso(data);
        
    } catch (error) {
        console.error("Error:", error);
        alert("Error al cargar el progreso");
    }
}

// MOSTRAR GRÁFICO
function mostrarGrafico(data) {
    const container = document.getElementById("graficoContainer");
    container.style.display = "block";
    
    const ctx = document.getElementById("graficoProgreso").getContext("2d");
    
    const fechas = data.datos.map(e => e.fecha);
    const pesos = data.datos.map(e => parseFloat(e.peso));
    const cinturas = data.datos.map(e => parseFloat(e.cintura));
    const pechos = data.datos.map(e => parseFloat(e.pecho));
    const brazos = data.datos.map(e => parseFloat(e.brazos));
    const muslos = data.datos.map(e => parseFloat(e.muslos));
    
    if (chart) chart.destroy();
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [
                {
                    label: 'Peso (kg)',
                    data: pesos,
                    borderColor: '#e63946',
                    backgroundColor: 'rgba(230, 57, 70, 0.1)',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'Cintura (cm)',
                    data: cinturas,
                    borderColor: '#457b9d',
                    backgroundColor: 'rgba(69, 123, 157, 0.1)',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'Pecho (cm)',
                    data: pechos,
                    borderColor: '#1d3557',
                    backgroundColor: 'rgba(29, 53, 87, 0.1)',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'Brazos (cm)',
                    data: brazos,
                    borderColor: '#f1faee',
                    backgroundColor: 'rgba(241, 250, 238, 0.1)',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'Muslos (cm)',
                    data: muslos,
                    borderColor: '#a8dadc',
                    backgroundColor: 'rgba(168, 218, 220, 0.1)',
                    tension: 0.1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Progreso del Cliente'
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// MOSTRAR RESUMEN
function mostrarResumenProgreso(data) {
    const container = document.getElementById("resumenProgreso");
    container.style.display = "block";
    
    const statsDiv = document.getElementById("statsProgreso");
    
    const cambios = data.cambios;
    const formatoCambio = (valor) => {
        const signo = valor > 0 ? "+" : "";
        return `${signo}${valor.toFixed(2)}`;
    };
    
    statsDiv.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Total Evaluaciones</div>
            <div class="stat-value">${data.evaluaciones}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Cambio Peso</div>
            <div class="stat-value ${cambios.peso > 0 ? 'negativo' : 'positivo'}">${formatoCambio(cambios.peso)} kg</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Cambio Cintura</div>
            <div class="stat-value ${cambios.cintura > 0 ? 'negativo' : 'positivo'}">${formatoCambio(cambios.cintura)} cm</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Cambio Pecho</div>
            <div class="stat-value ${cambios.pecho > 0 ? 'positivo' : 'negativo'}">${formatoCambio(cambios.pecho)} cm</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Cambio Brazos</div>
            <div class="stat-value ${cambios.brazos > 0 ? 'positivo' : 'negativo'}">${formatoCambio(cambios.brazos)} cm</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Cambio Muslos</div>
            <div class="stat-value ${cambios.muslos > 0 ? 'positivo' : 'negativo'}">${formatoCambio(cambios.muslos)} cm</div>
        </div>
    `;
}

// EDITAR EVALUACIÓN
async function editarEvaluacion(id) {
    const eval = evaluacionesCache.find(e => e.id === id);
    if (!eval) return;
    
    document.getElementById("clienteSelect").value = eval.cliente_id;
    document.getElementById("fechaInput").value = eval.fecha;
    document.getElementById("pesoInput").value = eval.peso;
    document.getElementById("cinturaInput").value = eval.cintura;
    document.getElementById("pechoInput").value = eval.pecho;
    document.getElementById("brazosInput").value = eval.brazos;
    document.getElementById("muslosInput").value = eval.muslos;
    
    // Cambiar botón a actualizar
    const btn = document.querySelector(".form-actions .btn-primary");
    btn.textContent = "Actualizar Evaluación";
    btn.onclick = () => actualizarEvaluacion(id);
}

// ACTUALIZAR EVALUACIÓN
async function actualizarEvaluacion(id) {
    const clienteId = document.getElementById("clienteSelect").value;
    const fecha = document.getElementById("fechaInput").value;
    const peso = document.getElementById("pesoInput").value;
    const cintura = document.getElementById("cinturaInput").value;
    const pecho = document.getElementById("pechoInput").value;
    const brazos = document.getElementById("brazosInput").value;
    const muslos = document.getElementById("muslosInput").value;
    
    try {
        const response = await fetch(`${API_URL}/evaluaciones/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cliente_id: parseInt(clienteId),
                fecha,
                peso: parseFloat(peso),
                cintura: parseFloat(cintura),
                pecho: parseFloat(pecho),
                brazos: parseFloat(brazos),
                muslos: parseFloat(muslos)
            })
        });
        
        if (response.ok) {
            alert("Evaluación actualizada correctamente");
            limpiarFormulario();
            document.querySelector(".form-actions .btn-primary").textContent = "Guardar Evaluación";
            document.querySelector(".form-actions .btn-primary").onclick = () => crearEvaluacion();
            cargarEvaluaciones();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al actualizar");
    }
}

// ELIMINAR EVALUACIÓN
async function eliminarEvaluacion(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta evaluación?")) return;
    
    try {
        const response = await fetch(`${API_URL}/evaluaciones/${id}`, {
            method: "DELETE"
        });
        
        if (response.ok) {
            alert("Evaluación eliminada");
            cargarEvaluaciones();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar");
    }
}

// INICIALIZAR
document.addEventListener("DOMContentLoaded", () => {
    cargarClientes();
    cargarEvaluaciones();
    
    // Establecer fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("fechaInput").value = today;
});
