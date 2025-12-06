import os
import json
from datetime import datetime

import requests
from bs4 import BeautifulSoup

# -------------------------------------------------------------------
# CONFIGURACIÓN – AJUSTA ESTO
# -------------------------------------------------------------------
BASE_URL = "https://siga.usm.cl"
LOGIN_URL = f"{BASE_URL}/pag/home.jsp"        # puede que el formulario POST use otra URL
SALAS_URL = f"{BASE_URL}/pag/XXXX.jsp"       # ← aquí va la URL interna que muestra las salas

# Usa variables de entorno para no dejar tu clave en el código
SIGA_USER = os.environ.get("SIGA_USER")
SIGA_PASS = os.environ.get("SIGA_PASS")

if not SIGA_USER or not SIGA_PASS:
    raise SystemExit("Define SIGA_USER y SIGA_PASS como variables de entorno antes de ejecutar.")


def login(session: requests.Session) -> None:
    """Inicia sesión en SIGA usando el formulario de login."""
    # 1) GET inicial para obtener cookies y posibles campos ocultos
    resp = session.get(LOGIN_URL)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "lxml")

    # Dependiendo del formulario, puede haber campos hidden:
    payload = {
        # OJO: estos nombres ('usuario', 'password', etc.) debes sacarlos del HTML
        "usuario": SIGA_USER,
        "password": SIGA_PASS,
    }

    # Ejemplo: el form podría tener action="login" o similar
    # Revisa el atributo "action" con las herramientas del navegador
    post_url = LOGIN_URL  # cámbialo si el form apunta a otra ruta
    resp = session.post(post_url, data=payload)
    resp.raise_for_status()

    # Aquí podrías validar que el login resultó, por ejemplo buscando tu nombre en la respuesta
    if "Usuario o contraseña incorrectos" in resp.text:
        raise SystemExit("Error de login en SIGA. Revisa usuario/clave.")


def obtener_salas_libres(session: requests.Session):
    """Descarga la página de salas y devuelve una lista de dict con las salas libres."""
    resp = session.get(SALAS_URL)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "lxml")

    salas = []

    # ----------------------------------------------------------------
    # ESTA PARTE DEPENDE 100% DEL HTML DE LA PÁGINA DE SALAS
    # Ejemplo genérico: una tabla con id="tablaSalas"
    # ----------------------------------------------------------------
    tabla = soup.select_one("table#tablaSalas")
    if not tabla:
        raise RuntimeError("No encontré la tabla de salas. Revisa el selector CSS.")

    filas = tabla.select("tr")
    # suponiendo que la primera fila es encabezado
    for tr in filas[1:]:
        celdas = [td.get_text(strip=True) for td in tr.select("td")]
        if not celdas:
            continue

        # Ajusta esto al orden real de columnas
        # [Sala, Campus, Día, Bloque, Estado]
        sala, campus, dia, bloque, estado = celdas[:5]

        # condición para considerarla "libre"
        if estado.lower() in ("libre", "disponible"):
            salas.append(
                {
                    "sala": sala,
                    "campus": campus,
                    "dia": dia,
                    "bloque": bloque,
                    "estado": estado,
                }
            )

    return salas


def guardar_json(salas):
    os.makedirs("data", exist_ok=True)
    data = {
        "updated": datetime.now().isoformat(timespec="seconds"),
        "salas": salas,
    }
    with open("data/salas.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    with requests.Session() as session:
        login(session)
        salas = obtener_salas_libres(session)
    guardar_json(salas)
    print(f"Se guardaron {len(salas)} salas libres en data/salas.json")


if __name__ == "__main__":
    main()
