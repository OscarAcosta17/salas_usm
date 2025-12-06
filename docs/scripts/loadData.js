async function cargar() {
    const res = await fetch("/salas_usm/data/salas.json")
;
    const json = await res.json();

    console.log(json);

    const horarios = json.horarios || [];

    document.getElementById("updated").innerText =
        "Última actualización: " + json.updated;

    const tbody = document.querySelector("#tabla-horarios tbody");

    function renderTabla() {
        const diaFiltro = document.getElementById("filtro-dia").value;
        const salaFiltro = document.getElementById("filtro-sala").value.toLowerCase();

        tbody.innerHTML = "";

        horarios
            .filter(h => (
                (diaFiltro === "" || h.dia === diaFiltro) &&
                (salaFiltro === "" || h.sala.toLowerCase().includes(salaFiltro))
            ))
            .forEach(h => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${h.sigla}</td>
                    <td>${h.curso}</td>
                    <td>${h.dia}</td>
                    <td>${h.bloque}</td>
                    <td>${h.hora}</td>
                    <td>${h.sala}</td>
                    <td>${h.sede}</td>
                    <td>${h.tipo}</td>
                `;
                tbody.appendChild(tr);
            });
    }

    renderTabla();

    document.getElementById("filtro-dia").onchange = renderTabla;
    document.getElementById("filtro-sala").oninput = renderTabla;

    // ====================================
    // SALAS LIBRES
    // ====================================

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
            .filter(h => h.dia === dia && h.bloque === bloque)
            .map(h => h.sala);

        const todasSalas = [...new Set(horarios.map(h => h.sala))];

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
