async function cargar() {
    try {
        const res = await fetch("data/salas.json"); 
        const json = await res.json();
        console.log("JSON cargado:", json);

        const horarios = Array.isArray(json) ? json : json.horarios;

        if (!Array.isArray(json) && json.updated) {
            const updatedEl = document.getElementById("updated");
            if(updatedEl) updatedEl.innerText = "Última actualización: " + json.updated;
        }

        const tbody = document.querySelector("#tabla-horarios tbody");

        function renderTabla() {
            const diaFiltro = document.getElementById("filtro-dia").value;
            const siglaFiltro = document.getElementById("filtro-sigla").value.toUpperCase().trim();
            const nombreFiltro = document.getElementById("filtro-nombre").value.toLowerCase().trim();
            const salaFiltro = document.getElementById("filtro-sala").value.toLowerCase().trim();
            const profeFiltro = document.getElementById("filtro-profe").value.toLowerCase().trim();
            const deptoFiltro = document.getElementById("filtro-depto").value.toLowerCase().trim();

            tbody.innerHTML = "";

            // Filtrar datos
            const resultados = horarios.filter(h => {
                const matchDia = diaFiltro === "" || h.DIA === diaFiltro;
                

                const matchSigla = siglaFiltro === "" || (h.SIGLA && h.SIGLA.includes(siglaFiltro));
                const matchNombre = nombreFiltro === "" || (h.NOMBRE && h.NOMBRE.toLowerCase().includes(nombreFiltro));
                const matchSala = salaFiltro === "" || (h.SALA && h.SALA.toLowerCase().includes(salaFiltro));
                const matchProfe = profeFiltro === "" || (h.PROFESOR && h.PROFESOR.toLowerCase().includes(profeFiltro));
                const matchDepto = deptoFiltro === "" || (h.DEPTO && h.DEPTO.toLowerCase().includes(deptoFiltro));

                return matchDia && matchSigla && matchNombre && matchSala && matchProfe && matchDepto;
            });
            resultados.forEach(h => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${h.SIGLA || ''}</td>
                    <td>${h.NOMBRE || ''}</td>
                    <td>${h.DEPTO || ''}</td>
                    <td>${h.PARALELO || ''}</td>
                    <td>${h.PROFESOR || ''}</td>
                    <td>${h.DIA || ''}</td>
                    <td>${h.HORA || ''}</td>
                    <td>${h.SALA || ''}</td>
                    <td>${h.ASIG || ''}</td> `;
                tbody.appendChild(tr);
            });

            if (resultados.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 20px; color:#888;">No se encontraron horarios</td></tr>`;
            }
        }
        renderTabla();

        document.getElementById("filtro-dia").addEventListener("change", renderTabla);
        
        const inputsTexto = ["filtro-sigla", "filtro-nombre", "filtro-sala", "filtro-profe", "filtro-depto"];
        inputsTexto.forEach(id => {
            document.getElementById(id).addEventListener("input", renderTabla);
        });

        document.getElementById("btn-limpiar").onclick = () => {
            document.getElementById("filtro-dia").value = "";
            inputsTexto.forEach(id => document.getElementById(id).value = "");
            renderTabla();
        };

    } catch (error) {
        console.error("Error cargando los datos:", error);
        alert("Hubo un error al cargar los horarios. Revisa la consola (F12).");
    }
}

cargar();