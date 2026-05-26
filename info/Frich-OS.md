<div align="center">

<img src="studiOS-logo.png" alt="studiOS" width="180"/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="frich-logo.png" alt="Frich" width="180"/>

</div>

---

# Frich OS — Producto completo

Sistema operativo de cocina · Propuesta de producto · Mayo 2026

---

## 1. Visión

Frich OS es la **capa operativa industrial** de la hamburguesería Frich. Se monta entre los canales de entrada (Rappi, PedidosYa, salón, WhatsApp) y la cocina, y transforma una operación artesanal en cuatro locales en un sistema de manufactura por demanda con calidad consistente, tiempos medidos, mejora continua estructurada y comparabilidad rigurosa entre plantas.

No reemplaza el POS, ni es un CRM de marketing, ni es una app del cliente. Es la **infraestructura que sincroniza personas, equipos, pedidos y clientes** en tiempo real, manteniendo la sensibilidad artesanal de la marca apoyada en la rigurosidad operativa que solo las cadenas globales tienen hoy.

---

## 2. Principios fundacionales

Seis principios que ordenan toda decisión de diseño:

1. **Lo que no se mide no se mejora, y el promedio miente.** Cada paso de la operación tiene un tiempo objetivo, un tiempo real, un desvío estándar y un Cpk visibles. La consistencia es la métrica que escala, no el promedio.
2. **El cliente espera con información, no con ansiedad.** Cada cambio de estado del pedido viaja por WhatsApp al cliente, automáticamente, con ETA dinámico calculado sobre la cocina real.
3. **La estandarización no es opcional con múltiples locales.** Mismos KPIs, mismas pantallas, mismos SOPs, misma vara — comparados con normalización por mix y franja.
4. **La restricción del sistema manda.** En cada instante hay una estación que es el cuello de botella. Toda decisión —admisión de pedidos, asignación de personal, secuencia de armado— se subordina a esa restricción y se actualiza cuando se mueve.
5. **El sistema propone, no solo refleja.** Cada semana genera hipótesis de mejora con experimento y métrica de éxito. Es un coach del próximo turno, no un espejo del pasado.
6. **El cliente no instala nada.** Toda la conversación pasa por WhatsApp, que ya tiene. Cero fricción de adopción.

---

## 3. Arquitectura del producto — tres anillos concéntricos

El producto se organiza en tres anillos:

- **Anillo 1 — Núcleo operativo:** lo que pasa minuto a minuto. La cocina, el cliente, el repartidor.
- **Anillo 2 — Inteligencia:** lo que el sistema ve, mide y aprende. Dashboards, layout, perfiles, finanzas.
- **Anillo 3 — Mejora continua:** cómo el sistema evoluciona la operación. SOPs, Kaizen, predicción, digital twin.

Cada anillo se apoya en el anterior. El núcleo genera datos, la inteligencia los interpreta, la mejora continua los convierte en cambios concretos en la operación.

---

## 4. Módulos en detalle

### Anillo 1 — Núcleo operativo

#### 4.1 Orquestador omnicanal de pedidos

Punto único de entrada para todos los canales:

- **Rappi y PedidosYa** vía integración directa API.
- **WhatsApp directo** con número propio y bot conversacional.
- **Salón** con tablet en la mesa del mozo.
- **Web propia** (canal expandible).

Cada pedido entra al sistema con: timestamp, asignación de local, desglose por estación, score de complejidad (ítems × modificaciones × estaciones), SLA dinámico calculado sobre la carga actual de la cocina, datos del cliente vinculados a su perfil, y origen del canal. Arranca el cronómetro maestro y todos los cronómetros derivados.

El SLA no es histórico: refleja la cocina real en este instante. Si la cocina está saturada, el ETA que se le promete al cliente es honesto desde el primer mensaje.

#### 4.2 KDS por estación con planificación inversa

Pantalla dedicada en cada estación, con cola ordenada por urgencia:

- **Armado** — mise en place, modificaciones, agregados.
- **Plancha** — medallones, tostado de panes en tostadora vertical.
- **Freidora** — papas y frituras.
- **Despacho** — empaque, control de calidad final, entrega a driver o cliente.

Cada estación solo ve lo que le corresponde, con sistema de semáforo (verde dentro de objetivo, amarillo al 80%, rojo excedido) y al marcar "listo" el pedido pasa automáticamente a la siguiente estación.

**Planificación inversa (pull desde despacho):** el sistema calcula hacia atrás desde el momento de salida deseado. Si un pedido debe salir a las 13:42, plancha arranca a las 13:38, freidora a las 13:39, armado final a las 13:41. Así medallón, papas y armado convergen en despacho con desfase menor a 30 segundos. Nada espera enfriándose.

#### 4.3 Sistema Andon expandido

El semáforo visible por pedido y por estación es solo la capa básica. El sistema también ofrece:

- **Cable Andon digital:** cualquier empleado puede frenar y categorizar un problema desde su tablet (ingrediente faltante, equipo fallado, accidente, pedido mal cargado, queja en mostrador).
- **Auto-escalación** a encargado y luego a dueño si el incidente no se resuelve dentro de la ventana definida por categoría.
- **Pareto de andon pulls** acumulado: qué categoría tira el cable más seguido es la causa raíz más rentable de atacar.

#### 4.4 Identificación dinámica de la restricción

En cada instante, el sistema identifica cuál estación es el cuello de botella (mayor utilización + mayor cola pendiente + mayor tiempo de espera proyectado). El dashboard del encargado muestra: *"La restricción ahora es plancha. No metas más pedidos al horizonte de 8 minutos."*

Aplica **Drum-Buffer-Rope:** la estación restrictiva marca el ritmo, un buffer pequeño se mantiene antes de ella, y el orquestador modera la admisión upstream para no sobrecargarla. Cuando la restricción se mueve durante el día (a las 13hs es plancha, a las 21hs es despacho con repartidores apilados), el sistema lo reconoce y reasigna prioridades.

#### 4.5 Quality holds inteligentes con pre-cocción calibrada

Para productos pre-armables (medallones, cebolla caramelizada, salsas en pomo, papas blanqueadas):

- **Buffer calibrado** según pronóstico del día específico —no histórico promedio.
- **Timer individual por unidad** desde el momento de preparación.
- **Alerta cuando se acerca al final de la ventana de calidad.**
- **Descarte forzado y trazado** al expirar — el sistema no permite servir lo vencido.
- **FIFO automático** dentro del hold: el sistema indica qué unidad usar primero.

#### 4.6 Inventario y HACCP integrados

- **Par levels por estación** al inicio del turno, con check-in del encargado.
- **Descuento automático** por cada pedido despachado.
- **86 automático** en Rappi y PedidosYa cuando un insumo cae bajo umbral: se desactiva el ítem en las apps de delivery antes de que un cliente lo pida y le toque cancelación.
- **FIFO digital por lote** con etiquetado en estanterías.
- **Trazabilidad lote-a-pedido:** ante un retiro de proveedor, el sistema indica exactamente qué pedidos contenían ese lote.
- **Temperatura continua** vía sensores IoT en heladeras, freezers y holding stations.
- **Tiempo-temperatura integrado:** una unidad pre-armada a las 13:15 se marca para descarte forzado a las 13:25.
- **Allergen flagging:** pedidos con exclusión de alérgenos disparan flags visuales en cada estación con confirmación manual del operario.

#### 4.7 Despacho sincronizado con repartidor

- **ETA del repartidor al local** integrado al KDS desde la API de Rappi/PedidosYa.
- **Inicio inverso del empaque** cuando el driver está a 2-3 minutos: el empaque final no arranca antes (se enfría) ni después (driver espera).
- **SLA medido puerta a puerta**, no solo cocina.
- **Score del repartidor por local:** detecta patrones —un rappitero específico que siempre demora en Valle Escondido, por ejemplo.
- **Tracking del pedido post-despacho** hasta confirmación de entrega.

#### 4.8 Comunicación con el cliente vía WhatsApp

Cuatro mensajes automáticos por pedido vía WhatsApp Cloud API:

1. **Al confirmar:** *"Recibimos tu pedido. Tiempo estimado: 35 min."* — con ETA dinámico real.
2. **Al entrar a cocina:** *"Tu burguer está en plancha."*
3. **Al salir:** *"Tu pedido salió. Llega en aprox 15 min."* — con tracking en vivo del repartidor.
4. **Post-entrega (30 min después):** pedido de feedback bifurcado.

La conversación es bidireccional: el cliente puede responder y entra a un flow que separa consultas operativas (ETA, modificación, reclamo) de feedback emocional. Cliente que pregunta dos veces por ETA dispara alerta interna automática.

### Anillo 2 — Inteligencia

#### 4.9 Dashboard multinivel con variabilidad

Vista en tiempo real cruzable por tres dimensiones:

- **Por local:** pedidos en cocina ahora, tiempo promedio del día, pedidos atendidos hoy y esta semana, comparativa contra el resto de los locales **normalizada por mix de productos y franja horaria**.
- **Por estación:** tiempo promedio, **desvío estándar, Cpk** (capacidad del proceso), cuál es la restricción ahora, histórico por turno, gráficos de control estadístico (SPC) que detectan tendencias fuera de control antes de cruzar el rojo.
- **Por turno y horario:** curva de demanda real vs prevista, pedidos por hora comparados con la misma franja de la semana pasada, productividad por persona-hora.

Cuando un pedido se va a salir del SLA, **alerta al encargado antes de que el cliente note la demora**. Cuando la variabilidad en una estación sube fuera de control sin que el promedio cambie, también alerta — es la señal temprana de un problema crónico.

#### 4.10 Layout digital y spaghetti diagrams

Cada local tiene su **planta digital georeferenciada** con estaciones, equipos, heladeras y áreas marcadas en su posición real.

- **Tracking de movimiento del personal** vía beacons BLE en delantales o visión computacional sobre cámara existente.
- **Reporte semanal:** distancia caminada por persona por turno, mapa de calor de actividad, cruces de tráfico, backtracking, tiempos muertos en zonas específicas.
- **Comparación pre/post** ante cualquier cambio de layout: se mide con dato cuantitativo si una modificación bajó la muda de movimiento, no por intuición.

#### 4.11 Skills matrix y gestión de equipo

- **Matriz empleado × estación × nivel** (1-4): cada persona evaluada en cada estación con criterios objetivos.
- **Validación de turno:** al armar un turno, el sistema confirma que el mix de habilidades cubre la demanda esperada y alerta si hay déficit ("el sábado a la noche, plancha tiene solo nivel 2 — peligro").
- **Curvas de aprendizaje individuales:** cuánto tarda cada empleado en ir de nivel 1 a 3 en cada estación, con input directo a plan de carrera y compensación.
- **Performance individual:** tiempos asociados a empleados —no para castigar, para entrenar: el sistema sugiere qué necesita practicar cada uno.
- **Pairings óptimos:** combinaciones de personas que históricamente funcionan mejor juntas.

#### 4.12 Customer intelligence sin app

Vinculado al número de WhatsApp del cliente, sin pedirle al cliente que instale ni registre nada:

- **Perfil auto-generado:** frecuencia, ticket promedio, productos favoritos, horario preferido, canal predilecto, días de semana habituales.
- **"¿Lo mismo de siempre?"** disponible como respuesta rápida después de 3 pedidos consistentes.
- **Detección de churn:** cliente habitual que no pidió en 3 semanas dispara mensaje proactivo de cercanía —no descuento.
- **VIP routing:** cliente con LTV alto entra con prioridad en cola cuando la cocina está saturada.
- **Lifecycle stage:** nuevo, ocasional, habitual, VIP, en riesgo, perdido — con triggers automáticos en cada transición.

#### 4.13 Feedback bifurcado con trazado a causa raíz

30 minutos después de la entrega, el cliente recibe: *"¿Cómo estuvo todo? Puntuá del 1 al 5."*

- **5★** → link directo a Google Reviews. La marca capitaliza reputación pública.
- **4★** → *"Gracias. ¿Algo a mejorar?"* — recopila feedback constructivo opcional.
- **3★ o menos** → bifurcación interna. Pregunta categórica (*"¿qué falló? comida / tiempo / driver / otro"*) + caja de texto. Se genera un caso interno con prioridad. **Las quejas las ve la operación primero, no Instagram.**

Cada nota se vincula automáticamente a estación, empleado y turno del pedido específico. Una queja por temperatura del medallón se conecta al timestamp de plancha y al operario en estación ese minuto. **La causa raíz deja de ser hipótesis.**

Dashboard de feedback con NPS calculado automáticamente, distribución de quejas por categoría, por local y por turno.

#### 4.14 Modelo financiero por pedido

Cada pedido se vincula automáticamente a:

- **Costo real de insumos** (food cost efectivo, no teórico).
- **Costo de mano de obra** atribuido por minutos-estación consumidos.
- **Costo de delivery** (comisiones de plataforma + repartidor propio si aplica).
- **Margen efectivo** del pedido específico.
- **Cost of Poor Quality (COPQ):** si hubo descuento, reposición o reclamo, el costo se atribuye a la causa raíz (estación, turno, empleado).

Habilita decisiones de menú engineering con datos: qué productos vender más, cuáles re-pricear, cuáles retirar. Permite responder con dato lo que hoy es intuición: *¿la Smash con cebolla caramelizada es rentable, o me la come la mano de obra extra?*

### Anillo 3 — Mejora continua

#### 4.15 SOPs digitales con video

Por cada producto y cada estación, los pasos exactos documentados:

- Secuencia de armado con tiempos objetivo por paso.
- Video corto demostrativo accesible desde la tablet de la estación.
- Checklist de apertura, cambio de turno y cierre.
- Vinculado a la skills matrix: el material que cada empleado debe revisar según su nivel y meta.

Onboarding de un empleado nuevo: deja de depender de la disponibilidad del encargado.

#### 4.16 Motor Kaizen

Cada semana, el sistema genera **3-5 hipótesis de mejora** basadas en los datos del período. Ejemplo: *"Los miércoles a las 20hs, la variabilidad de plancha duplica el promedio. Hipótesis: turno con menos experiencia. Acción sugerida: rotar a Juan al miércoles. Métrica de éxito: bajar σ de plancha en 25% en 2 semanas."*

Cada hipótesis se convierte en **experimento controlado** con ciclo PDCA explícito (Plan-Do-Check-Act), métrica de éxito predefinida y revisión de resultado. El sistema lleva el registro de experimentos cerrados con su impacto medido.

#### 4.17 Best-practice cross-pollination entre locales

Cuando un local logra el mejor número en una métrica relevante, el sistema:

- Identifica **qué hace distinto** ese local (turno, layout, equipo, mix de productos, secuencia).
- Genera una **recomendación de replicación** a los otros locales con plan de implementación.
- Mide el **impacto del trasplante** para confirmar si la práctica fue causal o correlativa.

La estandarización emerge del propio dato, no se baja desde la oficina.

#### 4.18 Staffing predictivo

Pronóstico de demanda por franja horaria basado en:

- Histórico propio del local.
- Variables externas: clima, eventos masivos, días de pago, feriados, partidos de fútbol, paros de transporte.
- Estacionalidad y tendencia.

Propone composición de turno con número exacto de personas por estación. *"El viernes próximo a las 21hs vas a tener pico. Estás corto en plancha para ese turno. Necesitás un runner más en Nueva Córdoba el sábado."*

#### 4.19 Digital twin de cada local

Simulación de escenarios "what-if" antes de implementar cambios:

- *"¿Qué pasa si pongo una segunda plancha en Nueva Córdoba?"*
- *"¿Si reubico el armado más cerca del despacho en Ituzaingó?"*
- *"¿Si abro un quinto local en Alta Gracia con esta demanda proyectada?"*
- *"¿Cuántos pedidos por hora aguanta este layout antes de colapsar?"*

Modelo probabilístico Monte Carlo sobre variables conocidas (tiempos por estación, demanda, mix). Permite decisiones de inversión con sustento cuantitativo.

#### 4.20 Centro de operaciones virtual (NOC)

Una sola pantalla con los 4 locales en paralelo, con jerarquía visual:

- Lo que está dentro de banda se desvanece visualmente.
- Lo que requiere atención emerge en primer plano con la información mínima necesaria para actuar.
- Acceso de un click al detalle de cualquier local, estación o pedido.
- Indicadores agregados de red: pedidos totales, ingresos del día, NPS móvil, alertas activas.

Un operador puede monitorear toda la red en 15 minutos por turno.

---

## 5. Roles y vistas

Cada rol accede a una vista específica del sistema, diseñada para su contexto y autoridad de decisión:

- **Empleado de estación** — tablet con cola de pedidos asignados a su estación, semáforo, botón Andon, acceso a SOPs en video, timer de quality holds. Vista limpia, foco en la próxima acción.
- **Encargado de local** — dashboard del local con todas las estaciones en paralelo, restricción en vivo, ETA del repartidor, alertas activas, control de admisión de pedidos, gestión de turno y skills matrix.
- **Dueño / Operations Manager** — NOC virtual con los 4 locales, comparativas normalizadas, reportes Kaizen, modelo financiero por pedido, digital twin para decisiones estratégicas.
- **Cliente** — solo WhatsApp. Cuatro mensajes de estado + feedback. Cero fricción, cero instalación.
- **Repartidor** — integración nativa con apps de delivery (Rappi/PedidosYa), no necesita interface adicional.

---

## 6. Hardware e infraestructura física

- **Pantallas de KDS** una por estación (armado, plancha, freidora, despacho) — pantallas resistentes a calor y grasa.
- **Tablets de carga** para mozos en salón y encargado.
- **Sensores IoT de temperatura** en heladeras, freezers y holding stations (~USD 30 c/u).
- **Beacons BLE en delantales** o cámaras con visión computacional para tracking de movimiento (~USD 5 c/u por beacon).
- **Impresora térmica de backup** en cada estación para modo degradado.
- **Conectividad redundante:** WiFi primario + 4G de respaldo automático.
- **Sistema de audio** opcional para señales sonoras de eventos críticos.

---

## 7. Flujo end-to-end de un pedido

1. **13:00:00** — Cliente pide por WhatsApp. Bot conversa, arma pedido, lo confirma.
2. **13:00:15** — Orquestador asigna local (más cercano con capacidad), calcula score de complejidad y SLA dinámico (35 min). Envía confirmación al cliente con ETA real.
3. **13:00:16** — Sistema arranca planificación inversa: salida prevista 13:35, plancha 13:31, freidora 13:32, armado final 13:34, empaque 13:34.
4. **13:00:17** — Pedido entra al KDS de cada estación con su tiempo objetivo de inicio. Las estaciones aún no arrancan; el sistema espera.
5. **13:30:50** — Sistema detecta que armado va a poder empezar a las 13:31 según la cola; revisa que la restricción actual sea plancha y confirma timing.
6. **13:31:00** — Plancha arranca. KDS de plancha muestra semáforo verde, timer corriendo.
7. **13:31:00** — Sistema envía al cliente: *"Tu burguer está en plancha."*
8. **13:32:30** — Sistema detecta que plancha va 30 segundos lento (verde tarde). Recalcula proyección de salida: 13:35:30.
9. **13:33:30** — Freidora marca listo. KDS de armado se activa.
10. **13:35:00** — Armado marca listo. Sistema convoca a despacho. ETA del rappitero: 13:36.
11. **13:35:30** — Despacho inicia empaque sincronizado con llegada del driver.
12. **13:36:10** — Driver llega. Empaque listo. Pedido entregado al driver. Sistema notifica al cliente: *"Tu pedido salió. Llega en 12 min."*
13. **13:48:00** — Driver confirma entrega al cliente. Sistema cierra ciclo, registra tiempo puerta a puerta: 48 minutos. Inventario descontado, food cost calculado, margen registrado.
14. **14:18:00** — 30 min post-entrega, cliente recibe encuesta: *"¿Cómo estuvo? 1 a 5."*
15. **14:18:45** — Cliente responde 5★. Se le envía link a Google Reviews. Métrica de NPS actualizada.

Todo el ciclo es trazable, auditable y vinculado al perfil del cliente, a la skills matrix del equipo de ese turno, y al modelo financiero del pedido.

---

## 8. Modos operativos

El sistema opera en cuatro modos según contexto:

- **Modo normal** — operación estándar con todos los módulos activos.
- **Modo turbo** — activado en picos extremos: el sistema temporalmente desactiva ítems de baja rotación que ocupan plancha desproporcionadamente, aumenta el buffer de pre-cocción, prioriza pedidos por LTV de cliente, comprime mensajes al cliente a lo esencial.
- **Modo degradado / offline** — si cae internet, KDS sigue funcionando con datos locales, sincroniza al volver. Cada estación tiene impresora térmica de respaldo que se activa automáticamente.
- **Modo apertura / cierre** — checklists obligatorios, validación de par levels iniciales, conciliación de inventario al cierre, reporte automático al encargado y al dueño.

---

## 9. KPIs e indicadores principales

**Operacionales:**

- Tiempo puerta a puerta (promedio, σ, Cpk).
- Tiempo por estación (promedio, σ, Cpk).
- Throughput por hora.
- Utilización por estación.
- Tasa de pedidos en rojo / amarillo.
- Variabilidad relativa entre locales (después de normalización).

**Calidad:**

- NPS por local, turno y producto.
- Tasa de reclamos por categoría.
- Tasa de descarte por quality hold expirado.
- Reincidencia de quejas por empleado / estación / turno.

**Financieros:**

- Food cost real vs teórico.
- Cost of Poor Quality (COPQ) por causa raíz.
- Margen efectivo por producto y por canal.
- Ingresos por hora y por persona-hora.

**De equipo:**

- Progresión en skills matrix por empleado.
- Productividad individual (con contexto).
- Rotación y permanencia.
- Andon pulls por empleado y por categoría.

**De marca:**

- Reseñas en Google generadas (5★ canalizadas).
- Volumen de feedback constructivo (4★).
- Retención de clientes (% de clientes habituales activos).
- Adquisición y reactivación por canal.

---

## 10. Integraciones externas

- **Rappi y PedidosYa** — pedidos entrantes + ETA del driver + 86 automático.
- **WhatsApp Cloud API** — comunicación bidireccional con el cliente.
- **Google Reviews** — canalización de feedback positivo.
- **POS existente de Frich** — sincronización de facturación (no reemplazo).
- **Proveedores de inventario** — pedido automático basado en par levels y rotación (futuro orgánico).
- **Sistemas contables** — exportación periódica de datos financieros.
- **Servicios climáticos / calendario de eventos** — input al staffing predictivo.

---

## 11. Casos de uso completos

**Caso 1 — Apertura del local de Nueva Córdoba (delivery-only):**
Como es un layout distinto (sin salón), el sistema lo trata como categoría diferente: par levels específicos, mix de productos esperado distinto, tiempo de despacho dominante. La skills matrix de su equipo arranca poblada desde el playbook digital de los otros locales. Las primeras 4 semanas, el sistema acumula datos propios y empieza a generar comparativas válidas.

**Caso 2 — Pico de viernes a las 21hs:**
A las 18hs el sistema ya alertó que la demanda esperada va a saturar plancha. Se activa pre-cocción ampliada del buffer. A las 21:00 el modo turbo se enciende automáticamente. Pedidos VIP se enrutan con prioridad. Restricción visible: plancha. Drum-Buffer-Rope acotando admisión. A las 22:30 el pico baja y el sistema vuelve a modo normal.

**Caso 3 — Queja recibida:**
Cliente puntúa 2★ y reporta "medallón frío". El sistema identifica el pedido, el timestamp de plancha (13:33), el empleado en estación (María, nivel 3), el timestamp de despacho (13:38, 5 minutos de espera por demora del repartidor que llegó tarde). Se categoriza la causa raíz como "despacho tardío por driver" — no es problema de cocina. El sistema agrega el rappitero a la lista de scores y escala si es reincidente.

**Caso 4 — Ciclo Kaizen semanal:**
El lunes, el sistema entrega 4 hipótesis al dueño: (1) la variabilidad de armado en Valle Escondido es 60% más alta que el promedio — sugiere revisar layout; (2) el ticket promedio bajó 8% en Jesús María — sugiere revisar mix por canal; (3) un rappitero específico genera 35% de las quejas de "tiempo" en Ituzaingó — sugiere bloquear o reportar a la plataforma; (4) los miércoles a las 20hs hay déficit recurrente de skill nivel 3 en plancha — sugiere ajustar turno. Se eligen 2, se diseñan experimentos, se cierran a la semana siguiente con resultado medido.

**Caso 5 — Apertura del quinto local:**
El dueño usa el digital twin para simular: layout candidato, demanda proyectada, mix esperado, equipo mínimo. El sistema responde con throughput máximo soportado, identifica probables cuellos de botella, sugiere skills matrix del equipo inicial. Decisión de apertura tomada con sustento cuantitativo.

---

## 12. Lo que el sistema NO es

- **No es un POS.** Si Frich usa hoy un POS para facturación, sigue ahí. Frich OS se integra, no reemplaza.
- **No es un CRM de marketing.** Captura datos para comunicación operativa (mensajes de estado), no para campañas. La base queda y puede usarse después.
- **No es una app del cliente.** El cliente nunca instala nada. Toda la comunicación pasa por WhatsApp.
- **No es un ERP.** No gestiona contabilidad, recursos humanos formales, ni compras estratégicas. Se integra a un ERP existente si lo hay.
- **No es un sistema de gestión de marca o redes sociales.** Captura feedback y canaliza reseñas, pero no opera Instagram ni Facebook.
- **No es un sistema de reservas.** Frich es delivery + salón rápido, no requiere booking.

---

## 13. Síntesis

Frich OS es **la transformación de Frich de una hamburguesería con cuatro locales en una empresa de manufactura de comida con cuatro plantas**, conservando la sensibilidad artesanal de marca pero apoyada en la rigurosidad operativa que solo McDonald's, Five Guys y un puñado de cadenas globales tienen hoy.

Mide lo que importa con la granularidad correcta: no solo el promedio sino la variabilidad, no solo la cocina sino el puerta a puerta, no solo qué pasó sino dónde está la restricción ahora. Comunica con el cliente honestamente, en tiempo real, sin pedirle que instale nada. Convierte cada turno en un ciclo de mejora continua con hipótesis, experimento y aprendizaje cerrado. Y opera los cuatro locales como un sistema único, no como cuatro silos.

El resultado: tiempos más cortos y más consistentes, menos quejas y mejor canalización de las que aparecen, márgenes visibles por producto y pedido, equipo entrenado con dato en lugar de intuición, decisiones de expansión con sustento cuantitativo, y una cultura interna donde la conversación deja de ser *quién falló* y se vuelve *qué proceso falló* — la base más duradera de ventaja competitiva en gastronomía a esta escala.

---

<div align="center">

<sub>Frich OS · Documento de producto · Preparado por studiOS</sub>

</div>
