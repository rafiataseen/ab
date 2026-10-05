# Workshop Launchpad — PRD

## Original Problem Statement
Full-stack landing page for a free online workshop "Build Your First AI Project in 60 Minutes", aimed at final-year engineering students in India. React + FastAPI + MongoDB, mobile-first (WhatsApp traffic), fast load. Dark navy + electric accent, Plus Jakarta Sans. Single config file for WORKSHOP_DATE_TIME, WHATSAPP_COMMUNITY_LINK, REGISTRATION_TARGET. Sections: hero (countdown + live seats counter), why-care cards, 4-step timeline, who-is-it-for, FAQ accordion, sticky mobile register bar. Registration modal with college autocomplete, duplicate prevention, ?src= / ?ref= tracking, referral codes, /thank-you page with WhatsApp + Google Calendar buttons. SEO meta + OG tags for WhatsApp link previews.

## Architecture
- **Backend** `/app/backend/server.py` — FastAPI + Motor (MongoDB). Endpoints: `POST /api/register` (validation, duplicate check by email/phone → 409, 6-char referral code), `GET /api/stats` (count + target), `GET /api/colleges?q=` (autocomplete from prior registrations). `REGISTRATION_TARGET` read from `backend/.env`.
- **Frontend** — React (CRA/craco), Tailwind + shadcn/ui, framer-motion (masked hero reveal, scroll reveals), lenis smooth scroll. Pages: `/` landing, `/thank-you`.
- **Config (single file)** — `/app/frontend/src/config.js`: WORKSHOP_DATE_TIME (2026-10-10 14:00 IST), WORKSHOP_END_TIME, WORKSHOP_DATE_LABEL, WHATSAPP_COMMUNITY_LINK (PLACEHOLDER — user must paste real invite link), REGISTRATION_TARGET, GOOGLE_CALENDAR_URL (auto-derived).
- **SEO** — static head in `public/index.html` (title, description, OG, Twitter, EducationEvent + FAQPage JSON-LD, SVG favicon, noscript fallback), `public/robots.txt`, `public/llms.txt`. Canonical/og:image/og:url omitted — no confirmed production domain yet.

## User Personas
- Final-year engineering student (any branch) in India, arriving from a WhatsApp share link on a phone, placement-anxious, beginner to AI.
- Workshop organizer sharing tracked links (`?src=whatsapp_<college>`) and collecting referrals (`?ref=CODE`).

## Implemented (2026-10-05)
- Full landing page: kinetic hero with masked line reveal, live countdown, live seats counter + animated progress bar (polls `/api/stats` every 30s), campus marquee, why-care cards, 60-minute blueprint timeline, who-is-this-for, FAQ accordion, sticky mobile register bar, footer.
- Registration modal: full name, college autocomplete (static popular list + server suggestions from DB), branch + grad-year selects (default 2026 Final Year), +91 WhatsApp number (10-digit Indian validation), email validation, hidden source/referred_by capture from URL + sessionStorage persistence.
- Duplicate prevention (email/phone) with friendly 409 message; referral code generated per registration; success → `/thank-you?code=XXXXXX`.
- **Referral system (2026-10-05)**: `GET /api/referrals/{code}` returns first name, live referral count and tier reached (thresholds from `REFERRAL_TIER_THRESHOLDS` in backend/.env, names in frontend `REWARD_TIERS` config). Valid ref codes attach `referred_by`; invalid codes ignored silently; self-referral (same email/phone) blocked; referrals only count unique email+phone (duplicates can't register). Rate limit: 10 registrations/min per IP (429 after). Thank-you page: works from `?code=` alone (fetches name/count from API, polls 15s), personal referral link + copy, pre-filled Share on WhatsApp button, "You've brought in X friends", reward-tier progress bar (3/5/10), WhatsApp community + calendar buttons.
- **Leaderboard (2026-10-05)**: public `/leaderboard` page, auto-refresh 30s. `GET /api/leaderboard` returns Top Colleges (top 15, Mongo aggregation grouping by lower(trim(college)) so casing/whitespace variants merge) and Top Referrers (first name + last initial only, no contact data). Banner CTA, per-college WhatsApp share button (`?src=college_{slug}`), progress bars relative to leader. Linked from landing nav and thank-you page.
- **Project Matcher (2026-10-05)**: `/project-matcher` 3-step quiz (branch → interest → coding comfort, one question per screen). `POST /api/project-idea` calls OpenAI gpt-5.4 via EMERGENT_LLM_KEY (emergentintegrations, streamed + accumulated, 30s timeout) returning structured JSON {title, description, steps[3], recruiter_line}; falls back to 8 hardcoded ideas (interest × comfort matrix) on any failure, flagged via `source: "ai"|"fallback"`. Quiz completions counted in `db.quiz_stats` (count only). Result card + "Share my project idea" WhatsApp button + "Reserve your free seat" CTA linking to `/?src=..&ref=..&register=1` — landing auto-opens the registration modal on `register=1` and preserves src/ref tracking.
- Verified: API curl tests (register/duplicate/validation/stats/colleges, referral chain 3 friends → count 3 tier 3, invalid ref ignored, self-ref 409, unknown code 404, 11th rapid request 429, leaderboard grouping "IIT Bombay"/"iit bombay"/" IIT BOMBAY " merged into one row, project-idea returned real LLM JSON twice), UI checks via Playwright (landing flow, thank-you ?code=, leaderboard desktop+mobile, quiz 3-question flow → result card → CTA auto-opens modal with tracking params, privacy: no emails/phones rendered). Test registrations deleted after each run; quiz counter reset to 0.

## Pending / Backlog
- **P0 — User action**: paste real WhatsApp community invite link into `src/config.js` (currently placeholder).
- **P1**: Canonical URL + og:image share card (needs confirmed production domain); enable bot-prerender toggle at deploy.
- **P1**: Admin/organizer view of registrations (list, export CSV, per-source stats).
- **P2**: Confirmation email via Resend; WhatsApp reminder before the session; seats-full behaviour toggle (currently registrations stay open past 500); referral leaderboard.

## Next Tasks
1. User provides WhatsApp community link → drop into config.
2. Deploy + verify OG preview on live domain (WhatsApp caches cards aggressively).
3. Optionally add organizer dashboard for registrations export.
