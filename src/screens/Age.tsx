import { useState } from 'preact/hooks';
import { experience, intake } from '../content';
import type { ScreenProps } from '../App';

const question = intake.questions.find((q) => q.id === 'age_band')!;

export function Age({ update, go }: ScreenProps) {
  const [outside, setOutside] = useState(false);
  const options = question.options ?? [];
  const bands = options.filter((o) => o.value !== 'other');
  const other = options.find((o) => o.value === 'other');

  const choose = (band: string) => {
    update({ ageBand: band as '4-9' | '10-16', ageOutsideRange: outside });
    go('pick_strategy');
  };

  return (
    <section>
      <p class="progress">{experience.quick_start.age.progress}</p>
      <h1>{question.text}</h1>
      {outside && <p class="note">{experience.quick_start.age.other_message}</p>}
      <div class="choices">
        {bands.map((o) => (
          <button key={o.value} type="button" class="choice" onClick={() => choose(o.value)}>
            {o.label}
          </button>
        ))}
        {other && !outside && (
          <button type="button" class="choice quiet" onClick={() => setOutside(true)}>
            {other.label}
          </button>
        )}
      </div>
    </section>
  );
}
