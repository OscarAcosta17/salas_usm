import pdfplumber
import json
import re
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parents[1]
PDF_FILE = BASE_DIR / "pdf" / "horario.pdf"
OUTPUT_JSON = BASE_DIR / "data" / "salas.json"


def parse_pdf():
    if not PDF_FILE.exists():
        raise FileNotFoundError(f"No existe el archivo PDF: {PDF_FILE}")

    resultados = []

    # ⚠️ Mantener contexto entre páginas
    sigla_actual = None
    nombre_curso_actual = None

    with pdfplumber.open(PDF_FILE) as pdf:
        for page in pdf.pages:
            tablas = page.extract_tables()
            if not tablas:
                continue

            tabla = tablas[0]

            for fila in tabla:
                if not fila:
                    continue

                # 1) Fila cabecera global de la tabla
                if fila[0] and "Sigla" in fila[0]:
                    continue

                # 2) Fila de "curso": incluye sigla, nombre, depto, profe, etc.
                if fila[0] and not fila[0].startswith("Día Bloque"):
                    header = fila[0]
                    lineas = header.splitlines()
                    tokens = [t for linea in lineas for t in linea.split()]

                    # Buscar sigla tipo ABC123 o ABC123-A
                    sigla = None
                    for t in tokens:
                        if re.match(r"^[A-Z]{3}\d{3}(-[A-Z])?$", t):
                            sigla = t
                            break

                    sigla_actual = sigla or sigla_actual  # si no encuentra, mantiene la anterior

                    # Nombre del curso (muy aproximado)
                    if sigla and sigla in tokens:
                        idx = tokens.index(sigla)
                        nombre_curso_actual = " ".join(tokens[:idx])
                    elif lineas:
                        nombre_curso_actual = lineas[0]
                    # si tampoco hay, mantiene nombre_curso_actual anterior

                    continue

                # 3) Filas de horario (día / bloque / hora / sala / sede / tipo)
                if len(fila) > 7 and fila[6] in ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]:
                    dia = fila[6]

                    bloques = fila[7].split("\n") if fila[7] else [""]
                    horas = fila[8].split("\n") if len(fila) > 8 and fila[8] else [""]
                    tipo = fila[9] if len(fila) > 9 else ""
                    salas = fila[10].split("\n") if len(fila) > 10 and fila[10] else [""]
                    sedes = fila[11].split("\n") if len(fila) > 11 and fila[11] else [""]

                    max_len = max(len(bloques), len(horas), len(salas), len(sedes))

                    def pad(lst):
                        return lst + [""] * (max_len - len(lst))

                    bloques = pad(bloques)
                    horas = pad(horas)
                    salas = pad(salas)
                    sedes = pad(sedes)

                    for b, h, s, se in zip(bloques, horas, salas, sedes):
                        if not b.strip():
                            continue

                        resultados.append({
                            "sigla": sigla_actual,             # ← usa la última sigla válida
                            "curso": nombre_curso_actual or "",# ← usa último nombre válido
                            "dia": dia,
                            "bloque": b.strip(),
                            "hora": h.strip(),
                            "sala": s.replace("-", "- ").strip(),
                            "sede": se.strip(),
                            "tipo": (
                                "Cátedra" if "Cát" in (tipo or "")
                                else "Laboratorio" if "Lab" in (tipo or "")
                                else (tipo or "")
                            )
                        })

    OUTPUT_JSON.parent.mkdir(exist_ok=True)
    OUTPUT_JSON.write_text(
        json.dumps(
            {
                "updated": datetime.now().isoformat(timespec="seconds"),
                "horarios": resultados
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"[OK] Archivo generado: {OUTPUT_JSON}")


if __name__ == "__main__":
    parse_pdf()
