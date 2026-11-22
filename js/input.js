(function () {
  const NS = (window.DroneGame = window.DroneGame || {});

  class Input {
    constructor(handlers) {
      this.handlers = handlers || {};
      this.enabled = false;
      this.keys = new Set();
      this.touchDirs = new Set();
      this.action = false;
      this.bind();
    }

    bind() {
      window.addEventListener('keydown', (e) => {
        const code = e.code || e.key;
        if (code.startsWith('Arrow') || code === 'Space') {
          if (this.enabled || this.handles(code)) e.preventDefault();
        }
        if (code === 'KeyP' && !e.repeat) return this.fire('pause');
        if (code === 'KeyM' && !e.repeat) return this.fire('mute');
        if (code === 'Escape' && !e.repeat) return this.fire('menu');
        if (!this.enabled) return;
        this.keys.add(code);
        if (code === 'Space' && !e.repeat) this.action = true;
      });

      window.addEventListener('keyup', (e) => this.keys.delete(e.code || e.key));
      window.addEventListener('blur', () => this.clear());

      document.querySelectorAll('[data-dir]').forEach((btn) => {
        const dir = btn.dataset.dir;
        const handler = (on) => (e) => {
          e.preventDefault();
          if (on) this.touchDirs.add(dir);
          else this.touchDirs.delete(dir);
        };
        btn.addEventListener('pointerdown', handler(true));
        btn.addEventListener('pointerup', handler(false));
        btn.addEventListener('pointercancel', handler(false));
        btn.addEventListener('pointerleave', handler(false));
      });

      const actionBtn = document.getElementById('touchAction');
      if (actionBtn) {
        actionBtn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          if (this.enabled) this.action = true;
        });
      }
    }

    handles(code) {
      return code === 'Space' || code.startsWith('Arrow');
    }

    fire(name) {
      const fn = this.handlers[name];
      if (fn) fn();
    }

    down(...codes) {
      return codes.some((code) => this.keys.has(code));
    }

    touch(dir) {
      return this.touchDirs.has(dir);
    }

    consumeAction() {
      const value = this.action;
      this.action = false;
      return value;
    }

    clear() {
      this.keys.clear();
      this.touchDirs.clear();
      this.action = false;
    }
  }

  NS.Input = Input;
})();
