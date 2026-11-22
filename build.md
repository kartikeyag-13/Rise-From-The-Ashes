# Build a Browser-Based Drone Pick-and-Drop Game

Build a complete, polished, browser-playable drone pick-and-drop game for a hackathon. Do not merely create a prototype mockup or landing page. Build the actual playable game.

## 1. Core Concept

The player controls a flying drone, collects construction cargo from a pickup location, transports it and drops it at a designated construction target.

The game will eventually support three interchangeable visual themes:

- **Ancient Egypt:** A UFO-like flying craft transporting stone blocks to construct pyramids.
- **Ancient Greece:** A flying craft transporting construction materials to build Greek monuments, temples or the Colosseum-inspired arena.
- **Modern:** A conventional drone delivering cargo to modern construction sites.

For now, implement the entire game using simple, attractive placeholder visuals. The architecture must make replacing these visuals with theme-specific assets later extremely easy.

## 2. Tech Stack and Constraints

- Use a lightweight browser-native approach, preferably HTML, CSS and JavaScript, or the existing framework if the repository already has one.
- If the repository is empty, choose a minimal, lightweight setup.
- Use Canvas for the actual gameplay rendering.
- Avoid unnecessary libraries, backend servers, APIs, databases or complicated dependencies.
- The game must run directly in the browser and be deployable through GitHub Pages.
- Keep the code concise, modular, readable and maintainable.
- Do not overengineer.
- Do not generate excessive files or unnecessary abstractions.
- Inspect the existing repository before making changes. Preserve anything useful.

## 3. Gameplay

Create a 2D top-down game where the player controls a drone.

The player must:

1. Fly around the map.
2. Find the cargo pickup zone.
3. Position the drone above the cargo.
4. Pick up cargo using a pickup interaction.
5. Transport cargo while avoiding obstacles.
6. Deliver cargo to a designated construction/drop zone.
7. Earn points for successful deliveries.
8. Complete the level before the timer expires.

The game should feel like an actual game, not a static illustration with buttons.

### Game mechanics

- The drone moves in four directions.
- Movement should feel smooth and responsive.
- Use acceleration or slightly eased movement if it improves the experience.
- The drone should have a maximum movement speed.
- The drone should not be able to fly outside the map boundaries.
- Cargo can only be picked up when the drone is sufficiently close to it.
- Cargo must visibly attach to the drone once picked up.
- Cargo must be dropped at the correct designated delivery zone.
- Successful deliveries increase the score and update the construction progress.
- Once a delivery is completed, spawn or reveal the next cargo.
- Implement a finite number of deliveries per round, preferably 5.
- Give the player a clear win condition.
- Give the player a clear lose condition if the timer runs out.
- Add obstacles such as buildings, rocks or structures that the drone must navigate around.
- Collisions should be handled properly and should not make the game unplayable.
- Optionally penalize collisions or failed delivery attempts.

## 4. Controls

Implement keyboard controls:

- W / Arrow Up: Move up
- A / Arrow Left: Move left
- S / Arrow Down: Move down
- D / Arrow Right: Move right
- Space: Pick up or drop cargo when near the relevant location
- Escape: Pause the game

Display the controls on the game interface so the player knows how to play.

If practical, also provide basic touch controls for mobile.

## 5. Game Interface and Visual Design

Create an attractive, polished interface with a cohesive game aesthetic.

The interface should include:

- A game title.
- A start screen.
- A theme selection section with three selectable themes: Egypt, Greece and Modern.
- A playable game area.
- Score display.
- Countdown timer.
- Deliveries completed counter.
- Construction progress indicator.
- Pickup and drop-zone indicators.
- Pause functionality.
- Restart functionality.
- A game-over screen.
- A victory screen.
- Instructions and controls.

### Visual direction

Use a clean, slightly arcade-like aesthetic.

The game should have:

- A visually interesting map.
- Clear contrast between the drone, cargo, obstacles and target zones.
- Subtle animations.
- Smooth movement.
- Shadowing and depth where appropriate.
- Attractive UI panels and typography.
- A polished start menu and game-over overlays.
- A clear visual distinction between the active pickup point and the delivery point.
- A cargo attachment animation or visual effect.
- A delivery animation or particle effect if lightweight.

Use placeholder artwork constructed using Canvas shapes, gradients, simple SVGs or CSS. Avoid using random external image URLs.

Do not make the UI overly complicated, cluttered or excessively neon. Make it look like a small but polished hackathon game.

## 6. Theme System

Build a theme-switching system from the beginning.

Themes should be defined separately from gameplay logic. A theme should be able to control:

- Background.
- Ground and terrain appearance.
- Obstacles.
- Drone appearance.
- Cargo appearance.
- Pickup zone appearance.
- Drop zone appearance.
- Colors.
- Decorative elements.
- UI accent colors.
- Construction progress visuals.

For the initial implementation, create three placeholder themes:

### Egypt

- Sand-colored terrain.
- Desert atmosphere.
- Pyramid-inspired structures.
- Stone blocks as cargo.
- A UFO-inspired placeholder drone.
- A pyramid construction target.

### Greece

- Mediterranean-inspired terrain.
- Marble and stone color palette.
- Greek columns, ruins and temple-inspired structures.
- Marble blocks as cargo.
- A flying transport placeholder.
- A Greek monument construction target.

### Modern

- Contemporary construction-site aesthetic.
- Asphalt, concrete and industrial colors.
- Buildings, construction equipment-inspired obstacles.
- Construction crates as cargo.
- A conventional drone-inspired placeholder.
- A modern building construction target.

The theme should be switchable from the main menu without changing gameplay mechanics.

The actual artwork for all themes will be supplied later. Therefore, create a clean theme configuration or asset mapping system where placeholder graphics can be replaced with actual images, sprites or animations without modifying the physics, movement, collision or delivery logic.

## 7. Game Architecture

Keep the architecture simple but modular.

Separate, at minimum, the following responsibilities:

- Game loop and rendering.
- Player movement and drone state.
- Cargo pickup and delivery.
- Collision detection.
- Timer, score and game progression.
- Theme configuration.
- UI and game states.

Do not put the entire game into one giant function or file.

Use a reasonable, minimal file structure. Avoid creating dozens of files.

The game should use a consistent game state system, such as:

- MENU
- PLAYING
- PAUSED
- WON
- LOST

Make sure the game loop does not continue incorrectly when the game is paused, restarted or finished.

## 8. Game Balance

Create a reasonably sized map that can be navigated comfortably.

- Start with 5 deliveries.
- Give the player approximately 90–120 seconds to complete the round.
- Make movement fast enough that deliveries are achievable.
- Avoid making collisions excessively punishing.
- Make pickup and delivery zones easy to understand.
- Make the difficulty appropriate for a first-time player.

The game should be fun and playable within the first few seconds.

## 9. Technical Quality

- Ensure the game works without errors.
- Handle window resizing correctly.
- Keep Canvas rendering responsive.
- Prevent keyboard input from interfering with buttons or menu interactions.
- Ensure restarting resets all relevant game variables.
- Ensure pausing stops gameplay and the timer.
- Ensure theme changes properly update the visuals.
- Do not allow multiple game loops to run simultaneously.
- Ensure the game works locally and can be deployed from the repository.
- Do not leave TODOs in place of essential gameplay functionality.
- Do not implement fake buttons that do nothing.
- Do not use placeholder text in place of actual game mechanics.

## 10. Final Deliverable

Build the complete game in the repository.

After implementation:

1. Verify the project structure.
2. Run the project or perform available checks.
3. Fix any errors you find.
4. Make sure the game is genuinely playable.
5. Ensure the README contains concise instructions to run the game and its controls.
6. Keep the implementation as lean as possible while still delivering a polished experience.

Prioritize a functional, enjoyable, visually polished core game with a strong foundation for future theme-specific asset integration.

Do not stop after planning. Implement the actual game now.