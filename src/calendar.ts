// Calendar reminders without any network request (rule 2):
// - a .ics file built as a Blob on the phone (iPhone and most calendars)
// - on Android, intent links that open the calendar's "new event" screen pre-filled.

export interface ReminderEvent {
  id: string;
  title: string;
  description: string;
  start: Date; // local time
  durationMinutes: number;
  rrule: string; // e.g. FREQ=DAILY;COUNT=28
}

interface ReminderContent {
  events: {
    checkin: { title: string; rrule: string; duration_minutes: number };
    practice: { title: string; rrule: string; duration_minutes: number };
  };
  choices: { id: string; default_time?: string }[];
  event_description: string;
}

function at(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * The two fast-start reminders: daily practice from the next occurrence of
 * `practiceTime`, and the weekly check-in one week after `now`.
 */
export function fastStartEvents(
  content: ReminderContent,
  practiceTime: string,
  now = new Date(),
): ReminderEvent[] {
  let practiceStart = at(now, practiceTime);
  if (practiceStart <= now) practiceStart.setDate(practiceStart.getDate() + 1);

  const checkinTime = content.choices.find((c) => c.id === 'checkin')?.default_time ?? '20:30';
  const checkinStart = at(now, checkinTime);
  checkinStart.setDate(checkinStart.getDate() + 7);

  const { practice, checkin } = content.events;
  return [
    {
      id: 'practice',
      title: practice.title,
      description: content.event_description,
      start: practiceStart,
      durationMinutes: practice.duration_minutes,
      rrule: practice.rrule,
    },
    {
      id: 'checkin',
      title: checkin.title,
      description: content.event_description,
      start: checkinStart,
      durationMinutes: checkin.duration_minutes,
      rrule: checkin.rrule,
    },
  ];
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local date-time in iCalendar form: 20261123T180000 */
function icsLocal(d: Date): string {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  );
}

function icsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icsText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/**
 * Build an .ics file. Times use the phone's time zone (TZID) so reminders
 * stay at the same clock time across daylight-saving changes.
 */
export function buildIcs(events: ReminderEvent[], timeZone: string, now = new Date()): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Everyday Coach//EN', 'CALSCALE:GREGORIAN'];
  for (const e of events) {
    const end = new Date(e.start.getTime() + e.durationMinutes * 60_000);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}-${icsUtc(e.start)}@everyday-coach.local`,
      `DTSTAMP:${icsUtc(now)}`,
      `DTSTART;TZID=${timeZone}:${icsLocal(e.start)}`,
      `DTEND;TZID=${timeZone}:${icsLocal(end)}`,
      `RRULE:${e.rrule}`,
      `SUMMARY:${icsText(e.title)}`,
      `DESCRIPTION:${icsText(e.description)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${icsText(e.title)}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

/**
 * Chrome on Android: an intent link that opens the calendar app's
 * "new event" screen with everything filled in. The parent taps Save.
 */
export function androidIntentUrl(e: ReminderEvent): string {
  const end = e.start.getTime() + e.durationMinutes * 60_000;
  const enc = encodeURIComponent;
  return (
    'intent:#Intent;action=android.intent.action.INSERT;' +
    'type=vnd.android.cursor.item/event;' +
    `S.title=${enc(e.title)};` +
    `S.description=${enc(e.description)};` +
    `l.beginTime=${e.start.getTime()};` +
    `l.endTime=${end};` +
    `S.rrule=${enc(e.rrule)};` +
    'end'
  );
}

export function isAndroid(ua = typeof navigator === 'undefined' ? '' : navigator.userAgent): boolean {
  return /Android/i.test(ua);
}

/** Save the .ics on the phone via a Blob link (no network request). */
export function downloadIcs(ics: string, filename = 'coach-reminders.ics'): void {
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
