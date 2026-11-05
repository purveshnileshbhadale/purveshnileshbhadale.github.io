# purveshnileshbhadale.github.io

Personal site of **Purvesh Nilesh Bhadale** — live at
<https://purveshnileshbhadale.github.io/>.

Class 12 (PCM) student in Pune, India, building AI tools for students. This site is the
evidence: four featured projects, smaller builds, a competition entry, and a timeline.

## How it's built

Hand-written, no framework, no build step, no dependencies.

```
index.html            the site
404.html              GitHub Pages fallback
assets/css/style.css  the whole design system (~1,000 lines, unminified)
assets/js/site.js     theme, command palette, active nav, reveals (~7 KB)
assets/fonts/         self-hosted woff2, latin subset (116 KB total)
assets/img/favicon.svg
knowledge.md          source of truth for the planned "ask about Purvesh" agent
```

- **Type:** Instrument Serif (display) + IBM Plex Sans (text) + IBM Plex Mono (labels).
  Self-hosted, `font-display: swap`, two faces preloaded.
- **Theme:** light and dark, follows the system by default, remembers a manual choice,
  applied before first paint so there's no flash.
- **Palette:** `⌘K` / `Ctrl K` / `/` opens a keyboard-driven jump menu.
- **Accessibility:** skip link, landmarks, visible focus rings, AA contrast, reduced-motion
  support, no keyboard traps.
- **No analytics, no cookies, no third-party requests.**

## Deploying

Push to `main`. GitHub Pages serves the repo root; no workflow needed.

```bash
git add -A
git commit -m "…"
git push
```

## Google Search

Everything a crawler needs is already in place:

| File | Purpose |
| --- | --- |
| `robots.txt` | allows everything, points to the sitemap |
| `sitemap.xml` | the single canonical URL, with `lastmod` |
| `<link rel="canonical">` | resolves duplicate/preview URLs to one address |
| `index, follow, max-image-preview:large` | allows full-size image previews in results |
| JSON-LD `@graph` | `Person` + `ProfilePage` + `WebSite`, so Google can build a knowledge panel |
| `assets/img/og-cover.png` | 1200×630 social card, source in `assets/og/og-card.html` |

### Steps to submit

1. **Verify ownership.** Go to <https://search.google.com/search-console> → *Add property*
   → *URL prefix* → `https://purveshnileshbhadale.github.io/`.
   Choose the **HTML tag** method, copy the token, and paste it into the commented
   `google-site-verification` line in `index.html`. Commit and push, then click **Verify**.
   (The *HTML file* method also works: drop the file it gives you in the repo root.)
2. **Submit the sitemap.** In Search Console → *Sitemaps* → enter `sitemap.xml` → Submit.
3. **Request indexing.** *URL Inspection* → paste the homepage → *Request indexing*.
   First crawl usually takes a few days; ranking takes weeks.
4. **Check for issues** under *Page indexing* after 48 hours.

### After the first deploy

- Re-submit the sitemap only when the URL changes; `lastmod` in `sitemap.xml` should be
  bumped when content changes (Google ignores `changefreq`/`priority`, but they do no harm).
- If you later buy a custom domain, update `canonical`, `og:url`, `og:image`, the JSON-LD
  `@id`s, `robots.txt` and `sitemap.xml` together — a mismatch splits ranking signals.

## Theme in a URL

`?theme=light` or `?theme=dark` forces a mode without touching the visitor's saved
preference. Useful for screenshots, OG cards, and sharing a specific look.

## Custom domain

To move off `*.github.io`, buy a domain and point it here:

1. Create a file named `CNAME` in the repo root containing only the bare domain, e.g.
   `purveshbhadale.com`.
2. At the DNS provider add the records GitHub documents:
   - apex (`@`): four `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `www`: `CNAME` → `purveshnileshbhadale.github.io`
3. In **Settings → Pages**, set the custom domain and tick **Enforce HTTPS**
   (the certificate is issued after DNS resolves, usually within an hour).

## The "ask about Purvesh" agent

Built, but **not live** — GitHub Pages cannot run server-side code, and a key in the browser is
readable by anyone. The model is called only from `api/chat.js`, which reads `GROQ_API_KEY`
from the deployment environment.

```
api/chat.js        POST /api/chat · reads knowledge.md · rate limited · CORS pinned
assets/js/agent.js stays hidden unless the endpoint is deployed and answering
knowledge.md       the only context the model gets
```

### Turning it on

1. Rotate the key you pasted into chat (it was public). Create a new one at
   <https://console.groq.com/keys>.
2. Deploy this repo to Vercel:
   ```bash
   npx vercel --prod
   ```
   Add `GROQ_API_KEY` in **Project → Settings → Environment Variables** (Production + Preview).
   Never add it to a `.env` file that gets committed — `.gitignore` covers `.env*` already.
3. Copy the deployment URL and set it in `index.html`:
   ```html
   <div class="agent" data-agent-endpoint="https://your-app.vercel.app/api/chat" hidden>
   ```
4. Commit and push to `main`. The panel reveals itself only after a successful health
   check, so the public site never shows a dead widget.

The site can stay on GitHub Pages; the page-specific CORS list in `api/chat.js` already
allows `https://purveshnileshbhadale.github.io`.

### Guardrails that are in place

- Answers only from `knowledge.md`; anything else returns "I don't know".
- 500-character questions, 6-turn history, 260 output tokens.
- 8 requests per 5 minutes per IP (in-memory, per instance — move to Upstash if traffic grows).
- 20-second upstream timeout, `no-store` responses, error details logged server-side only.

## Remaining TODOs

Visible on the site by design. Search `TODO` in `index.html`:

- identity line and role confirmation
- proof for Li-Fi, VEDA, SCHOLARS, VAYU (photo, demo, screenshot, real number)
- repo links for Deeps Guruwariya, DeepHelper, SmartPath AI, GamerzHub
- Claurst upstream link; what he changed in DeepHelper; what works in VAYU
- timeline start months
- IJRPR papers decision
- plug in the chatbot endpoint (see below)
