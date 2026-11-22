(function () {
  const NS = (window.DroneGame = window.DroneGame || {});
  const TAU = Math.PI * 2;
  const W = 960;
  const H = 600;
  const GROUND = 545;

  function rr(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function ellipse(ctx, x, y, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  }

  function poly(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
  }

  function glow(ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  function star(ctx, x, y, r, color, points) {
    points = points || 4;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a = (i / (points * 2)) * TAU - Math.PI / 2;
      const rad = i % 2 ? r * 0.3 : r;
      ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function seeded(i) {
    const n = Math.sin(i * 91.7 + 17.3) * 43758.5453;
    return n - Math.floor(n);
  }

  function tint(ctx, top, bottom, alpha) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  const worlds = {
    greece: {
      id: 'greece',
      name: 'Greek Mythology',
      tagline: 'Fly with Icarus. Build the tower. Beware the sun.',
      accent: '#e7c26a',
      accentRgb: '231,194,106',
      gravity: 360,
      wind: 18,
      pickup: { x: 118, y: 430 },
      site: { x: 830, y: 430 },
      obstacles: [
        { type: 'bolt', x: 300, y: -40, vx: 0, vy: 130, w: 20, h: 90 },
        { type: 'bolt', x: 620, y: 180, vx: 0, vy: 155, w: 20, h: 90 },
        { type: 'eagle', x: 480, y: 210, vx: -110, vy: 0, w: 52, h: 24, phase: 0 },
        { type: 'eagle', x: 760, y: 330, vx: 130, vy: 0, w: 52, h: 24, phase: 2 },
        { type: 'cloud', x: 210, y: 130, vx: 35, vy: 0, w: 120, h: 46 },
        { type: 'cloud', x: 690, y: 95, vx: -28, vy: 0, w: 140, h: 46 }
      ],

      drawBack(ctx, g, t) {
        tint(ctx, 'rgba(255,190,130,0.34)', 'rgba(60,120,180,0.44)', 1);
        glow(ctx, 772, 116, 150, 'rgba(255,226,150,0.9)', 0.75);
        ctx.fillStyle = '#fff2c8';
        ellipse(ctx, 772, 116, 34, 34);
        ctx.fill();
        for (let i = 0; i < 3; i++) {
          const ox = i * 330 - 60 - (t * (6 + i * 4)) % 330;
          poly(ctx, [[ox, GROUND], [ox + 90, 380 + i * 30], [ox + 200, GROUND]]);
          ctx.fillStyle = i % 2 ? 'rgba(255,246,228,0.42)' : 'rgba(228,220,205,0.5)';
          ctx.fill();
        }
        for (const x of [250, 470, 690]) {
          ctx.fillStyle = 'rgba(255,252,238,0.32)';
          ctx.fillRect(x, 350, 16, GROUND - 350);
          for (let c = 0; c < 3; c++) ctx.fillRect(x + c * 20, 350, 8, GROUND - 350);
          ctx.fillRect(x - 6, 342, 66, 10);
          ctx.fillRect(x - 6, GROUND - 10, 66, 12);
        }
        const sea = ctx.createLinearGradient(0, GROUND, 0, H);
        sea.addColorStop(0, '#2f7d9c');
        sea.addColorStop(1, '#174c6b');
        ctx.fillStyle = sea;
        ctx.fillRect(0, GROUND, W, H - GROUND);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          for (let x = 0; x <= W; x += 12) {
            const y = GROUND + 12 + i * 14 + Math.sin(x * 0.03 + t * 2 + i) * 3;
            x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.stroke();
        }
      },

      updateObstacle(o, dt, t, speed) {
        o.x += o.vx * dt * speed;
        o.y += o.vy * dt * speed;
        if (o.type === 'bolt') {
          if (o.y > 380) { o.y = -60; o.x = 200 + seeded(t + o.x) * 600; }
        } else {
          if (o.x < -80) o.x = W + 60;
          if (o.x > W + 80) o.x = -60;
          if (o.type === 'eagle') o.y += Math.sin(t * 2 + o.phase) * 14 * dt;
        }
      },

      drawObstacle(ctx, o, t) {
        if (o.type === 'bolt') {
          glow(ctx, o.x, o.y + o.h / 2, 40, 'rgba(170,220,255,0.8)', 0.7);
          ctx.strokeStyle = '#dff3ff';
          ctx.lineWidth = 5;
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(o.x, o.y);
          ctx.lineTo(o.x - 12, o.y + 28);
          ctx.lineTo(o.x + 6, o.y + 42);
          ctx.lineTo(o.x - 8, o.y + o.h);
          ctx.stroke();
          ctx.strokeStyle = '#7fb8ff';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (o.type === 'eagle') {
          ctx.save();
          ctx.translate(o.x, o.y);
          ctx.scale(o.vx < 0 ? 1 : -1, 1);
          const flap = Math.sin(t * 9 + o.phase) * 12;
          ctx.strokeStyle = '#4a3327';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-24, flap);
          ctx.quadraticCurveTo(-10, -6, 0, 3);
          ctx.quadraticCurveTo(10, -6, 24, flap);
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.save();
          ctx.globalAlpha = 0.75;
          for (let i = 0; i < 4; i++) {
            ctx.fillStyle = i % 2 ? '#f4f7fb' : '#dce7f2';
            ellipse(ctx, o.x + i * 34 - 50, o.y + Math.sin(t + i) * 4, 36, 20);
            ctx.fill();
          }
          ctx.restore();
        }
      },

      drawDrone(ctx, d, t, g) {
        const flap = (g.input.down('KeyW', 'ArrowUp', 'KeyS', 'ArrowDown') ? 1 : 0.25) * Math.sin(t * 13) * 16;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle * 0.4);
        ctx.fillStyle = '#f3ead1';
        ellipse(ctx, 0, 2, 7, 13);
        ctx.fill();
        ctx.fillStyle = '#e8c98a';
        ellipse(ctx, 0, -10, 6, 6);
        ctx.fill();
        ctx.fillStyle = '#3a2a20';
        ellipse(ctx, 2, -11, 2, 2);
        ctx.fill();
        for (const side of [-1, 1]) {
          ctx.save();
          ctx.scale(side, 1);
          for (let i = 0; i < 7; i++) {
            const len = 34 - i * 2;
            ctx.fillStyle = i % 2 ? '#fff8e6' : '#f0dfb6';
            ctx.beginPath();
            ctx.moveTo(4, -4 + i * 2);
            ctx.lineTo(len, -14 - flap + i * 3.5);
            ctx.lineTo(len - 5, -8 - flap + i * 3.5);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(190,150,80,0.55)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.restore();
        }
        ctx.restore();
      },

      drawCargo(ctx, x, y, angle, t) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        rr(ctx, -16, -14, 32, 28, 3);
        const g = ctx.createLinearGradient(-16, -14, 16, 14);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(1, '#c9c2b2');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = '#9d9484';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(150,140,125,0.6)';
        ctx.beginPath();
        ctx.moveTo(-10, -4); ctx.lineTo(10, -4);
        ctx.moveTo(-10, 4); ctx.lineTo(10, 4);
        ctx.stroke();
        ctx.restore();
      },

      drawStructure(ctx, x, y, count, t, g) {
        ctx.save();
        ctx.translate(x, y);
        const unit = 22;
        for (let i = 0; i < count; i++) {
          const row = Math.floor(i / 2);
          const col = i % 2;
          const px = -26 + col * 26;
          const py = -unit * (row + 1);
          const pop = g.pieceAnim && g.pieceAnim.i === i ? 1 + g.pieceAnim.k * 0.35 : 1;
          ctx.save();
          ctx.translate(px + 13, py + unit / 2);
          ctx.scale(pop, pop);
          rr(ctx, -13, -unit / 2, 26, unit, 3);
          ctx.fillStyle = i % 2 ? '#fdfbf3' : '#e7e0ce';
          ctx.fill();
          ctx.strokeStyle = '#aaa08b';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillRect(-11, -unit / 2 + 4, 22, 2);
          ctx.restore();
        }
        if (count >= 6) {
          glow(ctx, 0, -unit * 4 - 4, 46, 'rgba(255,215,110,0.9)', 0.6 + Math.sin(t * 4) * 0.15);
          ctx.fillStyle = '#ffd76e';
          poly(ctx, [[0, -unit * 4 - 22], [13, -unit * 4], [-13, -unit * 4]]);
          ctx.fill();
        }
        ctx.restore();
      },

      cinematic(ctx, g, p, won) {
        const x = 830;
        const y = 430;
        if (won) {
          glow(ctx, x, y - 120, 180 + p * 120, 'rgba(255,214,120,0.95)', 0.7);
          for (let i = 0; i < 40; i++) {
            const a = i * 2.4 + p * 0.6;
            const r = 60 + seeded(i) * 180;
            star(ctx, x + Math.cos(a) * r, y - 100 + Math.sin(a) * r * 0.5, 2 + seeded(i + 9) * 4, 'rgba(255,236,170,' + (0.4 + seeded(i) * 0.6) + ')');
          }
          const a = p * TAU * 2;
          ctx.save();
          ctx.translate(x + Math.cos(a) * 190, y - 130 + Math.sin(a) * 90);
          ctx.rotate(a);
          for (const side of [-1, 1]) {
            ctx.fillStyle = '#fff5df';
            ellipse(ctx, side * 30, Math.sin(p * 30) * 8, 36, 10);
            ctx.fill();
          }
          ctx.fillStyle = '#e8c98a';
          ellipse(ctx, 0, 0, 7, 12);
          ctx.fill();
          ctx.restore();
        } else {
          const fall = Math.min(1, p * 1.4);
          const dx = 470 + Math.sin(p * 10) * 140 * (1 - fall);
          const dy = 180 + p * p * 460;
          glow(ctx, 772, 116, 120, 'rgba(255,180,100,0.8)', 0.5);
          for (let i = 0; i < 22; i++) {
            const fy = dy + (seeded(i) * 240 - 120) * p;
            ctx.fillStyle = i % 2 ? '#fff4d8' : '#e6cd9a';
            ctx.save();
            ctx.translate(dx + (seeded(i + 4) - 0.5) * 100, fy);
            ctx.rotate(p * 6 + i);
            ctx.fillRect(-5, -2, 10, 4);
            ctx.restore();
          }
          ctx.fillStyle = '#e8c98a';
          ellipse(ctx, dx, dy, 7, 12);
          ctx.fill();
          if (dy > GROUND - 20) {
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ellipse(ctx, dx, GROUND + 8, 80 * p, 12 * p);
            ctx.fill();
          }
        }
      }
    },

    egypt: {
      id: 'egypt',
      name: 'Ancient Egypt',
      tagline: 'A saucer, sandstone and a pyramid under a dusk sky.',
      accent: '#e8a34a',
      accentRgb: '232,163,74',
      gravity: 340,
      wind: 34,
      pickup: { x: 118, y: 430 },
      site: { x: 830, y: 430 },
      obstacles: [
        { type: 'tornado', x: 350, y: GROUND, vx: 0, vy: -38, w: 46, h: 150 },
        { type: 'tornado', x: 660, y: GROUND, vx: 0, vy: -32, w: 46, h: 150 },
        { type: 'scarab', x: 470, y: 240, vx: 120, vy: 0, w: 30, h: 22, phase: 0 },
        { type: 'scarab', x: 720, y: 320, vx: -105, vy: 0, w: 30, h: 22, phase: 1 },
        { type: 'obelisk', x: 400, y: 340, vx: 0, vy: 0, w: 26, h: 205 },
        { type: 'gust', x: 250, y: 200, vx: 90, vy: 0, w: 130, h: 70 }
      ],

      drawBack(ctx, g, t) {
        tint(ctx, 'rgba(255,138,72,0.38)', 'rgba(88,42,116,0.55)', 1);
        glow(ctx, 700, 210, 170, 'rgba(255,180,90,0.9)', 0.7);
        ctx.fillStyle = '#ffd08a';
        ellipse(ctx, 700, 210, 52, 52);
        ctx.fill();
        for (let i = 0; i < 3; i++) {
          const off = (t * (8 + i * 5)) % 260;
          for (let k = -1; k < 5; k++) {
            const x = k * 260 - off;
            poly(ctx, [[x, GROUND], [x + 130, 430 + i * 24], [x + 260, GROUND]]);
            ctx.fillStyle = i % 2 ? 'rgba(210,150,90,0.42)' : 'rgba(244,196,130,0.38)';
            ctx.fill();
          }
        }
        for (const x of [190, 560, 900]) {
          ctx.fillStyle = 'rgba(90,60,45,0.55)';
          ctx.fillRect(x, GROUND - 78, 8, 78);
          for (let k = 0; k < 5; k++) {
            ctx.fillStyle = 'rgba(70,110,70,0.65)';
            ellipse(ctx, x + (k % 2 ? 18 : -18), GROUND - 84 + k * 5, 24, 6);
            ctx.fill();
          }
        }
        const nile = ctx.createLinearGradient(0, GROUND, 0, H);
        nile.addColorStop(0, '#8a6a92');
        nile.addColorStop(1, '#3d3a6c');
        ctx.fillStyle = nile;
        ctx.fillRect(0, GROUND, W, H - GROUND);
        ctx.fillStyle = 'rgba(255,220,160,0.22)';
        for (let i = 0; i < 60; i++) {
          const x = (seeded(i) * W + t * 12) % W;
          const y = 60 + seeded(i + 33) * 420;
          ctx.fillRect(x, y, 2, 2);
        }
      },

      updateObstacle(o, dt, t, speed) {
        if (o.type === 'tornado') {
          o.y += o.vy * dt * speed;
          if (o.y < 210) o.y = GROUND;
          o.wobble = Math.sin(t * 4 + o.x) * 12;
        } else if (o.type === 'gust') {
          o.x += o.vx * dt * speed;
          if (o.x > W + 100) o.x = -140;
        } else {
          o.x += o.vx * dt * speed;
          o.y += Math.sin(t * 3 + o.phase) * 18 * dt;
          if (o.x < -50) o.x = W + 40;
          if (o.x > W + 50) o.x = -40;
        }
      },

      drawObstacle(ctx, o, t) {
        if (o.type === 'tornado') {
          const x = o.x + (o.wobble || 0);
          ctx.save();
          ctx.globalAlpha = 0.75;
          for (let i = 0; i < 7; i++) {
            const yy = o.y - i * 18;
            const rx = o.w * (0.35 + i * 0.1);
            ctx.strokeStyle = i % 2 ? 'rgba(235,196,140,0.7)' : 'rgba(180,130,90,0.6)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.ellipse(x, yy, rx, 7, Math.sin(t * 5 + i) * 0.3, 0, TAU);
            ctx.stroke();
          }
          ctx.restore();
        } else if (o.type === 'scarab') {
          ctx.save();
          ctx.translate(o.x, o.y);
          ctx.fillStyle = '#2f6b63';
          ellipse(ctx, 0, 0, 15, 10);
          ctx.fill();
          ctx.strokeStyle = '#123f3b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -10); ctx.lineTo(0, 10);
          ctx.stroke();
          for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(s * 8, -4); ctx.lineTo(s * 18, -10 + Math.sin(t * 12) * 3);
            ctx.moveTo(s * 8, 4); ctx.lineTo(s * 18, 10 + Math.sin(t * 12) * 3);
            ctx.stroke();
          }
          ctx.restore();
        } else if (o.type === 'obelisk') {
          ctx.fillStyle = '#c99760';
          poly(ctx, [[o.x, o.y + o.h], [o.x, o.y + 18], [o.x + o.w / 2, o.y], [o.x + o.w, o.y + 18], [o.x + o.w, o.y + o.h]]);
          ctx.fill();
          ctx.strokeStyle = 'rgba(110,70,40,0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.save();
          ctx.globalAlpha = 0.32;
          ctx.strokeStyle = '#ffe0ae';
          ctx.lineWidth = 3;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(o.x - 60 + i * 30, o.y - 24);
            ctx.quadraticCurveTo(o.x, o.y, o.x - 60 + i * 30, o.y + 24);
            ctx.stroke();
          }
          ctx.restore();
        }
      },

      drawDrone(ctx, d, t, g) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle * 0.25);
        if (g.carrying) {
          const beam = ctx.createLinearGradient(0, 0, 0, 90);
          beam.addColorStop(0, 'rgba(120,255,235,0.55)');
          beam.addColorStop(1, 'transparent');
          ctx.fillStyle = beam;
          poly(ctx, [[-6, 8], [6, 8], [30, 90], [-30, 90]]);
          ctx.fill();
        }
        const body = ctx.createLinearGradient(0, -12, 0, 12);
        body.addColorStop(0, '#f6f7f8');
        body.addColorStop(1, '#96a4ad');
        ctx.fillStyle = body;
        ellipse(ctx, 0, 2, 33, 12);
        ctx.fill();
        ctx.strokeStyle = '#5d6a74';
        ctx.lineWidth = 2;
        ctx.stroke();
        const dome = ctx.createRadialGradient(-6, -14, 2, 0, -8, 20);
        dome.addColorStop(0, '#ecffff');
        dome.addColorStop(0.5, '#84d6e2');
        dome.addColorStop(1, '#2b7f95');
        ctx.fillStyle = dome;
        ctx.beginPath();
        ctx.ellipse(0, -5, 17, 15, 0, Math.PI, TAU);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#357b8c';
        ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const a = t * 8 + (i / 6) * TAU;
          ctx.fillStyle = i % 2 ? '#ffe6a4' : '#7ff0e4';
          ellipse(ctx, Math.cos(a) * 27, 5 + Math.sin(a) * 7, 2.5, 2.5);
          ctx.fill();
        }
        ctx.restore();
      },

      drawCargo(ctx, x, y, angle, t) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        rr(ctx, -16, -13, 32, 26, 3);
        const g = ctx.createLinearGradient(-16, -13, 16, 13);
        g.addColorStop(0, '#f0d09b');
        g.addColorStop(1, '#a97945');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = '#7c572f';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(110,75,40,0.5)';
        ctx.fillRect(-3, -5, 6, 10);
        ctx.fillRect(-7, -1, 14, 2);
        ctx.restore();
      },

      drawStructure(ctx, x, y, count, t, g) {
        ctx.save();
        ctx.translate(x, y);
        const layers = [1, 2, 3, 4, 5];
        const unit = 17;
        let placed = 0;
        for (let row = 0; row < 5; row++) {
          const need = layers[row];
          if (placed + need > count) {
            if (count > placed) {
              for (let i = 0; i < count - placed; i++) this._block(ctx, i, row, unit, g, count);
            }
            break;
          }
          for (let i = 0; i < need; i++) this._block(ctx, i, row, unit, g, count);
          placed += need;
        }
        if (count >= 6) {
          glow(ctx, 0, -unit * 5, 60, 'rgba(255,212,120,0.95)', 0.75);
          ctx.fillStyle = '#ffd76e';
          poly(ctx, [[0, -unit * 5 - 24], [15, -unit * 5], [-15, -unit * 5]]);
          ctx.fill();
        }
        ctx.restore();
      },

      _block(ctx, i, row, unit, g, count) {
        const perRow = row + 1;
        const px = (i - (perRow - 1) / 2) * unit * 1.9;
        const py = -(row + 1) * unit;
        const pop = g.pieceAnim && g.pieceAnim.i === count - 1 ? 1 + g.pieceAnim.k * 0.4 : 1;
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(pop, pop);
        rr(ctx, -unit, -unit / 2, unit * 2, unit, 2);
        ctx.fillStyle = row % 2 ? '#e8c28b' : '#d6a86e';
        ctx.fill();
        ctx.strokeStyle = '#8f6537';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      },

      cinematic(ctx, g, p, won) {
        if (won) {
          glow(ctx, 830, 330, 200 + p * 160, 'rgba(255,206,110,0.95)', 0.8);
          for (let i = 0; i < 6; i++) {
            const px = 730 + i * 28;
            const jump = Math.abs(Math.sin(p * 9 + i)) * 26;
            ctx.fillStyle = '#5b3f6b';
            ctx.fillRect(px, 512 - jump, 12, 26);
            ctx.fillStyle = '#f0c98a';
            ellipse(ctx, px + 6, 504 - jump, 7, 8);
            ctx.fill();
            ctx.strokeStyle = '#f0c98a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(px + 6, 510 - jump);
            ctx.lineTo(px - 2, 498 - jump);
            ctx.moveTo(px + 6, 510 - jump);
            ctx.lineTo(px + 14, 498 - jump);
            ctx.stroke();
          }
          for (let i = 0; i < 30; i++) {
            ctx.fillStyle = i % 2 ? '#ffe3a0' : '#ff9c5b';
            ellipse(ctx, 830 + (seeded(i) - 0.5) * 300, 330 + (seeded(i + 7) - 0.5) * 240 * (1 - p), 2 + seeded(i + 3) * 3, 2);
            ctx.fill();
          }
        } else {
          const rise = Math.min(1, p * 1.6);
          const my = GROUND + 120 - rise * 250;
          glow(ctx, 480, my, 120, 'rgba(160,220,190,0.5)', 0.5);
          ctx.fillStyle = '#d8c9a4';
          rr(ctx, 430, my - 70, 100, 180, 30);
          ctx.fill();
          ctx.strokeStyle = '#8e7b5c';
          ctx.lineWidth = 4;
          for (let i = 0; i < 9; i++) {
            ctx.beginPath();
            ctx.moveTo(430, my - 60 + i * 20);
            ctx.lineTo(530, my - 66 + i * 20);
            ctx.stroke();
          }
          ctx.fillStyle = '#7ff0d4';
          glow(ctx, 480, my - 20, 40, '#7ff0d4', 0.9);
          ellipse(ctx, 465, my - 20, 6, 8);
          ctx.fill();
          ellipse(ctx, 495, my - 20, 6, 8);
          ctx.fill();
          ctx.fillStyle = '#b6e9df';
          ellipse(ctx, 470, my + 90, 34, 12);
          ctx.fill();
          ellipse(ctx, 490, my + 90, 34, 12);
          ctx.fill();
        }
      }
    },

    magical: {
      id: 'magical',
      name: 'Magical Seas',
      tagline: 'A ghost ship, a treasure chest and a twilight sea.',
      accent: '#a98cff',
      accentRgb: '169,140,255',
      gravity: 330,
      wind: 22,
      pickup: { x: 118, y: 430 },
      site: { x: 830, y: 430 },
      obstacles: [
        { type: 'cannonball', x: 320, y: 90, vx: 105, vy: 25, w: 20, h: 20 },
        { type: 'cannonball', x: 700, y: 110, vx: -125, vy: 20, w: 20, h: 20 },
        { type: 'jelly', x: 450, y: 250, vx: -55, vy: 0, w: 40, h: 46, phase: 0 },
        { type: 'jelly', x: 650, y: 330, vx: 65, vy: 0, w: 40, h: 46, phase: 1 },
        { type: 'serpent', x: 560, y: GROUND, vx: -70, vy: 0, w: 70, h: 90 }
      ],

      drawBack(ctx, g, t) {
        tint(ctx, 'rgba(126,86,202,0.36)', 'rgba(28,90,120,0.52)', 1);
        for (let i = 0; i < 70; i++) {
          const x = seeded(i) * W;
          const y = seeded(i + 21) * 430;
          const a = 0.3 + Math.sin(t * 2 + i) * 0.25;
          star(ctx, x, y, 1 + seeded(i + 4) * 2, 'rgba(220,240,255,' + a + ')');
        }
        glow(ctx, 230, 130, 150, 'rgba(255,140,220,0.45)', 0.7);
        glow(ctx, 700, 200, 180, 'rgba(110,220,220,0.4)', 0.6);
        for (const [x, y, s] of [[300, 340, 90], [600, 280, 120], [880, 360, 80]]) {
          poly(ctx, [[x - s, y], [x, y + 22], [x + s, y], [x + s * 0.5, y - 16], [x - s * 0.4, y - 12]]);
          ctx.fillStyle = 'rgba(70,60,110,0.75)';
          ctx.fill();
          ctx.fillStyle = 'rgba(150,120,200,0.6)';
          ctx.fillRect(x - s * 0.5, y - 22, s, 10);
        }
        const sea = ctx.createLinearGradient(0, GROUND, 0, H);
        sea.addColorStop(0, '#204a72');
        sea.addColorStop(1, '#101f47');
        ctx.fillStyle = sea;
        ctx.fillRect(0, GROUND, W, H - GROUND);
        ctx.strokeStyle = 'rgba(160,200,255,0.35)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 20; i++) {
          const x = seeded(i) * W;
          const y = GROUND + 10 + seeded(i + 8) * 45;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 12 + Math.sin(t * 3 + i) * 6, y);
          ctx.stroke();
        }
      },

      updateObstacle(o, dt, t, speed) {
        o.x += o.vx * dt * speed;
        if (o.type === 'cannonball') {
          o.y += o.vy * dt * speed;
          o.vy += 60 * dt;
          if (o.y > GROUND - 10 || o.x > W + 30 || o.x < -30) {
            o.y = 60 + seeded(t + o.x) * 80;
            o.vy = 10;
            o.x = o.vx > 0 ? -20 : W + 20;
          }
        } else if (o.type === 'jelly') {
          o.y += Math.sin(t * 2 + o.phase) * 16 * dt;
          if (o.x < -60) o.x = W + 50;
          if (o.x > W + 60) o.x = -50;
        } else {
          if (o.x < -80) o.x = W + 80;
          if (o.x > W + 80) o.x = -80;
          o.y = GROUND - Math.abs(Math.sin(t * 1.5 + o.x)) * 80;
        }
      },

      drawObstacle(ctx, o, t) {
        if (o.type === 'cannonball') {
          glow(ctx, o.x, o.y, 30, 'rgba(255,170,90,0.6)', 0.7);
          ctx.fillStyle = '#2a2d38';
          ellipse(ctx, o.x, o.y, 10, 10);
          ctx.fill();
          ctx.strokeStyle = '#69707f';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (o.type === 'jelly') {
          glow(ctx, o.x, o.y, 50, 'rgba(180,130,255,0.6)', 0.6);
          ctx.fillStyle = 'rgba(210,170,255,0.8)';
          ctx.beginPath();
          ctx.ellipse(o.x, o.y - 4, 20, 16, 0, Math.PI, TAU);
          ctx.fill();
          ctx.strokeStyle = 'rgba(230,200,255,0.8)';
          ctx.lineWidth = 2;
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(o.x + i * 8, o.y);
            ctx.quadraticCurveTo(o.x + i * 8 + Math.sin(t * 4 + i) * 6, o.y + 18, o.x + i * 8, o.y + 30);
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = '#2f7a76';
          ctx.save();
          ctx.translate(o.x, o.y);
          ctx.beginPath();
          ctx.moveTo(-35, 60);
          ctx.quadraticCurveTo(-10, -40, 0, -70);
          ctx.quadraticCurveTo(12, -30, 35, 60);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#e8f0c0';
          ellipse(ctx, 0, -58, 5, 5);
          ctx.fill();
          ctx.restore();
        }
      },

      drawDrone(ctx, d, t, g) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle * 0.35);
        if (g.carrying) {
          glow(ctx, 0, 26, 40, 'rgba(255,220,120,0.6)', 0.6);
        }
        ctx.fillStyle = '#6b4a33';
        poly(ctx, [[-26, 6], [26, 6], [18, 20], [-18, 20]]);
        ctx.fill();
        ctx.strokeStyle = '#3e2a1e';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#8a6240';
        ctx.fillRect(-3, -28, 6, 34);
        for (const side of [-1, 1]) {
          ctx.save();
          ctx.scale(side, 1);
          const wave = Math.sin(t * 4 + side) * 4;
          poly(ctx, [[4, -26], [26, -14 + wave], [10, 4]]);
          ctx.fillStyle = 'rgba(180,150,255,0.75)';
          ctx.fill();
          ctx.strokeStyle = '#d8c4ff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
        for (let i = 0; i < 4; i++) {
          star(ctx, -20 + i * 14, -32 - Math.sin(t * 5 + i) * 4, 2.5, '#fff2b0');
        }
        ctx.restore();
      },

      drawCargo(ctx, x, y, angle, t) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        glow(ctx, 0, 0, 28, 'rgba(255,215,110,0.85)', 0.7);
        ctx.fillStyle = '#b5873d';
        rr(ctx, -15, -12, 30, 24, 5);
        ctx.fill();
        ctx.fillStyle = '#ffd462';
        ellipse(ctx, 0, -4, 9, 6);
        ctx.fill();
        ctx.fillStyle = '#fff0a8';
        star(ctx, -4, -6, 3, '#fff7d0');
        ctx.restore();
      },

      drawStructure(ctx, x, y, count, t, g) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#5b3c2a';
        rr(ctx, -48, -18, 96, 40, 6);
        ctx.fill();
        ctx.fillStyle = '#8c6138';
        rr(ctx, -48, -30, 96, 16, 5);
        ctx.fill();
        ctx.strokeStyle = '#d8b56a';
        ctx.lineWidth = 2;
        ctx.strokeRect(-48, -30, 96, 16);
        ctx.fillStyle = '#2a1c16';
        rr(ctx, -36, -29, 72, 14, 3);
        ctx.fill();
        for (let i = 0; i < count; i++) {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const px = -24 + col * 24;
          const py = -32 - row * 9;
          const pop = g.pieceAnim && g.pieceAnim.i === i ? 1 + g.pieceAnim.k * 0.5 : 1;
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(pop, pop);
          glow(ctx, 0, 0, 16, 'rgba(255,210,100,0.8)', 0.6);
          ctx.fillStyle = i % 2 ? '#ffd76e' : '#e8b84e';
          ellipse(ctx, 0, 0, 10, 6);
          ctx.fill();
          ctx.restore();
        }
        if (count >= 6) {
          glow(ctx, 0, -72, 70, 'rgba(255,220,130,0.9)', 0.7 + Math.sin(t * 4) * 0.2);
        }
        ctx.restore();
      },

      cinematic(ctx, g, p, won) {
        if (won) {
          glow(ctx, 830, 380, 220 + p * 150, 'rgba(255,220,130,0.9)', 0.8);
          for (let i = 0; i < 70; i++) {
            const a = seeded(i) * TAU + p * 0.5;
            const r = seeded(i + 11) * 220 * p;
            const x = 830 + Math.cos(a) * r;
            const y = 380 + Math.sin(a) * r - p * 60;
            if (i % 3 === 0) {
              ctx.fillStyle = i % 2 ? '#ff5c8a' : '#66e0ff';
              star(ctx, x, y, 4 + seeded(i + 5) * 5, ctx.fillStyle);
            } else {
              ctx.fillStyle = '#ffd76e';
              ellipse(ctx, x, y, 5, 5);
              ctx.fill();
            }
          }
        } else {
          const sx = -200 + p * 900;
          ctx.fillStyle = '#241a28';
          poly(ctx, [[sx - 130, GROUND], [sx - 100, 420], [sx + 100, 420], [sx + 130, GROUND]]);
          ctx.fill();
          ctx.fillRect(sx - 4, 300, 8, 130);
          poly(ctx, [[sx, 305], [sx + 80, 360], [sx, 375]]);
          ctx.fillStyle = 'rgba(190,170,220,0.8)';
          ctx.fill();
          if (p > 0.45) {
            glow(ctx, sx + 60, 360, 90, 'rgba(255,170,90,0.9)', 0.9);
            for (let i = 0; i < 5; i++) {
              ctx.fillStyle = '#30333d';
              ellipse(ctx, sx + 70 + i * 26 + p * 50, 360 - i * 10, 8, 8);
              ctx.fill();
            }
          }
          const fall = Math.min(1, (p - 0.5) * 2);
          ctx.save();
          ctx.translate(470 + fall * 90, 240 + fall * 320);
          ctx.rotate(fall * 3);
          ctx.fillStyle = '#6b4a33';
          for (let i = -2; i <= 2; i++) ctx.fillRect(i * 10 - 2, -8, 5, 24 + Math.abs(i) * 6);
          ctx.restore();
        }
      }
    },

    space: {
      id: 'space',
      name: 'Deep Space',
      tagline: 'Low gravity. A heart of light. The void is waiting.',
      accent: '#ff6f9c',
      accentRgb: '255,111,156',
      gravity: 210,
      wind: 4,
      pickup: { x: 118, y: 430 },
      site: { x: 830, y: 330 },
      obstacles: [
        { type: 'asteroid', x: 340, y: 170, vx: -55, vy: 18, w: 48, h: 48, spin: 0 },
        { type: 'asteroid', x: 620, y: 300, vx: 70, vy: -12, w: 64, h: 64, spin: 1 },
        { type: 'asteroid', x: 480, y: 460, vx: -40, vy: -20, w: 38, h: 38, spin: 2 },
        { type: 'satellite', x: 730, y: 140, vx: -85, vy: 0, w: 46, h: 22 },
        { type: 'debris', x: 250, y: 320, vx: 95, vy: 8, w: 26, h: 14 }
      ],

      drawBack(ctx, g, t) {
        tint(ctx, 'rgba(10,12,42,0.62)', 'rgba(24,8,48,0.68)', 1);
        glow(ctx, 320, 180, 220, 'rgba(120,80,220,0.45)', 0.7);
        glow(ctx, 720, 420, 200, 'rgba(220,70,150,0.3)', 0.6);
        for (let i = 0; i < 110; i++) {
          const x = seeded(i) * W;
          const y = seeded(i + 31) * H;
          const par = 0.3 + seeded(i + 9) * 0.7;
          const a = 0.25 + Math.sin(t * 2 + i) * 0.3;
          ctx.fillStyle = 'rgba(235,240,255,' + a + ')';
          ctx.fillRect((x + t * par * 4) % W, y, 1.5 * par, 1.5 * par);
        }
        ctx.save();
        ctx.translate(170, 150);
        ctx.rotate(t * 0.25);
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = 'rgba(140,220,255,' + (0.25 - i * 0.06) + ')';
          ctx.lineWidth = 10 - i * 3;
          ctx.beginPath();
          ctx.ellipse(0, 0, 70 + i * 16, 26 + i * 6, 0.4, 0, TAU);
          ctx.stroke();
        }
        ctx.restore();
        ctx.save();
        ctx.translate(880, 110);
        const ring = ctx.createRadialGradient(0, 0, 20, 0, 0, 100);
        ring.addColorStop(0, 'rgba(255,140,190,0.55)');
        ring.addColorStop(1, 'transparent');
        ctx.fillStyle = ring;
        ctx.fillRect(-100, -100, 200, 200);
        ctx.fillStyle = '#e9a6c8';
        ellipse(ctx, 0, 0, 30, 30);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,220,230,0.6)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, 56, 14, -0.4, 0, TAU);
        ctx.stroke();
        ctx.restore();
      },

      updateObstacle(o, dt, t, speed) {
        o.x += o.vx * dt * speed;
        o.y += o.vy * dt * speed;
        if (o.spin !== undefined) o.spin += dt * (0.4 + o.spin * 0.2);
        if (o.y < 40 || o.y > H - 40) o.vy *= -1;
        if (o.x < -80) o.x = W + 60;
        if (o.x > W + 80) o.x = -60;
      },

      drawObstacle(ctx, o, t) {
        if (o.type === 'asteroid') {
          ctx.save();
          ctx.translate(o.x, o.y);
          ctx.rotate(o.spin || 0);
          ctx.fillStyle = '#7e8496';
          ctx.beginPath();
          for (let i = 0; i < 9; i++) {
            const a = (i / 9) * TAU;
            const r = o.w / 2 * (0.8 + seeded(i + o.w) * 0.35);
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#565c6e';
          ellipse(ctx, -6, -4, 6, 5);
          ctx.fill();
          ctx.restore();
        } else if (o.type === 'satellite') {
          ctx.save();
          ctx.translate(o.x, o.y);
          ctx.rotate(Math.sin(t * 2) * 0.3);
          ctx.fillStyle = '#b9c4d4';
          rr(ctx, -12, -9, 24, 18, 3);
          ctx.fill();
          ctx.fillStyle = '#4a76b8';
          ctx.fillRect(-26, -6, 12, 12);
          ctx.fillRect(14, -6, 12, 12);
          ctx.restore();
        } else {
          ctx.fillStyle = '#8d94a6';
          ctx.save();
          ctx.translate(o.x, o.y);
          ctx.rotate(t * 1.7);
          ctx.fillRect(-13, -3, 26, 6);
          ctx.restore();
        }
      },

      drawDrone(ctx, d, t, g) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle * 0.3);
        const flame = g.input.down('KeyW', 'ArrowUp') ? 22 + Math.sin(t * 30) * 6 : 8;
        const flameGrad = ctx.createLinearGradient(0, 12, 0, 12 + flame);
        flameGrad.addColorStop(0, '#fff0a0');
        flameGrad.addColorStop(0.5, '#ff9a4d');
        flameGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = flameGrad;
        poly(ctx, [[-7, 12], [7, 12], [0, 12 + flame]]);
        ctx.fill();
        ctx.fillStyle = '#4a5a72';
        rr(ctx, -12, 8, 9, 12, 3);
        ctx.fill();
        rr(ctx, 3, 8, 9, 12, 3);
        ctx.fill();
        ctx.fillStyle = '#f2f5fa';
        ellipse(ctx, 0, 0, 17, 19);
        ctx.fill();
        ctx.strokeStyle = '#9fb0c8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#d9a94e';
        ctx.beginPath();
        ctx.ellipse(0, -3, 11, 9, 0, Math.PI, TAU);
        ctx.fill();
        ctx.strokeStyle = '#8a6a33';
        ctx.stroke();
        ctx.restore();
      },

      drawCargo(ctx, x, y, angle, t) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        glow(ctx, 0, 0, 30, 'rgba(255,90,150,0.85)', 0.75);
        ctx.fillStyle = '#ff5d92';
        ctx.beginPath();
        ctx.moveTo(0, 15);
        ctx.bezierCurveTo(-26, -2, -14, -20, 0, -10);
        ctx.bezierCurveTo(14, -20, 26, -2, 0, 15);
        ctx.fill();
        ctx.strokeStyle = '#ffd0e0';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      },

      drawStructure(ctx, x, y, count, t, g) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = count >= 6 ? '#ff8fb6' : 'rgba(255,140,180,0.5)';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#ff5d92';
        ctx.shadowBlur = count >= 6 ? 30 + Math.sin(t * 4) * 12 : 8;
        ctx.beginPath();
        ctx.moveTo(0, 34);
        ctx.bezierCurveTo(-70, -10, -58, -62, 0, -30);
        ctx.bezierCurveTo(58, -62, 70, -10, 0, 34);
        ctx.stroke();
        ctx.shadowBlur = 0;
        for (let i = 0; i < count; i++) {
          const seg = (i + 0.5) / 6;
          const px = Math.sin(seg * TAU - Math.PI / 2) * 42;
          const py = -12 - Math.cos(seg * TAU) * 22;
          const pop = g.pieceAnim && g.pieceAnim.i === i ? 1 + g.pieceAnim.k * 0.6 : 1;
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(pop, pop);
          glow(ctx, 0, 0, 22, 'rgba(255,110,160,0.9)', 0.8);
          ctx.fillStyle = '#ff86b0';
          ellipse(ctx, 0, 0, 7, 7);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      },

      cinematic(ctx, g, p, won) {
        if (won) {
          glow(ctx, 830, 320, 240 + p * 140, 'rgba(255,110,170,0.9)', 0.85);
          ctx.strokeStyle = '#ff9fc0';
          ctx.lineWidth = 7;
          ctx.shadowColor = '#ff5d92';
          ctx.shadowBlur = 40;
          ctx.beginPath();
          ctx.moveTo(830, 354);
          ctx.bezierCurveTo(760, 310, 772, 258, 830, 290);
          ctx.bezierCurveTo(888, 258, 900, 310, 830, 354);
          ctx.stroke();
          ctx.shadowBlur = 0;
          const px = 830 - 220 + p * 190;
          const py = 230 + Math.sin(p * 6) * 12;
          ctx.fillStyle = '#f2f5fa';
          ellipse(ctx, px, py, 16, 18);
          ctx.fill();
          ctx.fillStyle = '#d9a94e';
          ellipse(ctx, px, py - 3, 10, 8);
          ctx.fill();
          const px2 = 830 + 220 - p * 190;
          ctx.fillStyle = '#f7f2fa';
          ellipse(ctx, px2, py, 16, 18);
          ctx.fill();
          ctx.fillStyle = '#e9b7d0';
          ellipse(ctx, px2, py - 3, 10, 8);
          ctx.fill();
          for (let i = 0; i < 40; i++) star(ctx, seeded(i) * W, seeded(i + 7) * H, 2 + seeded(i + 3) * 3, 'rgba(255,220,240,0.8)');
        } else {
          const pull = Math.min(1, p * 1.2);
          const cx = 880;
          const cy = 110;
          glow(ctx, cx, cy, 100 + pull * 260, 'rgba(20,5,35,0.95)', 1);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(p * 9);
          ctx.scale(1 + pull * 2.4, 1 - pull * 0.5);
          ctx.fillStyle = '#f2f5fa';
          ellipse(ctx, 0, 0, 17, 19);
          ctx.fill();
          ctx.fillStyle = '#d9a94e';
          ellipse(ctx, 0, -3, 11, 9);
          ctx.fill();
          ctx.restore();
          ctx.fillStyle = 'rgba(6,2,18,' + Math.min(0.96, p * 1.4) + ')';
          ctx.fillRect(0, 0, W, H);
        }
      }
    }
  };

  NS.WORLDS = worlds;
  NS.WORLD_ORDER = ['greece', 'egypt', 'magical', 'space'];
  NS.WORLD_SIZE = { W, H, GROUND };
  NS.drawHelpers = { rr, ellipse, poly, glow, star, seeded, tint };
})();
