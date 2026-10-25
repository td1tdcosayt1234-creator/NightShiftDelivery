// Night Shift Delivery - Achievement System
// Track player progress and unlock badges

(function() {
  'use strict';

  window.ACHIEVEMENTS = {
    // First Steps
    firstBattery: {
      id: 'firstBattery',
      name: '⚡ Power Up',
      description: 'Collect your first battery',
      icon: '🔋',
      rarity: 'common'
    },
    firstLevel: {
      id: 'firstLevel',
      name: '📦 First Delivery',
      description: 'Complete Level 1',
      icon: '✅',
      rarity: 'common'
    },
    firstSwitch: {
      id: 'firstSwitch',
      name: '🌙 Phase Shifter',
      description: 'Switch between Day and Night',
      icon: '🔄',
      rarity: 'common'
    },

    // Zone Completions
    zone1Complete: {
      id: 'zone1Complete',
      name: '🎓 Training Complete',
      description: 'Finish all Zone 1 levels',
      icon: '🏆',
      rarity: 'uncommon'
    },
    zone2Complete: {
      id: 'zone2Complete',
      name: '⚠️ Hazard Master',
      description: 'Finish all Zone 2 levels',
      icon: '🏆',
      rarity: 'uncommon'
    },
    zone3Complete: {
      id: 'zone3Complete',
      name: '⏱️ Timing Expert',
      description: 'Finish all Zone 3 levels',
      icon: '🏆',
      rarity: 'rare'
    },
    zone4Complete: {
      id: 'zone4Complete',
      name: '🔥 Chaos Survivor',
      description: 'Finish all Zone 4 levels',
      icon: '🏆',
      rarity: 'rare'
    },
    zone5Complete: {
      id: 'zone5Complete',
      name: '😈 Nightmare Conqueror',
      description: 'Finish all Zone 5 levels',
      icon: '👑',
      rarity: 'legendary'
    },

    // Perfect Runs
    perfectZone1: {
      id: 'perfectZone1',
      name: '⭐ Perfect Training',
      description: 'Beat all par times in Zone 1',
      icon: '🌟',
      rarity: 'uncommon'
    },
    perfectZone2: {
      id: 'perfectZone2',
      name: '⭐ Perfect Hazards',
      description: 'Beat all par times in Zone 2',
      icon: '🌟',
      rarity: 'rare'
    },
    perfectZone3: {
      id: 'perfectZone3',
      name: '⭐ Perfect Timing',
      description: 'Beat all par times in Zone 3',
      icon: '🌟',
      rarity: 'rare'
    },
    perfectZone4: {
      id: 'perfectZone4',
      name: '⭐ Perfect Chaos',
      description: 'Beat all par times in Zone 4',
      icon: '🌟',
      rarity: 'epic'
    },
    perfectZone5: {
      id: 'perfectZone5',
      name: '⭐ Perfect Nightmare',
      description: 'Beat all par times in Zone 5',
      icon: '💫',
      rarity: 'legendary'
    },

    // Special Achievements
    speedDemon: {
      id: 'speedDemon',
      name: '⚡ Speed Demon',
      description: 'Complete any level in under 10 seconds',
      icon: '🚀',
      rarity: 'rare'
    },
    deathless: {
      id: 'deathless',
      name: '💚 Deathless',
      description: 'Complete 5 levels in a row without dying',
      icon: '💪',
      rarity: 'rare'
    },
    marathonRunner: {
      id: 'marathonRunner',
      name: '🏃 Marathon Runner',
      description: 'Complete 10 levels in one session',
      icon: '🎯',
      rarity: 'uncommon'
    },
    collector: {
      id: 'collector',
      name: '🔋 Battery Hoarder',
      description: 'Collect 100 batteries total',
      icon: '⚡',
      rarity: 'uncommon'
    },
    
    // Danger
    spikeAvoider: {
      id: 'spikeAvoider',
      name: '🗡️ Spike Dancer',
      description: 'Complete 5 spike-heavy levels without dying',
      icon: '💃',
      rarity: 'rare'
    },
    droneEvader: {
      id: 'droneEvader',
      name: '🤖 Ghost',
      description: 'Complete 5 drone levels without being caught',
      icon: '👻',
      rarity: 'rare'
    },
    gateRunner: {
      id: 'gateRunner',
      name: '🚪 Gate Crasher',
      description: 'Pass through 50 timed gates',
      icon: '⚡',
      rarity: 'uncommon'
    },

    // Master Achievements
    allLevelsComplete: {
      id: 'allLevelsComplete',
      name: '🎊 Delivery Master',
      description: 'Complete all 35 levels',
      icon: '👑',
      rarity: 'epic'
    },
    allStars: {
      id: 'allStars',
      name: '⭐ Star Collector',
      description: 'Get stars on all 35 levels',
      icon: '💫',
      rarity: 'legendary'
    },
    finalShift: {
      id: 'finalShift',
      name: '⚡ FINAL SHIFT ⚡',
      description: 'Beat Level 35',
      icon: '🔥',
      rarity: 'legendary'
    },
    perfectGame: {
      id: 'perfectGame',
      name: '💎 Absolute Perfection',
      description: 'Beat par time on every single level',
      icon: '👑',
      rarity: 'legendary'
    },

    // Fun Achievements
    nightOwl: {
      id: 'nightOwl',
      name: '🌙 Night Owl',
      description: 'Spend more time in Night mode',
      icon: '🦉',
      rarity: 'common'
    },
    sunWorshipper: {
      id: 'sunWorshipper',
      name: '☀️ Sun Worshipper',
      description: 'Spend more time in Day mode',
      icon: '🌞',
      rarity: 'common'
    },
    persistent: {
      id: 'persistent',
      name: '🔁 Never Give Up',
      description: 'Retry a level 10 times',
      icon: '💪',
      rarity: 'uncommon'
    },
    explorer: {
      id: 'explorer',
      name: '🗺️ Explorer',
      description: 'Try every level at least once',
      icon: '🧭',
      rarity: 'rare'
    }
  };

  // Achievement rarity colors
  window.ACHIEVEMENT_RARITY = {
    common: { color: '#9ca3af', glow: '#d1d5db' },
    uncommon: { color: '#10b981', glow: '#6ee7b7' },
    rare: { color: '#3b82f6', glow: '#93c5fd' },
    epic: { color: '#a855f7', glow: '#d8b4fe' },
    legendary: { color: '#f59e0b', glow: '#fcd34d' }
  };

  // Check if achievement is unlocked
  window.checkAchievement = function(achievementId, stats) {
    var ach = window.ACHIEVEMENTS[achievementId];
    if (!ach) return false;

    // Sets of level ids, tracked per level (not cumulative counters)
    var completed = stats.completedLevels || {};
    var starred = stats.starredLevels || {};
    var attempted = stats.attemptedLevels || {};

    function countIn(map, from, to) {
      var count = 0;
      for (var key in map) {
        var id = Number(key);
        if (id >= from && id <= to) count++;
      }
      return count;
    }

    function allCompletedIn(from, to) {
      for (var id = from; id <= to; id++) {
        if (!completed[id]) return false;
      }
      return true;
    }

    switch(achievementId) {
      case 'firstBattery':
        return stats.batteriesCollected >= 1;
      case 'firstLevel':
        return stats.levelsCompleted >= 1;
      case 'firstSwitch':
        return stats.modeSwitches >= 1;
      case 'zone1Complete':
        return allCompletedIn(1, 4);
      case 'zone2Complete':
        return allCompletedIn(5, 10);
      case 'zone3Complete':
        return allCompletedIn(11, 18);
      case 'zone4Complete':
        return allCompletedIn(19, 26);
      case 'zone5Complete':
        return allCompletedIn(27, 35);
      case 'speedDemon':
        // A recorded time of exactly 0 is real (and fast!) — do not treat it
        // as "never set" via a falsy check.
        return stats.fastestLevel != null && Number(stats.fastestLevel) < 10;
      case 'deathless':
        return stats.deathlessStreak >= 5;
      case 'marathonRunner':
        return stats.sessionLevels >= 10;
      case 'collector':
        return stats.totalBatteries >= 100;
      case 'spikeAvoider':
        return stats.spikeDeathlessStreak >= 5;
      case 'droneEvader':
        return stats.droneDeathlessStreak >= 5;
      case 'gateRunner':
        return stats.gatesPassed >= 50;
      case 'allLevelsComplete':
        return countIn(completed, 1, 35) >= 35;
      case 'allStars':
        return countIn(starred, 1, 35) >= 35;
      case 'finalShift':
        return stats.level35Complete === true;
      case 'perfectGame':
        return countIn(starred, 1, 35) >= 35;
      case 'perfectZone1':
        return countIn(starred, 1, 4) >= 4;
      case 'perfectZone2':
        return countIn(starred, 5, 10) >= 6;
      case 'perfectZone3':
        return countIn(starred, 11, 18) >= 8;
      case 'perfectZone4':
        return countIn(starred, 19, 26) >= 8;
      case 'perfectZone5':
        return countIn(starred, 27, 35) >= 9;
      case 'nightOwl':
        return (stats.nightModeTime || 0) > (stats.dayModeTime || 0);
      case 'sunWorshipper':
        return (stats.dayModeTime || 0) > (stats.nightModeTime || 0);
      case 'persistent':
        return stats.maxRetries >= 10;
      case 'explorer':
        return countIn(attempted, 1, 35) >= 35;
      default:
        return false;
    }
  };

  // Get all unlocked achievements
  window.getUnlockedAchievements = function(stats) {
    var unlocked = [];
    for (var id in window.ACHIEVEMENTS) {
      if (window.checkAchievement(id, stats)) {
        unlocked.push(window.ACHIEVEMENTS[id]);
      }
    }
    return unlocked;
  };

  // Get achievement progress percentage
  window.getAchievementProgress = function(stats) {
    var total = Object.keys(window.ACHIEVEMENTS).length;
    var unlocked = window.getUnlockedAchievements(stats).length;
    return Math.round((unlocked / total) * 100);
  };

})();
