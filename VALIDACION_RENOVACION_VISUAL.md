# Validación de la renovación visual de DRAKZETH

## Alcance protegido

La renovación preserva el personaje principal LPC muscular en `assets/drakzeth/player-lpc/`, su adaptador de cuatro filas y el mapeo de orientación corregido. También preserva los sprites, ilustraciones, identificadores, introducciones, fases, vida y daño de todos los jefes.

## Integraciones realizadas

| Área | Integración aplicada |
|---|---|
| Armas | Se añadieron 15 iconos del paquete nuevo. Se muestran en el arma equipada, el personaje durante el combate, las cartas de recompensa y las tarjetas de armas de la landing. |
| Enemigos comunes | Soldado, orco, demonio y Blood Monster se usan mediante perfiles animados con idle, caminar, ataque, daño y muerte. Las estadísticas e IA existentes no se modificaron. |
| Suelo y mundo | Se añadió una capa de roca oscura de baja opacidad, objetos de reliquia y un portal como decoración contextual. |
| Habilidades | Se añadieron spritesheets para cortes, impactos, fuego, explosiones, magia sagrada y truenos. Se conectaron a ataques, Rugido, Aliento, Garra, Vuelo, Marea, Meteorito, Corazón, Arte mágico, Luna Fría, Espada Astral y Definitiva. |
| UI y recompensas | El HUD refleja el arma actual con un icono. Las cartas de armas muestran el recurso visual correspondiente. |

## Pruebas realizadas

| Comprobación | Resultado |
|---|---|
| `node --check script.js` | Correcto. |
| Auditoría de IDs, assets, funciones y sistemas | Sin IDs faltantes, assets faltantes, funciones duplicadas ni sistemas ausentes. |
| Carga de partida con el personaje LPC | Correcta. |
| Movimiento y ataque | Correctos durante la prueba en navegador. |
| Cambio de arma por teclado | Correcto. |
| Aliento Carmesí y efectos renovados | Correctos durante la prueba en navegador. |
| Tarjetas de armas de la landing | Iconos cargados correctamente en navegador. |

## Recursos nuevos

Se incluyeron 63 archivos en `assets/drakzeth/renewal/`. El proyecto sigue siendo estático: puede abrirse mediante `index.html`, usa rutas relativas y no necesita compilación ni dependencias nuevas.

## Nota de licencias

Consultar `CREDITOS_ASSETS_RENOVACION.md` antes de publicar o redistribuir el proyecto.

## Ajuste posterior: escala y acoplamiento de armas

Se corrigió la legibilidad de los enemigos y las armas después de la primera integración. Los enemigos del paquete Tiny RPG ocupan solo una porción central de cada celda de 100×100, por lo que se amplió **únicamente su tamaño de dibujo** a un rango entre 220 y 420 píxeles. El radio de colisión, vida, velocidad, daño e IA no se modificaron.

Las armas recibieron `RENEWAL_WEAPON_HAND_PROFILES`, con escala, distancia de agarre y ángulo propios para espada, katana, daga, lanza, arco, ballesta, gran espada, bastón, sello y escudo. El anclaje usa el vector de orientación del jugador y una posición de mano aproximada dentro del sprite LPC. Las pruebas en navegador con D, A, Space, teclas 2–3 y C confirmaron movimiento, ataque, cambio de arma y el combo Lanza↔Ballesta.

## Magia enemiga, áreas y definitiva de 70 segundos

Los ataques mágicos de enemigos ahora disparan los VFX de renovación correspondientes en el lanzamiento y el impacto. Los ataques a distancia usan trueno, las ráfagas arcanas usan magia sagrada, las copias de Aliento usan fuego y la lluvia de meteoros de enemigos enfurecidos incorpora telegráficos de trueno y explosiones visibles.

Se amplió **solo la escala visual** de las habilidades de área del jugador, sin modificar sus radios de daño: Marea Carmesí, Meteorito del Sello, Corazón del Dragón, arte del Sello, Espada Astral y Apoteosis del Sello. La definitiva conserva su radio de daño de 270, pero su anillo y explosión se ven a 360 y 270 píxeles respectivamente. Su cooldown es ahora de `4200` fotogramas, equivalente a **70 segundos**, y su efecto persistente dura 150 fotogramas.

## Integración completa de assets y modo de rendimiento

Se midieron 63 assets del paquete renovado considerando dimensiones y ocupación alfa. El piso base ahora usa `assets/drakzeth/renewal/world/ground-tile.png`, con el suelo antiguo únicamente como fallback. Los atlas de objetos se integran mediante recortes con escala individual: ruinas, piedras, altares, cristales, fuego, rituales y teletransportadores aparecen como adornos del mapa con halos carmesí, azul o violeta según su función.

También se conectaron las tiras restantes de cristales, espejos, proyectiles, humo, barrido vertical y rayos alternos a las habilidades del personaje, impactos de meteoritos, magia enemiga y ataques copiados. El modo de rendimiento es opcional, se guarda en `localStorage` y se activa desde la pausa; reduce la cantidad de adornos, partículas y VFX simultáneos, pero conserva contenido, daño, IA, controles y cooldowns.

## Auditoría y corrección de animaciones

Se revisaron las hojas LPC del personaje. Todas son celdas de 64×64; el código conserva únicamente los cuadros ocupados de cada hoja: idle 2, walk 9, run 8, ataque ligero 6, ataque pesado 13, casteo 7, daño 6 y muerte 5. Se añadió una protección para hojas de una sola fila, como `hurt.png`, de modo que nunca intente leer una fila inexistente.

Las hojas renovadas de enemigos no tienen todas el mismo número de cuadros: algunas acciones tienen 4, 6, 7 u 8. El render ahora calcula las columnas con el ancho real de la imagen, reinicia el ciclo al cambiar entre caminar, ataque, daño y muerte, y alterna visualmente entre Attack01 y Attack02 sin modificar la IA ni las estadísticas.

Las tiras VFX se verificaron contra sus dimensiones reales: impacto 1×7, explosión 1×8, fuego 18×1, barridos 5×1 y 6×1, sagrado 8×1, trueno 13×1, trueno alterno 8×4, cristales 6×1, espejo 1×10, proyectiles 4×7 y humo 1×1. Las habilidades del personaje siguen usando las hojas LPC correspondientes y sus VFX se adaptan a estas cuadrículas sin recortes fuera de rango.

## Revisión actual de habilidades y tiempos

La prueba en navegador cargó el minijuego actual y permitió activar Rugido, Aliento Carmesí y Meteorito. Rugido mostró un anillo de área grande y centrado en el personaje; Aliento mostró su efecto direccional carmesí; Meteorito mantuvo su zona circular y telegráfico sin desbordar el canvas. El personaje LPC conservó su orientación y el arma permaneció visualmente unida al cuerpo.

Se sincronizó el coste estático de Rugido a 26 FP, se protegió la animación de casteo para que el movimiento no la reemplace antes de tiempo y se añadió un casteo de 28 fotogramas a Corazón del Dragón. Los cooldowns actuales se expresan en fotogramas a 60 FPS y se reflejan en el HUD cuando corresponde.

## Meteorito con explosión HolyVFX

La textura `explosion-effect-strip.png` se conectó a Meteorito del Sello. La secuencia de ocho cuadros se repite durante 180 fotogramas, equivalente a aproximadamente 3 segundos a 60 FPS. El diámetro visual usa `p.radius * 2` —236 px para el radio de impacto actual de 118—, por lo que la explosión coincide con el área de la habilidad sin aumentar el daño. El telegráfico también dura 180 fotogramas. La prueba en navegador activó Meteorito y confirmó que el efecto permanece dentro del canvas.

## Marea Carmesí con Aura38

La hoja `Aura38.png` se integró como `aura-marea-38.png`. Sus 32 cuadros se leen como una cuadrícula de 8×4 con celdas de 128×128, a 8 FPS durante 240 fotogramas, equivalente a 4 segundos. En navegador, Marea mostró la columna de aura rosa-violeta centrada en el personaje, con un tamaño de 520 px de diámetro visual, mientras el área de daño permaneció en radio 214 y la zona visual procedural en radio 260. El coste sigue siendo 28 FP y el cooldown 5 segundos.

## Retiro de cuadros de personajes del mapa

Se eliminaron de `DECOR_ASSETS` los seis retratos decorativos de Aurelia, Kaelor, Morvane, Nysera, Solarys y Elyria. Los personajes reales del combate y los jefes siguen usando sus rutas y renderizados propios. La prueba en navegador inició el minijuego con la nueva caché y el mapa conserva únicamente piso, ruinas, altares, reliquias, fuego, cristales, cofres, barriles y otros adornos ambientales, sin cuadros de retratos.

## Explosión épica de Meteorito y análisis de nuevos paquetes

Se sustituyó la explosión anterior de Meteorito por `assets/drakzeth/renewal/fx/meteor-epic-002.png`, construida a partir de `epic_explosion_002_large_yellow` del Super Pixel Effects Gigapack. La hoja tiene 15 cuadros en una cuadrícula 5×3, cada celda de 192×192 px. Se reproduce a 5 FPS durante 180 fotogramas, aproximadamente 3 segundos, con diámetro visual de 236 px para coincidir con el diámetro del área de impacto de Meteorito. No se modificaron daño, radio lógico, coste ni cooldown.

Se incorporó `ANALISIS_PAQUETES_EFECTOS.md` con el diagnóstico de SuperPixel y FreePixel: reemplazos posibles, nuevas integraciones, medidas, FPS y licencias. La activación interactiva de Meteorito en el navegador tuvo un timeout de la extensión, pero la hoja, las rutas, la cuadrícula, el render, la sintaxis y la auditoría se verificaron programáticamente.

## Radahn animado con transparencia real

Se sustituyó la referencia de `assets/drakzeth/bosses/radahn-animated.webp` por `assets/drakzeth/bosses/radahn-animated-transparent.png`. El atlas conserva sus dimensiones de 2048×1152 px, la cuadrícula de 8×4, celdas de 256×288 px, cuatro orientaciones y 8 FPS. El PNG está en RGBA con alfa real (extremos 0–255), por lo que el fondo blanco/cuadriculado del archivo fuente ya no aparece en el canvas.

La función `drawAnimatedRadahnBoss()` mantiene un tamaño mínimo de 560 px y no modifica estadísticas, fases, IA, introducciones ni mecánicas de los jefes. La prueba temporal del día 33 se retiró antes de empaquetar el proyecto. La prueba visual en navegador confirmó que Morvane aparece grande y sin rectángulo blanco al entrar al combate.

La caché final del HTML es `renovacion-boss-radahn-transparent-23`. `node --check script.js` y la auditoría final reportaron cero errores de sintaxis, rutas faltantes, IDs faltantes, funciones duplicadas o sistemas ausentes.

## Ajuste de ritmo y concurrencia de enemigos

La duración de cada noche se actualizó a `DAY_SECONDS = 180`, equivalente a **3 minutos reales**. El overlay inicial y el HUD muestran `3:00`. La generación de enemigos utiliza `MAX_ACTIVE_ENEMIES = 12`: el acumulador de aparición sigue funcionando durante la noche, pero nunca supera doce enemigos vivos simultáneamente. Cuando un enemigo muere, se elimina del arreglo durante el ciclo de actualización y el acumulador repone la plaza disponible de forma gradual.

## Corrección de la animación de Radahn

El render de Radahn dejó de forzar cada celda 256×288 dentro de un cuadrado. Ahora conserva la proporción original del atlas, utiliza una altura visual mínima de 560 px, calcula el ancho proporcional y aplica anclajes por orientación y cuadro para estabilizar los pies y el centro visual. Se añadió una pequeña histéresis de dirección para evitar parpadeos cuando el jugador y el jefe están en diagonal. La prueba en navegador con la caché 24 confirmó que el jefe conserva el fondo transparente, la escala grande y el avance de cuadros sin deformación visible.

## Apoteosis con seis explosiones violetas

La definitiva conserva su explosión inicial, la duración de 6 segundos y el cooldown de 70 segundos. Después del impacto inicial se crean seis explosiones violetas en una formación radial alrededor del Errante, con retrasos escalonados de 34 a 94 fotogramas. Cada explosión usa `apotheosis-violet-strip.png`, una secuencia de 18 cuadros RGBA a 10 FPS, y permanece activa durante 108 fotogramas para mostrar apertura, portal y cierre.

Cada impacto secundario se procesa una sola vez al llegar al cuadro 22 de su animación. Utiliza `dragonAreaDamage` con radio 58 y daño base 46, por lo que afecta a enemigos y jefes mediante las mismas reglas de daño, afinidad, postura, vulnerabilidad y multiplicadores de habilidades ya existentes. También se dibuja un destello radial violeta en el momento del impacto. La prueba en navegador con la caché 25 mostró la explosión inicial y los portales violetas secundarios dentro del canvas.

La hoja original se conservó como `apotheosis-violet-source.png`, mientras que el atlas transparente y sus cuadros procesados se guardan en `assets/drakzeth/renewal/fx/apotheosis-violet-strip.png` y `apotheosis-violet-frames/`. El fondo oscuro original no se utiliza en el render.

## Balance final de Apoteosis violeta

La explosión inicial de Apoteosis ahora utiliza el mismo atlas violeta que las seis secundarias. Se dibuja con tamaño de 540 px, equivalente al diámetro del radio lógico de daño inicial de 270 px, por lo que la escala visual corresponde al alcance real de la definitiva. Se retiró el HolyVFX anterior de esta activación para mantener una identidad visual única en toda la cadena.

Las seis explosiones secundarias fueron reforzadas: su radio pasó a 72 px y su daño base a 72. Mantienen posiciones radiales escalonadas, daño único por impacto y las mismas reglas de afinidad, postura, vulnerabilidad y daño a jefes del sistema existente. El cooldown de 70 segundos y la duración de 6 segundos se conservan.

## Meteorito azul de 3 segundos

La habilidad Meteorito del jugador ahora utiliza `meteor-blue-strip.png`, un atlas RGBA de 18 cuadros compuesto por nueve cuadros de entrada azul y nueve cuadros de impacto azul. La animación se reproduce a 6 FPS durante 180 fotogramas, equivalentes a 3 segundos.

El radio lógico del impacto del Meteorito del jugador es 118 px. El VFX azul se dibuja con tamaño 236 px, es decir, exactamente el diámetro del radio de alcance (`118 × 2`). El daño existente de 105 y la telemetría circular se conservaron. Las lluvias de meteoros de enemigos mantienen su VFX anterior; solo el Meteorito del jugador cambia al nuevo sprite azul.

## Marea Carmesí: crecimiento azul y fase roja

La habilidad Marea Carmesí fue reemplazada por tres atlas transparentes procesados: `tide-blue-growth-strip.png` con 18 cuadros, `tide-cyan-orb-strip.png` con 12 cuadros y `tide-red-phase-strip.png` con 14 cuadros. La zona dura exactamente 6 segundos (`360` frames).

Durante los primeros 2.5 segundos (`150` frames), el efecto comienza como una esfera pequeña y aumenta progresivamente cada segundo hasta alcanzar el diámetro completo. Los primeros 2 segundos usan los 18 cuadros azules y los últimos 0.5 segundos de crecimiento usan los 12 cuadros cian. Después inicia la fase roja durante 3.5 segundos (`210` frames), utilizando los 14 cuadros de portal/llama roja.

El radio lógico máximo de Marea se conserva en 214 px y el diámetro visual máximo se fija en 428 px (`214 × 2`). El radio de daño se actualiza con el crecimiento visual, por lo que el área efectiva no aparece completa antes de que el sprite alcance su tamaño máximo. El daño por pulsos continúa cada 42 frames, con 24 de daño por pulso y una sola zona activa por lanzamiento.

## Ajuste de ritmo, recompensas y concurrencia

La duración de los días normales quedó diferenciada por tramo: los días 1–10 duran 60 segundos (1:00) y los días 11–66 que no son de jefe duran 150 segundos (2:30). Los días de jefe asignan `dayTime=0`, muestran `DERROTA AL JEFE` y no decrementan el contador; su cierre continúa dependiendo exclusivamente de la muerte del jefe mediante `endDay()`.

El límite de enemigos simultáneos se elevó a 20. La reposición conserva la condición `enemies.length < MAX_ACTIVE_ENEMIES`, por lo que aparecen nuevos enemigos conforme se liberan espacios.

Las recompensas de armas ahora usan un mapa explícito de rutas para los 14 iconos disponibles y un fallback automático a `espadalarga.png` mediante `onerror`, evitando que una ruta fallida vuelva a mostrar el icono roto de la captura. El overlay inicial también fue actualizado para mostrar `Días 1–10: 1:00 · Desde el día 11: 2:30 · Jefes: hasta derrotarlos`.

## Enemigo Nayutaro Ichimonji

Se integró el atlas transparente `assets/drakzeth/renewal/enemies/nayutaro/nayutaro-atlas.png` con 90 cuadros de 128×128 px y su tabla de animaciones JSON. Nayutaro aparece como enemigo táctico de corto alcance desde el día 4 mediante la selección de amenazas especiales. Usa caminata base, patada giratoria al embestir, estado de contraataque al recibir daño, transformación a forma robusta al bajar al 50% de vida, puñetazo en la forma robusta y aura dorada de lectura visual.

Su escala visual es de 108×108 px para la celda del atlas, con contenido real cercano a la escala de los enemigos comunes. No se modificaron el personaje principal, los jefes, sus estadísticas, los controles ni la IA general de los demás enemigos. El paquete fuente no especifica una licencia; su procedencia queda registrada en `CREDITOS_ASSETS_RENOVACION.md`.

Nota técnica: la imagen física del atlas mide 1024×1536 px y forma una cuadrícula de 8×12 (96 celdas posibles), pero `nayutaro-atlas.json` define exactamente 90 cuadros utilizables. La integración usa únicamente esos 90 cuadros definidos y no dibuja las seis celdas restantes sin datos.


## Esferas de magia normal y Nayutaro ×7 · versión 32

Se añadieron dos atlas RGBA transparentes para los proyectiles normales de magia de enemigos: `enemy-magic-blue-strip.png` (8 cuadros de 128×128 px) para magos y `enemy-magic-elemental-strip.png` (20 cuadros de 64×64 px) para ataques a distancia. La función `drawEnemyMagicProjectile()` anima los cuadros con temporización independiente, orientación según la velocidad y brillo adaptado a la paleta. Si un atlas no carga, devuelve `false` y conserva el render circular anterior como fallback.

La sustitución se limita a los proyectiles creados en el disparo normal del bloque `e.shootCd`. Los ataques especiales `enemyMagicBurst()`, las habilidades copiadas por `enemyMimicCast()` y los VFX de habilidades se mantienen fuera del sistema de esferas, tal como se solicitó. Los proyectiles normales incluyen homing suave hacia la posición actual del jugador; el giro se limita por frame mediante `homingTurn` (`0.06` para magia azul y `0.075` para elemental), sin alterar daño, cadencia ni controles.

Nayutaro queda con `hp:826`, equivalente a siete veces la vida anterior de 118. Se conserva la transformación de segunda fase al 50% de vida; el campo `secondPhaseAt:.5` deja el umbral explícito en la definición del enemigo. No se modificaron el personaje LPC, los jefes distintos de Radahn, `BOSS_INTROS`, los controles ni las mecánicas especiales existentes.

### Validación técnica y de navegador

| Comprobación | Resultado |
|---|---|
| `node --check script.js` | Correcto, sin errores de sintaxis. |
| `auditar_drakzeth_final.js` | `duplicateIds: []`, `missingIds: []`, `duplicateFunctions: []`, `missingAssets: []`, `missingSystems: []`. |
| Caché de `index.html` | Actualizada a `script.js?v=esferas-magia-homing-32`. |
| Entrega HTTP del script y atlas | Script y ambos PNG respondieron `HTTP/2 200`. |
| Carga headless inicial | Botón `COMENZAR SUPERVIVENCIA` habilitado; `imageFailures: []`; `errors: []`. |
| Inicio de partida | El clic ocultó el overlay de inicio, dejó el día en `1` y produjo `canvasPixels` no nulos (`15,006,725` en la prueba). |
| Prueba visual de atlas | Ambos atlas muestran alfa real y no tienen un fondo rectangular negro. |

La captura auxiliar de la prueba headless se conserva fuera del ZIP en `/home/ubuntu/validacion_esferas_32/minijuego-version-32.png`; el script reproducible de humo queda en `/home/ubuntu/validacion_esferas_32/cdp_smoke.py`.


## Carga manual de maná y Corazón del Dragón · versión 33

La tecla **N** dejó de activar Corazón del Dragón de forma instantánea. Ahora inicia una canalización únicamente mientras permanece presionada. La carga completa dura 180 frames, aproximadamente 3 segundos a 60 FPS, y recupera FP a un ritmo deliberadamente lento de `0.16` por frame, equivalente a unos 9.6 FP por segundo antes de alcanzar el máximo disponible. La regeneración pasiva normal de FP se pausa durante la canalización para evitar una recuperación excesiva.

Mientras N está mantenida, el Errante permanece inmóvil, usa la animación de canalización y no puede atacar, rodar, hacer parry ni lanzar otras habilidades. Un impacto válido interrumpe la carga y la reinicia. Si se suelta N antes de completar los 180 frames, se cancela la canalización sin activar Corazón. Si se suelta después de alcanzar el 100%, se activa Corazón del Dragón con su mejora existente: 6 segundos de duración, +28% de daño, +20% de velocidad y protección inicial durante 90 frames. El enfriamiento de Corazón queda eliminado; después del breve bloqueo visual de lanzamiento, se puede comenzar otra carga manteniendo N nuevamente.

Para la animación se procesaron dos atlas RGBA transparentes: `mana-charge-seal-strip.png` con 10 cuadros uniformes de 96×157 px y `mana-charge-fire-strip.png` con 20 cuadros uniformes de 98×195 px. El sello crece durante la primera parte de la canalización; la llama carmesí aumenta progresivamente y, al alcanzar el máximo, mantiene una animación oscilante sin reiniciarse mientras N continúe presionada. La captura headless `mana-charge-heart-33.png` muestra el HUD con `CARGANDO`, la escena jugable y el aura sobre el personaje.

### Comprobaciones de la versión 33

| Comprobación | Resultado |
|---|---|
| Sintaxis JavaScript | `node --check script.js` correcto. |
| Auditoría estructural | `duplicateIds: []`, `missingIds: []`, `duplicateFunctions: []`, `missingAssets: []`, `missingSystems: []`. |
| Caché | `script.js?v=mana-charge-heart-33`. |
| Inicio de partida | El botón se habilita, el overlay se oculta y el día comienza en `1`. |
| N sostenida | El HUD pasó a `CARGANDO · 48–51%` durante la prueba y llegó a `CARGANDO · 100%`. |
| Liberación con carga completa | El HUD pasó a `ACTIVO · 5.7–5.8s`, confirmando la activación de Corazón. |
| Sin enfriamiento | Tras terminar el breve bloqueo de lanzamiento, una segunda pulsación produjo `CARGANDO · 12%` inmediatamente. |
| Errores de ejecución | `errors: []` en todas las fases de la prueba headless. |


## Controles móviles completos · versión 34

La interfaz táctil fue reorganizada en tres zonas: joystick virtual a la izquierda, acciones principales a la derecha y un panel de habilidades desplegable con scroll interno. El ataque ahora funciona mediante pulsación sostenida, el joystick actualiza movimiento y dirección de ataque, y las habilidades usan Pointer Events para evitar dobles activaciones entre `touch` y `click`. La carga de maná mantiene el comportamiento de pulsación prolongada también en el botón móvil.

El panel de habilidades se mantiene oculto durante la pantalla inicial, pausa y derrota, y se activa únicamente durante la partida. Esto evita que una capa táctil quede por encima de los overlays. También se añadieron `touch-action:none`, prevención de gestos de contexto/selección y captura de puntero para que los controles no pierdan el toque al mover el dedo.

La primera prueba detectó que el panel de habilidades quedaba fuera del viewport (`y:-128`) en un teléfono de 390×844 px. Se corrigió fijando su posición entre el HUD superior y las acciones inferiores. La segunda prueba confirmó `heart_rect.y:43.8`, hit-test sobre `mob-dragon-heart`, joystick desplazable y estados `CARGANDO · 26%` sin errores.

### Validación móvil

| Comprobación | Resultado |
|---|---|
| Viewport | 390×844 px, emulación móvil. |
| Controles iniciales | Ocultos antes de iniciar para no bloquear el overlay. |
| Partida iniciada | Panel táctil visible y activo. |
| Panel de habilidades | Se abre con `aria-expanded="true"` y queda dentro del viewport. |
| Joystick | El stick responde a `touchStart`/`touchMove` y modifica su posición visual. |
| Ataque y acciones | Conectados a Pointer Events; ATK soporta mantener pulsado. |
| Carga de maná | Botón móvil recibe el toque y muestra `CARGANDO · 26%`. |
| Errores JavaScript | `errors: []`. |
| Captura | `/home/ubuntu/validacion_esferas_32/mobile-controls-34.png`. |


## Firefly(36) como único VFX de carga · versión 35

La carga de maná dejó de combinar el sello de `Firefly(32)` con la llama de `Firefly(33)`. Se retiró la referencia y el archivo procesado del sello antiguo, y se conservó únicamente `mana-charge-fire-strip.png`, normalizado desde el atlas proporcionado por el usuario `Firefly(36).png`.

El atlas fue normalizado a 20 cuadros de 192×256 px. Cada cuadro comparte un centro horizontal y una base vertical común para que la llama crezca hacia arriba sin desplazarse. El render conserva la relación de aspecto 192:256 y utiliza composición `source-over`; no mezcla el sello antiguo ni usa brillo aditivo para esconder saltos.

La secuencia de carga emplea los primeros cuadros para el crecimiento, retiene un bucle de cuadros intensos alrededor del máximo mientras N continúa presionada y recorre los cuadros de disipación al soltar. Si la carga se interrumpe antes del máximo, la disipación comienza desde el progreso actual. Si se completa, la disipación acompaña la activación de Corazón del Dragón.

### Comprobaciones de Firefly(36)

| Comprobación | Resultado |
|---|---|
| Asset activo | Solo `mana-charge-fire-strip.png`; no existe referencia a `manaChargeSeal`. |
| Normalización | 20 cuadros, 192×256 px por cuadro, alfa real `(0,255)`. |
| Escala | Relación del atlas conservada; la llama no se estira de forma independiente en X/Y. |
| Fluidez | Un único atlas, interpolación limitada dentro de cuadros consecutivos y retención del máximo sin entrar en la disipación mientras N sigue presionada. |
| FP sin N | Se mantuvo en 90 durante la espera de prueba. |
| FP con carga | Subió lentamente a 105 al 50% de carga. |
| Activación | La prueba llegó a `CARGANDO · 100%` y después `ACTIVO · 5.8s`. |
| Errores | `errors: []`; sintaxis y auditoría estructural correctas. |


## Audio, vibración y cuadro único · versión 36

La carga de maná ahora crea un zumbido procedural mediante Web Audio API al iniciar N. La frecuencia sube gradualmente con el porcentaje de carga y el volumen se limita mediante el ajuste existente de sonido. Al soltar N el oscilador se desvanece; al completar la carga, Corazón del Dragón reproduce un tono triangular ascendente con caída corta. Si el navegador no permite Web Audio, la habilidad continúa funcionando sin errores visuales ni de combate.

En dispositivos compatibles, la carga produce una vibración breve al comenzar, otra al soltar y un patrón más fuerte al activar Corazón. `navigator.vibrate` se usa de forma defensiva, por lo que en escritorio, iOS o navegadores sin soporte se omite sin afectar el juego.

La transición visual vecina fue eliminada: `drawManaAtlasLerped` fue sustituida por `drawManaAtlasFrame`, que realiza una sola llamada `drawImage` con un índice entero por instante. El render ya no superpone dos cuadros ni hace fundidos entre ellos. Firefly(36) conserva una velocidad de cuadro fija durante el crecimiento, retiene un único cuadro intenso por ciclo en el máximo y usa un solo cuadro entero por instante durante la disipación.

La prueba de sintaxis y auditoría sigue correcta. La prueba headless confirmó carga manual, FP estable sin N y ausencia de errores JavaScript; una carga prolongada puede ser interrumpida por daño enemigo, tal como establece la mecánica de canalización.


## Anclaje corregido de la carga · versión 40

Se corrigió el render de la carga para resolver el desplazamiento que dejaba la llama fuera del personaje. Antes se dibujaba antes del jugador con el origen aproximado `y - 12`; ahora la llama se dibuja después del personaje, se centra en `player.x` y su base se ancla a `player.y + player.r + 10`, incluyendo únicamente el mismo bob visual del personaje.

También se eliminó cualquier transición entre celdas: la carga utiliza siempre el frame entero `8` del atlas normalizado de Firefly(36), sin mezcla, sin fundido entre cuadros y sin cambio de índice durante el crecimiento. El tamaño se modifica de forma proporcional y el pulso restante es únicamente de escala mínima, no una transición de frames.

| Comprobación | Resultado |
|---|---|
| Render antiguo | `drawManaAtlasLerped` no existe. |
| Render activo | `drawManaAtlasFrame` con un único índice entero. |
| Orden de dibujo | La llama se dibuja después del jugador. |
| Anclaje | Centro X en `player.x`; base en el radio visual inferior del jugador. |
| Prueba headless | `CARGANDO · 52%` y `CARGA INTERRUMPIDA`, sin errores JavaScript. |
| Auditoría | Sin assets faltantes, IDs duplicados, funciones duplicadas ni sistemas faltantes. |


## Segunda aura carmesí cíclica · versión 43

La segunda aura, ahora en rojo carmesí intenso, se convirtió en un ciclo procedural de 90 frames —1.5 segundos a 60 FPS— con un solapamiento de 30 frames —0.5 segundos—. Cuando el ciclo actual entra en sus últimos 30 frames, comienza el siguiente ciclo con una envolvente suave; las auras naranja y naranja oscura permanecen continuas y sin cambios.

La llama de Firefly(36) no participa en este ciclo y sigue usando un único frame entero, sin interpolación entre cuadros vecinos.

| Prueba | Resultado |
|---|---|
| Inicio | `Mantén N · carga lenta` |
| Carga intermedia | `CARGANDO · 51%` |
| Carga completa | `CARGANDO · 100%` |
| Liberación | `ACTIVO · 5.8s` |
| Nueva carga | `CARGANDO · 13%` sin cooldown real |
| Errores JavaScript | Ninguno |


## Módulo de aura de Nayutaro como carga de FP · versión 44

La animación de carga de FP fue reemplazada por el módulo independiente de aura de Nayutaro, derivado del paquete `nayutaro-independent-aura-module.zip` proporcionado por el usuario. El juego carga `assets/drakzeth/renewal/fx/nayutaro-aura-strip.png`, un strip RGBA transparente de 2992×192 px compuesto por 17 celdas uniformes de 176×192 px. La integración conserva el funcionamiento estático del proyecto: las rutas son relativas, no se añadió compilación ni dependencia externa y el juego continúa preparado para abrirse directamente desde `index.html`.

La composición se renderiza después del personaje y utiliza tres capas independientes del mismo atlas. La capa exterior roja recorre el ciclo principal; la capa interior roja, más intensa, entra en un nuevo ciclo 500 ms antes de que termine el anterior; y la capa naranja interna usa el mismo strip con un tinte cálido aplicado en tiempo de dibujo. Cada capa selecciona una celda entera mediante índices discretos, sin interpolar ni mezclar cuadros vecinos. El anclaje mantiene el centro en `player.x` y la base en `player.y + player.r + 10`, con el mismo desplazamiento de cámara y bob visual del jugador.

La explosión de Corazón del Dragón no fue retirada. Al completar y liberar N, la función conserva la activación de `spawnRenewalFX('holy')`, `spawnRenewalFX('mirror')` y `triggerScreenShake(12,7)`, junto con el efecto de 6 segundos y las reglas de daño ya existentes. La regeneración automática de FP tampoco se reintrodujo: la única recuperación sigue siendo la carga manual mientras N permanece sostenida.

### Comprobaciones de la versión 44

| Comprobación | Resultado |
|---|---|
| `node --check script.js` | Correcto, sin errores de sintaxis. |
| Auditoría estructural | `duplicateIds: []`, `missingIds: []`, `duplicateFunctions: []`, `missingAssets: []`, `missingSystems: []`. |
| Caché de `index.html` | `script.js?v=nayutaro-aura-mana-44`. |
| Inicio de partida | Overlay oculto, día `1`, controles funcionales. |
| FP sin N | Se mantuvo en `90` durante la espera de la prueba. |
| N sostenida | `CARGANDO · 49–51%`; FP subió lentamente a `105`. |
| Carga completa | `CARGANDO · 100%`. |
| Liberación | `ACTIVO · 5.8s`, con la explosión conservada. |
| Segunda carga | `CARGANDO · 12–13%` sin cooldown real. |
| Errores JavaScript | `errors: []` en todas las fases de la prueba headless. |
| Revisión visual | `nayutaro-aura-holding-44.png`: aura visible, centrada en el personaje y anclada a su base. |

La captura visual aislada utilizó ocultamiento temporal del overlay de derrota únicamente en el entorno de prueba; esa protección no forma parte del código entregable.
