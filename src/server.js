const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');
const storage = require('./services/storage');
const cocApi = require('./services/cocApi');
const tracker = require('./services/tracker');
const { mockProfiles, mockActiveUpgrades } = require('./services/mockData');

// SSE clients set for real-time streaming
const sseClients = new Set();

function broadcastEvent(type, payload) {
  const message = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(message);
    } catch (e) {
      sseClients.delete(res);
    }
  }
}

// Background poller
let pollIntervalTimer = null;

function setupPoller() {
  if (pollIntervalTimer) clearInterval(pollIntervalTimer);
  const settings = storage.getSettings();
  if (!settings.autoPollEnabled) return;

  const intervalMs = Math.max(1, (settings.pollIntervalMinutes || 15)) * 60 * 1000;
  console.log(`[Poller] Auto-sync scheduled every ${settings.pollIntervalMinutes || 15} minutes.`);

  pollIntervalTimer = setInterval(async () => {
    try {
      console.log('[Poller] Running scheduled sync for all profiles...');
      await refreshAllProfiles();
    } catch (err) {
      console.error('[Poller] Sync cycle error:', err.message);
    }
  }, intervalMs);
}

async function refreshProfile(tag) {
  const normTag = storage.normalizeTag(tag);
  const existing = storage.getProfile(normTag);
  if (!existing) {
    throw new Error('Profile not found in local database.');
  }

  // Fetch updated data
  const updatedData = await cocApi.fetchPlayer(normTag);

  // Compute diffs against previous state
  const diffs = tracker.detectDiffs(existing, updatedData);

  // Save new snapshot & log diff events
  diffs.forEach(evt => {
    storage.addEvent(evt);
  });

  storage.addHistorySnapshot(normTag, {
    trophies: updatedData.trophies,
    expLevel: updatedData.expLevel,
    warStars: updatedData.warStars,
    donations: updatedData.donations
  });

  const saved = storage.saveProfile(updatedData, existing.nickname);

  // Broadcast real-time updates
  broadcastEvent('profile_updated', {
    tag: normTag,
    name: saved.name,
    diffsCount: diffs.length,
    diffs
  });

  return { profile: saved, diffs };
}

async function refreshAllProfiles() {
  const profiles = storage.getProfilesList();
  const results = [];
  for (const p of profiles) {
    try {
      const res = await refreshProfile(p.tag);
      results.push({ tag: p.tag, success: true, diffs: res.diffs });
    } catch (err) {
      results.push({ tag: p.tag, success: false, error: err.message });
    }
  }
  return results;
}

// Seed initial mock profiles only if explicitly enabled in settings (disabled by default)
function checkInitialSeed() {
  const profiles = storage.getProfilesList();
  if (profiles.length === 0 && storage.getSettings().useDemoIfEmpty === true) {
    console.log('[Init] Fresh database detected with useDemoIfEmpty enabled. Seeding demo accounts...');
    mockProfiles.forEach(mock => {
      const saved = storage.saveProfile(mock, mock.nickname);
      if (mockActiveUpgrades[mock.tag]) {
        mockActiveUpgrades[mock.tag].forEach(u => storage.saveActiveUpgrade(mock.tag, u));
      }
    });

    storage.addEvent({
      playerTag: mockProfiles[0].tag,
      playerName: mockProfiles[0].name,
      category: 'townhall',
      icon: 'castle',
      title: 'Welcome to Clash Tracker!',
      description: 'Demo accounts configured successfully. Add your player tag to get started!',
      delta: 0
    });
    console.log('[Init] Demo seed complete.');
  }
}

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Request Body Parser helper
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) { // 2MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Static file server
function serveStatic(req, res, pathname) {
  let relativePath = pathname === '/' ? '/index.html' : pathname;
  // Prevent directory traversal
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(config.PUBLIC_DIR, safePath);

  if (!filePath.startsWith(config.PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA client navigation
      const indexPath = path.join(config.PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // === API ROUTES ===

    // Healthcheck
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    }

    // IP Address detection helper
    if (pathname === '/api/ip' && req.method === 'GET') {
      const publicIp = await cocApi.getPublicIp();
      return sendJson(res, 200, { ip: publicIp });
    }

    // Settings
    if (pathname === '/api/settings' && req.method === 'GET') {
      const settings = storage.getSettings();
      // Mask token partially
      const masked = settings.cocApiToken
        ? `${settings.cocApiToken.substring(0, 8)}...${settings.cocApiToken.substring(settings.cocApiToken.length - 8)}`
        : '';
      return sendJson(res, 200, {
        ...settings,
        hasToken: !!settings.cocApiToken,
        maskedToken: masked
      });
    }

    if (pathname === '/api/settings' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const updates = {};
      if (body.cocApiToken !== undefined) updates.cocApiToken = body.cocApiToken.trim();
      if (body.pollIntervalMinutes !== undefined) updates.pollIntervalMinutes = parseInt(body.pollIntervalMinutes, 10) || 15;
      if (body.autoPollEnabled !== undefined) updates.autoPollEnabled = !!body.autoPollEnabled;

      const newSettings = storage.updateSettings(updates);
      setupPoller(); // re-init poller
      return sendJson(res, 200, { success: true, settings: newSettings });
    }

    // Real-Time SSE Stream
    if (pathname === '/api/events' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.write(': connected\n\n');
      sseClients.add(res);

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    // Activity log / events list
    if (pathname === '/api/events/list' && req.method === 'GET') {
      const tag = parsedUrl.searchParams.get('tag');
      const limit = parseInt(parsedUrl.searchParams.get('limit'), 10) || 50;
      const list = storage.getEvents(tag, limit);
      return sendJson(res, 200, list);
    }

    // Profiles List
    if (pathname === '/api/profiles' && req.method === 'GET') {
      const list = storage.getProfilesList();
      const activeTag = storage.getActiveProfileTag();
      return sendJson(res, 200, { profiles: list, activeProfileTag: activeTag });
    }

    // Add Profile
    if (pathname === '/api/profiles' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const tag = body.tag;
      const nickname = body.nickname || '';

      if (!tag) {
        return sendJson(res, 400, { error: 'Player tag is required (e.g. #2PP09V).' });
      }

      const normTag = storage.normalizeTag(tag);
      try {
        const playerData = await cocApi.fetchPlayer(normTag);
        const saved = storage.saveProfile(playerData, nickname);

        // Add welcome event
        storage.addEvent({
          playerTag: normTag,
          playerName: saved.name,
          category: 'player',
          icon: 'user-plus',
          title: `Profile Added: ${saved.name}`,
          description: `Tag ${normTag} registered successfully! Town Hall Level ${saved.townHallLevel}.`,
          delta: 0
        });

        broadcastEvent('profile_added', { tag: normTag, name: saved.name });
        return sendJson(res, 201, { success: true, profile: saved });
      } catch (apiErr) {
        return sendJson(res, apiErr.status || 400, { error: apiErr.message });
      }
    }

    // Seed Demo Profiles on demand
    if (pathname === '/api/profiles/seed-demo' && req.method === 'POST') {
      mockProfiles.forEach(mock => {
        storage.saveProfile(mock, mock.nickname);
        if (mockActiveUpgrades[mock.tag]) {
          mockActiveUpgrades[mock.tag].forEach(u => storage.saveActiveUpgrade(mock.tag, u));
        }
      });
      return sendJson(res, 200, { success: true, message: 'Demo profiles loaded successfully!' });
    }

    // Refresh all profiles
    if (pathname === '/api/profiles/refresh-all' && req.method === 'POST') {
      const results = await refreshAllProfiles();
      return sendJson(res, 200, { success: true, results });
    }

    // Buildings Catalog
    if (pathname === '/api/buildings/catalog' && req.method === 'GET') {
      return sendJson(res, 200, tracker.getBuildingsCatalog());
    }

    // Profile detail & single profile operations
    const profileMatch = pathname.match(/^\/api\/profiles\/([^/]+)(\/(activate|refresh))?$/);
    if (profileMatch) {
      const rawTag = decodeURIComponent(profileMatch[1]);
      const normTag = storage.normalizeTag(rawTag);
      const subAction = profileMatch[3];

      if (req.method === 'GET' && !subAction) {
        const profile = storage.getProfile(normTag);
        if (!profile) {
          return sendJson(res, 404, { error: 'Profile not found.' });
        }
        const metrics = tracker.computeMetrics(profile);
        const activeUpgrades = storage.getActiveUpgrades(normTag);
        return sendJson(res, 200, {
          profile,
          metrics,
          activeUpgrades
        });
      }

      if (req.method === 'POST' && subAction === 'activate') {
        const ok = storage.setActiveProfile(normTag);
        if (ok) {
          broadcastEvent('active_profile_changed', { tag: normTag });
          return sendJson(res, 200, { success: true, activeProfileTag: normTag });
        }
        return sendJson(res, 404, { error: 'Profile not found for activation.' });
      }

      if (req.method === 'POST' && subAction === 'refresh') {
        try {
          const result = await refreshProfile(normTag);
          return sendJson(res, 200, { success: true, result });
        } catch (err) {
          return sendJson(res, err.status || 500, { error: err.message });
        }
      }

      if (req.method === 'DELETE' && !subAction) {
        const ok = storage.deleteProfile(normTag);
        if (ok) {
          broadcastEvent('profile_deleted', { tag: normTag });
          return sendJson(res, 200, { success: true, deletedTag: normTag });
        }
        return sendJson(res, 404, { error: 'Profile not found for deletion.' });
      }
    }

    // Buildings profile endpoint: /api/profiles/:tag/buildings
    const buildingsMatch = pathname.match(/^\/api\/profiles\/([^/]+)\/buildings$/);
    if (buildingsMatch) {
      const rawTag = decodeURIComponent(buildingsMatch[1]);
      const normTag = storage.normalizeTag(rawTag);
      const profile = storage.getProfile(normTag);
      if (!profile) {
        return sendJson(res, 404, { error: 'Profile not found.' });
      }

      if (req.method === 'GET') {
        const villageParam = parsedUrl.searchParams.get('village') || 'home';
        const th = profile.townHallLevel || 1;
        const bh = profile.builderHallLevel || 1;
        const catalog = villageParam === 'builderBase'
          ? tracker.getBuilderBuildingsCatalog(bh)
          : tracker.getBuildingsCatalog(th);
        const currentBuildings = profile.buildings || tracker.getDefaultBuildingsForTH(th);
        return sendJson(res, 200, {
          catalog,
          buildings: currentBuildings,
          townHallLevel: th,
          builderHallLevel: bh,
          village: villageParam
        });
      }

      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        if (body.action === 'max_th') {
          const thLevel = parseInt(body.thLevel, 10) || profile.townHallLevel || 1;
          const defaults = tracker.getDefaultBuildingsForTH(thLevel);
          storage.saveAllBuildings(normTag, defaults, false, 'home');
          storage.addEvent({
            playerTag: normTag,
            playerName: profile.name,
            category: 'builder',
            icon: 'castle',
            title: `Structures Synced with TH ${thLevel}`,
            description: `All unlocked buildings aligned to maximum levels for Town Hall ${thLevel}.`,
            delta: 0
          });
          broadcastEvent('buildings_updated', { tag: normTag, village: 'home' });
          return sendJson(res, 200, { success: true, buildings: defaults });
        }

        if (body.action === 'max_bh') {
          const bhLevel = parseInt(body.bhLevel, 10) || profile.builderHallLevel || 1;
          const defaults = tracker.getDefaultBuilderBuildingsForBH(bhLevel);
          storage.saveAllBuildings(normTag, defaults, false, 'builderBase');
          storage.addEvent({
            playerTag: normTag,
            playerName: profile.name,
            category: 'builder',
            icon: 'hammer',
            title: `Builder Base Synced with BH ${bhLevel}`,
            description: `All Builder Base buildings aligned to maximum levels for BH ${bhLevel}.`,
            delta: 0
          });
          broadcastEvent('buildings_updated', { tag: normTag, village: 'builderBase' });
          return sendJson(res, 200, { success: true, buildings: defaults });
        }

        if (body.buildingId && (body.level !== undefined || body.count !== undefined)) {
          const itemInfo = tracker.getBuildingsCatalog().find(b => b.id === body.buildingId) ||
                           tracker.getBuilderBuildingsCatalog().find(b => b.id === body.buildingId);
          let newLvl = body.level !== undefined ? parseInt(body.level, 10) : undefined;
          let newCount = body.count !== undefined ? parseInt(body.count, 10) : undefined;

          if (newLvl !== undefined) {
            storage.saveBuildingLevel(normTag, body.buildingId, newLvl, newCount);
          } else if (newCount !== undefined) {
            storage.saveBuildingCount(normTag, body.buildingId, newCount);
          }

          storage.addEvent({
            playerTag: normTag,
            playerName: profile.name,
            category: 'builder',
            icon: 'hammer',
            title: `Building Updated: ${itemInfo ? itemInfo.name : body.buildingId}`,
            description: newLvl !== undefined
              ? (newCount !== undefined ? `Level ${newLvl} (${newCount} buildings)` : `Level set to ${newLvl}!`)
              : `Quantity at this level updated to ${newCount}!`,
            delta: 1
          });
          broadcastEvent('buildings_updated', { tag: normTag, buildingId: body.buildingId, level: newLvl, count: newCount });
          return sendJson(res, 200, { success: true, buildingId: body.buildingId, level: newLvl, count: newCount });
        }

        if (body.buildings || body.traps || body.buildings2 || body.traps2) {
          let extracted = body.buildings || {};
          if (Array.isArray(body.buildings) || body.traps || body.buildings2 || body.traps2 || typeof body.buildings !== 'object' || body.buildings === null) {
            extracted = tracker.extractBuildingsFromRaw(body.buildings?.buildings ? body.buildings : body);
          } else if (typeof body.buildings === 'object') {
            const hasDataKeys = Object.keys(body.buildings).some(k => !isNaN(parseInt(k, 10)));
            if (hasDataKeys || body.buildings.buildings || body.buildings.traps || body.buildings.buildings2 || body.buildings.traps2) {
              extracted = tracker.extractBuildingsFromRaw(body.buildings);
            }
          }

          if (extracted.__meta) {
            if (extracted.__meta.townHallLevel && (!profile.townHallLevel || extracted.__meta.townHallLevel > profile.townHallLevel)) {
              profile.townHallLevel = extracted.__meta.townHallLevel;
            }
            if (extracted.__meta.builderHallLevel && (!profile.builderHallLevel || extracted.__meta.builderHallLevel > profile.builderHallLevel)) {
              profile.builderHallLevel = extracted.__meta.builderHallLevel;
            }
            if (extracted.__meta.helpers && Object.keys(extracted.__meta.helpers).length > 0) {
              profile.helpers = { ...(profile.helpers || {}), ...extracted.__meta.helpers };
            }
            if (extracted.__meta.guardians && Object.keys(extracted.__meta.guardians).length > 0) {
              profile.guardians = { ...(profile.guardians || {}), ...extracted.__meta.guardians };
            }
          }
          if (body.helpers && typeof body.helpers === 'object') {
            profile.helpers = { ...(profile.helpers || {}), ...body.helpers };
          }
          if (body.guardians && typeof body.guardians === 'object') {
            profile.guardians = { ...(profile.guardians || {}), ...body.guardians };
          }
          if (body.townHallLevel) {
            const th = parseInt(body.townHallLevel, 10);
            if (!isNaN(th) && th >= 1 && th <= 18) profile.townHallLevel = th;
          }
          if (body.builderHallLevel) {
            const bh = parseInt(body.builderHallLevel, 10);
            if (!isNaN(bh) && bh >= 1 && bh <= 10) profile.builderHallLevel = bh;
          }

          const replace = body.replace === true;
          const village = body.village || (extracted.__meta && extracted.__meta.homeCount > 0 && extracted.__meta.builderCount > 0 ? 'both' : null);
          storage.saveAllBuildings(normTag, extracted, replace, village);
          storage.addEvent({
            playerTag: normTag,
            playerName: profile.name,
            category: 'builder',
            icon: 'castle',
            title: `Village Buildings Imported`,
            description: `Imported ${Object.keys(extracted).length} building and trap levels via Village JSON import.`,
            delta: Object.keys(extracted).length
          });
          broadcastEvent('buildings_updated', { tag: normTag });
          return sendJson(res, 200, {
            success: true,
            count: Object.keys(extracted).length,
            townHallLevel: profile.townHallLevel,
            builderHallLevel: profile.builderHallLevel,
            buildings: profile.buildings
          });
        }
      }
    }

    // Helpers endpoint
    if (pathname.startsWith('/api/profiles/') && pathname.endsWith('/helpers') && req.method === 'POST') {
      const parts = pathname.split('/');
      const rawTag = parts[3];
      const normTag = storage.normalizeTag(decodeURIComponent(rawTag));
      const profile = storage.getProfile(normTag);
      if (!profile) return sendJson(res, 404, { error: 'Profile not found' });

      const body = await parseJsonBody(req);
      if (body.action === 'max_th') {
        const th = profile.townHallLevel || 1;
        const helpersMap = {};
        tracker.getHelpersCatalog().forEach(h => {
          const cap = h.maxLevels[th] || (th < h.unlockTH ? 0 : h.maxLevel);
          storage.saveHelperLevel(normTag, h.id, cap);
          helpersMap[h.id] = cap;
        });
        storage.addEvent({
          playerTag: normTag,
          playerName: profile.name,
          category: 'hero',
          icon: 'wrench',
          title: `Helpers Synced to TH ${th} Max`,
          description: `All helpers set to max level for Town Hall ${th}.`,
          delta: 0
        });
        broadcastEvent('helpers_updated', { tag: normTag, helpers: helpersMap });
        return sendJson(res, 200, { success: true, helpers: helpersMap });
      }

      if (body.helperId && body.level !== undefined) {
        const itemInfo = tracker.getHelpersCatalog().find(h => h.id === body.helperId);
        const newLvl = Math.max(1, parseInt(body.level, 10) || 1);
        storage.saveHelperLevel(normTag, body.helperId, newLvl);
        storage.addEvent({
          playerTag: normTag,
          playerName: profile.name,
          category: 'hero',
          icon: 'wrench',
          title: `Helper Updated: ${itemInfo ? itemInfo.name : body.helperId}`,
          description: `Level set to ${newLvl}!`,
          delta: 1
        });
        broadcastEvent('helpers_updated', { tag: normTag, helperId: body.helperId, level: newLvl });
        return sendJson(res, 200, { success: true, helperId: body.helperId, level: newLvl });
      }
      return sendJson(res, 400, { error: 'helperId and level are required' });
    }

    // Guardians endpoint
    if (pathname.startsWith('/api/profiles/') && pathname.endsWith('/guardians') && req.method === 'POST') {
      const parts = pathname.split('/');
      const rawTag = parts[3];
      const normTag = storage.normalizeTag(decodeURIComponent(rawTag));
      const profile = storage.getProfile(normTag);
      if (!profile) return sendJson(res, 404, { error: 'Profile not found' });

      const body = await parseJsonBody(req);
      if (body.action === 'max_th') {
        const th = profile.townHallLevel || 1;
        const guardiansMap = {};
        tracker.getGuardiansCatalog().forEach(g => {
          const cap = th >= g.unlockTH ? g.maxLevel : 0;
          storage.saveGuardianLevel(normTag, g.id, cap);
          guardiansMap[g.id] = cap;
        });
        storage.addEvent({
          playerTag: normTag,
          playerName: profile.name,
          category: 'hero',
          icon: 'shield',
          title: `Guardians Synced to TH ${th} Max`,
          description: `All guardians set to max level for Town Hall ${th}.`,
          delta: 0
        });
        broadcastEvent('guardians_updated', { tag: normTag, guardians: guardiansMap });
        return sendJson(res, 200, { success: true, guardians: guardiansMap });
      }

      if (body.guardianId && body.level !== undefined) {
        const itemInfo = tracker.getGuardiansCatalog().find(g => g.id === body.guardianId);
        const newLvl = Math.max(1, parseInt(body.level, 10) || 1);
        storage.saveGuardianLevel(normTag, body.guardianId, newLvl);
        storage.addEvent({
          playerTag: normTag,
          playerName: profile.name,
          category: 'hero',
          icon: 'shield',
          title: `Guardian Updated: ${itemInfo ? itemInfo.name : body.guardianId}`,
          description: `Level set to ${newLvl}!`,
          delta: 1
        });
        broadcastEvent('guardians_updated', { tag: normTag, guardianId: body.guardianId, level: newLvl });
        return sendJson(res, 200, { success: true, guardianId: body.guardianId, level: newLvl });
      }
      return sendJson(res, 400, { error: 'guardianId and level are required' });
    }

    // Active Upgrade Timers endpoints
    if (pathname === '/api/upgrades/import' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const activeP = storage.getActiveProfile();
      const tag = body.playerTag || parsedUrl.searchParams.get('tag') || (activeP ? activeP.tag : null);
      if (!tag) {
        return sendJson(res, 400, { error: 'playerTag is required to import timers.' });
      }
      const normTag = storage.normalizeTag(tag);
      const profile = storage.getProfile(normTag);
      if (!profile) {
        return sendJson(res, 404, { error: 'Profile not found.' });
      }

      // Support array directly, object with upgrades/activeUpgrades, or single upgrade object
      let rawList = [];
      if (Array.isArray(body)) {
        rawList = body;
      } else if (Array.isArray(body.upgrades)) {
        rawList = body.upgrades;
      } else if (Array.isArray(body.activeUpgrades)) {
        rawList = body.activeUpgrades;
      } else if (body.upgrade) {
        rawList = [body.upgrade];
      } else if (body.name || body.title) {
        rawList = [body];
      }

      if (rawList.length === 0) {
        return sendJson(res, 400, { error: 'No upgrades found in JSON payload. Provide an array of objects or { "upgrades": [...] }.' });
      }

      const replace = Boolean(body.replace);
      const result = storage.importActiveUpgrades(normTag, rawList, replace);

      storage.addEvent({
        playerTag: normTag,
        playerName: profile.name,
        category: 'builder',
        icon: 'hammer',
        title: `Timers Imported from JSON (${result.importedCount})`,
        description: `${result.importedCount} upgrades loaded successfully (${replace ? 'total replacement' : 'added to existing'}).`,
        delta: result.importedCount
      });

      broadcastEvent('upgrade_timer_added', { playerTag: normTag, count: result.importedCount });
      return sendJson(res, 200, {
        success: true,
        count: result.importedCount,
        total: result.total,
        activeUpgrades: result.activeUpgrades
      });
    }

    // Export active upgrades as JSON
    const upgradeExportMatch = pathname.match(/^\/api\/upgrades\/([^/]+)\/export$/);
    if (upgradeExportMatch && req.method === 'GET') {
      const playerTag = decodeURIComponent(upgradeExportMatch[1]);
      const normTag = storage.normalizeTag(playerTag);
      const profile = storage.getProfile(normTag);
      if (!profile) {
        return sendJson(res, 404, { error: 'Profile not found.' });
      }
      return sendJson(res, 200, {
        playerTag: normTag,
        playerName: profile.name,
        exportedAt: new Date().toISOString(),
        activeUpgrades: profile.activeUpgrades || []
      });
    }

    if (pathname === '/api/upgrades' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { playerTag, upgrade } = body;
      if (!playerTag || !upgrade || !upgrade.name || !upgrade.endTime) {
        return sendJson(res, 400, { error: 'Incomplete upgrade data (playerTag, name, endTime required).' });
      }
      const saved = storage.saveActiveUpgrade(playerTag, upgrade);
      storage.addEvent({
        playerTag,
        playerName: storage.getProfile(playerTag)?.name || 'Chief',
        category: 'builder',
        icon: 'hammer',
        title: `Upgrade Started: ${upgrade.name}`,
        description: `Expected completion: ${new Date(upgrade.endTime).toLocaleString('en-US')}`,
        delta: 0
      });
      broadcastEvent('upgrade_timer_added', { playerTag, upgrade: saved });
      return sendJson(res, 201, { success: true, upgrade: saved });
    }

    const upgradeDeleteMatch = pathname.match(/^\/api\/upgrades\/([^/]+)\/([^/]+)$/);
    if (upgradeDeleteMatch && req.method === 'DELETE') {
      const playerTag = decodeURIComponent(upgradeDeleteMatch[1]);
      const upgradeId = decodeURIComponent(upgradeDeleteMatch[2]);
      const ok = storage.deleteActiveUpgrade(playerTag, upgradeId);
      if (ok) {
        broadcastEvent('upgrade_timer_deleted', { playerTag, upgradeId });
        return sendJson(res, 200, { success: true });
      }
      return sendJson(res, 404, { error: 'Upgrade not found.' });
    }

    // Default: Serve frontend static files
    return serveStatic(req, res, pathname);

  } catch (err) {
    console.error(`[Server Error] ${req.method} ${pathname}:`, err);
    return sendJson(res, 500, { error: 'Internal server error: ' + err.message });
  }
});

// Start initialization
checkInitialSeed();
setupPoller();

server.listen(config.PORT, config.HOST, () => {
  console.log(`====================================================`);
  console.log(`🏰 CLASH OF CLANS TRACKER WEBAPP READY!`);
  console.log(`🌐 Server running at: http://${config.HOST === '0.0.0.0' ? 'localhost' : config.HOST}:${config.PORT}`);
  console.log(`📁 Database path: ${config.DB_FILE}`);
  console.log(`====================================================`);
});
