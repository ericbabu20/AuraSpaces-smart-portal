# Aura Spaces

A smart-home energy assistant (Expo mobile app) that shows real electricity and gas consumption from the user's Octopus Energy account, alongside smart-device controls.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for the API contract; run codegen after edits.
- `artifacts/api-server/src/lib/octopus.ts` — Octopus Energy client (auth, daily grouping, gas m³→kWh, trailing-partial-day trim).
- `artifacts/api-server/src/routes/consumption.ts` — `/api/consumption/electricity` and `/api/consumption/gas`.
- `artifacts/mobile/lib/api.ts` — sets the API base URL for the generated client (uses `EXPO_PUBLIC_DOMAIN`); imported in `app/_layout.tsx`.
- `artifacts/mobile/context/EnergyContext.tsx` — fetches consumption via generated hooks; exposes electricity/gas today + weekly arrays.

## Architecture decisions

- Octopus consumption is historical (smart-meter data lags ~1–2 days, no real-time reading). Daily totals/charts use the latest **complete** day; the device-based "Active Now" view is a separate live simulation.
- Gas is fetched in m³ and converted to kWh server-side (factor 11.1868, configurable via `OCTOPUS_GAS_M3_TO_KWH`; toggle with `OCTOPUS_GAS_UNITS`).
- The trailing incomplete day is trimmed server-side so headline figures don't show near-zero partial days.
- The mobile app talks to `api-server` through the shared proxy; the Octopus API key stays server-side only.

## Product

- Home: electricity ring vs daily target, gas/saved/CO₂ stat cards, device controls, quick access.
- Insights: weekly electricity-vs-gas bar chart with electricity/gas/total summaries.

## User preferences

- Currency is shown in £ (GBP).

## Gotchas

- Required secret: `OCTOPUS_API_KEY` (Octopus `sk_live_...`). Required shared env: `OCTOPUS_ELECTRICITY_MPAN`, `OCTOPUS_ELECTRICITY_SERIAL`, `OCTOPUS_GAS_MPRN`, `OCTOPUS_GAS_SERIAL`, `OCTOPUS_GAS_UNITS`.
- After editing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` before typechecking consumers.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
