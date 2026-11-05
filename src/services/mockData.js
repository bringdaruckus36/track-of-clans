/**
 * Realistic Clash of Clans player profiles for immediate preview and testing
 * Modeled strictly after the official Supercell Clash of Clans v1 API responses.
 */

const mockProfiles = [
  {
    tag: '#98P0L0V9',
    name: 'Chief Arthur',
    nickname: 'Main Account (TH18)',
    townHallLevel: 18,
    townHallWeaponLevel: 5,
    expLevel: 258,
    trophies: 5450,
    bestTrophies: 5780,
    warStars: 1980,
    attackWins: 165,
    defenseWins: 32,
    builderHallLevel: 10,
    builderBaseTrophies: 4950,
    bestBuilderBaseTrophies: 5200,
    donations: 9200,
    donationsReceived: 3100,
    role: 'coLeader',
    warPreference: 'in',
    clan: {
      tag: '#2PR98LQ',
      name: 'Clash Legends',
      clanLevel: 24,
      badgeUrls: {
        small: 'https://api-assets.clashofclans.com/badges/70/4nQf92iYVpM1p2i.png',
        large: 'https://api-assets.clashofclans.com/badges/512/4nQf92iYVpM1p2i.png',
        medium: 'https://api-assets.clashofclans.com/badges/200/4nQf92iYVpM1p2i.png'
      }
    },
    league: {
      id: 29000022,
      name: 'Legend League',
      iconUrls: {
        small: 'https://api-assets.clashofclans.com/leagues/72/R2zmhyqQ0_lKcDR5EyghXCxghC9Uh_263KA4Aa9JU0U.png',
        tiny: 'https://api-assets.clashofclans.com/leagues/36/R2zmhyqQ0_lKcDR5EyghXCxghC9Uh_263KA4Aa9JU0U.png',
        medium: 'https://api-assets.clashofclans.com/leagues/288/R2zmhyqQ0_lKcDR5EyghXCxghC9Uh_263KA4Aa9JU0U.png'
      }
    },
    leagueTier: {
      id: 105000033,
      name: 'Electro League 33',
      iconUrls: {
        small: 'https://api-assets.clashofclans.com/leaguetiers/125/iX8uNhG6jBcQATWFS8a0gtidGy9O1PRYtXZZMTtUK3U.png',
        large: 'https://api-assets.clashofclans.com/leaguetiers/326/iX8uNhG6jBcQATWFS8a0gtidGy9O1PRYtXZZMTtUK3U.png'
      }
    },
    builderBaseLeague: {
      id: 44000030,
      name: 'Diamond League I'
    },
    heroes: [
      { name: 'Barbarian King', level: 105, maxLevel: 110, village: 'home', equipment: [
        { name: 'Giant Gauntlet', level: 27, maxLevel: 27, village: 'home' },
        { name: 'Rage Vial', level: 18, maxLevel: 18, village: 'home' }
      ]},
      { name: 'Archer Queen', level: 108, maxLevel: 110, village: 'home', equipment: [
        { name: 'Frozen Arrow', level: 27, maxLevel: 27, village: 'home' },
        { name: 'Invisibility Vial', level: 18, maxLevel: 18, village: 'home' }
      ]},
      { name: 'Grand Warden', level: 82, maxLevel: 85, village: 'home', equipment: [
        { name: 'Eternal Tome', level: 18, maxLevel: 18, village: 'home' },
        { name: 'Healing Tome', level: 18, maxLevel: 18, village: 'home' }
      ]},
      { name: 'Royal Champion', level: 52, maxLevel: 55, village: 'home', equipment: [
        { name: 'Seeking Shield', level: 18, maxLevel: 18, village: 'home' },
        { name: 'Haste Vial', level: 18, maxLevel: 18, village: 'home' }
      ]},
      { name: 'Minion Prince', level: 90, maxLevel: 95, village: 'home' },
      { name: 'Battle Machine', level: 35, maxLevel: 35, village: 'builderBase' },
      { name: 'Battle Copter', level: 35, maxLevel: 35, village: 'builderBase' }
    ],
    heroEquipment: [
      { name: 'Giant Gauntlet', level: 27, maxLevel: 27, village: 'home' },
      { name: 'Spiky Ball', level: 26, maxLevel: 27, village: 'home' },
      { name: 'Rage Vial', level: 18, maxLevel: 18, village: 'home' },
      { name: 'Barbarian Puppet', level: 18, maxLevel: 18, village: 'home' },
      { name: 'Frozen Arrow', level: 27, maxLevel: 27, village: 'home' },
      { name: 'Invisibility Vial', level: 18, maxLevel: 18, village: 'home' },
      { name: 'Archer Puppet', level: 18, maxLevel: 18, village: 'home' },
      { name: 'Healer Puppet', level: 18, maxLevel: 18, village: 'home' },
      { name: 'Eternal Tome', level: 18, maxLevel: 18, village: 'home' },
      { name: 'Healing Tome', level: 18, maxLevel: 18, village: 'home' },
      { name: 'Life Gem', level: 18, maxLevel: 18, village: 'home' },
      { name: 'Fireball', level: 26, maxLevel: 27, village: 'home' },
      { name: 'Seeking Shield', level: 18, maxLevel: 18, village: 'home' },
      { name: 'Royal Gem', level: 18, maxLevel: 18, village: 'home' },
      { name: 'Haste Vial', level: 18, maxLevel: 18, village: 'home' },
      { name: 'Rocket Spears', level: 26, maxLevel: 27, village: 'home' }
    ],
    troops: [
      { name: 'Barbarian', level: 13, maxLevel: 13, village: 'home' },
      { name: 'Archer', level: 13, maxLevel: 13, village: 'home' },
      { name: 'Giant', level: 13, maxLevel: 13, village: 'home' },
      { name: 'Goblin', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Wall Breaker', level: 13, maxLevel: 13, village: 'home' },
      { name: 'Balloon', level: 12, maxLevel: 12, village: 'home' },
      { name: 'Wizard', level: 13, maxLevel: 13, village: 'home' },
      { name: 'Healer', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Dragon', level: 12, maxLevel: 12, village: 'home' },
      { name: 'P.E.K.K.A', level: 12, maxLevel: 12, village: 'home' },
      { name: 'Baby Dragon', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Miner', level: 11, maxLevel: 11, village: 'home' },
      { name: 'Electro Dragon', level: 8, maxLevel: 8, village: 'home' },
      { name: 'Yeti', level: 7, maxLevel: 7, village: 'home' },
      { name: 'Dragon Rider', level: 5, maxLevel: 5, village: 'home' },
      { name: 'Electro Titan', level: 4, maxLevel: 4, village: 'home' },
      { name: 'Root Rider', level: 4, maxLevel: 4, village: 'home' },
      { name: 'Minion', level: 13, maxLevel: 13, village: 'home' },
      { name: 'Hog Rider', level: 14, maxLevel: 14, village: 'home' },
      { name: 'Valkyrie', level: 12, maxLevel: 12, village: 'home' },
      { name: 'Golem', level: 14, maxLevel: 14, village: 'home' },
      { name: 'Witch', level: 8, maxLevel: 8, village: 'home' },
      { name: 'Lava Hound', level: 8, maxLevel: 8, village: 'home' },
      { name: 'Bowler', level: 9, maxLevel: 9, village: 'home' },
      { name: 'Ice Golem', level: 9, maxLevel: 9, village: 'home' },
      { name: 'Headhunter', level: 4, maxLevel: 4, village: 'home' },
      { name: 'Apprentice Warden', level: 5, maxLevel: 5, village: 'home' },
      { name: 'Druid', level: 5, maxLevel: 5, village: 'home' },
      // Siege Machines
      { name: 'Wall Wrecker', level: 5, maxLevel: 5, village: 'home' },
      { name: 'Battle Blimp', level: 4, maxLevel: 4, village: 'home' },
      { name: 'Stone Slammer', level: 5, maxLevel: 5, village: 'home' },
      { name: 'Siege Barracks', level: 5, maxLevel: 5, village: 'home' },
      { name: 'Log Launcher', level: 5, maxLevel: 5, village: 'home' },
      { name: 'Flame Flinger', level: 4, maxLevel: 4, village: 'home' },
      { name: 'Battle Drill', level: 4, maxLevel: 4, village: 'home' },
      // Hero Pets
      { name: 'L.A.S.S.I', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Electro Owl', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Mighty Yak', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Unicorn', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Frosty', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Diggy', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Poison Lizard', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Phoenix', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Spirit Fox', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Angry Jelly', level: 10, maxLevel: 10, village: 'home' },
      // Super Troops
      { name: 'Super Barbarian', level: 13, maxLevel: 13, village: 'home', superTroopIsActive: true },
      { name: 'Sneaky Goblin', level: 10, maxLevel: 10, village: 'home', superTroopIsActive: true },
      { name: 'Super Wall Breaker', level: 13, maxLevel: 13, village: 'home', superTroopIsActive: false },
      { name: 'Super Dragon', level: 12, maxLevel: 12, village: 'home', superTroopIsActive: false },
      { name: 'Inferno Dragon', level: 10, maxLevel: 10, village: 'home', superTroopIsActive: false },
      { name: 'Rocket Balloon', level: 12, maxLevel: 12, village: 'home', superTroopIsActive: false },
      { name: 'Super Archer', level: 13, maxLevel: 13, village: 'home', superTroopIsActive: false },
      { name: 'Super Wizard', level: 13, maxLevel: 13, village: 'home', superTroopIsActive: false },
      { name: 'Super Giant', level: 13, maxLevel: 13, village: 'home', superTroopIsActive: false },
      { name: 'Super Minion', level: 13, maxLevel: 13, village: 'home', superTroopIsActive: false },
      { name: 'Super Valkyrie', level: 12, maxLevel: 12, village: 'home', superTroopIsActive: false },
      { name: 'Super Witch', level: 8, maxLevel: 8, village: 'home', superTroopIsActive: false },
      { name: 'Ice Hound', level: 8, maxLevel: 8, village: 'home', superTroopIsActive: false },
      { name: 'Super Bowler', level: 9, maxLevel: 9, village: 'home', superTroopIsActive: false },
      { name: 'Super Miner', level: 11, maxLevel: 11, village: 'home', superTroopIsActive: false },
      { name: 'Super Hog Rider', level: 14, maxLevel: 14, village: 'home', superTroopIsActive: false },
      { name: 'Super Yeti', level: 7, maxLevel: 7, village: 'home', superTroopIsActive: false },
      // Builder base (kept as-is)
      { name: 'Raged Barbarian', level: 20, maxLevel: 20, village: 'builderBase' },
      { name: 'Sneaky Archer', level: 20, maxLevel: 20, village: 'builderBase' },
      { name: 'Boxer Giant', level: 20, maxLevel: 20, village: 'builderBase' },
      { name: 'Beta Minion', level: 20, maxLevel: 20, village: 'builderBase' },
      { name: 'Bomber', level: 20, maxLevel: 20, village: 'builderBase' },
      { name: 'Baby Dragon', level: 20, maxLevel: 20, village: 'builderBase' },
      { name: 'Cannon Cart', level: 20, maxLevel: 20, village: 'builderBase' },
      { name: 'Night Witch', level: 20, maxLevel: 20, village: 'builderBase' },
      { name: 'Drop Ship', level: 20, maxLevel: 20, village: 'builderBase' },
      { name: 'Power P.E.K.K.A', level: 20, maxLevel: 20, village: 'builderBase' },
      { name: 'Hog Glider', level: 20, maxLevel: 20, village: 'builderBase' },
      { name: 'Electrofire Wizard', level: 20, maxLevel: 20, village: 'builderBase' }
    ],
    spells: [
      { name: 'Lightning Spell', level: 12, maxLevel: 12, village: 'home' },
      { name: 'Healing Spell', level: 10, maxLevel: 10, village: 'home' },
      { name: 'Rage Spell', level: 6, maxLevel: 6, village: 'home' },
      { name: 'Jump Spell', level: 5, maxLevel: 5, village: 'home' },
      { name: 'Freeze Spell', level: 8, maxLevel: 8, village: 'home' },
      { name: 'Clone Spell', level: 9, maxLevel: 9, village: 'home' },
      { name: 'Invisibility Spell', level: 5, maxLevel: 5, village: 'home' },
      { name: 'Recall Spell', level: 6, maxLevel: 6, village: 'home' },
      { name: 'Poison Spell', level: 11, maxLevel: 11, village: 'home' },
      { name: 'Earthquake Spell', level: 6, maxLevel: 6, village: 'home' },
      { name: 'Haste Spell', level: 6, maxLevel: 6, village: 'home' },
      { name: 'Skeleton Spell', level: 9, maxLevel: 9, village: 'home' },
      { name: 'Bat Spell', level: 7, maxLevel: 7, village: 'home' },
      { name: 'Overgrowth Spell', level: 5, maxLevel: 5, village: 'home' }
    ],
    achievements: [
      { name: 'Bigger Coffers', stars: 3, value: 16, target: 16, info: 'Upgrade a Gold Storage to Level 16', completionInfo: 'Completed!', village: 'home' },
      { name: 'Get those Goblins!', stars: 3, value: 150, target: 150, info: 'Win 150 stars on the Campaign Map', completionInfo: 'Completed!', village: 'home' },
      { name: 'Bigger & Better', stars: 3, value: 18, target: 18, info: 'Upgrade Town Hall to Level 18', completionInfo: 'Completed!', village: 'home' },
      { name: 'Nice and Tidy', stars: 3, value: 1840, target: 500, info: 'Clear 500 obstacles (trees, rocks, bushes)', completionInfo: 'Completed!', village: 'home' },
      { name: 'Release the Beasts', stars: 3, value: 1, target: 1, info: 'Unlock Dragon in the Barracks', completionInfo: 'Completed!', village: 'home' },
      { name: 'Gold Grab', stars: 3, value: 2000000000, target: 2000000000, info: 'Steal 2,000,000,000 Gold', completionInfo: 'Completed!', village: 'home' },
      { name: 'Elixir Escapade', stars: 3, value: 2000000000, target: 2000000000, info: 'Steal 2,000,000,000 Elixir', completionInfo: 'Completed!', village: 'home' },
      { name: 'Sweet Victory!', stars: 3, value: 5320, target: 1250, info: 'Reach 1,250 trophies in multiplayer battles', completionInfo: 'Completed!', village: 'home' },
      { name: 'Empire Builder', stars: 3, value: 10, target: 10, info: 'Rebuild Clan Castle to highest level', completionInfo: 'Completed!', village: 'home' },
      { name: 'Wall Buster', stars: 3, value: 45000, target: 2000, info: 'Destroy 2,000 walls in multiplayer battles', completionInfo: 'Completed!', village: 'home' },
      { name: 'Humiliator', stars: 3, value: 6500, target: 2000, info: 'Destroy 2,000 Town Halls in multiplayer battles', completionInfo: 'Completed!', village: 'home' },
      { name: 'Union Buster', stars: 3, value: 5800, target: 2500, info: 'Destroy 2,500 Builder Huts', completionInfo: 'Completed!', village: 'home' },
      { name: 'Conqueror', stars: 3, value: 8900, target: 5000, info: 'Win 5,000 multiplayer battles', completionInfo: 'Completed!', village: 'home' },
      { name: 'Unbreakable', stars: 2, value: 3820, target: 5000, info: 'Successfully defend against 5,000 attacks', completionInfo: 'In progress: 3,820 / 5,000', village: 'home' },
      { name: 'Friend in Need', stars: 3, value: 650000, target: 25000, info: 'Donate 25,000 clan castle capacity to clanmates', completionInfo: 'Completed!', village: 'home' },
      { name: 'Mortar Mauler', stars: 3, value: 12000, target: 5000, info: 'Destroy 5,000 Mortars in battles', completionInfo: 'Completed!', village: 'home' },
      { name: 'Heroic Heist', stars: 3, value: 185000000, target: 1000000, info: 'Steal 1,000,000 Dark Elixir', completionInfo: 'Completed!', village: 'home' },
      { name: 'League All-Star', stars: 3, value: 32, target: 32, info: 'Enter the Legend League', completionInfo: 'Completed!', village: 'home' },
      { name: 'X-Bow Exterminator', stars: 3, value: 6200, target: 2500, info: 'Destroy 2,500 X-Bows in battles', completionInfo: 'Completed!', village: 'home' },
      { name: 'Firefighter', stars: 3, value: 4100, target: 5000, info: 'Destroy 5,000 Inferno Towers', completionInfo: 'In progress: 4,100 / 5,000', village: 'home' },
      { name: 'War Hero', stars: 3, value: 1845, target: 1000, info: 'Gain 1,000 stars for your clan in Clan Wars', completionInfo: 'Completed!', village: 'home' },
      { name: 'Clan Capital Connoisseur', stars: 3, value: 2450000, target: 1000000, info: 'Contribute 1,000,000 Capital Gold', completionInfo: 'Completed!', village: 'home' },
      { name: 'Master Engineering', stars: 3, value: 10, target: 10, info: 'Upgrade Builder Hall to Level 10', completionInfo: 'Completed!', village: 'builderBase' },
      { name: 'Champion Builder', stars: 3, value: 4950, target: 3000, info: 'Reach 3,000 trophies in Builder Base', completionInfo: 'Completed!', village: 'builderBase' },
      { name: 'Un-Build It', stars: 2, value: 1420, target: 2000, info: 'Destroy 2,000 Builder Halls', completionInfo: 'In progress: 1,420 / 2,000', village: 'builderBase' }
    ]
  },
  {
    tag: '#2Q8R9YLL',
    name: 'ValkyrieQueen',
    nickname: 'Second Account (TH13)',
    townHallLevel: 13,
    townHallWeaponLevel: 3,
    expLevel: 168,
    trophies: 3120,
    bestTrophies: 3450,
    warStars: 780,
    attackWins: 65,
    defenseWins: 12,
    builderHallLevel: 9,
    builderBaseTrophies: 3200,
    bestBuilderBaseTrophies: 3300,
    donations: 3100,
    donationsReceived: 2900,
    role: 'elder',
    warPreference: 'in',
    clan: {
      tag: '#2PR98LQ',
      name: 'Clash Legends',
      clanLevel: 24,
      badgeUrls: {
        small: 'https://api-assets.clashofclans.com/badges/70/4nQf92iYVpM1p2i.png',
        large: 'https://api-assets.clashofclans.com/badges/512/4nQf92iYVpM1p2i.png',
        medium: 'https://api-assets.clashofclans.com/badges/200/4nQf92iYVpM1p2i.png'
      }
    },
    league: {
      id: 29000015,
      name: 'Champion League II',
      iconUrls: {
        small: 'https://api-assets.clashofclans.com/leagues/72/JmmNbD5-Sz07PnkNYBllw3vg5slE-Bcz078dnTBsBG8.png',
        medium: 'https://api-assets.clashofclans.com/leagues/288/JmmNbD5-Sz07PnkNYBllw3vg5slE-Bcz078dnTBsBG8.png'
      }
    },
    leagueTier: {
      id: 105000028,
      name: 'Dragon League 28',
      iconUrls: {
        small: 'https://api-assets.clashofclans.com/leaguetiers/125/YCZ7O_3_c8eCBYvX-92qiWeLc6Md6eNJ5A8O-2vUg7I.png',
        large: 'https://api-assets.clashofclans.com/leaguetiers/326/YCZ7O_3_c8eCBYvX-92qiWeLc6Md6eNJ5A8O-2vUg7I.png'
      }
    },
    heroes: [
      { name: 'Barbarian King', level: 65, maxLevel: 75, village: 'home', equipment: [
        { name: 'Giant Gauntlet', level: 16, maxLevel: 27, village: 'home' },
        { name: 'Rage Vial', level: 15, maxLevel: 18, village: 'home' }
      ]},
      { name: 'Archer Queen', level: 70, maxLevel: 75, village: 'home', equipment: [
        { name: 'Frozen Arrow', level: 18, maxLevel: 27, village: 'home' },
        { name: 'Invisibility Vial', level: 15, maxLevel: 18, village: 'home' }
      ]},
      { name: 'Grand Warden', level: 45, maxLevel: 50, village: 'home', equipment: [
        { name: 'Eternal Tome', level: 15, maxLevel: 18, village: 'home' },
        { name: 'Healing Tome', level: 12, maxLevel: 18, village: 'home' }
      ]},
      { name: 'Royal Champion', level: 18, maxLevel: 25, village: 'home', equipment: [
        { name: 'Seeking Shield', level: 15, maxLevel: 18, village: 'home' },
        { name: 'Royal Gem', level: 14, maxLevel: 18, village: 'home' }
      ]}
    ],
    heroEquipment: [
      { name: 'Giant Gauntlet', level: 16, maxLevel: 27, village: 'home' },
      { name: 'Rage Vial', level: 15, maxLevel: 18, village: 'home' },
      { name: 'Frozen Arrow', level: 18, maxLevel: 27, village: 'home' },
      { name: 'Invisibility Vial', level: 15, maxLevel: 18, village: 'home' },
      { name: 'Eternal Tome', level: 15, maxLevel: 18, village: 'home' },
      { name: 'Healing Tome', level: 12, maxLevel: 18, village: 'home' },
      { name: 'Seeking Shield', level: 15, maxLevel: 18, village: 'home' },
      { name: 'Royal Gem', level: 14, maxLevel: 18, village: 'home' }
    ],
    troops: [
      { name: 'Barbarian', level: 9, maxLevel: 12, village: 'home' },
      { name: 'Archer', level: 9, maxLevel: 12, village: 'home' },
      { name: 'Balloon', level: 9, maxLevel: 11, village: 'home' },
      { name: 'Dragon', level: 8, maxLevel: 11, village: 'home' },
      { name: 'Electro Dragon', level: 4, maxLevel: 7, village: 'home' },
      { name: 'Hog Rider', level: 10, maxLevel: 13, village: 'home' },
      { name: 'Valkyrie', level: 9, maxLevel: 11, village: 'home' },
      { name: 'Bowler', level: 5, maxLevel: 8, village: 'home' }
    ],
    spells: [
      { name: 'Healing Spell', level: 8, maxLevel: 9, village: 'home' },
      { name: 'Rage Spell', level: 6, maxLevel: 6, village: 'home' },
      { name: 'Freeze Spell', level: 7, maxLevel: 7, village: 'home' },
      { name: 'Poison Spell', level: 7, maxLevel: 10, village: 'home' }
    ],
    achievements: [
      { name: 'Bigger & Better', stars: 3, value: 13, target: 13, info: 'Upgrade Town Hall to Level 13', completionInfo: 'Completed!', village: 'home' },
      { name: 'Sweet Victory!', stars: 3, value: 3120, target: 1250, info: 'Reach 1,250 trophies', completionInfo: 'Completed!', village: 'home' },
      { name: 'War Hero', stars: 2, value: 780, target: 1000, info: 'Gain 1,000 stars for your clan in Clan Wars', completionInfo: 'In progress: 780 / 1,000', village: 'home' },
      { name: 'League All-Star', stars: 3, value: 24, target: 24, info: 'Enter the Champions League', completionInfo: 'Completed!', village: 'home' },
      { name: 'Gold Grab', stars: 2, value: 850000000, target: 1000000000, info: 'Steal 1,000,000,000 Gold', completionInfo: 'In progress: 850M / 1,000M', village: 'home' }
    ]
  },
  {
    tag: '#8LU92CVV',
    name: 'ShadowBarbarian',
    nickname: 'War Account (TH11)',
    townHallLevel: 11,
    townHallWeaponLevel: 0,
    expLevel: 112,
    trophies: 2350,
    bestTrophies: 2600,
    warStars: 520,
    attackWins: 41,
    defenseWins: 8,
    builderHallLevel: 7,
    builderBaseTrophies: 2400,
    bestBuilderBaseTrophies: 2500,
    donations: 1200,
    donationsReceived: 1800,
    role: 'member',
    warPreference: 'in',
    clan: {
      tag: '#2PR98LQ',
      name: 'Clash Legends',
      clanLevel: 24,
      badgeUrls: {
        small: 'https://api-assets.clashofclans.com/badges/70/4nQf92iYVpM1p2i.png',
        large: 'https://api-assets.clashofclans.com/badges/512/4nQf92iYVpM1p2i.png',
        medium: 'https://api-assets.clashofclans.com/badges/200/4nQf92iYVpM1p2i.png'
      }
    },
    league: {
      id: 29000012,
      name: 'Crystal League I',
      iconUrls: {
        small: 'https://api-assets.clashofclans.com/leagues/72/jhP48W0Hg4O5-994xdsqnkW1Kjg913Jy4lh_mff9kU8.png'
      }
    },
    leagueTier: {
      id: 105000022,
      name: 'P.E.K.K.A League 22',
      iconUrls: {
        small: 'https://api-assets.clashofclans.com/leaguetiers/125/iTWXPUUFQy0uEb7NDpMTyzGMFOJvlC4SLAqlHYgC8do.png',
        large: 'https://api-assets.clashofclans.com/leaguetiers/326/iTWXPUUFQy0uEb7NDpMTyzGMFOJvlC4SLAqlHYgC8do.png'
      }
    },
    heroes: [
      { name: 'Barbarian King', level: 48, maxLevel: 50, village: 'home' },
      { name: 'Archer Queen', level: 50, maxLevel: 50, village: 'home' },
      { name: 'Grand Warden', level: 20, maxLevel: 20, village: 'home' }
    ],
    heroEquipment: [
      { name: 'Barbarian Puppet', level: 12, maxLevel: 18, village: 'home' },
      { name: 'Rage Vial', level: 14, maxLevel: 18, village: 'home' },
      { name: 'Invisibility Vial', level: 14, maxLevel: 18, village: 'home' },
      { name: 'Eternal Tome', level: 14, maxLevel: 18, village: 'home' }
    ],
    troops: [
      { name: 'Barbarian', level: 8, maxLevel: 12, village: 'home' },
      { name: 'Archer', level: 8, maxLevel: 12, village: 'home' },
      { name: 'Dragon', level: 6, maxLevel: 11, village: 'home' },
      { name: 'Electro Dragon', level: 2, maxLevel: 7, village: 'home' },
      { name: 'Witch', level: 5, maxLevel: 7, village: 'home' },
      { name: 'Bowler', level: 3, maxLevel: 8, village: 'home' }
    ],
    spells: [
      { name: 'Lightning Spell', level: 8, maxLevel: 11, village: 'home' },
      { name: 'Rage Spell', level: 5, maxLevel: 6, village: 'home' },
      { name: 'Freeze Spell', level: 5, maxLevel: 7, village: 'home' },
      { name: 'Bat Spell', level: 4, maxLevel: 6, village: 'home' }
    ],
    achievements: [
      { name: 'Bigger & Better', stars: 3, value: 11, target: 11, info: 'Upgrade Town Hall to Level 11', completionInfo: 'Completed!', village: 'home' },
      { name: 'War Hero', stars: 2, value: 520, target: 1000, info: 'Gain 1,000 stars for your clan', completionInfo: 'In progress: 520 / 1,000', village: 'home' }
    ]
  }
];

// Sample default active upgrades so the live timers feature is immediately visual
const mockActiveUpgrades = {
  '#98P0L0V9': [
    {
      id: 'mock_upg_1',
      type: 'builder',
      name: 'Wizard Tower Lvl. 18',
      targetLevel: 18,
      builderIndex: 1,
      startTime: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      endTime: new Date(Date.now() + 3600 * 1000 * 14 + 1800 * 1000).toISOString(),
      totalSeconds: 3600 * 72,
      icon: 'tower'
    },
    {
      id: 'mock_upg_2',
      type: 'builder',
      name: 'Barbarian King Lvl. 106',
      targetLevel: 106,
      builderIndex: 2,
      startTime: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
      endTime: new Date(Date.now() + 3600 * 1000 * 4 + 720 * 1000).toISOString(),
      totalSeconds: 3600 * 48,
      icon: 'king'
    },
    {
      id: 'mock_upg_3',
      type: 'lab',
      name: 'Overgrowth Spell Lvl. 5',
      targetLevel: 5,
      builderIndex: 1,
      startTime: new Date(Date.now() - 3600 * 1000 * 70).toISOString(),
      endTime: new Date(Date.now() + 3600 * 1000 * 28).toISOString(),
      totalSeconds: 3600 * 120,
      icon: 'potion'
    }
  ]
};

module.exports = {
  mockProfiles,
  mockActiveUpgrades
};
