import { describe, expect, it } from 'vitest';
import { compatibilityLevel } from './compatibility';

describe('compatibilityLevel', () => {
  it('classifica cada faixa nos limites', () => {
    expect(compatibilityLevel(100)).toBe('veryHigh');
    expect(compatibilityLevel(95)).toBe('veryHigh');
    expect(compatibilityLevel(94)).toBe('high');
    expect(compatibilityLevel(85)).toBe('high');
    expect(compatibilityLevel(84)).toBe('medium');
    expect(compatibilityLevel(65)).toBe('medium');
    expect(compatibilityLevel(64)).toBe('low');
    expect(compatibilityLevel(45)).toBe('low');
    expect(compatibilityLevel(44)).toBe('veryLow');
    expect(compatibilityLevel(0)).toBe('veryLow');
  });

  it('usa o valor arredondado exibido, para o rótulo bater com o número', () => {
    expect(compatibilityLevel(94.6)).toBe('veryHigh'); // aparece como 95%
    expect(compatibilityLevel(94.4)).toBe('high'); // aparece como 94%
    expect(compatibilityLevel(44.6)).toBe('low'); // aparece como 45%
    expect(compatibilityLevel(44.4)).toBe('veryLow'); // aparece como 44%
  });
});
