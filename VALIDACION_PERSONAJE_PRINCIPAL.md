# Validación — Personaje principal actualizado

El personaje principal de DRAKZETH fue sustituido por el spritesheet proporcionado, almacenado como `assets/drakzeth/characters/jugador-principal-drakzeth.png`.

| Verificación | Resultado |
|---|---|
| Archivo de personaje | PNG RGBA presente, 1536 × 5248 px. |
| Transparencia | Canal alfa válido (`0–255`); el personaje no requiere eliminar un fondo incrustado. |
| Adaptador de atlas | `VAGABUNDO_ANIMS` usa rectángulos normalizados para las filas irregulares del archivo. |
| Acciones conectadas | Reposo, caminar, correr, ataque ligero, ataque pesado, lanzamiento, daño y muerte. |
| Hoja de contacto | Las regiones seleccionadas contienen cuadros visibles del nuevo personaje; no se detectaron rectángulos vacíos. |
| Mecánicas preservadas | Armas, habilidades, pasivas, definitiva, controles, estadísticas y efectos continúan separados del dibujo del cuerpo. |
| Sintaxis | `node --check script.js` aprobado. |

La fuente es un atlas irregular, por lo que el adaptador usa bandas concretas en lugar de asumir celdas uniformes de 200 × 200.

## Corrección definitiva

Se eliminó el fallback que podía devolver `assets/vagabundo-sprite-pack/body-idle.png`. Tanto la ruta genérica `jugador` como `jugador-principal` apuntan ahora al atlas nuevo. El botón de inicio comienza deshabilitado con `CARGANDO PERSONAJE...` y solo se habilita cuando `jugador-principal` termina de cargar. Si la imagen falla, se muestra un aviso explícito en vez de volver silenciosamente al personaje antiguo.
