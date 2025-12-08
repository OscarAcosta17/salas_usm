async function cargar() {
    const res = await fetch("/salas_usm/data/salas.json");
    const json = await res.json();

    console.log("JSON cargado:", json);
    const horarios = Array.isArray(json) ? json : json.horarios;

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
                    <td>${h.DEPTO}</td>
                    <td>${h.PARALELO}</td>
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
    document.getElementById("filtro-profe").oninput = renderTabla;
    document.getElementById("filtro-depto").oninput = renderTabla;

    const lista = document.getElementById("lista-salas-libres");

    function renderTabla() {
        const diaFiltro = document.getElementById("filtro-dia").value;
        const salaFiltro = document.getElementById("filtro-sala").value.toLowerCase();
        const profeFiltro = document.getElementById("filtro-profe").value.toLowerCase();
        const deptoFiltro = document.getElementById("filtro-depto").value.toLowerCase();

        tbody.innerHTML = "";

        horarios
            .filter(h =>
                (diaFiltro === "" || h.DIA === diaFiltro) &&
                (salaFiltro === "" || h.SALA.toLowerCase().includes(salaFiltro)) &&
                (profeFiltro === "" || h.PROFESOR.toLowerCase().includes(profeFiltro)) &&
                (deptoFiltro === "" || h.DEPTO.toLowerCase().includes(deptoFiltro))
            )
            .forEach(h => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${h.SIGLA}</td>
                    <td>${h.NOMBRE}</td>
                    <td>${h.DEPTO}</td>
                    <td>${h.PARALELO}</td>
                    <td>${h.PROFESOR}</td>
                    <td>${h.DIA}</td>
                    <td>${h.HORA}</td>
                    <td>${h.SALA}</td>
                    <td>${h.ASIG}</td>
                `;
                tbody.appendChild(tr);
            });
    }

    document.getElementById("btn-limpiar").onclick = () => {
        document.getElementById("filtro-dia").value = "";
        document.getElementById("filtro-sala").value = "";
        document.getElementById("filtro-profe").value = "";
        document.getElementById("filtro-depto").value = "";
        renderTabla();
    };


    document.getElementById("filtro-dia-libre").onchange = calcularSalasLibres;
    document.getElementById("filtro-bloque-libre").oninput = calcularSalasLibres;
}

cargar();
