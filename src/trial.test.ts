import { describe, expect, it } from 'vitest';
import {
  checkinDateFor,
  dayList,
  daysDone,
  fromIso,
  iso,
  makePlan,
  practiceRrule,
  trialDays,
} from './trial';

const D = (s: string) => fromIso(s);
const isoAll = (ds: Date[]) => ds.map(iso);
// 2026-11-16 is a Monday.
const MON = D('2026-11-16');
const weekdayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const names = (ds: Date[]) => ds.map((d) => weekdayName[d.getDay()]).join(' ');

describe('trialDays (spec cases)', () => {
  it('Friday + school → Mon, Tue, Wed; check-in Thu', () => {
    const days = trialDays(D('2026-11-20'), 'school');
    expect(names(days)).toBe('Mon Tue Wed');
    expect(weekdayName[checkinDateFor(days).getDay()]).toBe('Thu');
  });

  it('Wednesday + any → Thu, Fri, Sat; check-in Sun', () => {
    const days = trialDays(D('2026-11-18'), 'any');
    expect(names(days)).toBe('Thu Fri Sat');
    expect(weekdayName[checkinDateFor(days).getDay()]).toBe('Sun');
  });

  it('Thursday + school → Fri, Mon, Tue; check-in Wed', () => {
    const days = trialDays(D('2026-11-19'), 'school');
    expect(names(days)).toBe('Fri Mon Tue');
    expect(weekdayName[checkinDateFor(days).getDay()]).toBe('Wed');
  });

  it('custom non-consecutive days → check-in the day after the last chosen day', () => {
    const plan = makePlan([D('2026-11-20'), D('2026-11-17'), D('2026-11-18')], '17:00', '', 'custom');
    expect(plan.days).toEqual(['2026-11-17', '2026-11-18', '2026-11-20']);
    expect(plan.checkinDate).toBe('2026-11-21');
  });
});

describe('trialDays on every start weekday', () => {
  for (let i = 0; i < 7; i++) {
    const start = new Date(MON.getFullYear(), MON.getMonth(), MON.getDate() + i);
    it(`starts tomorrow and never on a weekend for school (${weekdayName[start.getDay()]})`, () => {
      const school = trialDays(start, 'school');
      expect(school).toHaveLength(3);
      expect(school[0] > start).toBe(true);
      for (const d of school) expect([0, 6]).not.toContain(d.getDay());
      const anyDays = trialDays(start, 'any');
      expect(iso(anyDays[0])).toBe(iso(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)));
      expect(isoAll(anyDays)).toHaveLength(3);
    });
  }

  it('can plan 4 days for "keep going"', () => {
    expect(trialDays(D('2026-11-20'), 'school', 4)).toHaveLength(4);
  });
});

describe('practiceRrule', () => {
  it('uses a daily rule for consecutive days', () => {
    expect(practiceRrule(['2026-11-17', '2026-11-18', '2026-11-19'])).toBe('FREQ=DAILY;COUNT=3');
  });
  it('uses weekly BYDAY for gaps (school days over a weekend)', () => {
    expect(practiceRrule(['2026-11-20', '2026-11-23', '2026-11-24'])).toBe(
      'FREQ=WEEKLY;BYDAY=FR,MO,TU;COUNT=3',
    );
  });
});

describe('dayList', () => {
  const words = {
    tomorrow: 'Tomorrow',
    and: ' and ',
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };
  it('names tomorrow and real weekdays', () => {
    expect(dayList(['2026-11-17', '2026-11-18', '2026-11-19'], MON, words)).toBe(
      'Tomorrow, Wednesday and Thursday',
    );
  });
  it('works for two days', () => {
    expect(dayList(['2026-11-18', '2026-11-20'], MON, words)).toBe('Wednesday and Friday');
  });
});

describe('daysDone', () => {
  it('counts only ticks on planned days', () => {
    const plan = makePlan([D('2026-11-17'), D('2026-11-18'), D('2026-11-19')], '17:00', 'x', 'any');
    expect(daysDone(plan, ['2026-11-16', '2026-11-17', '2026-11-19'])).toBe(2);
  });
});
