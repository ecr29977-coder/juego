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
