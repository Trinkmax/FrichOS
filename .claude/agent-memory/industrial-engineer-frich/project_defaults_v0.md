---
name: project-defaults-v0
description: Defaults numéricos baseline propuestos al 2026-05-25 para Frich OS — tiempos por estación, ventanas de calidad, umbrales DBR, Andon, KPIs y RULES. Todo confidence_level=baseline_no_data hasta calibración con campo.
metadata:
  type: project
---

Defaults baseline v0 entregados al 2026-05-25, todos marcados como `baseline_no_data` hasta calibración con time-motion real.

**Why:** El usuario los va a hard-codear como objetivos en DB y algoritmos del MVP Fase 1. Son hipótesis falsables, no verdad operativa. Cada uno tiene campo `confidence_level` para distinguir baseline de calibrado.

**How to apply:** Cuando el usuario pregunte por tiempos objetivo, ventanas, thresholds o RULES, partir de estos defaults pero recordarle que son baseline. Si trae datos reales (time-motion, tickets cronometrados), recalibrar y proponer update a calibrated_low/high.

## Tiempos objetivo críticos (segundos | σ)

- **Doble Cheese Burger** baseline: armado 90|15, plancha 120|12, freidora 140|10, despacho 35|8
- **Fried Onion** (alto σ): armado 175|32, plancha 180|25 — candidato a desactivación en turbo
- **Crunch** (sin pan, alto σ armado): armado 210|38 — no se puede holdear caliente
- **Patty Melt** (pan molde): plancha 165|20, armado 155|25
- **Chicken Deluxe / Spicy**: dominados por freidora 220|22, sin plancha (Deluxe)
- **Nuggets 10u**: freidora 180|15
- **Veggie**: plancha −15s vs equivalente clásico, σ +25% por medallón no-smash

## Ventanas de calidad (post-finalización del componente)

- Medallón cocido: **600s (10 min)** o T < 63°C → descarte forzado HACCP
- Cebolla caramelizada: 2700s (45 min)
- Papas blanqueadas: 3600s (60 min)
- Pan tostado: 120s (2 min)
- Armado completo: 60s antes de perder calidad para despacho

## Convergencia planificación inversa

Target: tareas upstream terminan dentro de [dispatch_start − 30s, dispatch_start + 0s]. Recalcular schedule si tarea reporta atraso > 1σ. No reaccionar a < 1σ.

## DBR — buffer pre-restricción

- Plancha restrictiva: buffer 180-240s
- Freidora restrictiva: 120-180s
- Armado restrictivo: 90-150s
- Despacho restrictivo: 60-90s

## Modo Turbo

Activación: 2+ de {util restricción > 0.85 × 90s; cola ≥ 8; ETA-ocioso > 600s; rojo > 25%}. Desactiva Fried Onion, Crunch, Western, Bell Pepper. Buffer +30%. Mensajes WhatsApp comprimidos. VIP routing por LTV percentil 80.

Desactivación: ninguno de los 4 criterios por ≥ 5 min consecutivos.

## Skills matrix niveles

- N1 130% del target objetivo, requiere acompañante N3+
- N2 115%, 10 turnos sostenidos
- N3 100%, 20 turnos
- N4 90% + Cpk ≥ 1.33, 40 turnos

## KPIs Top-10 con bandas verde/amarillo/rojo

Cpk por estación (plancha/freidora ≥1.33, armado ≥1.20, despacho ≥1.50), tiempo puerta-a-puerta μ ≤ 35min, σ relativa entre locales ≤ 15%, % pedidos en rojo ≤ 5%, NPS ≥ 60, food cost desvío ≤ 1.5pp, COPQ ≤ 1% revenue.

## Staffing 60 ped/h

7-8 personas: 2 plancha (N4+N3), 2 armado (N3+N2), 1 freidora (N3), 1-2 despacho (N3), 1 floater (N4).

stress_index = (demanda × σ proyectada) / capacidad efectiva. > 1.10 = corto.

## RULES invariantes hardcoded

18 reglas no negociables. Ver detalle en respuesta al usuario del 2026-05-25. Críticas: RULE-01 (ventana calidad), RULE-02 (no despachar sin driver ≤90s), RULE-05 (HACCP zona peligro descarte automático), RULE-09 (despacho requiere predecesores DONE), RULE-13 (σ requiere ≥30 obs antes de mostrar).

## Pendientes de calibración (lo que más mueve la aguja)

1. 30 pedidos cronometrados por estación (recalibra sección 1 completa)
2. Spec física: grosor medallón, T plancha, capacidad freidora
3. Layout de un local
4. 2 semanas de timestamps por canal
5. Composición real de turnos por local

Relacionado: [[project_planificacion_inversa_calibracion]], [[project_kds_event_schema]]
