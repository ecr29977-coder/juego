# Paquete de armas animadas — Dark Fantasy

Este paquete incorpora seis armas pixel-art originales de fantasía oscura para el personaje **Tarnished** del minijuego.

| ID del juego | Arma | Directorio |
|---|---|---|
| `espadalarga` | Juramento de Ceniza | `espadalarga/` |
| `lanza` | Pica del Centinela | `lanza/` |
| `daga` | Misericordia Carmesí | `daga/` |
| `ballesta` | Ballesta de la Torre Caída | `ballesta/` |
| `arco` | Arco del Roble Fúnebre | `arco/` |
| `granespada` | Coloso del Crisol | `granespada/` |

Cada arma incluye **21 acciones animadas**: `idle`, `walk`, `run`, `attack-light`, `attack-heavy`, `attack-charged`, `attack-air`, `block`, `dodge`, `cast`, `hit`, `stagger`, `death`, `respawn`, `interact`, `pickup`, `use-item`, `open-chest`, `emote`, `burn` y `freeze`.

## Formato

Cada hoja de sprites es un PNG RGBA de **1200×1600 px**, con una cuadrícula de **8 direcciones × 6 cuadros**. Cada celda mide **200×200 px** y las filas siguen el orden: S, SW, W, NW, N, NE, E y SE. El formato es compatible con el renderizador actual del personaje.

## Integración

`script.js` ya incluye las rutas y la selección automática de las animaciones de este paquete. Al usar los identificadores anteriores en el catálogo `WEAPONS`, el juego carga la acción correspondiente y, si una imagen todavía está cargando, recurre temporalmente al estado `idle`.

## Enlace del Centinela: Lanza ↔ Ballesta

El modo se activa y desactiva con la tecla `C`. Mientras está activo, cada ataque encadenado dentro de una ventana de 1,3 segundos cambia el arma y ejecuta esta secuencia: **Embestida de lanza**, **Disparo veloz de ballesta**, **Barrido perforante de lanza** y **Juicio triple de ballesta**. La selección manual con las teclas `1–9` cancela el modo sin retirar las dos armas del inventario inicial.

## Remate visual de Juicio Triple

El cuarto paso emite chispas doradas y cian al dispararse, deja estelas luminosas en los tres virotes y genera una explosión compacta de partículas al impactar. También activa un destello cálido y una sacudida de cámara amortiguada durante 12 cuadros. El efecto respeta el ajuste de pantalla `settings.shake` y limita el sistema a 96 partículas simultáneas.

## Contenido adicional

El subdirectorio `bases/` contiene las seis piezas originales aisladas con transparencia limpia. `manifest.json` contiene el catálogo técnico completo del paquete.
