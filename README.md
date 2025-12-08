# 🎓 Salas USM: Plataforma de Gestión Académica Integral

![Estado del Proyecto](https://img.shields.io/badge/Estado-Finalizado-success)
![Versión](https://img.shields.io/badge/Versión-1.0.1-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

## 📄 Descripción del Proyecto

**Salas USM** nace como una respuesta tecnológica a la fragmentación de información que enfrentan los estudiantes universitarios. Tradicionalmente, la planificación académica, el cálculo de promedios ponderados y la búsqueda de espacios de estudio requieren el uso de múltiples plataformas o cálculos manuales propensos a errores.

Este proyecto centraliza estas necesidades en una **Suite Web Unificada**, diseñada bajo principios de **UX (Experiencia de Usuario) moderna** y **Mobile First**, garantizando acceso rápido y eficiente a la información crítica, sin depender de la conectividad inestable o la lentitud de los portales institucionales tradicionales.

---

## 🧩 Problemas Reales vs. Soluciones Implementadas

### 1. El Desafío de la Planificación Semestral
**El Problema:** Armar un horario compatible requiere cruzar manualmente cientos de asignaturas, siglas y paralelos, resultando a menudo en topes de horario no detectados a tiempo.
<br>**La Solución:** **Generador de Horarios Interactivo.**
* **Búsqueda Indexada:** Localización instantánea de asignaturas mediante un motor de búsqueda optimizado por JSON.
* **Visualización Gráfica:** Renderizado dinámico de bloques horarios.
* **Exportación Digital:** Integración con `html2canvas` para generar y descargar el horario final en formato de imagen de alta resolución, listo para compartir o usar como fondo de pantalla.

### 2. Complejidad en la Evaluación Académica
**El Problema:** Las asignaturas poseen reglas de aprobación complejas (ponderaciones variables y "llaves" o requisitos). Una calculadora simple no detecta si un estudiante reprueba por fallar un requisito específico (ej. laboratorio), aunque su promedio matemático sea suficiente.
<br>**La Solución:** **Calculadora de Promedios Lógica.**
* **Lógica de "Llave/Requisito":** Implementación de un algoritmo condicional que evalúa si se cumplen los requisitos mínimos de una sección. Si no se cumplen, el sistema reprueba automáticamente el ramo, reflejando fielmente el reglamento académico.
* **Flexibilidad Ponderada:** Soporte para modos de cálculo individual (peso por nota) o global (peso por sección).
* **Proyección:** Herramienta de "Bonus" para simular escenarios de aprobación.

### 3. Subutilización de Espacios de Estudio
**El Problema:** Encontrar una sala vacía para estudiar implica recorrer físicamente el campus, perdiendo tiempo valioso.
<br>**La Solución:** **Buscador de Disponibilidad en Tiempo Real.**
* **Filtrado Inteligente:** Algoritmo de cruce de datos que compara la totalidad de las asignaturas dictadas contra el inventario de salas, devolviendo únicamente aquellas libres en el bloque y día consultado.
* **Normalización de Datos:** Limpieza automática de nombres de salas para evitar duplicados y errores de formato.

---

## 🛠️ Arquitectura Técnica

El proyecto fue desarrollado priorizando el **rendimiento** y la **mantenibilidad**, evitando la sobrecarga de frameworks innecesarios para este caso de uso.

* **Frontend:** HTML5 Semántico, CSS3 (Flexbox/Grid), JavaScript (ES6+ Vanilla).
* **Estilos:** Arquitectura modular CSS. Cada módulo funcional posee su propia hoja de estilos independiente para facilitar el mantenimiento y la escalabilidad.
* **Datos:** Base de datos ligera basada en JSON estático (`data/salas.json`), permitiendo cargas ultra-rápidas sin latencia de base de datos SQL.
* **Diseño Responsivo:**
    * Adaptación fluida a dispositivos móviles (Stacking de columnas).
    * Tablas con *scroll horizontal overflow* para visualización de grandes conjuntos de datos en pantallas pequeñas.
    * Inputs optimizados para evitar *auto-zoom* intrusivo en iOS.

---