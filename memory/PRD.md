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
- Duplicate prevention (email/phone) with friendly 409 message; referral code generated per registration; success → `/thank-you` with name, referral code, copy invite link, WhatsApp community + Google Calendar buttons, prep checklist.
- Verified: API curl tests (register/duplicate/validation/stats/colleges), full UI flow via Playwright (modal → submit → thank-you), viewports 375/768/1366, DB document structure. Test registrations deleted — counter starts at 0.

## Pending / Backlog
- **P0 — User action**: paste real WhatsApp community invite link into `src/config.js` (currently placeholder).
- **P1**: Canonical URL + og:image share card (needs confirmed production domain); enable bot-prerender toggle at deploy.
- **P1**: Admin/organizer view of registrations (list, export CSV, per-source stats).
- **P2**: Confirmation email via Resend; WhatsApp reminder before the session; seats-full behaviour toggle (currently registrations stay open past 500); referral leaderboard.

## Next Tasks
1. User provides WhatsApp community link → drop into config.
2. Deploy + verify OG preview on live domain (WhatsApp caches cards aggressively).
3. Optionally add organizer dashboard for registrations export.
