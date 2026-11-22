(function () {
  const NS = window.DroneGame;
  const $ = (id) => document.getElementById(id);
  const screens = Array.from(document.querySelectorAll('[data-screen]'));
  const overlay = $('overlay');
  const hud = $('hud');
  const touchControls = $('touchControls');
  const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const cards = {};
  const tabs = {};
  const heroCanvas = $('heroCanvas');
  let heroWorld = 'greece';
  let heroSwitch = 0;

  function setHeroWorld(id) {
    const world = NS.WORLDS[id];
    if (!world) return;
    heroWorld = id;
    $('heroKicker').textContent = world.name.toUpperCase();
    $('heroTagline').textContent = world.tagline;
    document.documentElement.style.setProperty('--accent', world.accent);
    document.documentElement.style.setProperty('--accent-rgb', world.accentRgb);
    Object.keys(tabs).forEach((key) => tabs[key].classList.toggle('active', key === id));
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  const game = new NS.Game($('game'), {
    onState(state, data) {
      screens.forEach((screen) => screen.classList.toggle('hidden', screen.dataset.screen !== state));
      overlay.classList.toggle('active', state === 'TITLE' || state === 'SELECT' || state === 'PAUSED' || state === 'RESULTS');
      hud.setAttribute('aria-hidden', state === 'TITLE' || state === 'SELECT' ? 'true' : 'false');
      touchControls.classList.toggle('show', state === 'PLAYING' && isTouch);
      if (state === 'PLAYING' && document.activeElement) document.activeElement.blur();
      if (data && data.worldId) {
        const world = NS.WORLDS[data.worldId];
        $('worldBadge').textContent = world.name.toUpperCase();
        document.documentElement.style.setProperty('--accent', world.accent);
        document.documentElement.style.setProperty('--accent-rgb', world.accentRgb);
      }
    },
    onHud(stats) {
      $('statScore').textContent = stats.score;
      $('statTime').textContent = formatTime(stats.time);
      $('statProgress').textContent = stats.deliveries + ' / ' + stats.total;
      $('statLives').textContent = '♥'.repeat(stats.lives) + '♡'.repeat(NS.CONFIG.LIVES - stats.lives);
      $('statWind').textContent = (stats.wind < 0 ? '← ' : '→ ') + Math.abs(stats.wind);
      $('progressFill').style.width = Math.round((stats.deliveries / stats.total) * 100) + '%';
      $('progressText').textContent = Math.round((stats.deliveries / stats.total) * 100) + '%';
      $('cargoStatus').textContent = stats.carrying ? 'CARGO ONBOARD' : 'HOOK THE CARGO';
      $('cargoStatus').classList.toggle('loaded', stats.carrying);
    },
    onResults(result) {
      const world = NS.WORLDS[result.worldId];
      $('resultEyebrow').textContent = result.won ? game.winTitle() : 'GAME OVER';
      $('resultTitle').textContent = result.won ? 'Mission Complete' : 'Mission Failed';
      $('resultMessage').textContent = result.won
        ? world.tagline + ' Time bonus +' + result.bonus + '.'
        : world.tagline + ' Try a gentler landing and watch the obstacles.';
      $('resultScore').textContent = result.score;
      $('resultBest').textContent = result.best;
      $('resultDelivered').textContent = result.deliveries + ' / ' + NS.CONFIG.TOTAL;
      $('resultTime').textContent = formatTime(result.time) + ' / +' + result.bonus;
      Object.keys(cards).forEach((id) => {
        cards[id].best.textContent = 'BEST ' + (game.best[id] || 0);
      });
    },
    onMute(muted) {
      $('muteBtn').textContent = muted ? '✕' : '♪';
      $('muteBtn').classList.toggle('muted', muted);
    }
  });

  NS.WORLD_ORDER.forEach((id, index) => {
    const world = NS.WORLDS[id];
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'world-card';
    card.dataset.world = id;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 200;
    const body = document.createElement('span');
    body.className = 'world-card-body';
    const title = document.createElement('strong');
    title.textContent = (index + 1) + '. ' + world.name;
    const tagline = document.createElement('small');
    tagline.textContent = world.tagline;
    const best = document.createElement('em');
    best.textContent = 'BEST ' + (game.best[id] || 0);
    body.append(title, tagline, best);
    card.append(canvas, body);
    card.addEventListener('click', () => game.startWorld(id));
    $('worldGrid').appendChild(card);
    cards[id] = { card, canvas, best };

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'world-tab';
    tab.style.setProperty('--tab', world.accent);
    const dot = document.createElement('i');
    const label = document.createElement('span');
    label.textContent = world.name;
    tab.append(dot, label);
    tab.addEventListener('click', () => setHeroWorld(id));
    $('worldTabs').appendChild(tab);
    tabs[id] = tab;
  });
  setHeroWorld('greece');

  const intro = $('intro');
  const introVideo = $('introVideo');
  let introDone = false;
  let failsafeId = null;
  function endIntro() {
    if (introDone) return;
    introDone = true;
    if (failsafeId) clearTimeout(failsafeId);
    intro.classList.add('hidden');
    if (typeof introVideo.pause === 'function') introVideo.pause();
  }
  introVideo.addEventListener('ended', endIntro);
  introVideo.addEventListener('error', endIntro);
  introVideo.addEventListener('timeupdate', function () {
    if (introVideo.duration && introVideo.duration - introVideo.currentTime < 1.2) intro.classList.add('fading');
  });
  if (typeof introVideo.play === 'function') {
    introVideo.addEventListener('canplay', function () {
      const result = introVideo.play();
      if (result && result.catch) result.catch(endIntro);
    });
    failsafeId = setTimeout(endIntro, 14000);
  }
  $('skipIntro').addEventListener('click', endIntro);

  $('chooseBtn').addEventListener('click', () => game.toSelect());
  $('selectBackBtn').addEventListener('click', () => game.toTitle());
  $('pauseBtn').addEventListener('click', () => game.togglePause());
  const fullscreenBtn = $('fullscreenBtn');
  function toggleFullscreen() {
    const root = document.documentElement;
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else if (root.requestFullscreen) {
      const result = root.requestFullscreen();
      if (result && result.catch) result.catch(() => {});
    }
  }
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  window.addEventListener('keydown', (e) => {
    if ((e.code || e.key) === 'KeyF' && !e.repeat) toggleFullscreen();
  });
  $('resumeBtn').addEventListener('click', () => game.togglePause());
  $('pauseRetryBtn').addEventListener('click', () => game.startWorld(game.worldId));
  $('pauseMenuBtn').addEventListener('click', () => game.toSelect());
  $('retryBtn').addEventListener('click', () => game.startWorld(game.worldId));
  $('resultsMenuBtn').addEventListener('click', () => game.toSelect());

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state === 'PLAYING') game.togglePause();
  });

  let previewLast = 0;
  function previews(ts) {
    const t = ts / 1000;
    if (game.state === 'TITLE') {
      if (!heroSwitch) heroSwitch = ts;
      if (ts - heroSwitch > 5500) {
        heroSwitch = ts;
        const next = (NS.WORLD_ORDER.indexOf(heroWorld) + 1) % NS.WORLD_ORDER.length;
        setHeroWorld(NS.WORLD_ORDER[next]);
      }
      if (ts - previewLast > 40) {
        previewLast = ts;
        game.drawPreview(heroCanvas, heroWorld, t);
      }
    } else if (game.state === 'SELECT' && ts - previewLast > 40) {
      previewLast = ts;
      NS.WORLD_ORDER.forEach((id) => game.drawPreview(cards[id].canvas, id, t));
    }
    requestAnimationFrame(previews);
  }
  requestAnimationFrame(previews);

  NS.loadBackgrounds(() => {
    game.drawPreview(heroCanvas, heroWorld, 0);
    NS.WORLD_ORDER.forEach((id) => game.drawPreview(cards[id].canvas, id, 0));
  });
})();
