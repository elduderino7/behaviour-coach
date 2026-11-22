import { useState } from 'preact/hooks';
import { experience, fill, modules, ui } from '../content';
import type { ScreenProps } from '../App';

/** First version of the home screen. Ticks, check-in and "I already do this" come in later sessions. */
export function ThisWeek({ state, update }: ScreenProps) {
  const t = experience.this_week;
  const module = modules.modules.find((m) => m.id === state.moduleId) ?? modules.modules[0];
  const band = module.bands[state.ageBand ?? '4-9'];
  const [short, setShort] = useState(state.short);

  const toggle = () => {
    setShort(!short);
    update({ short: !short });
  };

  return (
    <section>
      {modules.status === 'draft' && <p class="draft-label">{ui.draft_label}</p>}
      {state.when && (
        <p class="plan-line">
          {fill(t.plan_line, { when: state.when.toLowerCase(), module_title: module.title })}
        </p>
      )}
      <h1>{module.title}</h1>
      <p>{module.summary}</p>

      <div class="exercise">
        <h2>
          {t.practice_title}
          <span class="badge">{short ? t.short_label : t.full_label}</span>
        </h2>
        {short ? (
          <p>{band.short_exercise}</p>
        ) : (
          <ol>
            {band.exercise.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        <button type="button" class="link-button" onClick={toggle}>
          {short ? t.show_full : t.show_short}
        </button>
      </div>

      <h2>{t.example_title}</h2>
      <p>{band.example}</p>

      <h2>{t.not_working_title}</h2>
      <ul>
        {band.when_it_doesnt_work.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <details class="why">
        <summary>{t.why_title}</summary>
        <p>{module.how_it_works}</p>
        <p>{band.why}</p>
      </details>

      <p class="note">{modules.footer_every_module}</p>
    </section>
  );
}
