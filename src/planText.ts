// Turns a plan into the parent-facing sentences, using content text only (rule 4).
import { experience, fill, modules, reminders, ui } from './content';
import type { AppState } from './state';
import { dayList, fromIso, type PracticePlan } from './trial';
import { planEvents, type ReminderEvent, type TrialContent } from './calendar';

const how = experience.quick_start.how;

export function planSentence(plan: PracticePlan, today = new Date()): string {
  const days = dayList(plan.days, today, { tomorrow: how.tomorrow, and: how.list_and, weekdays: ui.weekdays });
  return plan.whenLabel
    ? fill(how.plan_line, { days, when: plan.whenLabel.toLowerCase() })
    : fill(how.plan_line_custom, { days, time: plan.time });
}

export function checkinSentence(plan: PracticePlan): string {
  return fill(how.checkin_line, { checkin_day: ui.weekdays[fromIso(plan.checkinDate).getDay()] });
}

export function moduleFor(state: Pick<AppState, 'moduleId'>) {
  return modules.modules.find((m) => m.id === state.moduleId) ?? modules.modules[0];
}

interface TrialBlock extends TrialContent {
  question: string;
  full?: { minutes: number; event_title: string };
  shorter?: TrialContent;
}

/**
 * Trial wording for the chosen module and age band (falls back to special time).
 * A shorter round uses `trial.shorter`; with the full version chosen, `full` overrides.
 *
 * Rule 8: this takes only the module, age band, version and the plan's variant,
 * never the parent's tailoring answers, so those can't reach calendar text.
 */
export function trialContent(
  state: Pick<AppState, 'moduleId' | 'ageBand' | 'short'>,
  plan?: Pick<PracticePlan, 'variant'>,
): TrialBlock {
  const band = state.ageBand ?? '4-9';
  const own = moduleFor(state).trial;
  const t: TrialBlock = (own ?? modules.modules[0].trial!)[band];
  if (plan?.variant === 'shorter' && t.shorter) return { ...t, ...t.shorter };
  return !state.short && t.full ? { ...t, ...t.full } : t;
}

/** Calendar entries for a plan: the practice series + the round check-in. */
export function eventsFor(
  state: Pick<AppState, 'moduleId' | 'ageBand' | 'short'>,
  plan: PracticePlan,
): ReminderEvent[] {
  return planEvents(
    plan,
    trialContent(state, plan),
    reminders.events.trial_practice.notes_suffix,
    reminders.events.trial_checkin,
  );
}
