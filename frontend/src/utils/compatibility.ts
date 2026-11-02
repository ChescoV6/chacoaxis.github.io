export type CompatibilityLevel = 'veryHigh' | 'high' | 'medium' | 'low' | 'veryLow';

/**
 * Faixa de compatibilidade a partir do percentual. Usa o valor arredondado, o mesmo que aparece
 * na tela, para que "95%" nunca venha rotulado como "alta".
 *
 * 95 ou mais: muito alta · 85-94: alta · 65-84: média · 45-64: baixa · até 44: muito baixa.
 */
export function compatibilityLevel(value: number): CompatibilityLevel {
  const pct = Math.round(value);
  if (pct >= 95) return 'veryHigh';
  if (pct >= 85) return 'high';
  if (pct >= 65) return 'medium';
  if (pct >= 45) return 'low';
  return 'veryLow';
}
