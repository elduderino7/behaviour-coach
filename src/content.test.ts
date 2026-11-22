import { describe, expect, it } from 'vitest';
import { experience, fill, ui } from './content';
import { SCREENS } from './navigation';

describe('content', () => {
  it('has a title for every screen in the journey', () => {
    for (const s of SCREENS) expect(ui.screens[s], s).toBeTruthy();
  });

  it('fills placeholders and leaves unknown ones alone', () => {
    expect(fill('When {when}, I practise {x}.', { when: 'after school' })).toBe(
      'When after school, I practise {x}.',
    );
  });

  // Rule 3: medical words only on the Help screen and in the welcome's "what this is not" line.
  it('keeps medical words out of general app text', () => {
    const banned = /\b(adhd|diagnos\w*|symptoms?|treatment|therapy|disorders?)\b/i;
    const { not_this, ...welcome } = experience.welcome;
    const texts = [JSON.stringify(ui), JSON.stringify(welcome)];
    for (const t of texts) expect(t).not.toMatch(banned);
    expect(not_this).toBeTruthy();
  });
});
