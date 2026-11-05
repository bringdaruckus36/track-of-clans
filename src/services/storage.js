const fs = require('node:fs');
const path = require('node:path');
const config = require('../config');

// Default initial state
const defaultDb = {
  settings: {
    cocApiToken: config.COC_API_TOKEN || '',
    pollIntervalMinutes: config.DEFAULT_POLL_INTERVAL_MINUTES,
    autoPollEnabled: true,
    useDemoIfEmpty: false
  },
  activeProfileTag: null,
  profiles: {}, // keyed by tag (uppercase, normalized)
  events: []    // chronological log of changes & upgrade detections
};

class Storage {
  constructor() {
    this.dbPath = config.DB_FILE;
    this.dataDir = config.DATA_DIR;
    this.memoryDb = null;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        this.memoryDb = JSON.parse(raw);
        // Ensure keys exist
        this.memoryDb.settings = { ...defaultDb.settings, ...(this.memoryDb.settings || {}) };
        this.memoryDb.profiles = this.memoryDb.profiles || {};
        this.memoryDb.events = this.memoryDb.events || [];
      } else {
        this.memoryDb = JSON.parse(JSON.stringify(defaultDb));
        this.save();
      }
    } catch (err) {
      console.error('[Storage] Error initializing database file:', err.message);
      this.memoryDb = JSON.parse(JSON.stringify(defaultDb));
    }
  }

  save() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const tmpFile = `${this.dbPath}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.memoryDb, null, 2), 'utf8');
      fs.renameSync(tmpFile, this.dbPath);
    } catch (err) {
      console.error('[Storage] Failed to save database:', err.message);
    }
  }

  getSettings() {
    return { ...this.memoryDb.settings };
  }

  updateSettings(updates) {
    this.memoryDb.settings = { ...this.memoryDb.settings, ...updates };
    this.save();
    return this.memoryDb.settings;
  }

  normalizeTag(tag) {
    if (!tag) return '';
    let cleaned = tag.trim().toUpperCase();
    if (!cleaned.startsWith('#')) {
      cleaned = '#' + cleaned;
    }
    // Replace 'O' with '0' as Clash tags use zeros, not letter O
    return cleaned.replace(/O/g, '0');
  }

  getProfilesList() {
    const list = Object.values(this.memoryDb.profiles).map(p => ({
      tag: p.tag,
      nickname: p.nickname || p.name || p.tag,
      name: p.name || 'Unknown',
      townHallLevel: p.townHallLevel || 1,
      townHallWeaponLevel: p.townHallWeaponLevel || 0,
      expLevel: p.expLevel || 1,
      trophies: p.trophies || 0,
      clan: p.clan ? {
        name: p.clan.name,
        tag: p.clan.tag,
        badgeUrls: p.clan.badgeUrls,
        clanLevel: p.clan.clanLevel
      } : null,
      league: p.league ? {
        name: p.league.name,
        iconUrls: p.league.iconUrls
      } : null,
      leagueTier: p.leagueTier ? {
        id: p.leagueTier.id,
        name: p.leagueTier.name,
        iconUrls: p.leagueTier.iconUrls
      } : null,
      lastUpdated: p.lastUpdated || null,
      isActive: p.tag === this.memoryDb.activeProfileTag,
      activeUpgradesCount: (p.activeUpgrades || []).length
    }));
    return list;
  }

  getProfile(tag) {
    const norm = this.normalizeTag(tag);
    return this.memoryDb.profiles[norm] || null;
  }

  saveProfile(profileData, nickname = '') {
    const norm = this.normalizeTag(profileData.tag);
    const existing = this.memoryDb.profiles[norm] || {};

    let extracted = { helpers: {}, guardians: {} };
    try {
      const tracker = require('./tracker');
      if (tracker && typeof tracker.extractHelpersAndGuardians === 'function') {
        extracted = tracker.extractHelpersAndGuardians(profileData);
      }
    } catch (e) {
      // ignore
    }

    const helpers = {
      ...(existing.helpers || {}),
      ...(extracted.helpers || {})
    };
    const guardians = {
      ...(existing.guardians || {}),
      ...(extracted.guardians || {})
    };

    const profileRecord = {
      ...existing,
      ...profileData,
      tag: norm,
      nickname: nickname || existing.nickname || profileData.name || norm,
      lastUpdated: new Date().toISOString(),
      buildings: existing.buildings || null,
      helpers: Object.keys(helpers).length > 0 ? helpers : (existing.helpers || null),
      guardians: Object.keys(guardians).length > 0 ? guardians : (existing.guardians || null),
      activeUpgrades: existing.activeUpgrades || [],
      historySnapshots: existing.historySnapshots || []
    };

    this.memoryDb.profiles[norm] = profileRecord;

    if (!this.memoryDb.activeProfileTag) {
      this.memoryDb.activeProfileTag = norm;
    }

    this.save();
    return profileRecord;
  }

  deleteProfile(tag) {
    const norm = this.normalizeTag(tag);
    if (this.memoryDb.profiles[norm]) {
      delete this.memoryDb.profiles[norm];
      if (this.memoryDb.activeProfileTag === norm) {
        const remaining = Object.keys(this.memoryDb.profiles);
        this.memoryDb.activeProfileTag = remaining.length > 0 ? remaining[0] : null;
      }
      this.save();
      return true;
    }
    return false;
  }

  setActiveProfile(tag) {
    const norm = this.normalizeTag(tag);
    if (this.memoryDb.profiles[norm]) {
      this.memoryDb.activeProfileTag = norm;
      this.save();
      return true;
    }
    return false;
  }

  getActiveProfileTag() {
    return this.memoryDb.activeProfileTag;
  }

  getActiveProfile() {
    if (!this.memoryDb.activeProfileTag) {
      const keys = Object.keys(this.memoryDb.profiles);
      if (keys.length > 0) {
        this.memoryDb.activeProfileTag = keys[0];
        this.save();
      }
    }
    return this.getProfile(this.memoryDb.activeProfileTag);
  }

  addHistorySnapshot(tag, snapshot) {
    const norm = this.normalizeTag(tag);
    if (!this.memoryDb.profiles[norm]) return;
    if (!this.memoryDb.profiles[norm].historySnapshots) {
      this.memoryDb.profiles[norm].historySnapshots = [];
    }

    // Keep at most 50 snapshots
    this.memoryDb.profiles[norm].historySnapshots.unshift({
      timestamp: new Date().toISOString(),
      data: snapshot
    });

    if (this.memoryDb.profiles[norm].historySnapshots.length > 50) {
      this.memoryDb.profiles[norm].historySnapshots.pop();
    }
    this.save();
  }

  addEvent(event) {
    const newEvent = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      ...event
    };
    this.memoryDb.events.unshift(newEvent);
    // Keep at most 200 events
    if (this.memoryDb.events.length > 200) {
      this.memoryDb.events.pop();
    }
    this.save();
    return newEvent;
  }

  getEvents(filterTag = null, limit = 50) {
    let list = this.memoryDb.events;
    if (filterTag) {
      const norm = this.normalizeTag(filterTag);
      list = list.filter(e => e.playerTag === norm);
    }
    return list.slice(0, limit);
  }

  // Active builder/lab upgrades
  getActiveUpgrades(tag) {
    const profile = this.getProfile(tag);
    return profile ? (profile.activeUpgrades || []) : [];
  }

  saveActiveUpgrade(tag, upgrade) {
    const profile = this.getProfile(tag);
    if (!profile) return null;
    if (!profile.activeUpgrades) profile.activeUpgrades = [];

    const item = {
      id: upgrade.id || 'upg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: upgrade.type || 'builder', // 'builder' or 'lab' or 'pet' or 'equipment'
      name: upgrade.name || 'Upgrade',
      targetLevel: upgrade.targetLevel || 1,
      builderIndex: upgrade.builderIndex || 1, // 1 to 6
      startTime: upgrade.startTime || new Date().toISOString(),
      endTime: upgrade.endTime, // ISO timestamp when finishes
      totalSeconds: upgrade.totalSeconds || 0,
      icon: upgrade.icon || 'hammer'
    };

    // Update if already exists with same id, else push
    const idx = profile.activeUpgrades.findIndex(u => u.id === item.id);
    if (idx >= 0) {
      profile.activeUpgrades[idx] = item;
    } else {
      profile.activeUpgrades.push(item);
    }

    this.save();
    return item;
  }

  deleteActiveUpgrade(tag, upgradeId) {
    const profile = this.getProfile(tag);
    if (!profile || !profile.activeUpgrades) return false;
    const initialLen = profile.activeUpgrades.length;
    profile.activeUpgrades = profile.activeUpgrades.filter(u => u.id !== upgradeId);
    if (profile.activeUpgrades.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  importActiveUpgrades(tag, rawList, replace = false) {
    const profile = this.getProfile(tag);
    if (!profile) return null;
    if (!profile.activeUpgrades || replace) {
      profile.activeUpgrades = [];
    }

    const imported = [];
    let defaultSlot = 1;

    (rawList || []).forEach((raw, idx) => {
      if (!raw || typeof raw !== 'object') return;
      const name = raw.name || raw.title || raw.building || `Upgrade #${idx + 1}`;
      const type = raw.type || (raw.category === 'lab' || name.toLowerCase().includes('spell') ? 'lab' : (raw.type === 'pet' ? 'pet' : 'builder'));
      const builderIndex = parseInt(raw.builderIndex || raw.slot || raw.builder || defaultSlot, 10);
      defaultSlot = (defaultSlot % 6) + 1;

      // Determine endTime and totalSeconds
      let endTime = null;
      let totalSeconds = 0;

      if (raw.endTime) {
        const d = new Date(raw.endTime);
        if (!isNaN(d.getTime())) {
          endTime = d.toISOString();
          totalSeconds = Math.max(60, Math.floor((d.getTime() - Date.now()) / 1000));
        }
      }

      if (!endTime) {
        const days = parseFloat(raw.days || raw.giorni || 0);
        const hours = parseFloat(raw.hours || raw.ore || 0);
        const mins = parseFloat(raw.mins || raw.minutes || raw.minuti || 0);
        const secs = parseFloat(raw.remainingSeconds || raw.seconds || raw.secondi || 0);
        totalSeconds = Math.round((days * 86400) + (hours * 3600) + (mins * 60) + secs);

        if (totalSeconds <= 0 && raw.totalSeconds) {
          totalSeconds = Math.round(parseFloat(raw.totalSeconds));
        }
        if (totalSeconds <= 0) {
          totalSeconds = 3600; // default 1 hour if unspecified
        }
        endTime = new Date(Date.now() + totalSeconds * 1000).toISOString();
      }

      const item = {
        id: raw.id || 'upg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        type,
        name,
        targetLevel: parseInt(raw.targetLevel || raw.level || 1, 10),
        builderIndex: Math.min(6, Math.max(1, builderIndex)),
        startTime: raw.startTime || new Date().toISOString(),
        endTime,
        totalSeconds,
        icon: type === 'lab' ? 'potion' : (type === 'pet' ? 'shield' : 'hammer')
      };

      const existingIdx = profile.activeUpgrades.findIndex(u => u.id === item.id);
      if (existingIdx >= 0) {
        profile.activeUpgrades[existingIdx] = item;
      } else {
        profile.activeUpgrades.push(item);
      }
      imported.push(item);
    });

    this.save();
    return {
      total: profile.activeUpgrades.length,
      importedCount: imported.length,
      activeUpgrades: profile.activeUpgrades
    };
  }

  // Buildings tracking
  getBuildings(tag) {
    const profile = this.getProfile(tag);
    if (!profile) return null;
    return profile.buildings || null;
  }

  saveBuildingLevel(tag, buildingId, newLevel, newCount = null) {
    const profile = this.getProfile(tag);
    if (!profile) return null;
    if (!profile.buildings) profile.buildings = {};
    const existing = profile.buildings[buildingId];
    const validLevel = Math.max(1, parseInt(newLevel, 10) || 1);
    if (typeof existing === 'object' && existing !== null) {
      existing.level = validLevel;
      if (newCount !== null && newCount !== undefined) existing.count = Math.max(0, parseInt(newCount, 10));
      profile.buildings[buildingId] = existing;
    } else {
      if (newCount !== null && newCount !== undefined) {
        profile.buildings[buildingId] = { level: validLevel, count: Math.max(0, parseInt(newCount, 10)) };
      } else {
        profile.buildings[buildingId] = validLevel;
      }
    }
    this.save();
    return profile.buildings;
  }

  saveBuildingCount(tag, buildingId, newCount, currentLevel = null) {
    const profile = this.getProfile(tag);
    if (!profile) return null;
    if (!profile.buildings) profile.buildings = {};
    const existing = profile.buildings[buildingId];

    let lvl = currentLevel;
    if (lvl === null || lvl === undefined) {
      if (typeof existing === 'object' && existing !== null && existing.level !== undefined) {
        lvl = existing.level;
      } else if (typeof existing === 'number') {
        lvl = existing;
      } else {
        // Fallback to default max level for player's current Town Hall / Builder Hall
        try {
          const tracker = require('./tracker');
          const isBB = buildingId.startsWith('bb_');
          const thLevel = profile.townHallLevel || 1;
          const bhLevel = profile.builderHallLevel || 1;
          const catalog = isBB ? tracker.getBuilderBuildingsCatalog() : tracker.getBuildingsCatalog();
          const bInfo = catalog.find(b => b.id === buildingId);
          if (bInfo) {
            lvl = isBB ? tracker.getMaxLevelForBH(bInfo, bhLevel) : tracker.getMaxLevelForTH(bInfo, thLevel);
          } else {
            lvl = 1;
          }
        } catch (e) {
          lvl = 1;
        }
      }
    }

    const validLevel = Math.max(1, parseInt(lvl, 10) || 1);
    const validCount = Math.max(0, parseInt(newCount, 10));

    profile.buildings[buildingId] = {
      level: validLevel,
      count: validCount
    };
    this.save();
    return profile.buildings;
  }

  saveAllBuildings(tag, buildingsMap, replace = false, village = null) {
    const profile = this.getProfile(tag);
    if (!profile) return null;
    if (!profile.buildings) profile.buildings = {};

    let filteredMap = { ...buildingsMap };
    if (village === 'home') {
      filteredMap = {};
      Object.entries(buildingsMap).forEach(([k, v]) => {
        if (!k.startsWith('bb_')) filteredMap[k] = v;
      });
    } else if (village === 'builderBase') {
      filteredMap = {};
      Object.entries(buildingsMap).forEach(([k, v]) => {
        if (k.startsWith('bb_')) filteredMap[k] = v;
      });
    }

    if (replace) {
      if (village === 'home') {
        const kept = {};
        Object.entries(profile.buildings).forEach(([k, v]) => {
          if (k.startsWith('bb_')) kept[k] = v;
        });
        profile.buildings = { ...kept, ...filteredMap };
      } else if (village === 'builderBase') {
        const kept = {};
        Object.entries(profile.buildings).forEach(([k, v]) => {
          if (!k.startsWith('bb_')) kept[k] = v;
        });
        profile.buildings = { ...kept, ...filteredMap };
      } else {
        profile.buildings = { ...filteredMap };
      }
    } else {
      profile.buildings = { ...(profile.buildings || {}), ...filteredMap };
    }
    this.save();
    return profile.buildings;
  }

  saveHelperLevel(tag, helperId, newLevel) {
    const profile = this.getProfile(tag);
    if (!profile) return null;
    if (!profile.helpers) profile.helpers = {};
    profile.helpers[helperId] = Math.max(1, parseInt(newLevel, 10) || 1);
    this.save();
    return profile.helpers;
  }

  saveGuardianLevel(tag, guardianId, newLevel) {
    const profile = this.getProfile(tag);
    if (!profile) return null;
    if (!profile.guardians) profile.guardians = {};
    profile.guardians[guardianId] = Math.max(1, parseInt(newLevel, 10) || 1);
    this.save();
    return profile.guardians;
  }
}

module.exports = new Storage();
