/**
 * Clash of Clans Town Hall Benchmarks & Level Calibrations
 * Maps troops, spells, and siege machines to their maximum Laboratory research caps per Town Hall.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CocBenchmarks = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const TROOP_BENCHMARKS = {
    // Regular Elixir Troops
    'Barbarian': {
      unlockTH: 1,
      maxLevels: { 1:1, 2:2, 3:2, 4:2, 5:3, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:9, 13:9, 14:10, 15:11, 16:12, 17:12, 18:13 }
    },
    'Archer': {
      unlockTH: 1,
      maxLevels: { 1:1, 2:1, 3:2, 4:2, 5:3, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:9, 13:9, 14:10, 15:11, 16:12, 17:13, 18:14 }
    },
    'Giant': {
      unlockTH: 2,
      maxLevels: { 2:1, 3:1, 4:2, 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:9, 13:10, 14:10, 15:11, 16:12, 17:13, 18:14 }
    },
    'Goblin': {
      unlockTH: 2,
      maxLevels: { 2:1, 3:2, 4:2, 5:3, 6:3, 7:4, 8:5, 9:6, 10:7, 11:7, 12:8, 13:8, 14:8, 15:9, 16:9, 17:10, 18:10 }
    },
    'Wall Breaker': {
      unlockTH: 3,
      maxLevels: { 3:1, 4:2, 5:2, 6:3, 7:4, 8:5, 9:5, 10:6, 11:7, 12:8, 13:9, 14:10, 15:11, 16:12, 17:13, 18:13 }
    },
    'Balloon': {
      unlockTH: 4,
      maxLevels: { 4:2, 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:9, 13:10, 14:11, 15:12, 16:13, 17:13, 18:13 }
    },
    'Wizard': {
      unlockTH: 5,
      maxLevels: { 5:2, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:9, 13:10, 14:11, 15:12, 16:13, 17:13, 18:14 }
    },
    'Healer': {
      unlockTH: 6,
      maxLevels: { 6:1, 7:2, 8:3, 9:4, 10:5, 11:5, 12:5, 13:6, 14:7, 15:8, 16:9, 17:10, 18:10 }
    },
    'Dragon': {
      unlockTH: 7,
      maxLevels: { 7:2, 8:3, 9:4, 10:5, 11:6, 12:7, 13:8, 14:9, 15:10, 16:11, 17:12, 18:13 }
    },
    'P.E.K.K.A': {
      unlockTH: 8,
      maxLevels: { 8:3, 9:4, 10:6, 11:7, 12:8, 13:9, 14:10, 15:11, 16:12, 17:12, 18:13 }
    },
    'Baby Dragon': {
      unlockTH: 9,
      maxLevels: { 9:4, 10:5, 11:6, 12:7, 13:8, 14:8, 15:9, 16:10, 17:11, 18:12 }
    },
    'Miner': {
      unlockTH: 10,
      maxLevels: { 10:3, 11:5, 12:6, 13:7, 14:8, 15:9, 16:10, 17:11, 18:12 }
    },
    'Electro Dragon': {
      unlockTH: 11,
      maxLevels: { 11:2, 12:3, 13:4, 14:5, 15:6, 16:7, 17:8, 18:9 }
    },
    'Yeti': {
      unlockTH: 12,
      maxLevels: { 12:2, 13:3, 14:4, 15:5, 16:6, 17:7, 18:8 }
    },
    'Dragon Rider': {
      unlockTH: 13,
      maxLevels: { 13:1, 14:2, 15:3, 16:4, 17:5, 18:5 }
    },
    'Electro Titan': {
      unlockTH: 14,
      maxLevels: { 14:1, 15:3, 16:4, 17:5, 18:5 }
    },
    'Root Rider': {
      unlockTH: 15,
      maxLevels: { 15:2, 16:3, 17:4, 18:4 }
    },
    'Thrower': {
      unlockTH: 16,
      maxLevels: { 16:2, 17:3, 18:4 }
    },
    'Furnace': {
      unlockTH: 16,
      maxLevels: { 16:2, 17:3, 18:4 }
    },

    // Dark Elixir Troops
    'Minion': {
      unlockTH: 7,
      maxLevels: { 7:2, 8:4, 9:5, 10:6, 11:7, 12:8, 13:9, 14:10, 15:11, 16:12, 17:13, 18:14 }
    },
    'Hog Rider': {
      unlockTH: 7,
      maxLevels: { 7:2, 8:4, 9:5, 10:6, 11:7, 12:9, 13:10, 14:11, 15:12, 16:13, 17:14, 18:15 }
    },
    'Valkyrie': {
      unlockTH: 8,
      maxLevels: { 8:2, 9:4, 10:5, 11:6, 12:7, 13:8, 14:9, 15:10, 16:11, 17:12, 18:12 }
    },
    'Golem': {
      unlockTH: 8,
      maxLevels: { 8:2, 9:4, 10:5, 11:7, 12:9, 13:10, 14:11, 15:12, 16:13, 17:14, 18:15 }
    },
    'Witch': {
      unlockTH: 9,
      maxLevels: { 9:2, 10:3, 11:4, 12:5, 13:5, 14:5, 15:6, 16:7, 17:7, 18:8 }
    },
    'Lava Hound': {
      unlockTH: 9,
      maxLevels: { 9:2, 10:3, 11:4, 12:5, 13:6, 14:6, 15:6, 16:7, 17:7, 18:8 }
    },
    'Bowler': {
      unlockTH: 10,
      maxLevels: { 10:2, 11:3, 12:4, 13:5, 14:6, 15:7, 16:8, 17:9, 18:10 }
    },
    'Ice Golem': {
      unlockTH: 11,
      maxLevels: { 11:3, 12:5, 13:5, 14:6, 15:7, 16:8, 17:9, 18:9 }
    },
    'Headhunter': {
      unlockTH: 12,
      maxLevels: { 12:1, 13:2, 14:3, 15:3, 16:4, 17:4, 18:4 }
    },
    'Apprentice Warden': {
      unlockTH: 13,
      maxLevels: { 13:2, 14:3, 15:4, 16:4, 17:5, 18:5 }
    },
    'Druid': {
      unlockTH: 14,
      maxLevels: { 14:2, 15:3, 16:4, 17:5, 18:6 }
    },
    'Meteor Golem': {
      unlockTH: 17,
      maxLevels: { 17:2, 18:3 }
    },
    'Ruin Witch': {
      unlockTH: 17,
      maxLevels: { 17:3, 18:4 }
    }
  };

  const SPELL_BENCHMARKS = {
    'Lightning Spell': {
      unlockTH: 5,
      maxLevels: { 5:4, 6:4, 7:5, 8:6, 9:7, 10:7, 11:8, 12:9, 13:9, 14:9, 15:10, 16:11, 17:11, 18:12 }
    },
    'Healing Spell': {
      unlockTH: 6,
      maxLevels: { 6:4, 7:5, 8:6, 9:6, 10:7, 11:7, 12:8, 13:8, 14:8, 15:9, 16:10, 17:10, 18:11 }
    },
    'Rage Spell': {
      unlockTH: 7,
      maxLevels: { 7:4, 8:5, 9:5, 10:5, 11:6, 12:6, 13:6, 14:6, 15:6, 16:6, 17:6, 18:6 }
    },
    'Jump Spell': {
      unlockTH: 9,
      maxLevels: { 9:2, 10:3, 11:3, 12:3, 13:4, 14:4, 15:4, 16:5, 17:5, 18:5 }
    },
    'Freeze Spell': {
      unlockTH: 9,
      maxLevels: { 9:2, 10:5, 11:6, 12:7, 13:7, 14:7, 15:7, 16:7, 17:7, 18:7 }
    },
    'Poison Spell': {
      unlockTH: 8,
      maxLevels: { 8:2, 9:3, 10:4, 11:5, 12:6, 13:7, 14:8, 15:9, 16:10, 17:10, 18:11 }
    },
    'Earthquake Spell': {
      unlockTH: 8,
      maxLevels: { 8:2, 9:3, 10:4, 11:5, 12:5, 13:5, 14:5, 15:5, 16:5, 17:5, 18:5 }
    },
    'Haste Spell': {
      unlockTH: 9,
      maxLevels: { 9:2, 10:4, 11:5, 12:5, 13:5, 14:5, 15:5, 16:5, 17:5, 18:5 }
    },
    'Clone Spell': {
      unlockTH: 10,
      maxLevels: { 10:3, 11:5, 12:5, 13:6, 14:7, 15:8, 16:8, 17:8, 18:8 }
    },
    'Skeleton Spell': {
      unlockTH: 9,
      maxLevels: { 9:1, 10:3, 11:4, 12:6, 13:7, 14:7, 15:8, 16:8, 17:8, 18:8 }
    },
    'Bat Spell': {
      unlockTH: 10,
      maxLevels: { 10:3, 11:4, 12:5, 13:5, 14:5, 15:6, 16:6, 17:6, 18:6 }
    },
    'Invisibility Spell': {
      unlockTH: 11,
      maxLevels: { 11:2, 12:3, 13:4, 14:4, 15:4, 16:4, 17:4, 18:4 }
    },
    'Recall Spell': {
      unlockTH: 13,
      maxLevels: { 13:2, 14:3, 15:4, 16:5, 17:5, 18:5 }
    },
    'Overgrowth Spell': {
      unlockTH: 12,
      maxLevels: { 12:2, 13:2, 14:3, 15:4, 16:4, 17:4, 18:4 }
    },
    'Revive Spell': {
      unlockTH: 14,
      maxLevels: { 14:2, 15:3, 16:4, 17:4, 18:4 }
    },
    'Ice Block Spell': {
      unlockTH: 13,
      maxLevels: { 13:2, 14:3, 15:4, 16:5, 17:6, 18:6 }
    },
    'Angry Spell': {
      unlockTH: 15,
      maxLevels: { 15:2, 16:3, 17:4, 18:4 }
    },
    'Totem Spell': {
      unlockTH: 16,
      maxLevels: { 16:2, 17:3, 18:4 }
    }
  };

  const SIEGE_BENCHMARKS = {
    'Wall Wrecker': {
      unlockTH: 12,
      maxLevels: { 12:3, 13:4, 14:4, 15:5, 16:5, 17:5, 18:5 }
    },
    'Battle Blimp': {
      unlockTH: 12,
      maxLevels: { 12:3, 13:4, 14:4, 15:4, 16:5, 17:5, 18:5 }
    },
    'Stone Slammer': {
      unlockTH: 12,
      maxLevels: { 12:3, 13:4, 14:4, 15:5, 16:5, 17:5, 18:5 }
    },
    'Siege Barracks': {
      unlockTH: 13,
      maxLevels: { 13:4, 14:4, 15:4, 16:5, 17:5, 18:5 }
    },
    'Log Launcher': {
      unlockTH: 13,
      maxLevels: { 13:4, 14:4, 15:4, 16:5, 17:5, 18:5 }
    },
    'Flame Flinger': {
      unlockTH: 14,
      maxLevels: { 14:4, 15:4, 16:5, 17:5, 18:5 }
    },
    'Battle Drill': {
      unlockTH: 15,
      maxLevels: { 15:4, 16:4, 17:5, 18:5 }
    },
    'Troop Launcher': {
      unlockTH: 16,
      maxLevels: { 16:4, 17:4, 18:5 }
    },
    'Sky Wagon': {
      unlockTH: 17,
      maxLevels: { 17:4, 18:5 }
    }
  };

  const PET_BENCHMARKS = {
    'L.A.S.S.I': {
      unlockTH: 14,
      maxLevels: { 14: 10, 15: 15, 16: 15, 17: 15, 18: 15 }
    },
    'Electro Owl': {
      unlockTH: 14,
      maxLevels: { 14: 10, 15: 15, 16: 15, 17: 15, 18: 15 }
    },
    'Mighty Yak': {
      unlockTH: 14,
      maxLevels: { 14: 10, 15: 15, 16: 15, 17: 15, 18: 15 }
    },
    'Unicorn': {
      unlockTH: 14,
      maxLevels: { 14: 10, 15: 10, 16: 10, 17: 10, 18: 10 }
    },
    'Frosty': {
      unlockTH: 15,
      maxLevels: { 15: 10, 16: 10, 17: 10, 18: 10 }
    },
    'Diggy': {
      unlockTH: 15,
      maxLevels: { 15: 10, 16: 10, 17: 10, 18: 10 }
    },
    'Poison Lizard': {
      unlockTH: 15,
      maxLevels: { 15: 10, 16: 10, 17: 10, 18: 10 }
    },
    'Phoenix': {
      unlockTH: 15,
      maxLevels: { 15: 10, 16: 10, 17: 10, 18: 10 }
    },
    'Spirit Fox': {
      unlockTH: 16,
      maxLevels: { 16: 10, 17: 10, 18: 10 }
    },
    'Angry Jelly': {
      unlockTH: 16,
      maxLevels: { 16: 10, 17: 10, 18: 10 }
    },
    'Greedy Raven': {
      unlockTH: 17,
      maxLevels: { 17: 10, 18: 10 }
    },
    'Sneezy': {
      unlockTH: 17,
      maxLevels: { 17: 10, 18: 10 }
    }
  };

  const HERO_BENCHMARKS = {
    'Barbarian King': {
      village: 'home',
      unlockTH: 7,
      maxLevel: 110,
      maxLevels: { 7:10, 8:20, 9:30, 10:40, 11:50, 12:65, 13:75, 14:80, 15:90, 16:95, 17:100, 18:110 }
    },
    'Archer Queen': {
      village: 'home',
      unlockTH: 9,
      maxLevel: 110,
      maxLevels: { 9:30, 10:40, 11:50, 12:65, 13:75, 14:80, 15:90, 16:95, 17:100, 18:110 }
    },
    'Minion Prince': {
      village: 'home',
      unlockTH: 9,
      maxLevel: 95,
      maxLevels: { 9:20, 10:30, 11:40, 12:50, 13:60, 14:70, 15:80, 16:85, 17:90, 18:95 }
    },
    'Grand Warden': {
      village: 'home',
      unlockTH: 11,
      maxLevel: 85,
      maxLevels: { 11:20, 12:40, 13:50, 14:55, 15:65, 16:70, 17:75, 18:85 }
    },
    'Royal Champion': {
      village: 'home',
      unlockTH: 13,
      maxLevel: 55,
      maxLevels: { 13:25, 14:30, 15:40, 16:45, 17:50, 18:55 }
    },
    'Dragon Duke': {
      village: 'home',
      unlockTH: 15,
      maxLevel: 25,
      maxLevels: { 15:10, 16:15, 17:20, 18:25 }
    },
    'Battle Machine': {
      village: 'builderBase',
      unlockBH: 5,
      maxLevel: 35,
      maxLevels: { 5:5, 6:10, 7:20, 8:25, 9:30, 10:35 }
    },
    'Battle Copter': {
      village: 'builderBase',
      unlockBH: 8,
      maxLevel: 35,
      maxLevels: { 8:25, 9:30, 10:35 }
    }
  };

  const BUILDER_TROOP_BENCHMARKS = {
    'Raged Barbarian': { unlockBH: 1, maxLevel: 20 },
    'Sneaky Archer': { unlockBH: 2, maxLevel: 20 },
    'Boxer Giant': { unlockBH: 3, maxLevel: 20 },
    'Beta Minion': { unlockBH: 4, maxLevel: 20 },
    'Bomber': { unlockBH: 5, maxLevel: 20 },
    'Baby Dragon': { unlockBH: 6, maxLevel: 20 },
    'Cannon Cart': { unlockBH: 7, maxLevel: 20 },
    'Night Witch': { unlockBH: 8, maxLevel: 20 },
    'Drop Ship': { unlockBH: 9, maxLevel: 20 },
    'Power P.E.K.K.A': { unlockBH: 10, maxLevel: 20 },
    'Hog Glider': { unlockBH: 9, maxLevel: 20 },
    'Electrofire Wizard': { unlockBH: 10, maxLevel: 20 }
  };

  const COMMON_EQUIP_CAPS = { 8:9, 9:12, 10:15, 11:15, 12:18, 13:18, 14:18, 15:18, 16:18, 17:18, 18:18 };
  const EPIC_EQUIP_CAPS = { 8:12, 9:15, 10:18, 11:18, 12:21, 13:21, 14:24, 15:27, 16:27, 17:27, 18:27 };

  const EQUIPMENT_BENCHMARKS = {
    // Barbarian King
    'Barbarian Puppet': { hero: 'Barbarian King', rarity: 'common', maxLevel: 18, unlockTH: 8, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Rage Vial': { hero: 'Barbarian King', rarity: 'common', maxLevel: 18, unlockTH: 8, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Earthquake Boots': { hero: 'Barbarian King', rarity: 'common', maxLevel: 18, unlockTH: 8, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Vampstache': { hero: 'Barbarian King', rarity: 'common', maxLevel: 18, unlockTH: 10, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Giant Gauntlet': { hero: 'Barbarian King', rarity: 'epic', maxLevel: 27, unlockTH: 8, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Spiky Ball': { hero: 'Barbarian King', rarity: 'epic', maxLevel: 27, unlockTH: 8, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Snake Bracelet': { hero: 'Barbarian King', rarity: 'epic', maxLevel: 27, unlockTH: 8, source: 'event', maxLevels: EPIC_EQUIP_CAPS },

    // Archer Queen
    'Archer Puppet': { hero: 'Archer Queen', rarity: 'common', maxLevel: 18, unlockTH: 9, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Invisibility Vial': { hero: 'Archer Queen', rarity: 'common', maxLevel: 18, unlockTH: 9, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Giant Arrow': { hero: 'Archer Queen', rarity: 'common', maxLevel: 18, unlockTH: 9, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Healer Puppet': { hero: 'Archer Queen', rarity: 'common', maxLevel: 18, unlockTH: 11, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Frozen Arrow': { hero: 'Archer Queen', rarity: 'epic', maxLevel: 27, unlockTH: 9, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Magic Mirror': { hero: 'Archer Queen', rarity: 'epic', maxLevel: 27, unlockTH: 9, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Action Figure': { hero: 'Archer Queen', rarity: 'epic', maxLevel: 27, unlockTH: 9, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Monolith Arrow': { hero: 'Archer Queen', rarity: 'epic', maxLevel: 27, unlockTH: 9, source: 'event', maxLevels: EPIC_EQUIP_CAPS },

    // Grand Warden
    'Eternal Tome': { hero: 'Grand Warden', rarity: 'common', maxLevel: 18, unlockTH: 11, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Life Gem': { hero: 'Grand Warden', rarity: 'common', maxLevel: 18, unlockTH: 11, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Rage Gem': { hero: 'Grand Warden', rarity: 'common', maxLevel: 18, unlockTH: 11, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Healing Tome': { hero: 'Grand Warden', rarity: 'common', maxLevel: 18, unlockTH: 12, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Fireball': { hero: 'Grand Warden', rarity: 'epic', maxLevel: 27, unlockTH: 11, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Lavaloon Puppet': { hero: 'Grand Warden', rarity: 'epic', maxLevel: 27, unlockTH: 11, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Heroic Torch': { hero: 'Grand Warden', rarity: 'epic', maxLevel: 27, unlockTH: 11, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Meteor Staff': { hero: 'Grand Warden', rarity: 'epic', maxLevel: 27, unlockTH: 11, source: 'event', maxLevels: EPIC_EQUIP_CAPS },

    // Royal Champion
    'Seeking Shield': { hero: 'Royal Champion', rarity: 'common', maxLevel: 18, unlockTH: 13, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Royal Gem': { hero: 'Royal Champion', rarity: 'common', maxLevel: 18, unlockTH: 13, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Haste Vial': { hero: 'Royal Champion', rarity: 'common', maxLevel: 18, unlockTH: 13, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Hog Rider Puppet': { hero: 'Royal Champion', rarity: 'common', maxLevel: 18, unlockTH: 14, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Rocket Spear': { hero: 'Royal Champion', rarity: 'epic', maxLevel: 27, unlockTH: 13, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Electro Boots': { hero: 'Royal Champion', rarity: 'epic', maxLevel: 27, unlockTH: 13, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Frost Flake': { hero: 'Royal Champion', rarity: 'epic', maxLevel: 27, unlockTH: 13, source: 'event', maxLevels: EPIC_EQUIP_CAPS },

    // Minion Prince
    'Dark Orb': { hero: 'Minion Prince', rarity: 'common', maxLevel: 18, unlockTH: 9, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Henchmen Puppet': { hero: 'Minion Prince', rarity: 'common', maxLevel: 18, unlockTH: 9, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Noble Iron': { hero: 'Minion Prince', rarity: 'common', maxLevel: 18, unlockTH: 9, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Metal Pants': { hero: 'Minion Prince', rarity: 'common', maxLevel: 18, unlockTH: 10, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Dark Crown': { hero: 'Minion Prince', rarity: 'epic', maxLevel: 27, unlockTH: 9, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Revenge Deck': { hero: 'Minion Prince', rarity: 'epic', maxLevel: 27, unlockTH: 9, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Portal Pendant': { hero: 'Minion Prince', rarity: 'epic', maxLevel: 27, unlockTH: 9, source: 'event', maxLevels: EPIC_EQUIP_CAPS },

    // Dragon Duke
    'Fire Heart': { hero: 'Dragon Duke', rarity: 'common', maxLevel: 18, unlockTH: 15, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Flame Blower': { hero: 'Dragon Duke', rarity: 'common', maxLevel: 18, unlockTH: 15, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Stun Blaster': { hero: 'Dragon Duke', rarity: 'common', maxLevel: 18, unlockTH: 15, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Electro Fangs': { hero: 'Dragon Duke', rarity: 'common', maxLevel: 18, unlockTH: 16, source: 'blacksmith', maxLevels: COMMON_EQUIP_CAPS },
    'Rocket Backpack': { hero: 'Dragon Duke', rarity: 'epic', maxLevel: 27, unlockTH: 15, source: 'event', maxLevels: EPIC_EQUIP_CAPS },
    'Stick Horse': { hero: 'Dragon Duke', rarity: 'epic', maxLevel: 27, unlockTH: 15, source: 'event', maxLevels: EPIC_EQUIP_CAPS }
  };

  const HELPER_BENCHMARKS = {
    'builders_apprentice': {
      id: 'builders_apprentice',
      name: "Builder's Apprentice",
      description: "Speeds up builder upgrades in the Home Village",
      unlockTH: 10,
      maxLevel: 8,
      maxLevels: { 10: 2, 11: 4, 12: 6, 13: 7, 14: 8, 15: 8, 16: 8, 17: 8, 18: 8 },
      image: '/images/helpers/builders-apprentice.png'
    },
    'lab_assistant': {
      id: 'lab_assistant',
      name: "Lab Assistant",
      description: "Speeds up troop and spell research in the Laboratory",
      unlockTH: 9,
      maxLevel: 12,
      maxLevels: { 9: 1, 10: 3, 11: 4, 12: 6, 13: 8, 14: 10, 15: 11, 16: 12, 17: 12, 18: 12 },
      image: '/images/helpers/lab-assistant.png'
    },
    'alchemist': {
      id: 'alchemist',
      name: "Alchemist",
      description: "Transmutes Gold, Elixir and Dark Elixir with bonus",
      unlockTH: 11,
      maxLevel: 7,
      maxLevels: { 11: 1, 12: 2, 13: 3, 14: 4, 15: 5, 16: 6, 17: 7, 18: 7 },
      image: '/images/helpers/alchemist.png'
    },
    'prospector': {
      id: 'prospector',
      name: "Prospector",
      description: "Discovers hidden deposits and assists in resource harvesting",
      unlockTH: 10,
      maxLevel: 1,
      maxLevels: { 10: 1, 11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1 },
      image: '/images/helpers/prospector.png'
    }
  };

  const GUARDIAN_BENCHMARKS = {
    'smasher': {
      id: 'smasher',
      name: "Smasher",
      description: "Melee guardian with spiked club, enrages when TH falls and drops Rage on death",
      unlockTH: 18,
      maxLevel: 5,
      maxLevels: { 18: 5 },
      image: '/images/guardians/smasher.png'
    },
    'longshot': {
      id: 'longshot',
      name: "Longshot",
      description: "Long-range guardian firing explosive bolts with a massive death shockwave",
      unlockTH: 18,
      maxLevel: 5,
      maxLevels: { 18: 5 },
      image: '/images/guardians/longshot.png'
    },
    'logger': {
      id: 'logger',
      name: "Logger",
      description: "Piercing log launcher pushing back enemy ground and air troops",
      unlockTH: 18,
      maxLevel: 5,
      maxLevels: { 18: 5 },
      image: '/images/guardians/logger.png'
    }
  };

  function resolveMax(bench, th, fallbackMax = 1) {
    if (!bench) return fallbackMax;
    const safeTh = Math.min(18, Math.max(1, parseInt(th, 10) || 1));
    if (safeTh < bench.unlockTH) return 0;
    if (bench.maxLevels && bench.maxLevels[safeTh]) {
      return bench.maxLevels[safeTh];
    }
    if (bench.maxLevels) {
      for (let t = safeTh; t >= bench.unlockTH; t--) {
        if (bench.maxLevels[t]) return bench.maxLevels[t];
      }
    }
    return fallbackMax;
  }

  return {
    TROOP_BENCHMARKS,
    SPELL_BENCHMARKS,
    SIEGE_BENCHMARKS,
    PET_BENCHMARKS,
    HERO_BENCHMARKS,
    BUILDER_TROOP_BENCHMARKS,
    EQUIPMENT_BENCHMARKS,
    HELPER_BENCHMARKS,
    GUARDIAN_BENCHMARKS,

    getHeroMaxForTH(heroName, thLevel, fallbackMax = 1) {
      const bench = HERO_BENCHMARKS[heroName];
      return resolveMax(bench, thLevel, fallbackMax);
    },

    isHeroMaxForTH(heroName, currentLevel, thLevel, fallbackMax = 1) {
      const maxForTh = this.getHeroMaxForTH(heroName, thLevel, fallbackMax);
      if (maxForTh <= 0) return false;
      return (currentLevel || 0) >= maxForTh;
    },

    getTroopMaxForTH(troopName, thLevel, fallbackMax = 1) {
      const bench = TROOP_BENCHMARKS[troopName];
      return resolveMax(bench, thLevel, fallbackMax);
    },

    isTroopMaxForTH(troopName, currentLevel, thLevel, fallbackMax = 1) {
      const maxForTh = this.getTroopMaxForTH(troopName, thLevel, fallbackMax);
      if (maxForTh <= 0) return false;
      return (currentLevel || 0) >= maxForTh;
    },

    getSpellMaxForTH(spellName, thLevel, fallbackMax = 1) {
      const bench = SPELL_BENCHMARKS[spellName];
      return resolveMax(bench, thLevel, fallbackMax);
    },

    isSpellMaxForTH(spellName, currentLevel, thLevel, fallbackMax = 1) {
      const maxForTh = this.getSpellMaxForTH(spellName, thLevel, fallbackMax);
      if (maxForTh <= 0) return false;
      return (currentLevel || 0) >= maxForTh;
    },

    getSiegeMaxForTH(siegeName, thLevel, fallbackMax = 1) {
      const bench = SIEGE_BENCHMARKS[siegeName];
      return resolveMax(bench, thLevel, fallbackMax);
    },

    isSiegeMaxForTH(siegeName, currentLevel, thLevel, fallbackMax = 1) {
      const maxForTh = this.getSiegeMaxForTH(siegeName, thLevel, fallbackMax);
      if (maxForTh <= 0) return false;
      return (currentLevel || 0) >= maxForTh;
    },

    getPetMaxForTH(petName, thLevel, fallbackMax = 10) {
      const bench = PET_BENCHMARKS[petName];
      return resolveMax(bench, thLevel, fallbackMax);
    },

    isPetMaxForTH(petName, currentLevel, thLevel, fallbackMax = 10) {
      const maxForTh = this.getPetMaxForTH(petName, thLevel, fallbackMax);
      if (maxForTh <= 0) return false;
      return (currentLevel || 0) >= maxForTh;
    },

    getEquipmentMaxForTH(equipName, thLevel, fallbackMax = 18) {
      const bench = EQUIPMENT_BENCHMARKS[equipName];
      return resolveMax(bench, thLevel, fallbackMax);
    },

    isEquipmentMaxForTH(equipName, currentLevel, thLevel, fallbackMax = 18) {
      const maxForTh = this.getEquipmentMaxForTH(equipName, thLevel, fallbackMax);
      if (maxForTh <= 0) return false;
      return (currentLevel || 0) >= maxForTh;
    },

    getHelperMaxForTH(helperId, thLevel, fallbackMax = 1) {
      const bench = HELPER_BENCHMARKS[helperId];
      return resolveMax(bench, thLevel, fallbackMax);
    },

    isHelperMaxForTH(helperId, currentLevel, thLevel, fallbackMax = 1) {
      const maxForTh = this.getHelperMaxForTH(helperId, thLevel, fallbackMax);
      if (maxForTh <= 0) return false;
      return (currentLevel || 0) >= maxForTh;
    },

    getGuardianMaxForTH(guardianId, thLevel, fallbackMax = 5) {
      const bench = GUARDIAN_BENCHMARKS[guardianId];
      return resolveMax(bench, thLevel, fallbackMax);
    },

    isGuardianMaxForTH(guardianId, currentLevel, thLevel, fallbackMax = 5) {
      const maxForTh = this.getGuardianMaxForTH(guardianId, thLevel, fallbackMax);
      if (maxForTh <= 0) return false;
      return (currentLevel || 0) >= maxForTh;
    }
  };
}));
