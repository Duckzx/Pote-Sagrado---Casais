// Weekly "save money" reminder as an .ics file: works with the phone's own
// calendar (iPhone, Android, Google Calendar), no push server needed.

const pad = (n: number) => String(n).padStart(2, '0');

function formatLocal(d: Date) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/** Next occurrence of weekday (0=Sunday) at hour:minute. */
function nextOccurrence(weekday: number, hour: number, minute: number) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 && d.getTime() < Date.now() ? 7 : diff));
  return d;
}

export function buildWeeklyReminderIcs(opts: { weekday: number; hour: number; minute?: number; title: string; url: string }) {
  const start = nextOccurrence(opts.weekday, opts.hour, opts.minute ?? 0);
  const end = new Date(start.getTime() + 15 * 60 * 1000);
  const uid = `pote-sagrado-${Date.now()}@pote-sagrado`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pote Sagrado//Lembrete//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatLocal(new Date())}`,
    `DTSTART:${formatLocal(start)}`,
    `DTEND:${formatLocal(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${WEEKDAYS[opts.weekday]}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:Guarde qualquer valor no pote e mantenha a ofensiva 🔥\\n${opts.url}`,
    `URL:${opts.url}`,
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${opts.title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

/** Hands the reminder to the phone: share sheet when possible, else download. */
export async function addWeeklyReminder(weekday: number, hour: number) {
  const ics = buildWeeklyReminderIcs({
    weekday,
    hour,
    title: 'Guardar no Pote Sagrado 🍯',
    url: window.location.origin,
  });
  const file = new File([ics], 'lembrete-pote-sagrado.ics', { type: 'text/calendar' });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Lembrete do Pote Sagrado' });
      return;
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lembrete-pote-sagrado.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
