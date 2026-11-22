/** Every screen of the journey, in order. The first five are the fast start. */
export const SCREENS = [
  'welcome',
  'age',
  'pick_strategy',
  'how',
  'calendar',
  'this_week',
  'trial_checkin',
  'checkin',
  'welcome_back',
  'finished',
  'progress',
  'settings',
  'help',
] as const;

export type Screen = (typeof SCREENS)[number];
