// Rule 8 (CLAUDE.md): anything that leaves the app or shows outside it must look
// ordinary to outsiders and still be clear to the parent. These tests check every
// calendar title and note in the content files.
import { describe, expect, it } from 'vitest';
import modules from '../content/modules.json';
import reminders from '../content/reminders.json';
import { googleCalendarUrl, planEvents } from './calendar';
import { eventsFor } from './planText';
import { fromIso, makePlan } from './trial';

// Words that would tell an outsider this is about a child, family life,
// behaviour, parenting, emotions or health.
const REVEALING =
  /\b(child|children|kids?|son|daughter|teen\w*|toddler|baby|family|parent\w*|mum|mom|dad|behavio\w*|tantrums?|outbursts?|discipline|punish\w*|consequences?|rewards?|shout\w*|yell\w*|anger|angry|temper|stress\w*|anxi\w*|calm\w*|therapy|adhd|diagnos\w*|symptoms?|disorder|treatment|praise|special needs)\b/i;

type Trial = {
  event_title: string;
  event_notes: string;
  full?: { event_title: string };
  shorter?: { event_title: string; event_notes: string };
};

const texts: { where: string; title: string; notes: string }[] = [];
for (const m of modules.modules) {
  if (!m.trial) continue;
  for (const [band, raw] of Object.entries(m.trial)) {
    const t = raw as Trial;
    texts.push({ where: `${m.id} ${band}`, title: t.event_title, notes: t.event_notes });
    if (t.full) texts.push({ where: `${m.id} ${band} full`, title: t.full.event_title, notes: t.event_notes });
    if (t.shorter) texts.push({ where: `${m.id} ${band} shorter`, title: t.shorter.event_title, notes: t.shorter.event_notes });
  }
}
const ev = reminders.events;
for (const key of ['trial_checkin', 'weekly_checkin'] as const) {
  texts.push({ where: key, title: ev[key].title, notes: ev[key].notes });
}
texts.push({ where: 'notes suffix', title: '', notes: ev.trial_practice.notes_suffix });

describe('rule 8: discreet calendar text', () => {
  for (const t of texts) {
    it(`${t.where}: title and notes reveal nothing to outsiders`, () => {
      expect(t.title).not.toMatch(REVEALING);
      expect(t.notes).not.toMatch(REVEALING);
    });
    if (t.title) {
      it(`${t.where}: title is short and starts with "Coach:" so the parent recognises it`, () => {
        expect(t.title.startsWith('Coach: ')).toBe(true);
        expect(t.title.length).toBeLessThanOrEqual(32);
      });
    }
  }

  it('the Google Calendar link carries only title, notes, times, time zone and repeat', () => {
    const plan = makePlan([fromIso('2026-11-23')], '17:00', 'After school pick-up', 'any');
    const trial = modules.modules[0].trial!['4-9'];
    const [practice] = planEvents(plan, trial, ev.trial_practice.notes_suffix, ev.trial_checkin);
    const keys = [...new URL(googleCalendarUrl(practice, 'Europe/Madrid')).searchParams.keys()].sort();
    expect(keys).toEqual(['action', 'ctz', 'dates', 'details', 'recur', 'text']);
    // The parent's own words ("When ...") never go into the link.
    expect(googleCalendarUrl(practice, 'Europe/Madrid')).not.toMatch(/school/i);
  });
});

describe('rule 8: tailoring answers never reach calendar text', () => {
  // Sentinel strings stand in for everything the parent tells the app.
  const S = { loves: 'ZZLOVESZZ', moment: 'ZZMOMENTZZ', when: 'ZZWHENZZ', easier: 'ZZEASIERZZ' };
  const state = {
    moduleId: 'm1_special_time',
    ageBand: '4-9' as const,
    short: true,
    tailoring: {
      child_loves: { value: S.loves, slot: 'round1', date: '2026-11-25', skips: 0 },
      hardest_moment: { value: S.moment, slot: 'round2', date: '2026-11-25', skips: 0 },
    },
    roundCheckins: [
      { round: 1, skill: 'm1_special_time', daysDone: 2, result: 'some', easier: S.easier, recommended: 'x', choice: 'x', date: '2026-11-25' },
    ],
  };

  for (const moduleId of ['m1_special_time', 'm2_praise', 'm6_staying_calm']) {
    for (const ageBand of ['4-9', '10-16'] as const) {
      for (const variant of [undefined, 'shorter'] as const) {
        it(`${moduleId} ${ageBand} ${variant ?? 'normal'}: no answer appears in titles, notes or links`, () => {
          const plan = { ...makePlan([fromIso('2026-11-26')], '17:00', S.when, 'any'), variant };
          const events = eventsFor({ ...state, moduleId, ageBand } as never, plan);
          const out = JSON.stringify(events) + events.map((e) => googleCalendarUrl(e, 'Europe/Madrid')).join(' ');
          expect(out).not.toMatch(/ZZ\w+ZZ/);
        });
      }
    }
  }
});
