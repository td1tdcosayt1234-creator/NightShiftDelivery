# Night Shift Delivery

A self-contained HTML5 puzzle game. Guide a courier robot through a neon city by switching Day and Night: blue paths are solid in Day; purple paths are solid at Night.

## Run

Open 'index.html' in a modern browser. It loads the active game code from 'game.js'. Keep both files in the same folder.

For a local web-server preview:

~~~powershell
python -m http.server 8765
~~~

Then open:

~~~text
http://localhost:8765
~~~

No package install, asset download, network connection, or build step is required.

## Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Move | Arrow keys or WASD | D-pad or swipe |
| Switch Day/Night | Space | Large Day/Night button |
| Restart | R | Restart icon |
| Pause | P | Pause icon |
| Sound | M | Sound icon |

## Included

- 18 handcrafted grid-puzzle levels
- Smooth difficulty progression: simple puzzles → spikes → patrol drones → timed gates → mixed final levels
- Keyboard, touch button, and swipe controls
- Pause, restart, level select, best-time tracking
- Per-level target times shown on the HUD, with a "target beaten!" verdict on the completion card
- Local progress save through localStorage
- Original Canvas-only art and generated Web Audio tones
- No external dependencies, remote assets, ads, account system, or outbound links

