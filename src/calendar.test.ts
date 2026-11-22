import { describe, expect, it } from 'vitest';
import reminders from '../content/reminders.json';
import { androidIntentUrl, buildIcs, fastStartEvents, isAndroid } from './calendar';

// Sunday 22 Nov 2026, 19:00 local time
const now = new Date(2026, 10, 22, 19, 0, 0);

describe('fastStartEvents', () => {
  it('starts practice tomorrow if the time has passed today', () => {
    const [practice] = fastStartEvents(reminders, '18:00', now);
    expect(practice.start.getDate()).toBe(23);
    expect(practice.start.getHours()).toBe(18);
    expect(practice.rrule).toBe('FREQ=DAILY;COUNT=28');
  });

  it('starts practice today if the time is still ahead', () => {
    const [practice] = fastStartEvents(reminders, '20:00', now);
    expect(practice.start.getDate()).toBe(22);
  });

  it('puts the check-in one week later at the default time', () => {
    const [, checkin] = fastStartEvents(reminders, '18:00', now);
    expect(checkin.start.getDate()).toBe(29);
    expect(checkin.start.getDay()).toBe(now.getDay());
    expect(checkin.start.getHours()).toBe(20);
    expect(checkin.start.getMinutes()).toBe(30);
    expect(checkin.rrule).toBe('FREQ=WEEKLY;COUNT=4');
  });
});

describe('buildIcs', () => {
  const ics = buildIcs(fastStartEvents(reminders, '18:00', now), 'Europe/Madrid', now);

  it('contains both events with local times and the time zone', () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain('DTSTART;TZID=Europe/Madrid:20261123T180000');
    expect(ics).toContain('DTSTART;TZID=Europe/Madrid:20261129T203000');
    expect(ics).toContain('RRULE:FREQ=DAILY;COUNT=28');
  });

  it('uses CRLF line endings and never mentions the child', () => {
    expect(ics.split('\r\n').length).toBeGreaterThan(10);
    expect(ics).not.toMatch(/child/i);
  });
});

describe('androidIntentUrl', () => {
  it('builds a pre-filled insert-event intent', () => {
    const [practice] = fastStartEvents(reminders, '18:00', now);
    const url = androidIntentUrl(practice);
    expect(url.startsWith('intent:#Intent;action=android.intent.action.INSERT;')).toBe(true);
    expect(url).toContain(`l.beginTime=${practice.start.getTime()};`);
    expect(url).toContain('S.rrule=FREQ%3DDAILY%3BCOUNT%3D28;');
    expect(url.endsWith(';end')).toBe(true);
  });

  it('detects Android', () => {
    expect(isAndroid('Mozilla/5.0 (Linux; Android 15; Pixel 9)')).toBe(true);
    expect(isAndroid('Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X)')).toBe(false);
  });
});
