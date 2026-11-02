import { describe, expect, it } from 'vitest';
import { validTerms } from '../src/components/GlossaryText';
import type { QuestionTerm } from '../src/types/quiz';

const term = (start: number, end: number): QuestionTerm => ({ start, end, term: 't', definition: 'd' });

describe('validTerms', () => {
  const text = 'The central bank should obey the government.';

  it('keeps terms inside the text, ordered by position', () => {
    expect(validTerms(text, [term(20, 26), term(4, 16)]).map((t) => t.start)).toEqual([4, 20]);
  });

  it('drops out-of-range, empty and overlapping spans', () => {
    const result = validTerms(text, [term(4, 16), term(10, 20), term(30, 30), term(40, 99), term(-1, 3)]);
    expect(result.map((t) => [t.start, t.end])).toEqual([[4, 16]]);
  });

  it('accepts a missing list', () => {
    expect(validTerms(text)).toEqual([]);
  });
});
