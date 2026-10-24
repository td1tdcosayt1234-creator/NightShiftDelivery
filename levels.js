// Night Shift Delivery - Level Definitions
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
      '###.#####',
      '#E.N.....#',
      '##########',
      '##########',
      '##########',
      '##########'
    ], 18, 'Navigate the corner using both modes.'),
    
    level(4, 'Double Switch', 'night', [
      '##########',
      '#S..B..D.#',
      '####N####',
      '#.......E#',
      '####D####',
      '#B.......#',
      '##########',
      '##########'
    ], 24, 'Two batteries! Master phase switching.'),

    level(5, 'First Spike', 'day', [
      '##########',
      '#S.D...B.#',
      '####^####',
      '#E....N..#',
      '##########',
      '##########',
      '##########',
      '##########'
    ], 22, 'Red spikes = death! Find safe route.'),
    
    level(6, 'Spike Corridor', 'night', [
      '##########',
      '#S.N...B.#',
      '##^###^##',
      '#...D....#',
      '##^###^##',
      '#E.......#',
      '##########',
      '##########'
    ], 28, 'Navigate between spike walls carefully.'),
    
    level(7, 'Zigzag Path', 'day', [
      '##########',
      '#S..B....#',
      '##^.D.^##',
      '#....N...#',
      '##^...^##',
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
      '##^#M#^##',
      '#.......N#',
      '##^###^##',
      '#E.......#',
      '##########',
      '##########'
    ], 40, 'Combine timing with safe navigation!', [{ x: 4, y: 2, axis: 'x', min: 3, max: 5, speed: 650, offset: 100 }]),
    
    level(10, 'Vertical Patrol', 'night', [
      '##########',
      '#S.N..B..#',
      '####M####',
      '#....D...#',
      '####M####',
      '#E.......#',
      '##########',
      '##########'
    ], 42, 'Drone moves up and down! Time it right.', [{ x: 4, y: 3, axis: 'y', min: 2, max: 4, speed: 600, offset: 0 }]),

    level(11, 'X-Pattern', 'day', [
      '##########',
      '#S......B#',
      '##^.D.^##',
      '#...N....#',
      '##^...^##',
      '#B......E#',
      '##########',
      '##########'
    ], 45, 'Two batteries in X formation!'),
    
    level(12, 'First Gate', 'night', [
      '##########',
      '#S.N..B.T#',
      '##########',
      '#.......D#',
      '##########',
      '#E.......#',
      '##########',
      '##########'
    ], 48, 'Yellow gate blinks! Wait for BRIGHT = open.', [], { period: 2500, openFor: 1400, offset: 0 }),
    
    level(13, 'Diamond Hunt', 'day', [
      '##########',
      '#S..B....#',
      '###D#D###',
      '#..B.B..N#',
      '###.N.###',
      '#E.......#',
      '##########',
      '##########'
    ], 52, 'Three batteries in diamond shape!'),
    
    level(14, 'Gate Maze', 'night', [
      '##########',
      '#S.N.BT..#',
      '####^####',
      '#....M.D.#',
      '####T####',
      '#E.......#',
      '##########',
      '##########'
    ], 55, 'Two gates, one drone, spikes!', [{ x: 5, y: 3, axis: 'x', min: 4, max: 6, speed: 520, offset: 200 }], { period: 2200, openFor: 1200, offset: 0 }),
    
    level(15, 'Cross Roads', 'day', [
      '##########',
      '#S..B.M.B#',
      '####^####',
      '#..D...N.#',
      '####M####',
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
      '##^###T##',
      '#....M.D.#',
      '##T###^##',
      '#E..B....#',
      '##########',
      '##########'
    ], 62, 'Spiral inward collecting batteries!', [{ x: 5, y: 3, axis: 'x', min: 4, max: 6, speed: 450, offset: 100 }], { period: 2000, openFor: 1050, offset: 200 }),
    
    level(17, 'H-Bridge', 'day', [
      '##########',
      '#S.D.B.M.#',
      '##^#^#^##',
      '#...TN...#',
      '##^#^#^##',
      '#E..B..M.#',
      '##########',
      '##########'
    ], 65, 'H-shaped danger zone! Navigate the bridge.', [
      { x: 7, y: 1, axis: 'y', min: 1, max: 2, speed: 420, offset: 0 },
      { x: 7, y: 5, axis: 'y', min: 4, max: 5, speed: 430, offset: 180 }
    ], { period: 1900, openFor: 1000, offset: 150 }),
    
    level(18, 'Final Shift', 'night', [
      '##########',
      '#S.N.B.M.#',
      '##^#T#^##',
      '#..BM.D..#',
      '##^#T#^##',
      '#E..B.M..#',
      '##########',
      '##########'
    ], 70, 'Final challenge! Everything together!', [
      { x: 6, y: 1, axis: 'x', min: 5, max: 7, speed: 400, offset: 0 },
      { x: 4, y: 3, axis: 'x', min: 3, max: 5, speed: 390, offset: 150 },
      { x: 6, y: 5, axis: 'x', min: 5, max: 7, speed: 410, offset: 80 }
    ], { period: 1800, openFor: 920, offset: 100 })
  ];

  window.ZONE_THEMES = {
    1: { name: 'Training', bg: '#101d46', accent: '#4a8fff', glow: '#72c1ff' },
    2: { name: 'Hazards', bg: '#1d1046', accent: '#8f4aff', glow: '#b872ff' },
    3: { name: 'Timing', bg: '#46101d', accent: '#ff4a8f', glow: '#ff72b8' }
  };

})();
