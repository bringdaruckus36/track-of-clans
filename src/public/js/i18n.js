/**
 * Internationalization (i18n) Engine for Clash of Clans Tracker
 * English-only mode
 */

const I18n = {
  currentLang: 'en',

  languages: {
    en: { code: 'en', name: 'English', flag: '🇬🇧', locale: 'en-US' }
  },

  translations: {
    en: {
  "common": {
    "lvl": "Lvl.",
    "max": "MAX",
    "max_star": "★ MAX",
    "locked": "LOCKED",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "active": "Active",
    "activate": "Activate",
    "loading": "Loading...",
    "unknown": "Unknown",
    "none": "None",
    "close_window": "Close window"
  },
  "brand": {
    "doc_title": "Clash of Clans Tracker",
    "title": "Track of Clans",
    "subtitle": "Real-Time Tracking • Supercell API"
  },
  "header": {
    "select_profile": "Select Player Profile",
    "loading_profiles": "Loading profiles...",
    "no_profiles": "No profiles registered",
    "add_profile_title": "Add New Profile",
    "sync": "Sync",
    "sync_title": "Sync data now with the API",
    "select_lang_title": "Select Language",
    "settings_title": "Settings, Profiles & History"
  },
  "banner": {
    "exp_title": "Experience Level",
    "tag_copy_title": "Click to copy",
    "no_clan": "No Clan",
    "synced": "Synced: ",
    "synced_never": "Never",
    "current_trophies": "Current Trophies",
    "builder_trophies": "Builder Trophies",
    "best_trophies": "All-Time Best",
    "war_stars": "War Stars",
    "unranked": "Unranked",
    "league_tier": "League Tier",
    "home_league": "Home League",
    "builder_league": "Builder League",
    "demo_mode": "Demo Data",
    "api_mode": "Official API"
  },
  "roles": {
    "leader": "👑 Leader",
    "coLeader": "⭐ Co-Leader",
    "admin": "⚔️ Elder",
    "elder": "⚔️ Elder",
    "member": "🛡️ Member"
  },
  "tabs": {
    "overview": "Overview",
    "upgrades": "Upgrades & Timers",
    "buildings": "Buildings & Defenses",
    "army": "Army & Heroes",
    "achievements": "Achievements",
    "import_village": "Import Village",
    "events": "History",
    "profiles_api": "Profiles & API"
  },
  "overview": {
    "overall_title": "Total Account Progress",
    "overall_hint": "Calculated across Heroes, Buildings, Lab, Equipment, TH & Achievements",
    "buildings_title": "Buildings & Defenses",
    "buildings_hint": "Village structures and defenses progress",
    "heroes_title": "Heroes Progress",
    "heroes_hint": "Current levels compared to maximum",
    "equip_title": "Hero Equipment",
    "equip_hint": "Special hero equipment abilities",
    "lab_title": "Laboratory Research",
    "lab_hint": "Troop and spell upgrades progress",
    "active_builders_title": "Active Builders Timers",
    "active_lab_title": "Laboratory Research in Progress",
    "active_pet_title": "Pet House Upgrade",
    "recent_events_title": "Recent Upgrades Logged",
    "view_all_history": "View full history",
    "quick_add_timer": "Add timer",
    "no_active_builders": "No upgrades currently tracked. Click \"+\" to add a real-time countdown timer!",
    "no_active_lab": "No active research in laboratory.",
    "no_active_pet": "No pet currently in training.",
    "no_recent_events": "No recent events recorded.",
    "battle_stats_title": "Battle & Clan Stats",
    "stat_attack_wins": "Attack Wins:",
    "stat_defense_wins": "Defense Wins:",
    "stat_builder_hall": "Builder Hall:",
    "stat_bh_trophies": "Builder Base Trophies:",
    "donations_title": "Donations (Sent / Received):",
    "closest_achievements_title": "Achievements Closest to Completion",
    "closest_achievements_completed": "All achievements are 100% completed! 👑",
    "loading_achievements": "Loading achievements..."
  },
  "upgrades": {
    "section_title": "Active Upgrade Timers (Real-Time)",
    "section_desc_html": "Since the public Supercell API does not expose remaining seconds for privacy, you can track your active upgrades here, or <strong>import them in bulk via JSON</strong>! Timers update automatically down to the second!",
    "import_json": "📥 Import JSON",
    "import_json_title": "Import active upgrades from JSON file or text",
    "export_json": "📤 Export JSON",
    "export_json_title": "Export or copy active timers in JSON format",
    "add_upgrade": "New Upgrade",
    "maxing_title": "Maxing Progress Breakdown",
    "th_walls": "Walls & Town Hall",
    "th_walls_desc": "Current level compared to maximum Town Hall 18 in the game.",
    "heroes_power": "Total Hero Power",
    "heroes_power_desc": "Barbarian King, Archer Queen, Grand Warden, Royal Champion, Minion Prince.",
    "lab_power": "Laboratory Research Status",
    "lab_power_desc": "Troops and spells maxed for current Town Hall level.",
    "equip_power": "Hero Equipment",
    "equip_power_desc": "Common and Epic equipment abilities unlocked and upgraded.",
    "defense_power": "Buildings & Structures",
    "defense_power_desc": "Cannons, Inferno Towers, Monoliths, Storages and defenses tracked.",
    "builder_title": "Builder",
    "builder_idle": "Builder Idle",
    "lab_idle": "Laboratory Idle",
    "pet_idle": "Pet House Idle",
    "no_timers": "No active timers. Click \"+ New Upgrade\" to track your builders!",
    "ready": "Done!",
    "completed": "✅ Completed!",
    "remaining": "Remaining"
  },
  "buildings": {
    "header_title": "Buildings, Defenses & Resources Level Tracking",
    "bh_header_title": "Builder Base Buildings, Defenses & Resources",
    "subtab_home": "Home Village",
    "subtab_builder": "Builder Base",
    "max_at_current_th": "⚡ Max to Current TH",
    "max_at_current_th_title": "Set all buildings to standard recommended level for your Town Hall",
    "max_at_current_bh": "⚡ Max to Current BH",
    "max_at_current_bh_title": "Set all Builder Base buildings to standard recommended level for your Builder Hall",
    "saved_indicator": "✅ Saved",
    "desc": "Max levels and structures shown are automatically calibrated to your Town Hall level (locked buildings are hidden). For each building you can view total count and adjust levels with + and -!",
    "desc_html": "Max levels and structures shown are <strong>automatically calibrated to your Town Hall level</strong> (locked buildings are hidden). For each building you can view total count and adjust levels with <strong>+</strong> and <strong>-</strong>!",
    "desc_bh_html": "Max levels and structures shown are <strong>automatically calibrated to your Builder Hall level</strong>. For each building you can adjust levels with <strong>+</strong> and <strong>-</strong>!",
    "search_placeholder": "Search building (e.g. Cannon, Inferno, Monolith)...",
    "filter_all": "All",
    "filter_defense": "Defenses",
    "filter_resource": "Resources",
    "filter_army": "Army",
    "filter_trap": "Traps",
    "filter_other": "Other",
    "no_buildings_match": "No buildings unlocked or matching filters for Town Hall {th}.",
    "no_buildings_match_bh": "No Builder Base buildings unlocked or matching filters for Builder Hall {bh}.",
    "max_all_th": "⚡ Max all buildings to TH{th}",
    "max_all_bh": "⚡ Max all buildings to BH{bh}",
    "confirm_max_all": "Do you want to set all village buildings to the standard max level for Town Hall {th}?",
    "confirm_max_all_bh": "Do you want to set all Builder Base buildings to the standard max level for Builder Hall {bh}?",
    "in_village": "{count}x in Village",
    "single_in_village": "Unique Building (1x in Village)",
    "progress_th": "TH{th} Progress",
    "progress_bh": "BH{bh} Progress",
    "max_th": "★ MAX TH{th}",
    "max_bh": "★ MAX BH{bh}",
    "bld_at_lvl": "Buildings at Lvl. {lvl}:",
    "all_at_lvl": "All {total} buildings are at Lvl. {lvl}",
    "remaining_at_prev": "{rem} remaining at Lvl. {prev}",
    "maxa_th_btn": "⚡ Max TH{th}",
    "maxa_bh_btn": "⚡ Max BH{bh}",
    "upgrade_timer_btn": "🔨 Timer",
    "step_minus_title": "Decrease level",
    "step_plus_title": "Increase level"
  },
  "import_village": {
    "title": "Import Village Buildings & Levels",
    "desc_html": "Import and calibrate your village building levels directly into Clash Tracker via JSON. Select whether to import for the <strong>Home Village</strong>, <strong>Builder Base</strong>, or both! You can also export your current setup as a backup.",
    "target_label": "Target Village:",
    "target_home": "🏰 Home Village",
    "target_builder": "🔨 Builder Base",
    "target_both": "🌐 Both Villages",
    "mode_label": "Import Mode:",
    "mode_merge": "Merge / Update matching buildings",
    "mode_replace": "Replace all buildings in target village",
    "file_label": "Upload JSON File:",
    "paste_label": "Or paste Village JSON below:",
    "load_th_template": "📋 Load TH{th} Home Template",
    "load_bh_template": "📋 Load BH{bh} Builder Template",
    "load_sample": "📋 Load Sample JSON",
    "import_btn": "📥 Import Village Buildings",
    "export_btn": "📤 Export Current Village JSON",
    "clear_btn": "🧹 Clear Text",
    "detected_count": "✅ {count} buildings recognized in JSON",
    "no_buildings_found": "⚠️ No recognized building keys found in JSON",
    "json_syntax_error": "❌ JSON syntax error: {err}",
    "import_success": "🎉 Successfully imported {count} buildings!",
    "export_copied": "📋 Village JSON copied to clipboard!"
  },
  "army": {
    "heroes_title": "Heroes & Equipped Abilities",
    "helpers_title": "Village Helpers",
    "guardians_title": "Town Hall 18 Guardians",
    "set_helpers_thmax": "Set All to TH Max",
    "set_guardians_thmax": "Set All to TH Max",
    "all_equip": "All Hero Equipment",
    "equipped_abilities": "Equipped Abilities:",
    "troops_home_title": "Troops (Home Village)",
    "super_troops_title": "Super Troops",
    "super_troop_active": "⚡ ACTIVE",
    "pets_title": "Hero Pets",
    "siege_title": "Siege Machines (Workshop)",
    "spells_title": "Spells",
    "troops_builder_title": "Troops (Builder Base)",
    "no_troops": "No troops registered.",
    "no_super_troops": "No super troops active or unlocked (available at Town Hall 11 with the Super Sauna).",
    "no_pets": "No pets unlocked yet (available at Town Hall 14 with Pet House).",
    "no_sieges": "No siege machines unlocked yet (available at Town Hall 12 with Workshop).",
    "max_for_th": "✔ Maxed for TH{th}",
    "max_th": "★ MAX TH{th}",
    "global_max": "👑 Global MAX",
    "needs_upgrade": "Needs Upgrade",
    "cap_info": "Cap: Lvl. {max} ({diff} left)",
    "th_benchmark_note": "Calibrated to Town Hall {th} Laboratory caps",
    "th_pet_benchmark_note": "Calibrated to Town Hall {th} Pet House caps",
    "th_equip_benchmark_note": "Calibrated to Town Hall {th} Blacksmith caps",
    "filter_all": "All",
    "filter_th_max": "★ Max TH{th}",
    "filter_upgrade": "⏳ Needs Upgrade",
    "no_troops_filter": "No troops match this filter.",
    "no_pets_filter": "No pets match this filter.",
    "no_equip": "No equipment registered.",
    "no_equip_filter": "No equipment matches this filter.",
    "locked": "Locked",
    "unlocks_at_th": "Unlocks at TH {th}",
    "unlocks_at_bh": "Unlocks at BH {bh}",
    "available_at_th": "Barracks (TH{th})",
    "available_at_bh": "Builder Barracks (BH{bh})",
    "available_pet": "Pet House (TH{th})",
    "available_siege": "Workshop (TH{th})",
    "available_spell": "Spell Factory (TH{th})",
    "available_hero_th": "Hero Hall (TH{th})",
    "available_hero_bh": "Builder Hall (BH{bh})",
    "available_blacksmith": "Blacksmith (TH{th})",
    "avail_event_trader": "Event / Trader (TH{th})"
  },
  "achievements": {
    "title_with_stars": "Supercell Achievements (<span id=\"ach-summary-stars\">{stars}</span> stars unlocked)",
    "stars_label": "stars unlocked",
    "subtab_all": "All",
    "subtab_home": "Home Village",
    "subtab_builder": "Builder Base",
    "subtab_capital": "Clan Capital",
    "filter_all": "All",
    "filter_in_progress": "In Progress",
    "filter_completed": "Completed (3★)",
    "filter_home": "Home Village",
    "filter_builder": "Builder Base",
    "filter_capital": "Clan Capital",
    "village_home": "Home Village",
    "village_builder": "Builder Base",
    "village_capital": "Clan Capital",
    "search_placeholder": "Search achievement (e.g. Gold, War, Walls, Capital)...",
    "no_achievements": "No achievements found matching current filters.",
    "completed_tag": "COMPLETED"
  },
  "settings_modal": {
    "title": "Settings & History Panel",
    "tab_profiles_api": "Profiles & API",
    "tab_history": "History",
    "all_profiles": "All Tracked Profiles",
    "add_profile_btn": "Add Profile",
    "th_col": "Town Hall",
    "player_col": "Player / Tag",
    "clan_col": "Clan",
    "trophies_col": "Trophies",
    "last_sync_col": "Last Sync",
    "actions_col": "Actions",
    "delete_profile_title": "Delete Profile",
    "api_config_title": "Clash of Clans API Configuration (Supercell)",
    "api_token_label": "Official API Token (Supercell Developer Portal)",
    "api_token_placeholder": "Paste your JWT Token generated on developer.clashofclans.com",
    "api_token_help": "The token must be created on <a href=\"https://developer.clashofclans.com\" target=\"_blank\" style=\"color: var(--gold);\">developer.clashofclans.com</a> and bound to this server/container public IP.",
    "detected_ip_label": "Detected Public IP of Server/Container:",
    "copy_ip_btn": "Copy IP for Supercell",
    "poll_interval_label": "Background Auto-Sync Interval",
    "interval_5": "Every 5 minutes",
    "interval_15": "Every 15 minutes (Recommended)",
    "interval_30": "Every 30 minutes",
    "interval_60": "Every 60 minutes",
    "save_api_btn": "Save API Settings",
    "load_demo_btn": "Reload Default Demo Profiles",
    "history_title": "Upgrades & Notifications History",
    "refresh_history_title": "Refresh history",
    "history_desc": "Every time profiles are synced, the system compares data against the snapshot and logs upgrades for heroes, troops, spells, defenses, trophies and stars!",
    "no_events": "No events or upgrades logged so far. Run a sync to check for new progress!",
    "no_profiles": "No profiles stored.",
    "confirm_delete_profile": "Are you sure you want to delete profile {tag}?"
  },
  "modals": {
    "add_profile_title": "Add Player Profile",
    "player_tag_label": "Player Tag (Clash of Clans)",
    "player_tag_help": "Find your tag inside Clash of Clans on your player profile under your nickname.",
    "alias_label": "Nickname / Alias (Optional)",
    "alias_placeholder": "e.g. Main Account, Mini War, Donations",
    "add_and_track_btn": "Add and Track",
    "verifying": "Verifying...",
    "add_timer_title": "Add In-Progress Upgrade",
    "upgrade_type_label": "Upgrade Type",
    "type_builder": "🔨 Builder's Hut (Buildings / Heroes / Defenses)",
    "type_lab": "⚗️ Laboratory (Troops / Spells)",
    "type_pet": "🐾 Pet House",
    "item_name_label": "Upgrade Item Name",
    "item_name_placeholder": "e.g. Archer Queen Lvl. 100, Inferno Tower...",
    "builder_slot_label": "Builder Slot (1 - 6)",
    "builder_n": "Builder {n}",
    "builder_bob": "Builder 6 (B.O.B)",
    "time_remaining_label": "Time Remaining",
    "days": "Days",
    "hours": "Hours",
    "mins": "Minutes",
    "start_timer_btn": "Start Timer",
    "import_title": "Import Upgrades from JSON",
    "import_desc": "Upload or paste a JSON file/text with active upgrades (builders, lab, pets). Timers will calculate automatically down to the second!",
    "upload_json_file": "Upload .JSON File",
    "insert_json_example": "Insert JSON Example",
    "json_text_label": "JSON Text:",
    "json_help": "Supports both relative duration (<code>days</code>, <code>hours</code>, <code>mins</code> / <code>remainingSeconds</code>) and exact completion date (<code>endTime</code> in ISO or milliseconds).",
    "items_detected": "{count} valid items detected",
    "no_array_found": "⚠️ No upgrades array found in JSON",
    "json_syntax_error": "❌ JSON syntax error: {err}",
    "import_mode_label": "Import Mode",
    "mode_merge": "Add to existing timers",
    "mode_replace": "Replace all current timers",
    "importing": "Importing...",
    "import_btn": "Import Upgrades"
  },
  "time": {
    "just_now": "A few seconds ago",
    "m_ago": "{m} min ago",
    "h_ago": "{h} hrs ago",
    "d_ago": "{d} days ago",
    "d_unit": "d",
    "h_unit": "h",
    "m_unit": "m",
    "s_unit": "s"
  },
  "toasts": {
    "tag_copied": "Tag {tag} copied to clipboard!",
    "ip_copied": "IP copied to clipboard!",
    "sync_start": "Sync in progress...",
    "sync_done": "Sync completed for {name}!",
    "settings_saved": "Settings saved successfully!",
    "demo_reloaded": "Demo profiles reloaded!",
    "profile_added": "Profile \"{name}\" added successfully!",
    "profile_deleted": "Profile {tag} deleted.",
    "no_active_profile": "No active profile selected!",
    "timer_started": "Timer for \"{name}\" started!",
    "timer_deleted": "Timer deleted.",
    "imported_n": "🎉 Successfully imported {count} upgrades!",
    "no_valid_upgrades": "JSON does not contain any valid upgrades.",
    "building_saved": "{name}: saved at Lvl. {lvl} ({cur}/{total})",
    "helpers_maxed": "All helpers set to Town Hall max!",
    "guardians_maxed": "All guardians set to Town Hall max!",
    "maxed_all": "Buildings synchronized to Town Hall {th}!",
    "lang_switched": "Language set: English"
  },
  "building_names": {
    "cannon": "Cannon",
    "ricochet_cannon": "Ricochet Cannon",
    "archer_tower": "Archer Tower",
    "multi_archer_tower": "Multi-Archer Tower",
    "mortar": "Mortar",
    "air_defense": "Air Defense",
    "wizard_tower": "Wizard Tower",
    "air_sweeper": "Air Sweeper",
    "hidden_tesla": "Hidden Tesla",
    "bomb_tower": "Bomb Tower",
    "x_bow": "X-Bow",
    "inferno_tower": "Inferno Tower",
    "eagle_artillery": "Eagle Artillery",
    "scattershot": "Scattershot",
    "spell_tower": "Spell Tower",
    "monolith": "Monolith",
    "town_hall": "Town Hall",
    "clan_castle": "Clan Castle",
    "wall": "Walls",
    "walls": "Walls",
    "bomb": "Bomb",
    "spring_trap": "Spring Trap",
    "giant_bomb": "Giant Bomb",
    "air_bomb": "Air Bomb",
    "seeking_air_mine": "Seeking Air Mine",
    "skeleton_trap": "Skeleton Trap",
    "tornado_trap": "Tornado Trap",
    "giga_bomb": "Giga Bomb",
    "army_camp": "Army Camp",
    "barracks": "Barracks",
    "dark_barracks": "Dark Barracks",
    "laboratory": "Laboratory",
    "spell_factory": "Spell Factory",
    "dark_spell_factory": "Dark Spell Factory",
    "workshop": "Siege Workshop",
    "pet_house": "Pet House",
    "blacksmith": "Blacksmith",
    "gold_storage": "Gold Storage",
    "elixir_storage": "Elixir Storage",
    "dark_elixir_storage": "Dark Elixir Storage",
    "gold_mine": "Gold Mine",
    "elixir_collector": "Elixir Collector",
    "dark_elixir_drill": "Dark Elixir Drill",
    "builder_hut": "Builder's Hut",
    "bb_builder_hall": "Builder Hall",
    "bb_double_cannon": "Double Cannon",
    "bb_archer_tower": "Archer Tower",
    "bb_cannon": "Cannon",
    "bb_firecrackers": "Firecrackers",
    "bb_crusher": "Crusher",
    "bb_guard_post": "Guard Post",
    "bb_air_bombs": "Air Bombs",
    "bb_multi_mortar": "Multi Mortar",
    "bb_roaster": "Roaster",
    "bb_giant_cannon": "Giant Cannon",
    "bb_mega_tesla": "Mega Tesla",
    "bb_lava_launcher": "Lava Launcher",
    "bb_otto_outpost": "O.T.T.O's Outpost",
    "bb_x_bow": "X-Bow",
    "bb_wall": "Walls",
    "bb_walls": "Walls",
    "bb_spring_trap": "Spring Trap",
    "bb_push_trap": "Push Trap",
    "bb_mine": "Mine",
    "bb_mega_mine": "Mega Mine",
    "bb_star_laboratory": "Star Laboratory",
    "bb_builder_barracks": "Builder Barracks",
    "bb_healing_hut": "Healing Hut",
    "bb_army_camp": "Army Camp",
    "bb_gold_mine": "Gold Mine",
    "bb_elixir_collector": "Elixir Collector",
    "bb_gold_storage": "Gold Storage",
    "bb_elixir_storage": "Elixir Storage",
    "bb_gem_mine": "Gem Mine",
    "bb_clock_tower": "Clock Tower"
  },
  "pets": {
    "L.A.S.S.I": "L.A.S.S.I",
    "Mighty Yak": "Mighty Yak",
    "Electro Owl": "Electro Owl",
    "Unicorn": "Unicorn",
    "Phoenix": "Phoenix",
    "Poison Lizard": "Poison Lizard",
    "Diggy": "Diggy",
    "Frosty": "Frosty",
    "Spirit Fox": "Spirit Fox",
    "Angry Jelly": "Angry Jelly"
  },
  "sieges": {
    "Wall Wrecker": "Wall Wrecker",
    "Battle Blimp": "Battle Blimp",
    "Stone Slammer": "Stone Slammer",
    "Siege Barracks": "Siege Barracks",
    "Log Launcher": "Log Launcher",
    "Flame Flinger": "Flame Flinger",
    "Battle Drill": "Battle Drill"
  },
  "super_troops": {
    "Super Barbarian": "Super Barbarian",
    "Super Archer": "Super Archer",
    "Super Giant": "Super Giant",
    "Sneaky Goblin": "Sneaky Goblin",
    "Super Wall Breaker": "Super Wall Breaker",
    "Rocket Balloon": "Rocket Balloon",
    "Super Wizard": "Super Wizard",
    "Super Dragon": "Super Dragon",
    "Inferno Dragon": "Inferno Dragon",
    "Super Minion": "Super Minion",
    "Super Valkyrie": "Super Valkyrie",
    "Super Witch": "Super Witch",
    "Ice Hound": "Ice Hound",
    "Super Bowler": "Super Bowler",
    "Super Miner": "Super Miner",
    "Super Hog Rider": "Super Hog Rider",
    "Super Yeti": "Super Yeti"
  }
}
  },

  /**
   * Initialize i18n
   */
  init() {
    this.currentLang = 'en';
    try {
      localStorage.setItem('coc_lang', 'en');
    } catch (e) {}
    document.documentElement.lang = 'en';
    this.applyToDOM();
  },

  /**
   * Set active language (enforced English)
   */
  setLanguage(lang = 'en') {
    this.currentLang = 'en';
    this.applyToDOM();
    if (window.App && typeof window.App.onLanguageChanged === 'function') {
      window.App.onLanguageChanged();
    }
  },

  /**
   * Safe no-op for dropdown sync
   */
  syncDropdown() {},

  /**
   * Get translation for a key with parameter replacement: {param}
   */
  t(path, params = {}) {
    const dict = this.translations['en'];
    const getVal = (obj, p) => p.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), obj);
    let val = getVal(dict, path);
    if (val === null || val === undefined) return path;

    if (typeof val === 'string' && params) {
      for (const [k, v] of Object.entries(params)) {
        val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }
    }
    return val;
  },

  /**
   * Translate building name
   */
  getBuildingName(buildingId) {
    if (!buildingId) return '';
    const bNames = this.translations['en'].building_names;
    return (bNames && bNames[buildingId]) || buildingId;
  },

  /**
   * Translate Clan Role
   */
  translateRole(role) {
    const r = this.translations['en'].roles;
    return (r && r[role]) || role;
  },

  /**
   * Translate Pet Name
   */
  getPetName(name) {
    if (!name) return '';
    const p = this.translations['en'].pets;
    return (p && p[name]) || name;
  },

  /**
   * Translate Siege Machine Name
   */
  getSiegeName(name) {
    if (!name) return '';
    const s = this.translations['en'].sieges;
    return (s && s[name]) || name;
  },

  /**
   * Translate Super Troop Name
   */
  getSuperTroopName(name) {
    if (!name) return '';
    const st = this.translations['en'].super_troops;
    return (st && st[name]) || name;
  },

  /**
   * Get formatting locale
   */
  getLocale() {
    return 'en-US';
  },

  /**
   * Walk DOM and translate elements with data-i18n attributes
   */
  applyToDOM() {
    if (this.t('brand.doc_title')) {
      document.title = this.t('brand.doc_title');
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key) {
        el.innerHTML = this.t(key);
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });

    // Builder select options in modal-add-timer
    const bldSelect = document.getElementById('timer-builder-idx');
    if (bldSelect) {
      for (let i = 1; i <= 5; i++) {
        const opt = bldSelect.querySelector(`option[value="${i}"]`);
        if (opt) opt.textContent = this.t('modals.builder_n', { n: i });
      }
      const opt6 = bldSelect.querySelector('option[value="6"]');
      if (opt6) opt6.textContent = this.t('modals.builder_bob');
    }
  }
};

// Auto-init on script load
if (typeof window !== 'undefined') {
  window.I18n = I18n;
}
