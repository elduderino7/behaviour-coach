import { useState } from 'preact/hooks';
import { experience, fill, tailoring } from '../content';
import type { ScreenProps } from '../App';
import { buildIcs, downloadIcs, isAndroid, phoneTimeZone } from '../calendar';
import { currentPlan, type AppState, type RoundCheckin } from '../state';
import { daysDone, iso, makePlan, trialDays, type PracticePlan } from '../trial';
import { eventsFor } from '../planText';
import {
  hardRoundsInARow,
  resultFromTicks,
  roundNextStep,
  type Easier,
  type NextOption,
  type Result,
} from '../rounds';

const c = experience.trial_checkin;
type Band = '4-9' | '10-16';

export function easierLabel(value: string, band: Band): string {
  const o = c.easier_options.find((x) => x.value === value);
  if (!o) return value;
  return typeof o.label === 'string' ? o.label : o.label[band];
}

export function resultLabel(value: string): string {
  return c.result_options.find((x) => x.value === value)?.label ?? value;
}

/** The round check-in: how it went, what would make the next round easier, then the next step. */
export function TrialCheckin({ state, update, go }: ScreenProps) {
  const plan = currentPlan(state);
  const band: Band = state.ageBand ?? '4-9';
  const total = plan?.days.length ?? 3;
  const done = plan ? daysDone(plan, state.ticks) : 0;
  const [result, setResult] = useState<Result>(resultFromTicks(done, total));
  // undefined = not answered yet; null = skipped.
  const [easier, setEasier] = useState<Easier | null | undefined>(undefined);
  const [offerFull, setOfferFull] = useState(false);
  if (!plan) return null;

  const round = plan.round ?? 1;
  const skill = state.moduleId ?? 'm1_special_time';
  const step =
    easier === undefined
      ? null
      : roundNextStep({
          round,
          result,
          easier: easier ?? undefined,
          skill,
          hardRoundsInARowWithSkill: hardRoundsInARow(state.roundCheckins ?? [], skill),
        });

  const record = (choice: NextOption): Partial<AppState> => {
    const entry: RoundCheckin = {
      round,
      skill,
      daysDone: done,
      result,
      easier: easier ?? undefined,
      recommended: step!.recommended,
      choice,
      date: iso(new Date()),
    };
    return {
      trial: { ...plan, checkedIn: true },
      followUp: undefined,
      roundCheckins: [...(state.roundCheckins ?? []), entry],
    };
  };

  /** Next round: 3 more days at the same time, through the usual calendar step. */
  const nextRound = (choice: NextOption, short: boolean) => {
    const patch = record(choice);
    const rule = plan.dayRule === 'school' ? 'school' : 'any';
    const next: PracticePlan = {
      ...makePlan(trialDays(new Date(), rule, 3), plan.time, plan.whenLabel, rule),
      round: round + 1,
    };
    if (choice === 'keep_going_shorter') next.variant = 'shorter';
    else if (plan.variant === 'shorter' && easier !== 'ready_more') next.variant = 'shorter';
    if (choice === 'keep_going' && (easier === 'pushback' || easier === 'natural')) next.focus = easier;

    const full: Partial<AppState> = { ...patch, trial: next, phase: 'trial', short };
    if (isAndroid()) {
      update({ ...full, reminders: 'google' });
    } else {
      downloadIcs(buildIcs(eventsFor({ ...state, ...full }, next), phoneTimeZone()));
      update({ ...full, reminders: 'file' });
    }
    go('calendar');
  };

  const choose = (choice: NextOption) => {
    switch (choice) {
      case 'keep_going': {
        const readyForMore = easier === 'ready_more' || (easier === null && result !== 'none');
        const offer =
          round === 1 && readyForMore && skill === 'm1_special_time' && band === '4-9' && state.short;
        if (offer) setOfferFull(true);
        else nextRound(choice, state.short);
        return;
      }
      case 'keep_going_shorter':
      case 'keep_as_is':
        nextRound(choice, state.short);
        return;
      case 'change_time':
      case 'change':
        update(record(choice));
        go('how');
        return;
      case 'other_skill':
        update(record(choice));
        go('pick_strategy');
        return;
      case 'rhythm':
        // The weekly rhythm starts with the weekly check-in (still to build, session 5).
        update({ ...record(choice), phase: 'weekly' });
        go('checkin');
        return;
    }
  };

  if (offerFull) {
    return (
      <section>
        <h1>{c.full_version_offer}</h1>
        <div class="choices">
          <button type="button" class="choice" onClick={() => nextRound('keep_going', false)}>
            {c.full_version_options[0]}
          </button>
          <button type="button" class="choice" onClick={() => nextRound('keep_going', true)}>
            {c.full_version_options[1]}
          </button>
        </div>
      </section>
    );
  }

  const because = step
    ? fill(tailoring.because_you_said, {
        answer:
          step.because.kind === 'easier'
            ? easierLabel(step.because.value, band)
            : resultLabel(step.because.value),
      })
    : '';

  return (
    <section>
      <h1>{c.title}</h1>

      <fieldset class="group">
        <legend>{c.result_question}</legend>
        <div class="choices">
          {c.result_options.map((o) => (
            <button
              key={o.value}
              type="button"
              class="choice"
              aria-pressed={result === o.value}
              onClick={() => setResult(o.value as Result)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset class="group">
        <legend>{c.easier_question}</legend>
        <div class="choices">
          {c.easier_options.map((o) => (
            <button
              key={o.value}
              type="button"
              class="choice"
              aria-pressed={easier === o.value}
              onClick={() => setEasier(o.value as Easier)}
            >
              {easierLabel(o.value, band)}
            </button>
          ))}
        </div>
        <p class="note">{c.easier_note}</p>
        {easier === undefined && (
          <button type="button" class="link-button" onClick={() => setEasier(null)}>
            {c.easier_skip}
          </button>
        )}
      </fieldset>

      {step && (
        <fieldset class="group" aria-live="polite">
          <legend>{c.next_title}</legend>
          <p>{c.messages[step.message]}</p>
          <div class="choices">
            {step.options.map((o) => (
              <button key={o} type="button" class="choice" onClick={() => choose(o)}>
                {o === step.recommended && <span class="badge">{c.recommended_label}</span>}
                <span class="card-title">{c.next_options[o]}</span>
                {o === step.recommended && <span class="because">{because}</span>}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </section>
  );
}
