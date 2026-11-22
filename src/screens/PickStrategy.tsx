import { experience, modules } from '../content';
import type { ScreenProps } from '../App';

export function PickStrategy({ state, update, go }: ScreenProps) {
  const c = experience.quick_start.pick_strategy;
  const options = c.options.map((id) => modules.modules.find((m) => m.id === id)!);

  const choose = (id: string) => {
    update({ moduleId: id });
    go('how');
  };

  return (
    <section>
      <p class="progress">{c.progress}</p>
      <h1>{c.title}</h1>
      <p class="note">{c.intro}</p>
      <div class="choices">
        {options.map((m) => (
          <button
            key={m.id}
            type="button"
            class={`choice card${state.moduleId === m.id ? ' selected' : ''}`}
            onClick={() => choose(m.id)}
          >
            {m.id === c.recommended && <span class="badge">{c.recommended_label}</span>}
            <span class="card-title">{m.title}</span>
            <span class="card-body">{m.teaser}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
