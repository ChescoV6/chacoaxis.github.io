import { LANG } from '../i18n';
import type { PremiumReport } from '../types/quiz';
import type { SavedAnswers } from '../utils/quizProgress';
import { request } from './quizApi';

/**
 * Relatório Completo. O resultado é definido pelos 12 valores dos eixos (ordem de axes.json); as respostas são
 * opcionais e só acrescentam, por eixo, o que mais pesou. Aberto a todos, sem paywall nem token de acesso.
 */
// As escolhas de religião ficam junto das de arquétipo no progresso salvo, mas não são perguntas de arquétipo: o
// servidor recusa o pedido (400) se elas forem junto. O envio do resultado também as tira.
const NON_ARCHETYPE_STEP_IDS = ['religiao', 'denominacao'];

export function archetypeOnly(choices: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(choices).filter(([id]) => !NON_ARCHETYPE_STEP_IDS.includes(id)));
}

export function fetchPremiumReport(
  vector: number[],
  saved: Pick<SavedAnswers, 'variant' | 'answers' | 'archetypeChoices'> | null,
  religion: string | null
): Promise<PremiumReport> {
  const religionParam = religion ? `&religion=${encodeURIComponent(religion)}` : '';
  return request<PremiumReport>(`/api/premium/report?lang=${LANG}${religionParam}`, {
    method: 'POST',
    body: JSON.stringify({
      v: vector.join(','),
      answers: saved ? Object.entries(saved.answers).map(([questionId, answer]) => ({ questionId, answer })) : undefined,
      archetype: saved ? archetypeOnly(saved.archetypeChoices) : undefined
    })
  });
}
