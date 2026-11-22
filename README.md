# SkyHaul — Four Worlds

A polished HTML5 Canvas drone delivery game. Plain HTML/CSS/JS, no libraries, no build step. Runs straight from the repo and on GitHub Pages.

## Run

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## The four worlds

1. **Greek Mythology** — fly Icarus, avoid Zeus's bolts and the sun, build a marble tower.
2. **Ancient Egypt** — a UFO over desert dunes, sandstorms and scarabs, build a pyramid.
3. **Magical Seas** — a ghost ship over a twilight sea, fill a treasure chest with gold.
4. **Deep Space** — low-gravity astronaut, drifting asteroids, assemble a glowing heart.

Each world has its own palette, moving hazards, drone skin, cargo, structure, ambience and two cinematic endings.

## Controls

- **WASD** / **arrows** — thrust and steering
- **SPACE** — hook cargo / drop it gently on the build site
- **P** — pause, **M** — mute, **ESC** — back to menu
- Touch devices get an on-screen D-pad and action button

Hook the block on the left, fly to the structure on the right and release. A soft drop scores **PERFECT +50**; a hard drop shatters the cargo. Each world gives three lives — crashes, hazards and broken cargo cost one. Deliver six blocks to complete the structure, then watch the ending cinematic. Best score is saved per world in `localStorage`.

## Files

- `index.html` — screens, HUD, overlays
- `css/style.css` — responsive UI
- `js/worlds.js` — four world configs, procedural art, hazards and endings
- `js/game.js` — physics, swinging tether, collisions, scoring, states, cinematics
- `js/audio.js` — Web Audio ambience and effects
- `js/input.js` — keyboard and touch input
- `js/main.js` — UI wiring and world previews
- `assets/themes/<world>/` — background photos; `assets/manifest.json` selects them (see `assets/README.md`)

## Background images

Drop a photo into a world folder and set its filename in `assets/manifest.json`. The image is drawn as a cover-fit backdrop; all gameplay art is still drawn procedurally on top.
