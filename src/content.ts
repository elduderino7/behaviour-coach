// All content is bundled at build time (rule 2: never fetched at runtime).
import ui from '../content/ui.json';
import experience from '../content/experience.json';
import intake from '../content/intake.json';
import routing from '../content/routing.json';
import modules from '../content/modules.json';
import checkin from '../content/checkin.json';
import reminders from '../content/reminders.json';
import safety from '../content/safety.json';
import tailoring from '../content/tailoring.json';

export { ui, experience, intake, routing, modules, checkin, reminders, safety, tailoring };

/** Replace {name} placeholders in a content string. */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
