---
name: project-canales-fase1-carga-manual
description: Decisión sobre cómo manejar Rappi/PY en Fase 1 sin integración API. Carga manual desde tablet vs diferir.
metadata:
  type: project
---

Recomendación: carga manual desde tablet para Rappi/PedidosYa en Fase 1, en lugar de diferir esos canales hasta tener API.

**Why:** hipótesis de split de canales en hamburguesería argentina = 60-75% Rappi+PY, 15-25% salón, 5-15% WhatsApp. Si esa hipótesis se confirma para Frich, arrancar Fase 1 solo con WhatsApp + salón significa que el sistema ve menos del 25% del volumen real. El dato es no-representativo y las métricas (variabilidad, Cpk, restricción) mienten. Hipótesis pendiente de validar con dato real de Frich.

**Costo del workaround:** runner re-tipea cada pedido de Rappi/PY al sistema. 30-45 segundos por pedido. Costo real en mano de obra, pero menor que el costo de operar a ciegas 8-12 semanas hasta Fase 2.

**How to apply:** cuando el usuario evalúe si meter Rappi/PY a Fase 1, recordar que sin esos canales el loop de medición es sesgado. Validar primero el split de canales antes de comprometer scope. Si el usuario quiere saltar al API directo, advertir que la integración con Rappi/PY suele demorar más de lo estimado (negociación comercial + sandbox + producción). La carga manual es feo pero predecible.
