---
name: project-planificacion-inversa-calibracion
description: Estrategia de calibración inicial de tiempos objetivo por SKU/estación sin datos históricos propios.
metadata:
  type: project
---

Recomendación para arrancar planificación inversa sin histórico:

1. **Time-motion de 1 día por estación antes del go-live.** Cronómetro en mano, 30-50 observaciones por SKU principal. Da media y σ aproximada inicial. Costo: 2 días de un encargado.
2. **Período de calibración silenciosa (7-10 días primeros del KDS).** KDS captura timestamps pero los semáforos por color están apagados. Recién con N=200 pedidos por SKU calculados percentil 80 como objetivo y σ real, se encienden semáforos.
3. **Recalibración automática cada ~500 pedidos por SKU** usando percentil móvil.

**Why:** copiar tiempos objetivo de internet o de Five Guys/McDonald's no aplica — Frich tiene su propio mix, equipo y layout. Encender semáforos antes de calibrar genera ruido (mucho rojo o mucho verde falso) y desensibiliza al equipo de cocina. Riesgo conocido de over-fitting con N pequeño si se intenta sofisticación temprana.

**How to apply:** cuando se diseñe la lógica de semáforos en KDS, prever flag `calibration_mode` por SKU que oculta colores hasta que se haya recolectado N suficiente. La planificación inversa propiamente dicha (pull desde despacho) se difiere hasta tener objetivos confiables por estación — antes es ciencia ficción.

Lo que no recomendar: curve-fitting heroico con datos escasos, modelos bayesianos con priors fuertes, copiar benchmarks de cadenas globales.
