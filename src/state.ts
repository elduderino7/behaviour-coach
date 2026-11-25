import { del, get, set } from 'idb-keyval';
import type { PracticePlan } from './trial';
import type { Easier, Result } from './rounds';

export type Phase = 'trial' | 'continue' | 'weekly';

/** The first day-4 check-in format (before 25 Nov 2026). Kept so older saved data still loads. */
export interface TrialCheckin {
  daysDone: number;
  feeling?: 'better' | 'ok' | 'hard';
  choice: string;
  date: string;
}

/** One round check-in (docs/checkin-tailoring.md, section 1). */
export interface RoundCheckin {
  round: number;
  skill: string;
  daysDone: number;
  result: Result;
  easier?: Easier;
  /** Which tailoring question the picker chose (part 2). */
  tailoringAsked?: string;
  recommended: string;
  choice: string;
  date: string;
}

/** Everything the app stores. Lives only in this phone's IndexedDB (rule 1). */
export interface AppState {
  version: 2;
  /** Age band picked on the age screen. */
  ageBand?: '4-9' | '10-16';
  /** True if the parent said "younger or older" and chose the closest band. */
  ageOutsideRange?: boolean;
  /** Module chosen on "Pick a skill". */
  moduleId?: string;
  /** Short or full version of the module (the trial always starts short). */
  short: boolean;
  /** The 3-day trial from the fast start (or a re-planned one). */
  trial?: PracticePlan;
  /** "Keep going": 4 more days, ending in the first weekly check-in. */
  followUp?: PracticePlan;
  phase?: Phase;
  /** Answers from the first day-4 check-in format (older saved data). */
  trialCheckin?: TrialCheckin;
  /** Every round check-in, oldest first. */
  roundCheckins?: RoundCheckin[];
  /** Dates ("YYYY-MM-DD") the parent ticked "I practised today". */
  ticks: string[];
  /** How the last reminders were created, if at all. */
  reminders?: 'google' | 'file' | 'none';
  /** Local date the first plan was made. */
  startDate?: string;
  /** True once the fast start is done. From then on the app opens on This week. */
  onboarded: boolean;
}

export const DEFAULT_STATE: AppState = {
  version: 2,
  short: true,
  ticks: [],
  onboarded: false,
};

/**
 * The plan the parent is currently working through. Rounds live in `trial`;
 * `followUp` is only used by plans saved before the round check-in existed.
 */
export function currentPlan(s: AppState): PracticePlan | undefined {
  return s.phase === 'continue' && s.followUp ? s.followUp : s.trial;
}

/** The number the next new plan gets: one more than the round check-ins so far. */
export function nextRoundNumber(s: AppState): number {
  return (s.roundCheckins?.length ?? 0) + 1;
}

const KEY = 'state';

export async function loadState(): Promise<AppState> {
  try {
    const saved = await get<Partial<AppState>>(KEY);
    // Version 1 (first fast start) had no trial plan: start the fast start again.
    if (!saved || saved.version !== 2) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...saved };
  } catch {
    // Private mode or storage blocked: the app still works for this visit.
    return { ...DEFAULT_STATE };
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await set(KEY, state);
  } catch {
    /* see loadState */
  }
}

export async function deleteEverything(): Promise<void> {
  await del(KEY);
}
