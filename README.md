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
