import { useState } from 'preact/hooks';
import { experience, fill, modules, tailoring, ui } from '../content';
import type { ScreenProps } from '../App';
import { currentPlan } from '../state';
import { daysDone, iso } from '../trial';
import { moduleFor, planSentence, trialContent } from '../planText';
import { easierLabel } from './TrialCheckin';

/** Home screen. "I already do this" and Share come in later sessions. */
export function ThisWeek({ state, update, go }: ScreenProps) {
  const t = experience.this_week;
  const module = moduleFor(state);
  const bandId = state.ageBand ?? '4-9';
  const band = module.bands[bandId];
  const plan = currentPlan(state);
  const [short, setShort] = useState(state.short);
  const today = iso(new Date());
  const tickedToday = state.ticks.includes(today);

  const toggleShort = () => {
    setShort(!short);
    update({ short: !short });
  };
  const toggleTick = () =>
    update({
      ticks: tickedToday ? state.ticks.filter((d) => d !== today) : [...state.ticks, today],
    });

  const checkinDue = plan && !plan.checkedIn && today >= plan.checkinDate;
  const weekly = state.phase === 'continue' || state.phase === 'weekly';

  // Tailored for this round by the last round check-in ("Because you said …").
  const last = state.roundCheckins?.[state.roundCheckins.length - 1];
  const becauseTag = (value: string) => (
    <p class="because">{fill(tailoring.because_you_said, { answer: easierLabel(value, bandId) })}</p>
  );
  const shorterRound = plan?.variant === 'shorter';
  const focus = plan?.focus;

  const example = (
    <>
      <h2>{t.example_title}</h2>
      {focus === 'natural' && becauseTag('natural')}
      <p>{band.example}</p>
    </>
  );
  const notWorking = (
    <>
      <h2>{t.not_working_title}</h2>
      {focus === 'pushback' && becauseTag('pushback')}
      <ul>
        {band.when_it_doesnt_work.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </>
  );

  return (
    <section>
      {modules.status === 'draft' && <p class="draft-label">{ui.draft_label}</p>}
      {plan && <p class="plan-line">{planSentence(plan)}</p>}

      {checkinDue && (
        <button type="button" class="primary" onClick={() => go(weekly ? 'checkin' : 'trial_checkin')}>
          {weekly ? t.weekly_checkin_button : t.checkin_button}
        </button>
      )}

      <h1>{module.title}</h1>
      <p>{module.summary}</p>

      {focus === 'pushback' && notWorking}
      {focus === 'natural' && example}

      <div class="exercise">
        <h2>
          {t.practice_title}
          <span class="badge">
            {shorterRound ? t.shorter_label : short ? t.short_label : t.full_label}
          </span>
        </h2>
        {shorterRound ? (
          <>
            {last?.easier === 'shorter' && becauseTag('shorter')}
            <p>{trialContent(state, plan).event_notes}</p>
          </>
        ) : short ? (
          <p>{band.short_exercise}</p>
        ) : (
          <ol>
            {band.exercise.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        {!shorterRound && (
          <button type="button" class="link-button" onClick={toggleShort}>
            {short ? t.show_full : t.show_short}
          </button>
        )}
      </div>

      <div class="tick-box">
        <button type="button" class="tick" aria-pressed={tickedToday} onClick={toggleTick}>
          {tickedToday ? t.tick_done : t.tick_label}
        </button>
        {plan && (
          <p class="note">
            {fill(t.trial_days_display, { n: daysDone(plan, state.ticks), total: plan.days.length })}
          </p>
        )}
        <p class="note small">{t.tick_note}</p>
      </div>

      {focus !== 'natural' && example}
      {focus !== 'pushback' && notWorking}

      <details class="why">
        <summary>{t.why_title}</summary>
        <p>{module.how_it_works}</p>
        <p>{band.why}</p>
      </details>

      <p class="note">{modules.footer_every_module}</p>
    </section>
  );
}
