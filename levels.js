// Night Shift Delivery - Level Definitions
// Every map row must be exactly 10 characters (COLS = 10).
// Legenda: # wall | . floor | S start | B battery | E exit | D day-only path |
//          N night-only path | ^ spikes | T timed gate | M drone rail marker
(function() {
  'use strict';

  function level(id, name, startMode, map, parTimeSeconds, hint, mobs, gate) {
    return {
      id: id,
      name: name,
      startMode: startMode,
      map: map,
      parTimeSeconds: parTimeSeconds,
      hint: hint,
      mobs: mobs || [],
      gate: gate || null
    };
  }

  window.LEVEL_DEFINITIONS = [
    // ───────────────────────── ZONE 1: TRAINING (1-4) ─────────────────────────
    level(1, 'First Delivery', 'day', [
      '##########',
      '#S...B.NE#',
      '##########',
      '##########',
      '##########',
      '##########',
      '##########',
      '##########'
    ], 12, 'Welcome courier! Grab battery, switch to Night, deliver!'),

    level(2, 'Blue Lane', 'night', [
      '##########',
      '#S......E#',
      '##.D.B.D##',
      '##########',
      '##########',
      '##########',
      '##########',
      '##########'
    ], 14, 'Blue paths appear only in Day mode. Phase shift!'),

    level(3, 'L-Turn', 'day', [
      '##########',
      '#S.D...B.#',
      '###.######',
      '#E.N.....#',
      '##########',
      '##########',
      '##########',
      '##########'
    ], 18, 'Navigate the corner using both modes.'),

    level(4, 'Double Switch', 'night', [
      '##########',
      '#S..B..D.#',
      '####N#####',
      '#.......E#',
      '####D#####',
      '#B.......#',
      '##########',
      '##########'
    ], 24, 'Two batteries! Master phase switching.'),

    // ───────────────────────── ZONE 2: HAZARDS (5-10) ─────────────────────────
    level(5, 'First Spike', 'day', [
      '##########',
      '#S.D...B.#',
      '####^.####',
      '#E....N..#',
      '##########',
      '##########',
      '##########',
      '##########'
    ], 22, 'Red spikes = death! Slip through the gap on the right of them.'),

    level(6, 'Spike Corridor', 'night', [
      '##########',
      '#S.N...B.#',
      '##^#.#^###',
      '#...D....#',
      '##^#.#^###',
      '#E.......#',
      '##########',
      '##########'
    ], 28, 'Navigate between spike walls carefully.'),

    level(7, 'Zigzag Path', 'day', [
      '##########',
      '#S..B....#',
      '##^.D.^###',
      '#....N...#',
      '##^...^###',
      '#E.......#',
      '##########',
      '##########'
    ], 30, 'Zigzag through the danger zone!'),

    level(8, 'First Drone', 'night', [
      '##########',
      '#S.N.B...#',
      '########D#',
      '#E....M..#',
      '##########',
      '##########',
      '##########',
      '##########'
    ], 36, 'Security drone! Wait for safe moment.', [{ x: 6, y: 3, axis: 'x', min: 5, max: 7, speed: 700, offset: 0 }]),

    level(9, 'Spike + Drone', 'day', [
      '##########',
      '#S.D..B..#',
      '##^.M.^###',
      '#.......N#',
      '##^.M.^###',
      '#E.......#',
      '##########',
      '##########'
    ], 40, 'Combine timing with safe navigation!', [{ x: 4, y: 2, axis: 'x', min: 3, max: 5, speed: 650, offset: 100 }]),

    level(10, 'Vertical Patrol', 'night', [
      '##########',
      '#S.N..B..#',
      '####M#####',
      '#....D...#',
      '####M#####',
      '#E.......#',
      '##########',
      '##########'
    ], 42, 'Drone moves up and down! Time it right.', [{ x: 4, y: 3, axis: 'y', min: 2, max: 4, speed: 600, offset: 0 }]),

    // ───────────────────────── ZONE 3: TIMING (11-18) ─────────────────────────
    level(11, 'X-Pattern', 'day', [
      '##########',
      '#S......B#',
      '##^.D.^###',
      '#...N....#',
      '##^...^###',
      '#B......E#',
      '##########',
      '##########'
    ], 45, 'Two batteries in X formation!'),

    level(12, 'First Gate', 'night', [
      '##########',
      '#S.N..B.T#',
      '#######T##',
      '#.......D#',
      '####T#####',
      '#E.......#',
      '##########',
      '##########'
    ], 48, 'Yellow gate blinks! Wait for BRIGHT = open.', [], { period: 2500, openFor: 1400, offset: 0 }),

    level(13, 'Diamond Hunt', 'day', [
      '##########',
      '#S..B....#',
      '###D#D####',
      '#..B.B..N#',
      '###.N.####',
      '#E.......#',
      '##########',
      '##########'
    ], 52, 'Three batteries in diamond shape!'),

    level(14, 'Gate Maze', 'night', [
      '##########',
      '#S.N.BT..#',
      '####^.####',
      '#....M.D.#',
      '####T#####',
      '#E.......#',
      '##########',
      '##########'
    ], 55, 'Two gates, one drone, spikes!', [{ x: 5, y: 3, axis: 'x', min: 4, max: 6, speed: 520, offset: 200 }], { period: 2200, openFor: 1200, offset: 0 }),

    level(15, 'Cross Roads', 'day', [
      '##########',
      '#S..B.M.B#',
      '####^.####',
      '#..D...N.#',
      '####M#####',
      '#E..B....#',
      '##########',
      '##########'
    ], 58, 'Three batteries, two drones crossing!', [
      { x: 6, y: 1, axis: 'x', min: 5, max: 7, speed: 500, offset: 0 },
      { x: 4, y: 3, axis: 'y', min: 2, max: 4, speed: 480, offset: 150 }
    ]),

    level(16, 'Spiral', 'night', [
      '##########',
      '#S.N...B.#',
      '##^###T###',
      '#....M.D.#',
      '##T###^###',
      '#E..B....#',
      '##########',
      '##########'
    ], 62, 'Spiral inward collecting batteries!', [{ x: 5, y: 3, axis: 'x', min: 4, max: 6, speed: 450, offset: 100 }], { period: 2000, openFor: 1050, offset: 200 }),

    level(17, 'H-Bridge', 'day', [
      '##########',
      '#S.D.B.M.#',
      '##^#T#^###',
      '#...TN...#',
      '##^#T#^###',
      '#E..B..M.#',
      '##########',
      '##########'
    ], 65, 'H-shaped danger zone! Cross the timed bridge.', [
      { x: 7, y: 1, axis: 'y', min: 1, max: 2, speed: 420, offset: 0 },
      { x: 7, y: 5, axis: 'y', min: 4, max: 5, speed: 430, offset: 180 }
    ], { period: 1900, openFor: 1000, offset: 150 }),

    level(18, 'Final Shift', 'night', [
      '##########',
      '#S.N.B.M.#',
      '##^#T#^###',
      '#..BM.D..#',
      '##^#T#^###',
      '#E..B.M..#',
      '##########',
      '##########'
    ], 70, 'Final challenge! Everything together!', [
      { x: 6, y: 1, axis: 'x', min: 5, max: 7, speed: 400, offset: 0 },
      { x: 4, y: 3, axis: 'x', min: 3, max: 5, speed: 390, offset: 150 },
      { x: 6, y: 5, axis: 'x', min: 5, max: 7, speed: 410, offset: 80 }
    ], { period: 1800, openFor: 920, offset: 100 }),

    // ───────────────────────── ZONE 4: CHAOS (19-26) ─────────────────────────
    level(19, 'Spike Plaza', 'day', [
      '##########',
      '#S.....B.#',
      '#.^..^...#',
      '#..^..D..#',
      '#.^....T.#',
      '#E..^.^.B#',
      '#.^..^...#',
      '##########'
    ], 75, 'Three drones sweep the plaza! Stay off their lanes.', [
      { x: 2, y: 3, axis: 'x', min: 1, max: 2, speed: 390, offset: 0 },
      { x: 4, y: 4, axis: 'x', min: 3, max: 5, speed: 380, offset: 120 },
      { x: 8, y: 3, axis: 'y', min: 1, max: 5, speed: 390, offset: 60 }
    ], { period: 2400, openFor: 900, offset: 0 }),

    level(20, 'Lane Watchers', 'night', [
      '##########',
      '#S..B....#',
      '#.^.##..^#',
      '#....^...#',
      '#.^.##..^#',
      '#E.....B.#',
      '##########',
      '##########'
    ], 78, 'Two vertical drones guard the side lanes. Wait them out!', [
      { x: 1, y: 2, axis: 'y', min: 2, max: 4, speed: 390, offset: 0 },
      { x: 7, y: 2, axis: 'y', min: 2, max: 4, speed: 380, offset: 150 }
    ]),

    level(21, 'Gate Quarter', 'day', [
      '##########',
      '#S..B....#',
      '#.##T##.##',
      '#.......B#',
      '#.##T##.##',
      '#E.......#',
      '##########',
      '##########'
    ], 82, 'Four drones on four lanes. Use the gate column!', [
      { x: 4, y: 1, axis: 'x', min: 2, max: 6, speed: 380, offset: 0 },
      { x: 5, y: 3, axis: 'x', min: 2, max: 7, speed: 340, offset: 200 },
      { x: 4, y: 5, axis: 'x', min: 2, max: 6, speed: 330, offset: 150 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 360, offset: 300 }
    ], { period: 2400, openFor: 850, offset: 0 }),

    level(22, 'Triple Rush', 'night', [
      '##########',
      '#S..B....#',
      '#.##T##.##',
      '#..B..^..#',
      '#.##T##.##',
      '#E.B.....#',
      '##########',
      '##########'
    ], 88, 'Three batteries under fire! Watch column 7.', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 370, offset: 0 },
      { x: 7, y: 3, axis: 'y', min: 1, max: 5, speed: 350, offset: 100 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 330, offset: 250 },
      { x: 5, y: 5, axis: 'x', min: 2, max: 7, speed: 310, offset: 300 }
    ], { period: 2200, openFor: 800, offset: 0 }),

    level(23, 'Spike Hive', 'day', [
      '##########',
      '#S..B....#',
      '#.^^T^^..#',
      '#........#',
      '#.^^^^^^.#',
      '#E...B...#',
      '##########',
      '##########'
    ], 92, 'Five drones patrol the hive. The gate is your shortcut.', [
      { x: 4, y: 4, axis: 'y', min: 3, max: 5, speed: 360, offset: 0 },
      { x: 8, y: 2, axis: 'y', min: 1, max: 3, speed: 340, offset: 150 },
      { x: 5, y: 3, axis: 'x', min: 2, max: 6, speed: 320, offset: 200 },
      { x: 7, y: 3, axis: 'y', min: 1, max: 5, speed: 300, offset: 80 },
      { x: 6, y: 1, axis: 'x', min: 2, max: 8, speed: 310, offset: 250 }
    ], { period: 2100, openFor: 760, offset: 0 }),

    level(24, 'Gate Gauntlet', 'night', [
      '##########',
      '#S..B....#',
      '#.##T##.##',
      '#..B..^..#',
      '#.##T##.##',
      '#E....B.B#',
      '##########',
      '##########'
    ], 98, 'Cross the double gates, dodge five stalkers!', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 340, offset: 0 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 330, offset: 150 },
      { x: 5, y: 3, axis: 'x', min: 2, max: 7, speed: 320, offset: 250 },
      { x: 4, y: 5, axis: 'x', min: 2, max: 6, speed: 310, offset: 100 },
      { x: 7, y: 3, axis: 'y', min: 1, max: 5, speed: 300, offset: 200 }
    ], { period: 2000, openFor: 750, offset: 0 }),

    level(25, 'Swarm Six', 'day', [
      '##########',
      '#S..B....#',
      '#.##T##.##',
      '#....B..^#',
      '#.##T##.##',
      '#E.B.....#',
      '##########',
      '##########'
    ], 105, 'Five drones! Strategy over speed — coordinate your route to avoid patrols.', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 310, offset: 0 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 300, offset: 150 },
      { x: 6, y: 3, axis: 'x', min: 4, max: 7, speed: 280, offset: 80 },
      { x: 7, y: 3, axis: 'y', min: 1, max: 5, speed: 290, offset: 200 },
      { x: 5, y: 5, axis: 'x', min: 2, max: 7, speed: 270, offset: 100 }
    ], { period: 1950, openFor: 750, offset: 50 }),

    level(26, 'Chaos Gate', 'night', [
      '##########',
      '#S..B..^.#',
      '#.##T##.##',
      '#..B.T.B.#',
      '#.##T##.##',
      '#E.....B.#',
      '##########',
      '##########'
    ], 115, 'Zone 4 finale: five drones, one relentless gate — plan your path around the columns.', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 6, speed: 260, offset: 0 },
      { x: 3, y: 3, axis: 'y', min: 2, max: 4, speed: 270, offset: 120 },
      { x: 6, y: 3, axis: 'x', min: 3, max: 7, speed: 250, offset: 220 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 280, offset: 60 },
      { x: 6, y: 5, axis: 'x', min: 3, max: 7, speed: 240, offset: 180 }
    ], { period: 1900, openFor: 660, offset: 80 }),

    // ──────────────────────── ZONE 5: NIGHTMARE (27-35) ───────────────────────
    level(27, 'Nightmare Begins', 'day', [
      '##########',
      '#S..B....#',
      '####T#####',
      '#.B....B.#',
      '####T#####',
      '#E.....^.#',
      '##########',
      '##########'
    ], 125, 'Zone 5. Seven drones and chained gates. Strategic timing gets you through.', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 250, offset: 0 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 260, offset: 150 },
      { x: 5, y: 3, axis: 'x', min: 2, max: 7, speed: 240, offset: 80 },
      { x: 7, y: 3, axis: 'y', min: 2, max: 4, speed: 250, offset: 160 },
      { x: 4, y: 5, axis: 'x', min: 2, max: 5, speed: 230, offset: 0 },
      { x: 8, y: 2, axis: 'y', min: 1, max: 3, speed: 240, offset: 100 },
      { x: 3, y: 3, axis: 'y', min: 2, max: 4, speed: 260, offset: 120 }
    ], { period: 1750, openFor: 620, offset: 80 }),

    level(28, 'Gate Sprint', 'night', [
      '##########',
      '#S..B..B.#',
      '####T#####',
      '#....B...#',
      '####T#####',
      '#E.....^.#',
      '##########',
      '##########'
    ], 132, 'Same gates, shorter breath. Time your jumps through the columns to avoid the drones.', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 240, offset: 0 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 250, offset: 150 },
      { x: 5, y: 3, axis: 'x', min: 2, max: 7, speed: 230, offset: 80 },
      { x: 7, y: 3, axis: 'y', min: 2, max: 4, speed: 240, offset: 160 },
      { x: 4, y: 5, axis: 'x', min: 2, max: 5, speed: 220, offset: 0 },
      { x: 8, y: 2, axis: 'y', min: 1, max: 3, speed: 230, offset: 100 },
      { x: 3, y: 3, axis: 'y', min: 2, max: 4, speed: 250, offset: 120 }
    ], { period: 1700, openFor: 580, offset: 80 }),

    level(29, 'Spike Storm', 'day', [
      '##########',
      '#S.B...B.#',
      '####T#####',
      '#..B..^^.#',
      '####T#####',
      '#E.....^.#',
      '##########',
      '##########'
    ], 140, 'Eight drones and one safe door per lane! Reduce drone density for more accessible gameplay.', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 220, offset: 0 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 230, offset: 150 },
      { x: 5, y: 3, axis: 'x', min: 2, max: 6, speed: 210, offset: 80 },
      { x: 8, y: 2, axis: 'y', min: 1, max: 5, speed: 215, offset: 100 },
      { x: 4, y: 5, axis: 'x', min: 2, max: 5, speed: 200, offset: 0 },
      { x: 3, y: 3, axis: 'y', min: 2, max: 4, speed: 225, offset: 120 },
      { x: 7, y: 3, axis: 'y', min: 2, max: 4, speed: 220, offset: 180 },
      { x: 6, y: 5, axis: 'x', min: 5, max: 6, speed: 210, offset: 60 }
    ], { period: 1550, openFor: 560, offset: 300 }),

    level(30, 'Midnight Rush', 'night', [
      '##########',
      '#S..B..B.#',
      '####T#####',
      '#..B...B.#',
      '####T#####',
      '#E.....^.#',
      '##########',
      '##########'
    ], 148, 'Triple batteries. Eight hunters. Shorter doors every level!', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 215, offset: 0 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 225, offset: 150 },
      { x: 6, y: 3, axis: 'x', min: 2, max: 7, speed: 205, offset: 80 },
      { x: 8, y: 2, axis: 'y', min: 1, max: 5, speed: 210, offset: 100 },
      { x: 4, y: 5, axis: 'x', min: 2, max: 5, speed: 195, offset: 0 },
      { x: 3, y: 3, axis: 'y', min: 2, max: 4, speed: 220, offset: 120 },
      { x: 7, y: 3, axis: 'y', min: 2, max: 4, speed: 215, offset: 180 },
      { x: 6, y: 5, axis: 'x', min: 5, max: 6, speed: 205, offset: 60 }
    ], { period: 1450, openFor: 540, offset: 120 }),

    level(31, 'Drone Cyclone', 'day', [
      '##########',
      '#S..B..B.#',
      '####T#####',
      '#..B..^^.#',
      '####T#####',
      '#E.......#',
      '##########',
      '##########'
    ], 155, 'A cyclone of nine drones spins around you!', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 200, offset: 0 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 210, offset: 150 },
      { x: 6, y: 3, axis: 'x', min: 2, max: 7, speed: 190, offset: 80 },
      { x: 8, y: 2, axis: 'y', min: 1, max: 5, speed: 195, offset: 100 },
      { x: 4, y: 5, axis: 'x', min: 2, max: 7, speed: 180, offset: 0 },
      { x: 3, y: 3, axis: 'y', min: 2, max: 4, speed: 205, offset: 120 },
      { x: 7, y: 3, axis: 'y', min: 2, max: 4, speed: 200, offset: 180 },
      { x: 6, y: 5, axis: 'x', min: 5, max: 7, speed: 190, offset: 60 },
      { x: 2, y: 3, axis: 'y', min: 2, max: 4, speed: 215, offset: 40 }
    ], { period: 1350, openFor: 480, offset: 200 }),

    level(32, 'Battery Vault', 'night', [
      '##########',
      '#S..B..B.#',
      '####T#####',
      '#..B...B.#',
      '####T#####',
      '#E......^#',
      '##########',
      '##########'
    ], 162, 'Four batteries. Nine drones. Tiniest doors yet.', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 190, offset: 0 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 200, offset: 150 },
      { x: 6, y: 3, axis: 'x', min: 2, max: 7, speed: 180, offset: 80 },
      { x: 8, y: 2, axis: 'y', min: 1, max: 5, speed: 185, offset: 100 },
      { x: 4, y: 5, axis: 'x', min: 2, max: 7, speed: 170, offset: 0 },
      { x: 3, y: 3, axis: 'y', min: 2, max: 4, speed: 195, offset: 120 },
      { x: 7, y: 3, axis: 'y', min: 2, max: 4, speed: 190, offset: 180 },
      { x: 6, y: 5, axis: 'x', min: 5, max: 7, speed: 180, offset: 60 },
      { x: 2, y: 3, axis: 'y', min: 2, max: 4, speed: 205, offset: 40 }
    ], { period: 1250, openFor: 460, offset: 100 }),

    level(33, 'Hyperspeed', 'day', [
      '##########',
      '#S..B..B.#',
      '####T#####',
      '#..B...B^#',
      '####T#####',
      '#E...^.^.#',
      '##########',
      '##########'
    ], 170, 'Ten drones at hyperspeed. Breathe between the gates.', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 160, offset: 0 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 170, offset: 150 },
      { x: 6, y: 3, axis: 'x', min: 2, max: 6, speed: 150, offset: 80 },
      { x: 8, y: 2, axis: 'y', min: 1, max: 5, speed: 155, offset: 100 },
      { x: 4, y: 5, axis: 'x', min: 2, max: 5, speed: 140, offset: 0 },
      { x: 3, y: 3, axis: 'y', min: 2, max: 4, speed: 165, offset: 120 },
      { x: 7, y: 3, axis: 'y', min: 2, max: 4, speed: 160, offset: 180 },
      { x: 6, y: 5, axis: 'x', min: 5, max: 7, speed: 150, offset: 60 },
      { x: 2, y: 3, axis: 'y', min: 2, max: 4, speed: 175, offset: 40 },
      { x: 5, y: 3, axis: 'x', min: 2, max: 5, speed: 160, offset: 300 }
    ], { period: 1050, openFor: 430, offset: 150 }),

    level(34, 'Spike Monsoon', 'night', [
      '##########',
      '#S..B..B.#',
      '####T#####',
      '#..B...B^#',
      '####T#####',
      '#E.......#',
      '##########',
      '##########'
    ], 175, 'Monsoon of spikes and drones at near-instant reflex!', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 130, offset: 0 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 140, offset: 150 },
      { x: 6, y: 3, axis: 'x', min: 2, max: 6, speed: 120, offset: 80 },
      { x: 8, y: 2, axis: 'y', min: 1, max: 5, speed: 125, offset: 100 },
      { x: 4, y: 5, axis: 'x', min: 2, max: 5, speed: 110, offset: 0 },
      { x: 3, y: 3, axis: 'y', min: 2, max: 4, speed: 135, offset: 120 },
      { x: 7, y: 3, axis: 'y', min: 2, max: 4, speed: 130, offset: 180 },
      { x: 6, y: 5, axis: 'x', min: 5, max: 7, speed: 120, offset: 60 },
      { x: 2, y: 3, axis: 'y', min: 2, max: 4, speed: 145, offset: 40 },
      { x: 5, y: 3, axis: 'x', min: 2, max: 5, speed: 130, offset: 300 },
      { x: 4, y: 3, axis: 'y', min: 2, max: 4, speed: 140, offset: 220 }
    ], { period: 900, openFor: 380, offset: 100 }),

    level(35, 'FINAL SHIFT', 'night', [
      '##########',
      '#S..B..B.#',
      '####T#####',
      '#..B...B^#',
      '####T#####',
      '#E.......#',
      '##########',
      '##########'
    ], 180, 'FINAL SHIFT! Twelve ultra-fast drones. Only legends deliver this.', [
      { x: 5, y: 1, axis: 'x', min: 2, max: 7, speed: 80, offset: 0 },
      { x: 1, y: 3, axis: 'y', min: 2, max: 4, speed: 70, offset: 150 },
      { x: 6, y: 3, axis: 'x', min: 2, max: 6, speed: 60, offset: 80 },
      { x: 8, y: 2, axis: 'y', min: 1, max: 5, speed: 65, offset: 100 },
      { x: 4, y: 5, axis: 'x', min: 2, max: 5, speed: 85, offset: 0 },
      { x: 3, y: 3, axis: 'y', min: 2, max: 4, speed: 90, offset: 120 },
      { x: 7, y: 3, axis: 'y', min: 2, max: 4, speed: 75, offset: 180 },
      { x: 6, y: 5, axis: 'x', min: 5, max: 7, speed: 95, offset: 60 },
      { x: 2, y: 3, axis: 'y', min: 2, max: 4, speed: 110, offset: 40 },
      { x: 5, y: 3, axis: 'x', min: 2, max: 5, speed: 100, offset: 300 },
      { x: 6, y: 1, axis: 'x', min: 6, max: 8, speed: 105, offset: 200 },
      { x: 3, y: 5, axis: 'x', min: 3, max: 4, speed: 90, offset: 260 }
    ], { period: 800, openFor: 300, offset: 0 }),
  ];

  window.ZONE_THEMES = {
    1: { name: 'Training', bg: '#101d46', accent: '#4a8fff', glow: '#72c1ff' },
    2: { name: 'Hazards', bg: '#1d1046', accent: '#8f4aff', glow: '#b872ff' },
    3: { name: 'Timing', bg: '#46101d', accent: '#ff4a8f', glow: '#ff72b8' },
    4: { name: 'Chaos', bg: '#462a10', accent: '#ffa54a', glow: '#ffcf72' },
    5: { name: 'Nightmare', bg: '#2b0f3f', accent: '#c312f0', glow: '#e879ff' }
  };

})();
