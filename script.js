/* =========================================================
   DRAKZETH — CRÓNICAS DEL SELLO CARMESÍ
   JavaScript completo: página + minijuego definitivo + quiz + calculadora
   ========================================================= */

/* =========================================================
   BLOQUE A — Comportamiento de la página
   ========================================================= */
(function(){
  "use strict";

  var navToggle = document.getElementById('navToggle');
  var navLista = document.getElementById('navLista');
  if(navToggle && navLista) {
    navToggle.addEventListener('click', function(){
      var abierto = navLista.classList.toggle('abierto');
      navToggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
    navLista.querySelectorAll('a').forEach(function(enlace){
      enlace.addEventListener('click', function(){
        navLista.classList.remove('abierto');
        navToggle.setAttribute('aria-expanded','false');
      });
    });
  }

  var nav = document.getElementById('navPrincipal');
  if(nav) {
    window.addEventListener('scroll', function(){
      nav.classList.toggle('nav--fija', window.scrollY > 40);
    }, {passive:true});
  }

  var heroFondo = document.getElementById('heroFondo');
  if(heroFondo) {
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      if(y < window.innerHeight){
        heroFondo.style.transform = 'translateY(' + (y*0.25) + 'px) scale(1.05)';
      }
    }, {passive:true});
  }

  var contenedorParticulas = document.getElementById('heroParticulas');
  if(contenedorParticulas) {
    for(var i=0;i<34;i++){
      var p = document.createElement('span');
      p.className = 'particula';
      p.style.left = (Math.random()*100) + '%';
      p.style.bottom = '-10px';
      var tam = 1.5 + Math.random()*2.5;
      p.style.width = tam + 'px';
      p.style.height = tam + 'px';
      p.style.animationDuration = (9 + Math.random()*12) + 's';
      p.style.animationDelay = (Math.random()*14) + 's';
      contenedorParticulas.appendChild(p);
    }
  }

  var elementosReveal = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && elementosReveal.length) {
    var observador = new IntersectionObserver(function(entradas){
      entradas.forEach(function(entrada){
        if(entrada.isIntersecting){
          entrada.target.classList.add('visible');
          observador.unobserve(entrada.target);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -50px 0px'});
    elementosReveal.forEach(function(el){ observador.observe(el); });
  } else if(elementosReveal.length) {
    elementosReveal.forEach(function(el){ el.classList.add('visible'); });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function(enlace){
    enlace.addEventListener('click', function(evento){
      var destino = document.querySelector(enlace.getAttribute('href'));
      if(!destino) return;
      evento.preventDefault();
      var offset = destino.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({top: offset, behavior:'smooth'});
    });
  });

  var tarjetasJefe = document.querySelectorAll('.jefes-grid .jefe');
  if(tarjetasJefe.length) {
    tarjetasJefe.forEach(function(tarjeta){
      tarjeta.setAttribute('role','button');
      tarjeta.setAttribute('tabindex','0');
      tarjeta.setAttribute('aria-pressed','false');
      function seleccionarJefe(){
        var estabaSeleccionado = tarjeta.classList.contains('jefe--seleccionado');
        tarjetasJefe.forEach(function(otra){
          otra.classList.remove('jefe--seleccionado');
          otra.setAttribute('aria-pressed','false');
        });
        if(!estabaSeleccionado){
          tarjeta.classList.add('jefe--seleccionado');
          tarjeta.setAttribute('aria-pressed','true');
        }
      }
      tarjeta.addEventListener('click', seleccionarJefe);
      tarjeta.addEventListener('keydown', function(evento){
        if(evento.key === 'Enter' || evento.key === ' '){
          evento.preventDefault();
          seleccionarJefe();
        }
      });
    });
  }

  var volverArriba = document.getElementById('volverArriba');
  if(volverArriba) {
    window.addEventListener('scroll', function(){
      volverArriba.classList.toggle('visible', window.scrollY > 500);
    }, {passive:true});
    volverArriba.addEventListener('click', function(){
      window.scrollTo({top: 0, behavior: 'smooth'});
    });
  }
})();

/* =========================================================
   BLOQUE B — MINIJUEGO DEFINITIVO
   ========================================================= */
(function(){
  "use strict";
  const canvas = document.getElementById('gameCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width, H = canvas.height;

  // ========== CONFIG ==========
  const MAP_W = 2000, MAP_H = 2000;
  const EARLY_DAY_SECONDS = 60;  // Días 1–10: 1 minuto
  const LATE_DAY_SECONDS = 150;  // Desde el día 11: 2 minutos 30 segundos
  const TOTAL_DAYS = 66;
  const BOSS_EVERY = 11;
  const MAX_ACTIVE_ENEMIES = 20;
  const LUCKY_PCT = 0.03;
  const MANA_CHARGE_FRAMES = 180; // 3 s para una carga completa
  const MANA_CHARGE_FP_PER_FRAME = 0.16; // recuperación deliberadamente lenta

  // ========== SPRITES ==========
  const sprites = {};
  let mainPlayerSpriteReady = false;
  let mainPlayerSpriteError = false;
  window.sprites = sprites;
  const RUTAS = {
    'jugador': 'assets/drakzeth/player-lpc/standard/idle.png',
    'jugador-principal': 'assets/drakzeth/player-lpc/standard/idle.png',
    'jugador-principal-idle': 'assets/drakzeth/player-lpc/standard/idle.png',
    'jugador-principal-walk': 'assets/drakzeth/player-lpc/standard/walk.png',
    'jugador-principal-run': 'assets/drakzeth/player-lpc/standard/run.png',
    'jugador-principal-attack-light': 'assets/drakzeth/player-lpc/standard/slash.png',
    'jugador-principal-attack-heavy': 'assets/drakzeth/player-lpc/standard/1h_backslash.png',
    'jugador-principal-cast': 'assets/drakzeth/player-lpc/standard/spellcast.png',
    'jugador-principal-hit': 'assets/drakzeth/player-lpc/standard/hurt.png',
    'jugador-principal-death': 'assets/drakzeth/player-lpc/standard/jump.png',
    'jugador-idle': 'assets/vagabundo-sprite-pack/body-idle.png',
    'jugador-walk': 'assets/vagabundo-sprite-pack/body-walk.png',
    'jugador-run': 'assets/vagabundo-sprite-pack/body-run.png',
    'jugador-attack-light': 'assets/vagabundo-sprite-pack/body-attack-light.png',
    'jugador-attack-heavy': 'assets/vagabundo-sprite-pack/body-attack-heavy.png',
    'jugador-cast': 'assets/vagabundo-sprite-pack/body-cast.png',
    'jugador-hit': 'assets/vagabundo-sprite-pack/body-hit.png',
    'jugador-death': 'assets/vagabundo-sprite-pack/body-death.png',
    'jefe-malenia': 'assets/malenia.png',
    'jefe-godrick': 'assets/godrick.png',
    'jefe-radahn': 'assets/radahn.png',
    'jefe-rennala': 'assets/rennala.png',
    'jefe-maliketh': 'assets/maliketh.png',
    'jefe-maliketh2': 'assets/maliketh-fase2.png',
    'jefe-radahn-animated': 'assets/drakzeth/bosses/radahn-animated-transparent.png',
    'nayutaro-atlas': 'assets/drakzeth/renewal/enemies/nayutaro/nayutaro-atlas.png',
    'ene-soldado': 'assets/enemigo-soldado.png',
    'ene-caballero': 'assets/enemigo-caballero.png',
    'ene-lobo': 'assets/enemigo-lobo.png',
    'ene-troll': 'assets/enemigo-troll.png',
    'ene-espiritu': 'assets/enemigo-espiritu.png',
    'efecto-sangre': 'assets/sangre.png',
    'efecto-humo': 'assets/humo.png',
    'efecto-fuego': 'assets/fuego.png',
    'efecto-aura': 'assets/efecto-aura-jefe.png',
    'efecto-destello': 'assets/efecto-destello-ataque.png',
    'suelo': 'assets/elden-texture-pack/suelo/suelo-adoquin-humedo.png',
    'suelo2': 'assets/elden-texture-pack/suelo/suelo-pasto-seco.png'
  };

  // Capas de armas añadidas sin alterar las rutas ni los sprites existentes.
  // Las armas ultimate usan una hoja común de 8 direcciones x 6 frames.
  // Ríos de Sangre usa hojas por acción para conservar todas sus animaciones.
  const ULTIMATE_WEAPON_FILES = {
    riosdesangre: 'ultimate-riosdesangre.png',
    espadablasfema: 'ultimate-espadablasfema.png',
    espadonluna: 'ultimate-espadonluna.png',
    granespada: 'ultimate-granespadaradahn.png',
    baston: 'ultimate-bastonlucidez.png'
  };
  const RIOS_WEAPON_ACTIONS = [
    'idle','walk','run','attack-light','attack-heavy','attack-charged','attack-air',
    'block','dodge','cast','hit','stagger','death','respawn','interact','pickup',
    'use-item','open-chest','emote','burn','freeze'
  ];
  // Paquete original de armas detalladas: 8 direcciones × 6 cuadros para cada acción.
  const DARK_FANTASY_WEAPON_IDS = ['espadalarga','lanza','daga','ballesta','arco','granespada'];
  Object.keys(ULTIMATE_WEAPON_FILES).forEach(function(id){
    RUTAS['weapon-'+id] = 'assets/vagabundo-weapons-ultimate/'+ULTIMATE_WEAPON_FILES[id];
  });
  RIOS_WEAPON_ACTIONS.forEach(function(action){
    RUTAS['weapon-riosdesangre-'+action] = 'assets/vagabundo-riosdesangre-replacement/riosdesangre-'+action+'.png';
  });
  DARK_FANTASY_WEAPON_IDS.forEach(function(id){
    RIOS_WEAPON_ACTIONS.forEach(function(action){
      RUTAS['weapon-'+id+'-'+action] = 'assets/vagabundo-weapons-dark-fantasy/'+id+'/'+id+'-'+action+'.png';
    });
  });
  RUTAS['weapon-riosdesangre-fallback'] = 'assets/vagabundo-weapons-ultimate/ultimate-riosdesangre.png';
  RUTAS['fx-riosdesangre-slash'] = 'assets/vagabundo-riosdesangre-replacement/fx-riosdesangre-slash.png';

  // Renovación visual curada: no altera al jugador LPC ni a los jefes.
  const RENEWAL_WEAPON_IDS = ['espadalarga','katana','granespada','daga','lanza','arco','ballesta','baston','sello','riosdesangre','colmillosabueso','espadablasfema','espadonluna','martillorubi','escudo'];
  RENEWAL_WEAPON_IDS.forEach(function(id){ RUTAS['renewal-weapon-'+id] = 'assets/drakzeth/renewal/ui/'+id+'.png'; });
  const RENEWAL_ENEMY_IDS = ['soldier','orc','demon','bloodmonster'];
  const RENEWAL_ENEMY_ACTIONS = ['Idle','Walk','Attack01','Attack02','Hurt','Death'];
  RENEWAL_ENEMY_IDS.forEach(function(id){ RENEWAL_ENEMY_ACTIONS.forEach(function(action){ RUTAS['renewal-enemy-'+id+'-'+action] = 'assets/drakzeth/renewal/enemies/'+id+'-'+action+'.png'; }); });
  const RENEWAL_FX_FILES = {
    hit:'assets/drakzeth/renewal/fx/hit-effect-strip.png',
    explosion:'assets/drakzeth/renewal/fx/explosion-effect-strip.png',
    fire:'assets/drakzeth/renewal/fx/fire-explosion-strip.png',
    smear:'assets/drakzeth/renewal/fx/smear-horizontal.png',
    smearV:'assets/drakzeth/renewal/fx/smear-vertical.png',
    holy:'assets/drakzeth/renewal/fx/holy-repeatable-strip.png',
    thunder:'assets/drakzeth/renewal/fx/thunder-strike-strip.png',
    thunderAlt:'assets/drakzeth/renewal/fx/thunder-strip.png',
    meteorExplosion:'assets/drakzeth/renewal/fx/meteor-epic-002.png',
    meteorBlue:'assets/drakzeth/renewal/fx/meteor-blue-strip.png',
    crystal:'assets/drakzeth/renewal/fx/crystal-strip.png',
    auraMarea:'assets/drakzeth/renewal/fx/aura-marea-38.png',
    tideBlue:'assets/drakzeth/renewal/fx/tide-blue-growth-strip.png',
    tideCyan:'assets/drakzeth/renewal/fx/tide-cyan-orb-strip.png',
    tideRed:'assets/drakzeth/renewal/fx/tide-red-phase-strip.png',
    mirror:'assets/drakzeth/renewal/fx/magic-mirror-strip.png',
    projectile:'assets/drakzeth/renewal/fx/projectile-strip.png',
    smoke:'assets/drakzeth/renewal/fx/smoke-frame.png',
    apotheosisViolet:'assets/drakzeth/renewal/fx/apotheosis-violet-strip.png',
    enemyMagicBlue:'assets/drakzeth/renewal/fx/enemy-magic-blue-strip.png',
    enemyMagicElemental:'assets/drakzeth/renewal/fx/enemy-magic-elemental-strip.png',
    nayutaroAura:'assets/drakzeth/renewal/fx/nayutaro-aura-strip.png'
  };
  Object.keys(RENEWAL_FX_FILES).forEach(function(id){ RUTAS['renewal-fx-'+id] = RENEWAL_FX_FILES[id]; });
  const HOLY_ULTIMATE_FILES = [
    'assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-01.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-02.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-03.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-04.png',
    'assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-05.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-06.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-07.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-08.png',
    'assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-09.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-10.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-11.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-12.png',
    'assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-13.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-14.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-15.png','assets/drakzeth/renewal/fx/holy-ultimate/holy-ultimate-16.png'
  ];
  HOLY_ULTIMATE_FILES.forEach(function(path,i){ RUTAS['holy-ultimate-'+String(i+1).padStart(2,'0')] = path; });
  RUTAS['renewal-world-ground'] = 'assets/drakzeth/renewal/world/undead-ground-atlas.png';
  RUTAS['renewal-ground-tile'] = 'assets/drakzeth/renewal/world/ground-tile.png';
  RUTAS['renewal-world-cave'] = 'assets/drakzeth/renewal/world/cave-objects-atlas.png';
  RUTAS['renewal-world-objects'] = 'assets/drakzeth/renewal/world/undead-objects-atlas.png';

  // Atlas LPC muscular: cada acción es una hoja de 64×64 con 13 columnas y 4 direcciones.
  // Se usan solo los cuadros ocupados confirmados del ZIP nuevo.
  const VAGABUNDO_ANIMS = {
    idle: { key:'jugador-principal-idle', columns:2, fps:7, lpc:true, sourceW:64, sourceH:64 },
    walk: { key:'jugador-principal-walk', columns:9, fps:12, lpc:true, sourceW:64, sourceH:64 },
    run: { key:'jugador-principal-run', columns:8, fps:16, lpc:true, sourceW:64, sourceH:64 },
    'attack-light': { key:'jugador-principal-attack-light', columns:6, fps:14, lpc:true, sourceW:64, sourceH:64 },
    'attack-heavy': { key:'jugador-principal-attack-heavy', columns:13, fps:12, lpc:true, sourceW:64, sourceH:64 },
    cast: { key:'jugador-principal-cast', columns:7, fps:14, lpc:true, sourceW:64, sourceH:64 },
    hit: { key:'jugador-principal-hit', columns:6, fps:12, lpc:true, sourceW:64, sourceH:64 },
    death: { key:'jugador-principal-death', columns:5, fps:10, lpc:true, sourceW:64, sourceH:64 }
  };
  const MAIN_PLAYER_KEYS = Object.keys(VAGABUNDO_ANIMS).map(function(action){ return VAGABUNDO_ANIMS[action].key; });
  const MAIN_PLAYER_REQUIRED_KEYS = ['jugador-principal-idle','jugador-principal-walk'];
    // LPC estándar: filas físicas en orden arriba, izquierda, abajo, derecha.
  // El movimiento lógico usa 8 sectores, aproximando diagonales a la cardinal más cercana.
  const LPC_DIRECTION_ROWS = [2,2,1,0,0,0,3,2];
  function vagabundoDirectionRow(x, y){
    if(y > 0.35) return x < -0.35 ? 1 : x > 0.35 ? 7 : 0;
    if(y < -0.35) return x < -0.35 ? 3 : x > 0.35 ? 5 : 4;
    return x < 0 ? 2 : 6;
  }

  function drawVagabundo(x, y, bob){
    const playerAnim = player && player.anim && VAGABUNDO_ANIMS[player.anim] ? player.anim : 'idle';
    const spec = VAGABUNDO_ANIMS[playerAnim];
    const loadedActionImg = spr(spec.key);
    const img = loadedActionImg || spr(VAGABUNDO_ANIMS.idle.key);
    const renderSpec = loadedActionImg ? spec : VAGABUNDO_ANIMS.idle;
    if(!img){
      ctx.save(); ctx.fillStyle=mainPlayerSpriteError?'#7f1d35':'#ff8294'; ctx.strokeStyle='#ffd1d8'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(x,y-13,9,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.fillRect(x-9,y-4,18,25); ctx.restore();
      return true;
    }
    const start = player && Number.isFinite(player.animStart) ? player.animStart : animT;
    const frameDuration = Math.max(1, Math.round(60 / renderSpec.fps));
    const elapsed = playerAnim === 'idle' ? animT : Math.max(0, animT - start);
    const frame = Math.min(renderSpec.columns - 1, Math.floor(elapsed / frameDuration) % renderSpec.columns);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if(renderSpec.lpc){
      const rawRow = player && Number.isFinite(player.dirRow) ? player.dirRow : 6;
      const availableRows=Math.max(1,Math.floor((img.naturalHeight||renderSpec.sourceH)/renderSpec.sourceH));
      const logicalRow=LPC_DIRECTION_ROWS[Math.max(0, Math.min(7, rawRow))];
      const row=availableRows>1 ? Math.min(availableRows-1,logicalRow) : 0;
      ctx.drawImage(img, frame*renderSpec.sourceW, row*renderSpec.sourceH, renderSpec.sourceW, renderSpec.sourceH, x - 38, y + bob - 38, 76, 76);
    } else if(renderSpec.atlas){
      const sx=renderSpec.startX + frame*renderSpec.stepX, sy=renderSpec.startY;
      ctx.drawImage(img, sx, sy, renderSpec.sourceW, renderSpec.sourceH, x - 38, y + bob - 38, 76, 76);
    } else {
      const row = player && Number.isFinite(player.dirRow) ? player.dirRow : 6;
      ctx.drawImage(img, frame * 200, row * 200, 200, 200, x - 32, y + bob - 32, 64, 64);
    }
    ctx.restore();
    return true;
  }

  const WEAPON_ANIM_SPECS = {
    idle: { columns:6, fps:6 },
    walk: { columns:6, fps:10 },
    run: { columns:6, fps:14 },
    'attack-light': { columns:6, fps:14 },
    'attack-heavy': { columns:6, fps:12 },
    'attack-charged': { columns:6, fps:10 },
    'attack-air': { columns:6, fps:12 },
    block: { columns:6, fps:10 },
    dodge: { columns:6, fps:14 },
    cast: { columns:6, fps:12 },
    hit: { columns:6, fps:10 },
    stagger: { columns:6, fps:8 },
    death: { columns:6, fps:8 },
    respawn: { columns:6, fps:8 },
    interact: { columns:6, fps:8 },
    pickup: { columns:6, fps:8 },
    'use-item': { columns:6, fps:8 },
    'open-chest': { columns:6, fps:8 },
    emote: { columns:6, fps:8 },
    burn: { columns:6, fps:8 },
    freeze: { columns:6, fps:8 }
  };

  function weaponActionForPlayer(){
    if(!player) return 'idle';
    if(player.isDodging) return 'dodge';
    if(player.isParrying) return 'block';
    return WEAPON_ANIM_SPECS[player.anim] ? player.anim : 'idle';
  }

  function weaponSpriteKey(id, action){
    if(id === 'riosdesangre'){
      const key = 'weapon-riosdesangre-'+action;
      return sprites[key] ? key : 'weapon-riosdesangre-fallback';
    }
    if(DARK_FANTASY_WEAPON_IDS.indexOf(id) >= 0){
      const key = 'weapon-'+id+'-'+action;
      const idle = 'weapon-'+id+'-idle';
      return sprites[key] ? key : (sprites[idle] ? idle : null);
    }
    return ULTIMATE_WEAPON_FILES[id] ? 'weapon-'+id : null;
  }

  const RENEWAL_WEAPON_HAND_PROFILES = {
    espadalarga:{size:126,grip:.22,angle:0}, katana:{size:122,grip:.22,angle:0}, riosdesangre:{size:126,grip:.22,angle:0},
    daga:{size:96,grip:.18,angle:0}, lanza:{size:148,grip:.28,angle:0}, arco:{size:118,grip:.05,angle:-.16}, ballesta:{size:112,grip:.06,angle:-.12},
    granespada:{size:156,grip:.27,angle:0}, espadonluna:{size:154,grip:.27,angle:0}, martillorubi:{size:142,grip:.2,angle:0},
    colmillosabueso:{size:132,grip:.24,angle:0}, espadablasfema:{size:138,grip:.24,angle:0}, baston:{size:126,grip:.22,angle:0}, sello:{size:106,grip:.1,angle:0}, escudo:{size:112,grip:.02,angle:0}
  };
  function drawRenewalWeaponIcon(x, y, bob){
    if(!player) return false;
    const id=player.weapon, img=spr('renewal-weapon-'+id);
    if(!img) return false;
    const action=weaponActionForPlayer();
    const rawRow=Number.isFinite(player.dirRow) ? Math.max(0,Math.min(7,player.dirRow)) : 6;
    // El índice lógico del movimiento es: abajo, abajo-izquierda, izquierda, arriba-izquierda, arriba, arriba-derecha, derecha, abajo-derecha.
    const dirAngles=[Math.PI/2,3*Math.PI/4,Math.PI,-3*Math.PI/4,-Math.PI/2,-Math.PI/4,0,Math.PI/4];
    const dirAngle=dirAngles[rawRow];
    const start=Number.isFinite(player.animStart) ? player.animStart : animT;
    const elapsed=Math.max(0,animT-start);
    const attackAction=action.indexOf('attack')===0 || action==='cast';
    const progress=attackAction ? Math.min(1,elapsed/22) : 0;
    const swing=attackAction ? Math.sin(progress*Math.PI)*0.52 : Math.sin(animT*.08)*.035;
    const w=getWeapon();
    const profile=RENEWAL_WEAPON_HAND_PROFILES[id]||{size:116,grip:.22,angle:0};
    const size=action==='cast' ? Math.max(profile.size,120) : (attackAction ? Math.max(profile.size,profile.size+14) : profile.size);
    // Mano aproximada dentro del cuadro LPC; el centro del icono se adelanta según su largo para que el mango quede en la mano.
    const handDistance=id==='escudo'?8:16;
    const handX=x+Math.cos(dirAngle)*handDistance;
    const handY=y+bob+Math.sin(dirAngle)*handDistance;
    const centerDistance=size*profile.grip;
    ctx.save();
    ctx.imageSmoothingEnabled=false;
    ctx.translate(handX+Math.cos(dirAngle)*centerDistance,handY+Math.sin(dirAngle)*centerDistance);
    ctx.rotate(dirAngle+Math.PI/2+profile.angle+swing);
    ctx.globalAlpha=.96;
    ctx.shadowColor=(w&&w.color)||'#ff4f70'; ctx.shadowBlur=action==='cast'?9:4;
    ctx.drawImage(img,-size/2,-size/2,size,size);
    ctx.restore();
    return true;
  }

  function drawWeapon(x, y, bob){
    if(drawRenewalWeaponIcon(x,y,bob)) return true;
    if(!player) return false;
    const action = weaponActionForPlayer();
    const spec = WEAPON_ANIM_SPECS[action] || WEAPON_ANIM_SPECS.idle;
    const key = weaponSpriteKey(player.weapon, action);
    const img = key ? spr(key) : null;
    if(!img) return false;
    const row = player && Number.isFinite(player.dirRow) ? player.dirRow : 6;
    const start = player && Number.isFinite(player.animStart) ? player.animStart : animT;
    const frameDuration = Math.max(1, Math.round(60 / spec.fps));
    const elapsed = action === 'idle' ? animT : Math.max(0, animT - start);
    const frame = Math.min(spec.columns - 1, Math.floor(elapsed / frameDuration) % spec.columns);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, frame * 200, row * 200, 200, 200, x - 32, y + bob - 32, 64, 64);
    ctx.restore();
    return true;
  }

  function drawWeaponSlash(x, y){
    if(!player || player.weapon !== 'riosdesangre') return false;
    const img = spr('fx-riosdesangre-slash');
    if(!img) return false;
    const action = weaponActionForPlayer();
    if(action !== 'attack-light' && action !== 'attack-heavy' && action !== 'attack-charged' && action !== 'attack-air') return false;
    const start = Number.isFinite(player.animStart) ? player.animStart : animT;
    const frame = Math.min(5, Math.floor(Math.max(0, animT-start) / 4) % 6);
    const row = Number.isFinite(player.dirRow) ? player.dirRow : 6;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.8;
    ctx.drawImage(img, frame*200, row*200, 200, 200, x-32, y-32, 64, 64);
    ctx.restore();
    return true;
  }

  function updatePlayerAssetStatus(){
    const btn=$('surv-start-btn');
    if(!btn) return;
    mainPlayerSpriteReady = MAIN_PLAYER_REQUIRED_KEYS.every(function(key){ return !!sprites[key]; });
    btn.disabled=!mainPlayerSpriteReady;
    if(mainPlayerSpriteReady) btn.textContent='COMENZAR SUPERVIVENCIA';
    else if(mainPlayerSpriteError) btn.textContent='ERROR DEL PERSONAJE · RECARGA';
    else btn.textContent='CARGANDO PERSONAJE...';
  }
  (function loadSprites(){
    Object.keys(RUTAS).forEach(function(k){
      const img = new Image();
      img.onload = function(){ sprites[k]=img; if(MAIN_PLAYER_KEYS.indexOf(k)>=0) updatePlayerAssetStatus(); };
      img.onerror = function(){ sprites[k]=null; if(MAIN_PLAYER_REQUIRED_KEYS.indexOf(k)>=0){ mainPlayerSpriteError=true; updatePlayerAssetStatus(); } };
      img.src = RUTAS[k];
    });
    setTimeout(updatePlayerAssetStatus,0);
  })();

  function spr(k){ return sprites[k]||null; }
  function drawSpr(k,x,y,w,h,flip){
    const img=spr(k); if(!img) return false;
    ctx.save(); ctx.translate(x,y); if(flip) ctx.scale(-1,1);
    ctx.drawImage(img,-w/2,-h/2,w,h); ctx.restore(); return true;
  }

  const RENEWAL_ENEMY_ANIM_SPEC = { sourceW:100, sourceH:100, fps:{Idle:7,Walk:10,Attack01:14,Attack02:12,Hurt:12,Death:8} };
  function renewalEnemyAction(e){
    if(e.hp<=0) return 'Death';
    if(e.hitFlash>0) return 'Hurt';
    if(e.chargeTimer>0 || (e.shootCd>0 && e.shootCd<8) || (e.magicCd>0 && e.magicCd<8)) return e.renewalAttackMode||'Attack01';
    return e.frozen>0 ? 'Idle' : 'Walk';
  }
  function drawRenewalEnemy(e,x,y){
    if(!e || !e.renewalProfile) return false;
    const action=renewalEnemyAction(e), spec=RENEWAL_ENEMY_ANIM_SPEC;
    const img=spr('renewal-enemy-'+e.renewalProfile+'-'+action) || spr('renewal-enemy-'+e.renewalProfile+'-Idle');
    if(!img) return false;
    if(e._renewalLastAction!==action){ e._renewalLastAction=action; e.renewalAnimStart=animT; }
    const fps=spec.fps[action]||8;
    const columns=Math.max(1,Math.floor((img.naturalWidth||spec.sourceW)/spec.sourceW));
    const start=Number.isFinite(e.renewalAnimStart)?e.renewalAnimStart:animT;
    const frame=Math.floor(Math.max(0,animT-start)/(Math.max(1,Math.round(60/fps))))%columns;
    ctx.save();
    ctx.imageSmoothingEnabled=false;
    ctx.translate(x,y);
    if(player && e.x>player.x) ctx.scale(-1,1);
    // Las celdas del paquete reservan mucho espacio transparente. Los comunes igualan la presencia visual del jugador LPC; los grandes/colosos triplican esa escala. La colisión no cambia.
    const normalCharacterScale=420;
    const drawSize=e.large ? normalCharacterScale*3 : normalCharacterScale;
    ctx.drawImage(img,frame*spec.sourceW,0,spec.sourceW,spec.sourceH,-drawSize/2,-drawSize/2,drawSize,drawSize);
    if(e.enraged){ ctx.globalAlpha=.4+Math.sin(animT*.2)*.12; ctx.globalCompositeOperation='lighter'; ctx.strokeStyle='#ff3d67'; ctx.lineWidth=3; ctx.shadowColor='#ff3d67'; ctx.shadowBlur=12; ctx.beginPath(); ctx.arc(0,0,e.r*1.35,0,Math.PI*2); ctx.stroke(); }
    ctx.restore();
    return true;
  }

  const ENEMY_MAGIC_BLUE_SPEC={sourceW:128,sourceH:128,columns:8,fps:12};
  const ENEMY_MAGIC_ELEMENTAL_SPEC={sourceW:64,sourceH:64,columns:20,fps:14};
  function drawEnemyMagicProjectile(p){
    if(!p || !p.enemyOrb) return false;
    const elemental=p.enemyOrbPalette==='elemental';
    const img=spr(elemental?'renewal-fx-enemyMagicElemental':'renewal-fx-enemyMagicBlue');
    if(!img) return false;
    const spec=elemental?ENEMY_MAGIC_ELEMENTAL_SPEC:ENEMY_MAGIC_BLUE_SPEC;
    const frame=Math.floor(animT/(Math.max(1,Math.round(60/spec.fps))))%spec.columns;
    const size=elemental?Math.max(30,p.r*8.5):Math.max(48,p.r*10.5);
    const alpha=Math.max(.35,Math.min(1,p.life/(p.maxLife||90)+.18));
    ctx.save();
    ctx.translate(p.x-cam.x,p.y-cam.y);
    ctx.rotate(Math.atan2(p.vy,p.vx));
    ctx.globalAlpha=alpha;
    ctx.imageSmoothingEnabled=false;
    ctx.shadowColor=elemental?(p.color||'#31e6ff'):'#596cff';
    ctx.shadowBlur=elemental?12:18;
    ctx.drawImage(img,frame*spec.sourceW,0,spec.sourceW,spec.sourceH,-size/2,-size/2,size,size);
    ctx.shadowBlur=0; ctx.restore();
    return true;
  }

  const NAYUTARO_ANIMATIONS = {
    intro:['intro_00','intro_01','intro_02','intro_03','intro_04','intro_05'],
    counterIdle:['counterIdle_00','counterIdle_01','counterIdle_02'],
    walk:['walk_00','walk_01','walk_02','walk_03','walk_04','walk_05','walk_06','walk_07','walk_08','walk_09','walk_10','walk_11'],
    roundhouse:['roundhouse_00','roundhouse_01','roundhouse_02','roundhouse_03','roundhouse_04','roundhouse_05','roundhouse_06','roundhouse_07'],
    defeat:['defeat_00','defeat_01','defeat_02','defeat_03','defeat_04','defeat_05','defeat_06','defeat_07'],
    transform:['transform_00','transform_01','transform_02','transform_03','transform_04','transform_05','transform_06','transform_07','transform_08'],
    robustIdle:['robustIdle_00','robustIdle_01','robustIdle_02','robustIdle_03','robustIdle_04','robustIdle_05','robustIdle_06'],
    punch:['punch_00','punch_01','punch_02','punch_03','punch_04','punch_05'],
    chouCharge:['chouCharge_00','chouCharge_01','chouCharge_02','chouCharge_03','chouCharge_04','chouCharge_05','chouCharge_06']
  };
  const NAYUTARO_ANIM_FPS={intro:10,counterIdle:7,walk:10,roundhouse:14,defeat:8,transform:10,robustIdle:7,punch:14,chouCharge:10};
  function nayutaroEnemyAction(e){
    if(e.hp<=0) return 'defeat';
    if(e.nayutaroTransformTimer>0) return 'transform';
    if(e.hitFlash>0) return 'counterIdle';
    if(e.chargeTimer>0) return e.nayutaroRobust?'punch':'roundhouse';
    return e.frozen>0 ? 'counterIdle' : (e.nayutaroRobust?'robustIdle':'walk');
  }
  function drawNayutaroEnemy(e,x,y){
    if(!e || !e.nayutaro) return false;
    const img=spr('nayutaro-atlas'); if(!img) return false;
    const action=nayutaroEnemyAction(e), frames=NAYUTARO_ANIMATIONS[action]||NAYUTARO_ANIMATIONS.counterIdle;
    if(e._nayutaroLastAction!==action){ e._nayutaroLastAction=action; e.nayutaroAnimStart=animT; }
    const fps=NAYUTARO_ANIM_FPS[action]||8;
    const start=Number.isFinite(e.nayutaroAnimStart)?e.nayutaroAnimStart:animT;
    const frameIndex=Math.floor(Math.max(0,animT-start)/(Math.max(1,Math.round(60/fps))))%frames.length;
    const frameName=frames[frameIndex], frameNumber=Object.keys(NAYUTARO_FRAME_INDEX).indexOf(frameName);
    const atlasIndex=frameNumber>=0?NAYUTARO_FRAME_INDEX[frameName]:0;
    const sx=(atlasIndex%8)*128, sy=Math.floor(atlasIndex/8)*128;
    const drawSize=e.large?324:108;
    ctx.save(); ctx.imageSmoothingEnabled=false; ctx.translate(x,y);
    if(player && e.x>player.x) ctx.scale(-1,1);
    ctx.drawImage(img,sx,sy,128,128,-drawSize/2,-drawSize/2,drawSize,drawSize);
    if(e.nayutaroRobust){ ctx.globalAlpha=.2+Math.sin(animT*.16)*.08; ctx.globalCompositeOperation='lighter'; ctx.strokeStyle='#f1b84b'; ctx.lineWidth=2; ctx.shadowColor='#f1b84b'; ctx.shadowBlur=10; ctx.beginPath(); ctx.arc(0,0,e.r*1.25,0,Math.PI*2); ctx.stroke(); }
    ctx.restore(); return true;
  }
  const NAYUTARO_FRAME_INDEX={
    intro_00:0,intro_01:1,intro_02:2,intro_03:3,intro_04:4,intro_05:5,counterIdle_00:6,counterIdle_01:7,counterIdle_02:8,
    walk_00:9,walk_01:10,walk_02:11,walk_03:12,walk_04:13,walk_05:14,walk_06:15,walk_07:16,walk_08:17,walk_09:18,walk_10:19,walk_11:20,
    roundhouse_00:21,roundhouse_01:22,roundhouse_02:23,roundhouse_03:24,roundhouse_04:25,roundhouse_05:26,roundhouse_06:27,roundhouse_07:28,
    victory_00:29,victory_01:30,victory_02:31,victory_03:32,victory_04:33,victory_05:34,victory_06:35,victory_07:36,victory_08:37,victory_09:38,victory_10:39,victory_11:40,
    defeat_00:41,defeat_01:42,defeat_02:43,defeat_03:44,defeat_04:45,defeat_05:46,defeat_06:47,defeat_07:48,
    transform_00:49,transform_01:50,transform_02:51,transform_03:52,transform_04:53,transform_05:54,transform_06:55,transform_07:56,transform_08:57,
    robustIdle_00:58,robustIdle_01:59,robustIdle_02:60,robustIdle_03:61,robustIdle_04:62,robustIdle_05:63,robustIdle_06:64,
    teleport_00:65,teleport_01:66,teleport_02:67,teleport_03:68,teleport_04:69,teleport_05:70,teleport_06:71,teleport_07:72,teleport_08:73,teleport_09:74,teleport_10:75,teleport_11:76,
    punch_00:77,punch_01:78,punch_02:79,punch_03:80,punch_04:81,punch_05:82,chouCharge_00:83,chouCharge_01:84,chouCharge_02:85,chouCharge_03:86,chouCharge_04:87,chouCharge_05:88,chouCharge_06:89
  };

  const RADAHN_BOSS_ANIM_SPEC = {columns:8, rows:4, sourceW:256, sourceH:288, fps:8};
  // El atlas tiene márgenes y alturas distintas por orientación. Estos anclajes
  // estabilizan el centro visual y los pies sin recortar las armas o la capa.
  const RADAHN_BOSS_FRAME_LAYOUT = [
    {anchorX:[156,149,141,130,122,113,105,94], footY:[276,278,276,279,279,278,279,278]},
    {anchorX:[156,150,137,134,125,110,105,95], footY:[252,252,252,252,252,252,252,252]},
    {anchorX:[152,144,134,129,122,116,111,103], footY:[288,288,288,288,288,288,288,288]},
    {anchorX:[167,159,152,146,135,123,113,95], footY:[221,223,223,223,226,223,223,223]}
  ];
  function drawAnimatedRadahnBoss(boss,bx,by){
    const img=spr('jefe-radahn-animated');
    if(!img) return false;
    const dx=player ? player.x-boss.x : 0, dy=player ? player.y-boss.y : 1;
    const absX=Math.abs(dx), absY=Math.abs(dy);
    let row=boss._radahnRow;
    // Hysteresis: evita que la orientación parpadee cuando jugador y jefe están
    // casi en diagonal; solo cambia cuando una dirección domina claramente.
    if(row===undefined){
      row = absY>=absX ? (dy>=0 ? 0 : 3) : (dx<0 ? 1 : 2);
    } else if(absY>absX*1.12){
      row=dy>=0 ? 0 : 3;
    } else if(absX>absY*1.12){
      row=dx<0 ? 1 : 2;
    }
    boss._radahnRow=row;
    const frame=Math.floor((animT/60)*RADAHN_BOSS_ANIM_SPEC.fps)%RADAHN_BOSS_ANIM_SPEC.columns;
    const layout=RADAHN_BOSS_FRAME_LAYOUT[row]||RADAHN_BOSS_FRAME_LAYOUT[0];
    const drawH=Math.max(560,boss.r*6.0);
    const drawW=drawH*(RADAHN_BOSS_ANIM_SPEC.sourceW/RADAHN_BOSS_ANIM_SPEC.sourceH);
    const anchorX=layout.anchorX[frame], footY=layout.footY[frame];
    const baseY=Math.max(48,boss.r*0.95);
    const sx=frame*RADAHN_BOSS_ANIM_SPEC.sourceW, sy=row*RADAHN_BOSS_ANIM_SPEC.sourceH;
    ctx.save();
    ctx.imageSmoothingEnabled=false;
    ctx.translate(bx,by);
    ctx.drawImage(img,sx,sy,RADAHN_BOSS_ANIM_SPEC.sourceW,RADAHN_BOSS_ANIM_SPEC.sourceH,
      -anchorX*(drawW/RADAHN_BOSS_ANIM_SPEC.sourceW),
      baseY-footY*(drawH/RADAHN_BOSS_ANIM_SPEC.sourceH),
      drawW,drawH);
    ctx.restore();
    return true;
  }

  // ========== WEAPONS ==========
  const WEAPONS = {
    espadalarga: { nombre:'Espada Larga', tipo:'melee', dmg:14, range:52, cd:23, color:'#cfd8dc' },
    katana: { nombre:'Katana', tipo:'melee', dmg:12, range:50, cd:23, color:'#e0e0e0', crit:2.2 },
    granespada: { nombre:'Gran Espada', tipo:'melee', dmg:26, range:70, cd:32, color:'#90a4ae' },
    daga: { nombre:'Daga', tipo:'melee', dmg:8, range:32, cd:23, color:'#b0bec5', crit:2.5 },
    lanza: { nombre:'Lanza', tipo:'melee', dmg:15, range:78, cd:20, color:'#a1887f' },
    arco: { nombre:'Arco', tipo:'ranged', dmg:16, range:220, cd:60, color:'#8d6e63', proj:true, projSpd:9 },
    ballesta: { nombre:'Ballesta', tipo:'ranged', dmg:22, range:200, cd:90, color:'#6d4c41', proj:true, projSpd:12 },
    baston: { nombre:'Bastón Glintstone', tipo:'magic', dmg:18, range:200, cd:16, color:'#4dd0e1', proj:true, projSpd:7, fp:8, magicSkillName:'Aguja Glintstone', magicSkillCost:18, magicSkillCooldown:180 },
    sello: { nombre:'Sello Sagrado', tipo:'magic', dmg:20, range:180, cd:20, color:'#ff7043', proj:true, projSpd:6, fp:10, magicSkillName:'Círculo Consagrado', magicSkillCost:22, magicSkillCooldown:210 },
    riosdesangre: { nombre:'Ríos de Sangre', tipo:'melee', dmg:24, range:55, cd:23, color:'#c62828', crit:2.3 },
    colmillosabueso: { nombre:'Colmillo de Sabueso', tipo:'melee', dmg:22, range:58, cd:23, color:'#8d6e63', crit:2.0 },
    espadablasfema: { nombre:'Espada Blasfema', tipo:'melee', dmg:30, range:68, cd:26, color:'#e64a19' },
    espadonluna: { nombre:'Espadón Luna Negra', tipo:'magic', dmg:28, range:75, cd:24, color:'#5c6bc0', proj:true, projSpd:8, fp:12, rare:true },
    martillorubi: { nombre:'Martillo de Rubí', tipo:'melee', dmg:34, range:60, cd:36, color:'#e53935' },
    escudo: { nombre:'Escudo de Hierro', tipo:'shield', dmg:6, range:35, cd:25, color:'#78909c', block:0.5 }
  };
  const WEAPON_PASSIVES = {
    espadalarga:'Guardia del Errante · los remates recuperan aguante',
    katana:'Corte Hemático · acumula sangrado',
    granespada:'Quebrantahuesos · gran presión de postura',
    daga:'Paso del Asesino · más crítico después de rodar',
    lanza:'Empalamiento · ancla y perfora postura',
    arco:'Marca del Cazador · el siguiente golpe gana daño',
    ballesta:'Perno de Supresión · cada tercer impacto vulnera',
    baston:'Eco Lunar · los impactos rebotan',
    sello:'Brasa Consagrada · concede protección breve',
    riosdesangre:'Hemorragia Carmesí · detona marcas cercanas',
    colmillosabueso:'Filo de la Persecución · caza roles veloces',
    espadablasfema:'Brasa Voraz · cura al derrotar',
    espadonluna:'Luna Fría · habilidades T/Y y daño astral',
    martillorubi:'Golpe de Ruptura · postura masiva',
    escudo:'Réplica de Hierro · parry concede barrera'
  };

  const BOSS_HP_MULT = 12, BOSS_DMG_MULT = 2, BOSS_SIZE_MULT = 2.35;
  const BOSSES = [
    { day:11, id:'godrick', nombre:'Kaelgor, el Devoracielos', hp:900, dmg:18, spd:1.4, r:28, color:'#e53955', hazard:'meteor', unique:'skybreaker', abilityCd:246 },
    { day:22, id:'rennala', nombre:'Aurelia, Hoja del Juramento', hp:1100, dmg:16, spd:1.3, r:26, color:'#f06b7e', hazard:'petals', unique:'petalRequiem', abilityCd:270 },
    { day:33, id:'radahn', nombre:'Morvane, Rey de las Astas Vacías', hp:1600, dmg:24, spd:1.5, r:36, color:'#789bd6', hazard:'thunder', unique:'stormLattice', abilityCd:228 },
    { day:44, id:'malenia', nombre:'Varkun, Señor de la Sangre', hp:1400, dmg:22, spd:2.1, r:28, color:'#d12648', hazard:'arms', unique:'bloodCage', abilityCd:252 },
    { day:55, id:'maliketh', nombre:'Ser Oryx, Llama de Ceniza', hp:1800, dmg:26, spd:1.9, r:30, color:'#b7193c', sprite2:true, hazard:'blood', unique:'ashMarch', abilityCd:234 },
    { day:66, id:'radahn', nombre:'Tharos, el Rey del Trueno', hp:2500, dmg:30, spd:1.7, r:38, color:'#d8c8aa', hazard:'silence', unique:'crownfall', abilityCd:282 }
  ];
  const REGIONS = [
    {id:'valle',name:'Valle de las Ruinas',art:'assets/drakzeth/maps/valle-de-las-ruinas.webp',tint:'rgba(80,12,24,.16)',unlock:0},
    {id:'luna',name:'Lago de Luna',art:'assets/drakzeth/maps/lago-de-luna.webp',tint:'rgba(38,58,104,.16)',unlock:1},
    {id:'yermo',name:'Yermo Carmesí',art:'assets/drakzeth/maps/yermo-carmesí.webp',tint:'rgba(126,8,28,.2)',unlock:2},
    {id:'meseta',name:'Meseta del Sol',art:'assets/drakzeth/maps/meseta-del-sol.webp',tint:'rgba(116,72,18,.15)',unlock:3},
    {id:'ciudadela',name:'Ciudadela del Árbol',art:'assets/drakzeth/maps/ciudadela-del-arbol.webp',tint:'rgba(58,92,35,.16)',unlock:4},
    {id:'cumbres',name:'Cumbres de Hielo',art:'assets/drakzeth/maps/cumbres-de-hielo.webp',tint:'rgba(48,74,116,.18)',unlock:5}
  ];
  const BOSS_INTROS = {
    11:{title:'El Devoracielos',quote:'“El firmamento se inclina ante mis hojas.”',arena:'Fase II: meteoritos carmesíes marcarán el suelo antes de caer.',art:'assets/drakzeth/bosses/kaelgor-el-devoracielos.webp'},
    22:{title:'Hoja del Juramento',quote:'“Cada pétalo guarda una promesa rota.”',arena:'Fase II: pétalos carmesíes crean zonas que restauran a la guardiana.',art:'assets/drakzeth/bosses/aurelia-de-la-flor-carmesí.webp'},
    33:{title:'Rey de las Astas Vacías',quote:'“Escucha: la tormenta conoce tu nombre.”',arena:'Fase II: rayos señalan corredores inseguros en la fortaleza.',art:'assets/drakzeth/bosses/morvane-el-injertado.webp'},
    44:{title:'Señor de la Sangre',quote:'“Mi hambre no reconoce frontera.”',arena:'Fase II: extremidades injertadas clausuran rutas de movimiento.',art:'assets/drakzeth/bosses/varkun-senor-de-la-sangre.webp'},
    55:{title:'Llama de Ceniza',quote:'“Arder es recordar.”',arena:'Fase II: círculos de sangre consumen la arena.',art:'assets/drakzeth/bosses/ser-oryx-llama-ceniza.png'},
    66:{title:'Rey del Trueno',quote:'“La última corona cae con el relámpago.”',arena:'Fase II: zonas de silencio alteran la lectura de la arena.',art:'assets/drakzeth/bosses/tharos-el-rey-del-trueno.webp'}
  };

  const ENE_TYPES = [
    { id:'soldado', hp:64, dmg:8, spd:1.35, r:20, spr:'ene-soldado', color:'#8a7a5a', xp:14 },
    { id:'lobo', hp:48, dmg:10, spd:1.55, r:18, spr:'ene-lobo', color:'#5a5048', xp:12 },
    { id:'caballero', hp:132, dmg:14, spd:1.15, r:22, spr:'ene-caballero', color:'#6a6a7a', xp:24 },
    { id:'espiritu', hp:58, dmg:11, spd:1.25, r:18, spr:'ene-espiritu', color:'#6a8aaa', xp:18, mage:true },
    { id:'arquero', hp:76, dmg:5, spd:1.05, r:18, spr:'ene-espiritu', color:'#d47a8f', xp:20, mage:true, ranged:true, range:390, magicCd:150 },
    { id:'oraculo', hp:112, dmg:7, spd:0.95, r:21, spr:'ene-espiritu', color:'#9b87d6', xp:30, mage:true, ranged:true, range:430, magicCd:180 },
    { id:'troll', hp:310, dmg:18, spd:0.85, r:32, spr:'ene-troll', color:'#4a5a3a', xp:42, aoe:true, large:true, enrageChance:.78, healRatio:.48, magicCd:240 },
    { id:'coloso', hp:460, dmg:24, spd:0.68, r:38, spr:'ene-troll', color:'#8e5660', xp:58, aoe:true, large:true, enrageChance:.88, healRatio:.54, magicCd:240 },
    { id:'guardian', hp:170, dmg:14, spd:0.82, r:25, spr:'ene-caballero', color:'#7f6670', xp:34, role:'guardian', shieldFactor:.52 },
    { id:'invocador', hp:125, dmg:6, spd:0.88, r:22, spr:'ene-espiritu', color:'#a96d91', xp:30, mage:true, ranged:true, range:350, role:'summoner', barrierCd:210 },
    { id:'asesino', hp:92, dmg:20, spd:1.72, r:19, spr:'ene-lobo', color:'#c23b63', xp:30, role:'assassin', stealthCd:240 },
    { id:'embestidora', hp:145, dmg:18, spd:1.05, r:24, spr:'ene-troll', color:'#b85b4a', xp:32, role:'charger', chargeCd:240 },
    { id:'sanador', hp:110, dmg:5, spd:0.82, r:21, spr:'ene-espiritu', color:'#d58a9d', xp:36, mage:true, ranged:true, range:330, role:'healer', healCd:270 },
    { id:'mimico', hp:135, dmg:12, spd:1.08, r:23, spr:'ene-espiritu', color:'#b47bd4', xp:40, mage:true, ranged:true, range:360, role:'mimic', copyCd:300 },
    { id:'nayutaro', hp:826, dmg:16, spd:1.3, r:20, spr:null, color:'#c6953d', xp:34, role:'charger', chargeCd:270, nayutaro:true, secondPhaseAt:.5 }
  ];
  const RENEWAL_ENEMY_PROFILE = {
    soldado:'soldier', lobo:'bloodmonster', caballero:'orc', espiritu:'demon', arquero:'soldier', oraculo:'demon',
    troll:'orc', coloso:'orc', guardian:'orc', invocador:'demon', asesino:'bloodmonster', embestidora:'bloodmonster', sanador:'demon', mimico:'bloodmonster'
  };
  let checkpoints = [];
  let pendingLevelPts = 0;
  let settings = { volume: 0.7, brightness: 1, shake: true, performanceMode: false };
  try { settings = Object.assign(settings, JSON.parse(localStorage.getItem('er_surv_settings')||'{}')); } catch(e){}
  let manaAudioCtx=null, manaChargeOsc=null, manaChargeGain=null;
  function manaAudioContext(){
    const AudioCtor=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtor) return null;
    if(!manaAudioCtx) manaAudioCtx=new AudioCtor();
    if(manaAudioCtx.state==='suspended') manaAudioCtx.resume().catch(function(){});
    return manaAudioCtx;
  }
  function manaHaptic(pattern){
    if(navigator && typeof navigator.vibrate==='function') navigator.vibrate(pattern);
  }
  function startManaChargeSound(){
    const ac=manaAudioContext(); if(!ac || manaChargeOsc) return;
    const now=ac.currentTime;
    manaChargeOsc=ac.createOscillator(); manaChargeGain=ac.createGain();
    manaChargeOsc.type='sine'; manaChargeOsc.frequency.setValueAtTime(82,now);
    manaChargeGain.gain.setValueAtTime(0.0001,now);
    manaChargeGain.gain.exponentialRampToValueAtTime(Math.max(0.008,settings.volume*0.045),now+0.12);
    manaChargeOsc.connect(manaChargeGain); manaChargeGain.connect(ac.destination); manaChargeOsc.start(now);
  }
  function updateManaChargeSound(progress){
    if(!manaChargeOsc || !manaChargeGain || !manaAudioCtx) return;
    const now=manaAudioCtx.currentTime;
    manaChargeOsc.frequency.setTargetAtTime(82+progress*150,now,0.08);
    manaChargeGain.gain.setTargetAtTime(Math.max(0.008,settings.volume*(0.035+progress*0.035)),now,0.08);
  }
  function stopManaChargeSound(){
    if(!manaChargeOsc || !manaChargeGain || !manaAudioCtx) return;
    const osc=manaChargeOsc, gain=manaChargeGain, ac=manaAudioCtx, now=ac.currentTime;
    gain.gain.cancelScheduledValues(now); gain.gain.setTargetAtTime(0.0001,now,0.06);
    osc.stop(now+0.22); manaChargeOsc=null; manaChargeGain=null;
  }
  function playHeartDragonSound(){
    const ac=manaAudioContext(); if(!ac) return;
    const now=ac.currentTime, master=Math.max(0.02,settings.volume*0.12);
    const osc=ac.createOscillator(), gain=ac.createGain();
    osc.type='triangle'; osc.frequency.setValueAtTime(130,now); osc.frequency.exponentialRampToValueAtTime(390,now+0.34);
    gain.gain.setValueAtTime(0.0001,now); gain.gain.exponentialRampToValueAtTime(master,now+0.035); gain.gain.exponentialRampToValueAtTime(0.0001,now+0.7);
    osc.connect(gain); gain.connect(ac.destination); osc.start(now); osc.stop(now+0.75);
  }


  // ========== STATE ==========
  let state = 'START'; // START PLAYING REWARD DEAD WIN
  let player = null;
  let enemies = [];
  let projectiles = [];
  let particles = [];
  let floating = [];
  let boss = null;
  let cam = {x:0,y:0};
  let keys = {};
  let mouse = {x:0,y:0, down:false};
  let day = 1;
  let dayTime = EARLY_DAY_SECONDS;
  let kills = 0;
  let animT = 0;
  let spawnAcc = 0;
  let spawnSerial = 0;
  let bloodMoon = false;
  let glintMoon = false;
  let ownedWeapons = ['espadalarga'];
  let weaponIdx = 0;
  let level = 1;
  let xp = 0;
  let xpNext = 40;
  let screenFlash = 0;
  let screenShake = { time:0, max:0, power:0 };
  let slashFX = [];
  let dragonFX = [];
  let arenaHazards = [];
  let dragonZones = [];
  let dragonPending = [];
  let rewardChoices = [];
  let mapDecor = [];
  const decorImages = {};
  const DECOR_ASSETS = [
    {src:'assets/objeto-arbol-oscuro.png',w:78,h:78,alpha:.94,kind:'ruin'},
    {src:'assets/objeto-arbusto.png',w:66,h:58,alpha:.92,kind:'nature'},
    {src:'assets/objeto-barril.png',w:52,h:58,alpha:.96,kind:'prop'},
    {src:'assets/objeto-cofre.png',w:72,h:58,alpha:1,kind:'chest'},
    {src:'assets/objeto-lapida.png',w:56,h:76,alpha:.96,kind:'grave'},
    {src:'assets/elden-texture-pack/objetos/altar-runa.png',w:104,h:104,alpha:1,kind:'altar'},
    {src:'assets/elden-texture-pack/objetos/columna-rota.png',w:88,h:126,alpha:.95,kind:'ruin'},
    {src:'assets/elden-texture-pack/objetos/restos-estructura.png',w:118,h:88,alpha:.95,kind:'ruin'},
    {src:'assets/drakzeth/renewal/ui/relic-heart.png',w:48,h:48,alpha:1,kind:'relic'},
    {src:'assets/drakzeth/renewal/ui/relic-dagger.png',w:48,h:48,alpha:1,kind:'relic'},
    {src:'assets/drakzeth/renewal/world/teleport.png',sx:0,sy:0,sw:256,sh:128,w:94,h:70,alpha:1,kind:'teleport'},
    {src:'assets/drakzeth/renewal/world/undead-objects-atlas.png',sx:0,sy:0,sw:192,sh:128,w:132,h:88,alpha:.98,kind:'ruin'},
    {src:'assets/drakzeth/renewal/world/undead-objects-atlas.png',sx:192,sy:128,sw:192,sh:128,w:124,h:84,alpha:.98,kind:'ruin'},
    {src:'assets/drakzeth/renewal/world/undead-objects-atlas.png',sx:0,sy:384,sw:192,sh:128,w:120,h:82,alpha:.96,kind:'stone'},
    {src:'assets/drakzeth/renewal/world/cave-objects-atlas.png',sx:312,sy:0,sw:78,sh:156,w:78,h:144,alpha:1,kind:'crystal'},
    {src:'assets/drakzeth/renewal/world/cave-objects-atlas.png',sx:468,sy:0,sw:78,sh:156,w:78,h:144,alpha:1,kind:'altar'},
    {src:'assets/drakzeth/renewal/world/cave-objects-atlas.png',sx:312,sy:468,sw:156,sh:156,w:132,h:132,alpha:1,kind:'ritual'},
    {src:'assets/drakzeth/renewal/world/cave-objects-atlas.png',sx:468,sy:624,sw:156,sh:156,w:118,h:118,alpha:1,kind:'fire'}
  ];
  let luckyTriple = false;

  const $ = id => document.getElementById(id);

  // ========== EXPANSIÓN DRAKZETH ==========
  const DRAGON_TREE = {
    colmillo: [
      {id:'sangre-viva', name:'Sangre Viva', desc:'+18% daño de habilidades', effect:'skillDamage', value:0.18},
      {id:'mordida-ascendente', name:'Mordida Ascendente', desc:'Las marcas detonan con +12 daño', effect:'markBurst', value:12},
      {id:'corazon-voraz', name:'Corazón Voraz', desc:'Las ejecuciones reducen enfriamientos', effect:'executionReset', value:30}
    ],
    ala: [
      {id:'escamas-viento', name:'Escamas de Viento', desc:'+20% alcance de áreas', effect:'areaSize', value:0.2},
      {id:'anillo-expandido', name:'Anillo Expandido', desc:'Rugido atrae enemigos al centro', effect:'pull', value:28},
      {id:'vuelo-ceniza', name:'Vuelo de Ceniza', desc:'Rodar deja una estela dañina', effect:'dodgeTrail', value:22}
    ],
    ojo: [
      {id:'mirada-ceniza', name:'Mirada de Ceniza', desc:'Revela estados y vulnerabilidades', effect:'stateSight', value:1},
      {id:'pausa-dragon', name:'Pausa del Dragón', desc:'+35% duración de control', effect:'control', value:0.35},
      {id:'velo-carmesi', name:'Velo Carmesí', desc:'Lanzar una habilidad reduce daño', effect:'ward', value:0.18}
    ]
  };
  const RELIC_POOL = [
    {id:'costilla-dragon',name:'Costilla de Dragón',desc:'Rugido repite un pulso reducido, pero cuesta +8 FP.',type:'dragonEcho'},
    {id:'velo-morvane',name:'Velo de Morvane',desc:'Una ejecución vuelve invisible durante 1.2 s.',type:'executionVeil'},
    {id:'diente-aurelia',name:'Diente de Aurelia',desc:'Las marcas duran el doble, pero atacas 8% más lento.',type:'longMarks'},
    {id:'escama-kaelgor',name:'Escama de Kaelgor',desc:'La primera ruptura de cada día inflige +35% daño.',type:'breakPower'}
  ];
  const CURSE_POOL = [
    {id:'sangre-sedienta',name:'Sangre Sedienta',desc:'+25% daño, pero los frascos curan 30% menos.',type:'bloodHungry'},
    {id:'peso-ceniza',name:'Peso de Ceniza',desc:'+30% áreas, pero -14% velocidad.',type:'ashWeight'},
    {id:'ojo-cerrado',name:'Ojo Cerrado',desc:'Sin minimapa, pero +1 reliquia al próximo evento.',type:'closedEye'}
  ];
  function playerHasNode(id){ return !!(player && player.dragonNodes && player.dragonNodes.indexOf(id)>=0); }
  function playerHasRelic(type){ return !!(player && player.relics && player.relics.some(function(r){return r.type===type;})); }
  function playerHasCurse(type){ return !!(player && player.curses && player.curses.some(function(r){return r.type===type;})); }
  function dragonValue(key, fallback){
    if(!player) return fallback||0;
    let total=0;
    Object.keys(DRAGON_TREE).forEach(function(branch){ DRAGON_TREE[branch].forEach(function(n){ if(playerHasNode(n.id)&&n.effect===key) total+=n.value; }); });
    return total||fallback||0;
  }
  function stateOf(target){
    if(!target) return ({});
    if(!target.combatStates) target.combatStates={marked:0,anchored:0,vulnerable:0};
    return target.combatStates;
  }
  function applyCombatState(target,key,duration){
    if(!target || target.hp<=0) return;
    const states=stateOf(target), mult=key==='vulnerable' ? 1 : (1+dragonValue('control',0));
    states[key]=Math.max(states[key]||0,Math.round(duration*mult));
    target.hitFlash=Math.max(target.hitFlash||0,5);
  }
  function consumeCombatState(target,key){
    const states=stateOf(target); if(!states[key]) return false; states[key]=0; return true;
  }
  function detonateCombatMark(target){
    if(!target || target.hp<=0 || !consumeCombatState(target,'marked')) return false;
    const burst=18+dragonValue('markBurst',0);
    if(target===boss) damageBoss({dmg:burst,crit:false,skill:true});
    else damageEnemy(target,{dmg:burst,crit:false,skill:true});
    spawnP(target.x,target.y,'#ff718a',14);
    dragonFX.push({type:'markBurst',x:target.x,y:target.y,life:24,maxLife:24,radius:42});
    showFT('DETONACIÓN',target.x,target.y-34,'#ffd1d8');
    return true;
  }
  function applyAffinityOnSkill(target){
    if(!player || !target || target.hp<=0) return;
    const affinity=player.dragonAffinity||'sangre';
    if(affinity==='luna'){ target.frozen=Math.max(target.frozen||0,48); spawnP(target.x,target.y,'#9fc8ff',5); }
    else if(affinity==='sombra'){ applyCombatState(target,'marked',160); }
    else if(affinity==='rayo'){
      const nearby=enemies.filter(function(e){return e!==target && e.hp>0 && Math.hypot(e.x-target.x,e.y-target.y)<115;}).sort(function(a,b){return Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y);})[0];
      if(nearby){ damageEnemy(nearby,{dmg:12,crit:false,skill:true}); spawnP(nearby.x,nearby.y,'#b7d7ff',6); }
    } else if(affinity==='sangre'){ player.hp=Math.min(player.maxHp,player.hp+2); }
  }
  function updateCombatStates(){
    enemies.forEach(function(e){ const s=stateOf(e); Object.keys(s).forEach(function(k){if(s[k]>0)s[k]--;}); });
    if(boss){ const s=stateOf(boss); Object.keys(s).forEach(function(k){if(s[k]>0)s[k]--;}); }
  }
  function combatStateLabel(target){
    const s=stateOf(target), labels=[];
    if(s.marked>0) labels.push('MARCADO'); if(s.anchored>0) labels.push('ANCLADO'); if(s.vulnerable>0) labels.push('VULNERABLE');
    return labels.join(' · ');
  }
  function postureDamageForHit(w){
    if(w && w.posture!=null) return w.posture;
    if(w && w.skill) return 18;
    return w && w.heavy ? 22 : 7;
  }
  function applyPostureDamage(target, amount){
    if(!target || target.hp<=0 || target.postureMax==null || target.postureBroken>0) return;
    const barrierMul=target.barrier>0 ? (target.barrierPower||.55) : 1;
    target.posture=Math.max(0,(target.posture==null?target.postureMax:target.posture)-amount*barrierMul);
    if(target.posture<=0){
      target.posture=target.postureMax; target.postureBroken=120; target.frozen=Math.max(target.frozen||0,55);
      applyCombatState(target,'vulnerable',170); target.hitFlash=14;
      spawnP(target.x,target.y,'#9fd8ff',20); dragonFX.push({type:'postureBreak',x:target.x,y:target.y,life:34,maxLife:34,radius:target.r*2.2});
      triggerScreenShake(7,4); showFT('POSTURA ROTA',target.x,target.y-target.r-20,'#9fd8ff');
    }
  }
  function applyWeaponPassive(e, weaponId, w, dealt){
    if(!player || !e || e.hp<=0) return;
    if(weaponId==='espadalarga' && w.heavy) player.sta=Math.min(player.maxSta,player.sta+7);
    if(weaponId==='granespada' && w.heavy) applyPostureDamage(e,12);
    if(weaponId==='katana'){ e.bleedTimer=Math.max(e.bleedTimer||0,150); e.bleedDamage=Math.max(e.bleedDamage||0,Math.round(dealt*.18)); }
    if(weaponId==='lanza') applyCombatState(e,'anchored',90);
    if(weaponId==='arco'){ applyCombatState(e,'marked',150); e.hunterMark=1; }
    if(weaponId==='ballesta'){
      e.suppressionHits=(e.suppressionHits||0)+1;
      if(e.suppressionHits%3===0){ applyCombatState(e,'vulnerable',110); applyPostureDamage(e,16); showFT('SUPRESIÓN',e.x,e.y-26,'#ffd1d8'); }
    }
    if(weaponId==='baston' && !w.bounce){
      let near=null,best=145;
      for(let i=0;i<enemies.length;i++){ const other=enemies[i]; if(other!==e&&other.hp>0){ const d=Math.hypot(other.x-e.x,other.y-e.y); if(d<best){best=d;near=other;} } }
      if(near) damageEnemy(near,{dmg:dealt*.35,crit:false,skill:true,bounce:true,weaponId:'baston',posture:6});
    }
    if(weaponId==='sello'){ player.dragonWard=Math.max(player.dragonWard,40); }
    if(weaponId==='riosdesangre'){ applyCombatState(e,'marked',120); if(w.heavy&&stateOf(e).marked>0) detonateCombatMark(e); }
    if(weaponId==='colmillosabueso' && (e.role==='assassin'||e.role==='charger'||e.role==='mimic')) e.hp-=Math.round(dealt*.2);
    if(weaponId==='espadonluna') applyCombatState(e,'marked',180);
    if(weaponId==='martillorubi' && w.heavy){ e.frozen=Math.max(e.frozen||0,48); applyPostureDamage(e,12); }
  }

  // ========== PLAYER ==========
  function createPlayer(){
    player = {
      x: MAP_W/2, y: MAP_H/2, r: 24,
      stats: { vig:14, men:10, res:12, fue:12, des:12, sab:10, fe:10 },
      hp: 220, maxHp: 220,
      sta: 110, maxSta: 110,
      fp: 90, maxFp: 90,
      spd: 3.2, facing: 1,
      atkCd: 0, invuln: 0,
      weapon: 'espadalarga',
      dmgMul: 1, xpMul: 1, spdMul: 1,
      block: 0,
      anim: 'idle', dirRow: 6, animStart: 0,
      pendingPts: 0,
      flasks: 5, maxFlasks: 5,
      dodgeCd: 0, isDodging: false, dodgeTimer: 0, dodgeDirX: 0, dodgeDirY: 0,
      parryCd: 0, isParrying: false, parryTimer: 0,
      lanceBowMode: false, lanceBowStep: 0, lanceBowTimer: 0,
      dragonRoarCd: 0, dragonBreathCd: 0, dragonClawCd: 0, dragonFlightCd: 0, dragonTideCd: 0, dragonMeteorCd: 0, dragonHeartCd:0,
      moonColdCd:0, moonAstralCd:0, magicSkillCd:0, ultimateCd:0, moonbladeObtained:false, lastDragonSkill:'', justDodgedTimer:0,
      dragonCast: 0, dragonWard:0, dragonEchoTimer:0, dragonHeartTimer:0,
      manaChargeActive:false, manaCharge:0, manaChargeAuraClock:0, manaChargeVfxLife:0, manaChargeVfxProgress:0,
      dragonShards: 0, dragonNodes: [], dragonAffinity: 'sangre',
      relics: [], curses: [], buildTags: [], executionTarget: null, executionTimer:0,
      unlockedRegions:['valle'], regionId:'valle', regionName:'Valle de las Ruinas'
    };
    recalcFromStats();
  }

  function recalcFromStats(){
    if(!player || !player.stats) return;
    const s = player.stats;
    // vida base alta + vigor
    const newMax = 160 + s.vig * 12;
    const ratio = player.maxHp > 0 ? player.hp / player.maxHp : 1;
    player.maxHp = newMax;
    player.hp = Math.min(newMax, Math.max(1, Math.round(newMax * ratio)));
    player.maxSta = 120 + s.res * 5;
    player.sta = Math.min(player.maxSta, player.sta);
    player.maxFp = 40 + s.men * 6 + s.sab * 2 + s.fe * 2;
    player.fp = Math.min(player.maxFp, player.fp);
    player.dmgMul = 1 + (s.fue + s.des) * 0.02 + s.sab * 0.01 + s.fe * 0.01;
    player.spdMul = 1 + Math.max(0, (s.des - 10) * 0.012);
    player.spd = 3.0 + s.des * 0.02;
    if(playerHasCurse('ashWeight')) player.spd*=0.86;
    if(playerHasRelic('longMarks')) player.spd*=0.92;
  }

  function getBuildName(){
    if(!player) return 'Errante';
    const s=player.stats||{};
    if(player.weapon==='lanza' || (s.fue||0)>=(s.sab||0)+5) return 'Centinela Carmesí';
    if(player.weapon==='ballesta' || (s.des||0)>=(s.fue||0)+4) return 'Cazador de Ceniza';
    if(player.weapon==='espadonluna') return 'Astral de la Luna Negra';
    if(player.weapon==='baston' || (s.sab||0)>=(s.fe||0)+4) return 'Heraldo Lunar';
    if(player.weapon==='sello' || (s.fe||0)>=(s.fue||0)+4) return 'Devoto del Sello';
    if(player.weapon==='granespada' || (s.fue||0)>=20) return 'Verdugo del Crisol';
    return 'Errante Carmesí';
  }
  function formatStats(){
    if(!player || !player.stats) return '';
    const s = player.stats;
    return 'VIG '+s.vig+' · MEN '+s.men+' · RES '+s.res+' · FUE '+s.fue+' · DES '+s.des+' · SAB '+s.sab+' · FE '+s.fe;
  }

  let levelUpOpen = false;
  function openLevelUp(pts){
    player.pendingPts = (player.pendingPts||0) + pts;
    levelUpOpen = true;
    const prev = state;
    state = 'LEVELUP';
    const panel = $('surv-levelup');
    const box = $('surv-level-stats');
    const ptsEl = $('surv-pts');
    if(ptsEl) ptsEl.textContent = player.pendingPts;
    if(box){
      box.innerHTML = '';
      const names = [
        ['vig','Vigor','Más vida'],
        ['men','Mente','Más FP'],
        ['res','Resistencia','Más aguante'],
        ['fue','Fuerza','Más daño melee'],
        ['des','Destreza','Velocidad y daño'],
        ['sab','Sabiduría','Magia'],
        ['fe','Fe','Milagros']
      ];
      names.forEach(function(n){
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;background:rgba(0,0,0,0.45);border:1px solid rgba(217,178,92,0.35);padding:8px 10px;border-radius:4px;';
        row.innerHTML = '<div style="text-align:left"><b style="color:#f0d99a">'+n[1]+'</b><br><span style="font-size:0.75rem;opacity:0.75">'+n[2]+' · <span data-val="'+n[0]+'">'+player.stats[n[0]]+'</span></span></div>';
        const btn = document.createElement('button');
        btn.className = 'btn-juego btn-juego--peque';
        btn.textContent = '+';
        btn.style.minWidth = '42px';
        btn.onclick = function(){
          if(player.pendingPts <= 0) return;
          player.stats[n[0]]++;
          player.pendingPts--;
          if(ptsEl) ptsEl.textContent = player.pendingPts;
          const sp = row.querySelector('[data-val="'+n[0]+'"]');
          if(sp) sp.textContent = player.stats[n[0]];
          recalcFromStats();
          updateHUD();
        };
        row.appendChild(btn);
        box.appendChild(row);
      });
    }
    if(panel){ panel.classList.remove('hidden'); panel.style.display='flex'; }
  }

  function renderDragonTree(){
    const box=$('dragon-tree-branches'); if(!box || !player) return;
    const shards=$('dragon-shards'); if(shards) shards.textContent=player.dragonShards||0;
    box.innerHTML='';
    const affinities=document.createElement('div'); affinities.className='dragon-affinities';
    ['sangre','luna','sombra','rayo'].forEach(function(aff){
      const btn=document.createElement('button'); btn.className='dragon-affinity'+(player.dragonAffinity===aff?' is-active':'');
      btn.textContent=aff.toUpperCase(); btn.onclick=function(){ player.dragonAffinity=aff; renderDragonTree(); updateHUD(); };
      affinities.appendChild(btn);
    });
    box.appendChild(affinities);
    Object.keys(DRAGON_TREE).forEach(function(branch){
      const col=document.createElement('div'); col.className='dragon-tree-branch';
      const title=document.createElement('h4'); title.textContent=branch.toUpperCase(); col.appendChild(title);
      DRAGON_TREE[branch].forEach(function(node,idx){
        const btn=document.createElement('button'); const owned=playerHasNode(node.id); const cost=idx+1;
        btn.className='dragon-tree-node'+(owned?' is-owned':'');
        btn.disabled=owned || (player.dragonShards||0)<cost;
        btn.innerHTML='<b>'+node.name+'</b><small>'+node.desc+'</small><em>'+(owned?'DESPERTADO':cost+' fragmento'+(cost>1?'s':''))+'</em>';
        btn.onclick=function(){
          if(owned || player.dragonShards<cost) return;
          player.dragonShards-=cost; player.dragonNodes.push(node.id);
          showFT('Nodo despertado',player.x,player.y-44,'#ff8294'); renderDragonTree(); updateHUD();
        };
        col.appendChild(btn);
      });
      box.appendChild(col);
    });
  }
  function openDragonTree(){
    if(!player || (state!=='PLAYING' && state!=='PAUSE' && state!=='REWARD')) return;
    const prev=state; player._dragonTreeReturn=prev; state='DRAGON_TREE';
    renderDragonTree(); const panel=$('surv-dragon-tree'); if(panel){panel.classList.remove('hidden');panel.style.display='flex';}
  }
  function closeDragonTree(){
    const panel=$('surv-dragon-tree'); if(panel){panel.classList.add('hidden');panel.style.display='none';}
    if(state==='DRAGON_TREE') state=player&&player._dragonTreeReturn==='PAUSE'?'PAUSE':'PLAYING';
    updateHUD();
  }
  function renderMapNodes(){
    const box=$('surv-map-nodes'); if(!box || !player) return; box.innerHTML='';
    REGIONS.forEach(function(region){
      const unlocked=player.unlockedRegions.indexOf(region.id)>=0;
      const btn=document.createElement('button'); btn.className='surv-map-node'+(unlocked?'':' is-locked')+(player.regionId===region.id?' is-current':'');
      btn.disabled=!unlocked; btn.style.backgroundImage='linear-gradient('+region.tint+','+region.tint+'),url("'+region.art+'")';
      btn.innerHTML='<b>'+region.name+'</b><small>'+((unlocked?'RUTA DISPONIBLE':'SELLADO POR GUARDIÁN'))+'</small>';
      btn.onclick=function(){ player.regionId=region.id; player.regionName=region.name; showFT('Ruta elegida: '+region.name,player.x,player.y-44,'#ff8294'); closeMap(); };
      box.appendChild(btn);
    });
  }
  function openMap(){
    if(!player || (state!=='PLAYING' && state!=='PAUSE')) return;
    player._mapReturn=state; state='MAP'; renderMapNodes(); const panel=$('surv-map'); if(panel){panel.classList.remove('hidden');panel.style.display='flex';}
  }
  function closeMap(){
    const panel=$('surv-map'); if(panel){panel.classList.add('hidden');panel.style.display='none';}
    if(state==='MAP') state=player&&player._mapReturn==='PAUSE'?'PAUSE':'PLAYING'; updateHUD();
  }
  function unlockNextRegion(){
    if(!player) return; const current=REGIONS.findIndex(function(r){return r.id===player.regionId;});
    const next=REGIONS[Math.min(REGIONS.length-1,current+1)];
    if(next && player.unlockedRegions.indexOf(next.id)<0){ player.unlockedRegions.push(next.id); showFT('Ruta desbloqueada: '+next.name,player.x,player.y-64,'#ffd1d8'); }
  }
  function showBossIntro(){
    if(!boss) return; const meta=BOSS_INTROS[day]||{}; state='BOSS_INTRO';
    const art=$('surv-boss-intro-art'), name=$('surv-boss-intro-name'), title=$('surv-boss-intro-title'), quote=$('surv-boss-intro-quote'), arena=$('surv-boss-intro-arena');
    if(art) art.style.backgroundImage='linear-gradient(90deg,rgba(5,2,4,.92),rgba(37,4,12,.24)),url("'+(meta.art||'')+'")';
    if(name) name.textContent=boss.nombre; if(title) title.textContent=meta.title||'Guardián del Sello'; if(quote) quote.textContent=meta.quote||'“El sello decide tu destino.”'; if(arena) arena.textContent=meta.arena||'La arena cambiará durante el combate.';
    const panel=$('surv-boss-intro'); if(panel){panel.classList.remove('hidden');panel.style.display='flex';}
  }
  function beginBossFight(){
    const panel=$('surv-boss-intro'); if(panel){panel.classList.add('hidden');panel.style.display='none';}
    if(boss){ boss.introPlayed=true; showFT('¡'+boss.nombre+' despierta!',boss.x,boss.y-54,'#ff8294'); }
    state='PLAYING'; updateHUD();
  }

  function closeLevelUp(){
    const panel = $('surv-levelup');
    if(panel){ panel.classList.add('hidden'); panel.style.display='none'; }
    levelUpOpen = false;
    recalcFromStats();
    // si aún hay puntos, no forzar
    if(player.pendingPts > 0){
      // dejar pendiente para próximo nivel visual
    }
    if(state === 'LEVELUP') state = 'PLAYING';
    updateHUD();
  }


  function getWeapon(){ return WEAPONS[player.weapon] || WEAPONS.espadalarga; }

  // ========== ENLACE DEL CENTINELA: LANZA ↔ BALLESTA ==========
  function hasWeapon(id){ return ownedWeapons.indexOf(id) >= 0; }
  function setActiveWeapon(id){
    if(!player || !hasWeapon(id)) return false;
    player.weapon = id;
    weaponIdx = ownedWeapons.indexOf(id);
    return true;
  }
  function toggleLanceBowCombo(){
    if(!player || state!=='PLAYING') return;
    if(!hasWeapon('lanza') || !hasWeapon('ballesta')){
      showFT('Requiere Lanza + Ballesta', player.x, player.y-34, '#ffb74d');
      return;
    }
    player.lanceBowMode = !player.lanceBowMode;
    player.lanceBowStep = 0;
    player.lanceBowTimer = 0;
    if(player.lanceBowMode){
      setActiveWeapon('lanza');
      showFT('ENLACE DEL CENTINELA', player.x, player.y-38, '#d9b25c');
    } else {
      showFT('Enlace desactivado', player.x, player.y-34, '#cdbfa0');
    }
    updateHUD();
  }
  function comboMeleeStrike(ang, dmg, range, color, life){
    const hx = player.x + Math.cos(ang)*range*0.62;
    const hy = player.y + Math.sin(ang)*range*0.62;
    slashFX.push({x:hx, y:hy, life:life, max:life, ang:ang, color:color});
    let hit=false;
    for(let i=0;i<enemies.length;i++){
      const e=enemies[i]; if(e.hp<=0) continue;
      if(Math.hypot(e.x-hx, e.y-hy) < range*0.55+e.r){
        damageEnemy(e, {dmg:dmg, crit:false});
        if(player.weapon==='lanza') applyCombatState(e,'anchored',115);
        hit=true;
      }
    }
    if(boss && boss.hp>0 && Math.hypot(boss.x-hx, boss.y-hy) < range*0.55+boss.r){
      damageBoss({dmg:dmg, crit:false});
      if(player.weapon==='lanza') applyCombatState(boss,'anchored',115);
      hit=true;
    }
    if(hit) screenFlash=4;
  }
  function comboBolt(ang, dmg, speed, spread, judgmentBolt){
    const a = ang + spread;
    projectiles.push({
      x:player.x, y:player.y, px:player.x, py:player.y,
      vx:Math.cos(a)*speed, vy:Math.sin(a)*speed,
      dmg:dmg * player.dmgMul * (bloodMoon?1.1:1),
      r:6, life:110, color:'#d9b25c', fromPlayer:true, comboBolt:true, markBolt:true, judgmentBolt:!!judgmentBolt, weaponId:player.weapon, posture:6,
      trailLife: judgmentBolt ? 7 : 0
    });
  }
  function tryLanceBowCombo(){
    if(!player || !player.lanceBowMode || player.atkCd>0 || player.isDodging) return;
    if(!hasWeapon('lanza') || !hasWeapon('ballesta')){ player.lanceBowMode=false; return; }
    if(player.lanceBowTimer<=0) player.lanceBowStep=0;
    player.lanceBowStep = (player.lanceBowStep % 4) + 1;
    player.lanceBowTimer = 78;
    const ang = Math.atan2(mouse.y - (player.y-cam.y), mouse.x - (player.x-cam.x));
    player.facing = Math.cos(ang) >= 0 ? 1 : -1;
    player.dirRow = vagabundoDirectionRow(Math.cos(ang), Math.sin(ang));
    const spear=WEAPONS.lanza, crossbow=WEAPONS.ballesta;
    if(player.lanceBowStep===1){
      setActiveWeapon('lanza'); player.atkCd=26; player.sta=Math.max(0, player.sta-9);
      player.anim='attack-light'; player.animStart=animT;
      comboMeleeStrike(ang, spear.dmg*1.25, spear.range*1.16, spear.color, 14);
      showFT('ENLACE 1/4 · EMBESTIDA', player.x, player.y-34, '#d9b25c');
    } else if(player.lanceBowStep===2){
      setActiveWeapon('ballesta'); player.atkCd=30; player.sta=Math.max(0, player.sta-6);
      player.anim='attack-light'; player.animStart=animT;
      comboBolt(ang, crossbow.dmg*1.12, 15, 0, false);
      spawnP(player.x, player.y, '#d9b25c', 8);
      showFT('ENLACE 2/4 · DISPARO VELOZ', player.x, player.y-34, '#d9b25c');
    } else if(player.lanceBowStep===3){
      setActiveWeapon('lanza'); player.atkCd=38; player.sta=Math.max(0, player.sta-16);
      player.anim='attack-heavy'; player.animStart=animT;
      comboMeleeStrike(ang, spear.dmg*2.05, spear.range*1.38, '#4dd0e1', 19);
      showFT('ENLACE 3/4 · BARRIDO PERFORANTE', player.x, player.y-34, '#4dd0e1');
    } else {
      setActiveWeapon('ballesta'); player.atkCd=50; player.sta=Math.max(0, player.sta-18);
      player.anim='attack-heavy'; player.animStart=animT;
      comboBolt(ang, crossbow.dmg*1.06, 14, -0.20, true);
      comboBolt(ang, crossbow.dmg*1.22, 16, 0, true);
      comboBolt(ang, crossbow.dmg*1.06, 14, 0.20, true);
      spawnJudgmentLaunch(player.x, player.y, ang);
      triggerScreenShake(12, 10);
      screenFlash=Math.max(screenFlash, 9);
      showFT('ENLACE 4/4 · JUICIO TRIPLE', player.x, player.y-38, '#f0d99a');
    }
    updateHUD();
  }

  function tryFlask(){
        if(!player || state!=='PLAYING') return;
    if(player.flasks <= 0){ showFT('¡Sin frascos!', player.x, player.y-28, '#e53935'); return; }
    if(player.hp >= player.maxHp && player.fp >= player.maxFp){ showFT('Ya estás al máximo', player.x, player.y-28, '#81c784'); return; }
    if(player.isDodging || player.isParrying) return;
    player.flasks--;
    const flaskMul=playerHasCurse('bloodHungry')?0.7:1;
    const heal = Math.round(player.maxHp * 0.45*flaskMul);
    const fpH = Math.round(player.maxFp * 0.35*flaskMul);
    player.hp = Math.min(player.maxHp, player.hp + heal);
    player.fp = Math.min(player.maxFp, player.fp + fpH);
    showFT('+'+heal+' HP', player.x, player.y-28, '#66bb6a');
    spawnP(player.x, player.y, '#66bb6a', 12);
    updateHUD();
  }

  function tryDodge(){
    if(!player || state!=='PLAYING') return;
    if(player.manaChargeActive) return;
    if(player.dodgeCd>0 || player.isDodging || player.isParrying) return;
    if(player.sta < 22){ showFT('¡Sin aguante!', player.x, player.y-28, '#ffb74d'); return; }
    player.sta -= 22;
    player.isDodging = true;
    player.dodgeTimer = 14;
    if(playerHasNode('vuelo-ceniza')) dragonFX.push({type:'ashTrail',x:player.x,y:player.y,life:36,maxLife:36,radius:68});
    player.dodgeCd = 32;
    player.justDodgedTimer = 20;
    player.invuln = Math.max(player.invuln, 14);
    // dirección: movimiento o facing
    let dx=0, dy=0;
    if(keys['w']||keys['arrowup']) dy-=1;
    if(keys['s']||keys['arrowdown']) dy+=1;
    if(keys['a']||keys['arrowleft']) dx-=1;
    if(keys['d']||keys['arrowright']) dx+=1;
    if(!dx && !dy){ dx = player.facing; dy = 0; }
    const l = Math.hypot(dx,dy)||1;
    player.dodgeDirX = dx/l;
    player.dodgeDirY = dy/l;
    player.anim = 'run'; player.animStart = animT;
    spawnP(player.x, player.y, '#87ceeb', 8);
  }

  function tryParry(){
    if(!player || state!=='PLAYING') return;
    if(player.manaChargeActive) return;
    if(player.parryCd>0 || player.isDodging || player.isParrying) return;
    if(player.sta < 15){ showFT('¡Sin aguante!', player.x, player.y-28, '#ffb74d'); return; }
    player.sta -= 15;
    player.isParrying = true;
    player.parryTimer = 12; // ventana de parry
    player.parryCd = 40;
    showFT('Parry', player.x, player.y-24, '#f0d99a');
  }

  function findExecutionTarget(){
    if(!player) return null; let candidate=null, best=Infinity;
    enemies.forEach(function(e){
      if(e.hp<=0) return; const d=Math.hypot(e.x-player.x,e.y-player.y);
      if(d<94 && (stateOf(e).vulnerable>0 || (e.elite && e.hp/e.maxHp<.18)) && d<best){ candidate=e; best=d; }
    });
    if(boss && boss.hp>0){ const d=Math.hypot(boss.x-player.x,boss.y-player.y); if(d<110 && stateOf(boss).vulnerable>0 && d<best) candidate=boss; }
    return candidate;
  }
  function tryExecution(){
    if(!player || state!=='PLAYING' || player.executionTimer>0 || player.isDodging) return;
    const target=findExecutionTarget();
    if(!target){ showFT('Sin objetivo vulnerable',player.x,player.y-32,'#cdbfa0'); return; }
    player.executionTimer=28; player.invuln=Math.max(player.invuln,28); player.executionTarget=target;
    const ang=Math.atan2(target.y-player.y,target.x-player.x); player.facing=Math.cos(ang)>=0?1:-1; player.anim='attack-heavy'; player.animStart=animT;
    dragonFX.push({type:'execution',x:target.x,y:target.y,ang:ang,life:28,maxLife:28,radius:Math.max(44,target.r*1.8)});
    triggerScreenShake(14,9); screenFlash=12;
    const dmg=target===boss?125:Math.max(55,target.maxHp*.8);
    if(target===boss) damageBoss({dmg:dmg,crit:false,skill:true}); else damageEnemy(target,{dmg:dmg,crit:false,skill:true});
    player.fp=Math.min(player.maxFp,player.fp+14); player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.08);
    if(playerHasNode('corazon-voraz')){ player.dragonRoarCd=Math.max(0,player.dragonRoarCd-30); player.dragonBreathCd=Math.max(0,player.dragonBreathCd-30); }
    if(playerHasRelic('executionVeil')) player.invuln=Math.max(player.invuln,72);
    showFT('EJECUCIÓN',target.x,target.y-target.r-28,'#fff1f4'); updateHUD();
  }

  function onPlayerHit(dmg, fromBoss){
    if(!player || player.hp<=0) return;
    // Solo durante el rolar cuenta como esquiva (no el i-frame post-golpe)
    if(player.isDodging){
      showFT('¡Esquivado!', player.x, player.y-28, '#87ceeb');
      return;
    }
    if(player.invuln>0) return; // invulnerable silencioso tras daño
    if(player.manaChargeActive) cancelManaCharge(true);
    if(player.dragonWard>0){ dmg*=0.82; spawnP(player.x,player.y,'#ff8294',5); }
    // parry window
    if(player.isParrying && player.parryTimer>0){
      showFT('¡PARRY!', player.x, player.y-30, '#d9b25c');
      spawnP(player.x, player.y, '#d9b25c', 14);
      screenFlash = 5;
      player.isParrying = false; player.parryTimer = 0;
      if(player.weapon==='escudo') player.dragonWard=Math.max(player.dragonWard,72);
      for(let i=0;i<enemies.length;i++){
        const e=enemies[i];
        if(e.hp>0 && Math.hypot(e.x-player.x,e.y-player.y)<85){
          e.frozen = 240; // ~4s
          applyCombatState(e,'vulnerable',150);
          e.hitFlash=12;
          showFT('VULNERABLE', e.x, e.y-28, '#ffd1d8');
        }
      }
      if(boss && boss.hp>0 && Math.hypot(boss.x-player.x,boss.y-player.y)<100){
        boss.frozen = 240; applyCombatState(boss,'vulnerable',150); boss.hitFlash = 12;
        showFT('VULNERABLE', boss.x, boss.y-40, '#ffd1d8');
      }
      return;
    }
    if(player.weapon==='escudo') dmg *= 0.5;
    player.hp -= dmg;
    player.invuln = fromBoss ? 25 : 18;
    showFT('-'+Math.round(dmg), player.x, player.y-25, '#e53935');
    spawnP(player.x, player.y, '#e53935', 6);
    screenFlash = fromBoss ? 6 : 4;
    if(player.hp<=0){ player.hp=0; state='DEAD'; showEnd(false); }
  }


  // ========== DAYS / MOONS ==========
  function isBossDay(d){ return d % BOSS_EVERY === 0; }
  function dayDurationSeconds(d){ return d<=10 ? EARLY_DAY_SECONDS : LATE_DAY_SECONDS; }
  function isGlintDay(d){ return d % 2 === 0; } // every 2 days
  function isBloodDay(d){ return isBossDay(d); }

  function startDay(){
    // Los días de jefe no tienen cuenta regresiva: terminan al derrotar al jefe.
    dayTime = isBossDay(day) ? 0 : dayDurationSeconds(day);
    bloodMoon = isBloodDay(day);
    glintMoon = isGlintDay(day);
    enemies = [];
    projectiles = [];
    boss = null;
    arenaHazards = [];
    dragonZones = []; dragonPending = [];
    initMapDecor();
    spawnAcc = 0; spawnSerial = 0;
    if(isBossDay(day)){
      const def = BOSSES.find(b => b.day === day) || BOSSES[BOSSES.length-1];
      boss = {
        id: def.id, nombre: def.nombre,
        x: player.x + 300, y: player.y,
        hp: def.hp * BOSS_HP_MULT * (1 + (day/66)*0.5), maxHp: def.hp * BOSS_HP_MULT * (1 + (day/66)*0.5),
        dmg: def.dmg * BOSS_DMG_MULT, spd: def.spd, r: def.r * BOSS_SIZE_MULT, color: def.color,
        cd: 0, state: 'CHASE', phase2: false, sprite2: !!def.sprite2, unique:def.unique, uniqueCd:96, uniqueBaseCd:def.abilityCd,
        hitFlash: 0, postureMax: Math.round((160+(day*2))*2.3), posture:Math.round((160+(day*2))*2.3), postureBroken:0, combatStates:{marked:0,anchored:0,vulnerable:0}, introPlayed:false
      };
    }
    if(player){
      player._breakUsed=false;
      player.flasks = Math.min(player.maxFlasks, player.flasks + 1);
      player.dragonShards = (player.dragonShards||0) + (isBossDay(day)?3:1);
      showFT('+'+(isBossDay(day)?3:1)+' fragmento'+(isBossDay(day)?'s':''), player.x, player.y-64, '#ff8294');
    }
    // checkpoint cada 3 días
    if(day % 3 === 1){
      checkpoints.push({
        day: day, level: level, xp: xp, xpNext: xpNext,
        stats: player ? JSON.parse(JSON.stringify(player.stats)) : null,
        pendingPts: player ? player.pendingPts : 0,
        weapons: ownedWeapons.slice(), weapon: player ? player.weapon : 'espadalarga',
        maxHp: player ? player.maxHp : 220, flasks: player ? player.flasks : 5,
        dragonShards: player ? player.dragonShards : 0, dragonNodes: player ? player.dragonNodes.slice() : [],
        relics: player ? player.relics.slice() : [], curses: player ? player.curses.slice() : [],
        unlockedRegions: player ? player.unlockedRegions.slice() : ['valle'], regionId: player ? player.regionId : 'valle'
      });
      if(player && player.moonbladeObtained) checkpoints[checkpoints.length-1].moonbladeObtained=true;
      if(checkpoints.length>8) checkpoints.shift();
      showFT('Checkpoint día '+day, player.x, player.y-50, '#d9b25c');
    }
    updateMoonUI();
    if(boss) showBossIntro();
    else state = 'PLAYING';
  }

  function initMapDecor(){
    mapDecor=[];
    DECOR_ASSETS.forEach(function(spec){ if(!decorImages[spec.src]){ decorImages[spec.src]=new Image(); decorImages[spec.src].src=spec.src; } });
    const count=settings.performanceMode?30:68;
    for(let i=0;i<count;i++){
      const spec=DECOR_ASSETS[Math.floor(Math.random()*DECOR_ASSETS.length)], character=!!spec.character;
      const x=70+Math.random()*(MAP_W-140), y=70+Math.random()*(MAP_H-140);
      if(player && Math.hypot(x-player.x,y-player.y)<190){ i--; continue; }
      mapDecor.push({x:x,y:y,src:spec.src,sx:spec.sx,sy:spec.sy,sw:spec.sw,sh:spec.sh,w:spec.w,h:spec.h,alpha:spec.alpha,character:character,kind:spec.kind});
    }
    const landmarkKinds=['altar','chest','teleport','ritual','crystal','fire'];
    const landmarkPoints=[[260,260],[1740,260],[260,1740],[1740,1740],[1000,260],[1000,1740]];
    landmarkKinds.forEach(function(kind,idx){
      const spec=DECOR_ASSETS.find(function(item){ return item.kind===kind; });
      if(!spec) return;
      mapDecor.push({x:landmarkPoints[idx][0],y:landmarkPoints[idx][1],src:spec.src,sx:spec.sx,sy:spec.sy,sw:spec.sw,sh:spec.sh,w:spec.w,h:spec.h,alpha:spec.alpha,character:!!spec.character,kind:kind,landmark:true});
    });
  }
  function updateMoonUI(){
    const el = $('surv-moon');
    if(!el) return;
    let t = [];
    if(bloodMoon) t.push('🩸 Luna de Sangre');
    if(glintMoon) t.push('✨ Luna Glintstone (magia ∞)');
    el.textContent = t.join(' · ');
  }

  function endDay(){
    if(state !== 'PLAYING') return;
    if(!isBossDay(day) && day>1 && Math.random()<0.46){ showEvent(); return; }
    state = 'REWARD';
    showRewards();
  }

  // ========== EVENTOS, RELIQUIAS Y MALDICIONES ==========
  const EVENT_POOL = [
    {id:'altar', title:'Altar de Escamas', text:'El altar exige un fragmento de tu vitalidad para abrir una ruta de poder.', choices:[
      {label:'Ofrendar sangre', desc:'-10% vida máxima · +2 fragmentos', run:function(){ player.maxHp=Math.max(60,Math.floor(player.maxHp*.9)); player.hp=Math.min(player.hp,player.maxHp); player.dragonShards+=2; }},
      {label:'Purificar altar', desc:'+1 fragmento · recupera 20 FP', run:function(){ player.dragonShards++; player.fp=Math.min(player.maxFp,player.fp+20); }}
    ]},
    {id:'caravana', title:'Caravana de Ceniza', text:'Mercaderes atrapados entre ceniza ofrecen un pacto que puede cambiar tu build.', choices:[
      {label:'Proteger caravana', desc:'Recibe una reliquia', run:function(){ addRelic(RELIC_POOL[Math.floor(Math.random()*RELIC_POOL.length)]); }},
      {label:'Saquear sellos', desc:'+3 fragmentos · obtienes Peso de Ceniza', run:function(){ player.dragonShards+=3; addCurse(CURSE_POOL[1]); }}
    ]},
    {id:'cofre', title:'Cofre Maldito', text:'Un cofre late como un corazón. Su contenido promete poder sin garantías.', choices:[
      {label:'Abrir el cofre', desc:'Reliquia rara · maldición aleatoria', run:function(){ addRelic(RELIC_POOL[Math.floor(Math.random()*RELIC_POOL.length)]); addCurse(CURSE_POOL[Math.floor(Math.random()*CURSE_POOL.length)]); }},
      {label:'Sellar el cofre', desc:'+1 frasco · +1 fragmento', run:function(){ player.flasks=Math.min(player.maxFlasks,player.flasks+1); player.dragonShards++; }}
    ]},
    {id:'grieta', title:'Grieta Dracónica', text:'La grieta responde al Sello y ofrece un atajo hacia una afinidad prohibida.', choices:[
      {label:'Atravesar grieta', desc:'+2 fragmentos · -18 FP máximo temporal', run:function(){ player.dragonShards+=2; player.maxFp=Math.max(20,player.maxFp-18); player.fp=Math.min(player.fp,player.maxFp); }},
      {label:'Sellar grieta', desc:'Curación total · +1 nivel', run:function(){ player.hp=player.maxHp; player.fp=player.maxFp; levelUp(); }}
    ]}
  ];
  function addRelic(relic){
    if(!player || !relic) return;
    if(!player.relics.some(function(r){return r.id===relic.id;})) player.relics.push(relic);
    showFT('RELIQUIA · '+relic.name,player.x,player.y-46,'#ffd1d8');
  }
  function addCurse(curse){
    if(!player || !curse) return;
    if(!player.curses.some(function(r){return r.id===curse.id;})) player.curses.push(curse);
    showFT('MALDICIÓN · '+curse.name,player.x,player.y-66,'#ff718a');
    recalcFromStats();
  }
  function showEvent(){
    if(!player) return;
    const evt=EVENT_POOL[Math.floor(Math.random()*EVENT_POOL.length)];
    state='EVENT'; const panel=$('surv-event'), title=$('surv-event-title'), sub=$('surv-event-sub'), opts=$('surv-event-opts');
    if(title) title.textContent=evt.title; if(sub) sub.textContent=evt.text;
    if(opts){ opts.innerHTML=''; evt.choices.forEach(function(choice){
      const btn=document.createElement('button'); btn.className='btn-juego btn-juego--peque';
      btn.innerHTML='<b>'+choice.label+'</b><br><span style="font-size:.78rem;opacity:.85">'+choice.desc+'</span>';
      btn.onclick=function(){ choice.run(); if(panel){panel.classList.add('hidden');panel.style.display='none';} state='REWARD'; showRewards(); updateHUD(); };
      opts.appendChild(btn);
    }); }
    if(panel){panel.classList.remove('hidden');panel.style.display='flex';}
  }

  // ========== REWARDS ==========
  const REWARD_ICON_PATHS = {
    katana:'assets/drakzeth/renewal/ui/katana.png',
    arco:'assets/drakzeth/renewal/ui/arco.png',
    baston:'assets/drakzeth/renewal/ui/baston.png',
    granespada:'assets/drakzeth/renewal/ui/granespada.png',
    ballesta:'assets/drakzeth/renewal/ui/ballesta.png',
    sello:'assets/drakzeth/renewal/ui/sello.png',
    lanza:'assets/drakzeth/renewal/ui/lanza.png',
    daga:'assets/drakzeth/renewal/ui/daga.png',
    escudo:'assets/drakzeth/renewal/ui/escudo.png',
    riosdesangre:'assets/drakzeth/renewal/ui/riosdesangre.png',
    colmillosabueso:'assets/drakzeth/renewal/ui/colmillosabueso.png',
    espadablasfema:'assets/drakzeth/renewal/ui/espadablasfema.png',
    espadonluna:'assets/drakzeth/renewal/ui/espadonluna.png',
    martillorubi:'assets/drakzeth/renewal/ui/martillorubi.png'
  };
  const REWARD_FALLBACK_ICON='assets/drakzeth/renewal/ui/espadalarga.png';
  const REWARD_POOL = [
    { tipo:'arma', id:'katana', label:'Katana', desc:'Ataque rápido' },
    { tipo:'arma', id:'arco', label:'Arco', desc:'Alcance medio' },
    { tipo:'arma', id:'baston', label:'Bastón Glintstone', desc:'Magia a distancia' },
    { tipo:'arma', id:'granespada', label:'Gran Espada', desc:'Alto daño' },
    { tipo:'arma', id:'ballesta', label:'Ballesta', desc:'Proyectil potente' },
    { tipo:'arma', id:'sello', label:'Sello Sagrado', desc:'Fe ofensiva' },
    { tipo:'arma', id:'lanza', label:'Lanza', desc:'Gran alcance melee' },
    { tipo:'arma', id:'daga', label:'Daga', desc:'Velocidad extrema' },
    { tipo:'arma', id:'escudo', label:'Escudo de Hierro', desc:'Bloquea 50% daño' },
    { tipo:'arma', id:'riosdesangre', label:'Ríos de Sangre', desc:'Katana legendaria' },
    { tipo:'arma', id:'colmillosabueso', label:'Colmillo de Sabueso', desc:'Críticos altos' },
    { tipo:'arma', id:'espadablasfema', label:'Espada Blasfema', desc:'Poder infernal' },
    { tipo:'arma', id:'espadonluna', label:'Espadón Luna Negra', desc:'Arma rara · T: Luna Fría · Y: Espada Astral' },
    { tipo:'arma', id:'martillorubi', label:'Martillo de Rubí', desc:'Golpes devastadores' },
    { tipo:'stat', id:'hp', label:'+25 Vida Máx', desc:'Más resistencia' },
    { tipo:'stat', id:'dmg', label:'+12% Daño', desc:'Más poder' },
    { tipo:'stat', id:'spd', label:'+8% Velocidad', desc:'Más movilidad' },
    { tipo:'stat', id:'fp', label:'+20 FP Máx', desc:'Más magia' },
    { tipo:'heal', id:'full', label:'Curación total', desc:'HP y FP al máximo' },
    { tipo:'runas', id:'runas', label:'Bendición de Runas', desc:'+1 nivel inmediato' }
  ];

  function pickRewards(){
    const lunarEligible = day>=18 && player && !player.moonbladeObtained && Math.random() < (day>=34 ? .22 : .12);
    const pool = REWARD_POOL.filter(function(r){ return r.id!=='espadonluna' || lunarEligible; });
    // filter already owned weapons somewhat
    const opts = [];
    while(opts.length < 3 && pool.length){
      const i = Math.floor(Math.random()*pool.length);
      opts.push(pool.splice(i,1)[0]);
    }
    return opts;
  }

  function showRewards(){
    rewardChoices = pickRewards();
    luckyTriple = Math.random() < LUCKY_PCT;
    const panel = $('surv-reward');
    const title = $('surv-reward-title');
    const sub = $('surv-reward-sub');
    const opts = $('surv-reward-opts');
    const lucky = $('surv-lucky');
    if(title) title.textContent = day >= TOTAL_DAYS ? '¡Día 66 superado!' : ('Día '+day+' superado');
    if(sub) sub.textContent = luckyTriple ? 'Fortuna: puedes tomar las 3' : 'Elige una recompensa';
    if(lucky) lucky.style.display = luckyTriple ? 'block' : 'none';
    if(opts){
      opts.innerHTML = '';
      rewardChoices.forEach(function(r, idx){
        const btn = document.createElement('button');
        btn.className = 'btn-juego btn-juego--peque';
        btn.style.minWidth = '160px';
        const rewardIcon = r.tipo==='arma' ? '<img class="reward-weapon-icon" src="'+(REWARD_ICON_PATHS[r.id]||REWARD_FALLBACK_ICON)+'" data-reward-id="'+r.id+'" alt="Icono de '+r.label+'" onerror="this.onerror=null;this.src=\''+REWARD_FALLBACK_ICON+'\';this.classList.add(\'reward-weapon-icon--fallback\');">' : '<span class="reward-glyph">✦</span>';
        btn.innerHTML = rewardIcon+'<b>'+r.label+'</b><br><span style="font-size:0.8rem;opacity:0.8">'+r.desc+'</span>';
        btn.onclick = function(){ claimReward(idx); };
        opts.appendChild(btn);
      });
      if(luckyTriple){
        const all = document.createElement('button');
        all.className = 'btn-juego';
        all.style.marginTop = '0.5rem';
        all.textContent = '✦ Tomar las 3 recompensas';
        all.onclick = function(){ claimAll(); };
        opts.appendChild(all);
      }
    }
    if(panel){ panel.classList.remove('hidden'); panel.style.display='flex'; }
  }

  function applyReward(r){
    if(r.tipo==='arma'){
      if(ownedWeapons.indexOf(r.id)<0) ownedWeapons.push(r.id);
      if(r.id==='espadonluna') player.moonbladeObtained=true;
      player.weapon = r.id; weaponIdx = ownedWeapons.indexOf(r.id);
    } else if(r.tipo==='stat'){
      if(r.id==='hp'){ player.maxHp+=25; player.hp+=25; }
      if(r.id==='dmg') player.dmgMul *= 1.12;
      if(r.id==='spd') player.spdMul *= 1.08;
      if(r.id==='fp'){ player.maxFp+=20; player.fp+=20; }
    } else if(r.tipo==='heal'){
      player.hp = player.maxHp; player.fp = player.maxFp; player.sta = player.maxSta;
    } else if(r.tipo==='runas'){
      levelUp();
    }
  }

  function claimReward(idx){
    applyReward(rewardChoices[idx]);
    closeReward();
  }
  function claimAll(){
    rewardChoices.forEach(applyReward);
    closeReward();
  }
  function closeReward(){
    const panel = $('surv-reward');
    if(panel){ panel.classList.add('hidden'); panel.style.display='none'; }
    if(day >= TOTAL_DAYS){
      state = 'WIN';
      showEnd(true);
      return;
    }
    day++;
    player.hp = Math.min(player.maxHp, player.hp + player.maxHp*0.25);
    player.fp = Math.min(player.maxFp, player.fp + 20);
    startDay();
  }

  function levelUp(){
    level++;
    xp = Math.max(0, xp - xpNext);
    xpNext = Math.floor(xpNext * 1.22);
    pendingLevelPts += 3;
    player.pendingPts = (player.pendingPts||0) + 3;
    showFT('¡Nivel '+level+'! (+3 pts)', player.x, player.y-40, '#d9b25c');
    const btn = $('surv-level-btn');
    if(btn){ btn.style.display='block'; btn.textContent = 'Subir nivel ('+player.pendingPts+' pts)'; }
  }

  function showEnd(win){
    const mobileControls=$('surv-mobile'); if(mobileControls) mobileControls.classList.remove('is-active');
    const panel = $('surv-end');
    const title = $('surv-end-title');
    const sub = $('surv-end-sub');
    const deadActions = $('surv-dead-actions');
    const deadCp = $('surv-dead-checkpoint');
    const restart = $('surv-restart');
    if(title) title.textContent = win ? 'El Errante prevalece' : 'Has caído';
    if(sub) sub.textContent = win ? ('Completaste los '+TOTAL_DAYS+' días') : ('Caíste en el día '+day+' · Kills: '+kills+' · Elige cómo continuar');
    if(deadActions) deadActions.style.display=win?'none':'flex';
    if(deadCp){ deadCp.disabled=!checkpoints.length; deadCp.textContent=checkpoints.length ? ('Volver al checkpoint del día '+checkpoints[checkpoints.length-1].day) : 'No hay checkpoint disponible'; }
    if(restart) restart.textContent=win?'Volver al inicio':'Nueva partida';
    if(panel){ panel.classList.remove('hidden'); panel.style.display='flex'; }
  }

  // ========== COMBAT ==========
  function tryAttack(){
    if(!player || player.atkCd>0 || player.isDodging || player.dragonCast>0 || player.manaChargeActive) return;
    if(player.lanceBowMode){ tryLanceBowCombo(); return; }
    const w = getWeapon();
    if(w.tipo==='magic' && !glintMoon){
      if(player.fp < (w.fp||8)) return;
      player.fp -= (w.fp||8);
    }
    if(w.tipo==='shield') return;

    const ang = Math.atan2(mouse.y - (player.y-cam.y), mouse.x - (player.x-cam.x));
    player.facing = Math.cos(ang) >= 0 ? 1 : -1;
    player.dirRow = vagabundoDirectionRow(Math.cos(ang), Math.sin(ang));

    // === COMBOS melee ===
    if(!w.proj && w.tipo==='melee'){
      const maxCombo = w.combos || 3;
      if(player.comboTimer <= 0) player.comboStep = 0;
      player.comboStep = (player.comboStep % maxCombo) + 1;
      player.comboTimer = 55; // ventana para continuar combo

      // tiempos más lentos y justos por golpe del combo
      // 1: ligero, 2: medio, 3+: pesado finisher
      let stepCd, dmgMul, rangeMul, animName, slashLife;
      if(player.comboStep === 1){
        stepCd = Math.max(26, Math.floor(w.cd * 0.95));
        dmgMul = 0.9; rangeMul = 0.95; animName = 'attack-light'; slashLife = 12;
      } else if(player.comboStep === 2){
        stepCd = Math.max(30, Math.floor(w.cd * 1.1));
        dmgMul = 1.1; rangeMul = 1.05; animName = 'attack-light'; slashLife = 14;
      } else {
        stepCd = Math.max(38, Math.floor(w.cd * 1.35));
        dmgMul = 1.45; rangeMul = 1.15; animName = 'attack-heavy'; slashLife = 16;
        player.comboStep = 0; // reinicia tras finisher
        player.comboTimer = 0;
      }
      // no spamear: mínimo ~0.45s entre golpes
      player.atkCd = Math.max(stepCd, 27);
      player.sta = Math.max(0, player.sta - (6 + player.comboStep));
      player.anim = animName;
      player.animStart = animT;

      const range = w.range * rangeMul;
      const hx = player.x + Math.cos(ang)*range*0.62;
      const hy = player.y + Math.sin(ang)*range*0.62;
            slashFX.push({x:hx, y:hy, life:slashLife, max:slashLife, ang:ang, color:w.color});
      spawnRenewalFX('smear',hx,hy,ang,player.comboStep===0?108:128);
      const hitW = { dmg: w.dmg * dmgMul, crit: (w.crit || 0) + (player.weapon==='daga' && player.justDodgedTimer>0 ? .9 : 0), heavy: player.comboStep===0, weaponId:player.weapon, posture: player.comboStep===0 ? 22 : (player.comboStep===1 ? 7 : 11) };
      let hit=false;
      for(let i=0;i<enemies.length;i++){
        const e=enemies[i]; if(e.hp<=0) continue;
        if(Math.hypot(e.x-hx, e.y-hy) < range*0.55+e.r){
          damageEnemy(e, hitW); hit=true;
        }
      }
      if(boss && boss.hp>0 && Math.hypot(boss.x-hx, boss.y-hy) < range*0.55+boss.r){
        damageBoss(hitW); hit=true;
      }
      if(hit) screenFlash = player.comboStep===0 ? 5 : 2;
      if(player.comboStep===0) showFT('COMBO', player.x, player.y-32, '#f0d99a');
      return;
    }

    // ranged / magic (sin combo)
    player.atkCd = w.cd;
    player.anim = w.tipo==='magic' ? 'cast' : 'attack-light';
    player.animStart = animT;
    player.comboStep = 0; player.comboTimer = 0;
    if(w.proj){
      const spd = w.projSpd || 8;
      projectiles.push({
        x:player.x, y:player.y,
        vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd,
        dmg: w.dmg * player.dmgMul * (bloodMoon?1.1:1),
        r:5, life:90, color:w.color, fromPlayer:true, weaponId:player.weapon, posture:player.weapon==='martillorubi'?14:6
      });
      spawnP(player.x, player.y, w.color, 6);
    }
  }

  function damageEnemy(e, w){
    const weaponId=w.weaponId||player.weapon;
    let dmg = w.dmg * player.dmgMul;
    if(e.role==='guardian' && !w.heavy && !w.skill) dmg*=e.shieldFactor||.52;
    if(e.barrier>0) dmg*=e.barrierPower||.55;
    if(e.hunterMark){ dmg*=1.22; e.hunterMark=0; }
    if(weaponId==='colmillosabueso' && (e.role==='assassin'||e.role==='charger'||e.role==='mimic')) dmg*=1.25;
    if(stateOf(e).vulnerable>0){
      dmg*=1.28;
      if(playerHasRelic('breakPower') && !player._breakUsed){ dmg*=1.35; player._breakUsed=true; }
    }
    if(w.skill) dmg*=1+dragonValue('skillDamage',0);
    if(player.dragonHeartTimer>0) dmg*=1.28;
    if(playerHasCurse('bloodHungry')) dmg*=1.25;
    if(w.crit && Math.random()<0.18){ dmg*=w.crit; showFT('CRÍTICO', e.x, e.y-30, '#ffeb3b'); }
    e.hp -= dmg; e.hitFlash=6;
    spawnRenewalFX('hit',e.x,e.y,Math.random()*Math.PI*2,Math.max(58,e.r*3.1));
    applyPostureDamage(e,postureDamageForHit(w));
    applyWeaponPassive(e,weaponId,w,dmg);
    showFT(stateOf(e).vulnerable>0 ? 'RUPTURA -'+Math.round(dmg) : '-'+Math.round(dmg), e.x, e.y-20, stateOf(e).vulnerable>0 ? '#ffd1d8' : '#f0d99a');
    spawnP(e.x, e.y, e.color, 8);
    if(e.hp<=0 && e.large && !e.rageUsed && Math.random()<e.enrageChance){
      e.rageUsed=true; e.enraged=true; e.maxHp=Math.max(1,e.maxHp*2); e.hp=e.maxHp; e.spd*=1.18; e.dmg*=1.22; e.meteorRainCd=24; e.color='#ff3d67';
      e.frozen=0; applyCombatState(e,'vulnerable',0); spawnP(e.x,e.y,'#ff3d67',26); dragonFX.push({type:'markBurst',x:e.x,y:e.y,life:34,maxLife:34,radius:e.r*2.2}); triggerScreenShake(10,6); showFT('¡ENFURECIDO!',e.x,e.y-e.r-24,'#ff718a'); return;
    }
    if(e.hp<=0){
      kills++;
      const baseXp = (e.xp||12) + Math.floor(day*1.5);
      const gain = Math.round(baseXp * (e.elite?1.8:1) * (player.xpMul||1));
      xp += gain;
      showFT('+'+gain+' XP', e.x, e.y-36, '#81c784');
      if(player.weapon==='espadablasfema'){ const heal=Math.round(player.maxHp*.035); player.hp=Math.min(player.maxHp,player.hp+heal); }
      while(xp>=xpNext) levelUp();
      spawnP(e.x, e.y, '#d9b25c', 12);
    }
  }

  function enterBossPhase2(){
    if(!boss || boss.phase2) return;
    boss.phase2=true; boss.spd*=1.16; boss.dmg*=1.1; boss.hazardCd=42; boss.uniqueCd=66;
    applyCombatState(boss,'vulnerable',120);
    showFT('¡FASE II · '+(BOSS_INTROS[day]&&BOSS_INTROS[day].title||'GUARDIÁN')+'!',boss.x,boss.y-56,'#ff8294');
    dragonFX.push({type:'roar',x:boss.x,y:boss.y,life:52,maxLife:52,radius:190,spin:0}); triggerScreenShake(18,10); screenFlash=13;
  }
  function spawnArenaHazard(){
    if(!boss || !boss.phase2) return;
    const type=boss.hazard||'meteor', colors={meteor:'#ff4f70',petals:'#ff8294',thunder:'#92b8ff',arms:'#d12a4b',blood:'#b7193c',silence:'#d8c8aa'};
    const r=type==='meteor'?58:type==='thunder'?44:type==='arms'?72:62;
    const a=Math.random()*Math.PI*2, d=40+Math.random()*150;
    const x=Math.max(r,Math.min(MAP_W-r,player.x+Math.cos(a)*d)), y=Math.max(r,Math.min(MAP_H-r,player.y+Math.sin(a)*d));
    arenaHazards.push({x:x,y:y,r:r,life:66,maxLife:66,impactAt:18,type:type,color:colors[type],dmg:boss.dmg*(type==='meteor'?.52:.34),hit:false,healOnHit:type==='petals',source:'boss'});
    if(arenaHazards.length>10) arenaHazards.shift();
  }
  function addBossHazard(x,y,r,type,color,dmg,life,impactAt,extra){
    const px=Math.max(r,Math.min(MAP_W-r,x)), py=Math.max(r,Math.min(MAP_H-r,y));
    arenaHazards.push(Object.assign({x:px,y:py,r:r,life:life||76,maxLife:life||76,impactAt:impactAt||18,type:type,color:color,dmg:dmg,hit:false,source:'bossUnique'},extra||{}));
    while(arenaHazards.length>10) arenaHazards.shift();
  }
  function castBossUniqueAbility(){
    if(!boss || !boss.phase2 || !player) return;
    const dx=player.x-boss.x,dy=player.y-boss.y,dist=Math.hypot(dx,dy)||1,ang=Math.atan2(dy,dx),n=boss.nombre;
    if(boss.unique==='skybreaker'){
      for(let i=-2;i<=2;i++){ const a=ang+i*.32, d=90+Math.abs(i)*34; addBossHazard(player.x+Math.cos(a)*d,player.y+Math.sin(a)*d,50,'meteor','#ff4f70',boss.dmg*.42,78,20); }
      showFT('QUEBRANTACIELOS',boss.x,boss.y-boss.r-26,'#ff8294');
    } else if(boss.unique==='petalRequiem'){
      for(let i=0;i<6;i++){ const a=i*Math.PI/3+.28; addBossHazard(player.x+Math.cos(a)*132,player.y+Math.sin(a)*132,42,'petals','#ff9aae',boss.dmg*.30,82,20,{healOnHit:true}); }
      showFT('RÉQUIEM DE PÉTALOS',boss.x,boss.y-boss.r-26,'#ffd1d8');
    } else if(boss.unique==='stormLattice'){
      const vertical=Math.abs(dx)>Math.abs(dy); for(let i=-2;i<=2;i++){ if(i===0) continue; const off=i*96; addBossHazard(vertical?player.x+off:player.x,vertical?player.y:player.y+off,30,'thunder','#92b8ff',boss.dmg*.36,76,18); }
      showFT('RETÍCULA DE TORMENTA',boss.x,boss.y-boss.r-26,'#c6dcff');
    } else if(boss.unique==='bloodCage'){
      const gap=Math.floor(Math.random()*6); for(let i=0;i<6;i++){ if(i===gap) continue; const a=i*Math.PI/3; addBossHazard(player.x+Math.cos(a)*158,player.y+Math.sin(a)*158,54,'arms','#d12a4b',boss.dmg*.34,84,22); }
      showFT('JAULA HEMÁTICA',boss.x,boss.y-boss.r-26,'#ff9aae');
    } else if(boss.unique==='ashMarch'){
      for(let i=1;i<=3;i++){ const d=80+i*96; addBossHazard(boss.x+Math.cos(ang)*d,boss.y+Math.sin(ang)*d,56,'ash','#ff8a65',boss.dmg*.38,64+i*14,18); }
      showFT('MARCHA DE CENIZA',boss.x,boss.y-boss.r-26,'#ffb07c');
    } else if(boss.unique==='crownfall'){
      for(let i=0;i<7;i++){ const a=i*Math.PI*2/7+.2,d=65+(i%2)*86; addBossHazard(player.x+Math.cos(a)*d,player.y+Math.sin(a)*d,42,'silence','#d8c8aa',boss.dmg*.34,86,22); }
      showFT('CAÍDA DE LA CORONA',boss.x,boss.y-boss.r-26,'#fff1d2');
    }
    dragonFX.push({type:'bossUnique',x:boss.x,y:boss.y,life:46,maxLife:46,radius:boss.r*1.8}); triggerScreenShake(10,6); screenFlash=7;
  }
  function spawnEnragedMeteorRain(e){
    if(!e || !e.enraged || !e.large) return;
    const count=e.id==='coloso'?6:4, radius=e.id==='coloso'?54:46, color='#ff315a';
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2, d=70+Math.random()*190;
      const x=Math.max(radius,Math.min(MAP_W-radius,player.x+Math.cos(a)*d)), y=Math.max(radius,Math.min(MAP_H-radius,player.y+Math.sin(a)*d));
      arenaHazards.push({x:x,y:y,r:radius,life:70,maxLife:70,impactAt:18,type:'meteor',color:color,dmg:e.dmg*(e.id==='coloso'?.95:.72),hit:false,source:'enraged'});
      spawnRenewalFX('thunder',x,y,0,e.id==='coloso'?226:194);
      spawnRenewalFX('crystal',x,y,0,e.id==='coloso'?248:210);
    }
    if(arenaHazards.length>14) arenaHazards.splice(0,arenaHazards.length-14);
    dragonFX.push({type:'rainTelegraph',x:e.x,y:e.y,life:44,maxLife:44,radius:e.id==='coloso'?150:112});
    spawnP(e.x,e.y,color,e.id==='coloso'?24:16); showFT('LLUVIA DE METEOROS',e.x,e.y-e.r-30,'#ff718a'); triggerScreenShake(5,3);
  }
  function updateArenaHazards(){
    for(let i=arenaHazards.length-1;i>=0;i--){
      const h=arenaHazards[i]; h.life--;
      if(!h.hit && h.life<=h.impactAt){
        h.hit=true;
        const struck=Math.hypot(player.x-h.x,player.y-h.y)<h.r+player.r;
        if(struck) onPlayerHit(h.dmg,true);
        if(h.type==='petals' && h.healOnHit && struck && boss && boss.hp>0) boss.hp=Math.min(boss.maxHp,boss.hp+boss.maxHp*.012);
        spawnP(h.x,h.y,h.color,18);
        if(h.type==='meteor'){ spawnRenewalFX('meteorExplosion',h.x,h.y,0,h.r>=54?260:224,180,false); }
        dragonFX.push({type:'markBurst',x:h.x,y:h.y,life:22,maxLife:22,radius:h.r}); triggerScreenShake(8,5);
      }
      if(h.life<=0) arenaHazards.splice(i,1);
    }
  }
  function damageBoss(w){
    let dmg = w.dmg * player.dmgMul * 1.1;
    if(boss && stateOf(boss).vulnerable>0){
      dmg*=1.28;
      if(playerHasRelic('breakPower') && !player._breakUsed){ dmg*=1.35; player._breakUsed=true; }
    }
    if(w.skill) dmg*=1+dragonValue('skillDamage',0);
    if(player.dragonHeartTimer>0) dmg*=1.28;
    if(playerHasCurse('bloodHungry')) dmg*=1.25;
    boss.hp -= dmg; boss.hitFlash=8;
    applyPostureDamage(boss,postureDamageForHit(w));
    applyWeaponPassive(boss,w.weaponId||player.weapon,w,dmg);
    showFT(stateOf(boss).vulnerable>0 ? 'RUPTURA -'+Math.round(dmg) : '-'+Math.round(dmg), boss.x, boss.y-30, stateOf(boss).vulnerable>0 ? '#ffd1d8' : '#f0d99a');
    spawnP(boss.x, boss.y, boss.color, 12);
    screenFlash=4;
    if(!boss.phase2 && boss.hp < boss.maxHp*0.5) enterBossPhase2();
    if(boss.hp<=0){
      boss.hp=0; kills+=10; xp+=100; if(xp>=xpNext) levelUp();
      unlockNextRegion();
      showFT('¡JEFE DERROTADO!', boss.x, boss.y-60, '#d9b25c');
      // boss day ends on kill
      endDay();
    }
  }

  // ========== SPAWN ==========
  function spawnEnemy(){
    const ang = Math.random()*Math.PI*2;
    const dist = 350 + Math.random()*200;
    // Los enemigos a distancia se incorporan después del día 3; los grandes conservan su progresión.
    const tacticalMax = day>=4 ? 9+Math.floor(Math.max(0,day-4)/3) : 6;
    const maxT = day>=4 ? Math.min(ENE_TYPES.length, Math.max(6, tacticalMax)) : Math.min(ENE_TYPES.length, 2+Math.floor(day/11));
    spawnSerial++;
    const tacticalTypes=ENE_TYPES.slice(8);
    const forcedTactical=day>=4 && spawnSerial%4===0 && tacticalTypes.length ? tacticalTypes[Math.floor(spawnSerial/4)%tacticalTypes.length] : null;
    const t = forcedTactical || ENE_TYPES[Math.floor(Math.random()*maxT)];
    // escala justa de vida
    const mul = 1 + day*0.045 + Math.max(0,day-20)*0.012;
    const gMul = glintMoon ? 1.28 : 1;
    const bMul = bloodMoon ? 1.15 : 1;
    const elite = Math.random() < 0.08;
    const eMul = (elite ? 2.05 : 1) * (t.large ? 2.0 : 1);
    const r = t.r * (elite ? 1.45 : 1) * (t.large ? 1.12 : 1);
    enemies.push({
      id:t.id, role:t.role||'', x:player.x+Math.cos(ang)*dist, y:player.y+Math.sin(ang)*dist,
      hp:t.hp*mul*gMul*eMul, maxHp:t.hp*mul*gMul*eMul, dmg:t.dmg*mul*gMul*bMul*(elite?1.3:1),
      spd:t.spd*(bloodMoon?1.08:1)*(elite?0.9:1), r:r, spr:t.spr, renewalProfile:RENEWAL_ENEMY_PROFILE[t.id]||null, renewalAttackMode:Math.random()<.5?'Attack01':'Attack02', renewalAnimStart:animT, color:elite?'#d9b25c':t.color,
      cd:0, hitFlash:0, xp:t.xp||12, mage:!!t.mage, ranged:!!t.ranged, range:t.range||280, aoe:!!t.aoe, elite:elite, large:!!t.large, frozen:0, shootCd:0, magicCd:t.magicCd||150, nayutaro:!!t.nayutaro, nayutaroRobust:false, nayutaroTransformTimer:0, nayutaroAnimStart:animT,
      postureMax:Math.round((t.large?150:90)*(elite?1.2:1)), posture:Math.round((t.large?150:90)*(elite?1.2:1)), postureBroken:0, barrier:0, barrierPower:1, shieldFactor:t.shieldFactor||1, guardAngle:0, guardTurnCd:0,
      stealth:0, stealthCd:t.stealthCd||0, chargeTimer:0, chargeCd:t.chargeCd||0, chargeDX:0, chargeDY:0, barrierCd:t.barrierCd||0, healCd:t.healCd||0, copyCd:t.copyCd||0, bleedTimer:0, bleedDamage:0, hunterMark:0, suppressionHits:0,
      enraged:false, rageUsed:false, enrageChance:t.enrageChance||0, healRatio:t.healRatio||0, meteorRainCd:0,
            combatStates:{marked:0,anchored:0,vulnerable:0}
    });
    if(forcedTactical){
      const names={guardian:'GUARDIÁN DEL SELLO',summoner:'INVOCADOR',assassin:'ASESINO DE CENIZA',charger:t.nayutaro?'NAYUTARO · CONTRAATAQUE':'BESTIA EMBESTIDORA',healer:'SANADOR PROFANO',mimic:'MÍMICO DRACÓNICO'};
      showFT('¡AMENAZA TÁCTICA · '+(names[t.role]||'ROL ESPECIAL')+'!',player.x,player.y-72,'#ffd1d8');
      spawnP(player.x,player.y,'#ff8294',10);
    }
  }
  
  function nearestEnemyTo(source, maxDist){
    let best=null, bestD=maxDist||Infinity;
    for(let i=0;i<enemies.length;i++){ const other=enemies[i]; if(other===source||other.hp<=0) continue; const d=Math.hypot(other.x-source.x,other.y-source.y); if(d<bestD){best=other;bestD=d;} }
    return best;
  }
  function enemyMimicCast(e){
    if(!e || !player || e.hp<=0) return;
    const skill=player.lastDragonSkill||'roar', dx=player.x-e.x, dy=player.y-e.y, d=Math.hypot(dx,dy)||1, ang=Math.atan2(dy,dx);
    if(skill==='roar'){
      if(d<210) onPlayerHit(e.dmg*.72,false);
      dragonFX.push({type:'roar',x:e.x,y:e.y,life:28,maxLife:28,radius:120,spin:0});
    } else if(skill==='breath'){
      projectiles.push({x:e.x,y:e.y,vx:Math.cos(ang)*5.1,vy:Math.sin(ang)*5.1,dmg:e.dmg*.68,r:7,life:90,color:'#b47bd4',fromPlayer:false,magic:true,magicFxType:'fire',magicFxSize:210});
      spawnRenewalFX('fire',e.x,e.y,ang,210);
    } else if(skill==='flight'){
      e.x=Math.max(e.r,Math.min(MAP_W-e.r,e.x+Math.cos(ang)*110)); e.y=Math.max(e.r,Math.min(MAP_H-e.r,e.y+Math.sin(ang)*110));
      if(Math.hypot(player.x-e.x,player.y-e.y)<e.r+player.r+30) onPlayerHit(e.dmg*.85,false);
    } else {
      projectiles.push({x:e.x,y:e.y,vx:Math.cos(ang)*4.4,vy:Math.sin(ang)*4.4,dmg:e.dmg*.62,r:8,life:100,color:'#b47bd4',fromPlayer:false,magic:true,magicFxType:'holy',magicFxSize:196});
      spawnRenewalFX('holy',e.x,e.y,ang,196); spawnP(e.x,e.y,'#b47bd4',12);
    }
    showFT('MÍMICA · '+skill.toUpperCase(),e.x,e.y-e.r-20,'#d8b4ff');
  }
  function enemyMagicBurst(e){
    if(!e || e.hp<=0) return;
    const base=Math.atan2(player.y-e.y,player.x-e.x), count=e.ranged?1:3, spread=e.ranged?0:.22;
    const fxType=e.ranged?'thunder':'holy', fxSize=e.ranged?178:214;
    for(let i=0;i<count;i++){ const a=base+(i-(count-1)/2)*spread; projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*(e.ranged?5.3:4.2),vy:Math.sin(a)*(e.ranged?5.3:4.2),dmg:e.dmg*(e.ranged?.48:.62),r:e.ranged?5:7,life:110,color:e.ranged?'#d47a8f':'#9b87d6',fromPlayer:false,magic:true,magicFxType:fxType,magicFxSize:fxSize}); }
    spawnRenewalFX(fxType,e.x,e.y,base,fxSize);
    if(e.ranged) spawnRenewalFX('projectile',e.x+Math.cos(base)*26,e.y+Math.sin(base)*26,base,142);
    else spawnRenewalFX('crystal',e.x,e.y,0,178);
    spawnP(e.x,e.y,e.ranged?'#d47a8f':'#9b87d6',12);
  }

  // ========== UPDATE ==========
  function update(dt){
    if((state!=='PLAYING' && state!=='LEVELUP' && state!=='PAUSE' && state!=='DRAGON_TREE' && state!=='EVENT' && state!=='MAP' && state!=='BOSS_INTRO') || !player) return;
    if(state==='LEVELUP' || state==='PAUSE' || state==='DRAGON_TREE' || state==='EVENT' || state==='MAP' || state==='BOSS_INTRO'){ updateHUD(); return; }
    animT++;
    if(screenFlash>0) screenFlash--;
    if(screenShake.time>0) screenShake.time--;
    if(player.atkCd>0) player.atkCd--;
    if(player.comboTimer>0) player.comboTimer--;
    else if(player.comboStep>0 && player.atkCd<=0) player.comboStep=0;
    if(player.lanceBowTimer>0) player.lanceBowTimer--;
    else if(player.lanceBowStep>0) player.lanceBowStep=0;
    updateCombatStates();
    if(player.dragonRoarCd>0) player.dragonRoarCd--;
    if(player.dragonBreathCd>0) player.dragonBreathCd--;
    if(player.dragonClawCd>0) player.dragonClawCd--;
    if(player.dragonFlightCd>0) player.dragonFlightCd--;
    if(player.dragonTideCd>0) player.dragonTideCd--;
    if(player.dragonMeteorCd>0) player.dragonMeteorCd--;
    player.dragonHeartCd=0; // Corazón ya no tiene enfriamiento; requiere una nueva carga manual
    if(player.moonColdCd>0) player.moonColdCd--;
    if(player.moonAstralCd>0) player.moonAstralCd--;
    if(player.magicSkillCd>0) player.magicSkillCd--;
    if(player.ultimateCd>0) player.ultimateCd--;
    if(player.justDodgedTimer>0) player.justDodgedTimer--;
    if(player.dragonHeartTimer>0) player.dragonHeartTimer--;
    if(player.dragonCast>0) player.dragonCast--;
    updateManaCharge(dt);
    if(player.manaChargeVfxLife>0) player.manaChargeVfxLife--;
    if(player.executionTimer>0) player.executionTimer--;
    if(player.dragonWard>0) player.dragonWard--;
    if(player.dragonEchoTimer>0){ player.dragonEchoTimer--; if(player.dragonEchoTimer===0){ dragonAreaDamage(player.x,player.y,104,20,true); spawnDragonRoarFX(player.x,player.y); showFT('ECO DRACÓNICO',player.x,player.y-58,'#ff8294'); } }
    updateDragonZones();
    updateApotheosisVioletFX();
    if(player.invuln>0) player.invuln--;
    if(player.dodgeCd>0) player.dodgeCd--;
    if(player.parryCd>0) player.parryCd--;
    if(player.isParrying){
      player.parryTimer--;
      if(player.parryTimer<=0) player.isParrying=false;
    }
    if(player.manaChargeActive){
      player.anim='cast';
      player.animStart=player.animStart||animT;
    } else if(player.isDodging){
      player.dodgeTimer--;
      player.x += player.dodgeDirX * 9.5;
      player.y += player.dodgeDirY * 9.5;
      player.invuln = Math.max(player.invuln, 2);
      if(player.dodgeTimer<=0) player.isDodging=false;
      player.x = Math.max(player.r, Math.min(MAP_W-player.r, player.x));
      player.y = Math.max(player.r, Math.min(MAP_H-player.r, player.y));
    } else {
    // movement
    let mx=0,my=0;
    if(keys['w']||keys['arrowup']) my-=1;
    if(keys['s']||keys['arrowdown']) my+=1;
    if(keys['a']||keys['arrowleft']){ mx-=1; player.facing=-1; }
    if(keys['d']||keys['arrowright']){ mx+=1; player.facing=1; }
    if(mx||my){
      const l=Math.hypot(mx,my); mx/=l; my/=l;
      const heartSpeed=player.dragonHeartTimer>0?1.2:1;
      player.x += mx * player.spd * player.spdMul * heartSpeed * 60 * dt;
      player.y += my * player.spd * player.spdMul * heartSpeed * 60 * dt;
      player.dirRow = vagabundoDirectionRow(mx, my);
      if(player.atkCd <= 0 && player.dragonCast<=0 && !player.isParrying){
        const nextAnim = player.spdMul > 1.25 ? 'run' : 'walk';
        if(player.anim !== nextAnim){ player.anim = nextAnim; player.animStart = animT; }
      }
    } else if(player.atkCd <= 0 && player.dragonCast<=0 && player.anim !== 'idle' && !player.isParrying){
      player.anim = 'idle'; player.animStart = animT;
    }
    player.x = Math.max(player.r, Math.min(MAP_W-player.r, player.x));
    player.y = Math.max(player.r, Math.min(MAP_H-player.r, player.y));
    }

    // regeneración: el FP solo se recupera mediante acciones explícitas,
    // principalmente la carga manual de N; no existe regeneración automática.
    player.sta = Math.min(player.maxSta, player.sta + 20*dt);

    // camera
    cam.x += (player.x - W/2 - cam.x)*Math.min(1, dt*6);
    cam.y += (player.y - H/2 - cam.y)*Math.min(1, dt*6);
    cam.x = Math.max(0, Math.min(MAP_W-W, cam.x));
    cam.y = Math.max(0, Math.min(MAP_H-H, cam.y));

    // day timer (boss day doesn't auto-end)
    if(!isBossDay(day)){
      dayTime -= dt;
      if(dayTime <= 0){ dayTime=0; endDay(); }
    } else {
      // still tick visual timer as infinity-ish
      dayTime = Math.max(0, dayTime); // freeze display at 0 or keep counting up kills
    }

    // spawn rate scales with day
    const rate = 0.7 + day*0.08 + (bloodMoon?0.5:0);
    spawnAcc += dt * rate;
    while(spawnAcc >= 1 && enemies.length < MAX_ACTIVE_ENEMIES){
      spawnAcc -= 1;
      spawnEnemy();
    }

    // enemies AI
    for(let i=enemies.length-1;i>=0;i--){
      const e=enemies[i];
      if(e.hp<=0){ enemies.splice(i,1); continue; }
      if(e.hitFlash>0) e.hitFlash--;
      if(e.nayutaro){
        if(e.nayutaroTransformTimer>0) e.nayutaroTransformTimer--;
        if(!e.nayutaroRobust && e.hp<=e.maxHp*.5){ e.nayutaroRobust=true; e.nayutaroTransformTimer=54; showFT('NAYUTARO · FORMA ROBUSTA',e.x,e.y-e.r-20,'#f1b84b'); spawnP(e.x,e.y,'#f1b84b',16); }
      }
      if(e.frozen>0){ e.frozen--; continue; } // congelado 4s
      if(e.shootCd>0) e.shootCd--;
      if(e.magicCd>0) e.magicCd--;
      if(e.meteorRainCd>0) e.meteorRainCd--;
      if(e.postureBroken>0) e.postureBroken--;
      if(e.barrier>0) e.barrier--;
      if(e.stealthCd>0) e.stealthCd--;
      if(e.chargeCd>0) e.chargeCd--;
      if(e.barrierCd>0) e.barrierCd--;
      if(e.healCd>0) e.healCd--;
      if(e.copyCd>0) e.copyCd--;
      if(e.bleedTimer>0){ e.bleedTimer--; if(e.bleedTimer%30===0 && e.bleedDamage>0) e.hp-=e.bleedDamage; }
      const dx=player.x-e.x, dy=player.y-e.y, d=Math.hypot(dx,dy)||1;
      if(e.role==='assassin' && e.stealth<=0 && e.stealthCd<=0 && d>150){ e.stealth=96; e.stealthCd=300; spawnP(e.x,e.y,'#c23b63',8); showFT('SIGILO',e.x,e.y-e.r-16,'#ff8294'); }
      if(e.stealth>0){ e.stealth--; if(d<112) e.stealth=0; }
      if(e.role==='charger' && e.chargeTimer>0){
        e.chargeTimer--; e.x+=e.chargeDX*e.spd*3.4; e.y+=e.chargeDY*e.spd*3.4;
        if(d<e.r+player.r+16){ onPlayerHit(e.dmg*1.35,false); e.chargeTimer=0; }
        e.x=Math.max(e.r,Math.min(MAP_W-e.r,e.x)); e.y=Math.max(e.r,Math.min(MAP_H-e.r,e.y)); continue;
      }
      if(e.role==='charger' && e.chargeCd<=0 && d>170 && d<520){
        e.chargeTimer=34; e.chargeCd=270; e.chargeDX=dx/d; e.chargeDY=dy/d; e.frozen=0; showFT('EMBESTIDA',e.x,e.y-e.r-16,'#ffb16b'); continue;
      }
      if(e.role==='summoner' && e.barrierCd<=0){
        const ally=nearestEnemyTo(e,285)||e; ally.barrier=170; ally.barrierPower=.55; e.barrierCd=220; spawnP(ally.x,ally.y,'#d8b4ff',14); showFT('BARRERA',ally.x,ally.y-ally.r-14,'#d8b4ff');
      }
      if(e.role==='healer' && e.healCd<=0){
        const ally=nearestEnemyTo(e,300); if(ally && ally.hp<ally.maxHp*.88){ ally.hp=Math.min(ally.maxHp,ally.hp+ally.maxHp*.11); e.healCd=280; spawnP(ally.x,ally.y,'#ffb7cf',16); showFT('SANACIÓN',ally.x,ally.y-ally.r-14,'#ffb7cf'); }
      }
      if(e.role==='mimic' && e.copyCd<=0 && player.lastDragonSkill){ enemyMimicCast(e); e.copyCd=310; }
      if(e.enraged && e.large && e.meteorRainCd<=0 && d<900){ spawnEnragedMeteorRain(e); e.meteorRainCd=e.id==='coloso'?178:214; }
      if(e.large && e.magicCd<=0 && d<520){ enemyMagicBurst(e); e.magicCd=240; }
      if(e.mage && d < e.range && d > 90){
        // mago: mantener distancia y disparar
        if(d < 140){ e.x -= (dx/d)*e.spd*0.8; e.y -= (dy/d)*e.spd*0.8; }
        else if(d > 200){ const anchorMul=stateOf(e).anchored>0?0.42:1; e.x += (dx/d)*e.spd*0.7*anchorMul; e.y += (dy/d)*e.spd*0.7*anchorMul; }
        if(e.shootCd<=0){
          e.shootCd = e.ranged ? 110 : 90;
          const ang=Math.atan2(dy,dx);
          projectiles.push({x:e.x,y:e.y,vx:Math.cos(ang)*(e.ranged?5.2:4.2),vy:Math.sin(ang)*(e.ranged?5.2:4.2),dmg:e.dmg*(e.ranged?.62:.85),r:e.ranged?5:6,life:90,maxLife:90,color:e.ranged?'#d47a8f':'#4dd0e1',fromPlayer:false,magic:true,enemyOrb:true,enemyOrbPalette:e.ranged?'elemental':'blue',homing:true,homingTurn:e.ranged?.075:.06,magicFxType:e.ranged?'thunder':'holy',magicFxSize:e.ranged?156:184});
          spawnRenewalFX(e.ranged?'thunder':'holy',e.x,e.y,ang,e.ranged?156:184);
          spawnRenewalFX(e.ranged?'projectile':'crystal',e.x+Math.cos(ang)*24,e.y+Math.sin(ang)*24,ang,e.ranged?132:166);
        }
      } else if(d > e.r+player.r){
        const anchorMul=stateOf(e).anchored>0?0.42:1;
        e.x += (dx/d)*e.spd*anchorMul; e.y += (dy/d)*e.spd*anchorMul;
      } else {
        if(e.aoe){
          // daño de área a jugador si está cerca
          onPlayerHit(e.dmg*1.15, false);
        } else {
          onPlayerHit(e.dmg, false);
        }
      }
    }

    // boss AI
    if(boss && boss.hp>0){
      if(boss.hitFlash>0) boss.hitFlash--;
      if(boss.frozen>0){ boss.frozen--; }
      else {
      if(boss.cd>0) boss.cd--;
      const dx=player.x-boss.x, dy=player.y-boss.y, d=Math.hypot(dx,dy)||1;
      if(d > boss.r+player.r+10){
        const bossAnchorMul=stateOf(boss).anchored>0?0.48:1;
        boss.x += (dx/d)*boss.spd*bossAnchorMul; boss.y += (dy/d)*boss.spd*bossAnchorMul;
      } else if(boss.cd<=0){
        boss.cd = boss.phase2 ? 68 : 82;
        onPlayerHit(boss.dmg, true);
      }
      // boss projectiles occasionally
      if(boss.phase2){
        boss.hazardCd=(boss.hazardCd||0)-1;
        if(boss.uniqueCd>0) boss.uniqueCd--;
        if(boss.hazardCd<=0 && arenaHazards.length<6){ spawnArenaHazard(); boss.hazardCd=boss.hazard==='meteor'?92:112; }
        if(boss.uniqueCd<=0){ castBossUniqueAbility(); boss.uniqueCd=boss.uniqueBaseCd||240; }
        if(Math.random()<0.012 && arenaHazards.length<8){
          const ang=Math.atan2(dy,dx);
          projectiles.push({x:boss.x,y:boss.y,vx:Math.cos(ang)*5,vy:Math.sin(ang)*5,dmg:boss.dmg*0.6,r:6,life:80,color:boss.color,fromPlayer:false});
        }
      }
      } // end not frozen
    }

    // peligros de arena de fase II
    updateArenaHazards();

    // projectiles
    for(let i=projectiles.length-1;i>=0;i--){
      const p=projectiles[i];
      p.px=p.x; p.py=p.y;
      if(p.homing && !p.fromPlayer && player){
        const speed=Math.hypot(p.vx,p.vy)||1;
        const current=Math.atan2(p.vy,p.vx), target=Math.atan2(player.y-p.y,player.x-p.x);
        const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));
        const next=current+Math.max(-p.homingTurn,Math.min(p.homingTurn,delta));
        p.vx=Math.cos(next)*speed; p.vy=Math.sin(next)*speed;
      }
      p.x+=p.vx; p.y+=p.vy; p.life--;
      if(p.fromPlayer){
        for(let j=0;j<enemies.length;j++){
          const e=enemies[j]; if(e.hp<=0) continue;
          if(Math.hypot(p.x-e.x,p.y-e.y)<p.r+e.r){
            damageEnemy(e, {dmg:p.dmg, crit:false, skill:!!p.comboBolt||!!p.skill, weaponId:p.weaponId||player.weapon, posture:p.posture||6, heavy:!!p.heavy});
            if(p.markBolt) applyCombatState(e,'marked',playerHasRelic('diente-aurelia')?480:240);
            if(p.judgmentBolt) spawnJudgmentImpact(p.x, p.y, p.color);
            projectiles.splice(i,1); p.life=-1; break;
          }
        }
        if(p.life>=0 && boss && boss.hp>0 && Math.hypot(p.x-boss.x,p.y-boss.y)<p.r+boss.r){
          // manual boss dmg
          boss.hp -= p.dmg; boss.hitFlash=8; applyPostureDamage(boss,p.posture||6); applyWeaponPassive(boss,p.weaponId||player.weapon,p,p.dmg);
          showFT(stateOf(boss).vulnerable>0?'RUPTURA -'+Math.round(p.dmg):'-'+Math.round(p.dmg), boss.x, boss.y-30, stateOf(boss).vulnerable>0?'#ffd1d8':'#f0d99a');
          if(!boss.phase2 && boss.hp<boss.maxHp*0.5) enterBossPhase2();
          if(p.markBolt) applyCombatState(boss,'marked',playerHasRelic('diente-aurelia')?480:240);
          if(p.judgmentBolt) spawnJudgmentImpact(p.x, p.y, p.color);
          if(boss.hp<=0){ boss.hp=0; kills+=10; unlockNextRegion(); endDay(); }
          projectiles.splice(i,1); continue;
        }
      } else {
        if(Math.hypot(p.x-player.x,p.y-player.y)<p.r+player.r){
          onPlayerHit(p.dmg, false);
          if(p.magicFxType) spawnRenewalFX(p.magicFxType,p.x,p.y,Math.atan2(p.vy,p.vx),p.magicFxSize||180);
          else if(p.magic) spawnRenewalFX('holy',p.x,p.y,Math.atan2(p.vy,p.vx),180);
          projectiles.splice(i,1); continue;
        }
      }
      if(p.life<=0) projectiles.splice(i,1);
    }

    // particles / fx
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.life--;
      if(p.life<=0) particles.splice(i,1);
    }
    for(let i=floating.length-1;i>=0;i--){
      floating[i].y-=0.7; floating[i].life--;
      if(floating[i].life<=0) floating.splice(i,1);
    }
    for(let i=slashFX.length-1;i>=0;i--){
      slashFX[i].life--; if(slashFX[i].life<=0) slashFX.splice(i,1);
    }
    for(let i=dragonFX.length-1;i>=0;i--){
      dragonFX[i].life--;
      if(dragonFX[i].life<=0) dragonFX.splice(i,1);
    }

    if(mouse.down) tryAttack();
    updateHUD();
  }

  function triggerScreenShake(frames, power){
    if(!settings.shake) return;
    screenShake.time=Math.max(screenShake.time, frames);
    screenShake.max=Math.max(screenShake.max, frames);
    screenShake.power=Math.max(screenShake.power, power);
  }
  function pushParticle(x,y,vx,vy,r,color,life,glow){
    particles.push({x:x,y:y,vx:vx,vy:vy,r:r,color:color,life:life,maxLife:life,glow:!!glow});
  }
  function spawnP(x,y,col,n){
    for(let i=0;i<n;i++) pushParticle(x,y,(Math.random()-0.5)*4,(Math.random()-0.5)*4-1,1.5+Math.random()*2,col,14+Math.random()*10,false);
    const particleCap=settings.performanceMode?28:60;
    if(particles.length>particleCap) particles.splice(0, particles.length-particleCap);
  }
  const TIDE_PHASE_FRAMES=360, TIDE_GROW_FRAMES=150, TIDE_RED_FRAMES=210;
  const TIDE_SPRITE_SPECS={
    blue:{columns:18,sourceW:192,sourceH:192,fps:8},
    cyan:{columns:12,sourceW:192,sourceH:192,fps:8},
    red:{columns:14,sourceW:192,sourceH:192,fps:4}
  };
  const RENEWAL_FX_SPECS = {
    hit:{columns:1,rows:7,sourceW:128,sourceH:128,fps:18,size:92},
    explosion:{columns:1,rows:8,sourceW:128,sourceH:128,fps:16,size:170},
    fire:{columns:18,rows:1,sourceW:48,sourceH:48,fps:18,size:126},
    smear:{columns:5,rows:1,sourceW:48,sourceH:48,fps:20,size:108},
    smearV:{columns:6,rows:1,sourceW:48,sourceH:48,fps:18,size:112},
    holy:{columns:8,rows:1,sourceW:32,sourceH:32,fps:12,size:86},
    thunder:{columns:13,rows:1,sourceW:64,sourceH:64,fps:18,size:148},
    thunderAlt:{columns:8,rows:4,sourceW:64,sourceH:64,fps:16,size:174},
    meteorExplosion:{columns:5,rows:3,sourceW:192,sourceH:192,fps:5,size:236},
    meteorBlue:{columns:18,rows:1,sourceW:192,sourceH:192,fps:6,size:236},
    crystal:{columns:6,rows:1,sourceW:128,sourceH:128,fps:10,size:150},
    auraMarea:{columns:8,rows:4,sourceW:128,sourceH:128,fps:8,size:520},
    mirror:{columns:1,rows:10,sourceW:128,sourceH:64,fps:14,size:142},
    projectile:{columns:4,rows:7,sourceW:64,sourceH:64,fps:16,size:118},
    smoke:{columns:1,rows:1,sourceW:64,sourceH:64,fps:8,size:112},
    apotheosisViolet:{columns:18,rows:1,sourceW:192,sourceH:192,fps:10,size:184}
  };
  let renewalFX=[];
  let holyUltimateFX=[];
  let apotheosisVioletFX=[];
  function spawnRenewalFX(type,x,y,ang,size,duration,loop){
    const spec=RENEWAL_FX_SPECS[type];
    if(!spec || !spr('renewal-fx-'+type)) return;
    const naturalLife=Math.max(8,Math.ceil(spec.columns*spec.rows*60/spec.fps));
    const life=Number.isFinite(duration)?Math.max(8,Math.round(duration)):naturalLife;
    renewalFX.push({type:type,x:x,y:y,ang:ang||0,size:size||spec.size,life:life,maxLife:life,loop:!!loop});
    const fxCap=settings.performanceMode?12:28;
    if(renewalFX.length>fxCap) renewalFX.splice(0,renewalFX.length-fxCap);
  }
  function drawHolyUltimateFX(){
    for(let i=holyUltimateFX.length-1;i>=0;i--){
      const fx=holyUltimateFX[i], elapsed=fx.maxLife-fx.life;
      const frame=Math.min(15,Math.floor(elapsed/(fx.maxLife/16)));
      const img=spr('holy-ultimate-'+String(frame+1).padStart(2,'0'));
      if(img){
        const progress=elapsed/fx.maxLife;
        const fade=progress<.08 ? progress/.08 : (progress>.88 ? (1-progress)/.12 : 1);
        ctx.save(); ctx.translate(fx.x-cam.x,fx.y-cam.y); ctx.globalAlpha=Math.max(0,fade*.96); ctx.globalCompositeOperation='lighter';
        ctx.shadowColor='#fff1b8'; ctx.shadowBlur=settings.performanceMode?12:22;
        ctx.drawImage(img,-fx.size/2,-fx.size/2,fx.size,fx.size);
        ctx.restore();
      }
      fx.life--;
      if(fx.life<=0) holyUltimateFX.splice(i,1);
    }
  }
  function spawnHolyUltimateFX(x,y){
    holyUltimateFX.push({x:x,y:y,size:540,life:360,maxLife:360});
    if(holyUltimateFX.length>1) holyUltimateFX.splice(0,holyUltimateFX.length-1);
  }
  const APOTHEOSIS_VIOLET_SPEC={columns:18,rows:1,sourceW:192,sourceH:192,fps:10,size:184};
  function spawnApotheosisVioletFX(cx,cy){
    // La primera explosión utiliza la misma hoja y cubre exactamente el
    // diámetro visual del radio lógico de Apoteosis: 270*2 = 540 px.
    apotheosisVioletFX=[{x:cx,y:cy,delay:0,age:0,life:108,radius:270,damage:0,hit:true,size:540,initial:true}];
    const ringRadius=144, secondaryRadius=72, secondaryDamage=72;
    for(let i=0;i<6;i++){
      const angle=-Math.PI/2+i*(Math.PI/3);
      const distance=ringRadius+(i%2)*22;
      const x=Math.max(80,Math.min(MAP_W-80,cx+Math.cos(angle)*distance));
      const y=Math.max(80,Math.min(MAP_H-80,cy+Math.sin(angle)*distance));
      apotheosisVioletFX.push({x:x,y:y,delay:34+i*12,age:0,life:108,radius:secondaryRadius,damage:secondaryDamage,hit:false,size:200,initial:false});
    }
  }
  function updateApotheosisVioletFX(){
    for(let i=apotheosisVioletFX.length-1;i>=0;i--){
      const fx=apotheosisVioletFX[i];
      if(fx.delay>0){ fx.delay--; continue; }
      fx.age++;
      if(!fx.hit && fx.age===22){
        const hits=dragonAreaDamage(fx.x,fx.y,fx.radius,fx.damage,true);
        fx.hit=true;
        spawnP(fx.x,fx.y,'#d8b4ff',14);
        dragonFX.push({type:'violetBurst',x:fx.x,y:fx.y,life:24,maxLife:24,radius:fx.radius});
        if(hits>0) triggerScreenShake(5,3);
      }
      if(fx.age>=fx.life) apotheosisVioletFX.splice(i,1);
    }
  }
  function drawApotheosisVioletFX(){
    const img=spr('renewal-fx-apotheosisViolet');
    if(!img) return;
    const spec=APOTHEOSIS_VIOLET_SPEC;
    for(let i=apotheosisVioletFX.length-1;i>=0;i--){
      const fx=apotheosisVioletFX[i];
      if(fx.delay>0) continue;
      const frame=Math.min(spec.columns-1,Math.floor((fx.age/60)*spec.fps));
      const sx=frame*spec.sourceW;
      const fade=fx.age<8?fx.age/8:(fx.age>fx.life-12?(fx.life-fx.age)/12:1);
      const drawSize=fx.size||spec.size;
      ctx.save();
      ctx.translate(fx.x-cam.x,fx.y-cam.y);
      ctx.globalAlpha=Math.max(0,Math.min(1,fade))*.96;
      ctx.globalCompositeOperation='lighter';
      ctx.shadowColor='#c46bff'; ctx.shadowBlur=settings.performanceMode?12:22;
      ctx.drawImage(img,sx,0,spec.sourceW,spec.sourceH,-drawSize/2,-drawSize/2,drawSize,drawSize);
      ctx.restore();
    }
  }
  function tideDiameter(age){
    if(age<60) return 72+(age/60)*92;
    if(age<120) return 164+((age-60)/60)*122;
    if(age<TIDE_GROW_FRAMES) return 286+((age-120)/(TIDE_GROW_FRAMES-120))*142;
    return 428;
  }
  function drawTideZones(){
    for(let i=dragonZones.length-1;i>=0;i--){
      const z=dragonZones[i];
      if(z.type!=='tide') continue;
      const age=z.age||0, diameter=tideDiameter(age), x=z.x-cam.x, y=z.y-cam.y;
      let img=null, spec=null, frame=0, alpha=0.94;
      if(age<TIDE_GROW_FRAMES){
        if(age<120){
          img=spr('renewal-fx-tideBlue'); spec=TIDE_SPRITE_SPECS.blue;
          frame=Math.min(spec.columns-1,Math.floor(age/(120/18)));
        } else {
          img=spr('renewal-fx-tideCyan'); spec=TIDE_SPRITE_SPECS.cyan;
          frame=Math.min(spec.columns-1,Math.floor(((age-120)/30)*spec.columns));
        }
      } else {
        img=spr('renewal-fx-tideRed'); spec=TIDE_SPRITE_SPECS.red;
        frame=Math.min(spec.columns-1,Math.floor(((age-TIDE_GROW_FRAMES)/TIDE_RED_FRAMES)*spec.columns));
        alpha=0.98;
      }
      if(!img||!spec) continue;
      const sx=frame*spec.sourceW;
      const fadeIn=Math.min(1,age/10), fadeOut=age>z.maxLife-14?Math.max(0,(z.maxLife-age)/14):1;
      ctx.save();
      ctx.translate(x,y);
      ctx.globalAlpha=alpha*fadeIn*fadeOut;
      ctx.globalCompositeOperation='lighter';
      ctx.shadowColor=age<TIDE_GROW_FRAMES?'#62c9ff':'#ff304f';
      ctx.shadowBlur=settings.performanceMode?12:24;
      ctx.drawImage(img,sx,0,spec.sourceW,spec.sourceH,-diameter/2,-diameter/2,diameter,diameter);
      // Lectura sutil del área de daño sin sustituir la textura.
      ctx.globalAlpha=0.16*fadeIn*fadeOut;
      ctx.shadowBlur=settings.performanceMode?6:12;
      ctx.strokeStyle=age<TIDE_GROW_FRAMES?'#8ddcff':'#ff6b7e';
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(0,0,z.radius,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }
  }
  function drawRenewalFX(){
    for(let i=renewalFX.length-1;i>=0;i--){
      const fx=renewalFX[i], spec=RENEWAL_FX_SPECS[fx.type], img=spr('renewal-fx-'+fx.type);
      if(settings.performanceMode && i%2===0 && fx.type!=='ultimate' && fx.type!=='explosion' && fx.type!=='auraMarea'){ fx.life--; if(fx.life<=0) renewalFX.splice(i,1); continue; }
      if(!img || !spec){ renewalFX.splice(i,1); continue; }
      const elapsed=fx.maxLife-fx.life, rawFrame=Math.floor(elapsed/(60/spec.fps)), frame=fx.loop ? rawFrame%(spec.columns*spec.rows) : Math.min(spec.columns*spec.rows-1,rawFrame);
      const sx=(frame%spec.columns)*spec.sourceW, sy=Math.floor(frame/spec.columns)*spec.sourceH;
      const fade=Math.min(1,fx.life/8, (elapsed<8?elapsed/8:1));
      ctx.save(); ctx.translate(fx.x-cam.x,fx.y-cam.y); ctx.rotate(fx.ang||0); ctx.globalAlpha=Math.max(0,fade*.9); ctx.globalCompositeOperation='lighter';
      const fxColor={thunder:'#9fc8ff',thunderAlt:'#ffd1d8',meteorExplosion:'#ffb13b',holy:'#fff1f4',crystal:'#72dcff',auraMarea:'#ff79e7',mirror:'#d8b4ff',projectile:'#9fc8ff',smoke:'#ad8894',smearV:'#ff718a'}[fx.type]||'#ff3d67';
      ctx.shadowColor=fxColor; ctx.shadowBlur=fx.type==='explosion'||fx.type==='meteorExplosion'||fx.type==='crystal'?18:10;
      ctx.drawImage(img,sx,sy,spec.sourceW,spec.sourceH,-fx.size/2,-fx.size/2,fx.size,fx.size);
      ctx.restore(); fx.life--;
      if(fx.life<=0) renewalFX.splice(i,1);
    }
  }
  function spawnJudgmentLaunch(x,y,ang){
    const cols=['#f0d99a','#d9b25c','#4dd0e1','#ffffff'];
    for(let i=0;i<36;i++){
      const a=ang+(Math.random()-0.5)*1.5;
      const s=1.5+Math.random()*6;
      pushParticle(x+Math.cos(a)*10,y+Math.sin(a)*10,Math.cos(a)*s,Math.sin(a)*s,1.5+Math.random()*2.6,cols[i%cols.length],18+Math.random()*18,true);
    }
    if(particles.length>96) particles.splice(0, particles.length-96);
  }
  function spawnJudgmentImpact(x,y,color){
    const cols=[color||'#d9b25c','#f0d99a','#4dd0e1','#ffffff'];
    for(let i=0;i<30;i++){
      const a=Math.random()*Math.PI*2;
      const s=1+Math.random()*5.5;
      pushParticle(x,y,Math.cos(a)*s,Math.sin(a)*s,1.2+Math.random()*2.8,cols[i%cols.length],14+Math.random()*16,true);
    }
    spawnP(x,y,color||'#d9b25c',8);
    if(particles.length>96) particles.splice(0, particles.length-96);
  }
  function dragonAngleDelta(a,b){ return Math.atan2(Math.sin(a-b), Math.cos(a-b)); }

  function dragonAreaDamage(cx,cy,radius,damage,stagger){
    let hits=0;
    for(let i=0;i<enemies.length;i++){
      const e=enemies[i]; if(e.hp<=0) continue;
      if(Math.hypot(e.x-cx,e.y-cy) <= radius+e.r){
        damageEnemy(e,{dmg:damage,crit:false,skill:true});
        applyAffinityOnSkill(e);
        if(stagger && e.hp>0) e.frozen=Math.max(e.frozen||0,34);
        if(playerHasNode('anillo-expandido') && e.hp>0){
          const dx=player.x-e.x, dy=player.y-e.y, d=Math.hypot(dx,dy)||1;
          e.x += dx/d*dragonValue('pull',0); e.y += dy/d*dragonValue('pull',0);
        }
        hits++;
      }
    }
    if(boss && boss.hp>0 && Math.hypot(boss.x-cx,boss.y-cy) <= radius+boss.r){
      damageBoss({dmg:damage,crit:false,skill:true}); applyAffinityOnSkill(boss); hits++;
    }
    return hits;
  }

  function dragonConeDamage(cx,cy,ang,length,halfAngle,damage){
    let hits=0;
    for(let i=0;i<enemies.length;i++){
      const e=enemies[i]; if(e.hp<=0) continue;
      const dx=e.x-cx, dy=e.y-cy, d=Math.hypot(dx,dy)||1;
      if(d <= length+e.r && Math.abs(dragonAngleDelta(Math.atan2(dy,dx),ang)) <= halfAngle + Math.min(0.22,e.r/d)){
        damageEnemy(e,{dmg:damage,crit:false,skill:true});
        applyAffinityOnSkill(e);
        if(stateOf(e).marked>0) detonateCombatMark(e);
        hits++;
      }
    }
    if(boss && boss.hp>0){
      const dx=boss.x-cx, dy=boss.y-cy, d=Math.hypot(dx,dy)||1;
      if(d <= length+boss.r && Math.abs(dragonAngleDelta(Math.atan2(dy,dx),ang)) <= halfAngle + Math.min(0.18,boss.r/d)){
        damageBoss({dmg:damage,crit:false,skill:true});
        applyAffinityOnSkill(boss);
        if(stateOf(boss).marked>0) detonateCombatMark(boss);
        hits++;
      }
    }
    return hits;
  }

  function spawnDragonRoarFX(x,y){
    const cols=['#ff3d67','#ff8294','#e7c7ff','#ffffff'];
    for(let i=0;i<34;i++){
      const a=Math.random()*Math.PI*2, speed=1.2+Math.random()*5.8;
      pushParticle(x,y,Math.cos(a)*speed,Math.sin(a)*speed,1.3+Math.random()*2.8,cols[i%cols.length],20+Math.random()*22,true);
    }
    dragonFX.push({type:'roar',x:x,y:y,life:58,maxLife:58,radius:178,spin:Math.random()*Math.PI*2});
    spawnRenewalFX('holy',x,y,0,156);
    if(dragonFX.length>10) dragonFX.splice(0,dragonFX.length-10);
  }

  function spawnDragonBreathFX(x,y,ang){
    const cols=['#8e1635','#e52d55','#ff718a','#ffd1d8'];
    for(let i=0;i<42;i++){
      const a=ang+(Math.random()-0.5)*0.95, d=12+Math.random()*150, speed=1.4+Math.random()*3.5;
      pushParticle(x+Math.cos(a)*d*0.18,y+Math.sin(a)*d*0.18,Math.cos(a)*speed,Math.sin(a)*speed,1.4+Math.random()*2.6,cols[i%cols.length],18+Math.random()*24,true);
    }
    dragonFX.push({type:'breath',x:x,y:y,ang:ang,life:48,maxLife:48,length:250,halfAngle:0.55});
    if(dragonFX.length>10) dragonFX.splice(0,dragonFX.length-10);
  }

  function castDragonRoar(){
    if(!player || state!=='PLAYING' || player.isDodging || player.dragonRoarCd>0 || player.dragonCast>0) return;
    player.lastDragonSkill='roar';
    const cost=26+(playerHasRelic('dragonEcho')?8:0);
    if(player.fp<cost){ showFT('FP insuficiente',player.x,player.y-34,'#ff8294'); return; }
    player.fp-=cost; player.dragonRoarCd=240; player.dragonCast=42;
    if(playerHasNode('velo-carmesi')) player.dragonWard=110;
    if(playerHasRelic('dragonEcho')) player.dragonEchoTimer=18;
    player.anim='cast'; player.animStart=animT;
    const hits=dragonAreaDamage(player.x,player.y,158,52,true);
    spawnDragonRoarFX(player.x,player.y);
    triggerScreenShake(hits>0?16:9,hits>0?9:4);
    screenFlash=12;
    showFT('SELLO DRACÓNICO · RUGIDO',player.x,player.y-42,'#ff8294');
    if(hits>0) showFT('ÁREA '+hits,player.x,player.y-62,'#ffd1d8');
    updateHUD();
  }

  function castDragonBreath(){
    if(!player || state!=='PLAYING' || player.isDodging || player.dragonBreathCd>0 || player.dragonCast>0) return;
    player.lastDragonSkill='breath';
    const cost=20;
    if(player.fp<cost){ showFT('FP insuficiente',player.x,player.y-34,'#ff8294'); return; }
    if(playerHasNode('velo-carmesi')) player.dragonWard=90;
    const ang=Math.atan2(mouse.y-(player.y-cam.y),mouse.x-(player.x-cam.x));
    player.fp-=cost; player.dragonBreathCd=145; player.dragonCast=34;
    player.facing=Math.cos(ang)>=0?1:-1; player.dirRow=vagabundoDirectionRow(Math.cos(ang),Math.sin(ang));
    player.anim='cast'; player.animStart=animT;
    const hits=dragonConeDamage(player.x,player.y,ang,245,0.55,34);
    spawnDragonBreathFX(player.x,player.y,ang);
    spawnRenewalFX('fire',player.x+Math.cos(ang)*96,player.y+Math.sin(ang)*96,ang,132);
    triggerScreenShake(hits>0?10:5,hits>0?5:2);
    screenFlash=8;
    showFT('ALIENTO CARMESÍ',player.x+Math.cos(ang)*42,player.y+Math.sin(ang)*42,'#ff4f70');
    if(hits>0) showFT('IMPACTO '+hits,player.x,player.y-62,'#ffd1d8');
    updateHUD();
  }

  function drawManaAtlasFrame(img, frameIndex, frameCount, sourceW, sourceH, dx, dy, dw, dh, alpha){
    if(!img) return;
    const frame=Math.max(0,Math.min(frameCount-1,Math.floor(frameIndex)));
    ctx.globalAlpha=alpha;
    ctx.drawImage(img,frame*sourceW,0,sourceW,sourceH,dx,dy,dw,dh);
  }

  const NAYUTARO_AURA_FRAME_W=176, NAYUTARO_AURA_FRAME_H=192, NAYUTARO_AURA_FRAME_MS=105, NAYUTARO_AURA_OVERLAP_MS=500;
  const NAYUTARO_AURA_OUTER=[0,1,2,3,4,5,6,7,...Array(10).fill([7,6,5,6]).flat(),5,4,3,2,1,0];
  const NAYUTARO_AURA_INNER=[0,1,2,3,4,5,6,7,7,6,5,6,7,6,5,4,3,2,1,0,0,1,2,1,0,0,0];
  const NAYUTARO_AURA_ORANGE=[0,1,2,3,4,5,6,5,4,3,2,1];
  const NAYUTARO_AURA_ALPHA=[.40,.46,.52,.60,.68,.76,.84,.90,.92,.88,.84,.80,.86,.82,.74,.68,.62,.56,.50,.44,.38,.44,.52,.48,.42,.36,.30];
  const NAYUTARO_AURA_DRIFT=[-4,-3,-2,0,2,4,3,1,-1,-3,-4,-2,0,2,4,3,1,-1,-3,-4,-2,0,2,3,1,0,-2];
  const NAYUTARO_AURA_RISE=[0,0,-1,-2,-3,-5,-7,-9,-10,-9,-8,-6,-4,-3,-2,-1,0,1,2,3,4,3,1,0,1,2,3];

  function drawNayutaroAuraCell(img,frame,x,baseY,scale,alpha,filter){
    if(!img || frame<0) return;
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=Math.max(0,Math.min(1,alpha));
    ctx.filter=filter||'none';
    ctx.drawImage(img,frame*NAYUTARO_AURA_FRAME_W,0,NAYUTARO_AURA_FRAME_W,NAYUTARO_AURA_FRAME_H,x-NAYUTARO_AURA_FRAME_W*scale*.5,baseY-NAYUTARO_AURA_FRAME_H*scale,NAYUTARO_AURA_FRAME_W*scale,NAYUTARO_AURA_FRAME_H*scale);
    ctx.restore();
  }

  function drawManaChargeFX(){
    if(!player) return;
    const active=!!player.manaChargeActive;
    const releaseLife=player.manaChargeVfxLife||0;
    if(!active && releaseLife<=0) return;
    const aura=spr('renewal-fx-nayutaroAura');
    if(!aura) return;
    const progress=active ? Math.max(0,Math.min(1,player.manaCharge/MANA_CHARGE_FRAMES)) : Math.max(0,Math.min(1,player.manaChargeVfxProgress||0));
    const visibleFade=active ? 1 : Math.max(0,releaseLife/30);
    const elapsedMs=((player.manaChargeAuraClock||0)/60)*1000 + (active?0:(30-releaseLife)/60*1000);
    const baseScale=(.92+progress*.14)*(1+Math.sin(animT*.025)*.025);
    const x=player.x-cam.x;
    const bob=Math.sin(animT*.15)*1.5;
    const baseY=player.y-cam.y+(player.r||18)+10+bob;
    const outerIndex=NAYUTARO_AURA_OUTER[Math.floor(elapsedMs/NAYUTARO_AURA_FRAME_MS)%NAYUTARO_AURA_OUTER.length];
    const orangeIndex=NAYUTARO_AURA_ORANGE[Math.floor(elapsedMs/NAYUTARO_AURA_FRAME_MS)%NAYUTARO_AURA_ORANGE.length];
    const innerDuration=NAYUTARO_AURA_INNER.length*NAYUTARO_AURA_FRAME_MS;
    const innerStartInterval=innerDuration-NAYUTARO_AURA_OVERLAP_MS;
    const innerAge=((elapsedMs%innerStartInterval)+innerStartInterval)%innerStartInterval;
    const previousAge=innerAge+innerStartInterval;
    const innerFrameAt=function(age){
      if(age>=innerDuration) return -1;
      return Math.max(0,Math.min(NAYUTARO_AURA_INNER.length-1,Math.floor(age/NAYUTARO_AURA_FRAME_MS)));
    };
    const innerCurrent=innerFrameAt(innerAge), innerPrevious=innerFrameAt(previousAge);
    const currentAlpha=innerCurrent>=0?NAYUTARO_AURA_ALPHA[innerCurrent]:0;
    const previousAlpha=innerPrevious>=0?NAYUTARO_AURA_ALPHA[innerPrevious]*.92:0;
    ctx.save();
    ctx.imageSmoothingEnabled=true;
    // Capa exterior roja del módulo.
    drawNayutaroAuraCell(aura,outerIndex,x,baseY-Math.sin(elapsedMs/210)*2,baseScale,.94*visibleFade);
    // Capa roja intensa: el siguiente ciclo entra 500 ms antes del anterior.
    if(innerCurrent>=0) drawNayutaroAuraCell(aura,innerCurrent,x+NAYUTARO_AURA_DRIFT[innerCurrent]*baseScale,baseY-7+NAYUTARO_AURA_RISE[innerCurrent]*baseScale,baseScale*.72,currentAlpha*visibleFade);
    if(innerPrevious>=0) drawNayutaroAuraCell(aura,innerPrevious,x+NAYUTARO_AURA_DRIFT[innerPrevious]*baseScale,baseY-7+NAYUTARO_AURA_RISE[innerPrevious]*baseScale,baseScale*.72,previousAlpha*visibleFade);
    // Capa naranja interna del módulo, con tinte independiente.
    drawNayutaroAuraCell(aura,orangeIndex,x+Math.sin(elapsedMs/190)*2,baseY-9,baseScale*.35,(.36+Math.sin(elapsedMs/130)*.08)*visibleFade,'sepia(1) saturate(6) hue-rotate(345deg) brightness(1.2)');
    ctx.restore();
    if(active && animT%18===0) showFT(progress>=1?'CARGA COMPLETA':'CARGANDO '+Math.round(progress*100)+'%',player.x,player.y-62,'#ff8294');
  }

  function drawDragonEffects(){
    for(let i=0;i<dragonFX.length;i++){
      const fx=dragonFX[i];
      if(settings.performanceMode && i%2===0 && fx.type!=='ultimate' && fx.type!=='meteorImpact' && fx.type!=='bossUnique') continue;
      const progress=1-(fx.life/fx.maxLife);
      const fade=Math.sin(Math.min(1,progress)*Math.PI);
      const x=fx.x-cam.x, y=fx.y-cam.y;
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      if(fx.type==='roar'){
        const radius=18+fx.radius*(0.14+progress*0.86);
        ctx.translate(x,y); ctx.rotate(fx.spin+progress*1.8);
        ctx.globalAlpha=fade*0.9;
        ctx.shadowColor='#ff3d67'; ctx.shadowBlur=22;
        for(let ring=0;ring<3;ring++){
          ctx.strokeStyle=ring===1?'#ffd1d8':'#e52d55';
          ctx.lineWidth=ring===1?3:2;
          ctx.beginPath(); ctx.arc(0,0,radius*(0.52+ring*0.24),ring*0.9,Math.PI*2-ring*0.4); ctx.stroke();
        }
        ctx.strokeStyle='#ff8294'; ctx.lineWidth=2;
        for(let rune=0;rune<12;rune++){
          const a=rune*Math.PI*2/12, inner=radius*0.54, outer=radius*0.72;
          ctx.beginPath(); ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner); ctx.lineTo(Math.cos(a+0.07)*outer,Math.sin(a+0.07)*outer); ctx.stroke();
        }
        ctx.fillStyle='#fff1f4'; ctx.globalAlpha=fade*0.72;
        ctx.beginPath(); ctx.arc(0,0,10+Math.sin(animT*0.3)*4,0,Math.PI*2); ctx.fill();
      } else if(fx.type==='breath'){
        ctx.translate(x,y); ctx.rotate(fx.ang);
        const length=fx.length*(0.2+progress*0.8), width=length*(0.10+progress*0.16);
        ctx.globalAlpha=fade*0.8;
        ctx.shadowColor='#e52d55'; ctx.shadowBlur=26;
        const grad=ctx.createLinearGradient(12,0,length,0);
        grad.addColorStop(0,'rgba(255,209,216,.95)'); grad.addColorStop(.18,'rgba(255,79,112,.85)'); grad.addColorStop(1,'rgba(93,4,25,0)');
        ctx.fillStyle=grad;
        ctx.beginPath(); ctx.moveTo(12,-10); ctx.quadraticCurveTo(length*.42,-width,length,0); ctx.quadraticCurveTo(length*.42,width,12,10); ctx.closePath(); ctx.fill();
        ctx.strokeStyle='#ff8294'; ctx.lineWidth=3;
        for(let wave=0;wave<3;wave++){
          const offset=(wave-1)*12;
          ctx.beginPath(); ctx.moveTo(25,offset); ctx.quadraticCurveTo(length*.38,offset-width,length*.78,offset+Math.sin(animT*.18+wave)*12); ctx.stroke();
        }
        ctx.strokeStyle='#ffd1d8'; ctx.lineWidth=2; ctx.globalAlpha=fade;
        ctx.beginPath(); ctx.arc(18,0,16+Math.sin(animT*.25)*4,0,Math.PI*2); ctx.stroke();
      } else if(fx.type==='markBurst'){
        const r=fx.radius*(.25+progress*1.1); ctx.translate(x,y); ctx.globalAlpha=fade*.9;
        ctx.shadowColor='#ff3d67'; ctx.shadowBlur=20; ctx.strokeStyle='#ffd1d8'; ctx.lineWidth=3;
        ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.stroke();
        ctx.strokeStyle='#e52d55'; ctx.lineWidth=2;
        for(let i=0;i<6;i++){ const a=i*Math.PI/3+progress*2; ctx.beginPath(); ctx.moveTo(Math.cos(a)*r*.35,Math.sin(a)*r*.35); ctx.lineTo(Math.cos(a+.2)*r,Math.sin(a+.2)*r); ctx.stroke(); }
      } else if(fx.type==='violetBurst'){
        const r=fx.radius*(.35+progress*.9); ctx.translate(x,y); ctx.globalAlpha=fade*.82;
        ctx.shadowColor='#c46bff'; ctx.shadowBlur=24; ctx.strokeStyle='#f1d8ff'; ctx.lineWidth=3;
        ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.stroke();
        ctx.strokeStyle='#9c4dff'; ctx.lineWidth=2;
        for(let ray=0;ray<8;ray++){ const a=ray*Math.PI/4+progress*1.8; ctx.beginPath(); ctx.moveTo(Math.cos(a)*r*.3,Math.sin(a)*r*.3); ctx.lineTo(Math.cos(a)*r*1.2,Math.sin(a)*r*1.2); ctx.stroke(); }
      } else if(fx.type==='ashTrail'){
        const r=fx.radius*(.4+progress*.7); ctx.translate(x,y); ctx.globalAlpha=fade*.45;
        ctx.fillStyle='#b7193c'; ctx.shadowColor='#ff3d67'; ctx.shadowBlur=18;
        ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#ffd1d8'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,r*.72,0,Math.PI*2); ctx.stroke();
      } else if(fx.type==='execution'){
        ctx.translate(x,y); ctx.rotate(fx.ang||0); ctx.globalAlpha=fade;
        ctx.shadowColor='#fff1f4'; ctx.shadowBlur=28; ctx.strokeStyle='#fff1f4'; ctx.lineWidth=5;
        ctx.beginPath(); ctx.moveTo(-fx.radius,fx.radius*.5); ctx.lineTo(fx.radius,-fx.radius*.5); ctx.stroke();
        ctx.strokeStyle='#e52d55'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,fx.radius*(.45+progress*.6),-1.1,1.8); ctx.stroke();
      } else if(fx.type==='claw'){
        ctx.translate(x,y); ctx.rotate(fx.ang||0); ctx.globalAlpha=fade*.9; ctx.shadowColor='#ff3d67'; ctx.shadowBlur=22; ctx.strokeStyle='#ffd1d8'; ctx.lineWidth=5;
        for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(24+i*12,0,fx.length*(.42+i*.07),-.55,.55); ctx.stroke(); }
      } else if(fx.type==='flight'){
        ctx.translate(x,y); ctx.rotate(fx.ang||0); ctx.globalAlpha=fade*.7; ctx.shadowColor='#ff3d67'; ctx.shadowBlur=22; ctx.strokeStyle='#ff8294'; ctx.lineWidth=12;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(fx.length*(.25+progress*.75),0); ctx.stroke();
      } else if(fx.type==='tide'){
        ctx.translate(x,y); ctx.globalAlpha=fade*.38; ctx.shadowColor='#ff3d67'; ctx.shadowBlur=24; ctx.strokeStyle='#ff8294'; ctx.lineWidth=3;
        for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(0,0,fx.radius*(.45+i*.2)+Math.sin(animT*.1+i)*5,0,Math.PI*2); ctx.stroke(); }
      } else if(fx.type==='meteorTelegraph'){
        ctx.translate(x,y); ctx.globalAlpha=.25+Math.sin(animT*.35)*.18; ctx.shadowColor='#ff4f70'; ctx.shadowBlur=28; ctx.strokeStyle='#ffd1d8'; ctx.lineWidth=3; ctx.setLineDash([9,7]); ctx.beginPath(); ctx.arc(0,0,fx.radius*(.92+Math.sin(animT*.18)*.04),0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      } else if(fx.type==='meteorImpact'){
        ctx.translate(x,y); ctx.globalAlpha=fade*.7; ctx.shadowColor='#ff4f70'; ctx.shadowBlur=30; ctx.fillStyle='#b7193c'; ctx.beginPath(); ctx.arc(0,0,fx.radius*(.2+progress*.85),0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#ffd1d8'; ctx.lineWidth=4; ctx.stroke();
      } else if(fx.type==='rainTelegraph'){
        ctx.translate(x,y); ctx.globalAlpha=.2+fade*.5; ctx.shadowColor='#ff315a'; ctx.shadowBlur=28; ctx.strokeStyle='#ff718a'; ctx.lineWidth=3; ctx.setLineDash([8,6]); ctx.beginPath(); ctx.arc(0,0,fx.radius*(.72+Math.sin(animT*.22)*.08),0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]); for(let i=0;i<7;i++){ const a=i*Math.PI*2/7+animT*.035; ctx.beginPath(); ctx.moveTo(Math.cos(a)*fx.radius*.35,Math.sin(a)*fx.radius*.35); ctx.lineTo(Math.cos(a)*fx.radius,Math.sin(a)*fx.radius); ctx.stroke(); }
      } else if(fx.type==='bossUnique'){
        ctx.translate(x,y); ctx.globalAlpha=fade*.66; ctx.shadowColor='#ff8294'; ctx.shadowBlur=34; ctx.strokeStyle='#fff1f4'; ctx.lineWidth=4; ctx.setLineDash([10,7]); ctx.beginPath(); ctx.arc(0,0,fx.radius*(.35+progress*.55),0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]); ctx.strokeStyle='#ff4f70'; ctx.lineWidth=2; for(let i=0;i<6;i++){ const a=i*Math.PI/3+progress; ctx.beginPath(); ctx.moveTo(Math.cos(a)*fx.radius*.25,Math.sin(a)*fx.radius*.25); ctx.lineTo(Math.cos(a)*fx.radius,Math.sin(a)*fx.radius); ctx.stroke(); }
      } else if(fx.type==='heart'){
        ctx.translate(x,y); ctx.globalAlpha=.18+fade*.35; ctx.shadowColor='#ff8294'; ctx.shadowBlur=28; ctx.strokeStyle='#ff8294'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,fx.radius*(.65+Math.sin(animT*.12)*.08),0,Math.PI*2); ctx.stroke();
      } else if(fx.type==='postureBreak'){
        ctx.translate(x,y); ctx.globalAlpha=fade*.9; ctx.shadowColor='#9fd8ff'; ctx.shadowBlur=22; ctx.strokeStyle='#c9eaff'; ctx.lineWidth=4; ctx.setLineDash([7,5]); ctx.beginPath(); ctx.arc(0,0,fx.radius*(.45+progress*.7),0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]); for(let i=0;i<8;i++){ const a=i*Math.PI/4+progress; ctx.beginPath(); ctx.moveTo(Math.cos(a)*fx.radius*.25,Math.sin(a)*fx.radius*.25); ctx.lineTo(Math.cos(a)*fx.radius,Math.sin(a)*fx.radius); ctx.stroke(); }
      } else if(fx.type==='magicStaff'){
        ctx.translate(x,y); ctx.rotate(fx.ang||0); ctx.globalAlpha=fade*.9; ctx.shadowColor='#75e8ff'; ctx.shadowBlur=26; ctx.strokeStyle='#c7f6ff'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(fx.length*(.2+progress*.8),0); ctx.stroke(); ctx.lineWidth=2; ctx.beginPath(); ctx.arc(fx.length*.38,0,14+progress*18,-1.2,1.2); ctx.stroke();
      } else if(fx.type==='magicSigil'){
        ctx.translate(x,y); ctx.globalAlpha=fade*.8; ctx.shadowColor='#ff7043'; ctx.shadowBlur=24; ctx.strokeStyle='#ffb07c'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,fx.radius*(.45+progress*.7),0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-fx.radius*.65,0); ctx.lineTo(fx.radius*.65,0); ctx.moveTo(0,-fx.radius*.65); ctx.lineTo(0,fx.radius*.65); ctx.stroke();
      } else if(fx.type==='ultimate'){
        ctx.translate(x,y); ctx.globalAlpha=fade*.7; ctx.shadowColor='#ff3d67'; ctx.shadowBlur=34; ctx.strokeStyle='#fff1f4'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(0,0,fx.radius*(.25+progress*.9),0,Math.PI*2); ctx.stroke(); ctx.strokeStyle='#ff718a'; ctx.lineWidth=2; for(let i=0;i<6;i++){ ctx.save(); ctx.rotate(i*Math.PI/3+progress); ctx.beginPath(); ctx.moveTo(-fx.radius*.85,0); ctx.lineTo(fx.radius*.85,0); ctx.stroke(); ctx.restore(); }
      } else if(fx.type==='moonCold'){
        ctx.translate(x,y); ctx.rotate(fx.ang||0); ctx.globalAlpha=fade*.82; ctx.shadowColor='#9fc8ff'; ctx.shadowBlur=24; ctx.strokeStyle='#d8e8ff'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(45,0,22+progress*32,-.72,.72); ctx.stroke(); ctx.strokeStyle='#7fa4ff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(fx.length*(.25+progress*.75),0); ctx.stroke();
      } else if(fx.type==='moonAstral'){
        ctx.translate(x,y); ctx.globalAlpha=fade*.7; ctx.shadowColor='#9fc8ff'; ctx.shadowBlur=32; ctx.strokeStyle='#d8b4ff'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(0,0,fx.radius*(.35+progress*.85),0,Math.PI*2); ctx.stroke(); for(let i=0;i<4;i++){ ctx.save(); ctx.rotate(i*Math.PI/2+progress); ctx.beginPath(); ctx.moveTo(-fx.radius*.8,0); ctx.lineTo(fx.radius*.8,0); ctx.stroke(); ctx.restore(); }
      }
      ctx.restore();
    }
  }

  function showFT(t,x,y,c){ floating.push({text:t,x:x,y:y,color:c,life:40}); }

  function dragonReady(cd,cost){
    if(!player || player.manaChargeActive || cd>0 || player.fp<cost || player.dragonCast>0 || player.isDodging){ if(player&&player.fp<cost) showFT('FP insuficiente',player.x,player.y-34,'#ff8294'); return false; } return true;
  }
  function castDragonClaw(){
    const cost=14; if(!dragonReady(player&&player.dragonClawCd,cost)) return;
    player.lastDragonSkill='claw';
    const ang=Math.atan2(mouse.y-(player.y-cam.y),mouse.x-(player.x-cam.x)); player.fp-=cost; player.dragonClawCd=100; player.dragonCast=22; player.anim='attack-heavy'; player.animStart=animT;
    const hits=dragonConeDamage(player.x,player.y,ang,138,.34,48); dragonFX.push({type:'claw',x:player.x,y:player.y,ang:ang,life:24,maxLife:24,length:138}); spawnRenewalFX('smear',player.x+Math.cos(ang)*70,player.y+Math.sin(ang)*70,ang,130); triggerScreenShake(hits?9:4,4); showFT('GARRA DEL ABISMO',player.x,player.y-44,'#ff8294');
  }
  function castDragonFlight(){
    const cost=22; if(!dragonReady(player&&player.dragonFlightCd,cost)) return;
    player.lastDragonSkill='flight';
    const ang=Math.atan2(mouse.y-(player.y-cam.y),mouse.x-(player.x-cam.x)); player.fp-=cost; player.dragonFlightCd=180; player.dragonCast=20; player.invuln=28; const ox=player.x,oy=player.y;
    player.x=Math.max(40,Math.min(MAP_W-40,player.x+Math.cos(ang)*190)); player.y=Math.max(40,Math.min(MAP_H-40,player.y+Math.sin(ang)*190));
    dragonFX.push({type:'flight',x:ox,y:oy,ang:ang,life:30,maxLife:30,length:190}); spawnRenewalFX('explosion',player.x,player.y,0,120); spawnRenewalFX('smoke',ox,oy,ang,132); dragonAreaDamage(player.x,player.y,64,38,true); triggerScreenShake(8,5); showFT('VUELO DE CENIZA',player.x,player.y-44,'#ff8294');
  }
  function castDragonTide(){
    const cost=28; if(!dragonReady(player&&player.dragonTideCd,cost)) return;
    player.lastDragonSkill='tide';
    player.fp-=cost; player.dragonTideCd=300; player.dragonCast=26;
    dragonZones.push({type:'tide',x:player.x,y:player.y,radius:36,baseRadius:214,age:0,life:TIDE_PHASE_FRAMES,maxLife:TIDE_PHASE_FRAMES,pulse:0});
    showFT('MAREA CARMESÍ',player.x,player.y-44,'#ff8294');
  }
  function castDragonMeteor(){
    const cost=36; if(!dragonReady(player&&player.dragonMeteorCd,cost)) return;
    player.lastDragonSkill='meteor';
    const x=cam.x+mouse.x,y=cam.y+mouse.y;     player.fp-=cost; player.dragonMeteorCd=360; player.dragonCast=34; dragonPending.push({type:'meteor',source:'player',x:Math.max(40,Math.min(MAP_W-40,x)),y:Math.max(40,Math.min(MAP_H-40,y)),life:180,maxLife:180,radius:118}); dragonFX.push({type:'meteorTelegraph',x:x,y:y,life:180,maxLife:180,radius:170}); showFT('METEORITO DEL SELLO',player.x,player.y-44,'#ffd1d8');
  }
  function startManaCharge(){
    if(!player || state!=='PLAYING' || player.manaChargeActive || player.isDodging || player.isParrying || player.dragonCast>0) return;
    player.manaChargeActive=true; player.manaCharge=0; player.manaChargeAuraClock=0; player.manaChargeVfxLife=0; player.manaChargeVfxProgress=0; player.anim='cast'; player.animStart=animT;
    startManaChargeSound(); manaHaptic(12); showFT('CARGA DE MANÁ',player.x,player.y-44,'#ff8294');
  }
  function cancelManaCharge(interrupted){
    if(!player || !player.manaChargeActive) return;
    player.manaChargeVfxProgress=Math.max(0,Math.min(1,player.manaCharge/MANA_CHARGE_FRAMES));
    player.manaChargeVfxLife=30;
    player.manaChargeActive=false; player.manaCharge=0;
    stopManaChargeSound(); manaHaptic(interrupted?[20,25,20]:18);
    if(player.anim==='cast'){ player.anim='idle'; player.animStart=animT; }
    if(interrupted) showFT('CARGA INTERRUMPIDA',player.x,player.y-44,'#ffb0bc');
  }
  function completeManaCharge(){
    if(!player || !player.manaChargeActive || player.manaCharge<MANA_CHARGE_FRAMES) return;
    player.manaChargeVfxProgress=1; player.manaChargeVfxLife=30;
    player.manaChargeActive=false; player.manaCharge=0;
    stopManaChargeSound(); playHeartDragonSound(); manaHaptic([35,25,90]);
    player.lastDragonSkill='heart'; player.dragonHeartTimer=360; player.dragonWard=90; player.dragonCast=28; player.anim='cast'; player.animStart=animT;
    dragonFX.push({type:'heart',x:player.x,y:player.y,life:360,maxLife:360,radius:112});
    spawnRenewalFX('holy',player.x,player.y,0,170); spawnRenewalFX('mirror',player.x,player.y,0,178); triggerScreenShake(12,7); showFT('CORAZÓN DEL DRAGÓN',player.x,player.y-44,'#fff1f4');
  }
  function updateManaCharge(dt){
    if(!player || !player.manaChargeActive) return;
    if(state!=='PLAYING' || !keys['n']){ cancelManaCharge(false); return; }
    player.manaCharge=Math.min(MANA_CHARGE_FRAMES,player.manaCharge+60*dt);
    player.manaChargeAuraClock=(player.manaChargeAuraClock||0)+60*dt;
    player.manaChargeVfxProgress=Math.max(0,Math.min(1,player.manaCharge/MANA_CHARGE_FRAMES));
    updateManaChargeSound(player.manaChargeVfxProgress);
    player.fp=Math.min(player.maxFp,player.fp+MANA_CHARGE_FP_PER_FRAME*60*dt);
  }
  function castDragonHeart(){ startManaCharge(); }
  function castMagicWeaponSkill(){
    if(!player || state!=='PLAYING') return;
    const w=getWeapon();
    if(!w.magicSkillName){ showFT('Esta arma no tiene arte mágico',player.x,player.y-34,'#cdbfa0'); return; }
    const cost=w.magicSkillCost||18;
    if(player.magicSkillCd>0){ showFT('Arte en '+(player.magicSkillCd/60).toFixed(1)+'s',player.x,player.y-34,'#9fb7ff'); return; }
    if(player.fp<cost){ showFT('FP insuficiente',player.x,player.y-34,'#ff8294'); return; }
    const ang=Math.atan2(mouse.y-(player.y-cam.y),mouse.x-(player.x-cam.x));
    player.fp-=cost; player.magicSkillCd=w.magicSkillCooldown||180; player.dragonCast=26; player.anim='cast'; player.animStart=animT;
    if(player.weapon==='baston'){
      projectiles.push({x:player.x,y:player.y,vx:Math.cos(ang)*12,vy:Math.sin(ang)*12,dmg:76*player.dmgMul,r:9,life:90,color:'#75e8ff',fromPlayer:true,weaponId:'baston',skill:true,posture:28,magicSkill:true});
      dragonFX.push({type:'magicStaff',x:player.x,y:player.y,ang:ang,life:32,maxLife:32,length:240}); spawnRenewalFX('thunder',player.x+Math.cos(ang)*72,player.y+Math.sin(ang)*72,ang,94);
    } else if(player.weapon==='sello'){
      const hits=dragonAreaDamage(player.x+Math.cos(ang)*86,player.y+Math.sin(ang)*86,112,68,false);
      for(let i=0;i<enemies.length;i++){ const e=enemies[i]; if(e.hp>0&&Math.hypot(e.x-player.x,e.y-player.y)<190){ applyCombatState(e,'marked',180); applyPostureDamage(e,26); } }
      if(boss&&boss.hp>0&&Math.hypot(boss.x-player.x,boss.y-player.y)<190){ applyCombatState(boss,'marked',180); applyPostureDamage(boss,26); }
      dragonFX.push({type:'magicSigil',x:player.x+Math.cos(ang)*86,y:player.y+Math.sin(ang)*86,life:42,maxLife:42,radius:154}); spawnRenewalFX('holy',player.x+Math.cos(ang)*86,player.y+Math.sin(ang)*86,0,166); spawnRenewalFX('mirror',player.x+Math.cos(ang)*86,player.y+Math.sin(ang)*86,0,148); triggerScreenShake(hits?9:4,4);
    }
    showFT(w.magicSkillName.toUpperCase(),player.x,player.y-48,w.color); updateHUD();
  }
  function castCharacterUltimate(){
    if(!player || state!=='PLAYING') return;
    if(player.ultimateCd>0){ showFT('DEFINITIVA EN '+Math.ceil(player.ultimateCd/60)+'s',player.x,player.y-42,'#ffb7c4'); return; }
    player.ultimateCd=4200; player.dragonCast=60; player.invuln=132; player.dragonWard=300; player.anim='cast'; player.animStart=animT;
    player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.22); player.fp=player.maxFp; player.sta=player.maxSta;
    const hits=dragonAreaDamage(player.x,player.y,270,150,true);
    for(let i=0;i<enemies.length;i++){ const e=enemies[i]; if(e.hp>0&&Math.hypot(e.x-player.x,e.y-player.y)<270+e.r){ applyCombatState(e,'vulnerable',220); applyPostureDamage(e,58); e.frozen=Math.max(e.frozen||0,72); } }
    if(boss&&boss.hp>0&&Math.hypot(boss.x-player.x,boss.y-player.y)<270+boss.r){ applyCombatState(boss,'vulnerable',220); applyPostureDamage(boss,70); boss.frozen=Math.max(boss.frozen||0,72); }
    dragonFX.push({type:'ultimate',x:player.x,y:player.y,life:360,maxLife:360,radius:270}); spawnApotheosisVioletFX(player.x,player.y); spawnRenewalFX('crystal',player.x,player.y,0,320); spawnRenewalFX('mirror',player.x,player.y,0,254); triggerScreenShake(24,14); screenFlash=18; showFT('APOTEOSIS DEL SELLO',player.x,player.y-58,'#fff1f4'); updateHUD();
  }
  function castMoonCold(){
    if(!player || player.weapon!=='espadonluna' || player.moonColdCd>0 || player.fp<18 || player.dragonCast>0 || player.isDodging){ if(player&&player.weapon!=='espadonluna') showFT('Requiere Espadón Lunar',player.x,player.y-34,'#9fb7ff'); return; }
    const ang=Math.atan2(mouse.y-(player.y-cam.y),mouse.x-(player.x-cam.x)); player.fp-=18; player.moonColdCd=150; player.dragonCast=24; player.anim='cast'; player.animStart=animT;
    const x=player.x+Math.cos(ang)*18,y=player.y+Math.sin(ang)*18;
    projectiles.push({x:x,y:y,vx:Math.cos(ang)*11,vy:Math.sin(ang)*11,dmg:62*player.dmgMul,r:9,life:72,color:'#9fc8ff',fromPlayer:true,weaponId:'espadonluna',skill:true,posture:24,moonWave:true});
    dragonFX.push({type:'moonCold',x:player.x,y:player.y,ang:ang,life:28,maxLife:28,length:210}); spawnRenewalFX('smear',player.x+Math.cos(ang)*80,player.y+Math.sin(ang)*80,ang,126); spawnRenewalFX('smearV',player.x+Math.cos(ang)*80,player.y+Math.sin(ang)*80,ang+Math.PI/2,138); showFT('LUNA FRÍA',player.x,player.y-44,'#9fc8ff');
  }
  function castMoonAstral(){
    if(!player || player.weapon!=='espadonluna' || player.moonAstralCd>0 || player.fp<30 || player.dragonCast>0 || player.isDodging){ if(player&&player.weapon!=='espadonluna') showFT('Requiere Espadón Lunar',player.x,player.y-34,'#9fb7ff'); return; }
    player.fp-=30; player.moonAstralCd=270; player.dragonCast=34; player.anim='attack-heavy'; player.animStart=animT;
    const hits=dragonAreaDamage(player.x,player.y,132,82,false);
    for(let i=0;i<enemies.length;i++){ const e=enemies[i]; if(e.hp>0&&Math.hypot(e.x-player.x,e.y-player.y)<132+e.r) applyPostureDamage(e,34); }
    if(boss&&boss.hp>0&&Math.hypot(boss.x-player.x,boss.y-player.y)<132+boss.r) applyPostureDamage(boss,34);
    dragonFX.push({type:'moonAstral',x:player.x,y:player.y,life:40,maxLife:40,radius:180}); spawnRenewalFX('holy',player.x,player.y,0,200); triggerScreenShake(hits?12:6,6); showFT('ESPADA ASTRAL',player.x,player.y-48,'#d8b4ff');
  }
  function updateDragonZones(){
    for(let i=dragonZones.length-1;i>=0;i--){
      const z=dragonZones[i];
      if(z.type==='tide'){
        z.age++;
        z.life--;
        z.pulse--;
        const diameter=tideDiameter(z.age);
        z.radius=Math.min(z.baseRadius,diameter/2);
        if(z.pulse<=0){ dragonAreaDamage(z.x,z.y,z.radius,24,true); z.pulse=42; }
        if(z.life<=0) dragonZones.splice(i,1);
      }
    }
    for(let i=dragonPending.length-1;i>=0;i--){ const p=dragonPending[i]; p.life--;       if(p.life<=0){ dragonAreaDamage(p.x,p.y,p.radius,105,true); spawnRenewalFX(p.source==='player'?'meteorBlue':'meteorExplosion',p.x,p.y,0,p.radius*2,180,false); triggerScreenShake(20,12); screenFlash=14; dragonPending.splice(i,1); } }
  }

  // ========== DRAW ==========
  function draw(){
    ctx.fillStyle='#0a0c0a'; ctx.fillRect(0,0,W,H);
    let shakeX=0, shakeY=0;
    if(screenShake.time>0 && screenShake.max>0 && settings.shake){
      const strength=screenShake.power*(screenShake.time/screenShake.max);
      shakeX=(Math.random()-0.5)*strength;
      shakeY=(Math.random()-0.5)*strength;
    }
    ctx.save(); ctx.translate(shakeX, shakeY);

    // ground tiles
    const T=64;
    const c0=Math.floor(cam.x/T), c1=Math.floor((cam.x+W)/T)+1;
    const r0=Math.floor(cam.y/T), r1=Math.floor((cam.y+H)/T)+1;
    const gimg = spr('renewal-ground-tile') || spr('suelo');
    for(let r=r0;r<=r1;r++){
      for(let c=c0;c<=c1;c++){
        const bx=c*T-cam.x, by=r*T-cam.y;
        if(gimg) ctx.drawImage(gimg, bx, by, T, T);
        else {
          ctx.fillStyle = ((c+r)%2)? '#1a2318':'#152018';
          ctx.fillRect(bx,by,T,T);
        }
      }
    }
    // piso reforzado: losas, grietas y lectura de profundidad sin reemplazar el asset base
    ctx.save(); ctx.globalAlpha=.13; ctx.strokeStyle='#7e2338'; ctx.lineWidth=1;
    for(let r=r0;r<=r1;r++){ for(let c=c0;c<=c1;c++){ const bx=c*T-cam.x, by=r*T-cam.y; ctx.strokeRect(bx+1,by+1,T-2,T-2); if((Math.abs(c*17+r*11)%9)===0){ ctx.beginPath(); ctx.moveTo(bx+14,by+22); ctx.lineTo(bx+26,by+35); ctx.lineTo(bx+20,by+49); ctx.stroke(); } } }
    ctx.restore();
    // El tile renovado es ahora el piso base; el asset antiguo queda solo como fallback de carga.

    // moon tint
    if(bloodMoon){ ctx.fillStyle='rgba(120,20,20,0.18)'; ctx.fillRect(0,0,W,H); }
    else if(glintMoon){ ctx.fillStyle='rgba(40,80,140,0.12)'; ctx.fillRect(0,0,W,H); }

    // decoración contextual reutilizada de los assets del proyecto
    for(let i=0;i<mapDecor.length;i++){
      const d=mapDecor[i], img=decorImages[d.src], x=d.x-cam.x, y=d.y-cam.y;
      if(x<-100||y<-100||x>W+100||y>H+100) continue;
      ctx.save(); ctx.globalAlpha=d.alpha; ctx.shadowColor=d.character?'#ff3d67':'#8e1635'; ctx.shadowBlur=d.character?12:5;
      if(img&&img.complete&&img.naturalWidth){
        if(Number.isFinite(d.sx) && Number.isFinite(d.sy) && Number.isFinite(d.sw) && Number.isFinite(d.sh)) ctx.drawImage(img,d.sx,d.sy,d.sw,d.sh,x-d.w/2,y-d.h/2,d.w,d.h);
        else ctx.drawImage(img,x-d.w/2,y-d.h/2,d.w,d.h);
      }
      else { ctx.fillStyle=d.character?'#8e1635':'#32302e'; ctx.beginPath(); ctx.arc(x,y,d.w*.35,0,Math.PI*2); ctx.fill(); }
      if(d.kind==='altar' || d.kind==='teleport' || d.kind==='ritual' || d.kind==='crystal'){
        const accent=d.kind==='crystal'?'#72dcff':(d.kind==='teleport'?'#b47bd4':'#ff8294');
        ctx.globalAlpha=Math.min(1,d.alpha*.72); ctx.strokeStyle=accent; ctx.shadowColor=accent; ctx.shadowBlur=settings.performanceMode?6:14; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(x,y,d.w*.62+Math.sin(animT*.08)*3,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0;
      }
      if(d.character){ ctx.strokeStyle='#ff8294'; ctx.globalAlpha=d.alpha*.55; ctx.strokeRect(x-d.w/2-3,y-d.h/2-3,d.w+6,d.h+6); }
      ctx.restore();
    }

    // telegráficos de arena de fase II
    for(let i=0;i<arenaHazards.length;i++){
      const h=arenaHazards[i], x=h.x-cam.x, y=h.y-cam.y, p=1-h.life/h.maxLife;
      ctx.save(); ctx.globalAlpha=h.hit?0.28:0.22+Math.sin(animT*.25)*.12;
      ctx.fillStyle=h.color; ctx.strokeStyle=h.color; ctx.lineWidth=2+(h.hit?4:0); ctx.shadowColor=h.color; ctx.shadowBlur=16;
      ctx.beginPath(); ctx.arc(x,y,h.r*(h.hit?1.18:1),0,Math.PI*2); ctx.fill(); ctx.stroke();
      if(!h.hit){ const hazardNames={meteor:'METEORO',petals:'PÉTALOS',thunder:'RAYO',arms:'JAULA',blood:'SANGRE',silence:'SILENCIO',ash:'CENIZA'}; ctx.globalAlpha=.9; ctx.font='9px Cinzel,serif'; ctx.textAlign='center'; ctx.fillStyle='#fff1f4'; ctx.fillText(hazardNames[h.type]||h.type.toUpperCase(),x,y+3); }
      ctx.restore();
    }

    // enemies
    // Se calcula una sola vez por frame en lugar de repetirlo para cada enemigo visible.
    const executionTarget = player ? findExecutionTarget() : null;
    for(let i=0;i<enemies.length;i++){
      const e=enemies[i]; if(e.hp<=0) continue;
      const ex=e.x-cam.x, ey=e.y-cam.y;
      if(ex<-60||ey<-60||ex>W+60||ey>H+60) continue;
      if(e.stealth>0) ctx.globalAlpha=.18+Math.sin(animT*.3)*.08;
      if(e.hitFlash>0) ctx.globalAlpha=Math.min(ctx.globalAlpha||1,.6);
      if(e.frozen>0){ ctx.globalAlpha=0.85; }
      if(!drawNayutaroEnemy(e,ex,ey) && !drawRenewalEnemy(e,ex,ey)){
        if(!drawSpr(e.spr, ex, ey, e.r*3.8, e.r*3.8, e.x>player.x)){
          ctx.fillStyle=e.color;
          ctx.beginPath(); ctx.arc(ex,ey,e.r,0,Math.PI*2); ctx.fill();
        }
      }
      ctx.globalAlpha=1;
      if(e.barrier>0){ ctx.strokeStyle='#d8b4ff'; ctx.lineWidth=3; ctx.shadowColor='#b47bd4'; ctx.shadowBlur=12; ctx.beginPath(); ctx.arc(ex,ey,e.r+7+Math.sin(animT*.18)*2,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0; }
      if(e.role==='guardian'){ ctx.strokeStyle='#e2bd8d'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(ex,ey,e.r+4,-.9,.9); ctx.stroke(); }
      if(e.chargeTimer>0){ ctx.strokeStyle='#ffb16b'; ctx.lineWidth=2; ctx.globalAlpha=.75; ctx.beginPath(); ctx.moveTo(ex,ey); ctx.lineTo(ex+e.chargeDX*82,ey+e.chargeDY*82); ctx.stroke(); ctx.globalAlpha=1; }
      if(e.role){ const roleNames={guardian:'GUARDIÁN',summoner:'BARRERA',assassin:'ASESINO',charger:'EMBESTIDORA',healer:'SANADOR',mimic:'MÍMICO'}; ctx.font='8px Cinzel,serif'; ctx.textAlign='center'; ctx.fillStyle=e.role==='mimic'?'#d8b4ff':'#ffd1d8'; ctx.fillText(roleNames[e.role]||e.role.toUpperCase(),ex,ey-e.r-28); }
      if(e.postureMax){ ctx.fillStyle='rgba(0,0,0,.72)'; ctx.fillRect(ex-18,ey+e.r+5,36,3); ctx.fillStyle='#9fd8ff'; ctx.fillRect(ex-18,ey+e.r+5,36*Math.max(0,e.posture/e.postureMax),3); }
      const stateText=combatStateLabel(e);
      if(stateText){ ctx.font='9px Cinzel,serif'; ctx.textAlign='center'; ctx.fillStyle=stateOf(e).vulnerable>0?'#ffd1d8':(stateOf(e).marked>0?'#ff8294':'#b9d8ff'); ctx.fillText(stateText,ex,ey-e.r-16); }
      if(player && executionTarget===e){ ctx.strokeStyle='#fff1f4'; ctx.lineWidth=2; ctx.shadowColor='#ff3d67'; ctx.shadowBlur=14; ctx.beginPath(); ctx.arc(ex,ey,e.r+10+Math.sin(animT*.25)*3,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0; ctx.font='10px Cinzel,serif'; ctx.fillStyle='#fff1f4'; ctx.fillText('E · EJECUTAR',ex,ey+e.r+18); }
      ctx.globalAlpha=1;
      if(e.hp<e.maxHp){
        ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(ex-14,ey-e.r-10,28,3);
        ctx.fillStyle='#e53935'; ctx.fillRect(ex-14,ey-e.r-10,28*(e.hp/e.maxHp),3);
      }
    }

    // boss
    if(boss && boss.hp>0){
      const bx=boss.x-cam.x, by=boss.y-cam.y;
      const sk = (boss.phase2 && boss.sprite2) ? 'jefe-maliketh2' : ('jefe-'+boss.id);
      if(boss.phase2) drawSpr('efecto-aura', bx, by, boss.r*5, boss.r*5, false);
      if(boss.hitFlash>0) ctx.globalAlpha=0.7;
      const animatedBossDrawn = boss.id==='radahn' && drawAnimatedRadahnBoss(boss,bx,by);
      if(!animatedBossDrawn && !drawSpr(sk, bx, by, boss.r*3.2, boss.r*3.2, false)){
        ctx.fillStyle=boss.color;
        ctx.beginPath(); ctx.arc(bx,by,boss.r,0,Math.PI*2); ctx.fill();
      }
      const bossState=combatStateLabel(boss);
      if(boss.postureMax){ ctx.fillStyle='rgba(0,0,0,.72)'; ctx.fillRect(bx-24,by+boss.r+7,48,4); ctx.fillStyle='#9fd8ff'; ctx.fillRect(bx-24,by+boss.r+7,48*Math.max(0,boss.posture/boss.postureMax),4); }
      if(bossState){ ctx.font='11px Cinzel,serif'; ctx.textAlign='center'; ctx.fillStyle='#ffd1d8'; ctx.fillText(bossState,bx,by-boss.r-20); }
      if(player && executionTarget===boss){ ctx.strokeStyle='#fff1f4'; ctx.lineWidth=3; ctx.shadowColor='#ff3d67'; ctx.shadowBlur=18; ctx.beginPath(); ctx.arc(bx,by,boss.r+14+Math.sin(animT*.25)*4,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0; ctx.font='11px Cinzel,serif'; ctx.fillStyle='#fff1f4'; ctx.fillText('E · EJECUTAR',bx,by+boss.r+24); }
      ctx.globalAlpha=1;
    }

    // projectiles
    for(let i=0;i<projectiles.length;i++){
      const p=projectiles[i];
      if(p.enemyOrb && drawEnemyMagicProjectile(p)) continue;
      if(p.judgmentBolt && Number.isFinite(p.px) && Number.isFinite(p.py)){
        ctx.save();
        ctx.globalAlpha=Math.max(0, Math.min(0.85, p.life/110));
        ctx.strokeStyle='#f0d99a'; ctx.lineWidth=3; ctx.lineCap='round';
        ctx.shadowColor='#d9b25c'; ctx.shadowBlur=12;
        ctx.beginPath(); ctx.moveTo(p.px-cam.x,p.py-cam.y); ctx.lineTo(p.x-cam.x,p.y-cam.y); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle=p.color;
      ctx.shadowColor=p.color; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(p.x-cam.x,p.y-cam.y,p.r,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
    }

    // habilidades del Sello Dracónico
    drawDragonEffects();
    drawTideZones();
    drawRenewalFX();
    drawHolyUltimateFX();
    drawApotheosisVioletFX();

    // particles
    for(let i=0;i<particles.length;i++){
      if(settings.performanceMode && i%2===0) continue;
      const p=particles[i];
      const max=p.maxLife||20;
      ctx.globalAlpha=Math.max(0,p.life/max);
      ctx.fillStyle=p.color;
      if(p.glow){ ctx.shadowColor=p.color; ctx.shadowBlur=10; }
      ctx.beginPath(); ctx.arc(p.x-cam.x,p.y-cam.y,p.r,0,Math.PI*2); ctx.fill();
      if(p.glow) ctx.shadowBlur=0;
    }
    ctx.globalAlpha=1;

    // slash
    for(let i=0;i<slashFX.length;i++){
      const s=slashFX[i]; const a=s.life/s.max;
      ctx.save();
      ctx.translate(s.x-cam.x,s.y-cam.y); ctx.rotate(s.ang||0);
      ctx.strokeStyle=s.color||'#f0d99a'; ctx.globalAlpha=a*0.9;
      ctx.lineWidth=3+a*5; ctx.lineCap='round';
      ctx.beginPath(); ctx.arc(0,0,24+(1-a)*12,-1.1,1.1); ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha=1;

    // player
    if(player){
      const px=player.x-cam.x, py=player.y-cam.y;
      const bob=Math.sin(animT*0.15)*1.5;
      if(player.invuln>0 && animT%4<2) ctx.globalAlpha=0.4;
      if(!drawVagabundo(px, py, bob)){
        ctx.fillStyle='#d9b25c';
        ctx.beginPath(); ctx.arc(px,py+bob,player.r,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
      drawWeapon(px, py, bob);
      drawWeaponSlash(px, py);
      // weapon hint line
      const w=getWeapon();
      ctx.strokeStyle=w.color; ctx.globalAlpha=0.35; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+player.facing*w.range*0.5, py-6); ctx.stroke();
      ctx.globalAlpha=1;
      if(player.isParrying){
        ctx.strokeStyle='#f0d99a'; ctx.globalAlpha=0.7; ctx.lineWidth=3;
        ctx.beginPath(); ctx.arc(px, py, player.r+12, 0, Math.PI*2); ctx.stroke();
        ctx.globalAlpha=1;
      }
      if(player.isDodging){
        ctx.globalAlpha=0.35;
        ctx.fillStyle='#87ceeb';
        ctx.beginPath(); ctx.arc(px,py,player.r+6,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=1;
      }
    }
    // La carga se dibuja encima del jugador y se ancla a su base visual.
    drawManaChargeFX();

    // floating text
    for(let i=0;i<floating.length;i++){
      const f=floating[i];
      ctx.globalAlpha=Math.max(0,f.life/40);
      ctx.font='bold 14px Cinzel,serif'; ctx.textAlign='center';
      ctx.strokeStyle='#000'; ctx.lineWidth=3;
      ctx.strokeText(f.text, f.x-cam.x, f.y-cam.y);
      ctx.fillStyle=f.color; ctx.fillText(f.text, f.x-cam.x, f.y-cam.y);
    }
    ctx.globalAlpha=1;

    if(screenFlash>0){
      ctx.fillStyle='rgba(255,248,214,'+(screenFlash*0.07)+')';
      ctx.fillRect(0,0,W,H);
    }
    ctx.restore();

    // minimap
    const mw=110,mh=110,mx=W-mw-10,my=10;
    ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(mx,my,mw,mh);
    ctx.strokeStyle='rgba(217,178,92,0.4)'; ctx.strokeRect(mx,my,mw,mh);
    const sc=mw/MAP_W;
    ctx.fillStyle='#e53935';
    for(let i=0;i<enemies.length;i++){
      if(enemies[i].hp<=0) continue;
      ctx.fillRect(mx+enemies[i].x*sc-1, my+enemies[i].y*sc-1, 2, 2);
    }
    if(boss&&boss.hp>0){ ctx.fillStyle='#d9b25c'; ctx.fillRect(mx+boss.x*sc-3,my+boss.y*sc-3,6,6); }
    if(playerHasCurse('closedEye')){ ctx.clearRect(mx,my,mw,mh); }
    ctx.fillStyle='#f0d99a';
    ctx.beginPath(); ctx.arc(mx+player.x*sc, my+player.y*sc, 3, 0, Math.PI*2); ctx.fill();
  }

  function updateHUD(){
    if(!player) return;
    const hp=$('surv-hp'), sta=$('surv-sta'), fp=$('surv-fp');
    if(hp) hp.style.width=Math.max(0,Math.min(100,player.hp/player.maxHp*100))+'%';
    if(sta) sta.style.width=Math.max(0,Math.min(100,player.sta/player.maxSta*100))+'%';
    if(fp) fp.style.width=Math.max(0,Math.min(100,player.fp/player.maxFp*100))+'%';
    const hpn=$('surv-hp-n'); if(hpn) hpn.textContent=Math.ceil(player.hp);
    const stan=$('surv-sta-n'); if(stan) stan.textContent=Math.ceil(player.sta);
    const fpn=$('surv-fp-n'); if(fpn) fpn.textContent=Math.ceil(player.fp);
    const shardHud=$('dragon-shards-hud'); if(shardHud) shardHud.textContent=player.dragonShards||0;
    const roar=$('dragon-roar-cd'), breath=$('dragon-breath-cd');
    const skillLabel=function(cd,cost){ return cd>0 ? (cd/60).toFixed(1)+'s' : 'LISTO · '+cost+' FP'; };
    if(roar){ roar.textContent=skillLabel(player.dragonRoarCd,26); roar.classList.toggle('listo',player.dragonRoarCd<=0); }
    if(breath){ breath.textContent=skillLabel(player.dragonBreathCd,20); breath.classList.toggle('listo',player.dragonBreathCd<=0); }
    const moonCold=$('moon-cold-cd'), moonAstral=$('moon-astral-cd'), lunar=player.weapon==='espadonluna';
    if(moonCold) moonCold.textContent=lunar ? skillLabel(player.moonColdCd,18) : 'Equipar Espadón';
    if(moonAstral) moonAstral.textContent=lunar ? skillLabel(player.moonAstralCd,30) : 'Equipar Espadón';
    const magicCdEl=$('magic-skill-cd'), ultimateCdEl=$('ultimate-cd'), activeWeapon=getWeapon();
    if(magicCdEl) magicCdEl.textContent=activeWeapon.magicSkillName ? (player.magicSkillCd>0 ? (player.magicSkillCd/60).toFixed(1)+'s' : 'LISTO · '+activeWeapon.magicSkillCost+' FP') : 'Solo Bastón/Sello';
    if(ultimateCdEl) ultimateCdEl.textContent=player.ultimateCd>0 ? (player.ultimateCd/60).toFixed(1)+'s' : 'LISTA · 70 s';
    const heartEl=$('dragon-heart-cd');
    if(heartEl) heartEl.textContent=player.manaChargeActive ? ('CARGANDO · '+Math.round(player.manaCharge/MANA_CHARGE_FRAMES*100)+'%') : (player.dragonHeartTimer>0 ? ('ACTIVO · '+(player.dragonHeartTimer/60).toFixed(1)+'s') : 'Mantén N · carga lenta');
    const roarBtn=$('mob-dragon-roar'), breathBtn=$('mob-dragon-breath');
        if(roarBtn) roarBtn.disabled=player.dragonRoarCd>0 || player.fp<26;
    if(breathBtn) breathBtn.disabled=player.dragonBreathCd>0 || player.fp<20;
    const moonColdBtn=$('mob-moon-cold'), moonAstralBtn=$('mob-moon-astral');
    if(moonColdBtn) moonColdBtn.disabled=!lunar || player.moonColdCd>0 || player.fp<18;
    if(moonAstralBtn) moonAstralBtn.disabled=!lunar || player.moonAstralCd>0 || player.fp<30;
    const magicBtn=$('mob-magic-skill'), ultimateBtn=$('mob-ultimate');
    if(magicBtn) magicBtn.disabled=!activeWeapon.magicSkillName || player.magicSkillCd>0 || player.fp<(activeWeapon.magicSkillCost||18);
    if(ultimateBtn) ultimateBtn.disabled=player.ultimateCd>0;
    const fl=$('surv-flasks'); if(fl) fl.textContent='🧪 ×'+player.flasks;
    const dayEl=$('surv-day'); if(dayEl) dayEl.textContent=day;
    const nameLab = document.querySelector('#surv-wrapper .surv-hud-panel .hud-label');
    if(nameLab && player.nombre){
      nameLab.innerHTML = player.nombre+' · Día <span id="surv-day">'+day+'</span>/66 · Lv <span id="surv-lv">'+level+'</span>';
    }
    const killsEl=$('surv-kills'); if(killsEl) killsEl.textContent=kills;
    const lvEl=$('surv-lv'); if(lvEl) lvEl.textContent=level;
    const we=$('surv-weapon');
    if(we){
      const enlace = player.lanceBowMode ? (' · Enlace '+(player.lanceBowStep||1)+'/4') : '';
      we.textContent=getWeapon().nombre+enlace;
    }
    const weaponIcon=$('surv-weapon-icon');
    if(weaponIcon){ weaponIcon.src='assets/drakzeth/renewal/ui/'+player.weapon+'.png'; weaponIcon.alt='Icono de '+getWeapon().nombre; }
    const stEl=$('surv-stats'); if(stEl) stEl.textContent=formatStats();
    const buildEl=$('surv-build'); if(buildEl) buildEl.textContent='Build: '+getBuildName()+' · '+(player.dragonAffinity||'sangre').toUpperCase();
    const passiveEl=$('surv-passive'); if(passiveEl) passiveEl.textContent='Pasiva: '+(WEAPON_PASSIVES[player.weapon]||'Sin pasiva registrada');
    let postureTarget=null, postureBest=170;
    enemies.forEach(function(e){ if(e.hp>0){ const d=Math.hypot(e.x-player.x,e.y-player.y); if(d<postureBest){ postureBest=d; postureTarget=e; } } });
    if(boss&&boss.hp>0){ const d=Math.hypot(boss.x-player.x,boss.y-player.y); if(d<postureBest+20) postureTarget=boss; }
    const postureHud=$('surv-posture-hud'), postureBar=$('surv-posture-bar'), postureLabel=$('surv-posture-label');
    if(postureHud){ postureHud.style.display=postureTarget&&postureTarget.postureMax?'block':'none'; }
    if(postureTarget&&postureBar&&postureTarget.postureMax) postureBar.style.width=Math.max(0,Math.min(100,postureTarget.posture/postureTarget.postureMax*100))+'%';
    if(postureTarget&&postureLabel) postureLabel.textContent=(postureTarget.nombre||postureTarget.id||'OBJETIVO').toUpperCase()+' · POSTURA';
    const xpBar=$('surv-xp'); if(xpBar) xpBar.style.width=Math.max(0,Math.min(100,(xp/xpNext)*100))+'%';
    const xpN=$('surv-xp-n'); if(xpN) xpN.textContent=xp+'/'+xpNext;
    const btn=$('surv-level-btn');
    if(btn){
      if(player.pendingPts>0){ btn.style.display='block'; btn.textContent='Subir nivel ('+player.pendingPts+' pts)'; }
      else btn.style.display='none';
    }
    const tm=$('surv-timer');
    if(tm){
      if(isBossDay(day)) tm.textContent = boss&&boss.hp>0 ? 'DERROTA AL JEFE' : '0:00';
      else {
        const s=Math.max(0,Math.ceil(dayTime));
        tm.textContent = Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
      }
    }
    const bw=$('surv-boss-wrap'), bn=$('surv-boss-name'), bh=$('surv-boss-hp');
    if(boss && boss.hp>0){
      if(bw) bw.style.display='block';
      if(bn){ bn.style.display='block'; bn.textContent=boss.nombre+(boss.phase2?' — FASE 2':''); }
      if(bh) bh.style.width=(boss.hp/boss.maxHp*100)+'%';
    } else {
      if(bw) bw.style.display='none';
      if(bn) bn.style.display='none';
    }
  }

  // ========== INPUT ==========
  function togglePause(){
    if(state==='PLAYING'){
      state='PAUSE';
      const p=$('surv-pause'); if(p){ p.classList.remove('hidden'); p.style.display='flex'; }
      const mobileControls=$('surv-mobile'); if(mobileControls) mobileControls.classList.remove('is-active');
    } else if(state==='PAUSE'){
      state='PLAYING';
      const p=$('surv-pause'); if(p){ p.classList.add('hidden'); p.style.display='none'; }
      const mobileControls=$('surv-mobile'); if(mobileControls) mobileControls.classList.add('is-active');
    }
  }
  function loadCheckpoint(){
    if(!checkpoints.length || !player) return;
    const cp = checkpoints[checkpoints.length-1];
    day = cp.day;
    level = cp.level; xp = cp.xp; xpNext = cp.xpNext;
    if(cp.stats) player.stats = JSON.parse(JSON.stringify(cp.stats));
    player.pendingPts = cp.pendingPts||0;
    if(cp.dragonShards!=null) player.dragonShards=cp.dragonShards;
    if(cp.dragonNodes) player.dragonNodes=cp.dragonNodes.slice();
    if(cp.relics) player.relics=cp.relics.slice();
    if(cp.curses) player.curses=cp.curses.slice();
    if(cp.moonbladeObtained) player.moonbladeObtained=true;
    if(cp.unlockedRegions) player.unlockedRegions=cp.unlockedRegions.slice();
    if(cp.regionId){ player.regionId=cp.regionId; const r=REGIONS.find(function(x){return x.id===cp.regionId;}); player.regionName=r?r.name:player.regionName; }
    ownedWeapons = cp.weapons.slice();
    if(ownedWeapons.indexOf('lanza')<0) ownedWeapons.push('lanza');
    if(ownedWeapons.indexOf('ballesta')<0) ownedWeapons.push('ballesta');
    player.weapon = cp.weapon;
    player.lanceBowMode=false; player.lanceBowStep=0; player.lanceBowTimer=0;
    recalcFromStats();
    player.hp = player.maxHp; player.fp = player.maxFp;
    player.flasks = cp.flasks;
    enemies=[]; projectiles=[]; boss=null;
    startDay();
    state='PLAYING';
    const p=$('surv-pause'); if(p){ p.classList.add('hidden'); p.style.display='none'; }
    const end=$('surv-end'); if(end){ end.classList.add('hidden'); end.style.display='none'; }
    const deadActions=$('surv-dead-actions'); if(deadActions) deadActions.style.display='none';
    const mobileControls=$('surv-mobile'); if(mobileControls) mobileControls.classList.add('is-active');
    showFT('Checkpoint restaurado', player.x, player.y-40, '#d9b25c');
  }
  window.addEventListener('keydown', function(e){
    const k=e.key.toLowerCase();
    keys[k]=true;
    if(k==='escape'){ e.preventDefault(); togglePause(); return; }
    if(e.key===' '||e.key==='Spacebar'){ e.preventDefault(); if(state==='PLAYING') tryAttack(); }
    if(k==='shift'){ e.preventDefault(); tryDodge(); }
    if(k==='q'){ e.preventDefault(); tryParry(); }
    if(k==='x'){ e.preventDefault(); castDragonRoar(); }
    if(k==='z'){ e.preventDefault(); castDragonBreath(); }
    if(k==='v'){ e.preventDefault(); castDragonClaw(); }
    if(k==='g'){ e.preventDefault(); castDragonFlight(); }
    if(k==='b'){ e.preventDefault(); castDragonTide(); }
    if(k==='m'){ e.preventDefault(); castDragonMeteor(); }
    if(k==='n'){ e.preventDefault(); if(!player.manaChargeActive) startManaCharge(); }
    if(k==='j'){ e.preventDefault(); castMagicWeaponSkill(); }
    if(k==='u'){ e.preventDefault(); castCharacterUltimate(); }
    if(k==='t'){ e.preventDefault(); castMoonCold(); }
    if(k==='y'){ e.preventDefault(); castMoonAstral(); }
    if(k==='e'){ e.preventDefault(); tryExecution(); }
    if(k==='c'){ e.preventDefault(); toggleLanceBowCombo(); }
    if(k==='r' || k==='h'){ e.preventDefault(); tryFlask(); }
    if(e.key>='1'&&e.key<='9'){
      const i=parseInt(e.key,10)-1;
      if(player && i<ownedWeapons.length){
        player.lanceBowMode=false; player.lanceBowStep=0; player.lanceBowTimer=0;
        weaponIdx=i; player.weapon=ownedWeapons[i]; updateHUD();
      }
    }
  });
  window.addEventListener('keyup', function(e){
    const k=e.key.toLowerCase();
    if(k==='n' && player && player.manaChargeActive){
      keys[k]=false;
      if(player.manaCharge>=MANA_CHARGE_FRAMES) completeManaCharge(); else cancelManaCharge(false);
      return;
    }
    keys[k]=false;
  });
  canvas.addEventListener('mousemove', function(e){
    const r=canvas.getBoundingClientRect();
    mouse.x=(e.clientX-r.left)*(canvas.width/r.width);
    mouse.y=(e.clientY-r.top)*(canvas.height/r.height);
  });
  canvas.addEventListener('mousedown', function(e){
    if(e.button===2){ e.preventDefault(); tryParry(); return; }
    mouse.down=true; if(state==='PLAYING') tryAttack();
  });
  canvas.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  window.addEventListener('mouseup', function(){ mouse.down=false; });

  // ========== BUTTONS ==========
  const startBtn=$('surv-start-btn');
    if(startBtn) startBtn.addEventListener('click', function(){
    if(!mainPlayerSpriteReady){ updatePlayerAssetStatus(); showFT('Cargando personaje principal...',player?player.x:W/2,player?player.y:H/2,'#ff8294'); return; }
    const st=$('surv-start'); if(st){ st.classList.add('hidden'); st.style.display='none'; }
    holyUltimateFX=[]; apotheosisVioletFX=[]; renewalFX=[]; dragonFX=[]; createPlayer(); day=1; kills=0; level=1; xp=0; xpNext=40;
    ownedWeapons=['espadalarga','lanza','ballesta']; weaponIdx=0;
    const nameIn=$('surv-name');
    player.nombre = (nameIn && nameIn.value.trim()) ? nameIn.value.trim().slice(0,16) : 'Errante';
    startDay();
    const mobileControls=$('surv-mobile'); if(mobileControls) mobileControls.classList.add('is-active');
    const mobileSkills=$('mob-skills'), mobileSkillsToggle=$('mob-skills-toggle');
    if(mobileSkills){ mobileSkills.hidden=true; }
    if(mobileSkillsToggle){ mobileSkillsToggle.setAttribute('aria-expanded','false'); }
    updateHUD();
  });
  const lvlDone=$('surv-level-done');
  if(lvlDone) lvlDone.addEventListener('click', function(){
    closeLevelUp();
  });
  const lvlBtn=$('surv-level-btn');
  if(lvlBtn) lvlBtn.addEventListener('click', function(){
    if(player && player.pendingPts>0) openLevelUp(0);
  });
  const treeBtn=$('dragon-tree-open'); if(treeBtn) treeBtn.addEventListener('click', function(e){ e.preventDefault(); openDragonTree(); });
  const treeClose=$('dragon-tree-close'); if(treeClose) treeClose.addEventListener('click', function(e){ e.preventDefault(); closeDragonTree(); });
  const mapBtn=$('surv-map-open'); if(mapBtn) mapBtn.addEventListener('click', function(e){ e.preventDefault(); openMap(); });
  const mapClose=$('surv-map-close'); if(mapClose) mapClose.addEventListener('click', function(e){ e.preventDefault(); closeMap(); });
  const bossBegin=$('surv-boss-intro-begin'); if(bossBegin) bossBegin.addEventListener('click', function(e){ e.preventDefault(); beginBossFight(); });
  const pauseRes=$('surv-pause-resume');
  if(pauseRes) pauseRes.addEventListener('click', togglePause);
  const pauseCp=$('surv-pause-cp');
  if(pauseCp) pauseCp.addEventListener('click', loadCheckpoint);
  const pauseLvl=$('surv-pause-level');
  if(pauseLvl) pauseLvl.addEventListener('click', function(){ if(player&&player.pendingPts>0){ togglePause(); openLevelUp(0);} });
  const pauseRespec=$('surv-pause-respec');
  if(pauseRespec) pauseRespec.addEventListener('click', function(){
    if(!player) return;
    // devolver stats al base y dar puntos equivalentes al nivel
    const base = { vig:14, men:10, res:12, fue:12, des:12, sab:10, fe:10 };
    const spent = Object.keys(base).reduce(function(a,k){ return a + Math.max(0,(player.stats[k]||base[k])-base[k]); }, 0);
    player.stats = Object.assign({}, base);
    player.pendingPts = spent + (player.pendingPts||0);
    recalcFromStats();
    player.hp = player.maxHp; player.fp = player.maxFp;
    togglePause();
    openLevelUp(0);
  });
  // settings
  const vol=$('surv-vol'), br=$('surv-bright'), perf=$('surv-performance');
  if(vol){ vol.value=settings.volume; vol.oninput=function(){ settings.volume=+vol.value; localStorage.setItem('er_surv_settings',JSON.stringify(settings)); }; }
  if(br){ br.value=settings.brightness; br.oninput=function(){ settings.brightness=+br.value; localStorage.setItem('er_surv_settings',JSON.stringify(settings)); const w=$('surv-wrapper'); if(w) w.style.filter='brightness('+settings.brightness+')'; }; }
  if(perf){ perf.checked=!!settings.performanceMode; perf.onchange=function(){ settings.performanceMode=!!perf.checked; localStorage.setItem('er_surv_settings',JSON.stringify(settings)); if(player) initMapDecor(); updateHUD(); }; }
  // mobile controls: Pointer Events avoid double-fires between touch and click
  function bindHold(id, on, off){
    const el=$(id); if(!el) return;
    let active=false;
    const start=function(ev){
      if(ev.pointerType==='mouse' && ev.button!==0) return;
      ev.preventDefault();
      if(active) return;
      active=true; el.setPointerCapture?.(ev.pointerId); on(ev);
    };
    const end=function(ev){
      if(!active) return;
      ev.preventDefault(); active=false; if(off) off(ev);
      try{ el.releasePointerCapture?.(ev.pointerId); }catch(_err){}
    };
    el.addEventListener('pointerdown', start, {passive:false});
    el.addEventListener('pointerup', end, {passive:false});
    el.addEventListener('pointercancel', end, {passive:false});
    el.addEventListener('lostpointercapture', end, {passive:false});
    el.addEventListener('contextmenu', function(ev){ ev.preventDefault(); });
  }
  function bindTap(id, action){
    const el=$(id); if(!el) return;
    el.addEventListener('pointerup', function(ev){ ev.preventDefault(); action(ev); }, {passive:false});
    el.addEventListener('keydown', function(ev){ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); action(ev); } });
  }

  const joyZone=$('mob-stick-zone'), joy=$('mob-stick');
  let joyPointer=null;
  function updateJoystick(ev){
    if(!joyZone || !joy || joyPointer===null || ev.pointerId!==joyPointer) return;
    const rect=joyZone.getBoundingClientRect();
    const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
    let dx=ev.clientX-cx, dy=ev.clientY-cy;
    const max=Math.max(24,rect.width*.34), distance=Math.hypot(dx,dy)||1;
    if(distance>max){ dx=dx/distance*max; dy=dy/distance*max; }
    const nx=dx/max, ny=dy/max;
    joy.style.transform='translate(calc(-50% + '+dx.toFixed(1)+'px),calc(-50% + '+dy.toFixed(1)+'px))';
    keys['a']=nx<-.16; keys['d']=nx>.16; keys['w']=ny<-.16; keys['s']=ny>.16;
    if(Math.abs(nx)>.12 || Math.abs(ny)>.12){
      if(Math.abs(nx)>=Math.abs(ny)) player&&(player.facing=nx<0?-1:1);
      mouse.x=W/2+nx*W*.42; mouse.y=H/2+ny*H*.42;
    }
  }
  function resetJoystick(){
    joyPointer=null; ['w','a','s','d'].forEach(function(k){ keys[k]=false; });
    if(joy) joy.style.transform='translate(-50%,-50%)';
  }
  if(joyZone){
    joyZone.addEventListener('pointerdown',function(ev){ ev.preventDefault(); joyPointer=ev.pointerId; joyZone.setPointerCapture?.(ev.pointerId); updateJoystick(ev); },{passive:false});
    joyZone.addEventListener('pointermove',function(ev){ ev.preventDefault(); updateJoystick(ev); },{passive:false});
    joyZone.addEventListener('pointerup',function(ev){ ev.preventDefault(); resetJoystick(); },{passive:false});
    joyZone.addEventListener('pointercancel',function(ev){ ev.preventDefault(); resetJoystick(); },{passive:false});
    joyZone.addEventListener('lostpointercapture',resetJoystick,{passive:false});
  }
  bindHold('mob-atk', function(){ mouse.down=true; tryAttack(); }, function(){ mouse.down=false; });
  bindTap('mob-dodge', function(){ tryDodge(); });
  bindTap('mob-parry', function(){ tryParry(); });
  bindTap('mob-flask', function(){ tryFlask(); });
  bindTap('mob-pause', function(){ togglePause(); });
  bindHold('mob-dragon-heart', function(){ keys['n']=true; startManaCharge(); }, function(){ keys['n']=false; if(player&&player.manaChargeActive){ if(player.manaCharge>=MANA_CHARGE_FRAMES) completeManaCharge(); else cancelManaCharge(false); } });
  bindTap('mob-dragon-roar', function(){ castDragonRoar(); });
  bindTap('mob-dragon-breath', function(){ castDragonBreath(); });
  bindTap('mob-dragon-claw', function(){ castDragonClaw(); });
  bindTap('mob-dragon-flight', function(){ castDragonFlight(); });
  bindTap('mob-dragon-tide', function(){ castDragonTide(); });
  bindTap('mob-dragon-meteor', function(){ castDragonMeteor(); });
  bindTap('mob-moon-cold', function(){ castMoonCold(); });
  bindTap('mob-moon-astral', function(){ castMoonAstral(); });
  bindTap('mob-magic-skill', function(){ castMagicWeaponSkill(); });
  bindTap('mob-ultimate', function(){ castCharacterUltimate(); });
  bindTap('mob-execute', function(){ tryExecution(); });
  bindTap('mob-combo', function(){ toggleLanceBowCombo(); });
  const mobileSkillsToggle=$('mob-skills-toggle'), mobileSkills=$('mob-skills');
  if(mobileSkillsToggle && mobileSkills){
    bindTap('mob-skills-toggle', function(){
      mobileSkills.hidden=!mobileSkills.hidden;
      mobileSkillsToggle.setAttribute('aria-expanded',String(!mobileSkills.hidden));
    });
  }

  const re=$('surv-restart');
  if(re) re.addEventListener('click', function(){
    const en=$('surv-end'); if(en){ en.classList.add('hidden'); en.style.display='none'; }
    const deadActions=$('surv-dead-actions'); if(deadActions) deadActions.style.display='none';
    const st=$('surv-start'); if(st){ st.classList.remove('hidden'); st.style.display='flex'; }
    state='START';
    const mobileControls=$('surv-mobile'); if(mobileControls) mobileControls.classList.remove('is-active');
  });
  const deadCpBtn=$('surv-dead-checkpoint');
  if(deadCpBtn) deadCpBtn.addEventListener('click', function(){ if(checkpoints.length) loadCheckpoint(); });
  const deadReturn=$('surv-dead-return');
  if(deadReturn) deadReturn.addEventListener('click', function(){
    const en=$('surv-end'); if(en){ en.classList.add('hidden'); en.style.display='none'; }
    const deadActions=$('surv-dead-actions'); if(deadActions) deadActions.style.display='none';
    const st=$('surv-start'); if(st){ st.classList.remove('hidden'); st.style.display='flex'; }
    player=null; enemies=[]; projectiles=[]; boss=null; state='START';
    const mobileControls=$('surv-mobile'); if(mobileControls) mobileControls.classList.remove('is-active');
  });

  // fullscreen
  const fsBtn=$('fullscreen-btn');
  const fsWrap=$('surv-wrapper')||document.querySelector('.game-canvas-wrapper');
  function toggleFs(){
    const isFull=document.fullscreenElement||document.webkitFullscreenElement;
    if(!isFull){ if(fsWrap.requestFullscreen) fsWrap.requestFullscreen(); else if(fsWrap.webkitRequestFullscreen) fsWrap.webkitRequestFullscreen(); }
    else { if(document.exitFullscreen) document.exitFullscreen(); else if(document.webkitExitFullscreen) document.webkitExitFullscreen(); }
  }
  if(fsBtn) fsBtn.addEventListener('click', toggleFs);
  document.addEventListener('keydown', function(e){
    if(e.key.toLowerCase()==='f' && document.activeElement.tagName!=='INPUT') toggleFs();
  });

  // ========== LOOP ==========
  let last=performance.now();
  function loop(now){
    const dt=Math.min(0.05,(now-last)/1000); last=now;
    update(dt);
    if(state==='PLAYING') draw();
    else if(state==='START'||state==='DEAD'||state==='WIN'||state==='REWARD'){
      if(state==='PLAYING') draw();
      else { ctx.fillStyle='#050508'; ctx.fillRect(0,0,W,H); }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

})();

/* =========================================================
   BLOQUE C — QUIZ + CALCULADORA
   ========================================================= */
(function(){
  "use strict";
  var preguntaEl = document.getElementById('quizPregunta');
  var opcionesEl = document.getElementById('quizOpciones');
  if(!preguntaEl || !opcionesEl) return;
  var progresoEl = document.getElementById('quizProgreso');
  var barra = document.getElementById('quizBarraLlena');
  var resultado = document.getElementById('quizResultado');
  var preguntas = [
    { q:'¿Cómo prefieres enfrentar a un jefe?', o:[['Tanqueando golpes','vagabundo'],['Esquivando y contraatacando','guerrero'],['Desde lejos con magia','astrologo'],['Con fe y fuego','profeta']] },
    { q:'¿Qué arma te atrae más?', o:[['Espada y escudo','vagabundo'],['Katanas dobles','samurai'],['Bastón de hechizos','astrologo'],['Sello sagrado','profeta']] },
    { q:'Tu estilo de exploración es…', o:[['Metódico y seguro','vagabundo'],['Rápido y agresivo','guerrero'],['Curioso y experimental','prisionero'],['Sigiloso','bandido']] },
    { q:'Ante un callejón sin salida…', o:[['Busco otra ruta','samurai'],['Fuerzo el paso','guerrero'],['Uso magia creativa','astrologo'],['Rezo y avanzo','confesor']] },
    { q:'¿Qué valoras más?', o:[['Supervivencia','vagabundo'],['Velocidad','guerrero'],['Conocimiento','astrologo'],['Poder prohibido','hereje']] },
    { q:'Tu mayor debilidad sería…', o:[['La soberbia','miserable'],['La prisa','bandido'],['La duda','prisionero'],['La ira','guerrero']] }
  ];
  var clases = {
    vagabundo:{icon:'🛡️',n:'Vagabundo',d:'Protector nato. Defensa sólida y avance constante.'},
    guerrero:{icon:'⚔️',n:'Guerrero',d:'Ágil y agresivo. Prefieres el ritmo del combate.'},
    astrologo:{icon:'✨',n:'Astrólogo',d:'La distancia y la magia son tu terreno.'},
    profeta:{icon:'🔥',n:'Profeta',d:'Fe ofensiva y curación te definen.'},
    samurai:{icon:'🗡️',n:'Samurái',d:'Precisión y elegancia con filo oriental.'},
    prisionero:{icon:'🔒',n:'Prisionero',d:'Versátil entre magia y acero cercano.'},
    confesor:{icon:'⛓️',n:'Confesor',d:'Sigilo sagrado y golpes medidos.'},
    bandido:{icon:'🏹',n:'Bandido',d:'Emboscadas y críticos son tu arte.'},
    hereje:{icon:'👑',n:'Hereje',d:'Buscas poder más allá de las leyes.'},
    miserable:{icon:'💀',n:'Miserable',d:'Nada te detiene: el desafío extremo.'}
  };
  var i=0, score={};
  function mostrar(){
    if(i>=preguntas.length){ fin(); return; }
    var p=preguntas[i];
    preguntaEl.textContent=p.q;
    opcionesEl.innerHTML='';
    p.o.forEach(function(op){
      var b=document.createElement('button');
      b.className='quiz-opcion'; b.textContent=op[0];
      b.onclick=function(){ score[op[1]]=(score[op[1]]||0)+1; i++; mostrar(); };
      opcionesEl.appendChild(b);
    });
    if(progresoEl) progresoEl.textContent='Pregunta '+(i+1)+' de '+preguntas.length;
    if(barra) barra.style.width=(((i)/preguntas.length)*100)+'%';
    if(resultado) resultado.classList.add('hidden');
  }
  function fin(){
    var best='vagabundo', max=0;
    Object.keys(score).forEach(function(k){ if(score[k]>max){ max=score[k]; best=k; } });
    var c=clases[best]||clases.vagabundo;
    preguntaEl.textContent='Tu destino';
    opcionesEl.innerHTML='';
    if(resultado){
      resultado.classList.remove('hidden');
      var ic=document.getElementById('quizIcono'); if(ic) ic.textContent=c.icon;
      var nm=document.getElementById('quizClaseNombre'); if(nm) nm.textContent=c.n;
      var ds=document.getElementById('quizClaseDesc'); if(ds) ds.textContent=c.d;
    }
    if(barra) barra.style.width='100%';
  }
  var rein=document.getElementById('quizReiniciar');
  if(rein) rein.onclick=function(){ i=0; score={}; if(resultado) resultado.classList.add('hidden'); mostrar(); };
  mostrar();

  // Calculadora simple
  function updCalc(){
    var ids=['Vigor','Mente','Res','Fuerza','Destreza','Sab','Fe','Arc'];
    var map={Vigor:'calcVigor',Mente:'calcMente',Res:'calcRes',Fuerza:'calcFuerza',Destreza:'calcDestreza',Sab:'calcSab',Fe:'calcFe',Arc:'calcArc'};
    var total=0, vals={};
    Object.keys(map).forEach(function(k){
      var el=document.getElementById(map[k]); if(!el) return;
      vals[k]=+el.value; total+=vals[k];
      var lab=document.getElementById(map[k]+'Val'); if(lab) lab.textContent=el.value;
    });
    var niv=document.getElementById('calcNivel'); if(niv) niv.textContent=Math.max(1, total-79);
    var hp=document.getElementById('calcHP'); if(hp) hp.textContent=Math.round(300+(vals.Vigor||10)*12);
  }
  ['calcVigor','calcMente','calcRes','calcFuerza','calcDestreza','calcSab','calcFe','calcArc'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.addEventListener('input', updCalc);
  });
  updCalc();
})();