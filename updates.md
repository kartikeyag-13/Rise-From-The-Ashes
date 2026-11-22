You are upgrading an existing single-file HTML5 Canvas browser game (index.html in this repo, vanilla JS, no libraries) for a 2-hour vibe-coding competition. Brief: "browser game where the player flies a drone, picks up cargo and drops it at a target; must have a controlled drone, cargo + drop place, a goal (score/timer/win-lose), runs in browser straight from the repo."

KEEP the existing engine: drone flight physics (thrust, gravity, drag, hover assist), the swinging rope/tether cargo physics, hook/drop with SPACE, gentle-drop scoring (hard drop = cargo breaks, soft drop = PERFECT +50), particles, popups, Web Audio synth sounds, touch controls, canvas scaling. Refactor so that each WORLD is a data/config object plus its own draw functions (background, obstacles, drone skin, cargo, structure, win ending, lose ending). Keep it ONE index.html, with no external libraries and no external image/audio files. Draw everything procedurally on canvas, aiming for a polished, aesthetic look with gradients, glow (shadowBlur), parallax layers and smooth animation. Use the attached inspiration images ONLY as style reference for palette, mood and shapes. Do not copy them pixel-for-pixel.

=== GAME FLOW ===
Title screen → World select (4 large animated cards with a preview of each world's background and skin) → Play → Ending cinematic → Results (score, best score saved in localStorage per world, buttons: Retry / World Select).
Controls: arrows/WASD to fly, SPACE hook/drop, P pause, M mute, ESC back to menu.

=== CORE LOOP (all worlds) ===
- Cargo spawns at a pickup point on the left. Player hooks it, flies it to the build site on the right, and drops it gently.
- Each successful delivery adds one visible piece to a STRUCTURE that grows on screen (animate the piece snapping into place with a glow + particle burst + sound).
- Structure needs 6 deliveries to complete. HUD: world name, score, structure progress bar (x/6), lives as 3 world-themed icons, timer (count up, used for score bonus), wind indicator.
- Obstacles move (patterns differ per world). Hitting an obstacle, the water/ground, or dropping cargo too hard costs ONE LIFE: short hit effect (screen shake, flash, drone blinks invulnerable 1.5s, respawn at pickup, current cargo lost).
- 3 lives per world. Only when ALL 3 lives are lost → play that world's dramatic LOSE cinematic → "GAME OVER".
- Completing the structure → play that world's dramatic WIN cinematic → "COMPLETE".
- Cinematics: 4–6 seconds, input disabled, letterbox bars slide in, camera zoom (ctx.scale toward the focus point), slow motion, big title text fade-in at the end.
- Difficulty: obstacles speed up slightly with each delivery.

=== WORLD 1: GREEK MYTHOLOGY ===
- Look: golden-hour sky (peach → gold → soft blue), blazing sun with glow, white marble cliffs, Greek temples with columns in parallax, Aegean sea at the bottom with animated waves.
- Drone skin: ICARUS. A figure with large feathered wax wings that flap based on thrust (feathers drawn individually, cream/white with gold tips).
- Cargo: marble tower blocks (white stone with carved lines).
- Structure: a marble tower with columns that rises block by block, golden cap on the final block.
- Obstacles: flying lightning bolts from Zeus clouds, swooping eagles, rolling clouds. Flying too close to the sun (top of screen) also costs a life.
- WIN: Icarus does joyful loops/circles in the sky around the finished tower, golden sparkles, the sun pulses, text "THE TOWER STANDS".
- LOSE (3 lives gone): the wings' wax melts (dripping wax particles, feathers detach and flutter away), Icarus spirals and falls into the sea with a big splash, text "THE WAX HAS MELTED".

=== WORLD 2: ANCIENT EGYPT ===
- Look: desert dusk (deep orange → purple), huge setting sun, sand dunes in parallax, palm trees, Nile at the bottom, drifting sand particles.
- Drone skin: UFO. A silver saucer with a glass dome, rotating rim lights and a tractor-beam glow under it (the beam shows when cargo is hooked; the rope becomes a beam).
- Cargo: sandstone pyramid blocks.
- Structure: a pyramid built layer by layer, golden capstone on the last delivery.
- Obstacles: sandstorm gusts (strong wind bursts), flying scarab swarms, rising sand tornadoes, obelisks.
- WIN: the pyramid glows gold, the UFO slowly fades/beams away into the sky, little pharaoh figures appear and celebrate (jumping, arms up), fireworks of sand and gold, text "THE PYRAMID IS COMPLETE".
- LOSE: a giant MUMMY monster rises from the sand (bandaged, glowing eyes), grabs the UFO and pulls it under the sand while the screen shakes, text "THE MUMMY HAS FEASTED".

=== WORLD 3: MAGICAL SEAS ===
- Look: twilight fantasy sky (violet, teal, pink nebula), floating islands, glowing stars, magical sparkles, a dark sea with shimmering reflections.
- Drone skin: a MAGICAL FLYING SHIP. A wooden galleon with glowing sails, a sparkle trail behind it, and tiny wings or balloons.
- Cargo: sacks/bars of glowing gold.
- Drop site: an open treasure CHEST on an island; gold visibly piles up inside it with each delivery.
- Obstacles: floating cannonballs fired from distant ships, flying jellyfish/spirits, sea serpents leaping out of the water.
- WIN: the chest bursts open, gold coins and gems explode everywhere (lots of colorful gem particles, coin spin animation), sparkles fill the screen, text "TREASURE SECURED".
- LOSE: a big dark PIRATE SHIP sails in, fires a cannon broadside (flashes, cannonballs), the magic ship breaks apart into planks and sinks, text "SUNK BY PIRATES".

=== WORLD 4: DEEP SPACE (cinematic, inspired by sci-fi space films) ===
- Look: deep space, starfield with parallax, colorful nebula, a distant spinning wormhole, a huge black hole with a glowing accretion disk in the background, a ringed planet. Low gravity (reduce gravity by ~40% and give the drone floatier, drifting physics).
- Drone skin: an ASTRONAUT in a white suit with a gold visor and a jetpack with a thruster flame.
- Cargo: glowing pink/red heart fragments (energy crystals).
- Structure: a giant HEART outline on the right that fills up piece by piece and glows brighter with each delivery.
- Obstacles: drifting and spinning asteroids of different sizes, debris and satellites. Hitting one costs a life.
- WIN: the heart fully lights up and pulses, a second astronaut (the lover) floats in from the other side, the two meet and hold hands in front of the heart, stars sparkle, text "LOVE TRANSCENDS SPACE AND TIME".
- LOSE: the black hole grows and pulls the astronaut in (spaghettification stretch, spiral rotation, light bending/warping effect), the screen fades to black, text "LOST TO THE VOID".

=== POLISH ===
- Each world has its own synthesized background ambience/music loop (simple Web Audio arpeggio or drone in a matching scale) and themed SFX.
- Smooth fade transitions between screens.
- Make sure 60fps performance: precompute static background layers to offscreen canvases.
- No console errors. Test every world: win path, lose path, life loss, retry, world select.

BUILD ORDER (commit after each step):
1) Refactor into the world system + menus + lives + structure progress (use World 1 as the first world).
2) Greek world fully with both cinematics.
3) Egypt. 4) Magical. 5) Space.
6) Polish + README update describing the 4 worlds, controls, and features.
Work step by step and keep the game playable after every step.