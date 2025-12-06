async function cargar() {
    const res = await fetch("../data/salas.json");
    const json = await res.json();

    document.getElementById("updated").innerText =
        "Última actualización: " + json.updated;

    const data = json.asignaturas;

    // ================================
    // LLENAR TABLA DE HORARIOS
    // ================================
    const tbody = document.querySelector("#tabla-horarios tbody");
    function renderTabla() {
        const diaFiltro = document.getElementById("filtro-dia").value;
        const salaFiltro = document.getElementById("filtro-sala").value.toLowerCase();

        tbody.innerHTML = "";

        data.filter(item => {
            return (
                (diaFiltro === "" || item.dia === diaFiltro) &&
                (salaFiltro === "" || item.sala.toLowerCase().includes(salaFiltro))
            );
        }).forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.bloque}</td>
                <td>${item.hora}</td>
                <td>${item.sala}</td>
                <td>${item.asignatura}</td>
                <td>${item.departamento}</td>
                <td>${item.dia}</td>
                <td>${item.tipo}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    renderTabla();

    document.getElementById("filtro-dia").onchange = renderTabla;
    document.getElementById("filtro-sala").oninput = renderTabla;

    // ================================
    // CALCULAR SALAS LIBRES
    // ================================
    const lista = document.getElementById("lista-salas-libres");

    function calcularSalasLibres() {
        lista.innerHTML = "";

        const dia = document.getElementById("filtro-dia-libre").value;
        const bloque = document.getElementById("filtro-bloque-libre").value;

        if (!dia || !bloque) {
            lista.innerHTML = "<li>Seleccione día y bloque.</li>";
            return;
        }

        const salasOcupadas = data
            .filter(x => x.dia === dia && x.bloque === bloque)
            .map(x => x.sala);

        const todasSalas = [...new Set(data.map(x => x.sala))];

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
