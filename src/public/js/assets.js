/**
 * UI Assets, Clash of Clans Official Sprites & Formatting Utilities
 */

const Assets = {
  // Clash of Clans Official Assets CDN Base
  CDN_BASE: 'https://assets.clashk.ing',

  // Official Clash of Clans Resource & Stat Icons
  cocIcons: {
    gold: 'https://assets.clashk.ing/bot/icons/gold.png',
    elixir: 'https://assets.clashk.ing/bot/icons/elixir.png',
    darkElixir: 'https://assets.clashk.ing/bot/icons/dark_elixir.png',
    trophy: 'https://assets.clashk.ing/bot/icons/trophy.png',
    versusTrophy: 'https://assets.clashk.ing/bot/icons/versus_trophy.png',
    warStar: 'https://assets.clashk.ing/bot/icons/war_star.png',
    xp: 'https://assets.clashk.ing/bot/icons/xp.png',
    shield: 'https://assets.clashk.ing/bot/icons/shield.png',
    swords: 'https://assets.clashk.ing/bot/icons/clash_sword.png',
    clanCastle: 'https://assets.clashk.ing/bot/icons/clan_castle.png',
    builder: 'https://assets.clashk.ing/bot/icons/wrench.png',
    pet: 'https://assets.clashk.ing/bot/icons/pet_paw.png',
    equipmentCommon: 'https://assets.clashk.ing/bot/icons/equipment_common.png',
    equipmentEpic: 'https://assets.clashk.ing/bot/icons/equipment_epic.png',
    cwlMedal: 'https://assets.clashk.ing/bot/icons/cwl_medal.png',
    raidMedal: 'https://assets.clashk.ing/bot/icons/raid_medal.png',
    capitalGold: 'https://assets.clashk.ing/bot/icons/capital_gold.png'
  },

  // Helper to normalize names to clashk.ing slugs
  toSlug(name) {
    if (!name) return '';
    return name.toLowerCase()
      .replace(/\./g, '')
      .replace(/'/g, '')
      .trim()
      .replace(/[\s-]+/g, '_');
  },

  // Town Hall building render image URL (levels 1 - 18)
  getTownHallImg(level) {
    const validLevel = Math.min(18, Math.max(1, parseInt(level, 10) || 1));
    return `${this.CDN_BASE}/buildings/home-village/town_hall/level_${validLevel}.webp`;
  },

  // Hero official sprite URL
  getHeroImg(heroName) {
    const slug = this.toSlug(heroName);
    return `${this.CDN_BASE}/heroes/${slug}/icon.webp`;
  },

  // Hero Equipment icon URL
  getEquipmentImg(equipName) {
    const slug = this.toSlug(equipName);
    return `${this.CDN_BASE}/equipment/${slug}.webp`;
  },

  // Troop official sprite URL
  getTroopImg(troopName) {
    const slug = this.toSlug(troopName);
    return `${this.CDN_BASE}/troops/${slug}/icon.webp`;
  },

  // Super Troop official sprite URL
  getSuperTroopImg(troopName) {
    const slug = this.toSlug(troopName);
    return `${this.CDN_BASE}/troops/${slug}/icon.webp`;
  },

  // Pet official sprite URL
  getPetImg(petName) {
    const slug = this.toSlug(petName);
    return `${this.CDN_BASE}/pets/${slug}/icon.webp`;
  },

  // Siege Machine official sprite URL
  getSiegeImg(siegeName) {
    const slug = this.toSlug(siegeName);
    return `${this.CDN_BASE}/troops/${slug}/icon.webp`;
  },

  // Spell official sprite URL
  getSpellImg(spellName) {
    const slug = this.toSlug(spellName);
    return `${this.CDN_BASE}/spells/${slug}.webp`;
  },

  // Main village league official badge URL
  getLeagueImg(league) {
    if (!league) return 'https://api-assets.clashofclans.com/leagues/72/e--YMyIezEQQhgE4xKoqi2tZvNlOOewYioGMTmLdmBo.png';
    if (league.iconUrls) {
      return league.iconUrls.medium || league.iconUrls.large || league.iconUrls.small || 'https://api-assets.clashofclans.com/leagues/72/e--YMyIezEQQhgE4xKoqi2tZvNlOOewYioGMTmLdmBo.png';
    }
    return 'https://api-assets.clashofclans.com/leagues/72/e--YMyIezEQQhgE4xKoqi2tZvNlOOewYioGMTmLdmBo.png';
  },

  // Builder base league official badge URL (all 42 leagues: Wood V to Diamond)
  getBuilderBaseLeagueImg(league) {
    if (!league) return this.cocIcons.versusTrophy;

    const slugs = [
      'wood-v', 'wood-iv', 'wood-iii', 'wood-ii', 'wood-i',
      'clay-v', 'clay-iv', 'clay-iii', 'clay-ii', 'clay-i',
      'stone-v', 'stone-iv', 'stone-iii', 'stone-ii', 'stone-i',
      'copper-v', 'copper-iv', 'copper-iii', 'copper-ii', 'copper-i',
      'brass-iii', 'brass-ii', 'brass-i',
      'iron-iii', 'iron-ii', 'iron-i',
      'steel-iii', 'steel-ii', 'steel-i',
      'titanium-iii', 'titanium-ii', 'titanium-i',
      'platinum-iii', 'platinum-ii', 'platinum-i',
      'emerald-iii', 'emerald-ii', 'emerald-i',
      'ruby-iii', 'ruby-ii', 'ruby-i',
      'diamond'
    ];

    // Check by name first (e.g. "Titanium League II" -> "titanium-ii")
    const name = typeof league === 'object' ? (league.name || '') : String(league);
    if (name && !name.toLowerCase().includes('unranked')) {
      const slugFromName = name.toLowerCase()
        .replace(/\bleague\b/gi, '')
        .trim()
        .replace(/[\s_]+/g, '-');
      if (slugs.includes(slugFromName)) {
        return `/images/builder-leagues/${slugFromName}.png`;
      }
    }

    // Check by numeric Supercell ID (44000000 - 44000041)
    const id = typeof league === 'object' ? league.id : parseInt(league, 10);
    if (typeof id === 'number' && id >= 44000000 && id <= 44000041) {
      const slugFromId = slugs[id - 44000000];
      if (slugFromId) {
        return `/images/builder-leagues/${slugFromId}.png`;
      }
    }

    return this.cocIcons.versusTrophy;
  },

  // League tier official badge URL (e.g. Dragon League, Electro League, PEKKA League, Skeleton League)
  getLeagueTierImg(leagueTier) {
    if (!leagueTier) return 'https://api-assets.clashofclans.com/leaguetiers/125/CiSJYHyhMuloCpIIJ3n5-xCnRWrEd9vcq_zu6Ahkl3o.png';
    if (leagueTier.iconUrls) {
      return leagueTier.iconUrls.large || leagueTier.iconUrls.small || 'https://api-assets.clashofclans.com/leaguetiers/125/CiSJYHyhMuloCpIIJ3n5-xCnRWrEd9vcq_zu6Ahkl3o.png';
    }
    if (leagueTier.id) {
      return `https://api-assets.clashofclans.com/leaguetiers/326/${leagueTier.id}.png`;
    }
    return 'https://api-assets.clashofclans.com/leaguetiers/125/CiSJYHyhMuloCpIIJ3n5-xCnRWrEd9vcq_zu6Ahkl3o.png';
  },

  // Town hall badge graphics / colors
  getTownHallColor(thLevel) {
    if (thLevel >= 18) return 'from-fuchsia-600 to-cyan-700';
    if (thLevel >= 16) return 'from-amber-600 to-rose-700';
    if (thLevel >= 14) return 'from-emerald-500 to-teal-800';
    if (thLevel >= 12) return 'from-blue-600 to-indigo-900';
    if (thLevel >= 9) return 'from-gray-800 to-red-950';
    return 'from-amber-700 to-stone-800';
  },

  // Role translations
  translateRole(role) {
    if (window.I18n) return window.I18n.translateRole(role);
    const roles = {
      leader: '👑 Leader',
      coLeader: '⭐ Co-Leader',
      admin: '⚔️ Elder',
      elder: '⚔️ Elder',
      member: '🛡️ Member'
    };
    return roles[role] || '🛡️ Member';
  },

  // Number formatting
  formatNumber(num) {
    if (num === null || num === undefined) return '0';
    const loc = (window.I18n && window.I18n.getLocale()) || 'en-US';
    return Number(num).toLocaleString(loc);
  },

  formatCompactNumber(num) {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace('.0', '') + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    return num.toString();
  },

  // Format countdown seconds into "Xd Yh Zm Ws"
  formatRemainingTime(totalSeconds) {
    if (totalSeconds <= 0) return window.I18n ? window.I18n.t('upgrades.completed') : 'Completed!';
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const dUnit = window.I18n ? window.I18n.t('time.d_unit') : 'd';
    const hUnit = window.I18n ? window.I18n.t('time.h_unit') : 'h';
    const mUnit = window.I18n ? window.I18n.t('time.m_unit') : 'm';
    const sUnit = window.I18n ? window.I18n.t('time.s_unit') : 's';

    const parts = [];
    if (days > 0) parts.push(`${days}${dUnit}`);
    if (hours > 0 || days > 0) parts.push(`${hours}${hUnit}`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}${mUnit}`);
    parts.push(`${seconds}${sUnit}`);

    return parts.slice(0, 3).join(' ');
  },

  // Relative time format
  formatTimeAgo(isoString) {
    if (!isoString) return window.I18n ? window.I18n.t('banner.synced_never') : 'Never';
    const date = new Date(isoString);
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return window.I18n ? window.I18n.t('time.just_now') : 'Just now';
    const m = Math.floor(diffSec / 60);
    if (diffSec < 3600) return window.I18n ? window.I18n.t('time.m_ago', { m }) : `${m}m ago`;
    const h = Math.floor(diffSec / 3600);
    if (diffSec < 86400) return window.I18n ? window.I18n.t('time.h_ago', { h }) : `${h}h ago`;
    const d = Math.floor(diffSec / 86400);
    return window.I18n ? window.I18n.t('time.d_ago', { d }) : `${d}d ago`;
  },

  // Icons helper
  icons: {
    trophy: `<img src="https://assets.clashk.ing/bot/icons/trophy.png" class="coc-icon-sm" alt="Trophies">`,
    star: `<img src="https://assets.clashk.ing/bot/icons/war_star.png" class="coc-icon-sm" alt="Stars">`,
    shield: `<img src="https://assets.clashk.ing/bot/icons/shield.png" class="coc-icon-sm" alt="Defense">`,
    swords: `<img src="https://assets.clashk.ing/bot/icons/clash_sword.png" class="coc-icon-sm" alt="Attack">`,
    hammer: `<img src="https://assets.clashk.ing/bot/icons/wrench.png" class="coc-icon-sm" alt="Builder">`,
    crown: `<img src="https://assets.clashk.ing/bot/icons/war_star.png" class="coc-icon-sm" alt="Hero">`,
    castle: `<img src="https://assets.clashk.ing/bot/icons/clan_castle.png" class="coc-icon-sm" alt="Town Hall">`,
    potion: `<img src="https://assets.clashk.ing/bot/icons/elixir.png" class="coc-icon-sm" alt="Laboratory">`,
    gold: `<img src="https://assets.clashk.ing/bot/icons/gold.png" class="coc-icon-sm" alt="Gold">`,
    darkElixir: `<img src="https://assets.clashk.ing/bot/icons/dark_elixir.png" class="coc-icon-sm" alt="Dark Elixir">`,
    copy: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/></svg>`,
    refresh: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
    settings: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    plus: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>`,
    trash: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`
  }
};
