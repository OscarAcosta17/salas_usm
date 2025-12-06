async function cargar() {
    const res = await fetch("../data/salas.json");
    const json = await res.json();

    document.getElementById("updated").innerText =
        "Última actualización: " + json.updated;

    const tbody = document.querySelector("#tabla tbody");

    json.asignaturas.forEach(a => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${a.sigla}</td>
            <td>${a.asignatura}</td>
            <td>${a.departamento}</td>
            <td>${a.paralelo}</td>
        `;

        tbody.appendChild(tr);
    });
}

cargar();
