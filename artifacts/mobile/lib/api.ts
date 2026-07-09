import { setBaseUrl } from "@workspace/api-client-react";

// In development the Expo dev script sets EXPO_PUBLIC_DOMAIN to the Replit dev
// domain, which routes /api to the api-server through the shared proxy. The
// generated client paths already include the /api prefix, so we only need the
// origin here.
// For local development you can point the app at a locally running api-server
// by setting EXPO_PUBLIC_API_URL (e.g. http://localhost:5057). This takes
// precedence over the Replit proxy domain used in the hosted dev environment.
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const domain = process.env.EXPO_PUBLIC_DOMAIN;
if (apiUrl) {
  setBaseUrl(apiUrl);
} else if (domain) {
  setBaseUrl(`https://${domain}`);
}
