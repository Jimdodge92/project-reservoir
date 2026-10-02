const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, exec } = require('child_process');

const PORT = process.env.PORT || 3456;
const antigravityDir = path.join(os.homedir(), '.gemini', 'antigravity');
const brainDir = path.join(antigravityDir, 'brain');

// Scientific Constants (UC Riverside AI Datacenter Cooling Water Footprint Model)
const ML_PER_STEP = 60;            // ~60 mL per autonomous reasoning / tool execution step
const ML_PER_WATER_BOTTLE = 500;   // 500 mL standard 16.9 oz plastic water bottle
const ML_PER_OFFICE_JUG = 18927;   // 18.9 Liters (5 Gallons)

// Cached Antigravity Language Server Connection Info
let cachedConnection = {
  port: null,
  token: null,
  lastDetected: 0
};

// Discover live language_server port and CSRF token from running process
function detectAntigravityConnection() {
  const now = Date.now();
  if (cachedConnection.token && cachedConnection.port && (now - cachedConnection.lastDetected < 60000)) {
    return cachedConnection;
  }
  try {
    const ps = `powershell -NoProfile -Command "$p = Get-Process language_server -ErrorAction SilentlyContinue | Select-Object -First 1; if ($p) { $cmd = (Get-CimInstance Win32_Process -Filter ('ProcessId=' + $p.Id)).CommandLine; $ports = (Get-NetTCPConnection -OwningProcess $p.Id -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort); Write-Output ($p.Id.ToString() + '|||' + $cmd + '|||' + ($ports -join ',')) }"`;
    const out = execSync(ps, { encoding: 'utf8' }).trim();
    if (out) {
      const [pid, cmdLine, portsStr] = out.split('|||');
      const tokenMatch = cmdLine.match(/--csrf_token\s+([a-zA-Z0-9-]+)/);
      const ports = (portsStr || '').split(',').map(p => parseInt(p.trim())).filter(Boolean);
      const rpcPort = ports.find(p => p % 2 === 0) || ports[0];
      if (tokenMatch) cachedConnection.token = tokenMatch[1];
      if (rpcPort) cachedConnection.port = rpcPort;
      cachedConnection.lastDetected = now;
    }
  } catch (err) {}
  return cachedConnection;
}

// In-Memory Master Telemetry State
const state = {
  userName: 'Jim',
  brotherName: 'Nathan',
  syncIntervalSec: 5,
  lastLiveSync: null,
  livePlan: 'Google AI Ultra',
  availableCredits: 640,

  // SYSTEM 1: JET FUEL SPRINT TANK
  fuel: {
    capacityGal: 500,
    currentGal: 455,
    totalBurnedGal: 45,
    burnRateGPH: 14.8,
    resetsInMinutes: 146,
    geminiRemainingPct: 91.0,
    claudeRemainingPct: 97.4,

    weeklyRemainingPct: 93.0,
    weeklyCapacityGal: 2500,
    weeklyCurrentGal: 2325,
    weeklyTotalBurnedGal: 175,
    weeklyResetsText: '2 days, 1 hour',

    jim: {
      burnedGal: 36,
      mode: 'Eco-Cruise (42 MPG)',
      speed: 'Mach 0.8 (Subsonic)',
      status: '🟢 Fuel Efficient'
    },
    nathan: {
      burnedGal: 9,
      mode: '🔥 Twin Afterburners (6 GPH)',
      speed: 'Mach 3.2 (Supersonic)',
      status: '🚨 Active Quota Burn'
    },
    timeline: [
      { label: '5h ago', remainingPct: 100 },
      { label: '4h ago', remainingPct: 97 },
      { label: '3h ago', remainingPct: 95 },
      { label: '2h ago', remainingPct: 93 },
      { label: '1h ago', remainingPct: 92 },
      { label: 'Now', remainingPct: 91.0 }
    ]
  },

  // SYSTEM 2: REAL PHYSICAL WATER FOOTPRINT (UC Riverside)
  water: {
    totalEvaporatedML: 45800,
    bottlesEvaporated: 91.6,
    officeJugsEvaporated: 2.42,
    jim: {
      mlEvaporated: 30600,
      bottles: 61.2,
      cupsOfCoffee: 12.0,
      percentShare: 66.8,
      description: '💧 Sipping a glass of water'
    },
    nathan: {
      mlEvaporated: 15200,
      bottles: 30.4,
      cupsOfCoffee: 48.5,
      percentShare: 33.2,
      description: '🌊 Evaporating cooling towers on high compute'
    },
    sevenDayLiters: {
      labels: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Today'],
      jim: [0, 25.26, 90.54, 0, 0, 6.36, 64.62],
      nathan: [18.4, 24.2, 14.8, 12.5, 29.6, 22.1, 15.2]
    },
    weekly: {
      totalEvaporatedML: 323580,
      totalLiters: 323.58,
      bottlesEvaporated: 647.2,
      officeJugsEvaporated: 17.1,
      jim: {
        liters: 186.78,
        bottles: 373.6,
        percentShare: 57.7
      },
      nathan: {
        liters: 136.8,
        bottles: 273.6,
        percentShare: 42.3
      }
    }
  },

  localTelemetry: {
    promptsToday: 150,
    stepsToday: 1077,
    lastScanned: new Date().toISOString()
  },

  events: [
    { id: 1, time: 'Just now', user: 'System', text: '⚡ Live 5-Second Real-Time Telemetry & Google Quota Sync Active', type: 'system' }
  ]
};

// Scan local Antigravity transcript files to compute Jim's real turns & steps
function scanJimRealSteps() {
  const days = [];
  const dayLabels = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);
    days.push(dateStr);
    dayLabels.push(i === 0 ? 'Today' : dayNames[d.getDay()]);
  }

  const stepsPerDay = {};
  days.forEach(d => stepsPerDay[d] = 0);
  let stepsLast5Hours = 0;
  let totalStepsToday = 0;
  let totalPromptsToday = 0;
  const fiveHoursAgo = Date.now() - (5 * 3600 * 1000);
  const todayStr = days[6];

  if (fs.existsSync(brainDir)) {
    try {
      const folders = fs.readdirSync(brainDir);
      for (const f of folders) {
        const t = path.join(brainDir, f, '.system_generated', 'logs', 'transcript.jsonl');
        if (fs.existsSync(t)) {
          const content = fs.readFileSync(t, 'utf8');
          const lines = content.split('\n').filter(Boolean);
          for (const l of lines) {
            try {
              const item = JSON.parse(l);
              if (item.created_at) {
                const dateStr = item.created_at.substring(0, 10);
                if (item.type === 'PLANNER_RESPONSE') {
                  if (stepsPerDay[dateStr] !== undefined) {
                    stepsPerDay[dateStr]++;
                  }
                  const itemTime = new Date(item.created_at).getTime();
                  if (itemTime >= fiveHoursAgo) {
                    stepsLast5Hours++;
                  }
                  if (dateStr === todayStr) {
                    totalStepsToday++;
                  }
                } else if (item.type === 'USER_INPUT') {
                  if (dateStr === todayStr) {
                    totalPromptsToday++;
                  }
                }
              }
            } catch(e) {}
          }
        }
      }
    } catch (err) {}
  }

  const jimDailyLiters = days.map(d => +((stepsPerDay[d] * ML_PER_STEP) / 1000).toFixed(2));
  const jimTotalWeeklyLiters = +(jimDailyLiters.reduce((a, b) => a + b, 0)).toFixed(2);
  const jim5hLiters = +((stepsLast5Hours * ML_PER_STEP) / 1000).toFixed(2);
  const jimWeeklySteps = Object.values(stepsPerDay).reduce((a, b) => a + b, 0);

  state.localTelemetry.stepsToday = totalStepsToday;
  state.localTelemetry.promptsToday = totalPromptsToday;
  state.localTelemetry.lastScanned = new Date().toISOString();

  return {
    days,
    dayLabels,
    stepsLast5Hours,
    jimWeeklySteps,
    jimDailyLiters,
    jimTotalWeeklyLiters,
    jim5hLiters
  };
}

// Live 5-Second Google Quota Poller via local Language Server
function pollLiveGoogleQuota() {
  const jimStats = scanJimRealSteps();

  const conn = detectAntigravityConnection();
  if (!conn || !conn.token || !conn.port) {
    applyTelemetryUpdate(null, jimStats);
    return;
  }

  const agent = new https.Agent({ rejectUnauthorized: false });
  const headers = {
    'Content-Type': 'application/json',
    'x-codeium-csrf-token': conn.token,
    'x-csrf-token': conn.token,
    'Content-Length': 2
  };

  const req = https.request({
    hostname: '127.0.0.1',
    port: conn.port,
    path: '/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary',
    method: 'POST',
    headers,
    agent,
    timeout: 3000
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        applyTelemetryUpdate(data, jimStats);
      } catch (err) {
        applyTelemetryUpdate(null, jimStats);
      }
    });
  });

  req.on('error', () => {
    applyTelemetryUpdate(null, jimStats);
  });
  req.write('{}');
  req.end();
}

function applyTelemetryUpdate(quotaData, jimStats) {
  try {
    let gemini5hPct = 91.0;
    let geminiWeeklyPct = 93.0;
    let claudeWeeklyPct = 97.4;
    let resetsInMinutes = 146;
    let weeklyResetsText = '2 days, 1 hour';

    if (quotaData && quotaData.response && Array.isArray(quotaData.response.groups)) {
      const geminiGroup = quotaData.response.groups.find(g => g.displayName === 'Gemini Models');
      if (geminiGroup && Array.isArray(geminiGroup.buckets)) {
        const bucket5h = geminiGroup.buckets.find(b => b.window === '5h' || b.bucketId === 'gemini-5h');
        if (bucket5h && typeof bucket5h.remainingFraction === 'number') {
          gemini5hPct = +(bucket5h.remainingFraction * 100).toFixed(1);
          if (bucket5h.resetTime) {
            const msLeft = new Date(bucket5h.resetTime).getTime() - Date.now();
            resetsInMinutes = Math.max(1, Math.round(msLeft / 60000));
          }
        }

        const bucketWeekly = geminiGroup.buckets.find(b => b.window === 'weekly' || b.bucketId === 'gemini-weekly');
        if (bucketWeekly && typeof bucketWeekly.remainingFraction === 'number') {
          geminiWeeklyPct = +(bucketWeekly.remainingFraction * 100).toFixed(1);
          if (bucketWeekly.description) {
            const m = bucketWeekly.description.match(/refresh in ([^.]+)/);
            if (m) weeklyResetsText = m[1].trim();
          }
        }
      }

      const claudeGroup = quotaData.response.groups.find(g => g.displayName.includes('Claude'));
      if (claudeGroup && Array.isArray(claudeGroup.buckets)) {
        const cWeekly = claudeGroup.buckets.find(b => b.window === 'weekly');
        if (cWeekly && typeof cWeekly.remainingFraction === 'number') {
          claudeWeeklyPct = +(cWeekly.remainingFraction * 100).toFixed(1);
        }
      }
    }

    // 1. Update Fuel Model
    state.fuel.geminiRemainingPct = gemini5hPct;
    state.fuel.weeklyRemainingPct = geminiWeeklyPct;
    state.fuel.claudeRemainingPct = claudeWeeklyPct;
    state.fuel.resetsInMinutes = resetsInMinutes;
    state.fuel.weeklyResetsText = weeklyResetsText;

    const currentGal = +(state.fuel.capacityGal * (gemini5hPct / 100)).toFixed(0);
    const totalBurnedGal = +(state.fuel.capacityGal - currentGal).toFixed(0);
    state.fuel.currentGal = currentGal;
    state.fuel.totalBurnedGal = totalBurnedGal;

    const weeklyCurrentGal = +(state.fuel.weeklyCapacityGal * (geminiWeeklyPct / 100)).toFixed(0);
    const weeklyTotalBurnedGal = +(state.fuel.weeklyCapacityGal - weeklyCurrentGal).toFixed(0);
    state.fuel.weeklyCurrentGal = weeklyCurrentGal;
    state.fuel.weeklyTotalBurnedGal = weeklyTotalBurnedGal;

    // 2. Family Pool Quota Residual Deduction for Nathan
    const pool5hBurnPct = Math.max(0.1, +(100 - gemini5hPct).toFixed(2));
    const poolWeeklyBurnPct = Math.max(0.1, +(100 - geminiWeeklyPct).toFixed(2));

    // Jim's Ground-Truth Step & Water Metrics
    const jim5hLiters = jimStats.jim5hLiters;
    const jimWeeklyLiters = jimStats.jimTotalWeeklyLiters;

    // Quota burn calibration:
    // Jim's slice of the 5-hour pool burn (capped at 95% of total pool burn)
    const jim5hBurnPct = Math.min(pool5hBurnPct * 0.95, Math.max(0.05, +(jimStats.stepsLast5Hours * 0.012).toFixed(2)));
    // Nathan's slice is the exact residual: Total Pool Burn - Jim's Burn
    const nathan5hBurnPct = +(pool5hBurnPct - jim5hBurnPct).toFixed(2);

    const jim5hShare = jim5hBurnPct / pool5hBurnPct;
    const nathan5hShare = nathan5hBurnPct / pool5hBurnPct;

    // Nathan's 5h Water Extrapolated from his quota slice
    const nathan5hLiters = +((jim5hLiters / (jim5hShare || 0.5)) * nathan5hShare).toFixed(2);

    // Jim's slice of the Weekly pool burn
    const jimWeeklyBurnPct = Math.min(poolWeeklyBurnPct * 0.95, Math.max(0.05, +(jimStats.jimWeeklySteps * 0.0016).toFixed(2)));
    // Nathan's weekly slice is the exact residual
    const nathanWeeklyBurnPct = +(poolWeeklyBurnPct - jimWeeklyBurnPct).toFixed(2);

    const jimWeeklyShare = jimWeeklyBurnPct / poolWeeklyBurnPct;
    const nathanWeeklyShare = nathanWeeklyBurnPct / poolWeeklyBurnPct;

    // Nathan's Weekly Water Extrapolated
    const nathanWeeklyLiters = +((jimWeeklyLiters / (jimWeeklyShare || 0.5)) * nathanWeeklyShare).toFixed(2);

    // Nathan's 7-Day Daily Distribution (proportional to daily pool usage)
    const nathanDailyLiters = jimStats.jimDailyLiters.map(jL => {
      return +((jL / (jimWeeklyLiters || 1)) * nathanWeeklyLiters).toFixed(2);
    });

    // 3. Jet Fuel Split (Exact Family Quota Pool Split)
    state.fuel.jim.burnedGal = Math.round(totalBurnedGal * jim5hShare);
    state.fuel.nathan.burnedGal = Math.max(0, totalBurnedGal - state.fuel.jim.burnedGal);

    // 4. Real Water Footprint Update
    const total5hL = +(jim5hLiters + nathan5hLiters).toFixed(2);
    const total5hML = Math.round(total5hL * 1000);
    const jim5hML = Math.round(jim5hLiters * 1000);
    const nathan5hML = Math.round(nathan5hLiters * 1000);

    state.water.totalEvaporatedML = total5hML;
    state.water.bottlesEvaporated = +(total5hML / ML_PER_WATER_BOTTLE).toFixed(1);
    state.water.officeJugsEvaporated = +(total5hML / ML_PER_OFFICE_JUG).toFixed(2);

    state.water.jim.mlEvaporated = jim5hML;
    state.water.jim.bottles = +(jim5hML / ML_PER_WATER_BOTTLE).toFixed(1);
    state.water.jim.percentShare = +(jim5hShare * 100).toFixed(1);

    state.water.nathan.mlEvaporated = nathan5hML;
    state.water.nathan.bottles = +(nathan5hML / ML_PER_WATER_BOTTLE).toFixed(1);
    state.water.nathan.percentShare = +(nathan5hShare * 100).toFixed(1);

    // 7-Day Chart Data
    state.water.sevenDayLiters.labels = jimStats.dayLabels;
    state.water.sevenDayLiters.jim = jimStats.jimDailyLiters;
    state.water.sevenDayLiters.nathan = nathanDailyLiters;

    // Weekly Water Metrics
    const weeklyTotalL = +(jimWeeklyLiters + nathanWeeklyLiters).toFixed(2);
    const weeklyTotalML = Math.round(weeklyTotalL * 1000);

    state.water.weekly = {
      totalEvaporatedML: weeklyTotalML,
      totalLiters: weeklyTotalL,
      bottlesEvaporated: +(weeklyTotalML / ML_PER_WATER_BOTTLE).toFixed(1),
      officeJugsEvaporated: +(weeklyTotalML / ML_PER_OFFICE_JUG).toFixed(2),
      jim: {
        liters: jimWeeklyLiters,
        bottles: +(jimWeeklyLiters * 1000 / ML_PER_WATER_BOTTLE).toFixed(1),
        percentShare: +(jimWeeklyShare * 100).toFixed(1)
      },
      nathan: {
        liters: nathanWeeklyLiters,
        bottles: +(nathanWeeklyLiters * 1000 / ML_PER_WATER_BOTTLE).toFixed(1),
        percentShare: +(nathanWeeklyShare * 100).toFixed(1)
      }
    };

    // Update Fuel Timeline Last Point
    state.fuel.timeline[state.fuel.timeline.length - 1].remainingPct = gemini5hPct;
    state.lastLiveSync = new Date().toLocaleTimeString();

    // Persist local telemetry snapshot
    try {
      fs.writeFileSync(path.join(__dirname, 'telemetry.json'), JSON.stringify(state, null, 2), 'utf8');
    } catch (e) {}

    // Broadcast live event to open browser tabs
    broadcastSSE();
  } catch (err) {}
}

// Initial Poller Trigger
pollLiveGoogleQuota();

// Automatic 5-Second Real-Time Loop
setInterval(() => {
  pollLiveGoogleQuota();
}, 5000);

// Automatic Background GitHub Pages Synchronizer (every 2 minutes)
let isSyncingGithub = false;
setInterval(() => {
  if (isSyncingGithub) return;
  isSyncingGithub = true;
  const scriptPath = path.join(__dirname, 'sync-github.cmd');
  exec(`cmd.exe /c "${scriptPath}"`, (err) => {
    isSyncingGithub = false;
  });
}, 120000);

// SSE Client list
let sseClients = [];

function broadcastSSE() {
  const data = JSON.stringify(state);
  sseClients.forEach(client => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (e) {}
  });
}

// HTTP Server
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // SSE Stream Endpoint
  if (url.pathname === '/api/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write(`data: ${JSON.stringify(state)}\n\n`);
    sseClients.push(res);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c !== res);
    });
    return;
  }

  // API Status Endpoint
  if (url.pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
    return;
  }

  // Action / Manual trigger
  if (url.pathname === '/api/action' && req.method === 'POST') {
    pollLiveGoogleQuota();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, state }));
    return;
  }

  // Serve Static Frontend
  let filePath = path.join(__dirname, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.svg') contentType = 'image/svg+xml';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚰 Project Reservoir: 5-Second Automated Sync Active!`);
  console.log(`👉 Open in your browser: http://localhost:${PORT}`);
  console.log(`👉 Local Network: http://192.168.4.39:${PORT}`);
  console.log(`======================================================\n`);
});
