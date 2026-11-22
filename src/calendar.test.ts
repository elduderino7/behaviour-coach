import { describe, expect, it } from 'vitest';
import modules from '../content/modules.json';
import reminders from '../content/reminders.json';
import { buildIcs, googleCalendarUrl, isAndroid, planEvents } from './calendar';
import { fromIso, makePlan } from './trial';

const trial = modules.modules.find((m) => m.id === 'm1_special_time')!.trial!['4-9'];
const ev = reminders.events;

// School days from a Thursday: Fri, Mon, Tue at 17:00; check-in Wed.
const plan = makePlan(
  ['2026-11-20', '2026-11-23', '2026-11-24'].map(fromIso),
  '17:00',
  'After school pick-up',
  'school',
);
const events = planEvents(plan, trial, ev.trial_practice.notes_suffix, ev.trial_checkin);

describe('planEvents', () => {
  it('creates one practice series and one check-in', () => {
    const [practice, checkin] = events;
    expect(practice.title).toBe('Coach: 5 min special time');
    expect(practice.rrule).toBe('FREQ=WEEKLY;BYDAY=FR,MO,TU;COUNT=3');
    expect(practice.description).toContain('Follow their lead');
    expect(practice.description).toContain(ev.trial_practice.notes_suffix);
    expect(checkin.title).toBe(ev.trial_checkin.title);
    expect(checkin.rrule).toBeUndefined();
    expect(checkin.start.getDate()).toBe(25);
    expect(checkin.start.getHours()).toBe(17);
  });
});

describe('buildIcs', () => {
  const ics = buildIcs(events, 'Europe/Madrid', new Date(2026, 10, 19, 20));

  it('has both entries at local times with the phone time zone', () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain('DTSTART;TZID=Europe/Madrid:20261120T170000');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=FR,MO,TU;COUNT=3');
    expect(ics).toContain('DTSTART;TZID=Europe/Madrid:20261125T170000');
    expect(ics.match(/RRULE/g)).toHaveLength(1);
    expect(ics.match(/TRIGGER:PT0M/g)).toHaveLength(2);
  });
});

describe('googleCalendarUrl', () => {
  it('fills title, local times, time zone and repeat', () => {
    const url = new URL(googleCalendarUrl(events[0], 'Europe/Madrid'));
    expect(url.origin).toBe('https://calendar.google.com');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('text')).toBe('Coach: 5 min special time');
    expect(url.searchParams.get('dates')).toBe('20261120T170000/20261120T170500');
    expect(url.searchParams.get('ctz')).toBe('Europe/Madrid');
    expect(url.searchParams.get('recur')).toBe('RRULE:FREQ=WEEKLY;BYDAY=FR,MO,TU;COUNT=3');
  });

  it('leaves out the repeat for the check-in', () => {
    expect(new URL(googleCalendarUrl(events[1], 'Europe/Madrid')).searchParams.has('recur')).toBe(false);
  });

  it('detects Android', () => {
    expect(isAndroid('Mozilla/5.0 (Linux; Android 15; Pixel 9)')).toBe(true);
    expect(isAndroid('Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X)')).toBe(false);
  });
});
