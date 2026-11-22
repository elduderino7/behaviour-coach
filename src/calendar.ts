// Calendar reminders. The app itself makes no network request (rule 2):
// - a .ics file built as a Blob on the phone (iPhone, Samsung and most calendars)
// - on Android, a Google Calendar link the parent taps (an agreed exception to
//   rule 2: the link carries only the title, notes and times, never anything
//   about the child).

import { fromIso, practiceRrule, type PracticePlan } from './trial';

export interface ReminderEvent {
  id: 'practice' | 'checkin';
  title: string;
  description: string;
  start: Date; // local time
  durationMinutes: number;
  rrule?: string;
}

export interface TrialContent {
  minutes: number;
  event_title: string;
  event_notes: string;
}

export interface CheckinContent {
  title: string;
  notes: string;
  duration_minutes: number;
}

function at(isoDate: string, hhmm: string): Date {
  const d = fromIso(isoDate);
  const [h, m] = hhmm.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Two entries: one repeating practice series and one check-in. */
export function planEvents(
  plan: PracticePlan,
  practice: TrialContent,
  notesSuffix: string,
  checkin: CheckinContent,
): ReminderEvent[] {
  return [
    {
      id: 'practice',
      title: practice.event_title,
      description: `${practice.event_notes}\n\n${notesSuffix}`,
      start: at(plan.days[0], plan.time),
      durationMinutes: Math.max(practice.minutes, 5),
      rrule: practiceRrule(plan.days),
    },
    {
      id: 'checkin',
      title: checkin.title,
      description: checkin.notes,
      start: at(plan.checkinDate, plan.time),
      durationMinutes: checkin.duration_minutes,
    },
  ];
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local date-time in iCalendar form: 20261123T180000 */
export function icsLocal(d: Date): string {
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

const endOf = (e: ReminderEvent) => new Date(e.start.getTime() + e.durationMinutes * 60_000);

/**
 * Build an .ics file. Times use the phone's time zone (TZID) so reminders
 * stay at the same clock time across daylight-saving changes.
 */
export function buildIcs(events: ReminderEvent[], timeZone: string, now = new Date()): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Everyday Coach//EN', 'CALSCALE:GREGORIAN'];
  for (const e of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}-${icsUtc(e.start)}@everyday-coach.local`,
      `DTSTAMP:${icsUtc(now)}`,
      `DTSTART;TZID=${timeZone}:${icsLocal(e.start)}`,
      `DTEND;TZID=${timeZone}:${icsLocal(endOf(e))}`,
      ...(e.rrule ? [`RRULE:${e.rrule}`] : []),
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
 * A Google Calendar "new event" link with everything filled in. On Android it
 * opens the Google Calendar app (or website); the parent taps Save.
 */
export function googleCalendarUrl(e: ReminderEvent, timeZone: string): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${icsLocal(e.start)}/${icsLocal(endOf(e))}`,
    details: e.description,
    ctz: timeZone,
  });
  if (e.rrule) params.set('recur', `RRULE:${e.rrule}`);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function isAndroid(ua = typeof navigator === 'undefined' ? '' : navigator.userAgent): boolean {
  return /Android/i.test(ua);
}

export function phoneTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
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
