---
name: Octopus Energy API integration
description: Non-obvious facts about pulling consumption data from the Octopus Energy API
---

# Octopus Energy consumption API

- **Auth:** HTTP Basic with the API key as the username and an empty password. Key format is `sk_live_...`.
- **Data lags ~1–2 days and has no real-time reading.** The most recent day(s) returned by `group_by=day` are usually partial (a tiny fraction of a full day, e.g. 0.06 kWh). Trim trailing partial days before showing headline figures or charts, or the latest day looks broken.
- **Gas units:** this account's gas meter returns consumption in **m³**, not kWh. Convert to kWh with factor ~11.1868. **Why:** verified empirically — raw daily gas ~0.8–2 m³ → ~9–22 kWh after conversion (realistic for summer hot water); if it were already kWh, conversion would give an impossible ~100–250 kWh/day. Controlled by env `OCTOPUS_GAS_UNITS` (`m3` enables conversion) and `OCTOPUS_GAS_M3_TO_KWH`.
- **How to apply:** if gas values ever look ~10× too high or too low, re-check whether the meter switched to reporting kWh and flip `OCTOPUS_GAS_UNITS`.
