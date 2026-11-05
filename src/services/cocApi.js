const https = require('node:https');
const storage = require('./storage');
const { mockProfiles } = require('./mockData');

class CocApiService {
  /**
   * Helper to make HTTPS requests without external dependencies.
   */
  request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const reqOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ClashOfClans-Tracker-Docker/1.0',
          ...(options.headers || {})
        },
        timeout: 10000
      };

      const req = https.request(reqOptions, (res) => {
        let body = '';
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            const data = body ? JSON.parse(body) : null;
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ status: res.statusCode, data });
            } else {
              let errorMsg = `Supercell API Error (${res.statusCode})`;
              if (res.statusCode === 403) {
                errorMsg = 'Access Denied (403): The API token is invalid or the server IP address is not authorized in the Supercell Developer portal.';
              } else if (res.statusCode === 404) {
                errorMsg = 'Player not found (404): Please verify that the player tag is correct (e.g. #2PP...).';
              } else if (res.statusCode === 429) {
                errorMsg = 'Rate limit exceeded (429): Too many requests sent to Supercell.';
              } else if (res.statusCode === 503) {
                errorMsg = 'Supercell server in maintenance (503): Please try again in a few minutes.';
              } else if (data && data.message) {
                errorMsg = `${data.message} (${data.reason || res.statusCode})`;
              }
              const err = new Error(errorMsg);
              err.status = res.statusCode;
              err.apiResponse = data;
              reject(err);
            }
          } catch (e) {
            reject(new Error(`Invalid API response: ${e.message}`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Clash of Clans API request timeout (10s)'));
      });

      req.on('error', (err) => {
        reject(new Error(`Network connection error: ${err.message}`));
      });

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }

      req.end();
    });
  }

  /**
   * Detects the public IP of the host machine/container.
   * Supercell API requires binding tokens to your public IP.
   */
  async getPublicIp() {
    try {
      const res = await this.request('https://api.ipify.org?format=json');
      return res.data && res.data.ip ? res.data.ip : 'Unable to detect IP';
    } catch (err) {
      return 'IP detection failed (check internet connection)';
    }
  }

  /**
   * Fetches player information by player tag.
   * If token is not configured or tag matches demo, returns mock data.
   */
  async fetchPlayer(tag) {
    const normTag = storage.normalizeTag(tag);

    // Check if this tag matches one of our demo profiles
    const demoMatch = mockProfiles.find(p => p.tag === normTag);
    const settings = storage.getSettings();
    const token = settings.cocApiToken;

    // If matching a demo tag and no token, or demo requested
    if (demoMatch && (!token || normTag.startsWith('#DEMO'))) {
      return {
        ...demoMatch,
        _isMock: true
      };
    }

    // If no token is configured and the database has no profiles yet, or user enters demo
    if (!token) {
      if (demoMatch) {
        return { ...demoMatch, _isMock: true };
      }
      throw new Error('No Clash of Clans API Token configured! Go to Settings to enter your Supercell token or use Demo profiles.');
    }

    // Call live official API
    // Official endpoint: https://api.clashofclans.com/v1/players/{playerTag}
    // Clash of Clans player tags contain # which must be percent-encoded as %23
    const encodedTag = encodeURIComponent(normTag);
    const url = `https://api.clashofclans.com/v1/players/${encodedTag}`;

    const res = await this.request(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      ...res.data,
      tag: normTag,
      _isMock: false
    };
  }
}

module.exports = new CocApiService();
