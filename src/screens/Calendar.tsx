import { useMemo, useState } from 'preact/hooks';
import { experience, reminders } from '../content';
import type { ScreenProps } from '../App';
import { androidIntentUrl, buildIcs, downloadIcs, fastStartEvents } from '../calendar';

/** Step after "Add to my calendar": one tap per reminder on Android, or the downloaded file. */
export function Calendar({ state, update, go }: ScreenProps) {
  const events = useMemo(() => fastStartEvents(reminders, state.time), [state.time]);
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const android = state.reminders === 'android';
  const c = android ? experience.quick_start.calendar_android : experience.quick_start.calendar_file;

  const download = () =>
    downloadIcs(buildIcs(events, Intl.DateTimeFormat().resolvedOptions().timeZone));

  const done = () => {
    update({ onboarded: true });
    go('this_week');
  };

  return (
    <section>
      <h1>{c.title}</h1>
      <p>{c.intro}</p>

      {android ? (
        <>
          <div class="choices">
            {events.map((e) => {
              const ca = experience.quick_start.calendar_android;
              const label = e.id === 'practice' ? ca.practice_button : ca.checkin_button;
              return (
                <a
                  key={e.id}
                  class={`choice${opened[e.id] ? ' selected' : ''}`}
                  href={androidIntentUrl(e)}
                  onClick={() => setOpened({ ...opened, [e.id]: true })}
                >
                  <span class="card-title">{label}</span>
                  {opened[e.id] && <span class="badge">{ca.added}</span>}
                </a>
              );
            })}
          </div>
          <button type="button" class="link-button inline small-gap" onClick={download}>
            {experience.quick_start.calendar_android.fallback_link}
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
