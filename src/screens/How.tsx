import { useState } from 'preact/hooks';
import { experience, fill, ui } from '../content';
import type { ScreenProps } from '../App';
import { buildIcs, downloadIcs, isAndroid, phoneTimeZone } from '../calendar';
import { addDays, fromIso, iso, makePlan, trialDays, type PracticePlan } from '../trial';
import { checkinSentence, eventsFor, planSentence, trialContent } from '../planText';
import { nextRoundNumber } from '../state';

const c = experience.quick_start.how;
type Choice = number | 'other' | null;

/** Step 3: one question ("When could you…?"); the app plans the rest. */
export function How({ state, update, go }: ScreenProps) {
  const today = new Date();
  const [choice, setChoice] = useState<Choice>(null);
  const [otherTime, setOtherTime] = useState('18:00');
  const [otherLabel, setOtherLabel] = useState('');
  const [changing, setChanging] = useState(false);
  // Set once the parent edits days or time under "Change".
  const [customDays, setCustomDays] = useState<string[] | null>(null);
  const [customTime, setCustomTime] = useState<string | null>(null);

  const pick = (ch: Choice) => {
    setChoice(ch);
    setCustomDays(null);
    setCustomTime(null);
  };

  let plan: PracticePlan | null = null;
  if (choice !== null) {
    const opt = choice === 'other' ? null : c.when_options[choice];
    const rule = (opt?.days ?? 'any') as 'school' | 'any';
    const time = customTime ?? opt?.time ?? otherTime;
    const label = opt?.label ?? otherLabel.trim();
    const days = customDays
      ? customDays.map(fromIso)
      : trialDays(today, rule);
    plan = makePlan(days, time, label, customDays ? 'custom' : rule);
  }

  const next7 = Array.from({ length: 7 }, (_, i) => iso(addDays(today, i + 1)));
  const toggleDay = (d: string) => {
    if (!plan) return;
    const current = customDays ?? plan.days;
    const next = current.includes(d) ? current.filter((x) => x !== d) : [...current, d].sort();
    if (next.length >= 2 && next.length <= 5) setCustomDays(next);
  };

  const finish = (withReminders: boolean) => {
    if (!plan) return;
    const round = nextRoundNumber(state);
    const base = {
      trial: { ...plan, round },
      followUp: undefined,
      phase: 'trial' as const,
      // The fast start always uses the short version; later re-plans keep the parent's choice.
      short: round === 1 ? true : state.short,
      startDate: state.startDate ?? iso(today),
    };
    if (!withReminders) {
      update({ ...base, reminders: 'none', onboarded: true });
      go('this_week');
      return;
    }
    if (isAndroid()) {
      update({ ...base, reminders: 'google' });
    } else {
      downloadIcs(buildIcs(eventsFor({ ...state, ...base }, base.trial), phoneTimeZone()));
      update({ ...base, reminders: 'file' });
    }
    go('calendar');
  };

  const shortWeekday = (d: string) => ui.weekdays_short[fromIso(d).getDay()];

  return (
    <section>
      <p class="progress">{c.progress}</p>
      <h1>{trialContent(state).question}</h1>

      <div class="chips" role="group" aria-label={trialContent(state).question}>
        {c.when_options.map((o, i) => (
          <button
            key={o.label}
            type="button"
            class="chip"
            aria-pressed={choice === i}
            onClick={() => pick(i)}
          >
            {fill(c.chip_format, { label: o.label, time: o.time })}
          </button>
        ))}
        <button type="button" class="chip" aria-pressed={choice === 'other'} onClick={() => pick('other')}>
          {c.when_other}
        </button>
      </div>

      {choice === 'other' && (
        <div class="other-time">
          <label class="time-row">
            <span>{c.when_other_time_label}</span>
            <input
              class="text-input time"
              type="time"
              value={otherTime}
              onInput={(e) => setOtherTime((e.target as HTMLInputElement).value || otherTime)}
            />
          </label>
          <input
            class="text-input"
            type="text"
            maxLength={40}
            value={otherLabel}
            placeholder={c.when_other_label_placeholder}
            aria-label={c.when_other_label_placeholder}
            onInput={(e) => setOtherLabel((e.target as HTMLInputElement).value)}
          />
        </div>
      )}

      {plan && (
        <div class="summary" aria-live="polite">
          <p>{planSentence(plan, today)}</p>
          <p class="note">{checkinSentence(plan)}</p>
          <button type="button" class="link-button" aria-expanded={changing} onClick={() => setChanging(!changing)}>
            {changing ? c.change_done : c.change_link}
          </button>
          {changing && (
            <div class="change">
              <p class="change-label">{c.change_days_label}</p>
              <div class="chips days">
                {next7.map((d) => (
                  <button
                    key={d}
                    type="button"
                    class="chip day"
                    aria-pressed={plan!.days.includes(d)}
                    onClick={() => toggleDay(d)}
                  >
                    {d === next7[0] ? c.tomorrow : shortWeekday(d)}
                  </button>
                ))}
              </div>
              <p class="note small-gap">{c.change_days_hint}</p>
              <label class="time-row">
                <span>{c.change_time_label}</span>
                <input
                  class="text-input time"
                  type="time"
                  value={plan.time}
                  onInput={(e) => setCustomTime((e.target as HTMLInputElement).value || plan!.time)}
                />
              </label>
            </div>
          )}
        </div>
      )}

      <button type="button" class="primary" disabled={!plan} onClick={() => finish(true)}>
        {fill(c.calendar_button, { n: plan ? plan.days.length : 3 })}
      </button>
      <button type="button" class="secondary" disabled={!plan} onClick={() => finish(false)}>
        {c.skip_button}
      </button>
      <p class="note small">{c.privacy_note}</p>
    </section>
  );
}
