/**
 * Clash of Clans Tracker & Upgrade Math Service
 * Calculates upgrade percentages and detects changes between snapshots.
 */

const CocBenchmarks = require('../public/js/benchmarks');

// Known global maximum levels for Town Hall 18
const TH18_MAX_BENCHMARKS = {
  maxTownHall: 18,
  heroes: {
    'Barbarian King': 110,
    'Archer Queen': 110,
    'Grand Warden': 85,
    'Royal Champion': 55,
    'Minion Prince': 95,
    'Dragon Duke': 25
  },
  builderHeroes: {
    'Battle Machine': 35,
    'Battle Copter': 35
  }
};

// Full catalogue of Clash of Clans buildings with unlock Town Hall, max levels, and quantities per TH
const BUILDINGS_CATALOG = [
  // DEFENSES (Home Village)
  {
    id: 'cannon',
    slug: 'cannon',
    name: 'Cannon',
    category: 'defense',
    unlockTH: 1,
    maxLevel: 21,
    maxLevels: { 1:2, 2:3, 3:4, 4:5, 5:6, 6:7, 7:8, 8:10, 9:11, 10:13, 11:15, 12:17, 13:19, 14:20, 15:21, 16:21, 17:21, 18:21 },
    quantities: { 1:2, 2:2, 3:2, 4:2, 5:3, 6:3, 7:5, 8:5, 9:5, 10:6, 11:7, 12:7, 13:7, 14:7, 15:7, 16:5, 17:5, 18:5 }
  },
  {
    id: 'ricochet_cannon',
    slug: 'ricochet_cannon',
    name: 'Ricochet Cannon',
    category: 'defense',
    unlockTH: 16,
    maxLevel: 4,
    maxLevels: { 16:2, 17:3, 18:4 },
    quantities: { 16:2, 17:2, 18:2 }
  },
  {
    id: 'archer_tower',
    slug: 'archer_tower',
    name: 'Archer Tower',
    category: 'defense',
    unlockTH: 2,
    maxLevel: 21,
    maxLevels: { 2:2, 3:3, 4:4, 5:6, 6:7, 7:8, 8:10, 9:11, 10:13, 11:15, 12:17, 13:19, 14:20, 15:21, 16:21, 17:21, 18:21 },
    quantities: { 2:1, 3:2, 4:2, 5:3, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:8, 13:8, 14:8, 15:8, 16:6, 17:6, 18:6 }
  },
  {
    id: 'multi_archer_tower',
    slug: 'multi-archer_tower',
    name: 'Multi-Archer Tower',
    category: 'defense',
    unlockTH: 16,
    maxLevel: 4,
    maxLevels: { 16:2, 17:3, 18:4 },
    quantities: { 16:2, 17:2, 18:2 }
  },
  {
    id: 'mortar',
    slug: 'mortar',
    name: 'Mortar',
    category: 'defense',
    unlockTH: 3,
    maxLevel: 18,
    maxLevels: { 3:1, 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:8, 11:9, 12:10, 13:11, 14:13, 15:15, 16:16, 17:17, 18:18 },
    quantities: { 3:1, 4:1, 5:1, 6:2, 7:3, 8:4, 9:4, 10:4, 11:4, 12:4, 13:4, 14:4, 15:4, 16:4, 17:4, 18:4 }
  },
  {
    id: 'air_defense',
    slug: 'air_defense',
    name: 'Air Defense',
    category: 'defense',
    unlockTH: 4,
    maxLevel: 16,
    maxLevels: { 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:8, 11:9, 12:10, 13:11, 14:12, 15:13, 16:14, 17:15, 18:16 },
    quantities: { 4:1, 5:1, 6:2, 7:3, 8:4, 9:4, 10:4, 11:4, 12:4, 13:4, 14:4, 15:4, 16:4, 17:4, 18:4 }
  },
  {
    id: 'wizard_tower',
    slug: 'wizard_tower',
    name: 'Wizard Tower',
    category: 'defense',
    unlockTH: 5,
    maxLevel: 17,
    maxLevels: { 5:2, 6:3, 7:4, 8:6, 9:7, 10:9, 11:10, 12:11, 13:13, 14:14, 15:15, 16:16, 17:17, 18:17 },
    quantities: { 5:1, 6:2, 7:2, 8:3, 9:4, 10:4, 11:4, 12:5, 13:5, 14:5, 15:5, 16:5, 17:5, 18:5 }
  },
  {
    id: 'air_sweeper',
    slug: 'air_sweeper',
    name: 'Air Sweeper',
    category: 'defense',
    unlockTH: 6,
    maxLevel: 7,
    maxLevels: { 6:2, 7:3, 8:4, 9:5, 10:6, 11:7, 12:7, 13:7, 14:7, 15:7, 16:7, 17:7, 18:7 },
    quantities: { 6:1, 7:1, 8:1, 9:2, 10:2, 11:2, 12:2, 13:2, 14:2, 15:2, 16:2, 17:2, 18:2 }
  },
  {
    id: 'hidden_tesla',
    slug: 'hidden_tesla',
    name: 'Hidden Tesla',
    category: 'defense',
    unlockTH: 7,
    maxLevel: 17,
    maxLevels: { 7:3, 8:6, 9:7, 10:8, 11:9, 12:10, 13:12, 14:13, 15:14, 16:15, 17:16, 18:17 },
    quantities: { 7:2, 8:3, 9:4, 10:4, 11:4, 12:5, 13:5, 14:5, 15:5, 16:5, 17:5, 18:5 }
  },
  {
    id: 'bomb_tower',
    slug: 'bomb_tower',
    name: 'Bomb Tower',
    category: 'defense',
    unlockTH: 8,
    maxLevel: 13,
    maxLevels: { 8:1, 9:2, 10:4, 11:6, 12:7, 13:8, 14:9, 15:10, 16:11, 17:12, 18:13 },
    quantities: { 8:1, 9:1, 10:2, 11:2, 12:2, 13:2, 14:2, 15:2, 16:2, 17:2, 18:2 }
  },
  {
    id: 'x_bow',
    slug: 'x-bow',
    name: 'X-Bow',
    category: 'defense',
    unlockTH: 9,
    maxLevel: 13,
    maxLevels: { 9:3, 10:4, 11:5, 12:6, 13:8, 14:9, 15:10, 16:11, 17:12, 18:13 },
    quantities: { 9:2, 10:3, 11:4, 12:4, 13:4, 14:4, 15:4, 16:4, 17:4, 18:4 }
  },
  {
    id: 'inferno_tower',
    slug: 'inferno_tower',
    name: 'Inferno Tower',
    category: 'defense',
    unlockTH: 10,
    maxLevel: 12,
    maxLevels: { 10:3, 11:5, 12:6, 13:7, 14:8, 15:9, 16:10, 17:11, 18:12 },
    quantities: { 10:2, 11:2, 12:3, 13:3, 14:3, 15:3, 16:3, 17:3, 18:3 }
  },
  {
    id: 'eagle_artillery',
    slug: 'eagle_artillery',
    name: 'Eagle Artillery',
    category: 'defense',
    unlockTH: 11,
    maxLevel: 7,
    maxLevels: { 11:2, 12:3, 13:4, 14:5, 15:6, 16:6, 17:7, 18:7 },
    quantities: { 11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1 }
  },
  {
    id: 'scattershot',
    slug: 'scattershot',
    name: 'Scattershot',
    category: 'defense',
    unlockTH: 13,
    maxLevel: 7,
    maxLevels: { 13:2, 14:3, 15:4, 16:5, 17:6, 18:7 },
    quantities: { 13:2, 14:2, 15:2, 16:2, 17:2, 18:2 }
  },
  {
    id: 'spell_tower',
    slug: 'spell_tower',
    name: 'Spell Tower',
    category: 'defense',
    unlockTH: 15,
    maxLevel: 4,
    maxLevels: { 15:3, 16:3, 17:4, 18:4 },
    quantities: { 15:2, 16:2, 17:2, 18:2 }
  },
  {
    id: 'monolith',
    slug: 'monolith',
    name: 'Monolith',
    category: 'defense',
    unlockTH: 15,
    maxLevel: 5,
    maxLevels: { 15:2, 16:3, 17:4, 18:5 },
    quantities: { 15:1, 16:1, 17:1, 18:1 }
  },
  {
    id: 'wall',
    slug: 'wall',
    name: 'Wall',
    category: 'defense',
    unlockTH: 2,
    maxLevel: 19,
    maxLevels: { 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, 11:11, 12:12, 13:13, 14:14, 15:16, 16:17, 17:18, 18:19 },
    quantities: { 2:25, 3:50, 4:75, 5:100, 6:125, 7:175, 8:225, 9:250, 10:275, 11:300, 12:300, 13:300, 14:325, 15:325, 16:325, 17:325, 18:325 }
  },

  // Traps
  {
    id: 'bomb',
    slug: 'bomb',
    name: 'Bomb',
    category: 'trap',
    unlockTH: 2,
    maxLevel: 14,
    maxLevels: { 2:2, 3:2, 4:2, 5:3, 6:3, 7:4, 8:5, 9:6, 10:7, 11:8, 12:8, 13:9, 14:10, 15:11, 16:12, 17:13, 18:14 },
    quantities: { 2:2, 3:2, 4:2, 5:4, 6:4, 7:6, 8:6, 9:6, 10:6, 11:6, 12:6, 13:7, 14:8, 15:8, 16:8, 17:8, 18:8 }
  },
  {
    id: 'spring_trap',
    slug: 'spring_trap',
    name: 'Spring Trap',
    category: 'trap',
    unlockTH: 4,
    maxLevel: 5,
    maxLevels: { 4:1, 5:1, 6:1, 7:2, 8:3, 9:4, 10:5, 11:5, 12:5, 13:5, 14:5, 15:5, 16:5, 17:5, 18:5 },
    quantities: { 4:2, 5:2, 6:4, 7:4, 8:6, 9:6, 10:6, 11:6, 12:8, 13:8, 14:9, 15:9, 16:9, 17:9, 18:9 }
  },
  {
    id: 'giant_bomb',
    slug: 'giant_bomb',
    name: 'Giant Bomb',
    category: 'trap',
    unlockTH: 6,
    maxLevel: 12,
    maxLevels: { 6:2, 7:2, 8:3, 9:3, 10:4, 11:5, 12:5, 13:7, 14:8, 15:9, 16:10, 17:11, 18:12 },
    quantities: { 6:1, 7:2, 8:3, 9:4, 10:5, 11:5, 12:6, 13:7, 14:7, 15:8, 16:8, 17:8, 18:8 }
  },
  {
    id: 'air_bomb',
    slug: 'air_bomb',
    name: 'Air Bomb',
    category: 'trap',
    unlockTH: 5,
    maxLevel: 13,
    maxLevels: { 5:2, 6:2, 7:3, 8:3, 9:4, 10:4, 11:5, 12:6, 13:8, 14:9, 15:10, 16:11, 17:12, 18:13 },
    quantities: { 5:2, 6:2, 7:2, 8:4, 9:4, 10:5, 11:5, 12:6, 13:6, 14:7, 15:7, 16:8, 17:8, 18:8 }
  },
  {
    id: 'seeking_air_mine',
    slug: 'seeking_air_mine',
    name: 'Seeking Air Mine',
    category: 'trap',
    unlockTH: 7,
    maxLevel: 8,
    maxLevels: { 7:1, 8:1, 9:2, 10:3, 11:3, 12:3, 13:4, 14:4, 15:5, 16:6, 17:7, 18:8 },
    quantities: { 7:1, 8:2, 9:2, 10:3, 11:4, 12:5, 13:5, 14:7, 15:8, 16:8, 17:9, 18:9 }
  },
  {
    id: 'skeleton_trap',
    slug: 'skeleton_trap',
    name: 'Skeleton Trap',
    category: 'trap',
    unlockTH: 8,
    maxLevel: 5,
    maxLevels: { 8:2, 9:3, 10:4, 11:4, 12:4, 13:4, 14:4, 15:4, 16:4, 17:4, 18:5 },
    quantities: { 8:2, 9:2, 10:3, 11:3, 12:3, 13:3, 14:4, 15:4, 16:4, 17:4, 18:4 }
  },
  {
    id: 'tornado_trap',
    slug: 'tornado_trap',
    name: 'Tornado Trap',
    category: 'trap',
    unlockTH: 11,
    maxLevel: 3,
    maxLevels: { 11:2, 12:3, 13:3, 14:3, 15:3, 16:3, 17:3, 18:3 },
    quantities: { 11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1 }
  },

  // ARMY & RESEARCH
  {
    id: 'army_camp',
    slug: 'army_camp',
    name: 'Army Camp',
    category: 'army',
    unlockTH: 1,
    maxLevel: 14,
    maxLevels: { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:6, 9:8, 10:8, 11:9, 12:10, 13:11, 14:12, 15:13, 16:14, 17:14, 18:14 },
    quantities: { 1:1, 2:1, 3:2, 4:2, 5:3, 6:3, 7:4, 8:4, 9:4, 10:4, 11:4, 12:4, 13:4, 14:4, 15:4, 16:4, 17:4, 18:4 }
  },
  {
    id: 'barracks',
    slug: 'barracks',
    name: 'Barracks',
    category: 'army',
    unlockTH: 1,
    maxLevel: 19,
    maxLevels: { 1:2, 2:3, 3:5, 4:6, 5:7, 6:7, 7:8, 8:9, 9:10, 10:11, 11:12, 12:13, 13:14, 14:15, 15:16, 16:17, 17:18, 18:19 },
    quantities: { 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1, 11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1 }
  },
  {
    id: 'dark_barracks',
    slug: 'dark_barracks',
    name: 'Dark Barracks',
    category: 'army',
    unlockTH: 7,
    maxLevel: 13,
    maxLevels: { 7:2, 8:4, 9:6, 10:7, 11:8, 12:9, 13:10, 14:11, 15:11, 16:11, 17:12, 18:13 },
    quantities: { 7:1, 8:1, 9:1, 10:1, 11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1 }
  },
  {
    id: 'laboratory',
    slug: 'laboratory',
    name: 'Laboratory',
    category: 'army',
    unlockTH: 3,
    maxLevel: 16,
    maxLevels: { 3:1, 4:2, 5:3, 6:4, 7:5, 8:6, 9:7, 10:8, 11:9, 12:10, 13:11, 14:12, 15:13, 16:14, 17:15, 18:16 },
    quantities: { 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1, 11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1 }
  },
  {
    id: 'spell_factory',
    slug: 'spell_factory',
    name: 'Spell Factory',
    category: 'army',
    unlockTH: 5,
    maxLevel: 9,
    maxLevels: { 5:1, 6:2, 7:3, 8:3, 9:4, 10:5, 11:6, 12:6, 13:7, 14:7, 15:8, 16:9, 17:9, 18:9 },
    quantities: { 5:1, 6:1, 7:1, 8:1, 9:1, 10:1, 11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1 }
  },
  {
    id: 'dark_spell_factory',
    slug: 'dark_spell_factory',
    name: 'Dark Spell Factory',
    category: 'army',
    unlockTH: 8,
    maxLevel: 8,
    maxLevels: { 8:2, 9:4, 10:5, 11:5, 12:6, 13:6, 14:6, 15:6, 16:6, 17:7, 18:8 },
    quantities: { 8:1, 9:1, 10:1, 11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1 }
  },
  {
    id: 'workshop',
    slug: 'workshop',
    name: 'Workshop',
    category: 'army',
    unlockTH: 12,
    maxLevel: 9,
    maxLevels: { 12:3, 13:5, 14:6, 15:7, 16:8, 17:8, 18:9 },
    quantities: { 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1 }
  },
  {
    id: 'pet_house',
    slug: 'pet_house',
    name: 'Pet House',
    category: 'army',
    unlockTH: 14,
    maxLevel: 12,
    maxLevels: { 14:4, 15:8, 16:10, 17:11, 18:12 },
    quantities: { 14:1, 15:1, 16:1, 17:1, 18:1 }
  },
  {
    id: 'blacksmith',
    slug: 'blacksmith',
    name: 'Blacksmith',
    category: 'army',
    unlockTH: 8,
    maxLevel: 9,
    maxLevels: { 8:1, 9:2, 10:3, 11:4, 12:5, 13:6, 14:7, 15:8, 16:9, 17:9, 18:9 },
    quantities: { 8:1, 9:1, 10:1, 11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1 }
  },
  {
    id: 'clan_castle',
    slug: 'clan_castle',
    name: 'Clan Castle',
    category: 'army',
    unlockTH: 2,
    maxLevel: 14,
    maxLevels: { 2:1, 3:1, 4:2, 5:2, 6:3, 7:3, 8:4, 9:5, 10:6, 11:7, 12:8, 13:9, 14:10, 15:11, 16:12, 17:13, 18:14 },
    quantities: { 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1, 11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1 }
  },

  // RISORSE (Resources)
  {
    id: 'gold_storage',
    slug: 'gold_storage',
    name: 'Gold Storage',
    category: 'resource',
    unlockTH: 1,
    maxLevel: 19,
    maxLevels: { 1:1, 2:3, 3:6, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:14, 11:15, 12:15, 13:16, 14:16, 15:17, 16:17, 17:18, 18:19 },
    quantities: { 1:1, 2:1, 3:2, 4:2, 5:2, 6:2, 7:2, 8:3, 9:4, 10:4, 11:4, 12:4, 13:4, 14:4, 15:4, 16:4, 17:4, 18:4 }
  },
  {
    id: 'elixir_storage',
    slug: 'elixir_storage',
    name: 'Elixir Storage',
    category: 'resource',
    unlockTH: 1,
    maxLevel: 19,
    maxLevels: { 1:1, 2:3, 3:6, 4:8, 5:9, 6:10, 7:11, 8:12, 9:13, 10:14, 11:15, 12:15, 13:16, 14:16, 15:17, 16:17, 17:18, 18:19 },
    quantities: { 1:1, 2:1, 3:2, 4:2, 5:2, 6:2, 7:2, 8:3, 9:4, 10:4, 11:4, 12:4, 13:4, 14:4, 15:4, 16:4, 17:4, 18:4 }
  },
  {
    id: 'dark_elixir_storage',
    slug: 'dark_elixir_storage',
    name: 'Dark Elixir Storage',
    category: 'resource',
    unlockTH: 7,
    maxLevel: 13,
    maxLevels: { 7:2, 8:4, 9:6, 10:6, 11:6, 12:7, 13:8, 14:9, 15:10, 16:11, 17:12, 18:13 },
    quantities: { 7:1, 8:1, 9:1, 10:1, 11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1 }
  },
  {
    id: 'gold_mine',
    slug: 'gold_mine',
    name: 'Gold Mine',
    category: 'resource',
    unlockTH: 1,
    maxLevel: 17,
    maxLevels: { 1:2, 2:4, 3:6, 4:8, 5:10, 6:10, 7:11, 8:12, 9:12, 10:13, 11:14, 12:15, 13:15, 14:16, 15:16, 16:17, 17:17, 18:17 },
    quantities: { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:6, 8:6, 9:6, 10:7, 11:7, 12:7, 13:7, 14:7, 15:7, 16:7, 17:7, 18:7 }
  },
  {
    id: 'elixir_collector',
    slug: 'elixir_collector',
    name: 'Elixir Collector',
    category: 'resource',
    unlockTH: 1,
    maxLevel: 17,
    maxLevels: { 1:2, 2:4, 3:6, 4:8, 5:10, 6:10, 7:11, 8:12, 9:12, 10:13, 11:14, 12:15, 13:15, 14:16, 15:16, 16:17, 17:17, 18:17 },
    quantities: { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:6, 8:6, 9:6, 10:7, 11:7, 12:7, 13:7, 14:7, 15:7, 16:7, 17:7, 18:7 }
  },
  {
    id: 'dark_elixir_drill',
    slug: 'dark_elixir_drill',
    name: 'Dark Elixir Drill',
    category: 'resource',
    unlockTH: 7,
    maxLevel: 11,
    maxLevels: { 7:3, 8:3, 9:6, 10:7, 11:8, 12:8, 13:9, 14:9, 15:10, 16:11, 17:11, 18:11 },
    quantities: { 7:1, 8:2, 9:2, 10:3, 11:3, 12:3, 13:3, 14:3, 15:3, 16:3, 17:3, 18:3 }
  },
  {
    id: 'builder_hut',
    slug: "builder's_hut",
    name: 'Builder\'s Hut',
    category: 'resource',
    unlockTH: 1,
    maxLevel: 8,
    maxLevels: { 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1, 11:1, 12:1, 13:1, 14:4, 15:5, 16:6, 17:7, 18:8 },
    quantities: { 1:5, 2:5, 3:5, 4:5, 5:5, 6:5, 7:5, 8:5, 9:5, 10:5, 11:5, 12:5, 13:5, 14:5, 15:5, 16:5, 17:5, 18:5 }
  }
];

// Builder Base Buildings Catalog (BH 1 - BH 10)
const BUILDER_BUILDINGS_CATALOG = [
  // DEFENSES (Home Village)
  {
    id: 'bb_double_cannon',
    slug: 'double_cannon',
    name: 'Double Cannon',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 2,
    maxLevel: 10,
    maxLevels: { 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 2:1, 3:1, 4:2, 5:2, 6:2, 7:2, 8:2, 9:2, 10:2 }
  },
  {
    id: 'bb_archer_tower',
    slug: 'archer_tower',
    name: 'Archer Tower (BB)',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 2,
    maxLevel: 10,
    maxLevels: { 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 2:1, 3:1, 4:1, 5:2, 6:2, 7:2, 8:2, 9:2, 10:2 }
  },
  {
    id: 'bb_cannon',
    slug: 'cannon',
    name: 'Cannon (BB)',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 1,
    maxLevel: 10,
    maxLevels: { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 1:1, 2:2, 3:2, 4:2, 5:2, 6:2, 7:2, 8:2, 9:2, 10:2 }
  },
  {
    id: 'bb_firecrackers',
    slug: 'firecrackers',
    name: 'Firecrackers',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 3,
    maxLevel: 10,
    maxLevels: { 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 3:1, 4:2, 5:2, 6:3, 7:3, 8:3, 9:3, 10:3 }
  },
  {
    id: 'bb_crusher',
    slug: 'crusher',
    name: 'Crusher',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 3,
    maxLevel: 10,
    maxLevels: { 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 3:1, 4:1, 5:1, 6:2, 7:2, 8:2, 9:2, 10:2 }
  },
  {
    id: 'bb_guard_post',
    slug: 'guard_post',
    name: 'Guard Post',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 4,
    maxLevel: 10,
    maxLevels: { 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_air_bombs',
    slug: 'air_bombs',
    name: 'Air bombs',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 4,
    maxLevel: 10,
    maxLevels: { 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_multi_mortar',
    slug: 'multi_mortar',
    name: 'Multi Mortar',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 5,
    maxLevel: 10,
    maxLevels: { 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 5:1, 6:1, 7:1, 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_roaster',
    slug: 'roaster',
    name: 'Roaster',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 6,
    maxLevel: 10,
    maxLevels: { 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 6:1, 7:1, 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_giant_cannon',
    slug: 'giant_cannon',
    name: 'Giant Cannon',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 7,
    maxLevel: 10,
    maxLevels: { 7:7, 8:8, 9:9, 10:10 },
    quantities: { 7:1, 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_mega_tesla',
    slug: 'mega_tesla',
    name: 'Mega Tesla',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 8,
    maxLevel: 10,
    maxLevels: { 8:8, 9:9, 10:10 },
    quantities: { 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_lava_launcher',
    slug: 'lava_launcher',
    name: 'Lava Launcher',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 9,
    maxLevel: 10,
    maxLevels: { 9:9, 10:10 },
    quantities: { 9:1, 10:1 }
  },
  {
    id: 'bb_otto_outpost',
    slug: 'ottos_outpost',
    name: "O.T.T.O\'s Outpost",
    category: 'defense',
    village: 'builderBase',
    unlockBH: 6,
    maxLevel: 10,
    maxLevels: { 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 6:1, 7:1, 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_x_bow',
    slug: 'x-bow',
    name: 'X-Bow (BB)',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 10,
    maxLevel: 5,
    maxLevels: { 10:5 },
    quantities: { 10:1 }
  },
  {
    id: 'bb_wall',
    slug: 'wall',
    name: 'Wall (BB)',
    category: 'defense',
    village: 'builderBase',
    unlockBH: 2,
    maxLevel: 10,
    maxLevels: { 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 2:8, 3:15, 4:20, 5:25, 6:30, 7:35, 8:40, 9:45, 10:50 }
  },

  // ARMY (Builder Base)
  {
    id: 'bb_builder_hall',
    slug: 'builder_hall',
    name: 'Builder Hall',
    category: 'army',
    village: 'builderBase',
    unlockBH: 1,
    maxLevel: 10,
    maxLevels: { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_star_laboratory',
    slug: 'star_laboratory',
    name: 'Star Laboratory',
    category: 'army',
    village: 'builderBase',
    unlockBH: 2,
    maxLevel: 10,
    maxLevels: { 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_builder_barracks',
    slug: 'builder_barracks',
    name: 'Builder Barracks',
    category: 'army',
    village: 'builderBase',
    unlockBH: 2,
    maxLevel: 12,
    maxLevels: { 2:2, 3:4, 4:6, 5:7, 6:8, 7:9, 8:10, 9:11, 10:12 },
    quantities: { 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_healing_hut',
    slug: 'healing_hut',
    name: 'Healing Hut',
    category: 'army',
    village: 'builderBase',
    unlockBH: 6,
    maxLevel: 6,
    maxLevels: { 6:2, 7:3, 8:4, 9:5, 10:6 },
    quantities: { 6:1, 7:1, 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_army_camp',
    slug: 'army_camp',
    name: 'Army Camp (BB)',
    category: 'army',
    village: 'builderBase',
    unlockBH: 2,
    maxLevel: 1,
    maxLevels: { 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1 },
    quantities: { 2:2, 3:3, 4:4, 5:4, 6:5, 7:6, 8:6, 9:6, 10:6 }
  },

  // RISORSE (Resources)
  {
    id: 'bb_gold_mine',
    slug: 'gold_mine',
    name: 'Gold Mine (BB)',
    category: 'resource',
    village: 'builderBase',
    unlockBH: 1,
    maxLevel: 10,
    maxLevels: { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 1:1, 2:1, 3:1, 4:1, 5:2, 6:2, 7:2, 8:2, 9:2, 10:2 }
  },
  {
    id: 'bb_elixir_collector',
    slug: 'elixir_collector',
    name: 'Elixir Collector (BB)',
    category: 'resource',
    village: 'builderBase',
    unlockBH: 1,
    maxLevel: 10,
    maxLevels: { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 1:1, 2:1, 3:1, 4:1, 5:2, 6:2, 7:2, 8:2, 9:2, 10:2 }
  },
  {
    id: 'bb_gold_storage',
    slug: 'gold_storage',
    name: 'Gold Storage (BB)',
    category: 'resource',
    village: 'builderBase',
    unlockBH: 2,
    maxLevel: 10,
    maxLevels: { 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 2:1, 3:1, 4:1, 5:1, 6:1, 7:2, 8:2, 9:2, 10:2 }
  },
  {
    id: 'bb_elixir_storage',
    slug: 'elixir_storage',
    name: 'Elixir Storage (BB)',
    category: 'resource',
    village: 'builderBase',
    unlockBH: 2,
    maxLevel: 10,
    maxLevels: { 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 2:1, 3:1, 4:1, 5:1, 6:1, 7:2, 8:2, 9:2, 10:2 }
  },
  {
    id: 'bb_gem_mine',
    slug: 'gem_mine',
    name: 'Gem Mine',
    category: 'resource',
    village: 'builderBase',
    unlockBH: 3,
    maxLevel: 10,
    maxLevels: { 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1 }
  },
  {
    id: 'bb_clock_tower',
    slug: 'clock_tower',
    name: 'Clock Tower',
    category: 'resource',
    village: 'builderBase',
    unlockBH: 4,
    maxLevel: 10,
    maxLevels: { 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1 }
  },

  // Builder Base Traps
  {
    id: 'bb_spring_trap',
    slug: 'spring_trap',
    name: 'Spring Trap (BB)',
    category: 'trap',
    village: 'builderBase',
    unlockBH: 2,
    maxLevel: 10,
    maxLevels: { 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 2:1, 3:2, 4:3, 5:4, 6:4, 7:5, 8:6, 9:6, 10:6 }
  },
  {
    id: 'bb_push_trap',
    slug: 'push_trap',
    name: 'Push Trap',
    category: 'trap',
    village: 'builderBase',
    unlockBH: 2,
    maxLevel: 10,
    maxLevels: { 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 2:1, 3:2, 4:3, 5:4, 6:5, 7:5, 8:5, 9:6, 10:6 }
  },
  {
    id: 'bb_mine',
    slug: 'mine',
    name: 'Mine (BB)',
    category: 'trap',
    village: 'builderBase',
    unlockBH: 2,
    maxLevel: 10,
    maxLevels: { 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 2:2, 3:3, 4:4, 5:5, 6:5, 7:6, 8:7, 9:8, 10:8 }
  },
  {
    id: 'bb_mega_mine',
    slug: 'mega_mine',
    name: 'Mega Mine',
    category: 'trap',
    village: 'builderBase',
    unlockBH: 4,
    maxLevel: 10,
    maxLevels: { 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10 },
    quantities: { 4:1, 5:2, 6:2, 7:3, 8:4, 9:5, 10:5 }
  }
];

// Full catalogue of Village Helpers (housed in Helper Hut)
const HELPERS_CATALOG = [
  {
    id: 'builders_apprentice',
    slug: 'builders_apprentice',
    name: "Builder's Apprentice",
    description: "Speeds up builder upgrades in the Home Village",
    unlockTH: 10,
    maxLevel: 8,
    maxLevels: { 10: 2, 11: 4, 12: 6, 13: 7, 14: 8, 15: 8, 16: 8, 17: 8, 18: 8 },
    image: '/images/helpers/builders-apprentice.png'
  },
  {
    id: 'lab_assistant',
    slug: 'lab_assistant',
    name: "Lab Assistant",
    description: "Speeds up troop and spell research in the Laboratory",
    unlockTH: 9,
    maxLevel: 12,
    maxLevels: { 9: 1, 10: 3, 11: 4, 12: 6, 13: 8, 14: 10, 15: 11, 16: 12, 17: 12, 18: 12 },
    image: '/images/helpers/lab-assistant.png'
  },
  {
    id: 'alchemist',
    slug: 'alchemist',
    name: "Alchemist",
    description: "Transmutes Gold, Elixir and Dark Elixir with bonus",
    unlockTH: 11,
    maxLevel: 7,
    maxLevels: { 11: 1, 12: 2, 13: 3, 14: 4, 15: 5, 16: 6, 17: 7, 18: 7 },
    image: '/images/helpers/alchemist.png'
  },
  {
    id: 'prospector',
    slug: 'prospector',
    name: "Prospector",
    description: "Discovers hidden deposits and assists in resource harvesting",
    unlockTH: 10,
    maxLevel: 1,
    maxLevels: { 10: 1, 11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1 },
    image: '/images/helpers/prospector.png'
  }
];

// Full catalogue of Town Hall 18 Guardians
const GUARDIANS_CATALOG = [
  {
    id: 'smasher',
    slug: 'smasher',
    name: "Smasher",
    description: "Melee guardian with spiked club, enrages when TH falls and drops Rage on death",
    unlockTH: 18,
    maxLevel: 5,
    maxLevels: { 18: 5 },
    image: '/images/guardians/smasher.png'
  },
  {
    id: 'longshot',
    slug: 'longshot',
    name: "Longshot",
    description: "Long-range guardian firing explosive bolts with a massive death shockwave",
    unlockTH: 18,
    maxLevel: 5,
    maxLevels: { 18: 5 },
    image: '/images/guardians/longshot.png'
  },
  {
    id: 'logger',
    slug: 'logger',
    name: "Logger",
    description: "Piercing log launcher pushing back enemy ground and air troops",
    unlockTH: 18,
    maxLevel: 5,
    maxLevels: { 18: 5 },
    image: '/images/guardians/logger.png'
  }
];

class TrackerService {
  getMaxLevelForBH(building, bh) {
    if (!building) return 1;
    const safeBh = Math.min(10, Math.max(1, parseInt(bh, 10) || 1));
    if (safeBh < building.unlockBH) return 0;
    if (building.maxLevels && building.maxLevels[safeBh]) {
      return building.maxLevels[safeBh];
    }
    if (building.maxLevels) {
      for (let t = safeBh; t >= building.unlockBH; t--) {
        if (building.maxLevels[t]) return building.maxLevels[t];
      }
    }
    return building.maxLevel || 1;
  }

  getQuantityForBH(building, bh) {
    if (!building) return 1;
    const safeBh = Math.min(10, Math.max(1, parseInt(bh, 10) || 1));
    if (safeBh < building.unlockBH) return 0;
    if (building.quantities && building.quantities[safeBh]) {
      return building.quantities[safeBh];
    }
    if (building.quantities) {
      for (let t = safeBh; t >= building.unlockBH; t--) {
        if (building.quantities[t]) return building.quantities[t];
      }
    }
    return 1;
  }

  getBuilderBuildingsCatalog(bhLevel = null) {
    if (!bhLevel) return BUILDER_BUILDINGS_CATALOG;
    const safeBh = Math.min(10, Math.max(1, parseInt(bhLevel, 10) || 1));
    return BUILDER_BUILDINGS_CATALOG
      .filter(b => b.unlockBH <= safeBh)
      .map(b => ({
        ...b,
        maxLevelForTH: this.getMaxLevelForBH(b, safeBh),
        quantity: this.getQuantityForBH(b, safeBh)
      }));
  }

  getDefaultBuilderBuildingsForBH(bhLevel = 1) {
    const safeBh = Math.min(10, Math.max(1, parseInt(bhLevel, 10) || 1));
    const defaults = {};
    BUILDER_BUILDINGS_CATALOG.forEach(b => {
      if (b.unlockBH <= safeBh) {
        defaults[b.id] = {
          level: this.getMaxLevelForBH(b, safeBh),
          count: this.getQuantityForBH(b, safeBh)
        };
      }
    });
    return defaults;
  }
  getMaxLevelForTH(building, th) {
    if (!building) return 1;
    const safeTh = Math.min(18, Math.max(1, parseInt(th, 10) || 1));
    if (safeTh < building.unlockTH) return 0;
    if (building.maxLevels && building.maxLevels[safeTh]) {
      return building.maxLevels[safeTh];
    }
    if (building.maxLevels) {
      for (let t = safeTh; t >= building.unlockTH; t--) {
        if (building.maxLevels[t]) return building.maxLevels[t];
      }
    }
    return building.maxLevel || 1;
  }

  getQuantityForTH(building, th) {
    if (!building) return 1;
    const safeTh = Math.min(18, Math.max(1, parseInt(th, 10) || 1));
    if (safeTh < building.unlockTH) return 0;
    if (building.quantities && building.quantities[safeTh]) {
      return building.quantities[safeTh];
    }
    if (building.quantities) {
      for (let t = safeTh; t >= building.unlockTH; t--) {
        if (building.quantities[t]) return building.quantities[t];
      }
    }
    return 1;
  }

  getBuildingsCatalog(thLevel = null) {
    if (!thLevel) {
      return BUILDINGS_CATALOG;
    }
    const safeTh = Math.min(18, Math.max(1, parseInt(thLevel, 10) || 1));
    return BUILDINGS_CATALOG
      .filter(b => b.unlockTH <= safeTh)
      .map(b => ({
        ...b,
        maxLevelForTH: this.getMaxLevelForTH(b, safeTh),
        quantity: this.getQuantityForTH(b, safeTh)
      }));
  }

  getDefaultBuildingsForTH(thLevel = 1) {
    const safeTh = Math.min(18, Math.max(1, parseInt(thLevel, 10) || 1));
    const defaults = {};
    BUILDINGS_CATALOG.forEach(b => {
      if (b.unlockTH <= safeTh) {
        const maxForTh = this.getMaxLevelForTH(b, safeTh);
        const qty = this.getQuantityForTH(b, safeTh);
        defaults[b.id] = {
          level: maxForTh,
          count: qty
        };
      }
    });
    return defaults;
  }

  getHelpersCatalog() {
    return HELPERS_CATALOG;
  }

  getGuardiansCatalog() {
    return GUARDIANS_CATALOG;
  }

  /**
   * Compares an older snapshot with newer player data to find upgrade events.
   */
  detectDiffs(oldData, newData) {
    if (!oldData || !newData) return [];
    const events = [];
    const tag = newData.tag;
    const name = newData.name || 'Chief';

    // 1. Town Hall
    if (newData.townHallLevel > (oldData.townHallLevel || 0)) {
      events.push({
        playerTag: tag,
        playerName: name,
        category: 'townhall',
        icon: 'castle',
        title: 'Town Hall Upgraded!',
        description: `Upgraded to Town Hall Level ${newData.townHallLevel}!`,
        delta: newData.townHallLevel - (oldData.townHallLevel || 0)
      });
    }

    // 2. Heroes
    const oldHeroes = (oldData.heroes || []).reduce((acc, h) => { acc[h.name] = h.level; return acc; }, {});
    (newData.heroes || []).forEach(h => {
      const prevLvl = oldHeroes[h.name];
      if (prevLvl !== undefined && h.level > prevLvl) {
        events.push({
          playerTag: tag,
          playerName: name,
          category: 'hero',
          icon: 'crown',
          title: `Hero Upgraded: ${h.name}`,
          description: `Level ${prevLvl} ➜ ${h.level} (Max: ${h.maxLevel})`,
          delta: h.level - prevLvl
        });
      }
    });

    // 3. Hero Equipment
    const oldEquip = (oldData.heroEquipment || []).reduce((acc, eq) => { acc[eq.name] = eq.level; return acc; }, {});
    (newData.heroEquipment || []).forEach(eq => {
      const prevLvl = oldEquip[eq.name];
      if (prevLvl !== undefined && eq.level > prevLvl) {
        events.push({
          playerTag: tag,
          playerName: name,
          category: 'equipment',
          icon: 'shield',
          title: `Hero Equipment: ${eq.name}`,
          description: `Level ${prevLvl} ➜ ${eq.level} (Max: ${eq.maxLevel})`,
          delta: eq.level - prevLvl
        });
      }
    });

    // 4. Troops
    const oldTroops = (oldData.troops || []).reduce((acc, t) => { acc[t.name] = t.level; return acc; }, {});
    (newData.troops || []).forEach(t => {
      const prevLvl = oldTroops[t.name];
      if (prevLvl !== undefined && t.level > prevLvl) {
        events.push({
          playerTag: tag,
          playerName: name,
          category: 'troop',
          icon: 'swords',
          title: `Laboratory: ${t.name}`,
          description: `Level ${prevLvl} ➜ ${t.level} (Max: ${t.maxLevel})`,
          delta: t.level - prevLvl
        });
      }
    });

    // 5. Spells
    const oldSpells = (oldData.spells || []).reduce((acc, s) => { acc[s.name] = s.level; return acc; }, {});
    (newData.spells || []).forEach(s => {
      const prevLvl = oldSpells[s.name];
      if (prevLvl !== undefined && s.level > prevLvl) {
        events.push({
          playerTag: tag,
          playerName: name,
          category: 'spell',
          icon: 'flask',
          title: `Spell Upgraded: ${s.name}`,
          description: `Level ${prevLvl} ➜ ${s.level} (Max: ${s.maxLevel})`,
          delta: s.level - prevLvl
        });
      }
    });

    // 6. Achievements
    const oldAch = (oldData.achievements || []).reduce((acc, a) => { acc[a.name] = a; return acc; }, {});
    (newData.achievements || []).forEach(a => {
      const prev = oldAch[a.name];
      if (prev) {
        if (a.stars > prev.stars) {
          events.push({
            playerTag: tag,
            playerName: name,
            category: 'achievement',
            icon: 'star',
            title: `New Achievement Star!`,
            description: `${a.name}: Reached ${a.stars} stars!`,
            delta: a.stars - prev.stars
          });
        }
      }
    });

    // 7. War Stars
    if (newData.warStars && oldData.warStars && newData.warStars > oldData.warStars) {
      events.push({
        playerTag: tag,
        playerName: name,
        category: 'war',
        icon: 'trophy',
        title: `Additional War Stars`,
        description: `+${newData.warStars - oldData.warStars} war stars gained! (Total: ${newData.warStars})`,
        delta: newData.warStars - oldData.warStars
      });
    }

    return events;
  }

  /**
   * Computes comprehensive completion percentages and progression metrics.
   */
  computeMetrics(playerData) {
    if (!playerData) return null;

    // 1. Heroes completion (benchmarked to Town Hall 18 max levels)
    const homeHeroes = (playerData.heroes || []).filter(h => h.village === 'home' || !h.village);
    let heroesCur = 0, heroesMax = 0;
    homeHeroes.forEach(h => {
      const benchmarkMax = TH18_MAX_BENCHMARKS.heroes[h.name] || h.maxLevel || 1;
      const effectiveMax = Math.max(h.maxLevel || 1, benchmarkMax);
      heroesCur += (h.level || 0);
      heroesMax += effectiveMax;
    });
    const heroesPercent = heroesMax > 0 ? Math.min(100, Math.round((heroesCur / heroesMax) * 100)) : 0;

    // 2. Hero Equipment completion (calibrated across all 43 equipment pieces)
    const equipSpecs = (CocBenchmarks && CocBenchmarks.EQUIPMENT_BENCHMARKS) || {};
    const playerEquipList = playerData.heroEquipment || [];
    const equipMap = new Map(playerEquipList.map(eq => [eq.name, eq]));
    let equipCur = 0, equipMax = 0;
    const fullEquipment = [];

    Object.entries(equipSpecs).forEach(([name, spec]) => {
      const existing = equipMap.get(name);
      const lvl = (existing && existing.level) ? existing.level : 0;
      const maxLvl = existing?.maxLevel || spec.maxLevel || (spec.rarity === 'epic' ? 27 : 18);
      equipCur += lvl;
      equipMax += maxLvl;
      fullEquipment.push({
        name,
        level: lvl,
        maxLevel: maxLvl,
        village: 'home',
        hero: spec.hero,
        rarity: spec.rarity,
        source: spec.source,
        unlockTH: spec.unlockTH,
        isUnlocked: lvl > 0
      });
    });

    playerEquipList.forEach(eq => {
      if (!fullEquipment.some(x => x.name === eq.name)) {
        const lvl = eq.level || 0;
        const maxLvl = eq.maxLevel || 18;
        equipCur += lvl;
        equipMax += maxLvl;
        fullEquipment.push({
          ...eq,
          hero: '',
          rarity: maxLvl > 18 ? 'epic' : 'common',
          source: 'blacksmith',
          unlockTH: 8,
          isUnlocked: lvl > 0
        });
      }
    });

    const equipPercent = equipMax > 0 ? Math.min(100, Math.round((equipCur / equipMax) * 100)) : 0;

    // 3. Troops & Spells completion (Laboratory)
    const PET_NAMES = new Set([
      'L.A.S.S.I', 'Mighty Yak', 'Electro Owl', 'Unicorn', 'Phoenix',
      'Poison Lizard', 'Diggy', 'Frosty', 'Spirit Fox', 'Angry Jelly',
      'Greedy Raven', 'Sneezy'
    ]);
    const SUPER_NAMES = new Set([
      'Super Barbarian', 'Super Archer', 'Super Giant', 'Sneaky Goblin',
      'Super Wall Breaker', 'Rocket Balloon', 'Super Wizard', 'Super Dragon',
      'Inferno Dragon', 'Super Minion', 'Super Valkyrie', 'Super Witch',
      'Ice Hound', 'Super Bowler', 'Super Miner', 'Super Hog Rider', 'Super Yeti'
    ]);
    const isSuperOrPet = (t) => PET_NAMES.has(t.name) || SUPER_NAMES.has(t.name) || t.superTroopIsActive !== undefined || (t.name && t.name.startsWith('Super '));

    const homeTroops = (playerData.troops || []).filter(t => t.village === 'home' || !t.village);
    const labTroops = homeTroops.filter(t => !isSuperOrPet(t));
    const homeSpells = (playerData.spells || []).filter(s => s.village === 'home' || !s.village);
    let labCur = 0, labMax = 0;
    [...labTroops, ...homeSpells].forEach(item => {
      labCur += (item.level || 0);
      labMax += (item.maxLevel || 1);
    });
    const labPercent = labMax > 0 ? Math.min(100, Math.round((labCur / labMax) * 100)) : 0;

    // 4. Achievements breakdown
    const achievements = playerData.achievements || [];
    let totalStars = 0;
    let maxStars = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    const enrichedAchievements = achievements.map(a => {
      totalStars += (a.stars || 0);
      maxStars += 3;
      const isCompleted = a.stars === 3;
      if (isCompleted) completedCount++;
      else inProgressCount++;

      const percent = a.target > 0 ? Math.min(100, Math.round((a.value / a.target) * 100)) : 0;
      return {
        ...a,
        percent,
        isCompleted,
        remaining: Math.max(0, (a.target || 0) - (a.value || 0))
      };
    });

    const achPercent = maxStars > 0 ? Math.min(100, Math.round((totalStars / maxStars) * 100)) : 0;

    // 5. Town Hall maxing calculation (TH level relative to max TH 18)
    const maxTownHall = TH18_MAX_BENCHMARKS.maxTownHall;
    const thPercent = Math.min(100, Math.round(((playerData.townHallLevel || 1) / maxTownHall) * 100));

    // 6. Buildings & Defenses completion (filtered and calibrated to player's current Town Hall)
    const th = Math.min(18, Math.max(1, parseInt(playerData.townHallLevel, 10) || 1));
    const savedBuildings = playerData.buildings || this.getDefaultBuildingsForTH(th);

    // Only include buildings that are UNLOCKED for this Town Hall level!
    const unlockedCatalog = BUILDINGS_CATALOG.filter(b => b.unlockTH <= th);

    let bCur = 0, bMax = 0;
    const enrichedBuildings = unlockedCatalog.map(b => {
      const maxForTh = this.getMaxLevelForTH(b, th);
      const totalQty = this.getQuantityForTH(b, th);

      const saved = savedBuildings[b.id];
      let curLvl = maxForTh;
      let countAtLevel = totalQty;

      if (typeof saved === 'number') {
        curLvl = Math.min(maxForTh, Math.max(1, saved));
        countAtLevel = totalQty;
      } else if (typeof saved === 'object' && saved !== null) {
        curLvl = Math.min(maxForTh, Math.max(1, saved.level || maxForTh));
        countAtLevel = Math.min(totalQty, Math.max(0, parseInt(saved.count !== undefined ? saved.count : totalQty, 10)));
      }

      const isMaxed = curLvl >= maxForTh && countAtLevel >= totalQty;
      const pct = maxForTh > 0 ? Math.min(100, Math.round((curLvl / maxForTh) * 100)) : 0;

      bCur += (curLvl * countAtLevel) + (Math.max(0, curLvl - 1) * (totalQty - countAtLevel));
      bMax += (maxForTh * totalQty);

      return {
        ...b,
        level: curLvl,
        count: countAtLevel,
        quantity: totalQty,
        maxLevelForTH: maxForTh,
        percent: pct,
        isMaxed
      };
    });
    const buildingsPercent = bMax > 0 ? Math.min(100, Math.round((bCur / bMax) * 100)) : 0;

    // 7. Builder Base Buildings & Defenses completion (calibrated to player's current Builder Hall)
    const bh = Math.min(10, Math.max(1, parseInt(playerData.builderHallLevel, 10) || 1));
    const savedBB = playerData.builderBuildings || playerData.buildings || this.getDefaultBuilderBuildingsForBH(bh);
    const unlockedBBCatalog = BUILDER_BUILDINGS_CATALOG.filter(b => b.unlockBH <= bh);

    let bbCur = 0, bbMax = 0;
    const enrichedBuilderBuildings = unlockedBBCatalog.map(b => {
      const maxForBh = this.getMaxLevelForBH(b, bh);
      const totalQty = this.getQuantityForBH(b, bh);

      const saved = savedBB[b.id] || (playerData.buildings && playerData.buildings[b.id]);
      let curLvl = maxForBh;
      let countAtLevel = totalQty;

      if (typeof saved === 'number') {
        curLvl = Math.min(maxForBh, Math.max(1, saved));
        countAtLevel = totalQty;
      } else if (typeof saved === 'object' && saved !== null) {
        curLvl = Math.min(maxForBh, Math.max(1, saved.level || maxForBh));
        countAtLevel = Math.min(totalQty, Math.max(0, parseInt(saved.count !== undefined ? saved.count : totalQty, 10)));
      }

      const isMaxed = curLvl >= maxForBh && countAtLevel >= totalQty;
      const pct = maxForBh > 0 ? Math.min(100, Math.round((curLvl / maxForBh) * 100)) : 0;

      bbCur += (curLvl * countAtLevel) + (Math.max(0, curLvl - 1) * (totalQty - countAtLevel));
      bbMax += (maxForBh * totalQty);

      return {
        ...b,
        level: curLvl,
        count: countAtLevel,
        quantity: totalQty,
        maxLevelForTH: maxForBh,
        percent: pct,
        isMaxed
      };
    });
    const bbBuildingsPercent = bbMax > 0 ? Math.min(100, Math.round((bbCur / bbMax) * 100)) : 0;

    // 8. Helpers (Village Helpers housed in Helper Hut)
    const savedHelpers = playerData.helpers || {};
    let helpersCur = 0, helpersMax = 0;
    const enrichedHelpers = HELPERS_CATALOG.map(h => {
      const maxForTh = h.maxLevels[th] || (th < h.unlockTH ? 0 : h.maxLevel);
      const isUnlocked = th >= h.unlockTH;
      let curLvl = 0;
      if (savedHelpers[h.id] !== undefined) {
        const minLvl = isUnlocked ? 1 : 0;
        curLvl = Math.min(h.maxLevel, Math.max(minLvl, parseInt(savedHelpers[h.id], 10) || minLvl));
      } else if (isUnlocked) {
        curLvl = maxForTh;
      }
      const isThMax = isUnlocked && curLvl >= maxForTh && maxForTh > 0;
      const isGlobalMax = isUnlocked && curLvl >= h.maxLevel;
      const pct = maxForTh > 0 ? Math.min(100, Math.round((curLvl / maxForTh) * 100)) : 0;
      const diff = Math.max(0, maxForTh - curLvl);

      if (isUnlocked) {
        helpersCur += curLvl;
        helpersMax += maxForTh;
      }

      return {
        ...h,
        level: curLvl,
        maxForTH: maxForTh,
        isUnlocked,
        isThMax,
        isGlobalMax,
        percent: pct,
        diff,
        reqText: isUnlocked ? `Unlocked (TH${h.unlockTH})` : `Unlocks at TH ${h.unlockTH}`
      };
    });
    const helpersPercent = helpersMax > 0 ? Math.min(100, Math.round((helpersCur / helpersMax) * 100)) : (th < 9 ? 100 : 0);

    // 9. Guardians (Town Hall 18 Guardians)
    const savedGuardians = playerData.guardians || {};
    let guardiansCur = 0, guardiansMax = 0;
    const enrichedGuardians = GUARDIANS_CATALOG.map(g => {
      const maxForTh = th >= g.unlockTH ? g.maxLevel : 0;
      const isUnlocked = th >= g.unlockTH;
      let curLvl = 0;
      if (savedGuardians[g.id] !== undefined) {
        const minLvl = isUnlocked ? 1 : 0;
        curLvl = Math.min(g.maxLevel, Math.max(minLvl, parseInt(savedGuardians[g.id], 10) || minLvl));
      } else if (isUnlocked) {
        curLvl = maxForTh;
      }
      const isThMax = isUnlocked && curLvl >= maxForTh && maxForTh > 0;
      const isGlobalMax = isUnlocked && curLvl >= g.maxLevel;
      const pct = maxForTh > 0 ? Math.min(100, Math.round((curLvl / maxForTh) * 100)) : 0;
      const diff = Math.max(0, maxForTh - curLvl);

      if (isUnlocked) {
        guardiansCur += curLvl;
        guardiansMax += maxForTh;
      }

      return {
        ...g,
        level: curLvl,
        maxForTH: maxForTh,
        isUnlocked,
        isThMax,
        isGlobalMax,
        percent: pct,
        diff,
        reqText: isUnlocked ? `Unlocked (TH${g.unlockTH})` : `Unlocks at TH ${g.unlockTH}`
      };
    });
    const guardiansPercent = guardiansMax > 0 ? Math.min(100, Math.round((guardiansCur / guardiansMax) * 100)) : (th < 18 ? 100 : 0);

    // Weighted Overall Score (100% total):
    // Heroes (25%), Buildings (20%), Lab (20%), Equipment (15%), Town Hall (15%), Achievements (5%)
    const overallPercent = Math.round(
      (heroesPercent * 0.25) +
      (buildingsPercent * 0.20) +
      (labPercent * 0.20) +
      (equipPercent * 0.15) +
      (thPercent * 0.15) +
      (achPercent * 0.05)
    );

    // Achievements closest to completion
    const closestAchievements = enrichedAchievements
      .filter(a => !a.isCompleted && a.percent > 0)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5);

    return {
      overallPercent,
      townHall: {
        current: playerData.townHallLevel || 1,
        max: maxTownHall,
        percent: thPercent,
        weaponLevel: playerData.townHallWeaponLevel || 0
      },
      heroes: {
        currentLevels: heroesCur,
        maxLevels: heroesMax,
        percent: heroesPercent,
        count: homeHeroes.length,
        list: homeHeroes
      },
      equipment: {
        currentLevels: equipCur,
        maxLevels: equipMax,
        percent: equipPercent,
        count: fullEquipment.length,
        list: fullEquipment
      },
      laboratory: {
        currentLevels: labCur,
        maxLevels: labMax,
        percent: labPercent,
        troopsCount: labTroops.length,
        spellsCount: homeSpells.length
      },
      buildings: {
        currentLevels: bCur,
        maxLevels: bMax,
        percent: buildingsPercent,
        count: enrichedBuildings.length,
        townHallLevel: th,
        list: enrichedBuildings
      },
      builderBuildings: {
        currentLevels: bbCur,
        maxLevels: bbMax,
        percent: bbBuildingsPercent,
        count: enrichedBuilderBuildings.length,
        builderHallLevel: bh,
        list: enrichedBuilderBuildings
      },
      helpers: {
        currentLevels: helpersCur,
        maxLevels: helpersMax,
        percent: helpersPercent,
        count: enrichedHelpers.length,
        list: enrichedHelpers
      },
      guardians: {
        currentLevels: guardiansCur,
        maxLevels: guardiansMax,
        percent: guardiansPercent,
        count: enrichedGuardians.length,
        list: enrichedGuardians
      },
      achievements: {
        totalStars,
        maxStars,
        percent: achPercent,
        completedCount,
        inProgressCount,
        totalCount: achievements.length,
        closest: closestAchievements,
        list: enrichedAchievements
      }
    };
  }

  /**
   * Automatically parses any helper or guardian data from Supercell API payload
   * (e.g. if Supercell includes them in troops, heroes, or dedicated fields).
   */
  extractHelpersAndGuardians(playerData) {
    const helpers = {};
    const guardians = {};
    if (!playerData || typeof playerData !== 'object') return { helpers, guardians };

    // 1. Direct fields if present in Supercell API or JSON
    if (playerData.helpers && typeof playerData.helpers === 'object') {
      Object.assign(helpers, playerData.helpers);
    }
    if (playerData.villageHelpers && typeof playerData.villageHelpers === 'object') {
      Object.assign(helpers, playerData.villageHelpers);
    }
    if (playerData.guardians && typeof playerData.guardians === 'object') {
      Object.assign(guardians, playerData.guardians);
    }
    if (playerData.villageGuardians && typeof playerData.villageGuardians === 'object') {
      Object.assign(guardians, playerData.villageGuardians);
    }

    // 2. Scan troops, heroes, equipment arrays if Supercell includes them as units
    const allUnits = [
      ...(playerData.troops || []),
      ...(playerData.heroes || []),
      ...(playerData.heroEquipment || []),
      ...(playerData.spells || [])
    ];

    allUnits.forEach(u => {
      if (!u || !u.name) return;
      const clean = String(u.name).toLowerCase().replace(/[^a-z0-9]/g, '');
      const lvl = parseInt(u.level, 10);
      if (isNaN(lvl) || lvl < 0) return;

      // Check Village Helpers
      if (clean.includes('buildersapprentice') || clean.includes('apprenticebuilder') || (clean === 'apprentice' && !clean.includes('warden'))) {
        helpers.builders_apprentice = Math.max(1, lvl);
      } else if (clean.includes('labassistant') || clean.includes('assistantlab')) {
        helpers.lab_assistant = Math.max(1, lvl);
      } else if (clean.includes('alchemist')) {
        helpers.alchemist = Math.max(1, lvl);
      } else if (clean.includes('prospector')) {
        helpers.prospector = Math.max(1, lvl);
      }

      // Check TH18 Guardians
      if (clean === 'smasher' || clean.includes('guardiansmasher')) {
        guardians.smasher = Math.max(1, lvl);
      } else if (clean === 'longshot' || clean.includes('guardianlongshot')) {
        guardians.longshot = Math.max(1, lvl);
      } else if (clean === 'logger' || clean.includes('guardianlogger')) {
        guardians.logger = Math.max(1, lvl);
      }
    });

    return { helpers, guardians };
  }

  extractBuildingsFromRaw(raw) {
    const result = {};
    if (!raw) return result;

    let meta = {
      homeCount: 0,
      builderCount: 0,
      townHallLevel: null,
      builderHallLevel: null,
      helpers: {},
      guardians: {}
    };

    if (raw.helpers && typeof raw.helpers === 'object') {
      Object.assign(meta.helpers, raw.helpers);
    }
    if (raw.villageHelpers && typeof raw.villageHelpers === 'object') {
      Object.assign(meta.helpers, raw.villageHelpers);
    }
    if (raw.guardians && typeof raw.guardians === 'object') {
      Object.assign(meta.guardians, raw.guardians);
    }
    if (raw.villageGuardians && typeof raw.villageGuardians === 'object') {
      Object.assign(meta.guardians, raw.villageGuardians);
    }

    if (raw.townHallLevel) meta.townHallLevel = parseInt(raw.townHallLevel, 10);
    if (raw.builderHallLevel) meta.builderHallLevel = parseInt(raw.builderHallLevel, 10);

    const hasStructured = raw.buildings || raw.traps || raw.buildings2 || raw.traps2;

    if (hasStructured) {
      const agg = {};

      const processList = (list, isBB) => {
        if (!Array.isArray(list)) return;
        list.forEach(item => {
          if (!item || typeof item !== 'object') return;
          const dataId = item.data !== undefined ? item.data : (item.id !== undefined ? item.id : null);
          let bldId = null;

          if (dataId !== null && dataId !== undefined) {
            const num = parseInt(dataId, 10);
            if (!isNaN(num)) {
              if (isBB) {
                bldId = BUILDER_DATA_ID_MAP[num] || HOME_DATA_ID_MAP[num];
              } else {
                bldId = HOME_DATA_ID_MAP[num] || BUILDER_DATA_ID_MAP[num];
              }
            }
          }

          if (!bldId && (item.id || item.slug || item.name)) {
            const rawKey = String(item.id || item.slug || item.name).toLowerCase().replace(/[\s-]+/g, '_');
            bldId = isBB && !rawKey.startsWith('bb_') ? `bb_${rawKey}` : rawKey;
          }

          if (!bldId) return;

          // Special calibration for Town Hall & Builder Hall
          if (bldId === 'town_hall' || bldId === '1000001') {
            const thLvl = parseInt(item.lvl !== undefined ? item.lvl : item.level, 10);
            if (!isNaN(thLvl) && thLvl > 0) meta.townHallLevel = thLvl;
            return;
          }
          if (bldId === 'bb_builder_hall' || bldId === '1000034') {
            const bhLvl = parseInt(item.lvl !== undefined ? item.lvl : item.level, 10);
            if (!isNaN(bhLvl) && bhLvl > 0) meta.builderHallLevel = bhLvl;
            return;
          }

          // Normalize walls
          if (bldId === 'walls') bldId = 'wall';
          if (bldId === 'bb_walls') bldId = 'bb_wall';

          const level = parseInt(item.lvl !== undefined ? item.lvl : (item.level !== undefined ? item.level : item.currentLevel), 10);
          if (isNaN(level) || level <= 0) return;

          const count = parseInt(item.cnt !== undefined ? item.cnt : (item.count !== undefined ? item.count : (item.quantity !== undefined ? item.quantity : 1)), 10) || 1;

          if (!agg[bldId]) {
            agg[bldId] = { maxLvl: level, countAtMax: count, totalCount: count };
          } else {
            agg[bldId].totalCount += count;
            if (level > agg[bldId].maxLvl) {
              agg[bldId].maxLvl = level;
              agg[bldId].countAtMax = count;
            } else if (level === agg[bldId].maxLvl) {
              agg[bldId].countAtMax += count;
            }
          }
        });
      };

      if (raw.buildings) processList(raw.buildings, false);
      if (raw.traps) processList(raw.traps, false);
      if (raw.buildings2) processList(raw.buildings2, true);
      if (raw.traps2) processList(raw.traps2, true);

      Object.entries(agg).forEach(([id, data]) => {
        result[id] = { level: data.maxLvl, count: data.countAtMax };
        if (id.startsWith('bb_')) {
          meta.builderCount++;
        } else {
          meta.homeCount++;
        }
      });
    } else {
      // Fallback for legacy key-value or flat array
      const data = raw.village || raw;
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (!item || typeof item !== 'object') return;
          const dataId = item.data !== undefined ? item.data : (item.id || item.slug || item.name);
          let normId = null;
          if (typeof dataId === 'number' || !isNaN(parseInt(dataId, 10))) {
            const num = parseInt(dataId, 10);
            normId = HOME_DATA_ID_MAP[num] || BUILDER_DATA_ID_MAP[num];
          }
          if (!normId && dataId) {
            normId = String(dataId).toLowerCase().replace(/[\s-]+/g, '_');
          }
          if (!normId) return;
          if (normId === 'walls') normId = 'wall';
          if (normId === 'bb_walls') normId = 'bb_wall';

          const level = parseInt(item.lvl !== undefined ? item.lvl : (item.level !== undefined ? item.level : item.currentLevel), 10);
          const count = item.cnt !== undefined ? parseInt(item.cnt, 10) : (item.count !== undefined ? parseInt(item.count, 10) : (item.quantity !== undefined ? parseInt(item.quantity, 10) : undefined));
          if (!isNaN(level) && level > 0) {
            result[normId] = count !== undefined ? { level, count } : level;
            if (normId.startsWith('bb_')) meta.builderCount++; else meta.homeCount++;
          }
        });
      } else if (typeof data === 'object') {
        Object.entries(data).forEach(([key, val]) => {
          if (['replace', 'village', 'playerTag', 'action', '__meta'].includes(key)) return;
          let normId = key;
          const num = parseInt(key, 10);
          if (!isNaN(num)) {
            normId = HOME_DATA_ID_MAP[num] || BUILDER_DATA_ID_MAP[num] || key;
          } else {
            normId = String(key).toLowerCase().replace(/[\s-]+/g, '_');
          }
          if (normId === 'walls') normId = 'wall';
          if (normId === 'bb_walls') normId = 'bb_wall';

          if (typeof val === 'number') {
            if (val > 0) {
              result[normId] = val;
              if (normId.startsWith('bb_')) meta.builderCount++; else meta.homeCount++;
            }
          } else if (typeof val === 'object' && val !== null) {
            const lvl = parseInt(val.level !== undefined ? val.level : val.lvl, 10);
            const cnt = val.count !== undefined ? parseInt(val.count, 10) : (val.cnt !== undefined ? parseInt(val.cnt, 10) : undefined);
            if (!isNaN(lvl) && lvl > 0) {
              result[normId] = cnt !== undefined ? { level: lvl, count: cnt } : lvl;
              if (normId.startsWith('bb_')) meta.builderCount++; else meta.homeCount++;
            }
          }
        });
      }
    }

    Object.defineProperty(result, '__meta', {
      enumerable: false,
      writable: true,
      value: meta
    });

    return result;
  }
}

const HOME_DATA_ID_MAP = {
  1000000: 'army_camp',
  1000001: 'town_hall',
  1000002: 'elixir_collector',
  1000003: 'elixir_storage',
  1000004: 'gold_mine',
  1000005: 'gold_storage',
  1000006: 'barracks',
  1000007: 'laboratory',
  1000008: 'cannon',
  1000009: 'archer_tower',
  1000010: 'wall',
  1000011: 'wizard_tower',
  1000012: 'air_defense',
  1000013: 'mortar',
  1000014: 'clan_castle',
  1000015: 'builder_hut',
  1000019: 'hidden_tesla',
  1000020: 'spell_factory',
  1000021: 'x_bow',
  1000023: 'dark_elixir_drill',
  1000024: 'dark_elixir_storage',
  1000026: 'dark_barracks',
  1000027: 'inferno_tower',
  1000028: 'air_sweeper',
  1000029: 'dark_spell_factory',
  1000031: 'eagle_artillery',
  1000032: 'bomb_tower',
  1000059: 'workshop',
  1000064: 'builder_hut',
  1000067: 'scattershot',
  1000068: 'pet_house',
  1000070: 'blacksmith',
  1000071: 'hero_hall',
  1000072: 'spell_tower',
  1000077: 'monolith',
  1000079: 'multi_gear_tower',
  1000084: 'multi_archer_tower',
  1000085: 'ricochet_cannon',
  1000086: 'revenge_tower',
  1000089: 'firespitter',
  1000093: 'helper_hut',
  1000097: 'crafting_station',
  1000102: 'super_wizard_tower',
  // Traps in Home Village
  12000000: 'bomb',
  12000001: 'spring_trap',
  12000002: 'giant_bomb',
  12000005: 'air_bomb',
  12000006: 'seeking_air_mine',
  12000008: 'skeleton_trap',
  12000016: 'tornado_trap',
  12000020: 'giga_bomb'
};

const BUILDER_DATA_ID_MAP = {
  1000033: 'bb_wall',
  1000034: 'bb_builder_hall',
  1000035: 'bb_elixir_collector',
  1000036: 'bb_elixir_storage',
  1000037: 'bb_gold_mine',
  1000038: 'bb_gold_storage',
  1000039: 'bb_clock_tower',
  1000040: 'bb_builder_barracks',
  1000041: 'bb_double_cannon',
  1000042: 'bb_army_camp',
  1000043: 'bb_mega_tesla',
  1000044: 'bb_cannon',
  1000045: 'bb_multi_mortar',
  1000046: 'bb_star_laboratory',
  1000047: 'bb_otto_outpost',
  1000048: 'bb_archer_tower',
  1000049: 'bb_army_camp',
  1000050: 'bb_firecrackers',
  1000051: 'bb_guard_post',
  1000052: 'bb_mega_tesla',
  1000054: 'bb_air_bombs',
  1000055: 'bb_crusher',
  1000056: 'bb_roaster',
  1000057: 'bb_giant_cannon',
  1000058: 'bb_gem_mine',
  1000063: 'bb_lava_launcher',
  1000065: 'bb_bob_control',
  1000078: 'bb_otto_outpost',
  1000081: 'bb_x_bow',
  1000082: 'bb_healing_hut',
  // Traps in Builder Base
  12000010: 'bb_spring_trap',
  12000011: 'bb_push_trap',
  12000013: 'bb_mine',
  12000014: 'bb_mega_mine'
};

const trackerInstance = new TrackerService();
trackerInstance.HOME_DATA_ID_MAP = HOME_DATA_ID_MAP;
trackerInstance.BUILDER_DATA_ID_MAP = BUILDER_DATA_ID_MAP;

module.exports = trackerInstance;
