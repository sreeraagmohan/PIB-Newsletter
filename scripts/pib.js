// Shared PIB helpers — URL normalization and IST date handling.

const IST = 'Asia/Kolkata';

// RSS feeds use iframe URLs; the public release page is PressReleasePage.aspx.
function normalizePibUrl(url) {
  if (!url) return url;

  const pridMatch = url.match(/[?&]PRID=(\d+)/i);
  if (!pridMatch) return url;

  const regMatch = url.match(/[?&]reg=(\d+)/i);
  const langMatch = url.match(/[?&]lang=(\d+)/i);
  const prid = pridMatch[1];
  const reg = regMatch?.[1] ?? '3'; // All India — matches the main RSS feed
  const lang = langMatch?.[1] ?? '1'; // English

  return `https://www.pib.gov.in/PressReleasePage.aspx?PRID=${prid}&reg=${reg}&lang=${lang}`;
}

function getPrid(url) {
  const match = url?.match(/[?&]PRID=(\d+)/i);
  return match?.[1] ?? null;
}

function getIstCalendarDate(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: IST });
}

function getIstDateLabel(date = new Date()) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: IST,
  });
}

function getIstStartOfDayUtcIso(date = new Date()) {
  const day = getIstCalendarDate(date);
  return new Date(`${day}T00:00:00+05:30`).toISOString();
}

module.exports = {
  normalizePibUrl,
  getPrid,
  getIstCalendarDate,
  getIstDateLabel,
  getIstStartOfDayUtcIso,
};
