// Day logic for the practice plans (docs/fast-start-v2.md). Pure functions, unit-tested.

export type DayRule = 'school' | 'any' | 'custom';

/** A practice series: the days, the time, and when to check in afterwards. */
export interface PracticePlan {
  /** Local dates "YYYY-MM-DD", in order. */
  days: string[];
  /** "HH:MM" */
  time: string;
  /** Chip label ("After school pick-up") or the parent's own words; may be empty for "Another time". */
  whenLabel: string;
  dayRule: DayRule;
  /** Local date "YYYY-MM-DD": the day after the last session. */
  checkinDate: string;
  /** True once the check-in for this plan is done. */
  checkedIn?: boolean;
  /** Round number: 1 is the fast-start trial. Missing means 1 (older saved plans). */
  round?: number;
  /** "shorter": calendar and This week use `trial.shorter` for this round. */
  variant?: 'shorter';
  /** What This week shows first this round, from the round check-in's "easier" answer. */
  focus?: 'pushback' | 'natural';
}

const pad = (n: number) => String(n).padStart(2, '0');

export function iso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromIso(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() + n);
  return r;
}

const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

/**
 * The next `count` practice days, starting tomorrow (never today).
 * `school`: Monday to Friday only. Public holidays are not handled (known limit).
 */
export function trialDays(startFrom: Date, rule: 'school' | 'any', count = 3): Date[] {
  const days: Date[] = [];
  let d = addDays(startFrom, 1);
  while (days.length < count) {
    if (rule === 'any' || !isWeekend(d)) days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

/** The check-in is the day after the last session. */
export function checkinDateFor(days: Date[]): Date {
  return addDays(days[days.length - 1], 1);
}

export function makePlan(
  days: Date[],
  time: string,
  whenLabel: string,
  dayRule: DayRule,
): PracticePlan {
  const sorted = [...days].sort((a, b) => a.getTime() - b.getTime());
  return {
    days: sorted.map(iso),
    time,
    whenLabel,
    dayRule,
    checkinDate: iso(checkinDateFor(sorted)),
  };
}

function consecutive(days: Date[]): boolean {
  return days.every((d, i) => i === 0 || iso(addDays(days[i - 1], 1)) === iso(d));
}

const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * Repeat rule for one calendar entry covering all the days.
 * Days are within 7 days of the first one, so a weekly rule with BYDAY
 * produces exactly these dates.
 */
export function practiceRrule(isoDays: string[]): string {
  const days = isoDays.map(fromIso);
  if (consecutive(days)) return `FREQ=DAILY;COUNT=${days.length}`;
  const byday = [...new Set(days.map((d) => BYDAY[d.getDay()]))].join(',');
  return `FREQ=WEEKLY;BYDAY=${byday};COUNT=${days.length}`;
}

/** "Tomorrow, Tuesday and Wednesday" */
export function dayList(
  isoDays: string[],
  today: Date,
  words: { tomorrow: string; and: string; weekdays: string[] },
): string {
  const tomorrow = iso(addDays(today, 1));
  const names = isoDays.map((s) => (s === tomorrow ? words.tomorrow : words.weekdays[fromIso(s).getDay()]));
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(', ') + words.and + names[names.length - 1];
}

/** Ticked dates that fall within the plan's days. */
export function daysDone(plan: PracticePlan, ticks: string[]): number {
  const set = new Set(plan.days);
  return ticks.filter((t) => set.has(t)).length;
}
