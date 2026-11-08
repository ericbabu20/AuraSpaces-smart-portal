---
name: Expo package install fix
description: How to unblock expo/react-native package installs when package-firewall returns 502
---

The Replit package-firewall (`http://package-firewall.replit.local/npm/`) consistently returns 502 Bad Gateway for expo, react-native, and their ecosystem packages. This blocks `pnpm install` for the mobile artifact.

**Fix:** Add `registry=https://registry.npmjs.org` to the workspace root `.npmrc`:

```
auto-install-peers=false
strict-peer-dependencies=false
registry=https://registry.npmjs.org
```

**Why:** The package-firewall proxy doesn't have the expo/react-native ecosystem cached. The `minimumReleaseAge` exclusion list in `pnpm-workspace.yaml` was also extended to include expo/react-native packages (though this alone didn't fix the 502 — the registry override was required).

**How to apply:** Whenever adding the mobile Expo artifact to a fresh workspace, or when `pnpm install` fails with 502 for expo packages, ensure `.npmrc` has the public registry line. The packages get cached in the pnpm store after the first successful install, so subsequent installs work fine.

**Note:** The `pnpm-workspace.yaml` `minimumReleaseAgeExclude` list was also extended to include the full expo/react-native/typescript ecosystem — keep this in place as a secondary measure.
