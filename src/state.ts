import { del, get, set } from 'idb-keyval';

/** Everything the app stores. Lives only in this phone's IndexedDB (rule 1). */
export interface AppState {
  version: 1;
  /** Age band picked on the age screen. */
  ageBand?: '4-9' | '10-16';
  /** True if the parent said "younger or older" and chose the closest band. */
  ageOutsideRange?: boolean;
  /** Module chosen on "Pick a skill". */
  moduleId?: string;
  /** Practice plan: "When {when}, I'll practise ...". */
  when?: string;
  /** Daily reminder time, "HH:MM". */
  time: string;
  /** Short or full version of the module. */
  short: boolean;
  /** Local date the plan started, "YYYY-MM-DD". */
  startDate?: string;
  /** How reminders were created, if at all. */
  reminders?: 'android' | 'file' | 'none';
  /** True once the fast start is done. From then on the app opens on This week. */
  onboarded: boolean;
}

export const DEFAULT_STATE: AppState = {
  version: 1,
  time: '18:00',
  short: true,
  onboarded: false,
};

const KEY = 'state';

export async function loadState(): Promise<AppState> {
  try {
    const saved = await get<AppState>(KEY);
    return saved ? { ...DEFAULT_STATE, ...saved } : { ...DEFAULT_STATE };
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

/** Today's local date as "YYYY-MM-DD". */
export function localDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
