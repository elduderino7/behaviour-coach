import { ui } from '../content';
import type { Screen } from '../navigation';

export function Placeholder({ screen }: { screen: Screen }) {
  return (
    <section>
      <h1>{ui.screens[screen]}</h1>
      <p class="note">{ui.placeholder}</p>
    </section>
  );
}
