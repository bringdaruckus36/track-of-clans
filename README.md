# ⚔️ Clash of Clans Real-Time Tracker (Docker WebApp)

A modern, full-featured web application designed to run in a **Docker container** (or locally with Node.js) that integrates with the **Official Supercell Clash of Clans API** to track village progress, monitor live builder timers, inspect player statistics, track achievements, and manage **multiple player profiles** intuitively.

---

## 🌟 Key Features

1. **Multi-Profile Management**:
   - Save and track multiple accounts simultaneously (e.g. Main Account, Mini Account, War Account, Donation Account).
   - Assign custom nicknames to each profile.
   - Switch profiles instantly from the top navigation bar with one click.
   - Automatic background polling and on-demand manual refresh with change detection.

2. **Real-Time Upgrade Tracking & Live Timers**:
   - **Snapshot & Diff Engine**: On every sync (background or manual), the system compares the current state against the previous snapshot and logs upgrades for Heroes, Hero Equipment, Troops, Spells, Defenses, Town Hall, Trophies, and War Stars.
   - **Active Builder & Lab Timers**: Live countdown timers for Builders 1-6 (including B.O.B), the Laboratory, and the Pet House, updating down to the second.
   - **"Maxing" Percentages**: Dynamic progress computation for Heroes, Hero Equipment, Laboratory, Buildings & Defenses, Town Hall, and Overall Village completion.
   - **Real-Time Server-Sent Events (SSE)**: State changes and live events are pushed to the frontend via SSE.

3. **Buildings & Defenses Tracker**:
   - Dedicated sub-tabs for **Home Village** and **Builder Base**.
   - Interactive level controls (**+** and **-**) with quantity counters for each structure.
   - **⚡ Max to Current TH / BH**: Align all unlocked buildings to the maximum allowed levels for the current Town Hall or Builder Hall with a single click.

4. **Complete Army, Heroes & Equipment Roster**:
   - **Heroes**: All 6 heroes (Barbarian King, Archer Queen, Grand Warden, Royal Champion, Minion Prince, Dragon Duke) with level benchmarks calibrated to Town Hall caps.
   - **Hero Equipment**: All 43 Common and Epic hero equipment pieces with live levels, max caps per Town Hall Blacksmith level, and locked status with unlock requirements (Blacksmith level or Event/Trader).
   - **Troops, Super Troops, Pets, Siege Machines & Spells**: Complete rosters showing all units—even those not yet unlocked—calibrated to Town Hall Laboratory and Pet House caps.
   - **Builder Base Troops**: Dedicated section tracking Builder Base army levels.

5. **Comprehensive Achievements Tracking**:
   - Sub-tabs for **All**, **Home Village**, **Builder Base**, and **Clan Capital**.
   - Star progress (★☆☆, ★★☆, ★★★), exact numerical values, and percentage bars.
   - Quick filters (*All*, *In Progress*, *Completed 3★*) and instant search.
   - Highlights achievements closest to completion on the Overview dashboard.

6. **Import Village & Upgrades**:
   - **Import Village**: Import raw village data JSON to automatically populate structures and traps for both Home Village (`buildings`, `traps`) and Builder Base (`buildings2`, `traps2`) based on game data IDs.
   - **Import Upgrades**: Bulk import active builder and lab timers from JSON files or text with automatic calculation.

7. **Built-in Demo / Mock Mode**:
   - Pre-loaded with realistic demo accounts (Maxed TH16, TH13, TH11) and active timers so you can explore the entire interface immediately without needing a Supercell API token.

---

## 🚀 Quick Start: Docker Setup

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine with Docker Compose) installed and running.

### 1. Clone or Open the Repository
Navigate to the project root directory:
```bash
cd "Track of Clans"
```

### 2. (Optional) Configure Environment Variables
If you already have a Supercell API token, copy `.env.example` to `.env` and insert your key:
```bash
cp .env.example .env
```
*(You can also configure the API token at any time directly from the web interface in the "Profiles & API Settings" modal).*

### 3. Start the Container with Docker Compose
Run:
```bash
docker compose up -d --build
```
Or double-click `start.bat` on Windows (or run `./start.sh` on Linux/macOS).

### 4. Open the WebApp in Your Browser
Navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 💻 Local Node.js Setup (Without Docker)

If you prefer running without Docker:
1. Ensure Node.js (v18+) is installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Access the web app at `http://localhost:3000`.

---

## 🔑 How to Get a Clash of Clans API Key

Supercell's official API uses JWT tokens bound to your public IP address. The web application automatically detects and displays your public IP in the **Settings** modal.

1. Visit the Supercell Developer Portal: [https://developer.clashofclans.com](https://developer.clashofclans.com)
2. Log in with your Supercell ID (or create a free account).
3. Navigate to **"My Account"** and click **"Create New Key"**.
4. Enter a name (e.g. `CoC Tracker`) and a description.
5. In the **"Allowed IP Addresses"** field, paste your public IP (click *"Copy IP for Supercell"* inside the web app).
6. Click **"Create Key"** and copy the generated token.
7. Paste the token into the web app (in *⚙️ Profiles & API Settings* -> *Official API Token*) or in your `.env` file as `COC_API_TOKEN`.

---

## 📁 Project Structure

```
Track-of-Clans/
├── Dockerfile                 # Alpine Node.js container build configuration
├── docker-compose.yml         # Service orchestration with persistent data volume
├── .dockerignore              # Files excluded from the Docker build
├── .env.example               # Environment variables template
├── package.json               # Node.js project metadata and dependencies
├── README.md                  # Project documentation (English)
├── start.bat                  # Quick start script for Windows
├── start.sh                   # Quick start script for Linux/macOS
├── data/                      # Persistent storage volume (mounted in Docker)
│   └── database.json          # Atomic JSON database for profiles, history, and timers
└── src/
    ├── config.js              # Application paths and default settings
    ├── server.js              # HTTP server, REST router, background poller & SSE
    ├── services/
    │   ├── cocApi.js          # Official Supercell API client & public IP detection
    │   ├── storage.js         # Persistence engine (profiles, snapshots, timers, buildings)
    │   ├── tracker.js         # Diff engine, Town Hall calibration & metrics computer
    │   └── mockData.js        # Realistic demo profiles, benchmarks & mock timers
    └── public/
        ├── index.html         # Single Page Application HTML markup
        ├── css/
        │   └── styles.css     # Dark Clash of Clans theme styling
        └── js/
            ├── assets.js      # CDN sprite helpers, SVG icons, and time formatting
            ├── benchmarks.js  # Level caps & Town Hall benchmarks (Heroes, Equip, Troops, Spells)
            ├── i18n.js        # UI localization dictionary (English)
            └── app.js         # Client application controller, timers, and SSE listener
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Container health check |
| `GET` | `/api/ip` | Detects the server's public IP address |
| `GET` | `/api/profiles` | List all tracked player profiles |
| `POST` | `/api/profiles` | Add and sync a new profile by player tag |
| `GET` | `/api/profiles/:tag` | Full profile data, maxing metrics, and active timers |
| `POST` | `/api/profiles/:tag/activate` | Set active profile |
| `POST` | `/api/profiles/:tag/refresh` | Force sync with Clash of Clans API and record diffs |
| `DELETE` | `/api/profiles/:tag` | Remove a profile from tracking |
| `GET` | `/api/events` | Real-time event stream (Server-Sent Events) |
| `GET` | `/api/events/list` | Upgrade history log |
| `POST` | `/api/upgrades` | Add a live countdown timer for builder, lab, or pet |
| `POST` | `/api/upgrades/import` | Bulk import upgrade timers from JSON |
| `GET` | `/api/upgrades/:tag/export` | Export active timers as a JSON file |
| `DELETE` | `/api/upgrades/:tag/:id` | Delete an active timer |
| `GET` | `/api/buildings/catalog` | Catalog of Home Village buildings and defenses |
| `GET` | `/api/buildings/builder-catalog` | Catalog of Builder Base buildings and defenses |
| `GET` | `/api/profiles/:tag/buildings` | Retrieve current building levels for the profile |
| `POST` | `/api/profiles/:tag/buildings` | Update building level/count or sync to TH/BH max |
| `POST` | `/api/profiles/:tag/village-import` | Import raw village structures & traps JSON |
| `POST` | `/api/settings` | Update API token and background polling interval |

---

## 📥 Importing Active Timers from JSON

In the **"Import Village"** modal or Timer section, you can bulk-import active timers by uploading a `.json` file or pasting JSON text.

### Supported JSON Format

Accepts either a JSON array or an object containing an `upgrades` or `activeUpgrades` key:

```json
[
  {
    "name": "Monolith Lvl. 5",
    "builderIndex": 1,
    "days": 4,
    "hours": 12,
    "mins": 0,
    "type": "builder"
  },
  {
    "name": "X-Bow Lvl. 13",
    "builderIndex": 2,
    "days": 2,
    "hours": 8,
    "mins": 30,
    "type": "builder"
  },
  {
    "name": "Rage Spell Lvl. 7",
    "builderIndex": 3,
    "days": 1,
    "hours": 18,
    "type": "lab"
  }
]
```

#### Supported Fields:
- `name`: Name of the building, hero, or troop upgrading (e.g. `"Monolith Lvl. 5"`).
- `builderIndex` or `slot`: Builder slot number from `1` to `6` (B.O.B).
- `type`: `builder` (structures / heroes), `lab` (troop / spell research), or `pet` (hero pets).
- `days`, `hours`, `mins`: Remaining duration. Alternatively, specify `remainingSeconds` or an exact ISO 8601 completion timestamp (`endTime`).
- **Import Mode**: Choose between **Merge** (add to existing timers) or **Replace** (overwrite all current timers).

---

## 🛡️ Data Persistence

All data (tracked profiles, upgrade snapshots, active countdown timers, building levels, and settings) is persisted in the `./data` folder on your host machine via the Docker volume specified in `docker-compose.yml`:
```yaml
volumes:
  - ./data:/app/data
```
Your progress and configuration are fully preserved across container restarts, rebuilds, and updates.

---

## 📜 License
This project is open-source and intended for personal use and Clash of Clans community tracking. Clash of Clans and its respective assets are trademarks of Supercell Oy.
