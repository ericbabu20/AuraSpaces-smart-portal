# Aura Spaces — Promo Video Brief for Claude Motion Graphics

Paste everything from **"Prompt for Claude"** downwards into Claude, and attach the
files listed in **Assets to attach**. Claude builds the video as one HTML file that
plays in the browser. Record it to MP4 with the steps in **Exporting to MP4**.

---

## At a glance

| Item | Value |
| --- | --- |
| Product | Aura Spaces, a smart home energy portal |
| Length | 30 seconds (main cut), plus a 15-second cut-down |
| Formats | 16:9 at 1920×1080 (website, LinkedIn, YouTube) and 9:16 at 1080×1920 (Reels, TikTok, Shorts) |
| Frame rate | 60 fps |
| Tone | Calm, premium, warm and confident. Apple-keynote restraint, not a loud ad |
| Call to action | auraspaces-smart-portal.vercel.app |

## Assets to attach

These are all in the project folder (`Aura app replit /`):

| File | Use |
| --- | --- |
| `artifacts/mobile/assets/images/logomark.png` | Animated logo mark (the koi "burst") |
| `artifacts/mobile/assets/images/logo-dark.png` | Full wordmark on dark backgrounds |
| `artifacts/mobile/assets/images/logo.png` | Full wordmark on light backgrounds |
| `artifacts/mobile/assets/hero/house-hero.png` | 3D house with solar panels and an EV, the hero visual |
| Screenshots of the app | Home, Usage card, Aura AI chat and Tariff card. Take them at https://auraspaces-smart-portal.vercel.app, or locally at http://localhost:8081 |

---

## Prompt for Claude

You are a senior motion designer. Build a **30-second product promo for Aura Spaces**
as a single self-contained HTML file. Use HTML, CSS and JavaScript, with GSAP from a
CDN for the timeline. The canvas is 1920×1080. Add a `?format=vertical` URL switch that
re-lays everything out for 1080×1920. Play automatically on load and loop. Add a hidden
keyboard shortcut: **R** restarts, **Space** pauses.

### Brand rules (follow exactly)

**Colours**
- Background (night): `#141412`
- Raised surface / cards: `#1F1E1B`, with a subtle gradient to `#24231F`
- Hairline borders: `rgba(243,239,230,0.08)`
- Primary text: `#F3EFE6`
- Muted text: `#A8A796`
- **Japanese Koi `#D97A43`** is the only action and highlight colour. Use it sparingly:
  the logo, electricity data and the call to action
- Venus Teal `#87A39F`: gas data
- Deep Venus Teal `#5F807B`: EV
- Coffee with Cream `#A88864`: solar
- Duck Willow `#696A5A`: grid and secondary neutral
- Chanoyu cream `#EEE7D2`: an optional light end-card background
- Positive green `#3E9B63`: only for "saving" or "online" indicators
- Never use red.

**Type** (load from Google Fonts)
- Headlines: **Parkinsans** SemiBold or Bold, with tight letter-spacing (−0.02em)
- Body and UI text: **Figtree** Regular, Medium or SemiBold

**Shapes**
- Cards: 28px radius with a hairline border and soft depth (no harsh drop shadows)
- Buttons, toggles and chips: fully pill-shaped (999px radius)
- Bars in charts: slim rounded "pill" bars that sit inside faint tracks

**Motion language**
- Easing: `power3.out` for entrances and `power2.inOut` for transitions. Nothing bouncy
  or elastic
- Entrances: 12–24px upward drift plus fade, staggered 60–90ms
- Numbers count up. Bars grow from the bottom
- A slow ambient koi glow (a radial gradient at 8–12% opacity) breathes behind key
  moments
- Generous negative space, one idea per scene. Hold each headline for at least 1.2s
  so it can be read

### Storyboard (30s)

| # | Time | Visual | On-screen text |
| --- | --- | --- | --- |
| 1 | 0.0–3.0s | Black screen. The koi logomark draws in stroke by stroke from the centre, glows, then the wordmark "aura spaces" slides out beside it | — |
| 2 | 3.0–6.5s | The logo shrinks to the top-left. The 3D house (`house-hero.png`) rises into frame with a slow parallax push-in. Small glass pill labels pop in around it: "Solar · 1.8 kW", "Grid · export", "EV · charging", "Home · 0.6 kW". Thin animated dashed lines show energy flowing between them | **Your home's energy, finally clear.** |
| 3 | 6.5–11.5s | The **Usage card** builds itself: the card fades up, the pill tabs Day / Week / Month appear, and the "Week" pill slides into place. "Electricity 11.7 kWh" and "Gas 22.6 kWh" count up. Seven pairs of pill bars grow left to right (koi for electricity, teal for gas), and today's pair glows | **Electricity and gas. Every day. One view.** |
| 4 | 11.5–17.0s | A chat panel slides in from the right. A user bubble types "How much electricity did I use this week?" Then three typing dots, and the Aura reply streams in word by word: "From 29 Oct to 4 Nov you used 31.6 kWh of electricity." The Aura logomark pulses softly beside the reply | **Ask Aura. Answers from your own data.** |
| 5 | 17.0–21.5s | The EV card: a cable icon, a "£ / kWh" pill toggle flips, the price counts to £5.77, and a "Schedule" pill presses. A small timeline bar highlights an off-peak window, 00:30–04:30 | **Charge when it's cheapest.** |
| 6 | 21.5–25.5s | The Tariff card: "Octopus Go" with three tariff lines. A koi pill button "Compare other suppliers" gets a soft press animation | **See your tariff. Compare in a tap.** |
| 7 | 25.5–30.0s | Every card slides back and stacks into a laptop-and-phone mockup showing the dashboard. It fades to the centred logo on night, then the URL types in beneath | **Aura Spaces — smarter energy at home.** · `auraspaces-smart-portal.vercel.app` |

### 15-second cut-down

Use scenes 1 (shortened to 1.5s), 2, 3 and 4, then the end card from scene 7
(2.5s). Keep the same headlines.

### Vertical (9:16) layout notes

- Stack the text above the visuals. Headlines go in the top third, at 64–72px
- Scale the cards to about 88% of the width and centre them
- Keep everything inside a 120px safe margin at the top and bottom, so platform
  buttons don't cover it

### Audio (optional; leave as a placeholder)

- Add an `<audio>` element pointing to `music.mp3`. It should be warm, minimal
  electronic music at about 100 BPM, swelling at scene 7
- Sync cues: soft UI "ticks" on pill toggles, and a gentle whoosh on card entrances
- The video must also make sense with the sound off, because most social viewers
  watch muted

### Accuracy rules

- The figures shown are **illustrative**. Put a tiny footnote on the end card:
  "Figures shown are illustrative."
- Do not promise or guarantee savings. Avoid "save £X" claims. Use "see", "understand",
  "compare" and "plan" instead
- Name only Octopus Energy as the meter connection (it's the supported integration),
  and do not use other companies' logos

### Deliverable

1. One `aura-promo.html` file containing everything, with images loaded from relative
   paths (`./logomark.png`, `./logo-dark.png`, `./house-hero.png`)
2. A short note listing the scene start times, so they can be fine-tuned
3. A `?scene=N` URL option that jumps straight to a scene, for review

---

## Exporting to MP4

**Option A: screen record (quickest)**
1. Put `aura-promo.html` and the image files in one folder, then open the HTML in Chrome.
2. Make the window full-screen (Cmd+Ctrl+F) and press **R** to restart the video.
3. Record with QuickTime: **File → New Screen Recording**, select the browser area,
   and stop after 30 seconds.
4. Trim the recording in QuickTime: **Edit → Trim**.

**Option B: frame-perfect render**
Ask Claude: *"Convert this into a Remotion project (1920×1080, 60fps, 30s) with the
same timeline."* Then render it with `npx remotion render`. This gives a sharp,
smooth MP4 with no dropped frames.

## Review checklist

- [ ] Koi `#D97A43` is the only highlight colour, and there's no red
- [ ] Headlines are in Parkinsans and UI text is in Figtree
- [ ] Every button and toggle is pill-shaped
- [ ] Each headline stays on screen for at least 1.2 seconds
- [ ] The video makes sense with the sound off
- [ ] The end card shows the logo, the URL and the "illustrative figures" footnote
- [ ] The vertical version keeps everything inside the safe margins
