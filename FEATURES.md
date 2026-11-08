# Aura Spaces — Feature Documentation

Aura Spaces is a smart-home energy assistant delivered as an Expo (React Native) mobile app. It shows **real electricity and gas consumption** pulled from the user's Octopus Energy account, alongside smart-device controls, automation, scheduling, and an AI assistant called **Aura**.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Energy Data Integration](#energy-data-integration)
3. [Mobile App — Tab Screens](#mobile-app--tab-screens)
4. [Mobile App — Feature Screens](#mobile-app--feature-screens)
5. [System-Wide Features](#system-wide-features)
6. [Backend (API Server)](#backend-api-server)
7. [Configuration & Secrets](#configuration--secrets)

---

## Architecture Overview

A pnpm monorepo with three artifacts:

| Artifact | Tech | Purpose |
| --- | --- | --- |
| `artifacts/mobile` | Expo / React Native / expo-router | The Aura Spaces mobile app |
| `artifacts/api-server` | Express 5 | Backend that talks to Octopus Energy and keeps the API key server-side |
| `lib/api-spec` | OpenAPI + Orval | Contract-first API spec; generates typed React Query hooks and Zod schemas |

- **Contract-first API:** the OpenAPI spec (`lib/api-spec/openapi.yaml`) is the source of truth. Codegen produces the React Query hooks the mobile app uses and the Zod schemas the server validates with.
- **Security:** the Octopus API key never reaches the device — the mobile app calls the Express server through the shared proxy, and the server holds the credential.

---

## Energy Data Integration

The core of Aura Spaces is its connection to the **Octopus Energy API**.

- **Live electricity & gas consumption** fetched per-fuel for a configurable window (1–31 days, default 7).
- **Daily grouping:** smart-meter half-hourly readings are grouped into daily totals server-side.
- **Gas unit conversion:** the gas meter reports in m³, which is converted to kWh server-side (factor 11.1868, configurable).
- **Trailing partial-day trim:** smart-meter data lags ~1–2 days and the most recent day is usually incomplete, so the trailing partial/lagging day is dropped server-side. Headline numbers and charts therefore only ever show **complete** days.
- **Graceful fallback:** if live meter data is unavailable, the app falls back to a built-in sample dataset and clearly labels it ("Showing sample data — live meter data unavailable").
- **Aligned series:** electricity and gas are joined onto a single date axis so the charts always have matching lengths and labels, even if one fuel has a gap.
- **Historical vs. live:** Octopus data is historical (no real-time reading). The device-based "Active Now" view is a separate live simulation of currently-drawing devices.

---

## Mobile App — Tab Screens

The app uses a bottom tab bar with five primary sections.

### Home (`index.tsx`)
- **Energy Ring** — central dial showing today's electricity usage (kWh) against a daily target (7.4 kWh), with a percentage and color that shifts as usage approaches the target. Labelled "kWh today" to reflect the latest complete day.
- **Stat cards** — gas usage (kWh), total money saved (£), and carbon offset (kg CO₂).
- **Quick actions** — "Ask Aura" (AI chat) and "Tips" (recommendations).
- **Active Now** — horizontal scroll of devices currently drawing power with live wattage.
- **Quick Access grid** — shortcuts to Thermostat, Schedule, Automation, and Savings.

### Devices (`devices.tsx`)
- **Category filters** — All, Climate, Lighting, Appliance, EV.
- **Device cards** — name, room, and a power toggle for each device.
- **Smart links** — tapping the thermostat opens the dedicated thermostat control screen.
- **Add device** — header button launches the Connect Device flow.

### Insights (`insights.tsx`)
- **Weekly summary cards** — Electricity, Gas, and Total usage over the last 7 days.
- **Daily Usage chart** — grouped bar chart comparing daily electricity vs. gas.
- **Usage by Time of Day** — breakdown into four 6-hour segments.
- **Aura Tip** — contextual AI-driven advice based on usage patterns.
- **Top Consumers** — devices contributing most to total energy draw.
- **Sample-data note** — shown when live meter data is unavailable.

### Activity (`activity.tsx`)
- **Savings summary** — monthly money saved and CO₂ offset.
- **Event feed** — recent events categorized and color-coded by type:
  - `device` (blue) — manual changes, e.g. thermostat adjustment.
  - `automation` (purple) — system-triggered actions, e.g. peak-hour eco mode.
  - `savings` (green) — milestones, e.g. savings from shifting EV charging.
  - `alert` (yellow) — system updates, e.g. bill estimates.

### Profile (`profile.tsx`)
- **User info** — name, email, avatar.
- **Plan details** — "Green Home Pro" time-of-use rate plan, estimated bill, cumulative savings and offsets.
- **Preferences** — Notifications, Dark Mode, Units, Location.
- **Account** — Privacy, Terms, Help, Sign Out.

---

## Mobile App — Feature Screens

### Aura AI Chat (`aura.tsx`)
- Conversational chat interface with the "Aura" assistant.
- Answers questions about reducing bills, controlling devices, and analyzing power draw.
- Quick-tap sample prompts for common queries.

### Thermostat Control (`thermostat.tsx`)
- Interactive circular SVG dial (16°C–30°C).
- Mode selection: Cool, Heat, Fan, Off — color-coded.
- Large +/- buttons with haptic feedback.
- Daily schedule view (Wake, Day, Evening, Sleep).

### Automation (`automation.tsx`)
- Rule list: Peak Hours Eco Mode, Away Mode, EV Night Charging, etc.
- Each rule shows its "When" (trigger) and "Then" (action) logic.
- Summary card with active rule count and estimated passive monthly savings.

### Schedule (`schedule.tsx`)
- Weekly overview row highlighting the current day.
- Appliance scheduling cards (e.g. Dishwasher 9:00 PM–10:30 PM).
- Per-card day pips showing which days a schedule is active.

### Connect Device (`connect.tsx`)
- Search bar for brands/devices.
- Guided category + brand selection (Nest, Philips Hue, Tesla, Samsung, etc.).
- QR / Matter code scanning for instant integration.

---

## System-Wide Features

- **Currency** — fixed to GBP (£) across all screens.
- **Light / Dark mode** — adaptive theming via `useColorScheme` and a custom `useColors` hook; translucent surfaces (BlurView on iOS) and semantic colors.
- **Local persistence** — device power states, thermostat settings, and modes persist locally via `AsyncStorage`.
- **Typed data layer** — energy data flows through generated React Query hooks from `@workspace/api-client-react`.

---

## Backend (API Server)

Express 5 server that brokers the Octopus Energy connection.

- **`GET /api/consumption/electricity`** — daily electricity totals (kWh).
- **`GET /api/consumption/gas`** — daily gas totals, converted m³ → kWh.
- Both accept a `days` query parameter (1–31, default 7).
- Responses are validated against generated Zod schemas before being returned.
- Octopus client (`src/lib/octopus.ts`) handles Basic auth, daily grouping, gas conversion, and trailing-partial-day trimming.

---

## Configuration & Secrets

| Name | Type | Purpose |
| --- | --- | --- |
| `OCTOPUS_API_KEY` | secret | Octopus API key (`sk_live_...`) |
| `OCTOPUS_ELECTRICITY_MPAN` | env | Electricity meter point number |
| `OCTOPUS_ELECTRICITY_SERIAL` | env | Electricity meter serial |
| `OCTOPUS_GAS_MPRN` | env | Gas meter point number |
| `OCTOPUS_GAS_SERIAL` | env | Gas meter serial |
| `OCTOPUS_GAS_UNITS` | env | `m3` enables m³→kWh conversion |
| `OCTOPUS_GAS_M3_TO_KWH` | env (optional) | Override conversion factor (default 11.1868) |

> The API key stays server-side only; the mobile app reaches the server through the shared proxy.
