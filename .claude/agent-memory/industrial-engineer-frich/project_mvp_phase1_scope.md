---
name: project-mvp-phase1-scope
description: Decisión de scope para Frich OS Fase 1 (primeras 4 semanas de dev). Qué módulos van, cuáles se difieren, y por qué.
metadata:
  type: project
---

Fase 1 MVP debe mover la aguja operativa en piso en 2-3 semanas de uso. No es maqueta.

**Módulos innegociables Fase 1 (orden de retorno operativo):**
1. KDS por estación con timestamps crudos (4.2 sin planificación inversa).
2. Orquestador con admisión manual normalizada (4.1 reducido).
3. WhatsApp 2 mensajes de 4: confirmación con ETA + "salió" (4.8 reducido).
4. Andon digital básico — botón parar línea + categoría, sin Pareto aún (4.3 capa 1).
5. Identificación de restricción visual simple — mayor cola pendiente por estación (4.4 versión light).

**Diferidos a Fase 2 explícitamente:**
- Pre-cocción calibrada (4.5) — requiere datos históricos que no existen.
- Inventario + HACCP (4.6) — alta complejidad, no muta loop de datos operativos.
- Despacho sincronizado con repartidor (4.7) — depende de API Rappi/PY.
- Planificación inversa real (parte 4.2) — depende de tiempos calibrados.

**Why:** meter HACCP o inventario en Fase 1 por miedo retrasa el loop de datos operativos 4-6 semanas. La cocina no nota diferencia en semana 1 con esos módulos.

**How to apply:** cuando el usuario discuta priorización de módulos para sprints iniciales, mantener esta jerarquía. Si propone meter inventario/HACCP antes del loop de datos operativos, pushback con esta lógica. Si propone más módulos en Fase 1, recordar que el costo es retraso del cierre del loop de medición.

Pendiente validar con dato: split de canales por local (hipótesis: 60-75% Rappi+PY, 15-25% salón, 5-15% WhatsApp directo). Si la hipótesis se confirma, Rappi/PY debe entrar a Fase 1 vía carga manual (ver [[project-canales-fase1-carga-manual]]).
