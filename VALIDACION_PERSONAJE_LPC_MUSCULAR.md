# Validación — Personaje LPC muscular

El personaje principal se actualizó con el paquete ZIP proporcionado por el usuario. Sus recursos se encuentran en `assets/drakzeth/player-lpc/` y no dependen de CDNs ni de rutas externas.

| Elemento | Implementación |
|---|---|
| Formato | Hojas PNG RGBA de 832 × 256 px, 13 columnas × 4 filas, celdas de 64 × 64. |
| Reposo | `standard/idle.png`, 2 cuadros ocupados. |
| Caminar | `standard/walk.png`, 9 cuadros por dirección. |
| Correr | `standard/run.png`, 8 cuadros por dirección. |
| Ataque ligero | `standard/slash.png`, 6 cuadros por dirección. |
| Ataque pesado | `standard/1h_backslash.png`, 13 cuadros por dirección. |
| Lanzamiento mágico | `standard/spellcast.png`, 7 cuadros por dirección. |
| Daño | `standard/hurt.png`, 6 cuadros. |
| Estado final | `standard/jump.png`, 5 cuadros usados como animación de muerte compatible. |

El motor usa cuatro filas direccionales LPC y las refleja en ocho direcciones lógicas. El inicio de la partida exige que `idle.png` y `walk.png` estén cargados; si una acción opcional tarda, utiliza el `idle` LPC como respaldo, nunca el personaje anterior. Si las hojas esenciales fallan, el botón muestra un error explícito.

## Validación en navegador

La versión versionada del script cargó correctamente. El botón pasó de `CARGANDO PERSONAJE...` a `COMENZAR SUPERVIVENCIA`; después se inició la partida y el nuevo personaje muscular/alado apareció en el canvas. Se comprobó también un ataque con Espacio, HUD, postura, combo, mapa y controles existentes.

La ruta anterior del spritesheet vertical ya no participa en la selección del personaje principal. El paquete nuevo incluye sus créditos y metadata dentro de `assets/drakzeth/player-lpc/`.
