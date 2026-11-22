// Turns a plan into the parent-facing sentences, using content text only (rule 4).
import { experience, fill, modules, reminders, ui } from './content';
import type { AppState } from './state';
import { dayList, fromIso, type PracticePlan } from './trial';
import { planEvents, type ReminderEvent } from './calendar';

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

export function moduleFor(state: AppState) {
  return modules.modules.find((m) => m.id === state.moduleId) ?? modules.modules[0];
}

/**
 * Trial wording for the chosen module and age band (falls back to special time).
 * With the full version chosen, a `full` block (if any) overrides minutes and title.
 */
export function trialContent(state: AppState) {
  const band = state.ageBand ?? '4-9';
  const own = moduleFor(state).trial;
  const t: { question: string; minutes: number; event_title: string; event_notes: string; full?: { minutes: number; event_title: string } } =
    (own ?? modules.modules[0].trial!)[band];
  return !state.short && t.full ? { ...t, ...t.full } : t;
}

/** Calendar entries for the current plan: practice series + the right check-in. */
export function eventsFor(state: AppState, plan: PracticePlan): ReminderEvent[] {
  const checkin =
    state.phase === 'continue' ? reminders.events.weekly_checkin : reminders.events.trial_checkin;
  return planEvents(plan, trialContent(state), reminders.events.trial_practice.notes_suffix, checkin);
}
