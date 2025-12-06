import pdfplumber
import json
from pathlib import Path
from datetime import datetime
import re

BASE_DIR = Path(__file__).resolve().parents[1]
PDF_FILE = BASE_DIR / "pdf" / "horario.pdf"
OUTPUT_JSON = BASE_DIR / "data" / "salas.json"

# Patrón que detecta líneas tipo: "1 08:15 A009- Stgo."
BLOCK_HEADER = re.compile(r"^(\d+)\s+(\d{2}:\d{2})\s+(.+)$")

def parse_pdf():
    if not PDF_FILE.exists():
        raise FileNotFoundError(f"No existe el archivo PDF: {PDF_FILE}")

    asignaturas = []
    current = None

    with pdfplumber.open(PDF_FILE) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            for line in text.split("\n"):
                line = line.strip()

                # 1. Detectar cabecera de bloque
                m = BLOCK_HEADER.match(line)
                if m:
                    # Si veníamos leyendo una asignatura, la guardamos
                    if current:
                        asignaturas.append(current)

                    bloque = m.group(1)
                    hora = m.group(2)
                    sala = m.group(3)

                    current = {
                        "bloque": bloque,
                        "hora": hora,
                        "sala": sala,
                        "asignatura": "",
                        "departamento": "",
                        "dia": "",
                        "tipo": ""
                    }
                    continue

                # 2. Si la línea contiene el día + tipo (Cát/Lab/Ayu)
                if any(dia in line for dia in ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]):
                    if "Cát" in line: tipo = "Cátedra"
                    elif "Lab" in line: tipo = "Laboratorio"
                    elif "Ayu" in line: tipo = "Ayudantía"
                    else: tipo = "Otro"

                    if current:
                        partes = line.split()
                        current["dia"] = partes[0]     # primer token = día
                        current["tipo"] = tipo
                    continue

                # 3. Asignatura y departamento (normalmente dos líneas)
                if current:
                    if current["asignatura"] == "":
                        current["asignatura"] = line
                    elif current["departamento"] == "":
                        current["departamento"] = line

    # Guardar último curso leído
    if current:
        asignaturas.append(current)

    OUTPUT_JSON.parent.mkdir(exist_ok=True)
    OUTPUT_JSON.write_text(
        json.dumps(
            {
                "updated": datetime.now().isoformat(timespec="seconds"),
                "asignaturas": asignaturas
            },
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )

    print(f"[OK] Archivo generado: {OUTPUT_JSON}")


if __name__ == "__main__":
    parse_pdf()
