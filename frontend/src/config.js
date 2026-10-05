// ============================================================
// WORKSHOP LAUNCHPAD — SINGLE CONFIG FILE
// Change the workshop details here; the whole app follows.
// ============================================================

// Workshop start time (ISO 8601 with IST offset)
export const WORKSHOP_DATE_TIME = "2026-10-10T14:00:00+05:30";

// Workshop end time (used for the Google Calendar event)
export const WORKSHOP_END_TIME = "2026-10-10T15:00:00+05:30";

// Human-readable label shown across the page
export const WORKSHOP_DATE_LABEL = "Saturday, October 10 · 2:00 – 3:00 PM IST";

// WhatsApp community invite link (placeholder — paste your real invite link)
export const WHATSAPP_COMMUNITY_LINK =
  "https://chat.whatsapp.com/PASTE-YOUR-COMMUNITY-INVITE-CODE";

// Total seats available
export const REGISTRATION_TARGET = 500;

// ------------------------------------------------------------

export const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const calText = encodeURIComponent(
  "Build Your First AI Project in 60 Minutes — Free Live Workshop"
);
const calDetails = encodeURIComponent(
  "Free live hands-on workshop for final-year engineering students. The joining link will be shared in the WhatsApp community before the session."
);
const toCal = (iso) =>
  new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0, 15) + "Z";

export const GOOGLE_CALENDAR_URL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calText}&dates=${toCal(
  WORKSHOP_DATE_TIME
)}/${toCal(WORKSHOP_END_TIME)}&details=${calDetails}&location=${encodeURIComponent(
  "Online (Live)"
)}`;
