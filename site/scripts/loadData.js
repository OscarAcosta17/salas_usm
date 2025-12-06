async function cargarSalas() {
  const res = await fetch("../data/salas.json");
  const data = await res.json();

  document.getElementById("ultima-actualizacion").textContent =
    "Última actualización: " + data.updated;

  const tbody = document.querySelector("#tabla-salas tbody");
  const selectCampus = document.getElementById("filtro-campus");

  const salas = data.salas;

  // Rellenar combo de campus únicos
  const campusSet = new Set(salas.map(s => s.campus));
  campusSet.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    selectCampus.appendChild(opt);
  });

  function renderTabla(filtroCampus = "") {
    tbody.innerHTML = "";
    salas
      .filter(s => !filtroCampus || s.campus === filtroCampus)
      .forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${s.sala}</td>
          <td>${s.campus}</td>
          <td>${s.dia}</td>
          <td>${s.bloque}</td>
        `;
        tbody.appendChild(tr);
      });
  }

  selectCampus.addEventListener("change", () => {
    renderTabla(selectCampus.value);
  });

  renderTabla();
}

cargarSalas();
