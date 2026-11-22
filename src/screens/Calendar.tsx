import { useState } from 'preact/hooks';
import { experience, fill } from '../content';
import type { ScreenProps } from '../App';
import { buildIcs, downloadIcs, googleCalendarUrl, phoneTimeZone } from '../calendar';
import { currentPlan } from '../state';
import { eventsFor } from '../planText';

/** After "Add reminders": one Google Calendar link per entry on Android, or the downloaded file. */
export function Calendar({ state, update, go }: ScreenProps) {
  const plan = currentPlan(state);
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  if (!plan) return null;

  const events = eventsFor(state, plan);
  const tz = phoneTimeZone();
  const google = state.reminders === 'google';
  const ca = experience.quick_start.calendar_android;
  const c = google ? ca : experience.quick_start.calendar_file;

  const download = () => downloadIcs(buildIcs(events, tz));
  const done = () => {
    update({ onboarded: true });
    go('this_week');
  };

  return (
    <section>
      <h1>{c.title}</h1>
      <p>{c.intro}</p>

      {google ? (
        <>
          <div class="choices">
            {events.map((e) => (
              <a
                key={e.id}
                class={`choice${opened[e.id] ? ' selected' : ''}`}
                href={googleCalendarUrl(e, tz)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpened({ ...opened, [e.id]: true })}
              >
                <span class="card-title">
                  {e.id === 'practice'
                    ? fill(ca.practice_button, { n: plan.days.length })
                    : ca.checkin_button}
                </span>
                {opened[e.id] && <span class="badge">{ca.added}</span>}
              </a>
            ))}
          </div>
          <p class="note small">{ca.google_note}</p>
          <button type="button" class="link-button inline small-gap" onClick={download}>
            {ca.fallback_link}
          </button>
        </>
      ) : (
        <button type="button" class="link-button inline small-gap" onClick={download}>
          {experience.quick_start.calendar_file.download_again}
        </button>
      )}

      <button type="button" class="primary" onClick={done}>
        {c.continue_button}
      </button>
    </section>
  );
}
