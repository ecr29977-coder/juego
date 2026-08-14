# Validación — Animaciones fluidas del personaje principal

| Acción | FPS anterior | FPS actualizado |
|---|---:|---:|
| Reposo | 6 | 7 |
| Caminar | 10 | 12 |
| Correr | 14 | 16 |
| Ataque ligero | 10 | 14 |
| Ataque pesado | 9 | 12 |
| Lanzamiento | 12 | 14 |
| Daño | 10 | 12 |
| Muerte | 8 | 10 |

Las velocidades se ajustaron solamente dentro de `VAGABUNDO_ANIMS`. Los tiempos de daño, coste de FP, reutilización, habilidades, controles y estadísticas no fueron modificados.

## Prueba en navegador

La versión servida cargó el minijuego, HUD, canvas, personaje, enemigos, controles y botones de habilidades. Se verificaron inicio de partida, pausa, reanudación, pulsación de ataque y pantalla de muerte con checkpoint/regreso. El script servido contenía tanto la clave `jugador-principal` como el valor de carrera `fps:16`.

La supervivencia del día 1 terminó rápidamente durante las pruebas por el daño de enemigos ya configurado; no se identificó un error de interfaz, carga de assets ni sintaxis durante la observación.
