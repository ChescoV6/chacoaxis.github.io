import { describe, expect, it } from 'vitest';
import { resolveQuizTheme } from '../src/hooks/useQuizTheme';

describe('resolveQuizTheme', () => {
  it('defaults to light when nothing was chosen', () => {
    expect(resolveQuizTheme(null)).toBe('light');
  });

  it('uses dark only when the user chose it', () => {
    expect(resolveQuizTheme('dark')).toBe('dark');
    expect(resolveQuizTheme('light')).toBe('light');
  });

  it('ignores junk in storage', () => {
    expect(resolveQuizTheme('purple')).toBe('light');
    expect(resolveQuizTheme('')).toBe('light');
  });
});
