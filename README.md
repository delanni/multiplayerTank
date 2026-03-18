# TanksOnCanvas

A local-multiplayer tank arena game played through the browser. One shared screen displays the game while each player joins from their own phone or tablet as a controller.

## How to play

1. Start the server with `node server.js`
2. Open `http://localhost:3000` in a browser on a shared screen (TV, laptop, projector)
3. Create a room — the room ID will appear in the address bar as `/play/{ID}`
4. On each player's phone or tablet, open the same address and enter the room ID to join
5. Customize your joystick layout and start playing

### Controls

Each player's phone acts as a touch-based gamepad with:

- **Joystick** — aim and rotate the tank
- **Thrust** — move forward
- **Fire** — shoot projectiles (hold to charge for more damage)
- **Shield** — deflect incoming shots

### Game rules

- Tanks start with 5 HP
- Getting hit costs 1 HP (+ the projectile's charge bonus)
- Killing another player awards +1 point
- After dying, you respawn at a random position after 3 seconds
- Shields can deflect projectiles but don't last forever

## Architecture

The project uses a **split viewer/controller** pattern:

```
Phone (Controller) ──socket.io──▶ Node.js Server ──socket.io──▶ Shared Screen (Viewer)
       input only                  message relay               runs full game simulation
```

**Viewer** (`/play/:id`) — runs the complete game loop: physics, collisions, rendering on a Canvas 2D element. This is the authoritative simulation.

**Controller** (`/control/:id`) — a touch-friendly mobile UI that sends player input (direction, thrust, fire, shield) to the server.

**Server** — a lightweight relay. It manages rooms and connections, forwarding controller inputs to all viewers via Socket.IO. It does not run any game logic itself.

### Networking

All communication goes through **Socket.IO** WebSockets. Key message types:

| Direction | Event | Purpose |
|---|---|---|
| Controller → Server → Viewer | `directionChange` | Joystick / aim input |
| Controller → Server → Viewer | `keypress` | Thrust, fire, shield |
| Controller → Server → Viewer | `updateInfo` | Name, color, avatar changes |
| Server → Controller | `welcome` | Connection acknowledgement |
| Server → Controller | `roomClosed` | Room no longer exists |
| Server → Viewer | `playerJoin` / `playerLeave` | Player roster updates |

### Room lifecycle

- A room is created on demand when the first viewer visits `/play/:id`
- Controllers join an existing room by its ID
- A room supports multiple viewers (spectators) and controllers (players)
- When the last viewer disconnects, the room is destroyed after a 10-second grace period
- The room list is available at `GET /roomList`

## Project structure

```
server.js                       Entry point — HTTP server + Socket.IO setup
config.js                       Runtime configuration

server/
  Connection.js                 Wraps a Socket.IO socket, assigns UUID and random name
  PlayController.js             Express routes for /play/:id
  ControllerController.js       Express routes for /control/:id

game/
  GameServer.js                 Manages all connections and rooms
  GameRoom.js                   Per-room state: viewer and controller lists
  Controller.js                 Server-side controller handler (relays input)
  Viewer.js                     Server-side viewer handler (relays events)

client/
  index.html                    Lobby / landing page
  js/view/
    GameWorld.js                Game loop, entity management, collision system
    Player.js                   Tank entity — movement, health, scoring
    Ball.js                     Projectile entity — charge, mass, lifetime
    Wall.js                     Static arena boundaries and obstacles
    Explosion.js                Particle effects on impact
  js/controller/
    ControllerModel.js          Controller state — name, color, button layout
    ControllerCanvas.js         Touch joystick rendering
  js/
    Vector.js                   2D vector math
    Helpers.js                  EventEmitter, mixins, utilities

views/
  play.html                     Viewer page template (EJS)
  control.html                  Controller page template (EJS)

util/
  Generators.js                 UUID and random name generation
  ArrayExtensions.js            Array helper methods
  MathExtensions.js             Math helper methods
  Tracing.js                    Debug tracing utilities
```

## Tech stack

- **Node.js** with **Express 3.x** and **EJS** templates
- **Socket.IO 0.9** for real-time WebSocket communication
- **AngularJS 1.x** on the client
- **Canvas 2D** for game rendering
- No database — all state is in-memory

## Install and run

```bash
npm install
node server.js
```

The server listens on port 3000 by default (configurable via `PORT` and `IP` environment variables).
