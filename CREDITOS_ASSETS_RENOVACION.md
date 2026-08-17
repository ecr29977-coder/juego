# Créditos de la renovación visual

Esta renovación utiliza una selección curada de los recursos proporcionados por el usuario. El personaje principal y los jefes de DRAKZETH se preservan; la única sustitución de jefe aplicada en esta entrega es el atlas animado de Radahn solicitado por el usuario.

## Recursos integrados

| Grupo | Uso en DRAKZETH |
|---|---|
| Tiny RPG Character Asset Pack Soldier & Orc | Enemigos comunes animados de soldado y orco. |
| Tiny RPG Character Asset Pack Demon & Blood Monster | Enemigos mágicos, sanadores, invocadores y variantes de sangre. |
| RPG Weapons / 64x64 weapons | Iconos de armas, HUD, recompensas y drops. |
| Free-Undead Tileset | Tile de suelo oscuro y atlas de mundo para futuras ampliaciones. |
| Free Top-Down Pixel Art Cave Objects | Atlas de objetos de cueva para decoración futura. |
| Gothic Items | Iconos de reliquias y drops. |
| Animation Pack / Fire / Holy / Thunder / Smear VFX | Impactos, cortes, fuego, magia, truenos y efectos de habilidades. |
| Super Pixel Effects Gigapack (Free Version) | Explosión épica seleccionada para Meteorito. |
| Free Pixel Effects Pack | Paquete analizado para futuras sustituciones y nuevas habilidades. |

## Créditos y licencias conocidas

El paquete Battlers incluido en el diagnóstico indica: “Free for use, just credit JosephSeraph”, y solicita conservar el README y el crédito correspondiente.

Los paquetes Cave Objects y Undead Tileset remiten a la licencia de CraftPix: https://craftpix.net/file-licenses/ . Antes de publicar o redistribuir el proyecto, debe conservarse la licencia aplicable y verificarse que el uso previsto sea compatible.

El README de `Fantast Weapons & Armor Collection Free` declara uso personal y comercial permitido, pero prohíbe la redistribución del paquete original. En el proyecto solo se usan copias transformadas/seleccionadas de sus imágenes para el sitio, no se redistribuye el ZIP original.

**Super Pixel Effects Gigapack (Free Version)**: Will Tice / unTied Games. La licencia permite uso comercial y no comercial dentro de un juego y requiere atribución en los créditos, pero no permite redistribuir el paquete como un asset pack independiente.

**Free Pixel Effects Pack**: Davit Masia / CodeManuPro. Su README indica dominio público, uso personal y comercial permitido y sin crédito obligatorio.

Los demás paquetes proporcionados no incluían una licencia legible en el material analizado. Deben considerarse recursos entregados por el usuario y conviene confirmar sus condiciones antes de publicar el repositorio.

## Elementos protegidos

No se modificaron `assets/drakzeth/player-lpc/`, las hojas LPC del personaje principal, las ilustraciones de los jefes distintos de Radahn, los identificadores `jefe-*`, `BOSS_INTROS`, las estadísticas de los jefes ni las mecánicas de combate. El archivo `radahn-animated-transparent.png` es la versión con alfa del atlas animado de Radahn integrado para evitar el fondo blanco del archivo fuente.

## Nayutaro Ichimonji

Se integró como enemigo común/táctico el atlas `nayutaro-atlas.png` y la tabla `nayutaro-animations.json` provenientes del paquete `nayutaro-phaser-minigame-kit.zip` proporcionado por el usuario. El README del paquete no especifica una licencia ni una atribución formal; por ello se conserva la procedencia del paquete y no se afirma una licencia que no esté documentada.


## Esferas de magia enemiga

Los atlas `enemy-magic-blue-strip.png` y `enemy-magic-elemental-strip.png` son versiones procesadas de las hojas `Firefly(31).png` y `Firefly(30).png` proporcionadas por el usuario. Se recortaron y organizaron para uso interno como animaciones de proyectiles normales de enemigos; no se redistribuyen las hojas fuente como paquete independiente. La conversación/proyecto no aporta una licencia legible para estas hojas, por lo que debe confirmarse su licencia antes de publicar o redistribuir el repositorio.


## Carga de maná y Corazón del Dragón

Los atlas `mana-charge-seal-strip.png` y `mana-charge-fire-strip.png` son versiones procesadas de `Firefly(32).png` y `Firefly(33).png`, proporcionadas por el usuario para el efecto de carga de maná. Se utilizan como hojas internas de animación con transparencia y no se redistribuyen las hojas fuente como paquete independiente. La conversación/proyecto no aporta una licencia legible para estos recursos, por lo que debe confirmarse su licencia antes de publicar o redistribuir el repositorio.


## Revisión de carga de maná · Firefly(36)

La versión actual utiliza exclusivamente `mana-charge-fire-strip.png`, normalizado desde `Firefly(36).png`, recurso proporcionado por el usuario para la animación de carga. Los atlas procesados anteriores del sello y la llama fueron retirados de esta versión para evitar mezclar secuencias visualmente incompatibles. La conversación/proyecto no aporta una licencia legible para Firefly(36); debe confirmarse su licencia antes de publicar o redistribuir el repositorio.


## Módulo independiente de aura de Nayutaro

El efecto de carga utiliza recursos derivados de `nayutaro-independent-aura-module.zip`, proporcionado por el usuario. La fuente de referencia se conserva fuera de la carpeta final del juego; en el proyecto se integra únicamente el recurso procesado `assets/drakzeth/renewal/fx/nayutaro-aura-strip.png`, un atlas horizontal RGBA de 17 celdas de 176×192 px. El strip normalizado se generó mediante el proceso `normalize_nayutaro_aura.py` para convertir los 17 cuadros del atlas original `nayutaro-aura-atlas.png` a celdas uniformes aptas para `CanvasRenderingContext2D`.

El código fuente de referencia del módulo se conserva en `inspect_nayutaro_aura_44/nayutaro-independent-aura-module/src/NayutaroIndependentAura.ts` para documentar los ciclos exterior, interior y naranja, así como el solapamiento de 500 ms. El proyecto no afirma una licencia formal para este módulo porque el paquete proporcionado no incluía una licencia legible; antes de publicar o redistribuir el repositorio debe confirmarse el permiso correspondiente con el autor o proveedor del recurso.

La integración en DRAKZETH utiliza el recurso únicamente como VFX de carga de FP. No modifica el personaje principal LPC, los sprites o la IA de los jefes, las estadísticas, las fases, las introducciones, los controles ni las mecánicas de combate existentes. La explosión de Corazón del Dragón se conserva como parte de la habilidad y no se atribuye al módulo de aura.
