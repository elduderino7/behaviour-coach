import { useState } from 'preact/hooks';
import { experience, fill } from '../content';
import type { ScreenProps } from '../App';
import { buildIcs, downloadIcs, isAndroid, phoneTimeZone } from '../calendar';
import { currentPlan, type AppState, type TrialCheckin as Answers } from '../state';
import { daysDone, iso, makePlan, trialDays } from '../trial';
import { eventsFor } from '../planText';

const c = experience.trial_checkin;
type Feeling = Answers['feeling'];

/** The light day-4 check-in: how many days, how it went, what next. */
export function TrialCheckin({ state, update, go }: ScreenProps) {
  const plan = currentPlan(state);
  const total = plan?.days.length ?? 3;
  const [days, setDays] = useState(plan ? daysDone(plan, state.ticks) : 0);
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [offerFull, setOfferFull] = useState(false);
  if (!plan) return null;

  const good = days >= 2 && feeling !== 'hard';
  const next = good ? c.next_good : c.next_hard;

  const record = (choice: string): Partial<AppState> => ({
    trial: { ...plan, checkedIn: true },
    trialCheckin: { daysDone: days, feeling: feeling!, choice, date: iso(new Date()) },
  });

  const keepGoing = (short: boolean) => {
    const rule = plan.dayRule === 'school' ? 'school' : 'any';
    const followUp = makePlan(trialDays(new Date(), rule, 4), plan.time, plan.whenLabel, rule);
    const patch: Partial<AppState> = { ...record('keep_going'), followUp, phase: 'continue', short };
    const nextState = { ...state, ...patch };
    if (isAndroid()) {
      update({ ...patch, reminders: 'google' });
    } else {
      downloadIcs(buildIcs(eventsFor(nextState, followUp), phoneTimeZone()));
      update({ ...patch, reminders: 'file' });
    }
    go('calendar');
  };

  const choose = (value: string) => {
    if (value === 'keep_going') {
      const offer = state.moduleId === 'm1_special_time' && (state.ageBand ?? '4-9') === '4-9';
      if (offer) setOfferFull(true);
      else keepGoing(state.short);
    } else if (value === 'change') {
      update(record('change'));
      go('how');
    } else {
      update(record('other_skill'));
      go('pick_strategy');
    }
  };

  if (offerFull) {
    return (
      <section>
        <h1>{c.full_version_offer}</h1>
        <div class="choices">
          <button type="button" class="choice" onClick={() => keepGoing(false)}>
            {c.full_version_options[0]}
          </button>
          <button type="button" class="choice" onClick={() => keepGoing(true)}>
            {c.full_version_options[1]}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h1>{c.title}</h1>

      <fieldset class="group">
        <legend>{fill(c.days_question, { n: total })}</legend>
        <div class="chips">
          {Array.from({ length: total + 1 }, (_, n) => (
            <button key={n} type="button" class="chip number" aria-pressed={days === n} onClick={() => setDays(n)}>
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset class="group">
        <legend>{c.feeling_question}</legend>
        <div class="choices">
          {c.feeling_options.map((o) => (
            <button
              key={o.value}
              type="button"
              class="choice"
              aria-pressed={feeling === o.value}
              onClick={() => setFeeling(o.value as Feeling)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      {feeling && (
        <fieldset class="group" aria-live="polite">
          <legend>{c.next_title}</legend>
          <p>{next.message}</p>
          <div class="choices">
            {next.options.map((o) => (
              <button key={o.value} type="button" class="choice" onClick={() => choose(o.value)}>
                {'recommended' in o && o.recommended && <span class="badge">{c.recommended_label}</span>}
                <span class="card-title">{o.label}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </section>
  );
}
