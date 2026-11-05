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
| `assets/img/og-cover.jpg` | 1200×630 social card with portrait, source in `assets/og/og-card.html` |

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

## The "ask about Purvesh" agent — live

GitHub Pages cannot run server-side code, and a key in the browser is readable by
anyone, so the site stays static on Pages and the model is called only from
`api/chat.js`, deployed as a Vercel function. The key lives in Vercel's environment
and never touches the repository.

```
api/chat.js        POST /api/chat · reads knowledge.md · rate limited · CORS pinned
assets/js/agent.js reveals the panel only after the endpoint answers a health check
knowledge.md       the only context the model gets (built from his application documents)
```

- Endpoint: `https://purveshnileshbhadale.vercel.app/api/chat`
- Provider: OpenRouter (`OPENROUTER_API_KEY`, stored encrypted in Vercel Production).
- Model: free-tier only (`OPENROUTER_MODEL`, comma-separated fallback list — free pools
  rate-limit upstream in waves, so the function walks the list until one answers).
  Default: `nvidia/nemotron-3.5-lightning:free,google/gemma-4-31b-it:free,openrouter/free`.
- The Vercel deployment also serves the site, but sends `X-Robots-Tag: noindex` so only
  the GitHub Pages URL ranks.

### Changing it

1. `knowledge.md` is the single source of truth — edit it, then redeploy:
   ```bash
   npx vercel --prod
   ```
2. To rotate the model key: `vercel env rm OPENROUTER_API_KEY production`, then
   `vercel env add OPENROUTER_API_KEY production` and redeploy. Never commit a key —
   `.gitignore` already covers `.env*` and `.vercel/`.
3. The endpoint URL lives in one place in `index.html`:
   ```html
   <div class="agent" data-agent-endpoint="https://purveshnileshbhadale.vercel.app/api/chat" hidden>
   ```
   If the function is ever down, the panel hides itself again — the public site never
   shows a dead widget.

### Guardrails that are in place

- Answers only from `knowledge.md`; anything else returns "I don't know".
- Private facts (phone, address, date of birth, family, passport, funding) are not in
  `knowledge.md` at all, and the prompt refuses them on principle.
- 500-character questions, 6-turn history, 260 output tokens.
- 8 requests per 5 minutes per IP (in-memory, per instance — move to Upstash if traffic grows).
- 20-second upstream timeout, `no-store` responses, error details logged server-side only.
- OpenRouter free tier: 50 requests/day on free models — enough for a portfolio, not
  for traffic. Watch the usage dashboard before an application deadline week.

## Remaining TODOs

Visible on the site by design — 25 markers, all found by searching `TODO` in `index.html`:

- **Identity (2):** confirm the hero line; confirm the role line (Founder / Co-Founder, B2C Solution Tech Co.)
- **About (1):** one pass so the paragraph sounds like him, not like a website
- **Li-Fi (3):** parts list (emitter, receiver, amplification); photo / video / circuit diagram; what broke and what he'd do differently
- **VEDA (2):** screenshot or demo plus one real result from a real query; what the knowledge graph changed about how he reads papers
- **SCHOLARS (4):** confirm the "Built" description matches the repo; link or exact count for the dataset; live link, screenshot, real test users; the "the hard part was the data" line
- **VAYU (3):** which features work today vs. are stubs; 60-second demo video; what memory does to latency / why plugins were harder than the model
- **Credits & repos (4):** repo links for Deeps Guruwariya and DeepHelper; Claurst upstream link; one line on what he changed in DeepHelper
- **Status (3):** repo link and current status for the remaining builds (SmartPath AI, GamerzHub, one more)
- **Writing (1):** decide whether to list the two IJRPR papers (July 2026) with the venue named honestly, or leave them out
- **Timeline (2):** start month for each entry; add the final shortlist only when it's decided

Plus one non-visible item: plug in the chatbot endpoint (see below).
