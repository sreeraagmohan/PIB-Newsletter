# PIB Alerts

> AI-filtered email alerts for Indian government press releases. Claude scores every release on significance; only the ones that genuinely matter interrupt your day.

**Live:** [sreeraagmohan.github.io/pib-releases](https://sreeraagmohan.github.io/pib-releases)

<!-- Add a screenshot or short clip of a breaking alert email or the subscribe page here.
     A single PNG saved as `docs/preview.png` and embedded with
     `![preview](docs/preview.png)` does more than three paragraphs of text. -->

---

## Why I built this

I write [The Bharat Briefing](https://thebharatbriefing.com), a daily newsletter on India's politics and policy. Every day, India's Press Information Bureau publishes a firehose of releases — dozens of scheme launches, award ceremonies, and event announcements — and somewhere in that pile is the one that actually matters: a tariff change, an RBI decision, a bilateral summit, a defence agreement. Keeping up by manually reading the feed was a slog. I built PIB Alerts to do the triage for me.

## The design choice

The interesting decision here isn't the pipeline — it's the role I gave the AI.

I didn't use Claude to *write* anything. I used it as a **relevance judge**. Every incoming release gets scored 1–10 on significance against an editorial rubric I wrote into the prompt. Anything 7+ triggers a breaking email within 30 minutes; everything else rolls up into a single 8 PM digest. Headlines are extracted from the source release — never invented.

That distinction matters for a policy newsletter. If the AI hallucinates a story, that's a reputational hit on TBB. If the AI under- or over-scores a release, the worst case is an extra email or a missed one — and the prompt can be recalibrated against actual decisions. Keeping editorial judgment *separable from* and *auditable against* the output is the whole point.

The hard part wasn't the code. It was encoding *what counts as important* into a scoring rubric the model could apply consistently.

## How it works

```
PIB RSS feeds  →  GitHub Actions (cron: every 30 min)
                        ↓
                 Claude API  — scores 1–10, extracts headline
                        ↓
                 Supabase    — stores articles + subscribers
                        ↓
            score ≥ 7  →  email   →  breaking alert
            8 PM IST   →  email   →  daily digest
```

## What gets flagged as significant (score ≥ 7)

- Head-of-state diplomatic activity — bilateral visits, joint statements, MoUs signed
- Trade deals, tariffs, RBI decisions, major budget items
- Defence agreements, military exercises, arms procurement
- Diplomatic incidents, expulsions, sanctions, major foreign-policy shifts
- Cabinet decisions with significant national economic impact
- G20, SCO, BRICS, UN, WTO multilateral outcomes

Routine administrative releases (scheme launches, award ceremonies, event announcements) score below 7 and are stored but don't interrupt.

## Stack

| Layer | Choice |
|---|---|
| Cron | GitHub Actions — every 30 min |
| Relevance filter / scoring | Anthropic Claude API |
| Database | Supabase (Postgres) |
| Email | Gmail SMTP (via App Password) |
| Frontend | Static site, GitHub Pages |

The whole thing was deliberately built on free tiers — Claude API runs roughly **$0.01–0.05 a day**, everything else is free. Total monthly cost is under a dollar.

---

<details>
<summary><b>Deployment guide</b> — one-time setup, ~25 minutes</summary>

### 1. Claude API key
Sign up at [console.anthropic.com](https://console.anthropic.com) → create an API key → add $5 of credits (lasts months).

### 2. Supabase project
1. Sign up at [supabase.com](https://supabase.com) → new project
2. SQL Editor → paste and run `supabase/schema.sql`
3. Settings → API → copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY` *(secret — keep server-side)*

### 3. Gmail App Password
1. [myaccount.google.com → Security](https://myaccount.google.com/security) — make sure 2-Step Verification is on
2. Search **App Passwords** → create one (name it "PIB Alerts")
3. Copy the 16-character password

### 4. Frontend config
Open `public/config.js` and paste your Supabase URL and anon key.

### 5. Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/pib-alerts.git
git push -u origin main
```

### 6. Repository secrets
Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `SUPABASE_URL` | From Supabase → Settings → API |
| `SUPABASE_SERVICE_KEY` | Service role key (not the anon key) |
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | The 16-char App Password from step 3 |
| `SITE_URL` | e.g. `https://YOUR_USERNAME.github.io/pib-alerts` |

### 7. Enable GitHub Pages
Repo → **Settings → Pages** → source: Deploy from a branch → branch `main`, folder `/public` → Save.

### 8. Update manifest paths
In `public/manifest.json`, update `start_url` and `scope` to `/pib-alerts/`. Unsubscribe links in emails are built from `SITE_URL` automatically.

### 9. Test
**Actions → Fetch PIB Releases → Run workflow** — runs immediately without waiting for the cron. Check the log to confirm articles are being fetched and classified.

### RSS feed URLs
PIB exposes per-ministry RSS feeds. Defaults in `scripts/fetch-and-classify.js` cover PMO, MEA, Finance, and Defence. If PIB changes their URL structure, update `PIB_RSS_FEEDS`. Find more ministry feeds at [pib.gov.in](https://pib.gov.in).

### Keeping the Actions alive
GitHub pauses scheduled workflows after **60 days of repo inactivity**. A small commit (e.g., a README edit) re-enables them.

</details>

---

*Built by [Sreeraag Mohan](https://github.com/sreeraagmohan) — feeds [The Bharat Briefing](https://thebharatbriefing.com).*
