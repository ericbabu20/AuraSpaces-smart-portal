import { setBaseUrl } from "@workspace/api-client-react";

// In development the Expo dev script sets EXPO_PUBLIC_DOMAIN to the Replit dev
// domain, which routes /api to the api-server through the shared proxy. The
// generated client paths already include the /api prefix, so we only need the
// origin here.
const domain = process.env.EXPO_PUBLIC_DOMAIN;
if (domain) {
  setBaseUrl(`https://${domain}`);
}
