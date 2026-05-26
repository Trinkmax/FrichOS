---
name: project-kds-event-schema
description: Eventos crudos mínimos que el KDS debe capturar desde día 1. Lo que no se captura ahora no se reconstruye después.
metadata:
  type: project
---

Decisión: KDS guarda eventos crudos con timestamp UTC + local_id + pedido_id + estacion_id. Las métricas derivadas (promedio, σ, Cpk, throughput, utilización) se reconstruyen con SQL después. No persistir agregados.

**Eventos crudos mínimos día 1:**
- pedido_creado_at (canal de origen, local, ítems, modificaciones como JSON estructurado)
- pedido_recibido_kds_at por estación
- estacion_inicio_at (operario marca "arrancando")
- estacion_fin_at (operario marca "listo")
- pedido_despachado_at
- entregado_at (manual si no hay API)
- operario_id en cada inicio/fin de estación
- andon_event (timestamp + categoría + estación)

**Why:** si se guardan solo promedios por turno, la distribución se pierde para siempre — sin distribución no hay σ, Cpk, ni detección de variabilidad. La consistencia es la métrica que escala (principio fundacional 1). Además, sin operario_id por estación-pedido no hay skills matrix ni causa raíz personal. Sin modificaciones estructuradas, el score de complejidad es ficción.

**How to apply:** cuando el usuario diseñe schema de tablas en Supabase, asegurar que cada evento de estación queda como fila propia con su timestamp, no como columnas agregadas en una fila por pedido. Si propone "guardar tiempo_total_pedido" en lugar de eventos, pushback inmediato.
