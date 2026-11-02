import { Fragment, useEffect, useState } from 'react';
import { fetchPremiumReport } from '../../../services/premiumApi';
import type { Axis, AxisResult, PremiumReport } from '../../../types/quiz';
import type { SavedAnswers } from '../../../utils/quizProgress';
import { premiumPanels } from './PremiumPanels';
import { P } from './premiumText';

interface Props {
  /** Os 12 valores do resultado (% do polo esquerdo, na ordem dos eixos): é o que o relatório identifica. */
  vector: number[];
  /** Respostas deste resultado, quando este navegador as tem: só acrescentam o que mais pesou em cada eixo. */
  answers: Pick<SavedAnswers, 'variant' | 'answers' | 'archetypeChoices'> | null;
  religion: string | null;
  axes: Axis[];
  results: Map<string, AxisResult>;
  /** Entrega o relatório quando carrega (e null enquanto carrega de novo): a aba "Área de atuação" e o botão de exportar a planilha ficam fora desta seção. */
  onReport?: (report: PremiumReport | null) => void;
}

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; report: PremiumReport };

/** Conteúdo do Relatório Completo: carrega do backend e mostra as seções do relatório. */
export default function PremiumReportSection({ vector, answers, religion, axes, results, onReport }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    onReport?.(null);
    fetchPremiumReport(vector, answers, religion)
      .then((report) => {
        if (cancelled) return;
        setState({ status: 'ready', report });
        onReport?.(report);
      })
      .catch(() => {
        if (cancelled) return;
        setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
    // onReport é um setState estável do pai: não precisa refazer a busca quando muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vector, answers, religion, attempt]);

  if (state.status === 'loading') {
    return (
      <section className="e-panel e-prem" id="premium" aria-busy="true">
        <h2>{P.title}</h2>
        <p className="e-prem-intro" role="status">{P.loading}</p>
      </section>
    );
  }
  if (state.status === 'error') {
    return (
      <section className="e-panel e-prem" id="premium">
        <h2>{P.title}</h2>
        <p className="inline-error" role="alert">{P.error}</p>
        <button className="e-btn e-btn-ghost e-btn-sm" type="button" onClick={() => setAttempt(attempt + 1)}>
          {P.retry}
        </button>
      </section>
    );
  }

  const { report } = state;
  return (
    <>
      {premiumPanels(report, axes, results).map(({ id, node }) => (
        <Fragment key={id}>{node}</Fragment>
      ))}
    </>
  );
}
