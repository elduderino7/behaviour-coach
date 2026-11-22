import { experience, ui } from '../content';
import type { Screen } from '../navigation';

export function Welcome({ go }: { go: (s: Screen) => void }) {
  const w = experience.welcome;
  return (
    <section>
      {experience.status === 'draft' && <p class="draft-label">{ui.draft_label}</p>}
      <h1>{w.title}</h1>
      {w.body.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <p class="note">
        {w.not_this}{' '}
        <button type="button" class="link-button inline" onClick={() => go('help')}>
          {ui.help_button}
        </button>
      </p>
      <button type="button" class="primary" onClick={() => go('intake')}>
        {w.cta}
      </button>
    </section>
  );
}
