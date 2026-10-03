# 🚰 Project Reservoir

> **Real-Time Jet-A Fuel & Physical Datacenter Cooling Water Footprint Dashboard**  
> Tracking Google One AI Ultra quota depletion and environmental impact between Jim and Nathan.

---

## 🧭 About Project Reservoir

When someone uses too much paper, you say *"You're killing a forest!"*  
When someone's using too much AI, people say *"Oh no, the drinking water!"*

**Project Reservoir** tracks the shared Google AI Ultra quota across two distinct systems:
1. **⛽ Fuel Remaining**: Visualized as a Jet-A rocket cockpit tank with sprint depletion alarms, flameout advisories, and weekly quota limits.
2. **🚰 Water Consumed**: Visualized as a real-life physical datacenter cooling reservoir, tracking real evaporated water in liters, 500 mL water bottles, and 5-gallon office cooler jugs based on UC Riverside AI water consumption research.

Both systems run with **0 software installed on Nathan's computer**. Nathan's quota drain is calculated mathematically by **Process of Elimination**:
$$\text{Nathan's Consumption} = \text{Total Google Quota Drain} - \text{Jim's Local Verified Usage}$$

---

## ⚡ Features

- **Automated 5-Second Sync**: Directly hooks into the Google Antigravity Language Server IPC daemon to stream real-time quota data via Server-Sent Events (SSE).
- **Dual Toggles**:
  - Switch between **5-Hour Sprint Tank** and **Weekly Quota Tank**.
  - Switch vertical stack order between **Water** and **Fuel**.
- **Proportional Mini Donut Charts**: Live visual breakdown of fuel burned and cooling water evaporated per brother.
- **Tug-of-War Ratio Gauges**: Instant head-to-head visual comparison.
- **7-Day Historical Analytics**: Daily trends and real liters evaporated.

---

## 🛠️ Quick Start

```bash
# Clone the repository
git clone https://github.com/<your-username>/project-reservoir.git
cd project-reservoir

# Start the server (runs on http://localhost:3456)
node server.js
```

Or double-click `start-reservoir.cmd` on Windows.

---

## 🗺️ Sprint Roadmap

### Phase 1: Dual-Member Telemetry Engine (Completed / Operational)
- [x] Hook into Google Antigravity Language Server IPC daemon via SSE.
- [x] Real-time Jet-A fuel & UC Riverside datacenter cooling water math engine.
- [x] Two-party Process-of-Elimination quota attribution (Jim vs. Nathan).
- [x] Dual-stack visual cockpits and 7-day trend history.

### Phase 2: Multi-Member Family Usage Connection & Attribution Engine (Next Phase)
> **Goal**: Expand Project Reservoir beyond the 2-brother model to ingest, attribute, and visualize all remaining family members sharing the Google One AI Ultra plan.

#### Steps Required for Phase 2:
1. **Multi-Member Profile Registry & Schema**:
   - Refactor `telemetry.json` state schema from static `userName` / `brotherName` keys into an extensible `familyMembers` array containing member IDs, display names, avatars, designated colors, and baseline quota quotas/roles.
2. **Multi-Party Ingestion & Attribution Strategy**:
   - *Direct Discovery / Companion Ping*: Provide optional zero-config local companion beacons or LAN reporting endpoints for family members running Antigravity/Gemini to broadcast their local prompt/step counters.
   - *Calibrated Multi-Party Elimination Math*: For zero-software devices, establish an attribution distribution model (weighted historical ratios or multi-device process-of-elimination) to apportion total Google AI Ultra quota drain across active family accounts.
3. **UI/UX Multi-Gauge Scaling**:
   - Transition the 2-way tug-of-war ratio bar into an **$N$-Member Proportional Stacked Reservoir & Fuel Tank**.
   - Refactor donut charts to support dynamic multi-slice breakdown per family member.
   - Add a Family Usage Leaderboard with individual burn rates (e.g. Eco-Cruise vs. Afterburners) and real evaporated water bottles per person.
4. **Per-Member Dynamic Alerts & Telemetry Broadcast**:
   - Implement per-member warning thresholds and notifications when any specific family member approaches their quota allotment.
   - Integrate multi-member live telemetry broadcast into the Project Dashboard portfolio mind map.
