import { useEffect, useState } from 'preact/hooks';
import { ui } from './content';
import { SCREENS, type Screen } from './navigation';
import { deleteEverything, loadState, saveState, type AppState } from './state';
import { Welcome } from './screens/Welcome';
import { Age } from './screens/Age';
import { PickStrategy } from './screens/PickStrategy';
import { How } from './screens/How';
import { Calendar } from './screens/Calendar';
import { ThisWeek } from './screens/ThisWeek';
import { TrialCheckin } from './screens/TrialCheckin';
import { Help } from './screens/Help';
import { Placeholder } from './screens/Placeholder';

export interface ScreenProps {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  go: (s: Screen) => void;
}

export function App() {
  const [state, setState] = useState<AppState | null>(null);
  // Simple state-based navigation (no router). The stack lets Back return
  // to wherever the parent came from, e.g. after opening Help.
  const [stack, setStack] = useState<Screen[]>([]);
  // The test menu only appears when the app is opened again after the fast
  // start, never during the parent's first run through it.
  const [showTestMenu, setShowTestMenu] = useState(false);

  useEffect(() => {
    loadState().then((s) => {
      setState(s);
      setStack([s.onboarded ? 'this_week' : 'welcome']);
      setShowTestMenu(s.onboarded);
    });
  }, []);

  if (!state || stack.length === 0) return null;

  const screen = stack[stack.length - 1];

  const update = (patch: Partial<AppState>) => {
    setState((prev) => {
      const next = { ...(prev as AppState), ...patch };
      saveState(next);
      return next;
    });
  };
  const go = (next: Screen) => {
    // This week is home: going there always starts a fresh history.
    if (next === 'this_week') setStack(['this_week']);
    else if (next !== screen) setStack([...stack, next]);
    window.scrollTo(0, 0);
  };
  const back = () => {
    if (stack.length > 1) setStack(stack.slice(0, -1));
    window.scrollTo(0, 0);
  };
  const props: ScreenProps = { state, update, go };

  return (
    <div class="app">
      <header class="topbar">
        {stack.length > 1 ? (
          <button type="button" class="link-button" onClick={back}>
            {ui.back_button}
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

      <main class="screen">
        {screen === 'welcome' && <Welcome go={go} />}
        {screen === 'age' && <Age {...props} />}
        {screen === 'pick_strategy' && <PickStrategy {...props} />}
        {screen === 'how' && <How {...props} />}
        {screen === 'calendar' && <Calendar {...props} />}
        {screen === 'this_week' && <ThisWeek {...props} />}
        {screen === 'trial_checkin' && <TrialCheckin {...props} />}
        {screen === 'help' && <Help />}
        {!BUILT.has(screen) && <Placeholder screen={screen} />}
      </main>

      {showTestMenu && <TestMenu current={screen} go={go} />}
    </div>
  );
}

const BUILT = new Set<Screen>(['welcome', 'age', 'pick_strategy', 'how', 'calendar', 'this_week', 'trial_checkin', 'help']);

/** Temporary: lets us jump to any screen while the app is being built. */
function TestMenu({ current, go }: { current: Screen; go: (s: Screen) => void }) {
  const reset = async () => {
    await deleteEverything();
    window.location.reload();
  };
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
        <li>
          <button type="button" class="link-button" onClick={reset}>
            {ui.test_menu_reset}
          </button>
        </li>
      </ul>
    </details>
  );
}
