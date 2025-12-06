async function cargar() {
    const res = await fetch("/salas_usm/data/salas.json");
    const json = await res.json();

    console.log("JSON cargado:", json);

    // Tu JSON es un arreglo, no un objeto con "horarios"
    const horarios = Array.isArray(json) ? json : json.horarios;

    // Si tu JSON tenía updated, lo mostramos
    if (!Array.isArray(json) && json.updated) {
        document.getElementById("updated").innerText =
            "Última actualización: " + json.updated;
    } else {
        document.getElementById("updated").innerText = "";
    }

    const tbody = document.querySelector("#tabla-horarios tbody");

    function renderTabla() {
        const diaFiltro = document.getElementById("filtro-dia").value;
        const salaFiltro = document
            .getElementById("filtro-sala")
            .value.toLowerCase();

        tbody.innerHTML = "";

        horarios
            .filter(h =>
                (diaFiltro === "" || h.DIA === diaFiltro) &&
                (salaFiltro === "" || h.SALA.toLowerCase().includes(salaFiltro))
            )
            .forEach(h => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${h.SIGLA}</td>
                    <td>${h.NOMBRE}</td>
                    <td>${h.DIA}</td>
                    <td>${h.HORA}</td>
                    <td>${h.SALA}</td>
                    <td>${h.ASIG}</td>
                `;
                tbody.appendChild(tr);
            });
    }

    renderTabla();

    document.getElementById("filtro-dia").onchange = renderTabla;
    document.getElementById("filtro-sala").oninput = renderTabla;

    // ===========================
    // SALAS LIBRES
    // ===========================

    const lista = document.getElementById("lista-salas-libres");

    function calcularSalasLibres() {
        lista.innerHTML = "";

        const dia = document.getElementById("filtro-dia-libre").value;
        const bloque = document.getElementById("filtro-bloque-libre").value;

        if (!dia || !bloque) {
            lista.innerHTML = "<li>Seleccione día y bloque.</li>";
            return;
        }

        const salasOcupadas = horarios
            .filter(h => h.DIA === dia /* y si tuvieras bloque también aquí */)
            .map(h => h.SALA);

        const todasSalas = [...new Set(horarios.map(h => h.SALA))];

        const libres = todasSalas.filter(s => !salasOcupadas.includes(s));

        if (libres.length === 0) {
            lista.innerHTML = "<li>No hay salas libres.</li>";
            return;
        }

        libres.forEach(s => {
            const li = document.createElement("li");
            li.textContent = s;
            lista.appendChild(li);
        });
    }

    document.getElementById("filtro-dia-libre").onchange = calcularSalasLibres;
    document.getElementById("filtro-bloque-libre").oninput = calcularSalasLibres;
}

cargar();
