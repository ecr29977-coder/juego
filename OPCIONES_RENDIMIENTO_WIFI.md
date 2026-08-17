# Opciones de rendimiento de DRAKZETH: Wi‑Fi frente a Ethernet

El proyecto actual contiene aproximadamente 296 MB de recursos. Esa cantidad puede hacer que el primer acceso por Wi‑Fi tarde más o que algunas imágenes lleguen tarde al navegador. Sin embargo, una vez que los assets terminaron de cargarse, la conexión ya no debería determinar los FPS del canvas: si el juego sigue entrecortándose con todos los recursos cargados, el problema es de renderizado, CPU/GPU o memoria, no de la red.

| Opción | Qué resuelve | Compatibilidad con `index.html` directo | Prioridad |
|---|---|---:|---:|
| **Carga diferida de assets** | Reduce el tiempo inicial porque solo carga personaje, mapa activo, HUD y enemigos necesarios; deja fondos y jefes para cuando se necesiten. | **Sí** | **Muy alta** |
| **WebP/AVIF selectivo** | Reduce el tamaño de los PNG grandes y el tiempo de descarga. Se debe conservar un fallback PNG para navegadores problemáticos. | **Sí** | **Muy alta** |
| **Optimización de PNG** | Reduce peso sin cambiar el formato; es segura para sprites con alfa, aunque el ahorro depende de cuánto ya estén comprimidos. | **Sí** | Alta |
| **GitHub Pages** | Sirve el sitio por HTTPS desde una infraestructura estática más estable que abrirlo desde una carpeta local o un servidor doméstico. | Se usa con URL publicada | Alta |
| **Service Worker** | Guarda los assets después del primer acceso y hace muy rápidas las sesiones posteriores. | **No directamente con `file://`**; requiere HTTPS o un servidor local | Media-alta |
| **Modo de rendimiento** | Reduce partículas, VFX simultáneos y adornos para mejorar FPS en equipos modestos. | **Sí**; ya existe en el menú de pausa | Alta si el problema continúa después de cargar |

## Recomendación

La solución más segura para este proyecto es aplicar primero **carga diferida** y **conversión selectiva de los assets más pesados a WebP**, manteniendo las rutas relativas y un fallback PNG. Después conviene subir la carpeta a **GitHub Pages**. Si se quiere conservar caché persistente avanzada, se puede añadir un Service Worker, pero solamente en la versión servida por HTTPS; al abrir `index.html` directamente mediante `file://`, los navegadores bloquean el registro del Service Worker por seguridad.

## Diagnóstico práctico

Si el juego tarda en mostrar al personaje, aparecen imágenes vacías o el primer combate se congela mientras se descargan recursos, el síntoma es principalmente de **carga de red** y las opciones anteriores ayudan. Si los recursos ya están visibles pero el movimiento se siente lento, reducir la cantidad de enemigos, activar el modo de rendimiento y limitar VFX simultáneos tendrá más efecto que cambiar de Wi‑Fi a Ethernet.

La implementación futura debe medirse en tres momentos: tiempo hasta que el botón `COMENZAR SUPERVIVENCIA` queda habilitado, tiempo hasta el primer frame jugable y FPS durante el combate con 20 enemigos. Así se evita atribuir a la red un problema que en realidad sea de renderizado.
