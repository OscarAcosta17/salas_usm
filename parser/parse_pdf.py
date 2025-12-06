import pdfplumber
import json
import os
import re

# Mapeo para expandir las abreviaciones del PDF
TIPO_ASIGNATURA = {
    "Cát": "Cátedra",
    "Ayud": "Ayudantía",
    "Lab": "Laboratorio",
    "Tal": "Taller",
    "Prá": "Práctica",
    "Ter": "Terreno"
}

def limpiar_texto(texto):
    """Elimina espacios extra y saltos de línea."""
    if texto:
        return " ".join(texto.split())
    return ""

def formatear_hora(texto_hora):
    """Convierte '11:05\n12:15' a '11:05-12:15'."""
    if not texto_hora:
        return ""
    texto_limpio = texto_hora.replace('\n', '-').replace(' ', '')
    if '-' not in texto_limpio and len(texto_limpio) > 5:
        mid = len(texto_limpio) // 2
        return f"{texto_limpio[:mid]}-{texto_limpio[mid:]}"
    return texto_limpio

def extraer_horarios(pdf_path, json_output_path):
    print(f"Leyendo archivo: {pdf_path}")
    
    if not os.path.exists(pdf_path):
        print(f"ERROR: No existe el archivo {pdf_path}")
        return

    datos_finales = []

    # Variables para mantener el estado de la asignatura actual (relleno hacia abajo)
    current_info = {
        "SIGLA": "",
        "NOMBRE": "",
        "DEPTO": "",
        "PARALELO": "",
        "PROFESOR": ""
    }

    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            print(f"Procesando página {i + 1}...")
            
            table = page.extract_table()
            if not table:
                continue

            for row in table:
                # Limpieza básica de la primera celda para detectar si es cabecera o dato
                col_0 = limpiar_texto(row[0])

                # 1. Detectar cabeceras principales y saltarlas
                if "Sigla" in col_0 or "Asignatura" in col_0:
                    continue
                
                # 2. Actualizar datos de la asignatura si la fila tiene Sigla
                if col_0:
                    current_info["SIGLA"] = col_0
                    current_info["NOMBRE"] = limpiar_texto(row[1])
                    current_info["DEPTO"] = limpiar_texto(row[2])
                    current_info["PARALELO"] = limpiar_texto(row[3])
                    current_info["PROFESOR"] = limpiar_texto(row[4])
                
                # 3. Extraer datos del horario
                try:
                    dia_raw = limpiar_texto(row[6])
                    
                    # --- CORRECCIÓN AQUÍ ---
                    # Filtro robusto para eliminar filas de encabezados o basura
                    if (not dia_raw or 
                        "Día" in dia_raw or 
                        "Dia" in dia_raw or 
                        "Bloque" in dia_raw):
                        continue

                    hora_raw = row[8]
                    tipo_raw = limpiar_texto(row[9])
                    sala_raw = limpiar_texto(row[10])

                    # Si no hay hora, generalmente es una fila inválida que se coló
                    if not hora_raw:
                        continue

                    # Formateos
                    hora_fmt = formatear_hora(hora_raw)
                    tipo_fmt = TIPO_ASIGNATURA.get(tipo_raw.split('.')[0], tipo_raw)

                    clase = {
                        "SIGLA": current_info["SIGLA"],
                        "NOMBRE": current_info["NOMBRE"],
                        "DEPTO": current_info["DEPTO"],
                        "PARALELO": current_info["PARALELO"],
                        "PROFESOR": current_info["PROFESOR"],
                        "DIA": dia_raw,
                        "HORA": hora_fmt,
                        "SALA": sala_raw,
                        "ASIG": tipo_fmt
                    }

                    # Guardamos solo si hay datos esenciales
                    datos_finales.append(clase)

                except IndexError:
                    continue

    # Guardar
    os.makedirs(os.path.dirname(json_output_path), exist_ok=True)
    
    with open(json_output_path, 'w', encoding='utf-8') as f:
        json.dump(datos_finales, f, indent=4, ensure_ascii=False)
    
    print(f"Finalizado. {len(datos_finales)} registros guardados en {json_output_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Rutas según tu estructura
    ruta_pdf = os.path.join(base_dir, '..', 'pdf', 'horario.pdf')
    ruta_json = os.path.join(base_dir, '..', 'docs', 'data', 'salas.json')

    extraer_horarios(ruta_pdf, ruta_json)