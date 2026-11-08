# Aura Supabase backend setup

Aura now uses Supabase for authentication, data, Gemini chat, and Octopus
consumption. The old Express server is no longer used by the mobile app.

## 1. Configure the Supabase project

1. Open the Supabase Dashboard and select the Aura project.
2. In Authentication → URL Configuration, set:
   - Site URL: `http://localhost:8083` while developing.
   - Redirect URLs: `http://localhost:8083` and `mobile://auth`.
3. In Authentication → Providers → Email, enable email/password sign-in and
   email confirmation.
4. Copy the Project URL and publishable key to
   `artifacts/mobile/.env`:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Never put a service-role key, Gemini key, or Octopus key in the mobile `.env`.

## 2. Apply the database

With the Supabase CLI authenticated and the project linked:

```bash
pnpm supabase:link
pnpm supabase:push
pnpm gen:types
```

The migrations create profiles, chat history, energy data, RLS policies, and
encrypted Octopus connections. `supabase/seed.sql` contains only safe
development knowledge-base records.

## 3. Set Edge Function secrets

Set these in Dashboard → Edge Functions → Secrets (or with
`supabase secrets set`):

```dotenv
GEMINI_API_KEY=your_new_gemini_key
GEMINI_MODEL=gemini-2.5-flash
```

Octopus API keys are **not** project secrets. Each signed-in user enters their
key in Profile → Octopus Energy. The `octopus-connect` function verifies it and
stores it encrypted in Supabase Vault.

If an API key has ever been pasted into chat, a document, or source control,
rotate it before entering the replacement in Aura.

## 4. Deploy the functions

```bash
supabase functions deploy gemini-chat
supabase functions deploy octopus-connect
supabase functions deploy octopus-consumption
```

All three functions require a valid Supabase user JWT.

## 5. Run locally

```bash
cd artifacts/mobile
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY \
./node_modules/.bin/expo start --web --port 8083
```

Create an account, confirm the email, sign in, then connect Octopus from the
Profile tab. If Octopus is not connected or unavailable, the energy dashboard
uses clearly labelled sample data. Voice recognition remains on-device; only
the recognised text is sent to Gemini.

## Security checks before release

- Confirm RLS tests deny access to another user’s rows.
- Confirm the Expo bundle contains no secret or service-role key.
- Configure production SMTP and production redirect URLs.
- Rotate any exposed Gemini or Octopus keys.
- Review Supabase Security and Performance Advisors after each migration.
