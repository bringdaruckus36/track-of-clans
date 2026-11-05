/**
 * Clash of Clans Real-Time Tracker Frontend Application
 */

const App = {
  state: {
    currentTag: null,
    profiles: [],
    profileData: null,
    metrics: null,
    activeUpgrades: [],
    events: [],
    settings: {},
    publicIp: '',
    achievementsFilter: 'all',
    achievementsVillage: 'all',
    achievementsSearch: '',
    buildingsFilter: 'all',
    buildingsSearch: '',
    buildingsVillage: 'home',
    troopsFilter: 'all',
    spellsFilter: 'all',
    petsFilter: 'all',
    equipFilter: 'all',
    helpersFilter: 'all',
    guardiansFilter: 'all'
  },

  setHelpersFilter(filter) {
    this.state.helpersFilter = filter;
    this.renderHelpers();
  },

  setGuardiansFilter(filter) {
    this.state.guardiansFilter = filter;
    this.renderGuardians();
  },

  setAchievementsVillage(village) {
    this.state.achievementsVillage = village || 'all';
    const subtabs = [
      { id: 'subtab-ach-all', v: 'all' },
      { id: 'subtab-ach-home', v: 'home' },
      { id: 'subtab-ach-builder', v: 'builderBase' },
      { id: 'subtab-ach-capital', v: 'clanCapital' }
    ];
    subtabs.forEach(item => {
      const btn = document.getElementById(item.id);
      if (btn) btn.classList.toggle('active', this.state.achievementsVillage === item.v);
    });
    this.renderAchievements();
  },

  setBuildingsVillage(village) {
    this.state.buildingsVillage = village;
    const homeBtn = document.getElementById('subtab-village-home');
    const builderBtn = document.getElementById('subtab-village-builder');
    if (homeBtn) homeBtn.classList.toggle('active', village === 'home');
    if (builderBtn) builderBtn.classList.toggle('active', village === 'builderBase');
    this.renderBuildings();
  },

  setTroopsFilter(filter) {
    this.state.troopsFilter = filter;
    this.renderArmy();
  },

  setSpellsFilter(filter) {
    this.state.spellsFilter = filter;
    this.renderArmy();
  },

  setPetsFilter(filter) {
    this.state.petsFilter = filter;
    this.renderArmy();
  },

  setEquipFilter(filter) {
    this.state.equipFilter = filter;
    this.renderArmy();
  },

  timerTicker: null,
  sseSource: null,

  async init() {
    if (window.I18n) window.I18n.init();
    this.bindEvents();
    this.setupSSE();
    await this.fetchSettings();
    await this.fetchPublicIp();
    await this.fetchProfiles();
    this.startLocalTimerTicker();
  },

  // Setup Server-Sent Events (SSE) for Real-Time Updates
  setupSSE() {
    try {
      this.sseSource = new EventSource('/api/events');
      
      this.sseSource.addEventListener('profile_updated', (e) => {
        const payload = JSON.parse(e.data);
        console.log('[SSE] Profile updated:', payload);
        if (payload.diffs && payload.diffs.length > 0) {
          payload.diffs.forEach(diff => {
            this.showToast(`⚡ ${diff.title}: ${diff.description}`, 'success');
          });
        }
        if (payload.tag === this.state.currentTag) {
          this.loadProfileDetail(this.state.currentTag, false);
        }
        this.fetchEvents();
      });

      this.sseSource.addEventListener('active_profile_changed', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.tag !== this.state.currentTag) {
          this.switchProfile(payload.tag, false);
        }
      });

      this.sseSource.addEventListener('upgrade_timer_added', () => {
        this.loadProfileDetail(this.state.currentTag, false);
      });

      this.sseSource.addEventListener('upgrade_timer_deleted', () => {
        this.loadProfileDetail(this.state.currentTag, false);
      });

      this.sseSource.addEventListener('buildings_updated', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.tag === this.state.currentTag) {
          this.loadProfileDetail(this.state.currentTag, false);
        }
      });

      this.sseSource.addEventListener('helpers_updated', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.tag === this.state.currentTag) {
          this.loadProfileDetail(this.state.currentTag, false);
        }
      });

      this.sseSource.addEventListener('guardians_updated', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.tag === this.state.currentTag) {
          this.loadProfileDetail(this.state.currentTag, false);
        }
      });

      this.sseSource.onerror = () => {
        console.warn('[SSE] Connection lost, retrying in background...');
      };
    } catch (err) {
      console.warn('[SSE] EventSource not supported or failed:', err);
    }
  },

  // Event Listeners Binding
  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Profile Dropdown
    const profileSelect = document.getElementById('profile-select');
    profileSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        this.switchProfile(e.target.value, true);
      }
    });

    // Refresh Active Profile Button
    const btnRefresh = document.getElementById('btn-refresh-active');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        this.refreshActiveProfile();
      });
    }

    // Copy Tag Click
    const bannerTag = document.getElementById('banner-player-tag');
    if (bannerTag) {
      bannerTag.addEventListener('click', () => {
        if (this.state.currentTag) {
          navigator.clipboard.writeText(this.state.currentTag);
          this.showToast(window.I18n ? window.I18n.t('toasts.tag_copied', { tag: this.state.currentTag }) : `Tag ${this.state.currentTag} copied!`, 'info');
        }
      });
    }

    // Modal Triggers
    const btnAddProfileModal = document.getElementById('btn-add-profile-modal');
    if (btnAddProfileModal) btnAddProfileModal.addEventListener('click', () => this.openModal('modal-add-profile'));
    const btnAddProfileTab = document.getElementById('btn-add-profile-tab');
    if (btnAddProfileTab) btnAddProfileTab.addEventListener('click', () => this.openModal('modal-add-profile'));
    const btnOpenSettings = document.getElementById('btn-open-settings');
    if (btnOpenSettings) btnOpenSettings.addEventListener('click', () => this.openModal('modal-settings-window'));
    const btnQuickTimer = document.getElementById('btn-quick-add-timer');
    if (btnQuickTimer) btnQuickTimer.addEventListener('click', () => this.openModal('modal-add-timer'));
    const btnAddUpgradeTimer = document.getElementById('btn-add-upgrade-timer');
    if (btnAddUpgradeTimer) btnAddUpgradeTimer.addEventListener('click', () => this.openModal('modal-add-timer'));
    
    // Import / Export Upgrades JSON Triggers
    const btnImportJson = document.getElementById('btn-import-upgrades-json');
    if (btnImportJson) {
      btnImportJson.addEventListener('click', () => {
        this.openModal('modal-import-upgrades');
        this.updateJsonImportPreview();
      });
    }

    const btnExportJson = document.getElementById('btn-export-upgrades-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        this.handleExportUpgradesJson();
      });
    }

    const btnTemplate = document.getElementById('btn-load-json-template');
    if (btnTemplate) {
      btnTemplate.addEventListener('click', () => {
        this.loadJsonImportTemplate();
      });
    }

    const fileInput = document.getElementById('import-json-file');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this.handleJsonFileSelect(e);
      });
    }

    const jsonTextarea = document.getElementById('import-json-textarea');
    if (jsonTextarea) {
      jsonTextarea.addEventListener('input', () => {
        this.updateJsonImportPreview();
      });
    }

    const formImport = document.getElementById('form-import-upgrades');
    if (formImport) {
      formImport.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleImportUpgradesSubmit();
      });
    }

    // Village Import Controls
    const villageFileInput = document.getElementById('village-import-file');
    if (villageFileInput) {
      villageFileInput.addEventListener('change', (e) => this.handleVillageFileSelect(e));
    }
    const villageTextarea = document.getElementById('import-village-textarea');
    if (villageTextarea) {
      villageTextarea.addEventListener('input', () => this.updateVillageImportPreview());
    }
    const btnTemplateTh = document.getElementById('btn-village-template-th');
    if (btnTemplateTh) {
      btnTemplateTh.addEventListener('click', () => this.loadVillageTemplate('th'));
    }
    const btnTemplateBh = document.getElementById('btn-village-template-bh');
    if (btnTemplateBh) {
      btnTemplateBh.addEventListener('click', () => this.loadVillageTemplate('bh'));
    }
    const btnTemplateSample = document.getElementById('btn-village-template-sample');
    if (btnTemplateSample) {
      btnTemplateSample.addEventListener('click', () => this.loadVillageTemplate('sample'));
    }
    const btnClearVillage = document.getElementById('btn-clear-village-json');
    if (btnClearVillage) {
      btnClearVillage.addEventListener('click', () => this.clearVillageJsonTextarea());
    }
    const btnImportVillage = document.getElementById('btn-import-village-submit');
    if (btnImportVillage) {
      btnImportVillage.addEventListener('click', () => this.handleImportVillageSubmit());
    }
    const btnExportVillage = document.getElementById('btn-export-village-json');
    if (btnExportVillage) {
      btnExportVillage.addEventListener('click', () => this.handleExportVillageJson());
    }
    document.querySelectorAll('input[name="village-import-target"]').forEach(r => {
      r.addEventListener('change', () => this.updateVillageImportPreview());
    });

    const btnRefreshEvents = document.getElementById('btn-refresh-events');
    if (btnRefreshEvents) {
      btnRefreshEvents.addEventListener('click', () => this.fetchEvents());
    }

    // Settings Window Sub-tabs Switching
    document.querySelectorAll('.settings-dialog-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-subtab');
        document.querySelectorAll('.settings-dialog-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.settings-dialog-pane').forEach(p => p.classList.toggle('active', p.id === target));
      });
    });

    // Modal Close
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = btn.getAttribute('data-modal');
        if (modalId) this.closeModal(modalId);
      });
    });

    // Close Modal on Overlay Click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay.id);
        }
      });
    });

    // Close Modal on Escape Key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(modal => {
          this.closeModal(modal.id);
        });
      }
    });

    // Form Add Profile
    const formAddProfile = document.getElementById('form-add-profile');
    if (formAddProfile) {
      formAddProfile.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddProfileSubmit();
      });
    }

    // Form Add Timer
    const formAddTimer = document.getElementById('form-add-timer');
    if (formAddTimer) {
      formAddTimer.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddTimerSubmit();
      });
    }

    // Form API Settings
    const formApiSettings = document.getElementById('api-settings-form');
    if (formApiSettings) {
      formApiSettings.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveSettingsSubmit();
      });
    }

    // Copy IP button
    const btnCopyIp = document.getElementById('btn-copy-ip');
    if (btnCopyIp) {
      btnCopyIp.addEventListener('click', () => {
        if (this.state.publicIp) {
          navigator.clipboard.writeText(this.state.publicIp);
          this.showToast(window.I18n ? window.I18n.t('toasts.ip_copied') : 'IP copied!', 'info');
        }
      });
    }

    // Link to open settings directly from Add Profile modal
    const linkSettingsFromAdd = document.getElementById('link-open-settings-from-add');
    if (linkSettingsFromAdd) {
      linkSettingsFromAdd.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeModal('modal-add-profile');
        this.openModal('modal-settings-window');
      });
    }

    // Load Demo button
    const btnLoadDemo = document.getElementById('btn-load-demo');
    if (btnLoadDemo) {
      btnLoadDemo.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/profiles/seed-demo', { method: 'POST' });
          const json = await res.json();
          if (json.success) {
            this.showToast(window.I18n ? window.I18n.t('toasts.demo_reloaded') : 'Demo profiles reloaded successfully!', 'success');
            await this.fetchProfiles();
          }
        } catch (err) {
          this.showToast('Error reloading demo profiles: ' + err.message, 'error');
        }
      });
    }

    // Achievements filter buttons
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.achievementsFilter = btn.getAttribute('data-filter');
        this.renderAchievements();
      });
    });

    // Achievements search input
    const achSearch = document.getElementById('ach-search-input');
    if (achSearch) {
      achSearch.addEventListener('input', (e) => {
        this.state.achievementsSearch = e.target.value.toLowerCase().trim();
        this.renderAchievements();
      });
    }

    // Buildings filter buttons
    document.querySelectorAll('.bld-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bld-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.buildingsFilter = btn.getAttribute('data-bld-filter');
        this.renderBuildings();
      });
    });

    // Buildings search input
    const bldSearch = document.getElementById('bld-search-input');
    if (bldSearch) {
      bldSearch.addEventListener('input', (e) => {
        this.state.buildingsSearch = e.target.value.toLowerCase().trim();
        this.renderBuildings();
      });
    }

    // Max all to current TH button
    const btnMaxAll = document.getElementById('btn-max-all-th');
    if (btnMaxAll) {
      btnMaxAll.addEventListener('click', () => {
        this.handleMaxAllToCurrentTH();
      });
    }
  },

  // Tab switcher
  switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });
  },

  // Called when active language is switched
  onLanguageChanged() {
    this.renderBanner();
    this.renderOverview();
    this.renderUpgradesTab();
    this.renderBuildings();
    this.renderArmy();
    this.renderAchievements();
    this.renderEvents();
    this.renderProfilesTable();
  },

  // Modals
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('open');

    if (modalId === 'modal-add-profile') {
      const isFirstProfile = !this.state.profiles || this.state.profiles.length === 0;
      const welcomeEl = document.getElementById('add-profile-welcome-notice');
      if (welcomeEl) welcomeEl.style.display = isFirstProfile ? 'block' : 'none';

      const tokenEl = document.getElementById('add-profile-token-notice');
      const hasToken = !!(this.state.settings && this.state.settings.cocApiToken);
      if (tokenEl) tokenEl.style.display = !hasToken ? 'block' : 'none';

      const tagInput = document.getElementById('add-profile-tag');
      if (tagInput) setTimeout(() => tagInput.focus(), 120);
    }
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('open');
  },

  // Toast Notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div style="flex: 1;">${message}</div>
      <button style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.1rem;">&times;</button>
    `;
    toast.querySelector('button').onclick = () => toast.remove();
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4500);
  },

  // Fetch Public IP
  async fetchPublicIp() {
    try {
      const res = await fetch('/api/ip');
      const data = await res.json();
      this.state.publicIp = data.ip;
      const el = document.getElementById('detected-public-ip');
      if (el) el.textContent = data.ip;
    } catch (e) {
      console.warn('IP fetch failed');
    }
  },

  // Fetch Settings
  async fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      this.state.settings = data;
      const intervalSelect = document.getElementById('select-poll-interval');
      if (intervalSelect && data.pollIntervalMinutes) {
        intervalSelect.value = data.pollIntervalMinutes.toString();
      }
    } catch (e) {
      console.warn('Settings fetch failed');
    }
  },

  // Save Settings
  async handleSaveSettingsSubmit() {
    const tokenInput = document.getElementById('input-api-token').value;
    const intervalSelect = document.getElementById('select-poll-interval').value;

    const payload = {
      pollIntervalMinutes: parseInt(intervalSelect, 10) || 15
    };
    if (tokenInput) {
      payload.cocApiToken = tokenInput.trim();
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(window.I18n ? window.I18n.t('toasts.settings_saved') : 'Settings saved successfully!', 'success');
        document.getElementById('input-api-token').value = '';
        await this.fetchSettings();
      } else {
        this.showToast(data.error || 'Error while saving', 'error');
      }
    } catch (err) {
      this.showToast('Connection error: ' + err.message, 'error');
    }
  },

  // Fetch Profiles
  async fetchProfiles() {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      this.state.profiles = data.profiles || [];
      const activeTag = data.activeProfileTag || (this.state.profiles[0] ? this.state.profiles[0].tag : null);

      this.renderProfilesSelect(activeTag);
      this.renderProfilesTable();

      if (activeTag) {
        await this.switchProfile(activeTag, false);
      } else {
        // No profiles registered yet (first launch or all profiles deleted)
        this.state.currentTag = null;
        this.state.profileData = null;
        this.state.metrics = null;
        this.state.activeUpgrades = [];
        this.renderEmptyState();
        this.openModal('modal-add-profile');
      }
    } catch (err) {
      this.showToast('Error loading profiles: ' + err.message, 'error');
    }
  },

  renderEmptyState() {
    const bannerName = document.getElementById('banner-player-name');
    if (bannerName) bannerName.textContent = window.I18n ? window.I18n.t('header.no_profiles') : 'No Profile Selected';
    const bannerTag = document.getElementById('banner-player-tag');
    if (bannerTag) bannerTag.textContent = 'Add a player tag to get started';
    const bannerClan = document.getElementById('banner-clan-badge');
    if (bannerClan) bannerClan.style.display = 'none';
    const bannerClanName = document.getElementById('banner-clan-name');
    if (bannerClanName) bannerClanName.textContent = '';
    const bannerRole = document.getElementById('banner-role');
    if (bannerRole) bannerRole.textContent = '';
    const bannerThLevel = document.getElementById('banner-th-level');
    if (bannerThLevel) bannerThLevel.textContent = '-';
    const bannerTrophies = document.getElementById('banner-trophies');
    if (bannerTrophies) bannerTrophies.textContent = '-';
    const bannerBest = document.getElementById('banner-best-trophies');
    if (bannerBest) bannerBest.textContent = '-';
    const bannerWar = document.getElementById('banner-war-stars');
    if (bannerWar) bannerWar.textContent = '-';
    const bannerBb = document.getElementById('banner-bb-trophies');
    if (bannerBb) bannerBb.textContent = '-';

    ['ov-overall-percent', 'ov-overall-val', 'ov-buildings-percent', 'ov-heroes-percent', 'ov-equip-percent', 'ov-lab-percent'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '0%';
    });
    ['ov-buildings-val', 'ov-heroes-val', 'ov-equip-val', 'ov-lab-val'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '0 / 0';
    });
    ['ov-overall-bar', 'ov-buildings-bar', 'ov-heroes-bar', 'ov-equip-bar', 'ov-lab-bar'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.width = '0%';
    });

    const recCont = document.getElementById('overview-recommendations');
    if (recCont) {
      recCont.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🏰</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">Welcome to Track of Clans!</div>
          <p style="color: var(--text-muted); max-width: 520px; margin: 0 auto 1.5rem auto; line-height: 1.5;">
            No player profile registered yet. Add your Clash of Clans Player Tag to track builder timers, army, laboratory research, hero equipment, and defenses in real time!
          </p>
          <button class="btn btn-primary btn-clash" onclick="App.openModal('modal-add-profile')">➕ Add Player Profile</button>
        </div>
      `;
    }

    const bldCont = document.getElementById('buildings-grid-container');
    if (bldCont) {
      bldCont.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏰</div>
          <div style="font-weight: 700; color: #fff; margin-bottom: 0.5rem;">No active profile</div>
          <p>Please add a player profile to inspect and manage village buildings and defenses.</p>
          <button class="btn btn-primary btn-clash" style="margin-top: 1rem;" onclick="App.openModal('modal-add-profile')">➕ Add Player Profile</button>
        </div>
      `;
    }

    const armyCont = document.getElementById('army-troops-container');
    if (armyCont) {
      armyCont.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">Please add a player profile to inspect troops, heroes, equipment, and helpers.</div>`;
    }

    const equipCont = document.getElementById('equipment-grid-container');
    if (equipCont) {
      equipCont.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">Please add a player profile to inspect hero equipment.</div>`;
    }

    const helpersCont = document.getElementById('helpers-grid-container');
    if (helpersCont) {
      helpersCont.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">Please add a player profile to inspect helpers.</div>`;
    }

    const guardiansCont = document.getElementById('guardians-grid-container');
    if (guardiansCont) {
      guardiansCont.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">Please add a player profile to inspect guardians.</div>`;
    }

    const achCont = document.getElementById('achievements-grid-container');
    if (achCont) {
      achCont.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">Please add a player profile to inspect achievements.</div>`;
    }

    const timersCont = document.getElementById('active-upgrades-container');
    if (timersCont) {
      timersCont.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem 1.5rem; color: var(--text-muted);">No active profile selected. Add a profile to start tracking upgrade timers.</div>`;
    }
  },

  renderProfilesSelect(activeTag) {
    const select = document.getElementById('profile-select');
    select.innerHTML = '';

    if (this.state.profiles.length === 0) {
      select.innerHTML = `<option value="">${window.I18n ? window.I18n.t('header.no_profiles') : 'No profiles registered'}</option>`;
      return;
    }

    this.state.profiles.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.tag;
      opt.textContent = `TH${p.townHallLevel} ${p.nickname} (${p.tag})`;
      if (p.tag === activeTag) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  },

  async switchProfile(tag, sendServerActivate = true) {
    this.state.currentTag = tag;
    const select = document.getElementById('profile-select');
    if (select) select.value = tag;

    if (sendServerActivate) {
      fetch(`/api/profiles/${encodeURIComponent(tag)}/activate`, { method: 'POST' }).catch(() => {});
    }

    await this.loadProfileDetail(tag);
    await this.fetchEvents();
  },

  async loadProfileDetail(tag, showLoading = true) {
    if (!tag) return;
    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(tag)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Profile not found');
      }
      const data = await res.json();
      this.state.profileData = data.profile;
      this.state.metrics = data.metrics;
      this.state.activeUpgrades = data.activeUpgrades || [];

      this.renderBanner();
      this.renderOverview();
      this.renderUpgradesTab();
      this.renderBuildings();
      this.renderArmy();
      this.renderAchievements();

      const th = data.profile?.townHallLevel || 1;
      const bh = data.profile?.builderHallLevel || 1;
      const thTplLabel = document.getElementById('btn-village-template-th-label');
      if (thTplLabel) thTplLabel.textContent = window.I18n ? window.I18n.t('import_village.load_th_template', { th }) : `📋 Load TH${th} Home Template`;
      const bhTplLabel = document.getElementById('btn-village-template-bh-label');
      if (bhTplLabel) bhTplLabel.textContent = window.I18n ? window.I18n.t('import_village.load_bh_template', { bh }) : `📋 Load BH${bh} Builder Template`;
    } catch (err) {
      this.showToast(`Error loading profile: ${err.message}`, 'error');
    }
  },

  async refreshActiveProfile() {
    if (!this.state.currentTag) return;
    const icon = document.getElementById('refresh-icon');
    if (icon) icon.style.animation = 'spin 1s linear infinite';

    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/refresh`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error during synchronization');
      }
      this.showToast(window.I18n ? window.I18n.t('toasts.sync_done', { name: this.state.profileData?.name || this.state.currentTag }) : `Sync completed for ${this.state.profileData?.name || this.state.currentTag}!`, 'success');
      await this.loadProfileDetail(this.state.currentTag, false);
      await this.fetchEvents();
      await this.fetchProfiles();
    } catch (err) {
      this.showToast(`API Error: ${err.message}`, 'error');
    } finally {
      if (icon) icon.style.animation = '';
    }
  },

  // Add Profile Submit
  async handleAddProfileSubmit() {
    const tag = document.getElementById('add-profile-tag').value.trim();
    const nickname = document.getElementById('add-profile-nick').value.trim();
    const submitBtn = document.getElementById('btn-submit-add-profile');

    submitBtn.disabled = true;
    submitBtn.textContent = window.I18n ? window.I18n.t('modals.verifying') : 'Verifying...';

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, nickname })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error while adding profile.');
      }

      this.showToast(window.I18n ? window.I18n.t('toasts.profile_added', { name: data.profile.name }) : `Profile "${data.profile.name}" added successfully!`, 'success');
      this.closeModal('modal-add-profile');
      document.getElementById('form-add-profile').reset();
      await this.fetchProfiles();
      await this.switchProfile(data.profile.tag, true);
    } catch (err) {
      this.showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = window.I18n ? window.I18n.t('modals.add_and_track_btn') : 'Add and Track';
    }
  },

  // Add Timer Submit
  async handleAddTimerSubmit() {
    if (!this.state.currentTag) {
      this.showToast(window.I18n ? window.I18n.t('toasts.no_active_profile') : 'No active profile selected!', 'error');
      return;
    }

    const type = document.getElementById('timer-type').value;
    const name = document.getElementById('timer-name').value.trim();
    const builderIdx = parseInt(document.getElementById('timer-builder-idx').value, 10) || 1;
    const days = parseInt(document.getElementById('timer-days').value, 10) || 0;
    const hours = parseInt(document.getElementById('timer-hours').value, 10) || 0;
    const mins = parseInt(document.getElementById('timer-mins').value, 10) || 0;

    const totalSecs = (days * 86400) + (hours * 3600) + (mins * 60);
    if (totalSecs <= 0) {
      this.showToast('Please enter a valid duration (at least 1 minute).', 'error');
      return;
    }

    const endTime = new Date(Date.now() + totalSecs * 1000).toISOString();

    const upgrade = {
      type,
      name,
      builderIndex: builderIdx,
      startTime: new Date().toISOString(),
      endTime,
      totalSeconds: totalSecs,
      icon: type === 'lab' ? 'potion' : (type === 'pet' ? 'shield' : 'hammer')
    };

    try {
      const res = await fetch('/api/upgrades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerTag: this.state.currentTag, upgrade })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error saving timer');

      this.showToast(window.I18n ? window.I18n.t('toasts.timer_started', { name }) : `Timer per "${name}" avviato!`, 'success');
      this.closeModal('modal-add-timer');
      document.getElementById('form-add-timer').reset();
      await this.loadProfileDetail(this.state.currentTag, false);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // Delete Timer
  async deleteTimer(upgradeId) {
    if (!this.state.currentTag) return;
    try {
      const res = await fetch(`/api/upgrades/${encodeURIComponent(this.state.currentTag)}/${encodeURIComponent(upgradeId)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error deleting timer');
      this.showToast(window.I18n ? window.I18n.t('toasts.timer_deleted') : 'Timer deleted.', 'info');
      await this.loadProfileDetail(this.state.currentTag, false);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // JSON Template loader for Import Modal
  loadJsonImportTemplate() {
    const lvlStr = window.I18n ? window.I18n.t('common.lvl') : 'Lvl.';
    const bld = (id) => (window.I18n ? window.I18n.getBuildingName(id) : id);
    const template = [
      {
        "name": `${bld('monolith')} ${lvlStr} 5`,
        "builderIndex": 1,
        "days": 4,
        "hours": 12,
        "mins": 0,
        "type": "builder"
      },
      {
        "name": `${bld('x_bow')} ${lvlStr} 13`,
        "builderIndex": 2,
        "days": 2,
        "hours": 8,
        "mins": 30,
        "type": "builder"
      },
      {
        "name": `${bld('ricochet_cannon')} ${lvlStr} 4`,
        "builderIndex": 3,
        "days": 3,
        "hours": 0,
        "type": "builder"
      },
      {
        "name": `${bld('multi_archer_tower')} ${lvlStr} 4`,
        "builderIndex": 4,
        "days": 5,
        "hours": 6,
        "type": "builder"
      },
      {
        "name": `${bld('laboratory')} ${lvlStr} 14`,
        "builderIndex": 5,
        "days": 1,
        "hours": 18,
        "type": "lab"
      }
    ];
    const textarea = document.getElementById('import-json-textarea');
    if (textarea) {
      textarea.value = JSON.stringify(template, null, 2);
      this.updateJsonImportPreview();
    }
  },

  // Handle JSON file selection via input
  handleJsonFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const labelName = document.getElementById('import-file-name');
    if (labelName) labelName.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const textarea = document.getElementById('import-json-textarea');
      if (textarea && typeof content === 'string') {
        textarea.value = content;
        this.updateJsonImportPreview();
      }
    };
    reader.onerror = () => {
      this.showToast('Error reading JSON file.', 'error');
    };
    reader.readAsText(file);
  },

  // Live validation and count preview for JSON textarea
  updateJsonImportPreview() {
    const textarea = document.getElementById('import-json-textarea');
    const counter = document.getElementById('import-json-counter');
    if (!textarea || !counter) return;

    const val = textarea.value.trim();
    if (!val) {
      counter.textContent = window.I18n ? window.I18n.t('modals.items_detected', { count: 0 }) : '0 items detected';
      counter.style.color = 'var(--text-muted)';
      return;
    }

    try {
      const parsed = JSON.parse(val);
      const list = Array.isArray(parsed) ? parsed : (parsed.upgrades || parsed.activeUpgrades || (parsed.name ? [parsed] : []));
      if (Array.isArray(list) && list.length > 0) {
        counter.textContent = `✅ ` + (window.I18n ? window.I18n.t('modals.items_detected', { count: list.length }) : `${list.length} upgrades detected in JSON`);
        counter.style.color = '#4ade80';
      } else {
        counter.textContent = window.I18n ? window.I18n.t('modals.no_array_found') : '⚠️ No upgrades array found in JSON';
        counter.style.color = '#f59e0b';
      }
    } catch (err) {
      counter.textContent = window.I18n ? window.I18n.t('modals.json_syntax_error', { err: err.message }) : '❌ JSON syntax error: ' + err.message;
      counter.style.color = '#f87171';
    }
  },

  // Submit Handler for JSON Import
  async handleImportUpgradesSubmit() {
    if (!this.state.currentTag) {
      this.showToast(window.I18n ? window.I18n.t('toasts.no_active_profile') : 'No active profile selected!', 'error');
      return;
    }

    const textarea = document.getElementById('import-json-textarea');
    const val = textarea ? textarea.value.trim() : '';
    if (!val) {
      this.showToast('Please enter or upload JSON text before importing.', 'error');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(val);
    } catch (err) {
      this.showToast('Invalid JSON syntax: ' + err.message, 'error');
      return;
    }

    const list = Array.isArray(parsed) ? parsed : (parsed.upgrades || parsed.activeUpgrades || (parsed.name ? [parsed] : []));
    if (!Array.isArray(list) || list.length === 0) {
      this.showToast(window.I18n ? window.I18n.t('toasts.no_valid_upgrades') : 'The JSON does not contain any valid upgrades.', 'error');
      return;
    }

    const modeRadio = document.querySelector('input[name="import-mode"]:checked');
    const replace = modeRadio ? modeRadio.value === 'replace' : false;

    const submitBtn = document.getElementById('btn-submit-import-upgrades');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = window.I18n ? window.I18n.t('modals.importing') : 'Importing...';
    }

    try {
      const res = await fetch('/api/upgrades/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerTag: this.state.currentTag,
          upgrades: list,
          replace
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error during import');

      this.showToast(window.I18n ? window.I18n.t('toasts.imported_n', { count: data.count }) : `🎉 Successfully imported ${data.count} upgrades!`, 'success');
      this.closeModal('modal-import-upgrades');
      if (textarea) textarea.value = '';
      const labelName = document.getElementById('import-file-name');
      if (labelName) labelName.textContent = '';

      await this.loadProfileDetail(this.state.currentTag, false);
      this.switchTab('tab-upgrades');
    } catch (err) {
      this.showToast(err.message, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = window.I18n ? window.I18n.t('modals.import_btn') : 'Import Upgrades';
      }
    }
  },

  // Export Active Upgrades as JSON
  async handleExportUpgradesJson() {
    if (!this.state.currentTag) {
      this.showToast(window.I18n ? window.I18n.t('toasts.no_active_profile') : 'No active profile selected!', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/upgrades/${encodeURIComponent(this.state.currentTag)}/export`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error during export');

      const jsonStr = JSON.stringify(data.activeUpgrades || [], null, 2);

      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(jsonStr);
        this.showToast(`📋 JSON with ${(data.activeUpgrades || []).length} timers copied!`, 'success');
      } catch (clipErr) {
        // Continue to download
      }

      // Download file
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coc-timers-${this.state.currentTag.replace('#', '')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      this.showToast('Error during export: ' + err.message, 'error');
    }
  },

  // Delete Profile
  async deleteProfile(tag) {
    if (!confirm(window.I18n ? window.I18n.t('settings_modal.confirm_delete_profile', { tag }) : `Are you sure you want to delete profile ${tag}?`)) return;
    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(tag)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting profile');
      this.showToast(window.I18n ? window.I18n.t('toasts.profile_deleted', { tag }) : `Profile ${tag} deleted.`, 'info');
      await this.fetchProfiles();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // Fetch Events
  async fetchEvents() {
    try {
      const url = this.state.currentTag
        ? `/api/events/list?tag=${encodeURIComponent(this.state.currentTag)}&limit=30`
        : '/api/events/list?limit=30';
      const res = await fetch(url);
      const data = await res.json();
      this.state.events = data;
      this.renderEvents();
    } catch (e) {
      console.warn('Events fetch failed');
    }
  },

  // RENDER: BANNER
  renderBanner() {
    const p = this.state.profileData;
    if (!p) return;

    // TH
    const thBox = document.getElementById('banner-th-box');
    const thImg = document.getElementById('banner-th-img');
    const thLevel = p.townHallLevel || 1;
    const thLevelEl = document.getElementById('banner-th-level');
    if (thLevelEl) thLevelEl.textContent = thLevel;
    if (thImg) {
      thImg.src = Assets.getTownHallImg(thLevel);
    }
    if (thBox) {
      if (thLevel >= 18) {
        thBox.style.background = 'radial-gradient(circle at 50% 30%, #3b1b68 0%, #150f28 100%)';
        thBox.style.borderColor = '#c084fc';
        thBox.style.boxShadow = '0 0 25px rgba(192, 132, 252, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)';
      } else if (thLevel >= 16) {
        thBox.style.background = 'radial-gradient(circle at 50% 30%, #7c2d12 0%, #182030 100%)';
        thBox.style.borderColor = '#f97316';
        thBox.style.boxShadow = '0 0 20px rgba(249, 115, 22, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)';
      } else {
        thBox.style.background = 'radial-gradient(circle at 50% 30%, #313d54 0%, #161c28 100%)';
        thBox.style.borderColor = '#eab308';
        thBox.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.25)';
      }
    }
    const thStars = document.getElementById('banner-th-stars');
    if (thStars) {
      if (p.townHallWeaponLevel && p.townHallWeaponLevel > 0) {
        thStars.style.display = 'block';
        thStars.textContent = '★'.repeat(p.townHallWeaponLevel);
      } else {
        thStars.style.display = 'none';
      }
    }

    // Player info
    const pNameEl = document.getElementById('banner-player-name');
    if (pNameEl) pNameEl.textContent = p.name || 'Unknown';
    const pExpEl = document.getElementById('banner-player-exp');
    if (pExpEl) pExpEl.textContent = p.expLevel || '1';
    const pTagEl = document.getElementById('banner-player-tag');
    if (pTagEl) {
      const span = pTagEl.querySelector('span');
      if (span) span.textContent = p.tag || '';
    }

    // Mode
    const modeBadge = document.getElementById('banner-mode-badge');
    if (modeBadge) {
      if (p._isMock) {
        modeBadge.style.display = 'inline-block';
        modeBadge.textContent = window.I18n ? window.I18n.t('banner.demo_mode') : 'Demo Data';
        modeBadge.style.background = '#374151';
        modeBadge.style.color = '#9ca3af';
      } else {
        modeBadge.style.display = 'inline-block';
        modeBadge.textContent = window.I18n ? window.I18n.t('banner.api_mode') : 'Official API';
        modeBadge.style.background = 'rgba(16, 185, 129, 0.2)';
        modeBadge.style.color = '#34d399';
      }
    }

    // Clan
    const clanBadgeImg = document.getElementById('banner-clan-badge');
    const clanName = document.getElementById('banner-clan-name');
    const clanLvl = document.getElementById('banner-clan-level');
    const clanRole = document.getElementById('banner-clan-role');

    if (p.clan) {
      if (clanBadgeImg) {
        clanBadgeImg.style.display = 'inline-block';
        clanBadgeImg.src = p.clan.badgeUrls?.small || p.clan.badgeUrls?.medium || '';
      }
      if (clanName) clanName.textContent = p.clan.name;
      if (clanLvl) clanLvl.textContent = `(${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} ${p.clan.clanLevel})`;
      if (clanRole) clanRole.textContent = window.I18n ? window.I18n.translateRole(p.role) : Assets.translateRole(p.role);
    } else {
      if (clanBadgeImg) clanBadgeImg.style.display = 'none';
      if (clanName) clanName.textContent = window.I18n ? window.I18n.t('banner.no_clan') : 'No Clan';
      if (clanLvl) clanLvl.textContent = '';
      if (clanRole) clanRole.textContent = window.I18n ? window.I18n.translateRole('member') : 'Member';
    }

    const lastSyncEl = document.getElementById('banner-last-sync');
    if (lastSyncEl) {
      lastSyncEl.textContent = `${window.I18n ? window.I18n.t('banner.synced') : 'Synced: '}${Assets.formatTimeAgo(p.lastUpdated)}`;
    }

    // Ranked League Tier & Home Trophies
    const tierBadge = document.getElementById('banner-tier-league-badge');
    const tierName = document.getElementById('banner-tier-league-name');
    const tierWrap = document.getElementById('banner-tier-league-wrap');
    const tierPill = document.getElementById('banner-tier-pill');
    const tierPillName = document.getElementById('banner-tier-pill-name');
    const tierPillIcon = document.getElementById('banner-tier-pill-icon');

    const activeTier = (p.leagueTier && p.leagueTier.name) ? p.leagueTier : (p.league && p.league.name ? p.league : null);
    if (activeTier) {
      const isTier = !!(p.leagueTier && p.leagueTier.name);
      const tierImgUrl = isTier ? Assets.getLeagueTierImg(p.leagueTier) : Assets.getLeagueImg(p.league);
      if (tierWrap) tierWrap.style.display = 'flex';
      if (tierBadge) {
        tierBadge.src = tierImgUrl;
        tierBadge.alt = activeTier.name;
      }
      if (tierName) {
        tierName.textContent = activeTier.name;
        tierName.title = activeTier.name;
      }
      if (tierPill) {
        tierPill.style.display = 'inline-flex';
        tierPill.title = `League Tier: ${activeTier.name}`;
        if (tierPillName) tierPillName.textContent = activeTier.name;
        if (tierPillIcon) tierPillIcon.src = tierImgUrl;
      }
    } else {
      if (tierBadge) tierBadge.src = Assets.getLeagueTierImg(null);
      if (tierName) {
        tierName.textContent = window.I18n ? window.I18n.t('banner.unranked') : 'Unranked';
        tierName.title = 'Unranked';
      }
      if (tierPill) tierPill.style.display = 'none';
    }

    const trEl = document.getElementById('banner-trophies');
    if (trEl) trEl.textContent = Assets.formatNumber(p.trophies || 0);

    // Builder Base League & Trophies
    const bbLeagueBadge = document.getElementById('banner-bb-league-badge');
    if (bbLeagueBadge) {
      bbLeagueBadge.style.display = 'inline-block';
      bbLeagueBadge.src = Assets.getBuilderBaseLeagueImg(p.builderBaseLeague);
      bbLeagueBadge.alt = p.builderBaseLeague?.name || (window.I18n ? window.I18n.t('banner.unranked') : 'Unranked');
    }
    const bbLeagueName = document.getElementById('banner-bb-league-name');
    if (bbLeagueName) {
      bbLeagueName.textContent = p.builderBaseLeague?.name || (window.I18n ? window.I18n.t('banner.unranked') : 'Unranked');
    }
    const bbTrEl = document.getElementById('banner-bb-trophies');
    const bbTrophies = p.builderBaseTrophies !== undefined ? p.builderBaseTrophies : (p.versusTrophies !== undefined ? p.versusTrophies : 0);
    if (bbTrEl) bbTrEl.textContent = Assets.formatNumber(bbTrophies);

    // Records
    const bTrEl = document.getElementById('banner-best-trophies');
    if (bTrEl) bTrEl.textContent = Assets.formatNumber(p.bestTrophies || 0);
    const wsEl = document.getElementById('banner-war-stars');
    if (wsEl) wsEl.textContent = Assets.formatNumber(p.warStars || 0);
  },

  // RENDER: OVERVIEW
  renderOverview() {
    const m = this.state.metrics;
    const p = this.state.profileData;
    if (!m || !p) return;

    const setElemText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const setElemWidth = (id, width) => {
      const el = document.getElementById(id);
      if (el) el.style.width = width;
    };

    // Metrics rings / bars
    if (m.overallPercent !== undefined) {
      setElemText('ov-overall-percent', `${m.overallPercent}%`);
      setElemText('ov-overall-val', `${m.overallPercent}%`);
      setElemWidth('ov-overall-bar', `${m.overallPercent}%`);
    }

    if (m.heroes) {
      setElemText('ov-heroes-percent', `${m.heroes.percent}%`);
      setElemText('ov-heroes-val', `${m.heroes.currentLevels} / ${m.heroes.maxLevels}`);
      setElemWidth('ov-heroes-bar', `${m.heroes.percent}%`);
    }

    if (m.equipment) {
      setElemText('ov-equip-percent', `${m.equipment.percent}%`);
      setElemText('ov-equip-val', `${m.equipment.currentLevels} / ${m.equipment.maxLevels}`);
      setElemWidth('ov-equip-bar', `${m.equipment.percent}%`);
    }

    if (m.laboratory) {
      setElemText('ov-lab-percent', `${m.laboratory.percent}%`);
      setElemText('ov-lab-val', `${m.laboratory.currentLevels} / ${m.laboratory.maxLevels}`);
      setElemWidth('ov-lab-bar', `${m.laboratory.percent}%`);
    }

    // Buildings & Defenses
    if (m.buildings) {
      setElemText('ov-buildings-percent', `${m.buildings.percent}%`);
      setElemText('ov-buildings-val', `${m.buildings.currentLevels} / ${m.buildings.maxLevels}`);
      setElemWidth('ov-buildings-bar', `${m.buildings.percent}%`);
      setElemText('tab-bld-percent', `${m.buildings.percent}%`);
    }

    // Battle Stats
    setElemText('ov-stat-attack-wins', Assets.formatNumber(p.attackWins || 0));
    setElemText('ov-stat-defense-wins', Assets.formatNumber(p.defenseWins || 0));
    setElemText('ov-stat-builder-hall', `${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} ${p.builderHallLevel || 1}`);
    setElemText('ov-stat-bh-trophies', Assets.formatNumber(p.builderBaseTrophies || 0));

    // Donations
    const donSent = p.donations || 0;
    const donRec = p.donationsReceived || 0;
    setElemText('ov-donations-ratio', `${Assets.formatCompactNumber(donSent)} / ${Assets.formatCompactNumber(donRec)}`);
    const totalDon = donSent + donRec;
    const donRatioPercent = totalDon > 0 ? Math.round((donSent / totalDon) * 100) : 50;
    setElemWidth('ov-donations-bar', `${donRatioPercent}%`);

    // Active Timers Quick View in Overview
    const ovTimersList = document.getElementById('ov-active-timers-list');
    if (this.state.activeUpgrades.length === 0) {
      ovTimersList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1.5rem;">${window.I18n ? window.I18n.t('overview.no_active_builders') : 'No upgrades currently tracked.'}</div>`;
    } else {
      ovTimersList.innerHTML = this.state.activeUpgrades.map(u => {
        const remainingSec = Math.max(0, Math.floor((new Date(u.endTime).getTime() - Date.now()) / 1000));
        return `
          <div style="background: var(--bg-surface); padding: 0.65rem 0.85rem; border-radius: 0.5rem; border: 1px solid var(--border); margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem; color: #fff;">${u.name}</div>
              <div style="font-size: 0.7rem; color: var(--gold);">${window.I18n ? window.I18n.t('upgrades.builder_title') : 'Builder'} #${u.builderIndex}</div>
            </div>
            <div style="font-family: monospace; font-weight: 800; color: #fbbf24; font-size: 0.9rem;" data-timer-end="${u.endTime}">
              ${Assets.formatRemainingTime(remainingSec)}
            </div>
          </div>
        `;
      }).join('');
    }

    // Closest Achievements
    const closestCont = document.getElementById('ov-closest-achievements');
    if (m.achievements.closest.length === 0) {
      closestCont.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1.5rem;">${window.I18n ? window.I18n.t('overview.closest_achievements_completed') : 'All achievements have been completed 100%! 👑'}</div>`;
    } else {
      closestCont.innerHTML = m.achievements.closest.map(a => `
        <div style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.2rem;">
            <strong style="color: #fff;">${a.name}</strong>
            <span style="color: var(--gold);">${a.percent}%</span>
          </div>
          <div class="progress-bar-bg" style="height: 6px;">
            <div class="progress-bar-fill fill-gold" style="width: ${a.percent}%"></div>
          </div>
        </div>
      `).join('');
    }

    // Upgrades tab details (if present in DOM)
    const detailTh = document.getElementById('detail-th-status');
    if (detailTh && m.townHall) {
      detailTh.textContent = `${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} ${m.townHall.current} / ${m.townHall.max} (${m.townHall.percent}%)`;
    }
    const detailHeroes = document.getElementById('detail-heroes-status');
    if (detailHeroes && m.heroes) {
      detailHeroes.textContent = `${m.heroes.percent}% (${m.heroes.count} ${window.I18n ? window.I18n.t('tabs.army') : 'Heroes'})`;
    }
    const detailLab = document.getElementById('detail-lab-status');
    if (detailLab && m.laboratory) {
      detailLab.textContent = `${m.laboratory.percent}% (${m.laboratory.currentLevels} / ${m.laboratory.maxLevels})`;
    }
    const detailBld = document.getElementById('detail-buildings-status');
    if (detailBld && m.buildings) {
      detailBld.textContent = `${m.buildings.percent}% (${m.buildings.count} ${window.I18n ? window.I18n.t('tabs.buildings') : 'Buildings'})`;
    }
  },

  // RENDER: UPGRADES TAB & LIVE TIMERS
  renderUpgradesTab() {
    const container = document.getElementById('upgrades-timers-container');
    if (!container) return;
    if (this.state.activeUpgrades.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
          ${window.I18n ? window.I18n.t('upgrades.no_timers') : 'No active timers. Click "+ New Upgrade" to track your builders!'}
        </div>
      `;
      return;
    }

    container.innerHTML = this.state.activeUpgrades.map(u => {
      const remainingSec = Math.max(0, Math.floor((new Date(u.endTime).getTime() - Date.now()) / 1000));
      const isFinished = remainingSec <= 0;
      return `
        <div class="timer-card type-${u.type}">
          <div class="timer-top-row">
            <div>
              <div class="timer-name">${u.name}</div>
              <div class="timer-end-date">${new Date(u.endTime).toLocaleString(window.I18n ? window.I18n.getLocale() : 'en-US')}</div>
            </div>
            <span class="timer-builder-tag">${window.I18n ? window.I18n.t('upgrades.builder_title') : 'Slot'} #${u.builderIndex}</span>
          </div>
          <div class="timer-countdown" data-timer-end="${u.endTime}">
            ${isFinished ? (window.I18n ? window.I18n.t('upgrades.completed') : '✅ Completed!') : Assets.formatRemainingTime(remainingSec)}
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
            <button class="btn btn-danger btn-icon" style="width: 1.75rem; height: 1.75rem; padding: 0.2rem;" onclick="App.deleteTimer('${u.id}')" title="${window.I18n ? window.I18n.t('common.delete') : 'Delete Timer'}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // Local ticker running every second for ultra smooth real-time countdowns
  startLocalTimerTicker() {
    if (this.timerTicker) clearInterval(this.timerTicker);
    this.timerTicker = setInterval(() => {
      document.querySelectorAll('[data-timer-end]').forEach(el => {
        const endTimeStr = el.getAttribute('data-timer-end');
        if (!endTimeStr) return;
        const remainingSec = Math.max(0, Math.floor((new Date(endTimeStr).getTime() - Date.now()) / 1000));
        el.textContent = remainingSec <= 0 ? (window.I18n ? window.I18n.t('upgrades.completed') : '✅ Completed!') : Assets.formatRemainingTime(remainingSec);
      });
    }, 1000);
  },

  // RENDER: ARMY & HEROES
  renderArmy() {
    const p = this.state.profileData;
    if (!p) return;

    // Heroes list (including locked heroes)
    const heroesCont = document.getElementById('heroes-list-container');
    const existingHeroesMap = new Map((p.heroes || []).map(h => [h.name, h]));
    const th = p.townHallLevel || 1;
    const bh = p.builderHallLevel || 1;

    const heroSpecs = window.CocBenchmarks && window.CocBenchmarks.HERO_BENCHMARKS
      ? Object.entries(window.CocBenchmarks.HERO_BENCHMARKS)
      : [
          ['Barbarian King', { village: 'home', unlockTH: 7, maxLevel: 110 }],
          ['Archer Queen', { village: 'home', unlockTH: 9, maxLevel: 110 }],
          ['Minion Prince', { village: 'home', unlockTH: 9, maxLevel: 95 }],
          ['Grand Warden', { village: 'home', unlockTH: 11, maxLevel: 85 }],
          ['Royal Champion', { village: 'home', unlockTH: 13, maxLevel: 55 }],
          ['Dragon Duke', { village: 'home', unlockTH: 15, maxLevel: 25 }],
          ['Battle Machine', { village: 'builderBase', unlockBH: 5, maxLevel: 35 }],
          ['Battle Copter', { village: 'builderBase', unlockBH: 8, maxLevel: 35 }]
        ];

    const heroes = heroSpecs.map(([name, spec]) => {
      const existing = existingHeroesMap.get(name);
      if (existing && (existing.level || 0) > 0) {
        return {
          ...existing,
          unlockTH: spec.unlockTH,
          unlockBH: spec.unlockBH,
          isUnlocked: true
        };
      }
      return {
        name,
        village: spec.village,
        level: 0,
        maxLevel: existing?.maxLevel || spec.maxLevel,
        unlockTH: spec.unlockTH,
        unlockBH: spec.unlockBH,
        equipment: existing?.equipment || [],
        isUnlocked: false
      };
    });

    (p.heroes || []).forEach(h => {
      if (!heroes.some(x => x.name === h.name)) {
        heroes.push({ ...h, isUnlocked: (h.level || 0) > 0 });
      }
    });

    const heroesCountBadge = document.getElementById('badge-heroes-count');
    if (heroesCountBadge) {
      const maxedHeroes = heroes.filter(h => h.isUnlocked && h.level >= h.maxLevel).length;
      const unlockedHeroes = heroes.filter(h => h.isUnlocked).length;
      heroesCountBadge.textContent = `${maxedHeroes} / ${heroes.length} ${window.I18n ? window.I18n.t('common.max') : 'Maxed'}`;
      heroesCountBadge.title = `${unlockedHeroes} / ${heroes.length} Unlocked`;
    }

    heroesCont.innerHTML = heroes.map(h => {
      const isMax = h.isUnlocked && h.level >= h.maxLevel;
      const isBB = h.village === 'builderBase';
      const reqLvl = isBB ? h.unlockBH : h.unlockTH;
      const curHall = isBB ? bh : th;
      const isAvailable = reqLvl && curHall >= reqLvl;
      const reqText = isAvailable
        ? (isBB ? (window.I18n ? window.I18n.t('army.available_hero_bh', { bh: reqLvl }) : `🔓 Available (Builder Hall ${reqLvl})`) : (window.I18n ? window.I18n.t('army.available_hero_th', { th: reqLvl }) : `🔓 Available (Hero Hall TH${reqLvl})`))
        : (isBB ? (window.I18n ? window.I18n.t('army.unlocks_at_bh', { bh: reqLvl }) : `🔒 Unlocks at BH ${reqLvl}`) : (window.I18n ? window.I18n.t('army.unlocks_at_th', { th: reqLvl }) : `🔒 Unlocks at TH ${reqLvl}`));

      if (!h.isUnlocked) {
        return `
          <div class="hero-card is-locked">
            <div class="hero-header-box">
              <div class="hero-avatar-box">
                <img src="${Assets.getHeroImg(h.name)}" class="hero-avatar-img" alt="${h.name}" onerror="this.src='${Assets.cocIcons.warStar}'">
              </div>
              <div class="hero-title-box">
                <div class="hero-name">${h.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${isBB ? (window.I18n ? window.I18n.t('achievements.filter_builder') : 'Builder Base') : (window.I18n ? window.I18n.t('achievements.filter_home') : 'Home Village')}</div>
                <div style="margin-top: 0.35rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <span class="unit-level-badge locked">
                    🔒 ${window.I18n ? window.I18n.t('army.locked') : 'Locked'}
                  </span>
                  <span style="font-size: 0.75rem; color: ${isAvailable ? '#60a5fa' : '#f87171'}; font-weight: 600;">
                    ${reqText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="hero-card">
          <div class="hero-header-box">
            <div class="hero-avatar-box">
              <img src="${Assets.getHeroImg(h.name)}" class="hero-avatar-img" alt="${h.name}" onerror="this.src='${Assets.cocIcons.warStar}'">
            </div>
            <div class="hero-title-box">
              <div class="hero-name">${h.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${isBB ? (window.I18n ? window.I18n.t('achievements.filter_builder') : 'Builder Base') : (window.I18n ? window.I18n.t('achievements.filter_home') : 'Home Village')}</div>
              <div style="margin-top: 0.35rem;">
                <span class="unit-level-badge ${isMax ? 'maxed' : ''}">
                  ${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} ${h.level} / ${h.maxLevel} ${isMax ? (window.I18n ? window.I18n.t('common.max_star') : '★ MAX') : ''}
                </span>
              </div>
            </div>
          </div>
          ${h.equipment && h.equipment.length > 0 ? `
            <div>
              <div style="font-family: var(--font-supercell); font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">${window.I18n ? window.I18n.t('army.equipped_abilities') : 'Equipped Abilities:'}</div>
              <div class="hero-equip-list">
                ${h.equipment.map(eq => `
                  <span class="equip-pill">
                    <img src="${Assets.getEquipmentImg(eq.name)}" class="equip-thumb-img" alt="${eq.name}" onerror="this.src='${Assets.cocIcons.equipmentEpic}'">
                    <strong>${eq.name}</strong>
                    <span class="equip-lvl">${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} ${eq.level}</span>
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Render Village Helpers and Town Hall 18 Guardians
    this.renderHelpers();
    this.renderGuardians();

    // All Equipment Grid (Calibrated with Blacksmith caps & displaying locked equipment)
    const equipSpecs = window.CocBenchmarks?.EQUIPMENT_BENCHMARKS || {};
    const playerEquipList = p.heroEquipment || [];
    const equipMap = new Map(playerEquipList.map(eq => [eq.name, eq]));

    const fullEquipment = [];
    Object.entries(equipSpecs).forEach(([name, spec]) => {
      const existing = equipMap.get(name);
      if (existing && (existing.level || 0) > 0) {
        fullEquipment.push({
          ...existing,
          hero: spec.hero,
          rarity: spec.rarity,
          source: spec.source,
          unlockTH: spec.unlockTH,
          isUnlocked: true
        });
      } else {
        const maxLevel = existing?.maxLevel || spec.maxLevel || (spec.rarity === 'epic' ? 27 : 18);
        fullEquipment.push({
          name,
          level: 0,
          maxLevel,
          hero: spec.hero,
          rarity: spec.rarity,
          source: spec.source,
          unlockTH: spec.unlockTH,
          village: 'home',
          isUnlocked: false
        });
      }
    });

    // Add any extra equipment returned by the API that was not in EQUIPMENT_BENCHMARKS
    playerEquipList.forEach(eq => {
      if (!fullEquipment.some(x => x.name === eq.name)) {
        fullEquipment.push({
          ...eq,
          hero: '',
          rarity: (eq.maxLevel && eq.maxLevel > 18) ? 'epic' : 'common',
          source: 'blacksmith',
          unlockTH: 8,
          isUnlocked: (eq.level || 0) > 0
        });
      }
    });

    const enrichedEquipment = fullEquipment.map(eq => {
      const maxForTH = window.CocBenchmarks ? window.CocBenchmarks.getEquipmentMaxForTH(eq.name, th, eq.maxLevel) : eq.maxLevel;
      const isGlobalMax = eq.isUnlocked && (eq.level >= eq.maxLevel);
      const isThMax = eq.isUnlocked && (isGlobalMax || (maxForTH > 0 && eq.level >= maxForTH));
      const diff = eq.isUnlocked ? Math.max(0, maxForTH - eq.level) : maxForTH;
      const isAvailable = eq.unlockTH ? (th >= eq.unlockTH) : true;
      let reqText = '';
      if (!eq.isUnlocked) {
        if (!isAvailable) {
          reqText = window.I18n ? window.I18n.t('army.unlocks_at_th', { th: eq.unlockTH }) : `🔒 Unlocks at TH ${eq.unlockTH}`;
        } else if (eq.source === 'event') {
          reqText = window.I18n ? window.I18n.t('army.avail_event_trader', { th: eq.unlockTH }) : `🔓 Event / Trader (TH${eq.unlockTH})`;
        } else {
          reqText = window.I18n ? window.I18n.t('army.available_blacksmith', { th: eq.unlockTH }) : `🔓 Blacksmith (TH${eq.unlockTH})`;
        }
      }

      return {
        ...eq,
        maxForTH,
        isGlobalMax,
        isThMax,
        diff,
        isAvailable,
        reqText
      };
    });

    const maxedThEquipCount = enrichedEquipment.filter(eq => eq.isThMax).length;
    const unlockedEquipCount = enrichedEquipment.filter(eq => eq.isUnlocked).length;
    const upgradeNeededEquipCount = enrichedEquipment.length - maxedThEquipCount;
    const globalMaxEquipCount = enrichedEquipment.filter(eq => eq.isGlobalMax).length;

    const equipCountBadge = document.getElementById('badge-equipment-count');
    if (equipCountBadge) {
      equipCountBadge.textContent = `${maxedThEquipCount} / ${enrichedEquipment.length} Max TH${th}`;
      equipCountBadge.title = `${unlockedEquipCount} / ${enrichedEquipment.length} Unlocked • ${globalMaxEquipCount} Global Maxed`;
    }

    const countEquipAll = document.getElementById('count-equip-filter-all');
    if (countEquipAll) countEquipAll.textContent = enrichedEquipment.length;

    const labelEquipThMax = document.getElementById('label-equip-filter-thmax');
    if (labelEquipThMax) labelEquipThMax.textContent = `Max TH${th}`;

    const countEquipThMax = document.getElementById('count-equip-filter-thmax');
    if (countEquipThMax) countEquipThMax.textContent = maxedThEquipCount;

    const countEquipUpgrade = document.getElementById('count-equip-filter-upgrade');
    if (countEquipUpgrade) countEquipUpgrade.textContent = upgradeNeededEquipCount;

    const noteEquip = document.getElementById('equip-th-benchmark-note');
    if (noteEquip) {
      noteEquip.textContent = window.I18n ? window.I18n.t('army.th_equip_benchmark_note', { th }) : `Calibrated to Town Hall ${th} Blacksmith caps`;
    }

    const currentEquipFilter = this.state.equipFilter || 'all';
    ['all', 'th_max', 'needs_upgrade'].forEach(mode => {
      const btn = document.getElementById(`filter-equip-${mode === 'th_max' ? 'thmax' : (mode === 'needs_upgrade' ? 'upgrade' : 'all')}`);
      if (btn) btn.classList.toggle('active', currentEquipFilter === mode);
    });

    let displayedEquip = enrichedEquipment;
    if (currentEquipFilter === 'th_max') {
      displayedEquip = enrichedEquipment.filter(eq => eq.isThMax);
    } else if (currentEquipFilter === 'needs_upgrade') {
      displayedEquip = enrichedEquipment.filter(eq => !eq.isThMax);
    }

    const equipCont = document.getElementById('equipment-grid-container');
    if (equipCont) {
      if (enrichedEquipment.length === 0) {
        equipCont.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('army.no_equip') : 'No equipment registered.'}</div>`;
      } else if (displayedEquip.length === 0) {
        equipCont.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('army.no_equip_filter') : 'No equipment matches this filter.'}</div>`;
      } else {
        equipCont.innerHTML = displayedEquip.map(eq => {
          const isEpic = eq.rarity === 'epic';
          const rarityBadge = isEpic ? 'Epic' : 'Common';
          const fallbackIcon = isEpic ? Assets.cocIcons.equipmentEpic : Assets.cocIcons.equipmentCommon;

          if (!eq.isUnlocked) {
            return `
              <div class="unit-card is-locked">
                <img src="${Assets.getEquipmentImg(eq.name)}" class="unit-sprite" alt="${eq.name}" onerror="this.src='${fallbackIcon}'">
                <span class="unit-level-badge locked">
                  🔒 ${window.I18n ? window.I18n.t('army.locked') : 'Locked'}
                </span>
                <div class="unit-name" title="${eq.name}">${eq.name}</div>
                ${eq.hero ? `<div class="equip-hero-name" title="${eq.hero}">${eq.hero}</div>` : ''}
                <div class="equip-rarity-row">
                  <span class="equip-tag ${isEpic ? 'is-epic' : 'is-common'}">${rarityBadge}</span>
                </div>
                <div class="unit-th-sub ${eq.isAvailable ? 'is-available' : 'is-locked'}">${eq.reqText}</div>
              </div>
            `;
          }

          const badgeClass = eq.isGlobalMax ? 'maxed global-maxed' : (eq.isThMax ? 'th-maxed' : '');
          const cardClass = eq.isGlobalMax ? 'is-maxed is-global-max' : (eq.isThMax ? 'is-maxed is-th-maxed' : '');

          let levelBadgeText = '';
          if (eq.isGlobalMax) {
            levelBadgeText = window.I18n ? window.I18n.t('common.max_star') : '★ MAX';
          } else if (eq.isThMax) {
            levelBadgeText = window.I18n ? window.I18n.t('army.max_th', { th }) : `★ MAX TH${th}`;
          } else {
            const lvlStr = window.I18n ? window.I18n.t('common.lvl') : 'Lvl.';
            levelBadgeText = `${lvlStr} ${eq.level} / ${eq.maxForTH}`;
          }

          let subText = '';
          if (eq.isGlobalMax) {
            subText = `<div class="unit-th-sub is-maxed">${window.I18n ? window.I18n.t('army.global_max') : '👑 Global MAX'}</div>`;
          } else if (eq.isThMax) {
            subText = `<div class="unit-th-sub is-maxed">${window.I18n ? window.I18n.t('army.max_for_th', { th }) : `✔ Maxed for TH${th}`}</div>`;
          } else {
            subText = `<div class="unit-th-sub needs-upgrade">${window.I18n ? window.I18n.t('army.cap_info', { max: eq.maxForTH, diff: eq.diff }) : `Cap: Lvl. ${eq.maxForTH} (${eq.diff} left)`}</div>`;
          }

          return `
            <div class="unit-card ${cardClass}">
              ${eq.isGlobalMax ? `<span class="badge-th-star global" title="Global Maximum">★ MAX</span>` : (eq.isThMax ? `<span class="badge-th-star" title="Maxed for Town Hall ${th}">★ TH${th} MAX</span>` : '')}
              <img src="${Assets.getEquipmentImg(eq.name)}" class="unit-sprite" alt="${eq.name}" onerror="this.src='${fallbackIcon}'">
              <span class="unit-level-badge ${badgeClass}">
                ${levelBadgeText}
              </span>
              <div class="unit-name" title="${eq.name}">${eq.name}</div>
              ${eq.hero ? `<div class="equip-hero-name" title="${eq.hero}">${eq.hero}</div>` : ''}
              <div class="equip-rarity-row">
                <span class="equip-tag ${isEpic ? 'is-epic' : 'is-common'}">${rarityBadge}</span>
              </div>
              ${subText}
            </div>
          `;
        }).join('');
      }
    }

    // Partition Troops, Super Troops, Pets, and Siege Machines
    const allHomeTroops = (p.troops || []).filter(t => t.village === 'home' || !t.village);

    const PET_BENCHMARKS = window.CocBenchmarks?.PET_BENCHMARKS || {
      'L.A.S.S.I': { unlockTH: 14, maxLevels: { 14: 10, 15: 15, 16: 15, 17: 15, 18: 15 } },
      'Electro Owl': { unlockTH: 14, maxLevels: { 14: 10, 15: 15, 16: 15, 17: 15, 18: 15 } },
      'Mighty Yak': { unlockTH: 14, maxLevels: { 14: 10, 15: 15, 16: 15, 17: 15, 18: 15 } },
      'Unicorn': { unlockTH: 14, maxLevels: { 14: 10, 15: 10, 16: 10, 17: 10, 18: 10 } },
      'Frosty': { unlockTH: 15, maxLevels: { 15: 10, 16: 10, 17: 10, 18: 10 } },
      'Diggy': { unlockTH: 15, maxLevels: { 15: 10, 16: 10, 17: 10, 18: 10 } },
      'Poison Lizard': { unlockTH: 15, maxLevels: { 15: 10, 16: 10, 17: 10, 18: 10 } },
      'Phoenix': { unlockTH: 15, maxLevels: { 15: 10, 16: 10, 17: 10, 18: 10 } },
      'Spirit Fox': { unlockTH: 16, maxLevels: { 16: 10, 17: 10, 18: 10 } },
      'Angry Jelly': { unlockTH: 16, maxLevels: { 16: 10, 17: 10, 18: 10 } },
      'Greedy Raven': { unlockTH: 17, maxLevels: { 17: 10, 18: 10 } }
    };

    const SIEGE_BENCHMARKS = window.CocBenchmarks?.SIEGE_BENCHMARKS || {
      'Wall Wrecker': { unlockTH: 12, maxLevels: { 12:3, 13:4, 14:4, 15:5, 16:5, 17:5, 18:5 } },
      'Battle Blimp': { unlockTH: 12, maxLevels: { 12:3, 13:4, 14:4, 15:4, 16:5, 17:5, 18:5 } },
      'Stone Slammer': { unlockTH: 12, maxLevels: { 12:3, 13:4, 14:4, 15:5, 16:5, 17:5, 18:5 } },
      'Siege Barracks': { unlockTH: 13, maxLevels: { 13:4, 14:4, 15:4, 16:5, 17:5, 18:5 } },
      'Log Launcher': { unlockTH: 13, maxLevels: { 13:4, 14:4, 15:4, 16:5, 17:5, 18:5 } },
      'Flame Flinger': { unlockTH: 14, maxLevels: { 14:4, 15:4, 16:5, 17:5, 18:5 } },
      'Battle Drill': { unlockTH: 15, maxLevels: { 15:4, 16:4, 17:5, 18:5 } }
    };

    const SUPER_TROOP_SPECS = [
      { name: 'Super Barbarian', base: 'Barbarian', minBaseLevel: 8 },
      { name: 'Super Archer', base: 'Archer', minBaseLevel: 8 },
      { name: 'Super Giant', base: 'Giant', minBaseLevel: 9 },
      { name: 'Sneaky Goblin', base: 'Goblin', minBaseLevel: 7 },
      { name: 'Super Wall Breaker', base: 'Wall Breaker', minBaseLevel: 7 },
      { name: 'Rocket Balloon', base: 'Balloon', minBaseLevel: 8 },
      { name: 'Super Wizard', base: 'Wizard', minBaseLevel: 9 },
      { name: 'Super Dragon', base: 'Dragon', minBaseLevel: 7 },
      { name: 'Inferno Dragon', base: 'Baby Dragon', minBaseLevel: 6 },
      { name: 'Super Minion', base: 'Minion', minBaseLevel: 8 },
      { name: 'Super Valkyrie', base: 'Valkyrie', minBaseLevel: 7 },
      { name: 'Super Witch', base: 'Witch', minBaseLevel: 5 },
      { name: 'Ice Hound', base: 'Lava Hound', minBaseLevel: 5 },
      { name: 'Super Bowler', base: 'Bowler', minBaseLevel: 4 },
      { name: 'Super Miner', base: 'Miner', minBaseLevel: 7 },
      { name: 'Super Hog Rider', base: 'Hog Rider', minBaseLevel: 10 },
      { name: 'Super Yeti', base: 'Yeti', minBaseLevel: 4 }
    ];

    const PET_NAMES = new Set(Object.keys(PET_BENCHMARKS));
    const SIEGE_NAMES = new Set(Object.keys(SIEGE_BENCHMARKS));
    const SUPER_NAMES = new Set(SUPER_TROOP_SPECS.map(s => s.name));

    const isSuperTroop = (t) => SUPER_NAMES.has(t.name) || t.superTroopIsActive !== undefined || (t.name && t.name.startsWith('Super '));

    const PET_TRANSLATIONS = {
      'L.A.S.S.I': 'L.A.S.S.I',
      'Mighty Yak': 'Mighty Yak',
      'Electro Owl': 'Electro Owl',
      'Unicorn': 'Unicorn',
      'Phoenix': 'Phoenix',
      'Poison Lizard': 'Poison Lizard',
      'Diggy': 'Diggy',
      'Frosty': 'Frosty',
      'Spirit Fox': 'Spirit Fox',
      'Angry Jelly': 'Angry Jelly',
      'Greedy Raven': 'Greedy Raven',
      'Sneezy': 'Sneezy'
    };

    const SIEGE_TRANSLATIONS = {
      'Wall Wrecker': 'Wall Wrecker',
      'Battle Blimp': 'Battle Blimp',
      'Stone Slammer': 'Stone Slammer',
      'Siege Barracks': 'Siege Barracks',
      'Log Launcher': 'Log Launcher',
      'Flame Flinger': 'Flame Flinger',
      'Battle Drill': 'Battle Drill',
      'Troop Launcher': 'Troop Launcher',
      'Sky Wagon': 'Sky Wagon'
    };

    const playerPets = allHomeTroops.filter(t => PET_NAMES.has(t.name));
    const playerSieges = allHomeTroops.filter(t => SIEGE_NAMES.has(t.name));
    const explicitSuperTroops = allHomeTroops.filter(t => isSuperTroop(t));
    const playerRegularTroops = allHomeTroops.filter(t => !PET_NAMES.has(t.name) && !SIEGE_NAMES.has(t.name) && !isSuperTroop(t));

    const regularMap = new Map(playerRegularTroops.map(t => [t.name, t]));
    const explicitSuperMap = new Map(explicitSuperTroops.map(t => [t.name, t]));
    const petMap = new Map(playerPets.map(t => [t.name, t]));
    const siegeMap = new Map(playerSieges.map(t => [t.name, t]));

    // Synthesize Regular Home Troops roster (including locked troops)
    const troopSpecs = window.CocBenchmarks?.TROOP_BENCHMARKS || {};
    const fullRegularTroops = [];
    Object.entries(troopSpecs).forEach(([name, spec]) => {
      const existing = regularMap.get(name);
      if (existing && (existing.level || 0) > 0) {
        fullRegularTroops.push({
          ...existing,
          unlockTH: spec.unlockTH,
          isUnlocked: true
        });
      } else {
        const maxLevel = existing?.maxLevel || (spec.maxLevels ? Math.max(...Object.values(spec.maxLevels)) : 1);
        fullRegularTroops.push({
          name,
          level: 0,
          maxLevel,
          unlockTH: spec.unlockTH,
          village: 'home',
          isUnlocked: false
        });
      }
    });
    // Add any regular troop the player owns that was not in TROOP_BENCHMARKS
    playerRegularTroops.forEach(t => {
      if (!fullRegularTroops.some(x => x.name === t.name)) {
        fullRegularTroops.push({
          ...t,
          unlockTH: 1,
          isUnlocked: (t.level || 0) > 0
        });
      }
    });

    // Synthesize Super Troops roster (all 17 displayed, locked if TH < 11 or base troop underleveled)
    const superTroops = SUPER_TROOP_SPECS.map(spec => {
      const explicit = explicitSuperMap.get(spec.name);
      const base = regularMap.get(spec.base);
      const baseLvl = base?.level || 0;
      const level = (explicit && explicit.level > 1) ? explicit.level : (base?.level || explicit?.level || spec.minBaseLevel);
      const maxLevel = base?.maxLevel || explicit?.maxLevel || spec.minBaseLevel;
      const isActive = explicit?.superTroopIsActive === true;
      const isThEligible = (p.townHallLevel || 1) >= 11;
      const isBaseEligible = baseLvl >= spec.minBaseLevel;
      const isUnlocked = isThEligible && (isBaseEligible || explicit !== undefined);

      let reqText = '';
      if (!isUnlocked) {
        if (!isThEligible) {
          reqText = window.I18n ? window.I18n.t('army.unlocks_at_th', { th: 11 }) : '🔒 Unlocks at TH 11';
        } else {
          reqText = `Req: ${spec.base} Lvl. ${spec.minBaseLevel}`;
        }
      }

      return {
        name: spec.name,
        baseName: spec.base,
        minBaseLevel: spec.minBaseLevel,
        level,
        maxLevel,
        superTroopIsActive: isActive,
        isUnlocked,
        reqText
      };
    });
    // Append any explicit super troop returned by the API that was not in the specs
    const handledSuperNames = new Set(SUPER_TROOP_SPECS.map(s => s.name));
    explicitSuperTroops.forEach(t => {
      if (!handledSuperNames.has(t.name)) {
        superTroops.push({
          name: t.name,
          baseName: t.name,
          level: t.level,
          maxLevel: t.maxLevel,
          superTroopIsActive: !!t.superTroopIsActive,
          isUnlocked: true,
          reqText: ''
        });
      }
    });

    // Synthesize Pets roster
    const fullPets = [];
    Object.entries(PET_BENCHMARKS).forEach(([name, spec]) => {
      const existing = petMap.get(name);
      if (existing && (existing.level || 0) > 0) {
        fullPets.push({
          ...existing,
          unlockTH: spec.unlockTH,
          isUnlocked: true
        });
      } else {
        const maxLevel = existing?.maxLevel || (spec.maxLevels ? Math.max(...Object.values(spec.maxLevels)) : 10);
        fullPets.push({
          name,
          level: 0,
          maxLevel,
          unlockTH: spec.unlockTH,
          village: 'home',
          isUnlocked: false
        });
      }
    });
    playerPets.forEach(t => {
      if (!fullPets.some(x => x.name === t.name)) {
        fullPets.push({
          ...t,
          unlockTH: 14,
          isUnlocked: (t.level || 0) > 0
        });
      }
    });

    // Synthesize Siege Machines roster
    const fullSieges = [];
    Object.entries(SIEGE_BENCHMARKS).forEach(([name, spec]) => {
      const existing = siegeMap.get(name);
      if (existing && (existing.level || 0) > 0) {
        fullSieges.push({
          ...existing,
          unlockTH: spec.unlockTH,
          isUnlocked: true
        });
      } else {
        const maxLevel = existing?.maxLevel || (spec.maxLevels ? Math.max(...Object.values(spec.maxLevels)) : 5);
        fullSieges.push({
          name,
          level: 0,
          maxLevel,
          unlockTH: spec.unlockTH,
          village: 'home',
          isUnlocked: false
        });
      }
    });
    playerSieges.forEach(t => {
      if (!fullSieges.some(x => x.name === t.name)) {
        fullSieges.push({
          ...t,
          unlockTH: 12,
          isUnlocked: (t.level || 0) > 0
        });
      }
    });

    // Synthesize Spells roster
    const spellSpecs = window.CocBenchmarks?.SPELL_BENCHMARKS || {};
    const playerSpells = p.spells || [];
    const spellsMap = new Map(playerSpells.map(s => [s.name, s]));
    const fullSpells = [];
    Object.entries(spellSpecs).forEach(([name, spec]) => {
      const existing = spellsMap.get(name);
      if (existing && (existing.level || 0) > 0) {
        fullSpells.push({
          ...existing,
          unlockTH: spec.unlockTH,
          isUnlocked: true
        });
      } else {
        const maxLevel = existing?.maxLevel || (spec.maxLevels ? Math.max(...Object.values(spec.maxLevels)) : 1);
        fullSpells.push({
          name,
          level: 0,
          maxLevel,
          unlockTH: spec.unlockTH,
          village: 'home',
          isUnlocked: false
        });
      }
    });
    playerSpells.forEach(s => {
      if (!fullSpells.some(x => x.name === s.name)) {
        fullSpells.push({
          ...s,
          unlockTH: 1,
          isUnlocked: (s.level || 0) > 0
        });
      }
    });

    // Synthesize Builder Base Troops roster
    const builderSpecs = window.CocBenchmarks?.BUILDER_TROOP_BENCHMARKS || {};
    const playerBuilderTroops = (p.troops || []).filter(t => t.village === 'builderBase');
    const builderMap = new Map(playerBuilderTroops.map(t => [t.name, t]));
    const fullBuilderTroops = [];
    Object.entries(builderSpecs).forEach(([name, spec]) => {
      const existing = builderMap.get(name);
      if (existing && (existing.level || 0) > 0) {
        fullBuilderTroops.push({
          ...existing,
          unlockBH: spec.unlockBH,
          isUnlocked: true
        });
      } else {
        const maxLevel = existing?.maxLevel || spec.maxLevel || 20;
        fullBuilderTroops.push({
          name,
          level: 0,
          maxLevel,
          unlockBH: spec.unlockBH,
          village: 'builderBase',
          isUnlocked: false
        });
      }
    });
    playerBuilderTroops.forEach(t => {
      if (!fullBuilderTroops.some(x => x.name === t.name)) {
        fullBuilderTroops.push({
          ...t,
          unlockBH: 1,
          isUnlocked: (t.level || 0) > 0
        });
      }
    });

    // 1. Regular Home Troops Grid with Town Hall Benchmark Calibration
    const enrichedTroops = fullRegularTroops.map(t => {
      const maxForTH = window.CocBenchmarks ? window.CocBenchmarks.getTroopMaxForTH(t.name, th, t.maxLevel) : t.maxLevel;
      const isGlobalMax = t.isUnlocked && (t.level >= t.maxLevel);
      const isThMax = t.isUnlocked && (isGlobalMax || (maxForTH > 0 && t.level >= maxForTH));
      const diff = t.isUnlocked ? Math.max(0, maxForTH - t.level) : maxForTH;
      const isAvailable = t.unlockTH ? (th >= t.unlockTH) : true;
      const reqText = isAvailable
        ? (window.I18n ? window.I18n.t('army.available_at_th', { th: t.unlockTH }) : `🔓 Barracks (TH${t.unlockTH})`)
        : (window.I18n ? window.I18n.t('army.unlocks_at_th', { th: t.unlockTH }) : `🔒 Unlocks at TH ${t.unlockTH}`);

      return {
        ...t,
        maxForTH,
        isGlobalMax,
        isThMax,
        diff,
        isAvailable,
        reqText
      };
    });

    const maxedThTroopsCount = enrichedTroops.filter(t => t.isThMax).length;
    const unlockedTroopsCount = enrichedTroops.filter(t => t.isUnlocked).length;
    const upgradeNeededTroopsCount = enrichedTroops.length - maxedThTroopsCount;
    const globalMaxTroopsCount = enrichedTroops.filter(t => t.isGlobalMax).length;

    // Badge in card header showing TH maxed count
    const troopsCountBadge = document.getElementById('badge-troops-count');
    if (troopsCountBadge) {
      troopsCountBadge.textContent = `${maxedThTroopsCount} / ${enrichedTroops.length} Max TH${th}`;
      troopsCountBadge.title = `${unlockedTroopsCount} / ${enrichedTroops.length} Unlocked • ${globalMaxTroopsCount} Global Maxed`;
    }

    // Filter toolbar counts & label
    const countTroopsAll = document.getElementById('count-troops-filter-all');
    if (countTroopsAll) countTroopsAll.textContent = enrichedTroops.length;

    const labelTroopsThMax = document.getElementById('label-troops-filter-thmax');
    if (labelTroopsThMax) labelTroopsThMax.textContent = `Max TH${th}`;

    const countTroopsThMax = document.getElementById('count-troops-filter-thmax');
    if (countTroopsThMax) countTroopsThMax.textContent = maxedThTroopsCount;

    const countTroopsUpgrade = document.getElementById('count-troops-filter-upgrade');
    if (countTroopsUpgrade) countTroopsUpgrade.textContent = upgradeNeededTroopsCount;

    const noteTroops = document.getElementById('troops-th-benchmark-note');
    if (noteTroops) {
      noteTroops.textContent = window.I18n ? window.I18n.t('army.th_benchmark_note', { th }) : `Calibrated to Town Hall ${th} Laboratory caps`;
    }

    // Active button in toolbar
    const currentTroopsFilter = this.state.troopsFilter || 'all';
    ['all', 'th_max', 'needs_upgrade'].forEach(mode => {
      const btn = document.getElementById(`filter-troops-${mode === 'th_max' ? 'thmax' : (mode === 'needs_upgrade' ? 'upgrade' : 'all')}`);
      if (btn) btn.classList.toggle('active', currentTroopsFilter === mode);
    });

    // Filter items to display
    let displayedTroops = enrichedTroops;
    if (currentTroopsFilter === 'th_max') {
      displayedTroops = enrichedTroops.filter(t => t.isThMax);
    } else if (currentTroopsFilter === 'needs_upgrade') {
      displayedTroops = enrichedTroops.filter(t => !t.isThMax);
    }

    const troopsHomeGrid = document.getElementById('troops-home-grid');
    if (troopsHomeGrid) {
      if (enrichedTroops.length === 0) {
        troopsHomeGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('army.no_troops') : 'No troops registered.'}</div>`;
      } else if (displayedTroops.length === 0) {
        troopsHomeGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('army.no_troops_filter') : 'No troops match this filter.'}</div>`;
      } else {
        troopsHomeGrid.innerHTML = displayedTroops.map(t => {
          if (!t.isUnlocked) {
            return `
              <div class="unit-card is-locked">
                <img src="${Assets.getTroopImg(t.name)}" class="unit-sprite" alt="${t.name}" onerror="this.src='${Assets.cocIcons.swords}'">
                <span class="unit-level-badge locked">
                  🔒 ${window.I18n ? window.I18n.t('army.locked') : 'Locked'}
                </span>
                <div class="unit-name" title="${t.name}">${t.name}</div>
                <div class="unit-th-sub ${t.isAvailable ? 'is-available' : 'is-locked'}">${t.reqText}</div>
              </div>
            `;
          }

          const badgeClass = t.isGlobalMax ? 'maxed global-maxed' : (t.isThMax ? 'th-maxed' : '');
          const cardClass = t.isGlobalMax ? 'is-maxed is-global-max' : (t.isThMax ? 'is-maxed is-th-maxed' : '');
          
          let levelBadgeText = '';
          if (t.isGlobalMax) {
            levelBadgeText = window.I18n ? window.I18n.t('common.max_star') : '★ MAX';
          } else if (t.isThMax) {
            levelBadgeText = window.I18n ? window.I18n.t('army.max_th', { th }) : `★ MAX TH${th}`;
          } else {
            const lvlStr = window.I18n ? window.I18n.t('common.lvl') : 'Lvl.';
            levelBadgeText = `${lvlStr} ${t.level} / ${t.maxForTH}`;
          }

          let subText = '';
          if (t.isGlobalMax) {
            subText = `<div class="unit-th-sub is-maxed">${window.I18n ? window.I18n.t('army.global_max') : '👑 Global MAX'}</div>`;
          } else if (t.isThMax) {
            subText = `<div class="unit-th-sub is-maxed">${window.I18n ? window.I18n.t('army.max_for_th', { th }) : `✔ Maxed for TH${th}`}</div>`;
          } else {
            subText = `<div class="unit-th-sub needs-upgrade">${window.I18n ? window.I18n.t('army.cap_info', { max: t.maxForTH, diff: t.diff }) : `Cap: Lvl. ${t.maxForTH} (${t.diff} left)`}</div>`;
          }

          return `
            <div class="unit-card ${cardClass}">
              ${t.isGlobalMax ? `<span class="badge-th-star global" title="Global Maximum">★ MAX</span>` : (t.isThMax ? `<span class="badge-th-star" title="Maxed for Town Hall ${th}">★ TH${th} MAX</span>` : '')}
              <img src="${Assets.getTroopImg(t.name)}" class="unit-sprite" alt="${t.name}" onerror="this.src='${Assets.cocIcons.swords}'">
              <span class="unit-level-badge ${badgeClass}">
                ${levelBadgeText}
              </span>
              <div class="unit-name" title="${t.name}">${t.name}</div>
              ${subText}
            </div>
          `;
        }).join('');
      }
    }

    // 2. Super Troops Grid (including locked super troops)
    const superCountBadge = document.getElementById('badge-super-troops-count');
    if (superCountBadge) {
      const maxedSuper = superTroops.filter(t => t.isUnlocked && t.level >= t.maxLevel).length;
      const unlockedSuper = superTroops.filter(t => t.isUnlocked).length;
      const activeSuper = superTroops.filter(t => t.superTroopIsActive).length;
      const maxText = window.I18n ? window.I18n.t('common.max') : 'Maxed';
      const activeText = window.I18n ? window.I18n.t('army.super_troop_active') : '⚡ ACTIVE';
      if (activeSuper > 0) {
        superCountBadge.textContent = `${activeSuper} ${activeText} • ${maxedSuper} / ${superTroops.length} ${maxText}`;
      } else {
        superCountBadge.textContent = `${maxedSuper} / ${superTroops.length} ${maxText}`;
      }
      superCountBadge.title = `${unlockedSuper} / ${superTroops.length} Unlocked`;
    }
    const superTroopsGrid = document.getElementById('super-troops-grid');
    if (superTroopsGrid) {
      if (superTroops.length === 0) {
        superTroopsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('army.no_super_troops') : 'No super troops unlocked.'}</div>`;
      } else {
        superTroopsGrid.innerHTML = superTroops.map(t => {
          const isMax = t.isUnlocked && t.level >= t.maxLevel;
          const isActive = !!t.superTroopIsActive;
          const superDisplayName = window.I18n ? window.I18n.getSuperTroopName(t.name) : t.name;
          const activeLabel = window.I18n ? window.I18n.t('army.super_troop_active') : '⚡ ACTIVE';

          if (!t.isUnlocked) {
            return `
              <div class="unit-card is-super is-locked">
                <img src="${Assets.getSuperTroopImg(t.name)}" class="unit-sprite" alt="${t.name}" onerror="this.src='${Assets.cocIcons.swords}'">
                <span class="unit-level-badge locked">
                  🔒 ${window.I18n ? window.I18n.t('army.locked') : 'Locked'}
                </span>
                <div class="unit-name" title="${t.name}">${superDisplayName}</div>
                <div class="unit-th-sub is-locked">${t.reqText}</div>
              </div>
            `;
          }

          return `
            <div class="unit-card is-super ${isMax ? 'is-maxed' : ''} ${isActive ? 'is-super-active' : ''}">
              ${isActive ? `<span class="badge-super-active">${activeLabel}</span>` : ''}
              <img src="${Assets.getSuperTroopImg(t.name)}" class="unit-sprite" alt="${t.name}" onerror="this.src='${Assets.cocIcons.swords}'">
              <span class="unit-level-badge ${isMax ? 'maxed' : ''}">
                ${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} ${t.level} ${isMax ? (window.I18n ? window.I18n.t('common.max_star') : '★ MAX') : `/ ${t.maxLevel}`}
              </span>
              <div class="unit-name" title="${t.name}">${superDisplayName}</div>
            </div>
          `;
        }).join('');
      }
    }

    // 3. Pets Grid with TH Pet House Calibration (including locked pets)
    const enrichedPets = fullPets.map(t => {
      const maxForTH = window.CocBenchmarks ? window.CocBenchmarks.getPetMaxForTH(t.name, th, t.maxLevel || 10) : (t.maxLevel || 10);
      const isGlobalMax = t.isUnlocked && (t.level >= t.maxLevel);
      const isThMax = t.isUnlocked && (isGlobalMax || (maxForTH > 0 && t.level >= maxForTH));
      const diff = t.isUnlocked ? Math.max(0, maxForTH - t.level) : maxForTH;
      const isAvailable = t.unlockTH ? (th >= t.unlockTH) : true;
      const reqText = isAvailable
        ? (window.I18n ? window.I18n.t('army.available_pet', { th: t.unlockTH }) : `🔓 Pet House (TH${t.unlockTH})`)
        : (window.I18n ? window.I18n.t('army.unlocks_at_th', { th: t.unlockTH }) : `🔒 Unlocks at TH ${t.unlockTH}`);

      return {
        ...t,
        maxForTH,
        isGlobalMax,
        isThMax,
        diff,
        isAvailable,
        reqText
      };
    });

    const maxedThPetsCount = enrichedPets.filter(t => t.isThMax).length;
    const unlockedPetsCount = enrichedPets.filter(t => t.isUnlocked).length;
    const upgradeNeededPetsCount = enrichedPets.length - maxedThPetsCount;
    const globalMaxPetsCount = enrichedPets.filter(t => t.isGlobalMax).length;

    const petsCountBadge = document.getElementById('badge-pets-count');
    if (petsCountBadge) {
      petsCountBadge.textContent = `${maxedThPetsCount} / ${enrichedPets.length} Max TH${th}`;
      petsCountBadge.title = `${unlockedPetsCount} / ${enrichedPets.length} Unlocked • ${globalMaxPetsCount} Global Maxed`;
    }

    const countPetsAll = document.getElementById('count-pets-filter-all');
    if (countPetsAll) countPetsAll.textContent = enrichedPets.length;

    const labelPetsThMax = document.getElementById('label-pets-filter-thmax');
    if (labelPetsThMax) labelPetsThMax.textContent = `Max TH${th}`;

    const countPetsThMax = document.getElementById('count-pets-filter-thmax');
    if (countPetsThMax) countPetsThMax.textContent = maxedThPetsCount;

    const countPetsUpgrade = document.getElementById('count-pets-filter-upgrade');
    if (countPetsUpgrade) countPetsUpgrade.textContent = upgradeNeededPetsCount;

    const notePets = document.getElementById('pets-th-benchmark-note');
    if (notePets) {
      notePets.textContent = window.I18n ? window.I18n.t('army.th_pet_benchmark_note', { th }) : `Calibrated to Town Hall ${th} Pet House caps`;
    }

    const currentPetsFilter = this.state.petsFilter || 'all';
    ['all', 'th_max', 'needs_upgrade'].forEach(mode => {
      const btn = document.getElementById(`filter-pets-${mode === 'th_max' ? 'thmax' : (mode === 'needs_upgrade' ? 'upgrade' : 'all')}`);
      if (btn) btn.classList.toggle('active', currentPetsFilter === mode);
    });

    let displayedPets = enrichedPets;
    if (currentPetsFilter === 'th_max') {
      displayedPets = enrichedPets.filter(t => t.isThMax);
    } else if (currentPetsFilter === 'needs_upgrade') {
      displayedPets = enrichedPets.filter(t => !t.isThMax);
    }

    const petsGrid = document.getElementById('pets-grid');
    if (petsGrid) {
      if (enrichedPets.length === 0) {
        petsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('army.no_pets') : 'No pets unlocked yet.'}</div>`;
      } else if (displayedPets.length === 0) {
        petsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('army.no_pets_filter') : 'No pets match this filter.'}</div>`;
      } else {
        petsGrid.innerHTML = displayedPets.map(t => {
          const petDisplayName = window.I18n ? window.I18n.getPetName(t.name) : (PET_TRANSLATIONS[t.name] || t.name);

          if (!t.isUnlocked) {
            return `
              <div class="unit-card is-locked">
                <img src="${Assets.getPetImg(t.name)}" class="unit-sprite" alt="${t.name}" onerror="this.src='${Assets.cocIcons.pet}'">
                <span class="unit-level-badge locked">
                  🔒 ${window.I18n ? window.I18n.t('army.locked') : 'Locked'}
                </span>
                <div class="unit-name" title="${t.name}">${petDisplayName}</div>
                <div class="unit-th-sub ${t.isAvailable ? 'is-available' : 'is-locked'}">${t.reqText}</div>
              </div>
            `;
          }

          const badgeClass = t.isGlobalMax ? 'maxed global-maxed' : (t.isThMax ? 'th-maxed' : '');
          const cardClass = t.isGlobalMax ? 'is-maxed is-global-max' : (t.isThMax ? 'is-maxed is-th-maxed' : '');

          let levelBadgeText = '';
          if (t.isGlobalMax) {
            levelBadgeText = window.I18n ? window.I18n.t('common.max_star') : '★ MAX';
          } else if (t.isThMax) {
            levelBadgeText = window.I18n ? window.I18n.t('army.max_th', { th }) : `★ MAX TH${th}`;
          } else {
            const lvlStr = window.I18n ? window.I18n.t('common.lvl') : 'Lvl.';
            levelBadgeText = `${lvlStr} ${t.level} / ${t.maxForTH}`;
          }

          let subText = '';
          if (t.isGlobalMax) {
            subText = `<div class="unit-th-sub is-maxed">${window.I18n ? window.I18n.t('army.global_max') : '👑 Global MAX'}</div>`;
          } else if (t.isThMax) {
            subText = `<div class="unit-th-sub is-maxed">${window.I18n ? window.I18n.t('army.max_for_th', { th }) : `✔ Maxed for TH${th}`}</div>`;
          } else {
            subText = `<div class="unit-th-sub needs-upgrade">${window.I18n ? window.I18n.t('army.cap_info', { max: t.maxForTH, diff: t.diff }) : `Cap: Lvl. ${t.maxForTH} (${t.diff} left)`}</div>`;
          }

          return `
            <div class="unit-card ${cardClass}">
              ${t.isGlobalMax ? `<span class="badge-th-star global" title="Global Maximum">★ MAX</span>` : (t.isThMax ? `<span class="badge-th-star" title="Maxed for Town Hall ${th}">★ TH${th} MAX</span>` : '')}
              <img src="${Assets.getPetImg(t.name)}" class="unit-sprite" alt="${t.name}" onerror="this.src='${Assets.cocIcons.pet}'">
              <span class="unit-level-badge ${badgeClass}">
                ${levelBadgeText}
              </span>
              <div class="unit-name" title="${t.name}">${petDisplayName}</div>
              ${subText}
            </div>
          `;
        }).join('');
      }
    }

    // 4. Siege Machines Grid with TH Calibration (including locked sieges)
    const enrichedSieges = fullSieges.map(t => {
      const maxForTH = window.CocBenchmarks ? window.CocBenchmarks.getSiegeMaxForTH(t.name, th, t.maxLevel) : t.maxLevel;
      const isGlobalMax = t.isUnlocked && (t.level >= t.maxLevel);
      const isThMax = t.isUnlocked && (isGlobalMax || (maxForTH > 0 && t.level >= maxForTH));
      const diff = t.isUnlocked ? Math.max(0, maxForTH - t.level) : maxForTH;
      const isAvailable = t.unlockTH ? (th >= t.unlockTH) : true;
      const reqText = isAvailable
        ? (window.I18n ? window.I18n.t('army.available_siege', { th: t.unlockTH }) : `🔓 Workshop (TH${t.unlockTH})`)
        : (window.I18n ? window.I18n.t('army.unlocks_at_th', { th: t.unlockTH }) : `🔒 Unlocks at TH ${t.unlockTH}`);

      return {
        ...t,
        maxForTH,
        isGlobalMax,
        isThMax,
        diff,
        isAvailable,
        reqText
      };
    });

    const maxedThSieges = enrichedSieges.filter(t => t.isThMax).length;
    const unlockedSieges = enrichedSieges.filter(t => t.isUnlocked).length;
    const siegesCountBadge = document.getElementById('badge-sieges-count');
    if (siegesCountBadge) {
      siegesCountBadge.textContent = `${maxedThSieges} / ${enrichedSieges.length} Max TH${th}`;
      siegesCountBadge.title = `${unlockedSieges} / ${enrichedSieges.length} Unlocked`;
    }
    const siegesGrid = document.getElementById('siege-machines-grid');
    if (siegesGrid) {
      if (enrichedSieges.length === 0) {
        siegesGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('army.no_sieges') : 'No siege machines registered.'}</div>`;
      } else {
        siegesGrid.innerHTML = enrichedSieges.map(t => {
          const siegeDisplayName = window.I18n ? window.I18n.getSiegeName(t.name) : (SIEGE_TRANSLATIONS[t.name] || t.name);

          if (!t.isUnlocked) {
            return `
              <div class="unit-card is-locked">
                <img src="${Assets.getSiegeImg(t.name)}" class="unit-sprite" alt="${t.name}" onerror="this.src='https://assets.clashk.ing/buildings/home-village/workshop/level_1.webp'">
                <span class="unit-level-badge locked">
                  🔒 ${window.I18n ? window.I18n.t('army.locked') : 'Locked'}
                </span>
                <div class="unit-name" title="${t.name}">${siegeDisplayName}</div>
                <div class="unit-th-sub ${t.isAvailable ? 'is-available' : 'is-locked'}">${t.reqText}</div>
              </div>
            `;
          }

          const badgeClass = t.isGlobalMax ? 'maxed global-maxed' : (t.isThMax ? 'th-maxed' : '');
          const cardClass = t.isGlobalMax ? 'is-maxed is-global-max' : (t.isThMax ? 'is-maxed is-th-maxed' : '');

          let levelBadgeText = '';
          if (t.isGlobalMax) {
            levelBadgeText = window.I18n ? window.I18n.t('common.max_star') : '★ MAX';
          } else if (t.isThMax) {
            levelBadgeText = window.I18n ? window.I18n.t('army.max_th', { th }) : `★ MAX TH${th}`;
          } else {
            const lvlStr = window.I18n ? window.I18n.t('common.lvl') : 'Lvl.';
            levelBadgeText = `${lvlStr} ${t.level} / ${t.maxForTH}`;
          }

          let subText = '';
          if (t.isGlobalMax) {
            subText = `<div class="unit-th-sub is-maxed">${window.I18n ? window.I18n.t('army.global_max') : '👑 Global MAX'}</div>`;
          } else if (t.isThMax) {
            subText = `<div class="unit-th-sub is-maxed">${window.I18n ? window.I18n.t('army.max_for_th', { th }) : `✔ Maxed for TH${th}`}</div>`;
          } else {
            subText = `<div class="unit-th-sub needs-upgrade">${window.I18n ? window.I18n.t('army.cap_info', { max: t.maxForTH, diff: t.diff }) : `Cap: Lvl. ${t.maxForTH} (${t.diff} left)`}</div>`;
          }

          return `
            <div class="unit-card ${cardClass}">
              ${t.isGlobalMax ? `<span class="badge-th-star global" title="Global Maximum">★ MAX</span>` : (t.isThMax ? `<span class="badge-th-star" title="Maxed for Town Hall ${th}">★ TH${th} MAX</span>` : '')}
              <img src="${Assets.getSiegeImg(t.name)}" class="unit-sprite" alt="${t.name}" onerror="this.src='https://assets.clashk.ing/buildings/home-village/workshop/level_1.webp'">
              <span class="unit-level-badge ${badgeClass}">
                ${levelBadgeText}
              </span>
              <div class="unit-name" title="${t.name}">${siegeDisplayName}</div>
              ${subText}
            </div>
          `;
        }).join('');
      }
    }

    // 5. Spells with Town Hall Calibration (including locked spells)
    const enrichedSpells = fullSpells.map(s => {
      const maxForTH = window.CocBenchmarks ? window.CocBenchmarks.getSpellMaxForTH(s.name, th, s.maxLevel) : s.maxLevel;
      const isGlobalMax = s.isUnlocked && (s.level >= s.maxLevel);
      const isThMax = s.isUnlocked && (isGlobalMax || (maxForTH > 0 && s.level >= maxForTH));
      const diff = s.isUnlocked ? Math.max(0, maxForTH - s.level) : maxForTH;
      const isAvailable = s.unlockTH ? (th >= s.unlockTH) : true;
      const reqText = isAvailable
        ? (window.I18n ? window.I18n.t('army.available_spell', { th: s.unlockTH }) : `🔓 Spell Factory (TH${s.unlockTH})`)
        : (window.I18n ? window.I18n.t('army.unlocks_at_th', { th: s.unlockTH }) : `🔒 Unlocks at TH ${s.unlockTH}`);

      return {
        ...s,
        maxForTH,
        isGlobalMax,
        isThMax,
        diff,
        isAvailable,
        reqText
      };
    });

    const maxedThSpellsCount = enrichedSpells.filter(s => s.isThMax).length;
    const unlockedSpellsCount = enrichedSpells.filter(s => s.isUnlocked).length;
    const upgradeNeededSpellsCount = enrichedSpells.length - maxedThSpellsCount;
    const globalMaxSpellsCount = enrichedSpells.filter(s => s.isGlobalMax).length;

    const spellsCountBadge = document.getElementById('badge-spells-count');
    if (spellsCountBadge) {
      spellsCountBadge.textContent = `${maxedThSpellsCount} / ${enrichedSpells.length} Max TH${th}`;
      spellsCountBadge.title = `${unlockedSpellsCount} / ${enrichedSpells.length} Unlocked • ${globalMaxSpellsCount} Global Maxed`;
    }

    const countSpellsAll = document.getElementById('count-spells-filter-all');
    if (countSpellsAll) countSpellsAll.textContent = enrichedSpells.length;

    const labelSpellsThMax = document.getElementById('label-spells-filter-thmax');
    if (labelSpellsThMax) labelSpellsThMax.textContent = `Max TH${th}`;

    const countSpellsThMax = document.getElementById('count-spells-filter-thmax');
    if (countSpellsThMax) countSpellsThMax.textContent = maxedThSpellsCount;

    const countSpellsUpgrade = document.getElementById('count-spells-filter-upgrade');
    if (countSpellsUpgrade) countSpellsUpgrade.textContent = upgradeNeededSpellsCount;

    const noteSpells = document.getElementById('spells-th-benchmark-note');
    if (noteSpells) {
      noteSpells.textContent = window.I18n ? window.I18n.t('army.th_benchmark_note', { th }) : `Calibrated to Town Hall ${th} Laboratory caps`;
    }

    const currentSpellsFilter = this.state.spellsFilter || 'all';
    ['all', 'th_max', 'needs_upgrade'].forEach(mode => {
      const btn = document.getElementById(`filter-spells-${mode === 'th_max' ? 'thmax' : (mode === 'needs_upgrade' ? 'upgrade' : 'all')}`);
      if (btn) btn.classList.toggle('active', currentSpellsFilter === mode);
    });

    let displayedSpells = enrichedSpells;
    if (currentSpellsFilter === 'th_max') {
      displayedSpells = enrichedSpells.filter(s => s.isThMax);
    } else if (currentSpellsFilter === 'needs_upgrade') {
      displayedSpells = enrichedSpells.filter(s => !s.isThMax);
    }

    const spellsGrid = document.getElementById('spells-grid');
    if (spellsGrid) {
      if (enrichedSpells.length === 0) {
        spellsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('army.no_spells') : 'No spells registered.'}</div>`;
      } else if (displayedSpells.length === 0) {
        spellsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('army.no_troops_filter') : 'No spells match this filter.'}</div>`;
      } else {
        spellsGrid.innerHTML = displayedSpells.map(s => {
          if (!s.isUnlocked) {
            return `
              <div class="unit-card is-locked">
                <img src="${Assets.getSpellImg(s.name)}" class="unit-sprite" alt="${s.name}" onerror="this.src='${Assets.cocIcons.elixir}'">
                <span class="unit-level-badge locked">
                  🔒 ${window.I18n ? window.I18n.t('army.locked') : 'Locked'}
                </span>
                <div class="unit-name" title="${s.name}">${s.name}</div>
                <div class="unit-th-sub ${s.isAvailable ? 'is-available' : 'is-locked'}">${s.reqText}</div>
              </div>
            `;
          }

          const badgeClass = s.isGlobalMax ? 'maxed global-maxed' : (s.isThMax ? 'th-maxed' : '');
          const cardClass = s.isGlobalMax ? 'is-maxed is-global-max' : (s.isThMax ? 'is-maxed is-th-maxed' : '');
          
          let levelBadgeText = '';
          if (s.isGlobalMax) {
            levelBadgeText = window.I18n ? window.I18n.t('common.max_star') : '★ MAX';
          } else if (s.isThMax) {
            levelBadgeText = window.I18n ? window.I18n.t('army.max_th', { th }) : `★ MAX TH${th}`;
          } else {
            const lvlStr = window.I18n ? window.I18n.t('common.lvl') : 'Lvl.';
            levelBadgeText = `${lvlStr} ${s.level} / ${s.maxForTH}`;
          }

          let subText = '';
          if (s.isGlobalMax) {
            subText = `<div class="unit-th-sub is-maxed">${window.I18n ? window.I18n.t('army.global_max') : '👑 Global MAX'}</div>`;
          } else if (s.isThMax) {
            subText = `<div class="unit-th-sub is-maxed">${window.I18n ? window.I18n.t('army.max_for_th', { th }) : `✔ Maxed for TH${th}`}</div>`;
          } else {
            subText = `<div class="unit-th-sub needs-upgrade">${window.I18n ? window.I18n.t('army.cap_info', { max: s.maxForTH, diff: s.diff }) : `Cap: Lvl. ${s.maxForTH} (${s.diff} left)`}</div>`;
          }

          return `
            <div class="unit-card ${cardClass}">
              ${s.isGlobalMax ? `<span class="badge-th-star global" title="Global Maximum">★ MAX</span>` : (s.isThMax ? `<span class="badge-th-star" title="Maxed for Town Hall ${th}">★ TH${th} MAX</span>` : '')}
              <img src="${Assets.getSpellImg(s.name)}" class="unit-sprite" alt="${s.name}" onerror="this.src='${Assets.cocIcons.elixir}'">
              <span class="unit-level-badge ${badgeClass}">
                ${levelBadgeText}
              </span>
              <div class="unit-name" title="${s.name}">${s.name}</div>
              ${subText}
            </div>
          `;
        }).join('');
      }
    }

    // 6. Troops Builder Base (including locked troops)
    const troopsBuilderCountBadge = document.getElementById('badge-troops-builder-count');
    if (troopsBuilderCountBadge) {
      const maxedBuilder = fullBuilderTroops.filter(t => t.isUnlocked && t.level >= t.maxLevel).length;
      const unlockedBuilder = fullBuilderTroops.filter(t => t.isUnlocked).length;
      troopsBuilderCountBadge.textContent = `${maxedBuilder} / ${fullBuilderTroops.length} ${window.I18n ? window.I18n.t('common.max') : 'Maxed'}`;
      troopsBuilderCountBadge.title = `${unlockedBuilder} / ${fullBuilderTroops.length} Unlocked`;
    }
    const troopsBuilderGrid = document.getElementById('troops-builder-grid');
    if (troopsBuilderGrid) {
      if (fullBuilderTroops.length === 0) {
        troopsBuilderGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('army.no_troops') : 'No troops registered.'}</div>`;
      } else {
        troopsBuilderGrid.innerHTML = fullBuilderTroops.map(t => {
          const isMax = t.isUnlocked && t.level >= t.maxLevel;
          const isAvailable = t.unlockBH ? (bh >= t.unlockBH) : true;
          const reqText = isAvailable
            ? (window.I18n ? window.I18n.t('army.available_at_bh', { bh: t.unlockBH }) : `🔓 Available (Builder Barracks BH${t.unlockBH})`)
            : (window.I18n ? window.I18n.t('army.unlocks_at_bh', { bh: t.unlockBH }) : `🔒 Unlocks at BH ${t.unlockBH}`);

          if (!t.isUnlocked) {
            return `
              <div class="unit-card is-locked">
                <img src="${Assets.getTroopImg(t.name)}" class="unit-sprite" alt="${t.name}" onerror="this.src='${Assets.cocIcons.swords}'">
                <span class="unit-level-badge locked">
                  🔒 ${window.I18n ? window.I18n.t('army.locked') : 'Locked'}
                </span>
                <div class="unit-name" title="${t.name}">${t.name}</div>
                <div class="unit-th-sub ${isAvailable ? 'is-available' : 'is-locked'}">${reqText}</div>
              </div>
            `;
          }

          return `
            <div class="unit-card ${isMax ? 'is-maxed' : ''}">
              <img src="${Assets.getTroopImg(t.name)}" class="unit-sprite" alt="${t.name}" onerror="this.src='${Assets.cocIcons.swords}'">
              <span class="unit-level-badge ${isMax ? 'maxed' : ''}">
                ${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} ${t.level} ${isMax ? (window.I18n ? window.I18n.t('common.max_star') : '★ MAX') : `/ ${t.maxLevel}`}
              </span>
              <div class="unit-name" title="${t.name}">${t.name}</div>
            </div>
          `;
        }).join('');
      }
    }
  },

  // RENDER: VILLAGE HELPERS
  renderHelpers() {
    const p = this.state.profileData;
    const m = this.state.metrics;
    if (!p) return;

    const th = p.townHallLevel || 1;
    const helpersList = m?.helpers?.list || (window.CocBenchmarks?.HELPER_BENCHMARKS ? Object.values(window.CocBenchmarks.HELPER_BENCHMARKS) : []);
    const savedHelpers = p.helpers || {};

    const enrichedHelpers = helpersList.map(spec => {
      const maxForTH = window.CocBenchmarks?.getHelperMaxForTH
        ? window.CocBenchmarks.getHelperMaxForTH(spec.id, th, spec.maxLevel)
        : (spec.caps?.[th] || spec.maxLevels?.[th] || (th >= spec.unlockTH ? spec.maxLevel : 0));
      const isUnlocked = th >= spec.unlockTH;
      let level = 0;
      if (savedHelpers[spec.id] !== undefined) {
        const minLvl = isUnlocked ? 1 : 0;
        level = Math.min(spec.maxLevel, Math.max(minLvl, parseInt(savedHelpers[spec.id], 10) || minLvl));
      } else if (isUnlocked) {
        level = maxForTH;
      }
      const isThMax = isUnlocked && level >= maxForTH && maxForTH > 0;
      const isGlobalMax = isUnlocked && level >= spec.maxLevel;
      const diff = Math.max(0, maxForTH - level);

      return {
        ...spec,
        level,
        maxForTH,
        isUnlocked,
        isThMax,
        isGlobalMax,
        diff,
        reqText: isUnlocked ? `Unlocked (TH${spec.unlockTH})` : `Unlocks at TH ${spec.unlockTH}`
      };
    });

    const maxedThCount = enrichedHelpers.filter(h => h.isUnlocked && h.isThMax).length;
    const unlockedCount = enrichedHelpers.filter(h => h.isUnlocked).length;
    const needsUpgradeCount = enrichedHelpers.filter(h => h.isUnlocked && !h.isThMax).length;

    const badgeEl = document.getElementById('badge-helpers-count');
    if (badgeEl) {
      badgeEl.textContent = `${maxedThCount} / ${enrichedHelpers.length} Max TH${th}`;
      badgeEl.title = `${unlockedCount} / ${enrichedHelpers.length} Unlocked`;
    }

    const countAll = document.getElementById('count-helpers-filter-all');
    if (countAll) countAll.textContent = enrichedHelpers.length;
    const countThMax = document.getElementById('count-helpers-filter-thmax');
    if (countThMax) countThMax.textContent = maxedThCount;
    const labelThMax = document.getElementById('label-helpers-filter-thmax');
    if (labelThMax) labelThMax.textContent = `Max TH${th}`;
    const countUpgrade = document.getElementById('count-helpers-filter-upgrade');
    if (countUpgrade) countUpgrade.textContent = needsUpgradeCount;

    const noteEl = document.getElementById('helpers-th-benchmark-note');
    if (noteEl) noteEl.textContent = `Calibrated to Town Hall ${th} Helper Hut caps`;

    const filter = this.state.helpersFilter || 'all';
    ['all', 'thmax', 'upgrade'].forEach(mode => {
      const btn = document.getElementById(`filter-helpers-${mode}`);
      if (!btn) return;
      const match = (mode === 'all' && filter === 'all') ||
                    (mode === 'thmax' && filter === 'th_max') ||
                    (mode === 'upgrade' && filter === 'needs_upgrade');
      btn.classList.toggle('active', match);
    });

    const displayed = enrichedHelpers.filter(h => {
      if (filter === 'th_max') return h.isUnlocked && h.isThMax;
      if (filter === 'needs_upgrade') return h.isUnlocked && !h.isThMax;
      return true;
    });

    const container = document.getElementById('helpers-grid-container');
    if (!container) return;

    if (displayed.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">No helpers match this filter.</div>`;
      return;
    }

    container.innerHTML = displayed.map(h => {
      if (!h.isUnlocked) {
        return `
          <div class="unit-card is-locked" id="helper-card-${h.id}">
            <img src="${h.image}" class="unit-sprite" style="max-height: 80px; object-fit: contain;" alt="${h.name}">
            <span class="unit-level-badge locked">🔒 Locked</span>
            <div class="unit-name">${h.name}</div>
            <div class="unit-th-sub is-locked">${h.reqText}</div>
          </div>
        `;
      }

      const badgeClass = h.isGlobalMax ? 'maxed global-maxed' : (h.isThMax ? 'th-maxed' : '');
      const cardClass = h.isGlobalMax ? 'is-maxed is-global-max' : (h.isThMax ? 'is-maxed is-th-maxed' : '');
      const badgeText = h.isGlobalMax ? '★ MAX' : (h.isThMax ? `★ MAX TH${th}` : `Lvl. ${h.level} / ${h.maxForTH}`);
      const subText = h.isGlobalMax
        ? `<div class="unit-th-sub is-maxed">👑 Global MAX</div>`
        : (h.isThMax
          ? `<div class="unit-th-sub is-maxed">✔ Maxed for TH${th}</div>`
          : `<div class="unit-th-sub needs-upgrade">Cap: Lvl. ${h.maxForTH} (${h.diff} left)</div>`);

      return `
        <div class="unit-card ${cardClass}" id="helper-card-${h.id}">
          ${h.isGlobalMax ? `<span class="badge-th-star global" title="Global Maximum">★ MAX</span>` : (h.isThMax ? `<span class="badge-th-star" title="Maxed for Town Hall ${th}">★ TH${th} MAX</span>` : '')}
          <img src="${h.image}" class="unit-sprite" style="max-height: 80px; object-fit: contain;" alt="${h.name}">
          <span class="unit-level-badge ${badgeClass}" id="helper-badge-${h.id}">
            ${badgeText}
          </span>
          <div class="unit-name" title="${h.name}">${h.name}</div>
          ${subText}
          <div class="bld-stepper-row" style="margin-top: 0.45rem; display: flex; gap: 0.35rem; justify-content: center;">
            <button class="bld-mini-btn" id="helper-minus-${h.id}" onclick="App.changeHelperLevel('${h.id}', ${h.level - 1})" ${h.level <= 1 ? 'disabled' : ''} title="Decrease Level">-</button>
            <button class="bld-mini-btn" id="helper-plus-${h.id}" onclick="App.changeHelperLevel('${h.id}', ${h.level + 1})" ${h.level >= h.maxForTH ? 'disabled' : ''} title="Increase Level">+</button>
          </div>
        </div>
      `;
    }).join('');
  },

  // RENDER: TOWN HALL 18 GUARDIANS
  renderGuardians() {
    const p = this.state.profileData;
    const m = this.state.metrics;
    if (!p) return;

    const th = p.townHallLevel || 1;
    const guardiansList = m?.guardians?.list || (window.CocBenchmarks?.GUARDIAN_BENCHMARKS ? Object.values(window.CocBenchmarks.GUARDIAN_BENCHMARKS) : []);
    const savedGuardians = p.guardians || {};

    const enrichedGuardians = guardiansList.map(spec => {
      const maxForTH = th >= spec.unlockTH ? spec.maxLevel : 0;
      const isUnlocked = th >= spec.unlockTH;
      let level = 0;
      if (savedGuardians[spec.id] !== undefined) {
        const minLvl = isUnlocked ? 1 : 0;
        level = Math.min(spec.maxLevel, Math.max(minLvl, parseInt(savedGuardians[spec.id], 10) || minLvl));
      } else if (isUnlocked) {
        level = maxForTH;
      }
      const isThMax = isUnlocked && level >= maxForTH && maxForTH > 0;
      const isGlobalMax = isUnlocked && level >= spec.maxLevel;
      const diff = Math.max(0, maxForTH - level);

      return {
        ...spec,
        level,
        maxForTH,
        isUnlocked,
        isThMax,
        isGlobalMax,
        diff,
        reqText: isUnlocked ? `Unlocked (TH${spec.unlockTH})` : `Unlocks at TH ${spec.unlockTH}`
      };
    });

    const maxedThCount = enrichedGuardians.filter(g => g.isUnlocked && g.isThMax).length;
    const unlockedCount = enrichedGuardians.filter(g => g.isUnlocked).length;
    const needsUpgradeCount = enrichedGuardians.filter(g => g.isUnlocked && !g.isThMax).length;

    const badgeEl = document.getElementById('badge-guardians-count');
    if (badgeEl) {
      badgeEl.textContent = th >= 18 ? `${maxedThCount} / ${enrichedGuardians.length} Max TH18` : `🔒 Unlocks at TH18`;
      badgeEl.title = `${unlockedCount} / ${enrichedGuardians.length} Unlocked`;
    }

    const countAll = document.getElementById('count-guardians-filter-all');
    if (countAll) countAll.textContent = enrichedGuardians.length;
    const countThMax = document.getElementById('count-guardians-filter-thmax');
    if (countThMax) countThMax.textContent = maxedThCount;
    const labelThMax = document.getElementById('label-guardians-filter-thmax');
    if (labelThMax) labelThMax.textContent = `Max TH18`;
    const countUpgrade = document.getElementById('count-guardians-filter-upgrade');
    if (countUpgrade) countUpgrade.textContent = needsUpgradeCount;

    const noteEl = document.getElementById('guardians-th-benchmark-note');
    if (noteEl) noteEl.textContent = th >= 18 ? `Town Hall 18 active core defensive guardians` : `Defensive guardians unlock at Town Hall 18`;

    const filter = this.state.guardiansFilter || 'all';
    ['all', 'thmax', 'upgrade'].forEach(mode => {
      const btn = document.getElementById(`filter-guardians-${mode}`);
      if (!btn) return;
      const match = (mode === 'all' && filter === 'all') ||
                    (mode === 'thmax' && filter === 'th_max') ||
                    (mode === 'upgrade' && filter === 'needs_upgrade');
      btn.classList.toggle('active', match);
    });

    const displayed = enrichedGuardians.filter(g => {
      if (filter === 'th_max') return g.isUnlocked && g.isThMax;
      if (filter === 'needs_upgrade') return g.isUnlocked && !g.isThMax;
      return true;
    });

    const container = document.getElementById('guardians-grid-container');
    if (!container) return;

    if (displayed.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-muted);">No guardians match this filter.</div>`;
      return;
    }

    container.innerHTML = displayed.map(g => {
      if (!g.isUnlocked) {
        return `
          <div class="unit-card is-locked" id="guardian-card-${g.id}">
            <img src="${g.image}" class="unit-sprite" style="max-height: 80px; object-fit: contain;" alt="${g.name}">
            <span class="unit-level-badge locked">🔒 Locked</span>
            <div class="unit-name">${g.name}</div>
            <div class="unit-th-sub is-locked">${g.reqText}</div>
          </div>
        `;
      }

      const badgeClass = g.isGlobalMax ? 'maxed global-maxed' : (g.isThMax ? 'th-maxed' : '');
      const cardClass = g.isGlobalMax ? 'is-maxed is-global-max' : (g.isThMax ? 'is-maxed is-th-maxed' : '');
      const badgeText = g.isGlobalMax ? '★ MAX' : (g.isThMax ? `★ MAX TH${th}` : `Lvl. ${g.level} / ${g.maxForTH}`);
      const subText = g.isGlobalMax
        ? `<div class="unit-th-sub is-maxed">👑 Global MAX</div>`
        : (g.isThMax
          ? `<div class="unit-th-sub is-maxed">✔ Maxed for TH${th}</div>`
          : `<div class="unit-th-sub needs-upgrade">Cap: Lvl. ${g.maxForTH} (${g.diff} left)</div>`);

      return `
        <div class="unit-card ${cardClass}" id="guardian-card-${g.id}">
          ${g.isGlobalMax ? `<span class="badge-th-star global" title="Global Maximum">★ MAX</span>` : (g.isThMax ? `<span class="badge-th-star" title="Maxed for Town Hall ${th}">★ TH${th} MAX</span>` : '')}
          <img src="${g.image}" class="unit-sprite" style="max-height: 80px; object-fit: contain;" alt="${g.name}">
          <span class="unit-level-badge ${badgeClass}" id="guardian-badge-${g.id}">
            ${badgeText}
          </span>
          <div class="unit-name" title="${g.name}">${g.name}</div>
          ${subText}
          <div class="bld-stepper-row" style="margin-top: 0.45rem; display: flex; gap: 0.35rem; justify-content: center;">
            <button class="bld-mini-btn" id="guardian-minus-${g.id}" onclick="App.changeGuardianLevel('${g.id}', ${g.level - 1})" ${g.level <= 1 ? 'disabled' : ''} title="Decrease Level">-</button>
            <button class="bld-mini-btn" id="guardian-plus-${g.id}" onclick="App.changeGuardianLevel('${g.id}', ${g.level + 1})" ${g.level >= g.maxForTH ? 'disabled' : ''} title="Increase Level">+</button>
          </div>
        </div>
      `;
    }).join('');
  },

  async changeHelperLevel(helperId, newLevel) {
    if (!this.state.currentTag || !this.state.profileData) return;
    const safeLevel = Math.max(1, parseInt(newLevel, 10) || 1);
    if (!this.state.profileData.helpers) this.state.profileData.helpers = {};
    this.state.profileData.helpers[helperId] = safeLevel;
    if (this.state.metrics && this.state.metrics.helpers && this.state.metrics.helpers.list) {
      const item = this.state.metrics.helpers.list.find(h => h.id === helperId);
      if (item) item.level = safeLevel;
    }
    this.renderHelpers();

    try {
      await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/helpers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helperId, level: safeLevel })
      });
    } catch (err) {
      console.warn('Error saving helper level:', err);
    }
  },

  async setAllHelpersToThMax() {
    if (!this.state.currentTag || !this.state.profileData) return;
    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/helpers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'max_th' })
      });
      const data = await res.json();
      if (data.success && data.helpers) {
        this.state.profileData.helpers = data.helpers;
        this.showToast(window.I18n ? window.I18n.t('toasts.helpers_maxed') : 'All helpers set to Town Hall max!', 'success');
        await this.loadProfileDetail(this.state.currentTag, false);
      }
    } catch (err) {
      this.showToast('Error setting helpers to max: ' + err.message, 'error');
    }
  },

  async changeGuardianLevel(guardianId, newLevel) {
    if (!this.state.currentTag || !this.state.profileData) return;
    const safeLevel = Math.max(1, parseInt(newLevel, 10) || 1);
    if (!this.state.profileData.guardians) this.state.profileData.guardians = {};
    this.state.profileData.guardians[guardianId] = safeLevel;
    if (this.state.metrics && this.state.metrics.guardians && this.state.metrics.guardians.list) {
      const item = this.state.metrics.guardians.list.find(g => g.id === guardianId);
      if (item) item.level = safeLevel;
    }
    this.renderGuardians();

    try {
      await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/guardians`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardianId, level: safeLevel })
      });
    } catch (err) {
      console.warn('Error saving guardian level:', err);
    }
  },

  async setAllGuardiansToThMax() {
    if (!this.state.currentTag || !this.state.profileData) return;
    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/guardians`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'max_th' })
      });
      const data = await res.json();
      if (data.success && data.guardians) {
        this.state.profileData.guardians = data.guardians;
        this.showToast(window.I18n ? window.I18n.t('toasts.guardians_maxed') : 'All guardians set to Town Hall max!', 'success');
        await this.loadProfileDetail(this.state.currentTag, false);
      }
    } catch (err) {
      this.showToast('Error setting guardians to max: ' + err.message, 'error');
    }
  },

  // RENDER: ACHIEVEMENTS
  renderAchievements() {
    const p = this.state.profileData;
    const m = this.state.metrics;
    if (!p || !m) return;

    const fullList = m.achievements.list || [];

    // Helper to test if achievement belongs to Clan Capital
    const isClanCapitalAch = (a) => a.village === 'clanCapital' || (a.info && /capital/i.test(a.info)) || (a.name && /capital/i.test(a.name));
    const isBuilderAch = (a) => a.village === 'builderBase' && !isClanCapitalAch(a);
    const isHomeAch = (a) => (a.village === 'home' || !a.village) && !isClanCapitalAch(a);

    // Update counts on subtab buttons
    const countAll = fullList.length;
    const countHome = fullList.filter(isHomeAch).length;
    const countBuilder = fullList.filter(isBuilderAch).length;
    const countCapital = fullList.filter(isClanCapitalAch).length;

    const elCountAll = document.getElementById('ach-count-tab-all');
    if (elCountAll) elCountAll.textContent = countAll;
    const elCountHome = document.getElementById('ach-count-tab-home');
    if (elCountHome) elCountHome.textContent = countHome;
    const elCountBuilder = document.getElementById('ach-count-tab-builder');
    if (elCountBuilder) elCountBuilder.textContent = countBuilder;
    const elCountCapital = document.getElementById('ach-count-tab-capital');
    if (elCountCapital) elCountCapital.textContent = countCapital;

    // Subtab highlight
    const curVillage = this.state.achievementsVillage || 'all';
    const subtabs = [
      { id: 'subtab-ach-all', v: 'all' },
      { id: 'subtab-ach-home', v: 'home' },
      { id: 'subtab-ach-builder', v: 'builderBase' },
      { id: 'subtab-ach-capital', v: 'clanCapital' }
    ];
    subtabs.forEach(item => {
      const btn = document.getElementById(item.id);
      if (btn) btn.classList.toggle('active', curVillage === item.v);
    });

    // Filter by Village Subtab
    let list = fullList;
    if (curVillage === 'home') {
      list = list.filter(isHomeAch);
    } else if (curVillage === 'builderBase') {
      list = list.filter(isBuilderAch);
    } else if (curVillage === 'clanCapital') {
      list = list.filter(isClanCapitalAch);
    }

    // Filter by status (in_progress, completed, all)
    const curFilter = this.state.achievementsFilter || 'all';
    if (curFilter === 'in_progress') {
      list = list.filter(a => !a.isCompleted);
    } else if (curFilter === 'completed') {
      list = list.filter(a => a.isCompleted);
    } else if (curFilter === 'home') {
      list = list.filter(isHomeAch);
    } else if (curFilter === 'builderBase') {
      list = list.filter(isBuilderAch);
    } else if (curFilter === 'clanCapital') {
      list = list.filter(isClanCapitalAch);
    }

    // Search filter
    if (this.state.achievementsSearch) {
      list = list.filter(a => a.name.toLowerCase().includes(this.state.achievementsSearch) || (a.info && a.info.toLowerCase().includes(this.state.achievementsSearch)));
    }

    const tabAchCount = document.getElementById('tab-ach-count');
    if (tabAchCount) tabAchCount.textContent = m.achievements.totalCount;

    const achSummaryStars = document.getElementById('ach-summary-stars');
    if (achSummaryStars) {
      if (curVillage === 'all') {
        achSummaryStars.textContent = `${m.achievements.totalStars} / ${m.achievements.maxStars}`;
      } else {
        const villageList = fullList.filter(curVillage === 'clanCapital' ? isClanCapitalAch : (curVillage === 'builderBase' ? isBuilderAch : isHomeAch));
        const vStars = villageList.reduce((acc, cur) => acc + (cur.stars || 0), 0);
        const vMax = villageList.length * 3;
        achSummaryStars.textContent = `${vStars} / ${vMax}`;
      }
    }

    const container = document.getElementById('achievements-list-container');
    if (list.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('achievements.no_achievements') : 'No achievements found matching current filters.'}</div>`;
      return;
    }

    container.innerHTML = list.map(a => {
      const isCap = isClanCapitalAch(a);
      const isBB = isBuilderAch(a);
      const villageType = isCap ? 'capital' : (isBB ? 'builder' : 'home');
      const villageLabel = isCap
        ? (window.I18n ? window.I18n.t('achievements.village_capital') : 'Clan Capital')
        : (isBB ? (window.I18n ? window.I18n.t('achievements.village_builder') : 'Builder Base') : (window.I18n ? window.I18n.t('achievements.village_home') : 'Home Village'));

      const starIcons = Array.from({ length: 3 }).map((_, idx) => {
        const isFilled = idx < (a.stars || 0);
        return `<img src="${Assets.cocIcons.warStar}" class="coc-star-img ${isFilled ? '' : 'empty'}" alt="Star">`;
      }).join('');

      return `
        <div class="achievement-item">
          <div class="achievement-stars">${starIcons}</div>
          <div class="achievement-info">
            <div class="achievement-name">
              ${a.name}
              <span class="ach-village-pill pill-${villageType}">${villageLabel}</span>
            </div>
            <div class="achievement-desc">${a.info || ''}</div>
            <div class="progress-bar-bg" style="height: 8px;">
              <div class="progress-bar-fill fill-gold" style="width: ${a.percent}%"></div>
            </div>
          </div>
          <div class="achievement-progress-box">
            <div class="achievement-fraction">${Assets.formatCompactNumber(a.value || 0)} / ${Assets.formatCompactNumber(a.target || 0)}</div>
            <div style="font-family: var(--font-supercell); font-size: 0.85rem; color: ${a.isCompleted ? 'var(--gem-green)' : 'var(--gold)'};">
              ${a.isCompleted ? (window.I18n ? window.I18n.t('achievements.completed_tag') : 'COMPLETED') : `${a.percent}%`}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // RENDER: BUILDINGS & DEFENSES TRACKER
  renderBuildings() {
    const m = this.state.metrics;
    const p = this.state.profileData;
    if (!m || !p) return;

    const isBuilder = (this.state.buildingsVillage === 'builderBase');
    const bldData = isBuilder ? m.builderBuildings : m.buildings;
    if (!bldData || !bldData.list) return;

    const container = document.getElementById('buildings-grid-container');
    if (!container) return;

    const filter = this.state.buildingsFilter || 'all';
    const query = this.state.buildingsSearch || '';
    const th = p.townHallLevel || 1;
    const bh = p.builderHallLevel || 1;
    const lvlNum = isBuilder ? bh : th;

    // Sub-tab buttons update
    const subHome = document.getElementById('subtab-village-home');
    if (subHome) subHome.classList.toggle('active', !isBuilder);
    const subBuilder = document.getElementById('subtab-village-builder');
    if (subBuilder) subBuilder.classList.toggle('active', isBuilder);
    const thNum = document.getElementById('bld-th-num');
    if (thNum) thNum.textContent = th;
    const bhNum = document.getElementById('bld-bh-num');
    if (bhNum) bhNum.textContent = bh;

    // Headers & button text update
    const titleEl = document.getElementById('bld-header-title');
    if (titleEl) {
      titleEl.textContent = window.I18n ? (isBuilder ? window.I18n.t('buildings.bh_header_title') : window.I18n.t('buildings.header_title')) : (isBuilder ? 'Builder Base Buildings, Defenses & Resources' : 'Buildings, Defenses & Resources Level Tracking');
    }
    const descEl = document.getElementById('bld-header-desc');
    if (descEl) {
      descEl.innerHTML = window.I18n ? (isBuilder ? window.I18n.t('buildings.desc_bh_html') : window.I18n.t('buildings.desc_html')) : '';
    }
    const btnMaxAll = document.getElementById('btn-max-all-th');
    if (btnMaxAll) {
      btnMaxAll.textContent = window.I18n ? (isBuilder ? window.I18n.t('buildings.max_all_bh', { bh }) : window.I18n.t('buildings.max_all_th', { th })) : (isBuilder ? `⚡ Max to Current BH${bh}` : `⚡ Max to Current TH${th}`);
      btnMaxAll.title = window.I18n ? (isBuilder ? window.I18n.t('buildings.max_at_current_bh_title') : window.I18n.t('buildings.max_at_current_th_title')) : '';
    }
    const iconEl = document.getElementById('bld-header-icon');
    if (iconEl) {
      iconEl.src = isBuilder ? 'https://assets.clashk.ing/bot/icons/wrench.png' : 'https://assets.clashk.ing/bot/icons/clan_castle.png';
    }

    // Filter list: only unlocked buildings for current Hall
    const allList = bldData.list;
    const countAll = allList.length;
    const countDef = allList.filter(b => b.category === 'defense').length;
    const countTrap = allList.filter(b => b.category === 'trap').length;
    const countArmy = allList.filter(b => b.category === 'army').length;
    const countRes = allList.filter(b => b.category === 'resource').length;

    const elAll = document.getElementById('bld-count-all');
    if (elAll) elAll.textContent = countAll;
    const elDef = document.getElementById('bld-count-defense');
    if (elDef) elDef.textContent = countDef;
    const elTrap = document.getElementById('bld-count-trap');
    if (elTrap) elTrap.textContent = countTrap;
    const elArmy = document.getElementById('bld-count-army');
    if (elArmy) elArmy.textContent = countArmy;
    const elRes = document.getElementById('bld-count-resource');
    if (elRes) elRes.textContent = countRes;

    const filtered = allList.filter(b => {
      if (filter !== 'all' && b.category !== filter) return false;
      const bName = (window.I18n && window.I18n.getBuildingName(b.id)) || b.name || '';
      if (query && !bName.toLowerCase().includes(query) && !b.id.toLowerCase().includes(query)) return false;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
          ${window.I18n ? (isBuilder ? window.I18n.t('buildings.no_buildings_match_bh', { bh }) : window.I18n.t('buildings.no_buildings_match', { th })) : 'No buildings unlocked or matching filters.'}
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(b => {
      const maxLvl = b.maxLevelForTH || b.maxLevel || 1;
      const totalQty = b.quantity || 1;
      const curCount = b.count !== undefined ? b.count : totalQty;
      const isMax = b.level >= maxLvl && curCount >= totalQty;

      const bName = (window.I18n && window.I18n.getBuildingName(b.id)) || b.name;
      const catLabel = b.category === 'defense'
        ? (window.I18n ? window.I18n.t('buildings.filter_defense') : 'Defenses')
        : (b.category === 'trap'
            ? (window.I18n ? window.I18n.t('buildings.filter_trap') : 'Traps')
            : (b.category === 'army'
                ? (window.I18n ? window.I18n.t('buildings.filter_army') : 'Army')
                : (window.I18n ? window.I18n.t('buildings.filter_resource') : 'Resources')));
      const catClass = `cat-${b.category}`;

      const villageFolder = isBuilder ? 'builder-base' : 'home-village';
      const assetType = b.category === 'trap' ? 'traps' : 'buildings';
      const imgUrl = `https://assets.clashk.ing/${assetType}/${villageFolder}/${b.slug}/level_${b.level}.webp`;
      const fallbackUrl = `https://assets.clashk.ing/${assetType}/${villageFolder}/${b.slug}/level_1.webp`;

      return `
        <div class="building-card ${isMax ? 'is-maxed' : ''}" id="bld-card-${b.id}">
          <span class="bld-category-badge ${catClass}">${catLabel}</span>
          <span class="bld-quantity-pill" title="${totalQty}x ${isBuilder ? `BH${bh}` : `TH${th}`}">${totalQty}x</span>

          <div class="bld-sprite-wrap">
            <img src="${imgUrl}" 
                 alt="${bName}" 
                 class="bld-sprite" 
                 id="bld-img-${b.id}"
                 onerror="if (this.src !== '${fallbackUrl}') { this.src='${fallbackUrl}'; } else { this.onerror=null; this.src='https://assets.clashk.ing/bot/icons/clan_castle.png'; }" />
          </div>
          <div class="bld-name" title="${bName}">${bName}</div>
          <div class="bld-level-row">
            <span>${window.I18n ? (isBuilder ? window.I18n.t('buildings.progress_bh', { bh }) : window.I18n.t('buildings.progress_th', { th })) : (isBuilder ? `BH${bh} Progress` : `TH${th} Progress`)}</span>
            <span class="bld-level-badge ${isMax ? 'maxed' : ''}" id="bld-badge-${b.id}">
              ${isMax ? (window.I18n ? (isBuilder ? window.I18n.t('buildings.max_bh', { bh }) : window.I18n.t('buildings.max_th', { th })) : `★ MAX ${isBuilder ? 'BH' + bh : 'TH' + th}`) : `${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} ${b.level} / ${maxLvl}`}
            </span>
          </div>
          <div class="bld-progress-bar">
            <div class="bld-progress-fill" id="bld-bar-${b.id}" style="width: ${b.percent}%;"></div>
          </div>

          <!-- Quantity of buildings at this level -->
          ${totalQty > 1 ? `
            <div class="bld-qty-box">
              <div class="bld-qty-header">
                <span>${window.I18n ? window.I18n.t('buildings.bld_at_lvl', { lvl: `<strong>${b.level}</strong>` }) : `Buildings at Lvl. <strong>${b.level}</strong>:`}</span>
                <span class="bld-qty-text" id="bld-qty-text-${b.id}"><strong>${curCount}</strong> / ${totalQty}</span>
              </div>
              <div class="bld-qty-stepper">
                <button class="bld-qty-btn" id="bld-qty-minus-${b.id}" onclick="App.changeBuildingCount('${b.id}', ${curCount - 1})" ${curCount <= 0 ? 'disabled' : ''}>-</button>
                <div class="bld-qty-bar-wrap">
                  <div class="bld-qty-bar-fill" id="bld-qty-bar-${b.id}" style="width: ${Math.round((curCount / totalQty) * 100)}%;"></div>
                </div>
                <button class="bld-qty-btn" id="bld-qty-plus-${b.id}" onclick="App.changeBuildingCount('${b.id}', ${curCount + 1})" ${curCount >= totalQty ? 'disabled' : ''}>+</button>
              </div>
              <div class="bld-qty-sub ${curCount >= totalQty ? 'maxed' : ''}" id="bld-qty-sub-${b.id}">
                ${curCount >= totalQty ? (window.I18n ? window.I18n.t('buildings.all_at_lvl', { total: totalQty, lvl: b.level }) : `All ${totalQty} buildings are at Lvl. ${b.level}`) : (window.I18n ? window.I18n.t('buildings.remaining_at_prev', { rem: totalQty - curCount, prev: Math.max(1, b.level - 1) }) : `${totalQty - curCount} remaining at Lvl. ${Math.max(1, b.level - 1)}`)}
              </div>
            </div>
          ` : `
            <div class="bld-qty-box single">
              <span class="bld-qty-single-text">${window.I18n ? window.I18n.t('buildings.single_in_village') : 'Unique Building (1x in Village)'}</span>
            </div>
          `}

          <div class="bld-stepper-wrap">
            <button class="bld-btn-step step-minus" 
                    id="bld-btn-minus-${b.id}"
                    onclick="App.changeBuildingLevel('${b.id}', ${b.level - 1})"
                    ${b.level <= 1 ? 'disabled' : ''}
                    title="${window.I18n ? window.I18n.t('buildings.step_minus_title') : 'Decrease level'}">-</button>
            <div class="bld-stepper-display" id="bld-lvl-display-${b.id}">
              ${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} <strong>${b.level}</strong>
            </div>
            <button class="bld-btn-step step-plus" 
                    id="bld-btn-plus-${b.id}"
                    onclick="App.changeBuildingLevel('${b.id}', ${b.level + 1})"
                    ${b.level >= maxLvl ? 'disabled' : ''}
                    title="${window.I18n ? window.I18n.t('buildings.step_plus_title') : 'Increase level'}">+</button>
          </div>
          <div class="bld-action-row">
            <button class="bld-mini-btn" onclick="App.changeBuildingLevel('${b.id}', ${maxLvl}, ${totalQty})">
              ${window.I18n ? (isBuilder ? window.I18n.t('buildings.maxa_bh_btn', { bh }) : window.I18n.t('buildings.maxa_th_btn', { th })) : `⚡ Max`}
            </button>
            <button class="bld-mini-btn" onclick="App.openTimerForBuilding('${bName.replace(/'/g, "\\'")}', ${Math.min(maxLvl, b.level + 1)})">
              ${window.I18n ? window.I18n.t('buildings.upgrade_timer_btn') : '🔨 Timer'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // Adjust a building's level with optimistic local update + API persistence
  async changeBuildingLevel(buildingId, newLevel, newCount = null) {
    if (!this.state.currentTag) return;
    const m = this.state.metrics;
    if (!m) return;

    const isBuilder = (this.state.buildingsVillage === 'builderBase') || buildingId.startsWith('bb_');
    const villageData = isBuilder ? m.builderBuildings : m.buildings;
    if (!villageData || !villageData.list) return;

    const item = villageData.list.find(b => b.id === buildingId);
    if (!item) return;

    const maxLvl = item.maxLevelForTH || item.maxLevel || 1;
    const safeLevel = Math.max(1, Math.min(maxLvl, newLevel));

    let safeCount;
    if (newCount !== null) {
      safeCount = Math.min(item.quantity, Math.max(0, parseInt(newCount, 10)));
    } else if (item.quantity > 1 && safeLevel > item.level) {
      // When increasing level on multi-quantity buildings, reset count of upgraded structures to 0
      safeCount = 0;
    } else if (item.quantity > 1 && safeLevel < item.level) {
      // When decreasing level, all buildings are at least this lower level
      safeCount = item.quantity;
    } else {
      safeCount = item.quantity > 1 ? Math.min(item.quantity, Math.max(0, parseInt(item.count !== undefined ? item.count : item.quantity, 10))) : 1;
    }

    const oldLevel = item.level;
    const oldCount = item.count;

    item.level = safeLevel;
    item.count = safeCount;

    const curWeighted = (safeLevel * safeCount) + (Math.max(0, safeLevel - 1) * (item.quantity - safeCount));
    const maxWeighted = maxLvl * item.quantity;
    item.percent = maxWeighted > 0 ? Math.min(100, Math.round((curWeighted / maxWeighted) * 100)) : 0;
    item.isMaxed = safeLevel >= maxLvl && item.count >= item.quantity;

    // Recalculate metrics in memory immediately
    let totalCur = 0, totalMax = 0;
    villageData.list.forEach(b => {
      const bMaxLvl = b.maxLevelForTH || b.maxLevel || 1;
      const bCount = b.count !== undefined ? b.count : b.quantity;
      totalCur += (b.level * bCount) + (Math.max(0, b.level - 1) * (b.quantity - bCount));
      totalMax += (bMaxLvl * b.quantity);
    });
    villageData.currentLevels = totalCur;
    villageData.maxLevels = totalMax;
    villageData.percent = totalMax > 0 ? Math.min(100, Math.round((totalCur / totalMax) * 100)) : 0;

    // Recalculate overall score if Home Village
    if (!isBuilder && m.heroes && m.buildings && m.laboratory && m.equipment && m.townHall && m.achievements) {
      m.overallPercent = Math.round(
        (m.heroes.percent * 0.25) +
        (m.buildings.percent * 0.20) +
        (m.laboratory.percent * 0.20) +
        (m.equipment.percent * 0.15) +
        (m.townHall.percent * 0.15) +
        (m.achievements.percent * 0.05)
      );
    }

    // Update DOM card elements instantly
    const p = this.state.profileData;
    const lvlNum = isBuilder ? (p?.builderHallLevel || 1) : (p?.townHallLevel || 1);
    const card = document.getElementById(`bld-card-${buildingId}`);
    if (card) {
      if (item.isMaxed) card.classList.add('is-maxed');
      else card.classList.remove('is-maxed');
    }
    const img = document.getElementById(`bld-img-${buildingId}`);
    if (img) {
      const villageFolder = isBuilder ? 'builder-base' : 'home-village';
      const assetType = item.category === 'trap' ? 'traps' : 'buildings';
      img.src = `https://assets.clashk.ing/${assetType}/${villageFolder}/${item.slug}/level_${safeLevel}.webp`;
    }
    const badge = document.getElementById(`bld-badge-${buildingId}`);
    if (badge) {
      badge.className = `bld-level-badge ${item.isMaxed ? 'maxed' : ''}`;
      badge.textContent = item.isMaxed
        ? (window.I18n ? (isBuilder ? window.I18n.t('buildings.max_bh', { bh: lvlNum }) : window.I18n.t('buildings.max_th', { th: lvlNum })) : `★ MAX ${lvlNum}`)
        : `${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} ${safeLevel} / ${maxLvl}`;
    }
    const bar = document.getElementById(`bld-bar-${buildingId}`);
    if (bar) bar.style.width = `${item.percent}%`;

    const disp = document.getElementById(`bld-lvl-display-${buildingId}`);
    if (disp) disp.innerHTML = `${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} <strong>${safeLevel}</strong>`;

    const btnMinus = document.getElementById(`bld-btn-minus-${buildingId}`);
    if (btnMinus) {
      btnMinus.disabled = safeLevel <= 1;
      btnMinus.setAttribute('onclick', `App.changeBuildingLevel('${buildingId}', ${safeLevel - 1})`);
    }
    const btnPlus = document.getElementById(`bld-btn-plus-${buildingId}`);
    if (btnPlus) {
      btnPlus.disabled = safeLevel >= maxLvl;
      btnPlus.setAttribute('onclick', `App.changeBuildingLevel('${buildingId}', ${safeLevel + 1})`);
    }

    // Refresh quantity box labels if updated
    if (item.quantity > 1) {
      const qtyText = document.getElementById(`bld-qty-text-${buildingId}`);
      if (qtyText) qtyText.innerHTML = `<strong>${item.count}</strong> / ${item.quantity}`;
      const qtyBar = document.getElementById(`bld-qty-bar-${buildingId}`);
      if (qtyBar) qtyBar.style.width = `${Math.round((item.count / item.quantity) * 100)}%`;
      const qtySub = document.getElementById(`bld-qty-sub-${buildingId}`);
      if (qtySub) {
        qtySub.className = `bld-qty-sub ${item.count >= item.quantity ? 'maxed' : ''}`;
        qtySub.textContent = item.count >= item.quantity
          ? (window.I18n ? window.I18n.t('buildings.all_at_lvl', { total: item.quantity, lvl: safeLevel }) : `All ${item.quantity} buildings are at Lvl. ${safeLevel}`)
          : (window.I18n ? window.I18n.t('buildings.remaining_at_prev', { rem: item.quantity - item.count, prev: Math.max(1, safeLevel - 1) }) : `${item.quantity - item.count} remaining at Lvl. ${Math.max(1, safeLevel - 1)}`);
      }
      const qtyMinus = document.getElementById(`bld-qty-minus-${buildingId}`);
      if (qtyMinus) {
        qtyMinus.disabled = item.count <= 0;
        qtyMinus.setAttribute('onclick', `App.changeBuildingCount('${buildingId}', ${item.count - 1})`);
      }
      const qtyPlus = document.getElementById(`bld-qty-plus-${buildingId}`);
      if (qtyPlus) {
        qtyPlus.disabled = item.count >= item.quantity;
        qtyPlus.setAttribute('onclick', `App.changeBuildingCount('${buildingId}', ${item.count + 1})`);
      }
    }

    // Refresh Overview stats
    this.renderOverview();

    // Call API in background
    try {
      const payload = { buildingId, level: safeLevel, count: safeCount };

      const res = await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/buildings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Saving to server failed');

      const ind = document.getElementById('bld-saving-indicator');
      if (ind) {
        ind.style.display = 'inline-block';
        setTimeout(() => { ind.style.display = 'none'; }, 1800);
      }
    } catch (err) {
      item.level = oldLevel;
      item.count = oldCount;
      this.renderBuildings();
      this.renderOverview();
      this.showToast('Error saving level: ' + err.message, 'error');
    }
  },

  // Adjust the quantity of buildings at current level
  async changeBuildingCount(buildingId, newCount) {
    if (!this.state.currentTag) return;
    const m = this.state.metrics;
    if (!m) return;

    const isBuilder = (this.state.buildingsVillage === 'builderBase') || buildingId.startsWith('bb_');
    const villageData = isBuilder ? m.builderBuildings : m.buildings;
    if (!villageData || !villageData.list) return;

    const item = villageData.list.find(b => b.id === buildingId);
    if (!item) return;

    const totalQty = item.quantity || 1;
    const safeCount = Math.min(totalQty, Math.max(0, parseInt(newCount, 10)));
    if (safeCount === item.count) return;

    const oldCount = item.count;
    item.count = safeCount;

    const maxLvl = item.maxLevelForTH || item.maxLevel || 1;
    const curWeighted = (item.level * safeCount) + (Math.max(0, item.level - 1) * (totalQty - safeCount));
    const maxWeighted = maxLvl * totalQty;
    item.percent = maxWeighted > 0 ? Math.min(100, Math.round((curWeighted / maxWeighted) * 100)) : 0;
    item.isMaxed = item.level >= maxLvl && item.count >= totalQty;

    // Recalculate metrics in memory
    let totalCur = 0, totalMax = 0;
    villageData.list.forEach(b => {
      const bMaxLvl = b.maxLevelForTH || b.maxLevel || 1;
      const bCount = b.count !== undefined ? b.count : b.quantity;
      totalCur += (b.level * bCount) + (Math.max(0, b.level - 1) * (b.quantity - bCount));
      totalMax += (bMaxLvl * b.quantity);
    });
    villageData.currentLevels = totalCur;
    villageData.maxLevels = totalMax;
    villageData.percent = totalMax > 0 ? Math.min(100, Math.round((totalCur / totalMax) * 100)) : 0;

    // Recalculate overall score if Home Village
    if (!isBuilder && m.heroes && m.buildings && m.laboratory && m.equipment && m.townHall && m.achievements) {
      m.overallPercent = Math.round(
        (m.heroes.percent * 0.25) +
        (m.buildings.percent * 0.20) +
        (m.laboratory.percent * 0.20) +
        (m.equipment.percent * 0.15) +
        (m.townHall.percent * 0.15) +
        (m.achievements.percent * 0.05)
      );
    }

    // Update DOM
    const p = this.state.profileData;
    const lvlNum = isBuilder ? (p?.builderHallLevel || 1) : (p?.townHallLevel || 1);
    const card = document.getElementById(`bld-card-${buildingId}`);
    if (card) {
      if (item.isMaxed) card.classList.add('is-maxed');
      else card.classList.remove('is-maxed');
    }
    const badge = document.getElementById(`bld-badge-${buildingId}`);
    if (badge) {
      badge.className = `bld-level-badge ${item.isMaxed ? 'maxed' : ''}`;
      badge.textContent = item.isMaxed
        ? (window.I18n ? (isBuilder ? window.I18n.t('buildings.max_bh', { bh: lvlNum }) : window.I18n.t('buildings.max_th', { th: lvlNum })) : `★ MAX ${lvlNum}`)
        : `${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} ${item.level} / ${maxLvl}`;
    }
    const bar = document.getElementById(`bld-bar-${buildingId}`);
    if (bar) bar.style.width = `${item.percent}%`;

    const qtyText = document.getElementById(`bld-qty-text-${buildingId}`);
    if (qtyText) qtyText.innerHTML = `<strong>${safeCount}</strong> / ${totalQty}`;

    const qtyBar = document.getElementById(`bld-qty-bar-${buildingId}`);
    if (qtyBar) qtyBar.style.width = `${Math.round((safeCount / totalQty) * 100)}%`;

    const qtyMinus = document.getElementById(`bld-qty-minus-${buildingId}`);
    if (qtyMinus) {
      qtyMinus.disabled = safeCount <= 0;
      qtyMinus.setAttribute('onclick', `App.changeBuildingCount('${buildingId}', ${safeCount - 1})`);
    }
    const qtyPlus = document.getElementById(`bld-qty-plus-${buildingId}`);
    if (qtyPlus) {
      qtyPlus.disabled = safeCount >= totalQty;
      qtyPlus.setAttribute('onclick', `App.changeBuildingCount('${buildingId}', ${safeCount + 1})`);
    }
    const qtySub = document.getElementById(`bld-qty-sub-${buildingId}`);
    if (qtySub) {
      qtySub.className = `bld-qty-sub ${safeCount >= totalQty ? 'maxed' : ''}`;
      qtySub.textContent = safeCount >= totalQty
        ? (window.I18n ? window.I18n.t('buildings.all_at_lvl', { total: totalQty, lvl: item.level }) : `All ${totalQty} buildings are at Lvl. ${item.level}`)
        : (window.I18n ? window.I18n.t('buildings.remaining_at_prev', { rem: totalQty - safeCount, prev: Math.max(1, item.level - 1) }) : `${totalQty - safeCount} remaining at Lvl. ${Math.max(1, item.level - 1)}`);
    }

    this.renderOverview();

    // Call API in background
    try {
      const res = await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/buildings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingId, count: safeCount, level: item.level })
      });
      if (!res.ok) throw new Error('Saving to server failed');

      const ind = document.getElementById('bld-saving-indicator');
      if (ind) {
        ind.style.display = 'inline-block';
        setTimeout(() => { ind.style.display = 'none'; }, 1800);
      }
    } catch (err) {
      item.count = oldCount;
      this.renderBuildings();
      this.renderOverview();
      this.showToast('Error saving count: ' + err.message, 'error');
    }
  },

  // Max all buildings to the recommended level for current Town Hall or Builder Hall
  async handleMaxAllToCurrentTH() {
    if (!this.state.currentTag || !this.state.profileData) return;
    const isBuilder = (this.state.buildingsVillage === 'builderBase');

    if (isBuilder) {
      const bh = this.state.profileData.builderHallLevel || 1;
      const confirmMsg = window.I18n ? window.I18n.t('buildings.confirm_max_all_bh', { bh }) : `Do you want to set all Builder Base buildings to the standard max level for Builder Hall ${bh}?`;
      if (!confirm(confirmMsg)) return;

      try {
        const res = await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/buildings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'max_bh', bhLevel: bh })
        });
        const data = await res.json();
        if (data.success) {
          this.showToast(window.I18n ? `Builder Base buildings maxed for BH${bh}!` : `Builder Base buildings maxed for BH${bh}!`, 'success');
          await this.loadProfileDetail(this.state.currentTag, false);
        }
      } catch (err) {
        this.showToast('Error during synchronization: ' + err.message, 'error');
      }
    } else {
      const th = this.state.profileData.townHallLevel || 1;
      const confirmMsg = window.I18n ? window.I18n.t('buildings.confirm_max_all', { th }) : `Do you want to set all village buildings to the standard max level for Town Hall ${th}?`;
      if (!confirm(confirmMsg)) return;

      try {
        const res = await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/buildings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'max_th', thLevel: th })
        });
        const data = await res.json();
        if (data.success) {
          this.showToast(window.I18n ? window.I18n.t('toasts.maxed_all', { th }) : `Buildings maxed for Town Hall ${th}!`, 'success');
          await this.loadProfileDetail(this.state.currentTag, false);
        }
      } catch (err) {
        this.showToast('Error during synchronization: ' + err.message, 'error');
      }
    }
  },

  // Village Import & Export Methods
  handleVillageFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameSpan = document.getElementById('village-file-name');
    if (nameSpan) nameSpan.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
      const textarea = document.getElementById('import-village-textarea');
      if (textarea) {
        textarea.value = event.target.result;
        this.updateVillageImportPreview();
      }
    };
    reader.readAsText(file);
  },

  clearVillageJsonTextarea() {
    const textarea = document.getElementById('import-village-textarea');
    if (textarea) textarea.value = '';
    const nameSpan = document.getElementById('village-file-name');
    if (nameSpan) nameSpan.textContent = '';
    const fileInput = document.getElementById('village-import-file');
    if (fileInput) fileInput.value = '';
    this.updateVillageImportPreview();
  },

  HOME_DATA_ID_MAP: {
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
    12000000: 'bomb',
    12000001: 'spring_trap',
    12000002: 'giant_bomb',
    12000005: 'air_bomb',
    12000006: 'seeking_air_mine',
    12000008: 'skeleton_trap',
    12000016: 'tornado_trap',
    12000020: 'giga_bomb'
  },

  BUILDER_DATA_ID_MAP: {
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
    12000010: 'bb_spring_trap',
    12000011: 'bb_push_trap',
    12000013: 'bb_mine',
    12000014: 'bb_mega_mine'
  },

  updateVillageImportPreview() {
    const textarea = document.getElementById('import-village-textarea');
    const counterEl = document.getElementById('import-village-counter');
    if (!textarea || !counterEl) return;

    const text = textarea.value.trim();
    if (!text) {
      counterEl.textContent = '0 recognized structures';
      counterEl.style.color = 'var(--text-muted)';
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const recognized = this.extractBuildingsFromImport(parsed);
      const count = Object.keys(recognized).length;
      if (count > 0) {
        const meta = recognized.__meta || {};
        let label = `✅ ${count} recognized structures`;
        if (meta.homeCount > 0 && meta.builderCount > 0) {
          label = `✅ ${meta.homeCount} Home & ${meta.builderCount} Builder Base structures`;
          const radioBoth = document.querySelector('input[name="village-import-target"][value="both"]');
          if (radioBoth) radioBoth.checked = true;
        } else if (meta.homeCount > 0) {
          label = `✅ ${meta.homeCount} Home Village structures`;
          const radioHome = document.querySelector('input[name="village-import-target"][value="home"]');
          if (radioHome) radioHome.checked = true;
        } else if (meta.builderCount > 0) {
          label = `✅ ${meta.builderCount} Builder Base structures`;
          const radioBuilder = document.querySelector('input[name="village-import-target"][value="builderBase"]');
          if (radioBuilder) radioBuilder.checked = true;
        }
        if (meta.townHallLevel) {
          label += ` (TH${meta.townHallLevel})`;
        }
        if (meta.builderHallLevel) {
          label += ` (BH${meta.builderHallLevel})`;
        }
        counterEl.textContent = label;
        counterEl.style.color = '#4ade80';
      } else {
        counterEl.textContent = window.I18n ? window.I18n.t('import_village.no_buildings_found') : '⚠️ No recognized buildings or traps found in JSON';
        counterEl.style.color = '#f59e0b';
      }
    } catch (err) {
      counterEl.textContent = window.I18n ? window.I18n.t('import_village.json_syntax_error', { err: err.message }) : `❌ JSON syntax error: ${err.message}`;
      counterEl.style.color = '#ef4444';
    }
  },

  extractBuildingsFromImport(parsed) {
    const result = {};
    if (!parsed) return result;

    let meta = {
      homeCount: 0,
      builderCount: 0,
      townHallLevel: null,
      builderHallLevel: null
    };

    if (parsed.townHallLevel) meta.townHallLevel = parseInt(parsed.townHallLevel, 10);
    if (parsed.builderHallLevel) meta.builderHallLevel = parseInt(parsed.builderHallLevel, 10);

    const hasStructured = parsed.buildings || parsed.traps || parsed.buildings2 || parsed.traps2;

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
                bldId = this.BUILDER_DATA_ID_MAP[num] || this.HOME_DATA_ID_MAP[num];
              } else {
                bldId = this.HOME_DATA_ID_MAP[num] || this.BUILDER_DATA_ID_MAP[num];
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

      if (parsed.buildings) processList(parsed.buildings, false);
      if (parsed.traps) processList(parsed.traps, false);
      if (parsed.buildings2) processList(parsed.buildings2, true);
      if (parsed.traps2) processList(parsed.traps2, true);

      Object.entries(agg).forEach(([id, data]) => {
        result[id] = { level: data.maxLvl, count: data.countAtMax };
        if (id.startsWith('bb_')) {
          meta.builderCount++;
        } else {
          meta.homeCount++;
        }
      });
    } else {
      // Fallback for flat array or key-value object
      const data = parsed.village || parsed;
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (!item || typeof item !== 'object') return;
          const dataId = item.data !== undefined ? item.data : (item.id || item.slug || item.name);
          let normId = null;
          if (typeof dataId === 'number' || !isNaN(parseInt(dataId, 10))) {
            const num = parseInt(dataId, 10);
            normId = this.HOME_DATA_ID_MAP[num] || this.BUILDER_DATA_ID_MAP[num];
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
            normId = this.HOME_DATA_ID_MAP[num] || this.BUILDER_DATA_ID_MAP[num] || key;
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
  },

  async loadVillageTemplate(type) {
    const p = this.state.profileData;
    const th = p?.townHallLevel || 16;
    const bh = p?.builderHallLevel || 10;
    const textarea = document.getElementById('import-village-textarea');
    if (!textarea) return;

    if (type === 'th') {
      try {
        const res = await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/buildings?village=home`);
        const json = await res.json();
        const catalog = json.catalog || [];
        const templateObj = {};
        catalog.forEach(b => {
          templateObj[b.id] = {
            level: b.maxLevelForTH || b.maxLevel || 1,
            count: b.quantity || 1
          };
        });
        textarea.value = JSON.stringify(templateObj, null, 2);
        const radioHome = document.querySelector('input[name="village-import-target"][value="home"]');
        if (radioHome) radioHome.checked = true;
        this.updateVillageImportPreview();
      } catch (e) {
        this.showToast('Could not load TH template: ' + e.message, 'error');
      }
    } else if (type === 'bh') {
      try {
        const res = await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/buildings?village=builderBase`);
        const json = await res.json();
        const catalog = json.catalog || [];
        const templateObj = {};
        catalog.forEach(b => {
          templateObj[b.id] = {
            level: b.maxLevelForTH || b.maxLevel || 1,
            count: b.quantity || 1
          };
        });
        textarea.value = JSON.stringify(templateObj, null, 2);
        const radioBh = document.querySelector('input[name="village-import-target"][value="builderBase"]');
        if (radioBh) radioBh.checked = true;
        this.updateVillageImportPreview();
      } catch (e) {
        this.showToast('Could not load BH template: ' + e.message, 'error');
      }
    } else if (type === 'sample') {
      const sample = {
        "cannon": { "level": 21, "count": 5 },
        "archer_tower": { "level": 21, "count": 6 },
        "wizard_tower": { "level": 15, "count": 5 },
        "air_defense": { "level": 12, "count": 4 },
        "inferno_tower": { "level": 9, "count": 3 },
        "eagle_artillery": { "level": 6, "count": 1 },
        "scattershot": { "level": 4, "count": 2 },
        "monolith": { "level": 2, "count": 1 },
        "spell_tower": { "level": 3, "count": 2 },
        "clan_castle": { "level": 11, "count": 1 },
        "walls": { "level": 16, "count": 325 }
      };
      textarea.value = JSON.stringify(sample, null, 2);
      this.updateVillageImportPreview();
    }
  },

  async handleImportVillageSubmit() {
    if (!this.state.currentTag) return;
    const textarea = document.getElementById('import-village-textarea');
    if (!textarea || !textarea.value.trim()) {
      this.showToast('Please enter or upload Village JSON first.', 'error');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(textarea.value);
    } catch (err) {
      this.showToast('Invalid JSON syntax: ' + err.message, 'error');
      return;
    }

    const recognized = this.extractBuildingsFromImport(parsed);
    const count = Object.keys(recognized).length;
    if (count === 0) {
      this.showToast(window.I18n ? window.I18n.t('import_village.no_buildings_found') : 'No recognized building keys found in JSON', 'error');
      return;
    }

    const targetVillage = document.querySelector('input[name="village-import-target"]:checked')?.value || 'home';
    const mode = document.querySelector('input[name="village-import-mode"]:checked')?.value || 'merge';
    const replace = (mode === 'replace');

    const submitBtn = document.getElementById('btn-import-village-submit');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const payload = {
        buildings: recognized,
        village: targetVillage,
        replace
      };
      if (recognized.__meta?.townHallLevel) {
        payload.townHallLevel = recognized.__meta.townHallLevel;
      }
      if (recognized.__meta?.builderHallLevel) {
        payload.builderHallLevel = recognized.__meta.builderHallLevel;
      }

      const res = await fetch(`/api/profiles/${encodeURIComponent(this.state.currentTag)}/buildings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Import failed on server');
      }

      this.showToast(window.I18n ? window.I18n.t('import_village.import_success', { count }) : `🎉 Successfully imported ${count} structures!`, 'success');

      const statusEl = document.getElementById('import-village-status');
      if (statusEl) {
        statusEl.textContent = `✅ Imported ${count} structures (${targetVillage}, ${mode})`;
        statusEl.style.color = '#4ade80';
        setTimeout(() => { statusEl.textContent = ''; }, 4500);
      }

      await this.loadProfileDetail(this.state.currentTag, false);
      await this.fetchEvents();
    } catch (err) {
      this.showToast('Error importing buildings: ' + err.message, 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  async handleExportVillageJson() {
    if (!this.state.currentTag) return;
    try {
      const targetVillage = document.querySelector('input[name="village-import-target"]:checked')?.value || 'home';
      const m = this.state.metrics;
      const p = this.state.profileData;
      if (!m || !p) return;

      let exportData = {};
      if (targetVillage === 'home' || targetVillage === 'both') {
        (m.buildings?.list || []).forEach(b => {
          exportData[b.id] = {
            level: b.level,
            count: b.count !== undefined ? b.count : (b.quantity || 1)
          };
        });
      }
      if (targetVillage === 'builderBase' || targetVillage === 'both') {
        (m.builderBuildings?.list || []).forEach(b => {
          exportData[b.id] = {
            level: b.level,
            count: b.count !== undefined ? b.count : (b.quantity || 1)
          };
        });
      }

      const jsonStr = JSON.stringify(exportData, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      this.showToast(window.I18n ? window.I18n.t('import_village.export_copied') : '📋 Village JSON copied to clipboard!', 'success');

      const textarea = document.getElementById('import-village-textarea');
      if (textarea) {
        textarea.value = jsonStr;
        this.updateVillageImportPreview();
      }
    } catch (err) {
      this.showToast('Export error: ' + err.message, 'error');
    }
  },

  // Pre-fill and open upgrade timer modal for a building
  openTimerForBuilding(buildingName, targetLevel) {
    this.openModal('modal-add-timer');
    const typeSelect = document.getElementById('timer-type');
    if (typeSelect) typeSelect.value = 'builder';
    const nameInput = document.getElementById('timer-name');
    if (nameInput) nameInput.value = `${buildingName} ${window.I18n ? window.I18n.t('common.lvl') : 'Lvl.'} ${targetLevel}`;
  },

  // RENDER: EVENTS FEED
  renderEvents() {
    const container = document.getElementById('events-feed-container');
    const badgeCount = document.getElementById('tab-events-count');
    if (badgeCount) badgeCount.textContent = this.state.events.length;

    if (this.state.events.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('settings_modal.no_events') : 'No events or upgrades logged so far. Run a sync to check for new progress!'}</div>`;
      return;
    }

    container.innerHTML = this.state.events.map(e => `
      <div class="event-item">
        <div class="event-icon-circle">
          ${Assets.icons[e.icon] || Assets.icons.star}
        </div>
        <div class="event-body">
          <div class="event-title">${e.title}</div>
          <div class="event-desc">${e.description}</div>
          <div class="event-time">${Assets.formatTimeAgo(e.timestamp)} • ${e.playerName} (${e.playerTag})</div>
        </div>
      </div>
    `).join('');
  },

  // RENDER: PROFILES TABLE (IN SETTINGS TAB)
  renderProfilesTable() {
    const container = document.getElementById('profiles-table-container');
    if (this.state.profiles.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 1.5rem; color: var(--text-muted);">${window.I18n ? window.I18n.t('settings_modal.no_profiles') : 'No profiles stored.'}</div>`;
      return;
    }

    container.innerHTML = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted); text-transform: uppercase; font-size: 0.7rem;">
              <th style="padding: 0.75rem;">${window.I18n ? window.I18n.t('settings_modal.th_col') : 'Town Hall'}</th>
              <th style="padding: 0.75rem;">${window.I18n ? window.I18n.t('settings_modal.player_col') : 'Player / Tag'}</th>
              <th style="padding: 0.75rem;">${window.I18n ? window.I18n.t('settings_modal.clan_col') : 'Clan'}</th>
              <th style="padding: 0.75rem;">${window.I18n ? window.I18n.t('settings_modal.trophies_col') : 'Trophies'}</th>
              <th style="padding: 0.75rem;">${window.I18n ? window.I18n.t('settings_modal.last_sync_col') : 'Last Synced'}</th>
              <th style="padding: 0.75rem; text-align: right;">${window.I18n ? window.I18n.t('settings_modal.actions_col') : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.profiles.map(p => {
              const isActive = p.tag === this.state.currentTag;
              return `
                <tr style="border-bottom: 1px solid var(--border); ${isActive ? 'background: rgba(245, 158, 11, 0.05);' : ''}">
                  <td style="padding: 0.75rem;">
                    <span style="background: var(--bg-surface); padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-weight: 800; color: #fff; border: 1px solid var(--border);">
                      TH${p.townHallLevel}
                    </span>
                  </td>
                  <td style="padding: 0.75rem;">
                    <div style="font-weight: 700; color: #fff;">${p.nickname || p.name}</div>
                    <div style="font-family: monospace; color: var(--text-muted); font-size: 0.75rem;">${p.tag}</div>
                  </td>
                  <td style="padding: 0.75rem;">
                    ${p.clan ? `<span style="color: #cbd5e1;">${p.clan.name}</span>` : `<span style="color: #64748b;">${window.I18n ? window.I18n.t('common.none') : 'None'}</span>`}
                  </td>
                  <td style="padding: 0.75rem; color: #fbbf24; font-weight: 700;">
                    ${Assets.formatNumber(p.trophies || 0)}
                    ${p.leagueTier?.name ? `<div style="font-size: 0.7rem; color: #c084fc; font-weight: 600;">${p.leagueTier.name}</div>` : ''}
                  </td>
                  <td style="padding: 0.75rem; color: var(--text-muted);">
                    ${Assets.formatTimeAgo(p.lastUpdated)}
                  </td>
                  <td style="padding: 0.75rem; text-align: right;">
                    <div style="display: inline-flex; gap: 0.35rem;">
                      ${!isActive ? `
                        <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="App.switchProfile('${p.tag}', true)">
                          ${window.I18n ? window.I18n.t('common.activate') : 'Activate'}
                        </button>
                      ` : `
                        <span style="font-size: 0.75rem; color: var(--gem-green); font-weight: bold; padding: 0.3rem 0.6rem;">${window.I18n ? window.I18n.t('common.active') : 'Active'}</span>
                      `}
                      <button class="btn btn-danger btn-icon" style="width: 1.75rem; height: 1.75rem; padding: 0.2rem;" onclick="App.deleteProfile('${p.tag}')" title="${window.I18n ? window.I18n.t('settings_modal.delete_profile_title') : 'Delete Profile'}">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
};

// Initialize App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
