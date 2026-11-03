import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { LANG, t } from '../../i18n';
import type { Axis, AxisResult, PremiumReport, QuizPayload, QuizResult } from '../../types/quiz';
import { catStyle } from '../../utils/ideologyColors';
import { PdfReport } from '../report/PdfReport';
import '../../styles/report.css';
import { BooksSection } from '../results/BooksSection';
import { AreasSection } from '../results/AreasSection';
import { AxesSection } from '../results/AxesSection';
import { CompareSection } from '../results/CompareSection';
import { ComparePersonSection } from '../results/ComparePersonSection';
import { CountriesSection } from '../results/CountriesSection';
import { IdeologiesSection } from '../results/IdeologiesSection';
import { PartiesSection } from '../results/PartiesSection';
import { PersonalitiesSection } from '../results/PersonalitiesSection';
import { PoliticalCompassSection } from '../results/PoliticalCompassSection';
import { PhraseSection } from '../results/PhraseSection';
import { ResultsNav } from '../results/ResultsNav';
import { SharePreviewSection } from '../results/SharePreviewSection';
import { SignatureSection } from '../results/SignatureSection';
import { PoliticalValuesSection } from '../results/PoliticalValuesSection';
import { computeCompass } from '../../utils/politicalCompass';
import { PARTIES_ENABLED } from '../../utils/partyLogos';
import type { SavedAnswers } from '../../utils/quizProgress';
import type { Religion } from '../../utils/religion';
import { CsvIcon, DownloadIcon, Ring, ShareImageIcon } from './primitives';
import { track } from '../../utils/analytics';
import { downloadRankingXlsx } from '../../utils/rankingXlsx';
import type { ChacoismMatch } from '../../utils/chacoismEasterEgg';
import { ChacoismEasterEgg } from '../ChacoismEasterEgg';

const PremiumReportSection = lazy(() => import('../results/premium/PremiumReportSection'));

interface ResultsScreenProps {
  result: QuizResult;
  quiz: QuizPayload | null;
  axes: Axis[];
  axisResults: Map<string, AxisResult>;
  isSharing: boolean;
  error: string | null;
  onShare: () => void;
  religion?: Religion | null;
  /** Abre a edição das respostas; só vem quando este navegador guardou as respostas deste resultado. */
  onEditAnswers?: () => void;
  /** Respostas deste resultado, quando este navegador as tem: o relatório usa para mostrar o que mais pesou em cada eixo. */
  premiumAnswers?: SavedAnswers | null;
  /** Chacoism easter egg match, when extreme Third Position scores detected */
  chacoismMatch?: ChacoismMatch | null;
}

export function ResultsScreen({ result, quiz, axes, axisResults, isSharing, error, onShare, religion, onEditAnswers, premiumAnswers, chacoismMatch }: ResultsScreenProps) {
  const top = result.topMatch;
  const showParties = PARTIES_ENABLED && (result.topPartyMatches?.length ?? 0) > 0;
  const politicalValues = result.politicalValues ?? [];
  const compass = computeCompass(axisResults);
  const [printingPdf, setPrintingPdf] = useState(false);
  // Identidade do resultado para o relatório: os 12 valores, na ordem dos eixos.
  const premiumVector = useMemo(() => result.axes.map((axis) => axis.leftPercent), [result]);
  // O relatório, quando carregado: de lá vêm a aba "Área de atuação" e o ranking da planilha.
  const [premiumReport, setPremiumReport] = useState<PremiumReport | null>(null);

  // O PDF é do Relatório completo: o relatório precisa estar pronto antes de imprimir.
  const handlePdf = () => {
    track('pdf_export_click', { locked: false });
    setPrintingPdf(true);
  };

  // O relatório é montado fora da tela; quando imagens e fontes carregam, o diálogo de
  // impressão do navegador gera o PDF. O título da aba vira o nome sugerido do arquivo.
  useEffect(() => {
    if (!printingPdf) {
      return;
    }
    let cancelled = false;
    const previousTitle = document.title;
    const finish = () => {
      document.title = previousTitle;
      setPrintingPdf(false);
    };
    (async () => {
      const images = Array.from(document.querySelectorAll<HTMLImageElement>('.rp-root img'));
      // O relatório fica fora da tela, e imagens "lazy" fora da tela nunca carregam: sem isto a espera abaixo não termina.
      images.forEach((img) => {
        img.loading = 'eager';
      });
      // Teto de 12 s: uma imagem que não chega não pode travar a geração do PDF.
      await Promise.race([
        Promise.allSettled(images.map((img) => (img.complete ? Promise.resolve() : img.decode()))),
        new Promise((resolve) => setTimeout(resolve, 12000))
      ]);
      await document.fonts?.ready;
      if (cancelled) {
        return;
      }
      document.title = `${t.report.fileName}-${new Date().toISOString().slice(0, 10)}`;
      window.addEventListener('afterprint', finish, { once: true });
      window.print();
    })();
    return () => {
      cancelled = true;
      window.removeEventListener('afterprint', finish);
    };
  }, [printingPdf]);

  // Compartilhar, baixar o PDF e exportar a planilha: logo depois do cartão do resultado e, de novo, no fim.
  const actions = (
    <div className="e-actions">
      <button className="e-btn e-btn-primary" type="button" onClick={onShare} disabled={isSharing}>
        {isSharing ? t.generatingPng : t.saveOrShare} <ShareImageIcon />
      </button>
      <button className="e-btn e-btn-ghost" type="button" onClick={handlePdf} disabled={printingPdf || !premiumReport}>
        {printingPdf ? t.generatingPdf : t.downloadPdf} <DownloadIcon />
      </button>
      {premiumReport && (
        <button className="e-btn e-btn-ghost" type="button" onClick={() => void downloadRankingXlsx(premiumReport.ranking, LANG, top.category)}>
          {t.exportCsv} <CsvIcon />
        </button>
      )}
    </div>
  );

  return (
    <main className="ed e-res" id="resultados" style={catStyle(top.category) as CSSProperties}>
      <div className="e-wrap e-res-grid">
        <div className="e-res-main">
          <header className="e-res-head">
            <p className="e-eyebrow">{t.resultsEyebrow}</p>
            <h1>
              {t.resultsH1Pre}
              <span>{t.resultsH1Em}</span>
            </h1>
          </header>

          <article className="e-panel e-top">
            <div className="e-top-head">
              <div>
                <span className="e-tag e-tag-solid">{top.category}</span>
                <h2 className={top.name.length >= 18 ? 'e-long-name' : undefined}>{top.name}</h2>
              </div>
              <Ring pct={top.compatibility} size={120} stroke={6} />
            </div>
            <PhraseSection match={top} />
          </article>

          {chacoismMatch?.isChacoism && <ChacoismEasterEgg match={chacoismMatch} />}

          <AxesSection axes={axes} results={axisResults} religion={religion} onEditAnswers={onEditAnswers} />

          <div className="e-actions">
            <button className="e-btn e-btn-ghost" type="button" onClick={onShare} disabled={isSharing}>
              {isSharing ? t.generatingPng : t.saveOrShare} <ShareImageIcon />
            </button>
          </div>

          <SignatureSection unusual={result.mostUnusualAxis} common={result.mostCommonAxis} tension={result.axisTension} axes={axes} results={axisResults} />

          <CountriesSection
            current={result.topCountryMatch}
            historical={result.topHistoricalCountryMatch}
            dimensions={result.countryDimensionMatches}
            distant={result.bottomCountryMatches}
            axes={axes}
            results={axisResults}
          />

          <PersonalitiesSection
            top={result.topPersonalityMatch}
            dimensions={result.dimensionMatches}
            distant={result.bottomPersonalityMatches}
            axes={axes}
            results={axisResults}
          />

          <AreasSection
            generalMatches={result.personalityMatches}
            areaMatches={premiumReport?.personalitiesByArea ?? []}
            axes={axes}
            results={axisResults}
          />

          <BooksSection books={result.bookRecommendations} />

          {/* Cartão do resultado e as ações (compartilhar, PDF, planilha): logo depois dos livros. */}
          <SharePreviewSection result={result} quiz={quiz} axes={axes} religion={religion} isSharing={isSharing} onShare={onShare} />

          {actions}
          {error && <p className="inline-error" role="alert">{error}</p>}

          {showParties && (
            <PartiesSection
              current={result.topPartyMatch}
              historical={result.topHistoricalPartyMatch}
              top={result.topPartyMatches ?? []}
              dimensions={result.partyDimensionMatches ?? []}
              distant={result.bottomPartyMatches ?? []}
              axes={axes}
              results={axisResults}
            />
          )}

          <PoliticalValuesSection values={politicalValues} category={top.category} religion={religion} />

          <IdeologiesSection others={result.matches.slice(1, 4)} distant={result.bottomIdeologyMatch} />

          {compass && <PoliticalCompassSection position={compass} category={top.category} moralAxis={axes.find((axis) => axis.id === 'moral')} />}

          <Suspense fallback={null}>
            <PremiumReportSection
              vector={premiumVector}
              answers={premiumAnswers ?? null}
              religion={religion ?? null}
              axes={axes}
              results={axisResults}
              onReport={(report) => {
                setPremiumReport(report);
                if (report) track('premium_report_view');
              }}
            />
          </Suspense>

          {actions}

          <ComparePersonSection axes={axes} results={axisResults} religion={religion} />

          <CompareSection
            axes={axes}
            results={axisResults}
            religion={religion}
            userCategory={top.category}
            closest={result.topPersonalityMatch}
            farthest={result.bottomPersonalityMatches?.[0] ?? null}
          />
        </div>

        <aside className="e-side" aria-label={t.resultsSummaryAria}>
          <ResultsNav hasBooks={(result.bookRecommendations?.length ?? 0) > 0} hasCompass={compass !== null} hasParties={showParties} hasValues={politicalValues.length > 0} />
        </aside>
      </div>
      {printingPdf &&
        createPortal(
          <div className="rp-root" aria-hidden="true">
            <PdfReport
              result={result}
              axes={axes}
              axisResults={axisResults}
              answeredCount={quiz ? quiz.questions.length : null}
              religion={religion}
              premium={premiumReport}
            />
          </div>,
          document.body
        )}
    </main>
  );
}
