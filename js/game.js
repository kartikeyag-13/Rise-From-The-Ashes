(function () {
  const NS = (window.DroneGame = window.DroneGame || {});
  const W = 960;
  const H = 600;
  const GROUND = 545;
  const ROPE = 46;
  const TOTAL = 6;
  const LIVES = 3;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  NS.backgrounds = {};

  const FALLBACK_BACKGROUNDS = {
    greece: 'WhatsApp Image 2026-11-22 at 15.32.41 (3).jpeg',
    egypt: 'WhatsApp Image 2026-11-22 at 15.32.41.jpeg',
    magical: 'WhatsApp Image 2026-11-22 at 15.32.39.jpeg',
    space: 'space-backdrop.jpeg'
  };

  NS.loadBackgrounds = function (done) {
    function attach(manifest) {
      const ids = NS.WORLD_ORDER;
      const config = Object.assign({}, FALLBACK_BACKGROUNDS, manifest || {});
      let pending = ids.length;
      ids.forEach(function (id) {
        const name = config[id] && config[id].background;
        if (!name) { if (--pending === 0) done(); return; }
        const img = new Image();
        img.onload = function () {
          NS.backgrounds[id] = img;
          if (--pending === 0) done();
        };
        img.onerror = function () { if (--pending === 0) done(); };
        img.src = 'assets/themes/' + id + '/' + name;
      });
    }
    if (typeof fetch !== 'function') { attach(null); return; }
    fetch('assets/manifest.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(attach)
      .catch(function () { attach(null); });
  };

  function cover(ctx, img, w, h) {
    if (!img || !img.complete || !img.naturalWidth) return false;
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return true;
  }
  NS.cover = cover;

  class Game {
    constructor(canvas, hooks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.hooks = hooks || {};
      this.audio = new NS.AudioEngine();
      this.input = new NS.Input({
        pause: () => this.togglePause(),
        mute: () => this.hooks.onMute && this.hooks.onMute(this.audio.toggleMute()),
        menu: () => this.handleEscape()
      });
      this.state = 'TITLE';
      this.worldId = 'greece';
      this.t = 0;
      this.last = 0;
      this.dpr = 1;
      this.shake = 0;
      this.flash = 0;
      this.best = this.loadBest();
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.resetRun();
      this._loop = this.loop.bind(this);
      requestAnimationFrame(this._loop);
      this.hooks.onState && this.hooks.onState(this.state, { worldId: this.worldId });
    }

    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = W * this.dpr;
      this.canvas.height = H * this.dpr;
    }

    get world() { return NS.WORLDS[this.worldId]; }

    loadBest() {
      try {
        return JSON.parse(localStorage.getItem('skyhaul.best') || '{}') || {};
      } catch (e) {
        return {};
      }
    }

    saveBest() {
      const score = this.score;
      if (!this.best[this.worldId] || score > this.best[this.worldId]) {
        this.best[this.worldId] = score;
        try { localStorage.setItem('skyhaul.best', JSON.stringify(this.best)); } catch (e) {}
      }
    }

    resetRun() {
      const world = this.world;
      this.drone = { x: world.pickup.x + 40, y: world.pickup.y - 120, vx: 0, vy: 0, angle: 0, prevVx: 0 };
      this.carrying = false;
      this.cargoAvailable = true;
      this.ropeAngle = 0;
      this.ropeVel = 0;
      this.cargo = { x: world.pickup.x, y: world.pickup.y, px: world.pickup.x, py: world.pickup.y, speed: 0 };
      this.deliveries = 0;
      this.score = 0;
      this.lives = LIVES;
      this.elapsed = 0;
      this.invuln = 0;
      this.respawn = 0;
      this.pieceAnim = null;
      this.particles = [];
      this.popups = [];
      this.cargoDelay = 0;
      this.obstacles = world.obstacles.map((o) => Object.assign({}, o));
      this.toast = null;
      this.shake = 0;
      this.flash = 0;
      this.cinematicTime = 0;
      this.cinematicWon = false;
      this.pushHud();
    }

    startWorld(id) {
      if (!NS.WORLDS[id]) return;
      this.worldId = id;
      this.resetRun();
      this.state = 'PLAYING';
      this.input.enabled = true;
      this.input.clear();
      this.audio.setWorld(id);
      this.audio.startAmbience();
      this.audio.sfx('click');
      this.hooks.onState && this.hooks.onState(this.state, { worldId: id });
      this.pushHud();
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.input.enabled = false;
        this.input.clear();
        this.audio.stopAmbience();
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.input.enabled = true;
        this.audio.startAmbience();
      } else return;
      this.audio.sfx('click');
      this.hooks.onState && this.hooks.onState(this.state, { worldId: this.worldId });
    }

    handleEscape() {
      if (this.state === 'PLAYING' || this.state === 'PAUSED') this.toSelect();
      else if (this.state === 'SELECT') this.toTitle();
    }

    toTitle() {
      this.state = 'TITLE';
      this.input.enabled = false;
      this.input.clear();
      this.audio.stopAmbience();
      this.hooks.onState && this.hooks.onState(this.state, { worldId: this.worldId });
    }

    toSelect() {
      this.state = 'SELECT';
      this.input.enabled = false;
      this.input.clear();
      this.audio.stopAmbience();
      this.hooks.onState && this.hooks.onState(this.state, { worldId: this.worldId });
    }

    loop(timestamp) {
      let dt = (timestamp - this.last) / 1000;
      this.last = timestamp;
      if (!Number.isFinite(dt) || dt < 0) dt = 0;
      dt = Math.min(dt, 0.05);
      this.t += dt;
      if (this.state === 'PLAYING') this.update(dt);
      else if (this.state === 'CINEMATIC') this.updateCinematic(dt);
      else this.updateIdle(dt);
      this.render();
      requestAnimationFrame(this._loop);
    }

    decayShake(dt) {
      if (this.shake <= 0) return;
      this.shake *= Math.pow(0.015, dt);
      if (this.shake < 0.2) this.shake = 0;
    }

    updateIdle(dt) {
      for (const p of this.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
      this.particles = this.particles.filter((p) => p.life > 0);
      this.decayShake(dt);
      if (this.flash > 0) this.flash -= dt;
    }

    update(dt) {
      const d = this.drone;
      const world = this.world;
      this.elapsed += dt;
      d.prevVx = d.vx;

      const up = this.input.down('KeyW', 'ArrowUp') || this.input.touch('up');
      const down = this.input.down('KeyS', 'ArrowDown') || this.input.touch('down');
      const left = this.input.down('KeyA', 'ArrowLeft') || this.input.touch('left');
      const right = this.input.down('KeyD', 'ArrowRight') || this.input.touch('right');

      let fx = (right ? 900 : 0) - (left ? 900 : 0);
      let fy = world.gravity;
      if (up) fy -= 1250;
      else if (down) fy += 420;
      else fy -= world.gravity * 0.86;

      const gust = world.wind * Math.sin(this.t * 0.8) + (this.gustBoost || 0);
      fx += gust * 5;
      this.gustBoost = (this.gustBoost || 0) * Math.pow(0.1, dt);

      d.vx += fx * dt;
      d.vy += fy * dt;
      const drag = Math.pow(0.16, dt);
      d.vx *= drag;
      d.vy *= Math.pow(0.4, dt);
      const speed = Math.hypot(d.vx, d.vy);
      if (speed > 440) { d.vx = d.vx / speed * 440; d.vy = d.vy / speed * 440; }
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.x = clamp(d.x, 20, W - 20);
      d.y = clamp(d.y, 12, H - 12);
      d.angle += (clamp(d.vx / 600, -0.7, 0.7) - d.angle) * Math.min(1, dt * 7);

      if (this.carrying) {
        const ax = (d.vx - d.prevVx) / Math.max(dt, 0.001);
        this.ropeVel += (-(world.gravity / ROPE) * Math.sin(this.ropeAngle) - (ax / ROPE) * Math.cos(this.ropeAngle)) * dt;
        this.ropeVel *= Math.pow(0.22, dt);
        this.ropeAngle = clamp(this.ropeAngle + this.ropeVel * dt, -1.25, 1.25);
        this.cargo.px = this.cargo.x;
        this.cargo.py = this.cargo.y;
        this.cargo.x = d.x + Math.sin(this.ropeAngle) * ROPE;
        this.cargo.y = d.y + Math.cos(this.ropeAngle) * ROPE;
        this.cargo.speed = Math.hypot(this.cargo.x - this.cargo.px, this.cargo.y - this.cargo.py) / Math.max(dt, 0.001);
      } else {
        this.cargo.x = world.pickup.x;
        this.cargo.y = world.pickup.y;
      }

      if (this.input.consumeAction()) this.interact();

      const speedScale = 1 + this.deliveries * 0.12;
      for (const o of this.obstacles) {
        world.updateObstacle(o, dt, this.t, speedScale);
        if (this.invuln <= 0 && this.overlaps(o)) this.loseLife('obstacle');
      }

      if (this.invuln <= 0) {
        const floor = world.id === 'space' ? H - 16 : GROUND - 16;
        if (d.y > floor) this.loseLife('ground');
        if (world.id === 'greece' && d.y < 78 && d.x > 720 && d.x < 830) this.loseLife('sun');
      }

      if (this.invuln > 0) this.invuln -= dt;
      if (this.respawn > 0) {
        this.respawn -= dt;
        if (this.respawn <= 0) {
          d.x = world.pickup.x + 40;
          d.y = world.pickup.y - 120;
          d.vx = 0; d.vy = 0;
          this.cargoAvailable = true;
        }
      }
      if (this.cargoDelay > 0) {
        this.cargoDelay -= dt;
        if (this.cargoDelay <= 0) this.cargoAvailable = true;
      }
      if (this.pieceAnim) {
        this.pieceAnim.k += dt * 2.6;
        if (this.pieceAnim.k >= 1) this.pieceAnim = null;
      }
      if (this.toast) {
        this.toast.life -= dt;
        if (this.toast.life <= 0) this.toast = null;
      }
      this.decayShake(dt);
      if (this.flash > 0) this.flash -= dt;

      for (const p of this.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += (p.gravity || 0) * dt;
        p.vx *= Math.pow(0.2, dt);
        p.life -= dt;
      }
      this.particles = this.particles.filter((p) => p.life > 0);
      for (const p of this.popups) { p.y -= 26 * dt; p.life -= dt; }
      this.popups = this.popups.filter((p) => p.life > 0);
      this.pushHud();
    }

    overlaps(o) {
      const d = this.drone;
      const x = o.x + (o.wobble || 0);
      const nx = clamp(d.x, x - o.w / 2, x + o.w / 2);
      const ny = clamp(d.y, o.y - o.h / 2, o.y + o.h / 2);
      return Math.hypot(d.x - nx, d.y - ny) < 17;
    }

    interact() {
      const world = this.world;
      const d = this.drone;
      if (!this.carrying && this.cargoAvailable && Math.hypot(d.x - world.pickup.x, d.y - world.pickup.y) < 62) {
        this.carrying = true;
        this.cargoAvailable = false;
        this.ropeAngle = 0;
        this.ropeVel = 0;
        this.audio.sfx('hook');
        this.burst(world.pickup.x, world.pickup.y, world.accent, 12, 90);
        this.popup(d.x, d.y - 30, 'HOOKED', world.accent);
        return;
      }
      if (!this.carrying) {
        this.say('FLY OVER THE CARGO TO HOOK IT');
        return;
      }
      const site = world.site;
      const overSite = Math.abs(this.cargo.x - site.x) < 90 && this.cargo.y > site.y - 150 && this.cargo.y < site.y + 50;
      if (!overSite) {
        this.carrying = false;
        this.cargoDelay = 0.4;
        this.audio.sfx('drop');
        this.say('MISSED THE SITE — CARGO RETURNED');
        return;
      }
      const speed = this.cargo.speed;
      this.carrying = false;
      this.cargoDelay = 0.35;
      if (speed > 175) {
        this.audio.sfx('hit');
        this.burst(this.cargo.x, this.cargo.y, '#ff8a6a', 26, 190, 120);
        this.say('TOO HARD — CARGO BROKE');
        this.loseLife('hard');
        return;
      }
      const bonus = speed < 55 ? 50 : 25;
      this.deliveries++;
      this.score += 100 + bonus;
      this.pieceAnim = { i: this.deliveries - 1, k: 0 };
      this.audio.sfx('place');
      if (bonus === 50) this.audio.sfx('perfect');
      this.burst(site.x, site.y - 40, world.accent, 30, 170, -40);
      this.popup(site.x, site.y - 120, speed < 55 ? 'PERFECT +50' : 'GOOD +25', world.accent);
      if (this.deliveries >= TOTAL) this.finish(true);
    }

    loseLife(reason) {
      if (this.invuln > 0 || this.state !== 'PLAYING') return;
      this.lives--;
      this.invuln = 1.5;
      this.respawn = 0.6;
      this.shake = 10;
      this.flash = 0.4;
      this.carrying = false;
      this.ropeAngle = 0;
      this.cargoDelay = 0.6;
      this.audio.sfx('loseLife');
      this.burst(this.drone.x, this.drone.y, '#ff9b7a', 24, 170);
      const messages = {
        obstacle: 'IMPACT!', ground: 'CRASHED!', sun: 'TOO CLOSE TO THE SUN!', hard: 'CARGO DESTROYED!'
      };
      this.say(messages[reason] || 'HIT!');
      this.pushHud();
      if (this.lives <= 0) this.finish(false);
    }

    finish(won) {
      if (this.state !== 'PLAYING') return;
      this.cinematicWon = won;
      this.cinematicTime = 0;
      this.state = 'CINEMATIC';
      this.input.enabled = false;
      this.input.clear();
      this.audio.stopAmbience();
      this.audio.sfx(won ? 'win' : 'lose');
      if (won) {
        const bonus = Math.max(0, Math.round(600 - this.elapsed * 4));
        this.score += bonus;
        this.timeBonus = bonus;
      } else {
        this.timeBonus = 0;
      }
      this.saveBest();
      this.hooks.onState && this.hooks.onState(this.state, { worldId: this.worldId, won: won });
    }

    updateCinematic(dt) {
      this.cinematicTime += dt;
      this.decayShake(dt);
      for (const p of this.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
      this.particles = this.particles.filter((p) => p.life > 0);
      if (this.cinematicTime >= 5.2) {
        this.state = 'RESULTS';
        this.hooks.onState && this.hooks.onState(this.state, { worldId: this.worldId });
        this.hooks.onResults && this.hooks.onResults({
          won: this.cinematicWon,
          score: this.score,
          deliveries: this.deliveries,
          time: this.elapsed,
          bonus: this.timeBonus,
          best: this.best[this.worldId] || 0,
          worldId: this.worldId
        });
      }
    }

    burst(x, y, color, count, speed, gravity) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * TAU;
        const v = speed * (0.3 + Math.random() * 0.7);
        this.particles.push({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          life: 0.5 + Math.random() * 0.7, max: 1.2,
          size: 2 + Math.random() * 3, color, gravity: gravity || 60
        });
      }
    }

    popup(x, y, text, color) {
      this.popups.push({ x, y, text, color, life: 1.4 });
    }

    say(text) {
      this.toast = { text, life: 1.5 };
    }

    pushHud() {
      this.hooks.onHud && this.hooks.onHud({
        world: this.world.name,
        score: this.score,
        deliveries: this.deliveries,
        total: TOTAL,
        lives: this.lives,
        time: this.elapsed,
        wind: Math.round(this.world.wind * Math.sin(this.t * 0.8) + (this.gustBoost || 0)),
        carrying: this.carrying
      });
    }

    drawScene(ctx, t) {
      const world = this.world;
      if (!cover(ctx, NS.backgrounds[this.worldId], W, H)) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, world.accent);
        g.addColorStop(1, '#101a2c');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      world.drawBack(ctx, this, t);
      world.drawStructure(ctx, world.site.x, world.site.y + 90, this.deliveries, t, this);

      for (const o of this.obstacles) world.drawObstacle(ctx, o, t);

      if (this.cargoAvailable && !this.carrying) {
        world.drawCargo(ctx, this.cargo.x, this.cargo.y + Math.sin(t * 3) * 2, Math.sin(t * 2) * 0.08, t);
        NS.drawHelpers.glow(ctx, this.cargo.x, this.cargo.y, 55, world.accent, 0.25);
      }
      if (this.carrying) {
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.drone.x, this.drone.y + 10);
        ctx.lineTo(this.cargo.x, this.cargo.y - 8);
        ctx.stroke();
        world.drawCargo(ctx, this.cargo.x, this.cargo.y, this.ropeAngle * 0.5, t);
      }
      if (!(this.invuln > 0 && Math.floor(this.invuln * 12) % 2 === 0)) {
        world.drawDrone(ctx, this.drone, t, this);
      }
      for (const p of this.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const p of this.popups) {
        ctx.globalAlpha = Math.min(1, p.life * 1.6);
        ctx.font = '800 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
        ctx.globalAlpha = 1;
      }
    }

    render() {
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      if (this.shake > 0) ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);

      if (this.state === 'CINEMATIC') {
        const p = Math.min(1, this.cinematicTime / 5.2);
        const zoom = 1 + p * 0.28;
        ctx.translate(W / 2, H / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-W / 2, -H / 2);
        this.drawScene(ctx, this.t * (1 - p * 0.6));
        this.world.cinematic(ctx, this, p, this.cinematicWon);
      } else {
        this.drawScene(ctx, this.t);
      }
      ctx.restore();

      if (this.flash > 0) {
        ctx.fillStyle = 'rgba(255,90,70,' + Math.min(0.28, this.flash * 0.55) + ')';
        ctx.fillRect(0, 0, W, H);
      }
      if (this.state === 'CINEMATIC') {
        const bar = Math.min(56, this.cinematicTime * 200);
        ctx.fillStyle = '#080b12';
        ctx.fillRect(0, 0, W, bar);
        ctx.fillRect(0, H - bar, W, bar);
        const p = this.cinematicTime / 5.2;
        if (p > 0.45) {
          ctx.save();
          ctx.globalAlpha = Math.min(1, (p - 0.45) * 4);
          ctx.textAlign = 'center';
          ctx.fillStyle = this.cinematicWon ? this.world.accent : '#ff8a80';
          ctx.font = '800 34px system-ui, sans-serif';
          ctx.fillText(this.cinematicWon ? this.winTitle() : this.loseTitle(), W / 2, H / 2 + 12);
          ctx.font = '600 13px system-ui, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(this.cinematicWon ? 'MISSION COMPLETE' : 'GAME OVER', W / 2, H / 2 + 38);
          ctx.restore();
        }
      }
      if (this.toast && this.state === 'PLAYING') {
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.toast.life * 2);
        ctx.font = '800 15px system-ui, sans-serif';
        ctx.textAlign = 'center';
        const tw = ctx.measureText(this.toast.text).width + 30;
        ctx.fillStyle = 'rgba(10,15,24,0.82)';
        NS.drawHelpers.rr(ctx, W / 2 - tw / 2, 78, tw, 32, 16);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText(this.toast.text, W / 2, 99);
        ctx.restore();
      }
    }

    winTitle() {
      return {
        greece: 'THE TOWER STANDS',
        egypt: 'THE PYRAMID IS COMPLETE',
        magical: 'TREASURE SECURED',
        space: 'LOVE TRANSCENDS SPACE AND TIME'
      }[this.worldId];
    }

    loseTitle() {
      return {
        greece: 'THE WAX HAS MELTED',
        egypt: 'THE MUMMY HAS FEASTED',
        magical: 'SUNK BY PIRATES',
        space: 'LOST TO THE VOID'
      }[this.worldId];
    }

    drawPreview(canvas, id, t) {
      const ctx = canvas.getContext('2d');
      const scaleX = canvas.width / W;
      const scaleY = canvas.height / H;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(scaleX, scaleY);
      cover(ctx, NS.backgrounds[id], W, H);
      const world = NS.WORLDS[id];
      world.drawBack(ctx, { input: { down: () => false }, carrying: false }, t);
      world.drawStructure(ctx, world.site.x, world.site.y + 90, 3, t, { pieceAnim: null });
      world.drawCargo(ctx, world.pickup.x, world.pickup.y, 0, t);
      world.drawDrone(ctx, { x: 420 + Math.sin(t * 1.4) * 90, y: 240 + Math.cos(t * 1.8) * 35, angle: Math.sin(t) * 0.2, vx: 60 }, t, { input: { down: () => false }, carrying: false });
      ctx.restore();
    }
  }

  NS.Game = Game;
  NS.CONFIG = { W, H, GROUND, TOTAL, LIVES };
})();
