/** Every step of the journey in CLAUDE.md, in order. */
export const SCREENS = [
  'welcome',
  'intake',
  'plan',
  'setup_week',
  'this_week',
  'checkin',
  'welcome_back',
  'finished',
  'progress',
  'settings',
  'help',
] as const;

export type Screen = (typeof SCREENS)[number];
