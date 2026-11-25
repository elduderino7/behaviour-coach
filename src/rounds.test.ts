import { describe, expect, it } from 'vitest';
import { hardRoundsInARow, resultFromTicks, roundNextStep, type NextStepInput } from './rounds';

const base: NextStepInput = { round: 1, result: 'some', skill: 'm1_special_time', hardRoundsInARowWithSkill: 0 };
const run = (p: Partial<NextStepInput>) => roundNextStep({ ...base, ...p });

describe('roundNextStep: one test per table row', () => {
  it('hard twice in a row with one skill → try a different skill', () => {
    const s = run({ round: 2, result: 'none', hardRoundsInARowWithSkill: 1 });
    expect(s.recommended).toBe('other_skill');
    expect(s.options).toEqual(['other_skill', 'change_time', 'keep_as_is', 'rhythm']);
    expect(s.message).toBe('two_hard');
  });

  it('better_time → try a different time', () => {
    const s = run({ easier: 'better_time' });
    expect(s.options).toEqual(['change_time', 'keep_as_is', 'other_skill']);
    expect(s.message).toBe('better_time');
    expect(s.because).toEqual({ kind: 'easier', value: 'better_time' });
  });

  it('result none, no easier answer → try a different time', () => {
    const s = run({ result: 'none' });
    expect(s.options).toEqual(['change_time', 'keep_as_is', 'other_skill']);
    expect(s.message).toBe('not_started');
    expect(s.because).toEqual({ kind: 'result', value: 'none' });
  });

  it('shorter → keep going with the shorter version', () => {
    const s = run({ easier: 'shorter' });
    expect(s.options).toEqual(['keep_going_shorter', 'change', 'other_skill']);
    expect(s.message).toBe('shorter');
  });

  it('pushback → keep going, same time', () => {
    const s = run({ easier: 'pushback' });
    expect(s.options).toEqual(['keep_going', 'change', 'other_skill']);
    expect(s.message).toBe('pushback');
  });

  it('natural → keep going, same time', () => {
    const s = run({ easier: 'natural' });
    expect(s.options).toEqual(['keep_going', 'change', 'other_skill']);
    expect(s.message).toBe('natural');
  });

  it('ready_more in round 1 → keep going, no weekly rhythm yet', () => {
    const s = run({ easier: 'ready_more', result: 'all' });
    expect(s.options).toEqual(['keep_going', 'change', 'other_skill']);
    expect(s.message).toBe('ready_more');
  });

  it('ready_more in round 2 → keep going, weekly rhythm offered last', () => {
    const s = run({ round: 2, easier: 'ready_more', result: 'all' });
    expect(s.options).toEqual(['keep_going', 'change', 'other_skill', 'rhythm']);
    expect(s.message).toBe('ready_more');
  });

  it('ready_more in round 3+ → weekly rhythm recommended', () => {
    const s = run({ round: 4, easier: 'ready_more', result: 'all' });
    expect(s.options).toEqual(['rhythm', 'keep_going', 'other_skill', 'change']);
    expect(s.message).toBe('ready_more_rhythm');
  });

  it('skipped with result all/some → same as ready_more for that round, message ok', () => {
    expect(run({ result: 'all' })).toMatchObject({ recommended: 'keep_going', message: 'ok' });
    expect(run({ round: 3, result: 'some' })).toMatchObject({ recommended: 'rhythm', message: 'ok' });
  });
});

describe('roundNextStep: extra cases', () => {
  it('hard twice wins over better_time', () => {
    const s = run({ round: 2, easier: 'better_time', hardRoundsInARowWithSkill: 1 });
    expect(s.recommended).toBe('other_skill');
    expect(s.message).toBe('two_hard');
  });

  it('skipped easier with result none → not started', () => {
    expect(run({ result: 'none', easier: undefined }).message).toBe('not_started');
  });

  it('one earlier hard round alone does not count as hard twice', () => {
    expect(run({ easier: 'pushback', hardRoundsInARowWithSkill: 1 }).recommended).toBe('keep_going');
  });

  it('from round 2, the weekly rhythm is offered in every row', () => {
    for (const easier of ['better_time', 'shorter', 'pushback', 'natural', 'ready_more', undefined] as const) {
      expect(run({ round: 2, easier }).options).toContain('rhythm');
    }
    expect(run({ round: 2, result: 'none' }).options).toContain('rhythm');
  });
});

describe('helpers', () => {
  it('resultFromTicks', () => {
    expect(resultFromTicks(0, 3)).toBe('none');
    expect(resultFromTicks(2, 3)).toBe('some');
    expect(resultFromTicks(3, 3)).toBe('all');
  });

  it('hardRoundsInARow counts back only while the same skill was hard', () => {
    const c = [
      { skill: 'm1_special_time', result: 'none' as const },
      { skill: 'm2_praise', result: 'none' as const },
      { skill: 'm2_praise', result: 'some' as const, easier: 'better_time' },
    ];
    expect(hardRoundsInARow(c, 'm2_praise')).toBe(2);
    expect(hardRoundsInARow(c, 'm1_special_time')).toBe(0);
  });
});
