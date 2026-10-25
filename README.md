# Night Shift Delivery 🌙📦

A challenging HTML5 puzzle game where you deliver packages by switching between Day and Night modes while avoiding hazards and timing your moves perfectly.

## 🎮 Game Features

### Core Mechanics
- **Day/Night Mode Switching**: Toggle between two different path networks
- **Battery Collection**: Collect all batteries before reaching the exit
- **Phase Paths**: Blue paths (Day) and Purple paths (Night) only exist in their respective modes

### Hazards & Obstacles
- **🔺 Spikes**: Red danger tiles that restart the level
- **🤖 Patrol Drones**: Moving enemies that patrol horizontal and vertical rails
- **⚡ Timed Gates**: Yellow gates that open and close on a timer
- **Multiple Enemy Types**: Up to 12 drones in advanced levels!

## 🎯 35 Challenging Levels Across 5 Zones

### ZONE 1: Training (Levels 1-4)
Learn the basic Day/Night switching mechanics and path navigation.

### ZONE 2: Hazards (Levels 5-10)
Introduction to spikes and patrol drones. Learn timing and danger avoidance.
- Static spike obstacles
- Basic horizontal and vertical drones
- Combined spike + drone challenges

### ZONE 3: Timing (Levels 11-18)
Master timing with gates and complex drone patterns.
- Timed gates with various opening/closing cycles
- Multiple drones with coordinated patrols
- Advanced combinations of all hazards

### ZONE 4: Chaos (Levels 19-26)
Multiple enemies, faster timing, and complex patterns.
- 3-6 drones per level with intricate patrol patterns
- Faster gates with shorter opening windows
- Dense spike mazes
- Requires perfect timing and planning

### ZONE 5: Nightmare (Levels 27-35)
The ultimate endgame challenge for expert players.
- 8-12 ultra-fast drones per level
- Extremely short gate windows (300-580ms openings)
- Maximum spike density
- Multiple batteries to collect
- Only the most skilled players can complete these levels!

## 🌟 Progression System

- **Progressive Unlocking**: Complete levels to unlock the next
- **Par Times**: Beat target times to earn stars ★
- **Best Times**: Your fastest completion saved for each level
- **Level Select**: Return to any unlocked level with zone organization

## 🎮 Controls

### Keyboard
- **Arrow Keys** or **WASD**: Move courier
- **Space**: Switch between Day/Night mode
- **R**: Restart current level
- **P**: Pause game
- **M**: Toggle sound

### Touch/Mouse
- **D-Pad Buttons**: Move courier
- **Mode Button**: Switch between Day/Night
- **Swipe on Board**: Quick directional movement
- **Utility Buttons**: Restart, Pause, Sound
- **🛠 DEV Button** (top-left of the board): opens the level select with **every level unlocked** — click any level to test it instantly

## 🎨 Visual Features

- Beautiful cyberpunk aesthetic with day/night color themes
- Animated rain effects
- Smooth transitions and visual feedback
- Clear hazard indicators
- Responsive design for all screen sizes

## 🚀 Difficulty Curve

The game progressively introduces new mechanics:
1. **Basic movement** and phase switching
2. **Static hazards** (spikes)
3. **Moving enemies** (drones)
4. **Timing mechanics** (gates)
5. **Complex combinations** of all systems
6. **Speed and density increases** in nightmare levels

By Level 35, you'll face:
- 12 simultaneous patrol drones moving at high speed
- Gates with only 300ms opening windows
- Dense spike formations
- Multiple batteries to collect
- 180 second par time challenge

## 💡 Strategy Tips

1. **Study the level** before moving - observe drone patterns and gate timing
2. **Wait on safe tiles** - don't rush into danger
3. **Plan your route** - sometimes the long way is safer
4. **Use mode switches strategically** - but only from stable ground!
5. **Learn enemy patterns** - drones move in predictable loops
6. **Master gate timing** - watch for the bright yellow opening
7. **Practice makes perfect** - replay levels to improve your times

## 🏆 Achievements

- Complete all 35 levels
- Beat all par times to earn gold stars
- Master the FINAL SHIFT (Level 35) - the ultimate test!

## 🔧 Technical Features

- Pure vanilla JavaScript implementation
- HTML5 Canvas rendering
- Responsive design
- LocalStorage for save progress
- Web Audio API for sound effects
- Level validation system
- CrazyGames SDK integration
- Accessibility features (ARIA labels, keyboard support)

## 🚀 Run the Game

Open `index.html` in a modern browser. No installation required!

For local development server:

```powershell
python -m http.server 8765
```

Then open: `http://localhost:8765`

---

**Can you complete all 35 levels and master the Night Shift? Good luck, courier!** 🌙✨
