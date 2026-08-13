# DRAKZETH — Crónicas del Sello Carmesí

Esta versión reúne la página informativa y el minijuego de supervivencia bajo la nueva identidad visual **DRAKZETH**.

## Cambios integrados

| Área | Contenido |
|---|---|
| Identidad | Nombre DRAKZETH, logotipo tipográfico/sigiloso, textos y narrativa del Sello Carmesí. |
| Paleta | Sustitución del tratamiento dorado dominante por rojo sangre, carmesí oscuro y rosa ceniza. |
| Personajes | Seis ilustraciones nuevas con fondo blanco/cuadriculado eliminado en `assets/drakzeth/characters/`; los originales se conservan en `originales_con_fondo/`. |
| Mapas | Seis regiones nuevas en `assets/drakzeth/maps/`. |
| Jefes | Seis guardianes nuevos en `assets/drakzeth/bosses/`, con brillo carmesí reforzado al pasar el cursor, enfocar o seleccionar una tarjeta. |
| Cinemática | Video integrado sin fondo blanco visible en `assets/drakzeth/media/`. |
| Combate | Pack de armas, combo Lanza ↔ Ballesta, partículas, estelas, screen shake del Juicio Triple y habilidades del Sello Dracónico con daño en área. |

## Habilidades del Sello Dracónico

`X` activa **Rugido del Sello**, una explosión radial de 158 unidades que cuesta 24 FP, inflige daño a todos los enemigos cercanos, los interrumpe brevemente y produce anillos rúnicos, partículas y sacudida de cámara. `Z` activa **Aliento Carmesí**, un cono direccional de 245 unidades y aproximadamente 62 grados que cuesta 18 FP y dibuja una llamarada animada con ondas, runas y partículas.

Ambas habilidades tienen enfriamiento visible en el HUD, botones táctiles para móvil y una animación por frames dentro del canvas. El límite de partículas y de efectos simultáneos se mantiene controlado para conservar la fluidez del juego.

## Jefes con brillo por selección

Las tarjetas de jefes se mantienen oscuras de forma predeterminada. Al pasar el cursor, enfocarlas con el teclado o hacer clic sobre ellas, la ilustración aumenta su brillo, elimina la capa de mezcla oscura, se acerca levemente y recibe un resplandor carmesí. La selección por clic es persistente, y se puede desactivar seleccionando la misma tarjeta otra vez o eligiendo otra. También es accesible mediante `Tab` y `Enter` o `Espacio`.

## Personajes sin fondo

Los seis retratos —Aurelia, Kaelor, Morvane, Nysera, Solarys y Elyria— están guardados como PNG RGBA con el fondo blanco/cuadriculado retirado. La limpieza conserva las siluetas, detalles claros, armas y vestuario. Los archivos originales permanecen en `assets/drakzeth/characters/originales_con_fondo/` como respaldo.

## Video sin bordes blancos

La cinemática usa primero `cargando-draekzeth-transparente.webm`, con el blanco eliminado mediante canal alfa. También incluye `cargando-draekzeth-fallback.mp4`, ya compuesto sobre un fondo casi negro, para navegadores que no reproduzcan transparencia WebM. Ambos se cargan desde el elemento `video` de `index.html`.

## Abrir el proyecto

Abre `index.html` en un navegador moderno o sirve la carpeta con cualquier servidor estático. No requiere instalación ni compilación; todas las rutas son relativas.

## Controles del minijuego

`WASD` mueve al Errante, `Clic` o `Espacio` ataca, `Shift` esquiva, `Q` hace parry, `R` usa el frasco y `C` activa o desactiva el Enlace del Centinela. El combo alterna entre lanza y ballesta en cuatro pasos y termina con el Juicio Triple, que emite partículas, estelas, destello y sacudida de cámara.


## Expansión: Sello Carmesí

Esta versión añade un sistema de progresión y combate ampliado para el minijuego. El **Árbol del Sello Dracónico** se abre desde el HUD y utiliza fragmentos obtenidos al iniciar días y derrotar guardianes. Sus ramas son Colmillo, Ala y Ojo; incluyen mejoras de daño, área, control, protección, detonaciones de marcas, estelas y reinicio parcial de enfriamientos tras una ejecución. El panel permite además elegir la afinidad activa: Sangre recupera vida con habilidades, Luna congela, Sombra marca y Rayo encadena daño a un enemigo próximo.

La secuencia **Lanza → Ballesta → Aliento Carmesí** ahora tiene una sinergia real. La lanza aplica **Anclado** y ralentiza el avance del objetivo, la ballesta aplica **Marcado** y el Aliento detona las marcas para producir daño adicional y un efecto visual radial. El parry exitoso aplica **Vulnerable**, que aumenta el daño recibido y permite activar una ejecución cercana con la tecla `E`.

| Control | Acción |
|---|---|
| `X` | Rugido del Sello, daño circular y control de enemigos. |
| `Z` | Aliento Carmesí, daño en cono y detonación de marcas. |
| `E` | Ejecución sobre un enemigo vulnerable cercano. |
| `C` | Enlace del Centinela: alterna la cadena Lanza ↔ Ballesta. |
| `Mapa de regiones` | Abre las rutas desbloqueadas y permite seleccionar la región activa. |
| `Sello` | Abre el Árbol del Sello Dracónico y permite gastar fragmentos. |

Las rutas incluyen eventos aleatorios de altar, caravana, cofre maldito y grieta dracónica. Cada evento entrega una recompensa o plantea un coste; las **reliquias** y **maldiciones** se conservan durante la partida y modifican curación, velocidad, daño, fragmentos, marcas o enfriamientos. Las builds se muestran en el HUD y cambian según el arma, los atributos y la afinidad seleccionada.

Los seis guardianes cuentan con una pantalla de presentación y una segunda fase a mitad de vida. En esa fase la arena obtiene peligros propios —meteoritos, pétalos, rayos, extremidades, sangre o silencio— con señales visuales antes del impacto. Derrotar a un guardián desbloquea la siguiente ruta del mapa.


## Actualización de balance y habilidades avanzadas

Se añadieron cinco habilidades del Sello Dracónico además de Rugido y Aliento. `V` activa **Garra del Abismo** —14 FP y 100 cuadros de reutilización—; `G` activa **Vuelo de Ceniza** —22 FP y 180 cuadros—; `B` activa **Marea Carmesí** —28 FP y 300 cuadros—; `M` activa **Meteorito del Sello** —36 FP y 360 cuadros—; y `N` activa **Corazón del Dragón** —38 FP y 480 cuadros—. El Corazón aumenta temporalmente la velocidad, el daño y la protección del Errante. Rugido queda en 26 FP/240 cuadros y Aliento en 20 FP/145 cuadros. La estamina base aumentó y escala mejor con Resistencia.

El bestiario ahora incluye arqueros y oráculos de largo alcance con daño reducido, además de trolls y colosos con vida superior. Los enemigos grandes pueden entrar en **Enfurecimiento** al llegar a cero de vida: tienen una probabilidad individual de recuperar una parte de su vida, aumentar su velocidad y daño, y cambiar su aura. También pueden lanzar magia en ráfagas periódicas de aproximadamente cuatro segundos.

El mapa reutiliza árboles, arbustos, barriles, cofres, lápidas, altares, columnas y restos estructurales de `assets/`. También utiliza retratos de personajes como memoriales carmesíes de baja opacidad para aprovechar recursos existentes y enriquecer el escenario sin introducir una nueva dependencia gráfica.

## Expansión táctica del combate

Se incorporaron seis roles enemigos para cambiar prioridades de combate: **Guardianes del Sello** que mitigan ataques ligeros, **Invocadores** que levantan barreras temporales, **Asesinos de Ceniza** que alternan sigilo y ataque, **Bestias Embestidoras** que anuncian y ejecutan cargas rectas, **Sanadores Profanos** que recuperan la vida de aliados heridos y **Mímicos Dracónicos** que reproducen una versión reducida del último poder dracónico usado por el jugador. Estos roles se incorporan progresivamente desde el día 12 y se dibujan con una etiqueta, aura o señal propia.

Cada enemigo y jefe posee ahora una **barra de postura**. Los ataques ligeros, pesados, proyectiles, magia y poderes dracónicos desgastan esa barra. Al romperla, el objetivo queda inmovilizado y vulnerable, recibe una señal visual azul y puede ser ejecutado con `E` si el jugador se acerca. La postura de élites, enemigos grandes y jefes es mayor, pero también genera oportunidades tácticas más valiosas.

Todas las armas poseen una pasiva visible en el HUD. Entre ellas se encuentran sangrado para la Katana, rebote mágico del Bastón, marcas para Arco y Ballesta, anclaje con Lanza, cura al derrotar con Espada Blasfema, gran ruptura con Gran Espada y Martillo de Rubí, y barrera de parry para Escudo de Hierro.

El **Espadón Luna Negra** se vuelve elegible desde el día 18 y tiene una probabilidad mayor desde el día 34, por lo que es raro pero alcanzable. Además de su magia normal, desbloquea `T` para **Luna Fría**, una onda perforante que marca y daña postura, y `Y` para **Espada Astral**, un corte de área que ejerce presión alta de ruptura. Ambos poderes incluyen indicadores de coste y reutilización, teclas y botones táctiles.

La presentación del mapa conserva los assets existentes, pero aumenta el tamaño y opacidad de adornos, añade halo y sombra a las piezas y dibuja una retícula de losas con grietas carmesíes ligeras sobre el piso base.

## Furia reforzada y lluvia de meteoros

Desde el **día 12** pueden aparecer Trolls y Colosos. Si uno de estos enemigos llega a cero de vida y activa su probabilidad de furia, su vida máxima se duplica y su barra se rellena por completo. Mantiene el aumento de velocidad, daño, aura carmesí, partículas y aviso **¡ENFURECIDO!**.

Durante la furia, los Trolls lanzan oleadas de cuatro meteoros y los Colosos oleadas de seis. Cada lluvia muestra un anillo carmesí con líneas radiales antes de los impactos y utiliza los peligros de arena existentes para aplicar daño y sacudida de cámara. Las oleadas se repiten aproximadamente cada tres a tres punto seis segundos mientras el enemigo siga enfurecido.

## Revisión final de combate

La probabilidad de furia se elevó a aproximadamente **78% para Trolls** y **88% para Colosos**. Además, desde el día 4 se fuerza periódicamente un rol táctico para que la partida no dependa exclusivamente del azar; Guardianes, Invocadores, Asesinos, Embestidoras, Sanadores y Mímicos quedan visibles con etiquetas y señales de comportamiento.

El **Bastón Glintstone** obtiene `J — Aguja Glintstone`, un proyectil mágico de alta presión de postura. El **Sello Sagrado** obtiene `J — Círculo Consagrado`, una zona que marca, daña y desgasta postura. La definitiva general del Errante es `U — Apoteosis del Sello`: recupera FP y estamina, otorga protección e invulnerabilidad breve, daña en área y aplica vulnerabilidad/ruptura; tiene un enfriamiento de **90 segundos**.

Al morir, la partida ya no obliga a comenzar de nuevo. La pantalla ofrece regresar al último checkpoint disponible —mostrando su día— o regresar al inicio para comenzar otra partida. Si no existe checkpoint, la primera opción queda desactivada.

## Jefes colosales

Los seis guardianes son ahora claramente más grandes que Trolls y Colosos: su radio se multiplica por **2.35**, su vida base por **12** y su daño base por **2** antes de aplicar la progresión de día existente. La Fase II solo suma un aumento moderado de velocidad y daño, pero abre una ventana de vulnerabilidad más amplia al iniciar para que la transición premie al jugador.

Cada jefe activa una habilidad exclusiva en la Fase II. Kaelgor usa **Quebrantacielos**, Aurelia usa **Réquiem de Pétalos**, Morvane crea una **Retícula de Tormenta** con carril central seguro, Varkun invoca una **Jaula Hemática** con una abertura de escape, Ser Oryx lanza la **Marcha de Ceniza** en línea y Tharos ejecuta la **Caída de la Corona**. Las habilidades tienen telegráficos, nombres visibles, límites de peligros activos y enfriamientos de aproximadamente 3.8 a 4.7 segundos; el contacto directo de los jefes también tiene una reutilización más larga para evitar golpes encadenados inevitables.
