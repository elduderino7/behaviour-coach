import { useState } from 'preact/hooks';
import { ui } from './content';
import { SCREENS, type Screen } from './navigation';
import { Welcome } from './screens/Welcome';
import { Help } from './screens/Help';
import { Placeholder } from './screens/Placeholder';

export function App() {
  // Simple state-based navigation (no router). The stack lets Back return
  // to wherever the parent came from, e.g. after opening Help.
  const [stack, setStack] = useState<Screen[]>(['welcome']);
  const screen = stack[stack.length - 1];

  const go = (next: Screen) => {
    if (next !== screen) setStack([...stack, next]);
    window.scrollTo(0, 0);
  };
  const back = () => {
    if (stack.length > 1) setStack(stack.slice(0, -1));
    window.scrollTo(0, 0);
  };

  return (
    <div class="app">
      <header class="topbar">
        {stack.length > 1 ? (
          <button type="button" class="link-button" onClick={back}>
            ‹ {ui.back_button}
          </button>
        ) : (
          <span class="app-name">{ui.app_short_name}</span>
        )}
        {screen !== 'help' && (
          <button type="button" class="help-button" onClick={() => go('help')}>
            {ui.help_button}
          </button>
        )}
      </header>

      <main class="screen" aria-live="polite">
        {screen === 'welcome' && <Welcome go={go} />}
        {screen === 'help' && <Help />}
        {screen !== 'welcome' && screen !== 'help' && <Placeholder screen={screen} />}
      </main>

      <DevMenu current={screen} go={go} />
    </div>
  );
}

/** Temporary: lets us jump to any screen while the app is being built. */
function DevMenu({ current, go }: { current: Screen; go: (s: Screen) => void }) {
  return (
    <details class="dev-menu">
      <summary>{ui.dev_menu_title}</summary>
      <ul>
        {SCREENS.map((s) => (
          <li key={s}>
            <button
              type="button"
              class="link-button"
              aria-current={s === current ? 'page' : undefined}
              onClick={() => go(s)}
            >
              {ui.screens[s]}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
