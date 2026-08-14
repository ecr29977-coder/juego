# Validación de controles corregidos — DRAKZETH

Esta revisión se realizó después de integrar el personaje principal basado en LPC muscular. Se comprobó que el renderizador LPC no bloquea el bucle de juego ni los controles de combate.

| Área verificada | Resultado |
|---|---|
| Inicio de partida y carga del personaje LPC | Correcto. El botón se habilita tras cargar las hojas obligatorias y el personaje se dibuja en el canvas. |
| Movimiento y combate básico | Correcto. Se validaron WASD, Espacio, Shift y Q. |
| Orientación de animaciones LPC | Corregido. El paquete usa filas `arriba, izquierda, abajo, derecha`; se actualizó el mapeo desde `[0,1,2,3,3,2,1,0]` a `[2,2,1,0,0,0,3,2]`, por lo que D/A/W/S ya muestran las poses laterales y verticales correspondientes. |
| Habilidades dracónicas | Correcto. Se validaron X, Z, V, G, B, M y N. |
| Consumibles, artes y definitiva | Correcto. Se validaron R/H, J y U; los requisitos de arma y enfriamiento muestran avisos claros. |
| Ejecución y habilidades lunares | Correcto. E, T y Y informan sus condiciones cuando no hay objetivo vulnerable o arma lunar equipada. |
| Armas y combo | Correcto. Se validaron las teclas 1–9 y el combo Lanza↔Ballesta con C. |
| Control táctil de combo | Corregido. Se añadió el botón `C · Combo` y se conectó con `toggleLanceBowCombo()`. |
| Movimiento táctil interrumpido | Corregido. Los controles direccionales ahora liberan la dirección en `touchcancel` y `mouseleave`, evitando que el personaje quede avanzando si la interacción se interrumpe. |

La versión de carga de JavaScript se actualizó a `script.js?v=lpc-direction-fix-1` para forzar la aplicación del nuevo mapeo en navegadores que conservaban la versión anterior en caché.

## Nota de uso

Algunas acciones son situacionales y no son errores si no se ejecutan de inmediato: J necesita un Bastón o Sello, T/Y requieren el Espadón Luna Negra, E necesita un enemigo vulnerable, y C necesita tener Lanza y Ballesta disponibles. La partida inicial incluye ambas armas necesarias para el combo.

La verificación visual se realizó en navegador con D, A, W y S, además de Space para comprobar que el ataque conserva la última orientación. La causa confirmada del síntoma era el orden incorrecto de filas en el adaptador LPC, no el movimiento del personaje.
