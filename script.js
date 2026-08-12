/* =========================================================
   ELDEN RING — FAN PAGE
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
  const DAY_SECONDS = 150; // 2.5 min real
  const TOTAL_DAYS = 66;
  const BOSS_EVERY = 11;
  const LUCKY_PCT = 0.03;

  // ========== SPRITES ==========
  const sprites = {};
  window.sprites = sprites;
  const RUTAS = {
    'jugador': 'assets/vagabundo.png',
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

  // Spritesheet modular: filas = S, SW, W, NW, N, NE, E, SE; celdas = 200x200.
  const VAGABUNDO_ANIMS = {
    idle: { key:'jugador-idle', columns:4, fps:6 },
    walk: { key:'jugador-walk', columns:8, fps:10 },
    run: { key:'jugador-run', columns:8, fps:14 },
    'attack-light': { key:'jugador-attack-light', columns:6, fps:14 },
    'attack-heavy': { key:'jugador-attack-heavy', columns:8, fps:12 },
    cast: { key:'jugador-cast', columns:8, fps:12 },
    hit: { key:'jugador-hit', columns:4, fps:10 },
    death: { key:'jugador-death', columns:8, fps:8 }
  };

  function vagabundoDirectionRow(x, y){
    if(y > 0.35) return x < -0.35 ? 1 : x > 0.35 ? 7 : 0;
    if(y < -0.35) return x < -0.35 ? 3 : x > 0.35 ? 5 : 4;
    return x < 0 ? 2 : 6;
  }

  function drawVagabundo(x, y, bob){
    const playerAnim = player && player.anim && VAGABUNDO_ANIMS[player.anim] ? player.anim : 'idle';
    const spec = VAGABUNDO_ANIMS[playerAnim];
    const img = spr(spec.key);
    if(!img) return drawSpr('jugador', x, y, 64, 64, player && player.facing < 0);
    const row = player && Number.isFinite(player.dirRow) ? player.dirRow : 6;
    const start = player && Number.isFinite(player.animStart) ? player.animStart : animT;
    const frameDuration = Math.max(1, Math.round(60 / spec.fps));
    const elapsed = playerAnim === 'idle' ? animT : Math.max(0, animT - start);
    const frame = Math.min(spec.columns - 1, Math.floor(elapsed / frameDuration) % spec.columns);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, frame * 200, row * 200, 200, 200, x - 32, y + bob - 32, 64, 64);
    ctx.restore();
    return true;
  }

  (function loadSprites(){
    Object.keys(RUTAS).forEach(function(k){
      const img = new Image();
      img.onload = function(){ sprites[k]=img; };
      img.onerror = function(){ sprites[k]=null; };
      img.src = RUTAS[k];
    });
  })();

  function spr(k){ return sprites[k]||null; }
  function drawSpr(k,x,y,w,h,flip){
    const img=spr(k); if(!img) return false;
    ctx.save(); ctx.translate(x,y); if(flip) ctx.scale(-1,1);
    ctx.drawImage(img,-w/2,-h/2,w,h); ctx.restore(); return true;
  }

  // ========== WEAPONS ==========
  const WEAPONS = {
    espadalarga: { nombre:'Espada Larga', tipo:'melee', dmg:14, range:52, cd:18, color:'#cfd8dc' },
    katana: { nombre:'Katana', tipo:'melee', dmg:12, range:50, cd:12, color:'#e0e0e0', crit:2.2 },
    granespada: { nombre:'Gran Espada', tipo:'melee', dmg:26, range:70, cd:32, color:'#90a4ae' },
    daga: { nombre:'Daga', tipo:'melee', dmg:8, range:32, cd:8, color:'#b0bec5', crit:2.5 },
    lanza: { nombre:'Lanza', tipo:'melee', dmg:15, range:78, cd:20, color:'#a1887f' },
    arco: { nombre:'Arco', tipo:'ranged', dmg:16, range:220, cd:22, color:'#8d6e63', proj:true, projSpd:9 },
    ballesta: { nombre:'Ballesta', tipo:'ranged', dmg:22, range:200, cd:35, color:'#6d4c41', proj:true, projSpd:12 },
    baston: { nombre:'Bastón Glintstone', tipo:'magic', dmg:18, range:200, cd:16, color:'#4dd0e1', proj:true, projSpd:7, fp:8 },
    sello: { nombre:'Sello Sagrado', tipo:'magic', dmg:20, range:180, cd:20, color:'#ff7043', proj:true, projSpd:6, fp:10 },
    riosdesangre: { nombre:'Ríos de Sangre', tipo:'melee', dmg:24, range:55, cd:14, color:'#c62828', crit:2.3 },
    colmillosabueso: { nombre:'Colmillo de Sabueso', tipo:'melee', dmg:22, range:58, cd:16, color:'#8d6e63', crit:2.0 },
    espadablasfema: { nombre:'Espada Blasfema', tipo:'melee', dmg:30, range:68, cd:26, color:'#e64a19' },
    espadonluna: { nombre:'Espadón Luna Negra', tipo:'magic', dmg:28, range:75, cd:24, color:'#5c6bc0', proj:true, projSpd:8, fp:12 },
    martillorubi: { nombre:'Martillo de Rubí', tipo:'melee', dmg:34, range:60, cd:36, color:'#e53935' },
    escudo: { nombre:'Escudo de Hierro', tipo:'shield', dmg:6, range:35, cd:25, color:'#78909c', block:0.5 }
  };

  const BOSSES = [
    { day:11, id:'godrick', nombre:'Godrick el Injertado', hp:900, dmg:18, spd:1.4, r:28, color:'#ffa726' },
    { day:22, id:'rennala', nombre:'Rennala, Reina de la Luna', hp:1100, dmg:16, spd:1.3, r:26, color:'#42a5f5' },
    { day:33, id:'radahn', nombre:'Starscourge Radahn', hp:1600, dmg:24, spd:1.5, r:36, color:'#ab47bc' },
    { day:44, id:'malenia', nombre:'Malenia, Espada de Miquella', hp:1400, dmg:22, spd:2.1, r:28, color:'#ec407a' },
    { day:55, id:'maliketh', nombre:'Maliketh, la Sombra Negra', hp:1800, dmg:26, spd:1.9, r:30, color:'#1a1a2e', sprite2:true },
    { day:66, id:'radahn', nombre:'Prometido Consorte Radahn', hp:2500, dmg:30, spd:1.7, r:38, color:'#d9b25c' }
  ];

  const ENE_TYPES = [
    { id:'soldado', hp:40, dmg:8, spd:1.35, r:20, spr:'ene-soldado', color:'#8a7a5a' },
    { id:'lobo', hp:28, dmg:10, spd:1.55, r:18, spr:'ene-lobo', color:'#5a5048' },
    { id:'caballero', hp:80, dmg:14, spd:1.15, r:22, spr:'ene-caballero', color:'#6a6a7a' },
    { id:'espiritu', hp:35, dmg:12, spd:1.35, r:19, spr:'ene-espiritu', color:'#6a8aaa' },
    { id:'troll', hp:150, dmg:20, spd:0.85, r:30, spr:'ene-troll', color:'#4a5a3a' }
  ];

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
  let dayTime = DAY_SECONDS;
  let kills = 0;
  let animT = 0;
  let spawnAcc = 0;
  let bloodMoon = false;
  let glintMoon = false;
  let ownedWeapons = ['espadalarga'];
  let weaponIdx = 0;
  let level = 1;
  let xp = 0;
  let xpNext = 40;
  let screenFlash = 0;
  let slashFX = [];
  let rewardChoices = [];
  let luckyTriple = false;

  const $ = id => document.getElementById(id);

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
      parryCd: 0, isParrying: false, parryTimer: 0
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
    player.maxSta = 80 + s.res * 4;
    player.sta = Math.min(player.maxSta, player.sta);
    player.maxFp = 40 + s.men * 6 + s.sab * 2 + s.fe * 2;
    player.fp = Math.min(player.maxFp, player.fp);
    player.dmgMul = 1 + (s.fue + s.des) * 0.02 + s.sab * 0.01 + s.fe * 0.01;
    player.spdMul = 1 + Math.max(0, (s.des - 10) * 0.012);
    player.spd = 3.0 + s.des * 0.02;
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

  function tryFlask(){
    if(!player || state!=='PLAYING') return;
    if(player.flasks <= 0){ showFT('¡Sin frascos!', player.x, player.y-28, '#e53935'); return; }
    if(player.hp >= player.maxHp && player.fp >= player.maxFp){ showFT('Ya estás al máximo', player.x, player.y-28, '#81c784'); return; }
    if(player.isDodging || player.isParrying) return;
    player.flasks--;
    const heal = Math.round(player.maxHp * 0.45);
    const fpH = Math.round(player.maxFp * 0.35);
    player.hp = Math.min(player.maxHp, player.hp + heal);
    player.fp = Math.min(player.maxFp, player.fp + fpH);
    showFT('+'+heal+' HP', player.x, player.y-28, '#66bb6a');
    spawnP(player.x, player.y, '#66bb6a', 12);
    updateHUD();
  }

  function tryDodge(){
    if(!player || state!=='PLAYING') return;
    if(player.dodgeCd>0 || player.isDodging || player.isParrying) return;
    if(player.sta < 22){ showFT('¡Sin aguante!', player.x, player.y-28, '#ffb74d'); return; }
    player.sta -= 22;
    player.isDodging = true;
    player.dodgeTimer = 14;
    player.dodgeCd = 32;
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
    if(player.parryCd>0 || player.isDodging || player.isParrying) return;
    if(player.sta < 15){ showFT('¡Sin aguante!', player.x, player.y-28, '#ffb74d'); return; }
    player.sta -= 15;
    player.isParrying = true;
    player.parryTimer = 12; // ventana de parry
    player.parryCd = 40;
    showFT('Parry', player.x, player.y-24, '#f0d99a');
  }

  function onPlayerHit(dmg, fromBoss){
    if(!player || player.hp<=0) return;
    // Solo durante el rolar cuenta como esquiva (no el i-frame post-golpe)
    if(player.isDodging){
      showFT('¡Esquivado!', player.x, player.y-28, '#87ceeb');
      return;
    }
    if(player.invuln>0) return; // invulnerable silencioso tras daño
    // parry window
    if(player.isParrying && player.parryTimer>0){
      showFT('¡PARRY!', player.x, player.y-30, '#d9b25c');
      spawnP(player.x, player.y, '#d9b25c', 14);
      screenFlash = 5;
      player.isParrying = false; player.parryTimer = 0;
      // stun nearby enemies / boss
      for(let i=0;i<enemies.length;i++){
        const e=enemies[i];
        if(e.hp>0 && Math.hypot(e.x-player.x,e.y-player.y)<70){ e.cd=45; e.hitFlash=10; }
      }
      if(boss && boss.hp>0 && Math.hypot(boss.x-player.x,boss.y-player.y)<90){
        boss.cd = 55; boss.hitFlash = 12;
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
  function isGlintDay(d){ return d % 2 === 0; } // every 2 days
  function isBloodDay(d){ return isBossDay(d); }

  function startDay(){
    dayTime = DAY_SECONDS;
    bloodMoon = isBloodDay(day);
    glintMoon = isGlintDay(day);
    enemies = [];
    projectiles = [];
    boss = null;
    spawnAcc = 0;
    if(isBossDay(day)){
      const def = BOSSES.find(b => b.day === day) || BOSSES[BOSSES.length-1];
      boss = {
        id: def.id, nombre: def.nombre,
        x: player.x + 300, y: player.y,
        hp: def.hp * (1 + (day/66)*0.5), maxHp: def.hp * (1 + (day/66)*0.5),
        dmg: def.dmg, spd: def.spd, r: def.r, color: def.color,
        cd: 0, state: 'CHASE', phase2: false, sprite2: !!def.sprite2,
        hitFlash: 0
      };
    }
    if(player){ player.flasks = Math.min(player.maxFlasks, player.flasks + 1); }
    updateMoonUI();
    state = 'PLAYING';
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
    state = 'REWARD';
    showRewards();
  }

  // ========== REWARDS ==========
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
    { tipo:'arma', id:'espadonluna', label:'Espadón Luna Negra', desc:'Magia de luna' },
    { tipo:'arma', id:'martillorubi', label:'Martillo de Rubí', desc:'Golpes devastadores' },
    { tipo:'stat', id:'hp', label:'+25 Vida Máx', desc:'Más resistencia' },
    { tipo:'stat', id:'dmg', label:'+12% Daño', desc:'Más poder' },
    { tipo:'stat', id:'spd', label:'+8% Velocidad', desc:'Más movilidad' },
    { tipo:'stat', id:'fp', label:'+20 FP Máx', desc:'Más magia' },
    { tipo:'heal', id:'full', label:'Curación total', desc:'HP y FP al máximo' },
    { tipo:'runas', id:'runas', label:'Bendición de Runas', desc:'+1 nivel inmediato' }
  ];

  function pickRewards(){
    const pool = REWARD_POOL.slice();
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
        btn.innerHTML = '<b>'+r.label+'</b><br><span style="font-size:0.8rem;opacity:0.8">'+r.desc+'</span>';
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
    xp = 0; xpNext = Math.floor(xpNext * 1.25);
    showFT('¡Nivel '+level+'!', player.x, player.y-40, '#d9b25c');
    // 3 puntos a repartir a voluntad
    openLevelUp(3);
  }

  function showEnd(win){
    const panel = $('surv-end');
    const title = $('surv-end-title');
    const sub = $('surv-end-sub');
    if(title) title.textContent = win ? 'El Tarnished prevalece' : 'Has muerto';
    if(sub) sub.textContent = win ? ('Completaste los '+TOTAL_DAYS+' días') : ('Caíste en el día '+day+' · Kills: '+kills);
    if(panel){ panel.classList.remove('hidden'); panel.style.display='flex'; }
  }

  // ========== COMBAT ==========
  function tryAttack(){
    if(!player || player.atkCd>0) return;
    const w = getWeapon();
    if(w.tipo==='magic' && !glintMoon){
      if(player.fp < (w.fp||8)) return;
      player.fp -= (w.fp||8);
    }
    player.atkCd = w.cd;
    player.anim = w.tipo==='magic' ? 'cast' : (w.cd >= 25 ? 'attack-heavy' : 'attack-light');
    player.animStart = animT;
    const ang = Math.atan2(mouse.y - (player.y-cam.y), mouse.x - (player.x-cam.x));
    // also face direction from keys
    player.facing = Math.cos(ang) >= 0 ? 1 : -1;

    if(w.proj){
      const spd = w.projSpd || 8;
      projectiles.push({
        x:player.x, y:player.y,
        vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd,
        dmg: w.dmg * player.dmgMul * (bloodMoon?1.1:1),
        r:5, life:90, color:w.color, fromPlayer:true
      });
      spawnP(player.x, player.y, w.color, 6);
    } else {
      // melee hitbox
      const hx = player.x + Math.cos(ang)*w.range*0.6;
      const hy = player.y + Math.sin(ang)*w.range*0.6;
      slashFX.push({x:hx, y:hy, life:10, max:10, ang:ang, color:w.color});
      let hit=false;
      for(let i=0;i<enemies.length;i++){
        const e=enemies[i]; if(e.hp<=0) continue;
        if(Math.hypot(e.x-hx, e.y-hy) < w.range*0.55+e.r){
          damageEnemy(e, w); hit=true;
        }
      }
      if(boss && boss.hp>0 && Math.hypot(boss.x-hx, boss.y-hy) < w.range*0.55+boss.r){
        damageBoss(w); hit=true;
      }
      if(hit) screenFlash=3;
    }
  }

  function damageEnemy(e, w){
    let dmg = w.dmg * player.dmgMul;
    if(w.crit && Math.random()<0.18){ dmg*=w.crit; showFT('CRÍTICO', e.x, e.y-30, '#ffeb3b'); }
    e.hp -= dmg; e.hitFlash=6;
    showFT('-'+Math.round(dmg), e.x, e.y-20, '#f0d99a');
    spawnP(e.x, e.y, e.color, 8);
    if(e.hp<=0){
      kills++;
      xp += 8 + day;
      if(xp>=xpNext) levelUp();
      spawnP(e.x, e.y, '#d9b25c', 12);
    }
  }

  function damageBoss(w){
    let dmg = w.dmg * player.dmgMul * 1.1;
    boss.hp -= dmg; boss.hitFlash=8;
    showFT('-'+Math.round(dmg), boss.x, boss.y-30, '#f0d99a');
    spawnP(boss.x, boss.y, boss.color, 12);
    screenFlash=4;
    if(!boss.phase2 && boss.hp < boss.maxHp*0.5){
      boss.phase2=true; boss.spd*=1.3; boss.dmg*=1.25;
      showFT('¡FASE 2!', boss.x, boss.y-50, '#ff1744');
    }
    if(boss.hp<=0){
      boss.hp=0; kills+=10; xp+=100; if(xp>=xpNext) levelUp();
      showFT('¡JEFE DERROTADO!', boss.x, boss.y-60, '#d9b25c');
      // boss day ends on kill
      endDay();
    }
  }

  // ========== SPAWN ==========
  function spawnEnemy(){
    const ang = Math.random()*Math.PI*2;
    const dist = 350 + Math.random()*200;
    const t = ENE_TYPES[Math.floor(Math.random()*Math.min(ENE_TYPES.length, 2+Math.floor(day/12)))];
    const mul = 1 + day*0.04;
    const gMul = glintMoon ? 1.35 : 1;
    const bMul = bloodMoon ? 1.25 : 1;
    enemies.push({
      id:t.id, x:player.x+Math.cos(ang)*dist, y:player.y+Math.sin(ang)*dist,
      hp:t.hp*mul*gMul, maxHp:t.hp*mul*gMul, dmg:t.dmg*mul*gMul*bMul,
      spd:t.spd*(bloodMoon?1.08:1), r:t.r, spr:t.spr, color:t.color,
      cd:0, hitFlash:0
    });
  }

  // ========== UPDATE ==========
  function update(dt){
    if((state!=='PLAYING' && state!=='LEVELUP') || !player) return;
    if(state==='LEVELUP'){ updateHUD(); return; }
    animT++;
    if(screenFlash>0) screenFlash--;
    if(player.atkCd>0) player.atkCd--;
    if(player.invuln>0) player.invuln--;
    if(player.dodgeCd>0) player.dodgeCd--;
    if(player.parryCd>0) player.parryCd--;
    if(player.isParrying){
      player.parryTimer--;
      if(player.parryTimer<=0) player.isParrying=false;
    }
    if(player.isDodging){
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
      player.x += mx * player.spd * player.spdMul * 60 * dt;
      player.y += my * player.spd * player.spdMul * 60 * dt;
      player.dirRow = vagabundoDirectionRow(mx, my);
      if(player.atkCd <= 0 && !player.isParrying){
        const nextAnim = player.spdMul > 1.25 ? 'run' : 'walk';
        if(player.anim !== nextAnim){ player.anim = nextAnim; player.animStart = animT; }
      }
    } else if(player.atkCd <= 0 && player.anim !== 'idle' && !player.isParrying){
      player.anim = 'idle'; player.animStart = animT;
    }
    player.x = Math.max(player.r, Math.min(MAP_W-player.r, player.x));
    player.y = Math.max(player.r, Math.min(MAP_H-player.r, player.y));
    }

    // regen
    player.sta = Math.min(player.maxSta, player.sta + 20*dt);
    if(!glintMoon) player.fp = Math.min(player.maxFp, player.fp + 6*dt);
    else player.fp = player.maxFp;

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
    while(spawnAcc >= 1 && enemies.length < 40){
      spawnAcc -= 1;
      spawnEnemy();
    }

    // enemies AI
    for(let i=enemies.length-1;i>=0;i--){
      const e=enemies[i];
      if(e.hp<=0){ enemies.splice(i,1); continue; }
      if(e.hitFlash>0) e.hitFlash--;
      const dx=player.x-e.x, dy=player.y-e.y, d=Math.hypot(dx,dy)||1;
      if(d > e.r+player.r){
        e.x += (dx/d)*e.spd; e.y += (dy/d)*e.spd;
      } else {
        onPlayerHit(e.dmg, false);
      }
    }

    // boss AI
    if(boss && boss.hp>0){
      if(boss.hitFlash>0) boss.hitFlash--;
      if(boss.cd>0) boss.cd--;
      const dx=player.x-boss.x, dy=player.y-boss.y, d=Math.hypot(dx,dy)||1;
      if(d > boss.r+player.r+10){
        boss.x += (dx/d)*boss.spd; boss.y += (dy/d)*boss.spd;
      } else if(boss.cd<=0){
        boss.cd = boss.phase2 ? 35 : 50;
        onPlayerHit(boss.dmg, true);
      }
      // boss projectiles occasionally
      if(boss.phase2 && Math.random()<0.02){
        const ang=Math.atan2(dy,dx);
        projectiles.push({x:boss.x,y:boss.y,vx:Math.cos(ang)*5,vy:Math.sin(ang)*5,dmg:boss.dmg*0.6,r:6,life:80,color:boss.color,fromPlayer:false});
      }
    }

    // projectiles
    for(let i=projectiles.length-1;i>=0;i--){
      const p=projectiles[i];
      p.x+=p.vx; p.y+=p.vy; p.life--;
      if(p.fromPlayer){
        for(let j=0;j<enemies.length;j++){
          const e=enemies[j]; if(e.hp<=0) continue;
          if(Math.hypot(p.x-e.x,p.y-e.y)<p.r+e.r){
            damageEnemy(e, {dmg:p.dmg, crit:false});
            projectiles.splice(i,1); p.life=-1; break;
          }
        }
        if(p.life>=0 && boss && boss.hp>0 && Math.hypot(p.x-boss.x,p.y-boss.y)<p.r+boss.r){
          // manual boss dmg
          boss.hp -= p.dmg; boss.hitFlash=8;
          showFT('-'+Math.round(p.dmg), boss.x, boss.y-30, '#f0d99a');
          if(!boss.phase2 && boss.hp<boss.maxHp*0.5){ boss.phase2=true; boss.spd*=1.3; boss.dmg*=1.25; }
          if(boss.hp<=0){ boss.hp=0; kills+=10; endDay(); }
          projectiles.splice(i,1); continue;
        }
      } else {
        if(Math.hypot(p.x-player.x,p.y-player.y)<p.r+player.r){
          onPlayerHit(p.dmg, false);
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

    if(mouse.down) tryAttack();
    updateHUD();
  }

  function spawnP(x,y,col,n){
    for(let i=0;i<n;i++) particles.push({x:x,y:y,vx:(Math.random()-0.5)*4,vy:(Math.random()-0.5)*4-1,r:1.5+Math.random()*2,color:col,life:14+Math.random()*10});
    if(particles.length>60) particles.splice(0, particles.length-60);
  }
  function showFT(t,x,y,c){ floating.push({text:t,x:x,y:y,color:c,life:40}); }

  // ========== DRAW ==========
  function draw(){
    ctx.fillStyle='#0a0c0a'; ctx.fillRect(0,0,W,H);

    // ground tiles
    const T=64;
    const c0=Math.floor(cam.x/T), c1=Math.floor((cam.x+W)/T)+1;
    const r0=Math.floor(cam.y/T), r1=Math.floor((cam.y+H)/T)+1;
    const gimg = spr('suelo');
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
    // moon tint
    if(bloodMoon){ ctx.fillStyle='rgba(120,20,20,0.18)'; ctx.fillRect(0,0,W,H); }
    else if(glintMoon){ ctx.fillStyle='rgba(40,80,140,0.12)'; ctx.fillRect(0,0,W,H); }

    // enemies
    for(let i=0;i<enemies.length;i++){
      const e=enemies[i]; if(e.hp<=0) continue;
      const ex=e.x-cam.x, ey=e.y-cam.y;
      if(ex<-40||ey<-40||ex>W+40||ey>H+40) continue;
      if(e.hitFlash>0) ctx.globalAlpha=0.6;
      if(!drawSpr(e.spr, ex, ey, e.r*3.8, e.r*3.8, e.x>player.x)){
        ctx.fillStyle=e.color;
        ctx.beginPath(); ctx.arc(ex,ey,e.r,0,Math.PI*2); ctx.fill();
      }
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
      if(!drawSpr(sk, bx, by, boss.r*3.2, boss.r*3.2, false)){
        ctx.fillStyle=boss.color;
        ctx.beginPath(); ctx.arc(bx,by,boss.r,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
    }

    // projectiles
    for(let i=0;i<projectiles.length;i++){
      const p=projectiles[i];
      ctx.fillStyle=p.color;
      ctx.shadowColor=p.color; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(p.x-cam.x,p.y-cam.y,p.r,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
    }

    // particles
    for(let i=0;i<particles.length;i++){
      const p=particles[i];
      ctx.globalAlpha=Math.max(0,p.life/20);
      ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x-cam.x,p.y-cam.y,p.r,0,Math.PI*2); ctx.fill();
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
      ctx.fillStyle='rgba(255,255,255,'+(screenFlash*0.07)+')';
      ctx.fillRect(0,0,W,H);
    }

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
    const fl=$('surv-flasks'); if(fl) fl.textContent='🧪 ×'+player.flasks;
    const dayEl=$('surv-day'); if(dayEl) dayEl.textContent=day;
    const killsEl=$('surv-kills'); if(killsEl) killsEl.textContent=kills;
    const lvEl=$('surv-lv'); if(lvEl) lvEl.textContent=level;
    const we=$('surv-weapon'); if(we) we.textContent=getWeapon().nombre;
    const stEl=$('surv-stats'); if(stEl) stEl.textContent=formatStats();
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
  window.addEventListener('keydown', function(e){
    const k=e.key.toLowerCase();
    keys[k]=true;
    if(e.key===' '||e.key==='Spacebar'){ e.preventDefault(); if(state==='PLAYING') tryAttack(); }
    if(k==='shift'){ e.preventDefault(); tryDodge(); }
    if(k==='q'){ e.preventDefault(); tryParry(); }
    if(k==='r' || k==='h'){ e.preventDefault(); tryFlask(); }
    if(e.key>='1'&&e.key<='9'){
      const i=parseInt(e.key,10)-1;
      if(player && i<ownedWeapons.length){ weaponIdx=i; player.weapon=ownedWeapons[i]; }
    }
  });
  window.addEventListener('keyup', function(e){ keys[e.key.toLowerCase()]=false; });
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
    const st=$('surv-start'); if(st){ st.classList.add('hidden'); st.style.display='none'; }
    createPlayer(); day=1; kills=0; level=1; xp=0; xpNext=40;
    ownedWeapons=['espadalarga']; weaponIdx=0;
    startDay();
    updateHUD();
  });
  const lvlDone=$('surv-level-done');
  if(lvlDone) lvlDone.addEventListener('click', function(){
    closeLevelUp();
  });
  const re=$('surv-restart');
  if(re) re.addEventListener('click', function(){
    const en=$('surv-end'); if(en){ en.classList.add('hidden'); en.style.display='none'; }
    const st=$('surv-start'); if(st){ st.classList.remove('hidden'); st.style.display='flex'; }
    state='START';
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