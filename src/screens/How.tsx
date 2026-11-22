import { useState } from 'preact/hooks';
import { experience, fill, modules, reminders, ui } from '../content';
import type { ScreenProps } from '../App';
import { buildIcs, downloadIcs, fastStartEvents, isAndroid } from '../calendar';
import { localDate } from '../state';

export function How({ state, update, go }: ScreenProps) {
  const c = experience.quick_start.how;
  const examples = experience.setup_week.practice_plan.when_examples;
  const module = modules.modules.find((m) => m.id === state.moduleId) ?? modules.modules[0];

  const initialWhen = state.when ?? examples[0];
  const [when, setWhen] = useState(initialWhen);
  const [custom, setCustom] = useState(examples.includes(initialWhen) ? '' : initialWhen);
  const [usingCustom, setUsingCustom] = useState(!examples.includes(initialWhen));
  const [time, setTime] = useState(state.time);
  const [short, setShort] = useState(state.short);

  const whenText = usingCustom ? custom.trim() || examples[0] : when;
  const checkinTime = reminders.choices.find((r) => r.id === 'checkin')?.default_time ?? '20:30';
  const weekday = ui.weekdays[new Date().getDay()];

  const finish = (withReminders: boolean) => {
    const patch = { when: whenText, time, short, startDate: localDate() };
    if (!withReminders) {
      update({ ...patch, reminders: 'none', onboarded: true });
      go('this_week');
      return;
    }
    if (isAndroid()) {
      update({ ...patch, reminders: 'android' });
    } else {
      const events = fastStartEvents(reminders, time);
      downloadIcs(buildIcs(events, Intl.DateTimeFormat().resolvedOptions().timeZone));
      update({ ...patch, reminders: 'file' });
    }
    go('calendar');
  };

  return (
    <section>
      <p class="progress">{c.progress}</p>
      <h1>{c.title}</h1>

      <fieldset class="group">
        <legend>{c.when_title}</legend>
        <div class="chips">
          {examples.map((e) => (
            <button
              key={e}
              type="button"
              class="chip"
              aria-pressed={!usingCustom && when === e}
              onClick={() => {
                setWhen(e);
                setUsingCustom(false);
              }}
            >
              {e}
            </button>
          ))}
          <button
            type="button"
            class="chip"
            aria-pressed={usingCustom}
            onClick={() => setUsingCustom(true)}
          >
            {c.when_other}
          </button>
        </div>
        {usingCustom && (
          <input
            class="text-input"
            type="text"
            maxLength={60}
            value={custom}
            placeholder={c.when_other_placeholder}
            aria-label={c.when_other}
            onInput={(e) => setCustom((e.target as HTMLInputElement).value)}
          />
        )}
        <label class="time-row">
          <span>{c.time_label}</span>
          <input
            class="text-input time"
            type="time"
            value={time}
            onInput={(e) => setTime((e.target as HTMLInputElement).value || state.time)}
          />
        </label>
      </fieldset>

      <fieldset class="group">
        <legend>{c.version_title}</legend>
        <div class="choices two">
          {c.version_options.map((o) => (
            <button
              key={o.value}
              type="button"
              class="choice"
              aria-pressed={short === (o.value === 'short')}
              onClick={() => setShort(o.value === 'short')}
            >
              <span class="card-title">{o.label}</span>
              <span class="card-body">{o.note}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div class="summary">
        <p>{fill(c.plan_preview, { when: whenText.toLowerCase(), module_title: module.title })}</p>
        <p class="note">{fill(c.checkin_line, { weekday, time: checkinTime })}</p>
      </div>

      <button type="button" class="primary" onClick={() => finish(true)}>
        {c.calendar_button}
      </button>
      <button type="button" class="secondary" onClick={() => finish(false)}>
        {c.skip_button}
      </button>
      <p class="note small">{c.privacy_note}</p>
    </section>
  );
}
