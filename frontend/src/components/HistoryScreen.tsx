import { useState, useEffect } from 'react';
import { loadTestHistory, deleteHistoryEntry, clearTestHistory, type HistoryEntry } from '../utils/testHistory';
import { t } from '../i18n';
import { resolvePersonalityImageSrc, personalityInitials } from '../utils/personalityImage';
import { resolveCountryFlagSrc } from '../utils/countryFlags';
import { resolvePartyLogoSrc } from '../utils/partyLogos';

interface HistoryScreenProps {
  onClose: () => void;
  lang: string;
}

// Mini compass visualization for ideology matches
function IdeologyCompass({ entry }: { entry: HistoryEntry }) {
  // Calculate position on 2D compass based on key axes
  const economicAxis = (entry.scores.eco - 50) / 50; // -1 to 1 (left to right)
  const authAxis = (entry.scores.pod - 50) / 50; // -1 to 1 (libertarian to authoritarian)
  
  return (
    <svg className="e-history-compass" viewBox="0 0 120 120" width="120" height="120">
      {/* Background */}
      <rect x="0" y="0" width="120" height="120" fill="white" rx="12" />
      
      {/* Quadrant fills */}
      <rect x="0" y="0" width="60" height="60" fill="var(--i-esquerda-bg)" opacity="0.4" />
      <rect x="60" y="0" width="60" height="60" fill="var(--i-direita-bg)" opacity="0.4" />
      <rect x="0" y="60" width="60" height="60" fill="var(--i-libertario-bg)" opacity="0.4" />
      <rect x="60" y="60" width="60" height="60" fill="var(--i-ext-direita-bg)" opacity="0.4" />
      
      {/* Center lines */}
      <line x1="60" y1="10" x2="60" y2="110" stroke="var(--ink-300)" strokeWidth="1.5" />
      <line x1="10" y1="60" x2="110" y2="60" stroke="var(--ink-300)" strokeWidth="1.5" />
      
      {/* Labels */}
      <text x="60" y="18" fontSize="10" fill="var(--ink-600)" textAnchor="middle" fontWeight="600">Auth</text>
      <text x="60" y="112" fontSize="10" fill="var(--ink-600)" textAnchor="middle" fontWeight="600">Lib</text>
      <text x="18" y="65" fontSize="10" fill="var(--ink-600)" textAnchor="middle" fontWeight="600">Left</text>
      <text x="102" y="65" fontSize="10" fill="var(--ink-600)" textAnchor="middle" fontWeight="600">Right</text>
      
      {/* Border */}
      <rect x="0" y="0" width="120" height="120" fill="none" stroke="var(--ink-300)" strokeWidth="2" rx="12" />
      
      {/* User position dot with glow */}
      <circle
        cx={60 + economicAxis * 45}
        cy={60 + authAxis * 45}
        r="8"
        fill="var(--green-600)"
        opacity="0.2"
      />
      <circle
        cx={60 + economicAxis * 45}
        cy={60 + authAxis * 45}
        r="5"
        fill="var(--green-600)"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
}

export function HistoryScreen({ onClose, lang }: HistoryScreenProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  useEffect(() => {
    // Check if we need to migrate or clear old data
    const STORAGE_KEY = '12axes-test-history';
    const MIGRATION_KEY = '12axes-history-v2';
    
    try {
      const needsMigration = !localStorage.getItem(MIGRATION_KEY);
      
      if (needsMigration) {
        // Clear old incompatible data
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(MIGRATION_KEY, 'true');
        console.log('[History] Cleared old history format, ready for new entries with images');
        setHistory([]);
      } else {
        setHistory(loadTestHistory());
      }
    } catch (e) {
      console.warn('[History] Migration check failed, loading history anyway');
      setHistory(loadTestHistory());
    }
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setHistory(loadTestHistory());
    setDeleteConfirm(null);
  };

  const handleClearAll = () => {
    clearTestHistory();
    setHistory([]);
    setClearConfirm(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMatchTypeLabel = (type: HistoryEntry['matchType']) => {
    switch (type) {
      case 'ideology':
        return t.historyMatchIdeology;
      case 'personality':
        return t.historyMatchPersonality;
      case 'country':
        return t.historyMatchCountry;
      case 'party':
        return t.historyMatchParty;
    }
  };

  const getProfileUrl = (entry: HistoryEntry) => {
    const prefix = lang === 'pt' ? '' : '/en';
    switch (entry.matchType) {
      case 'ideology':
        return `${prefix}/ideologies/${entry.matchSlug}`;
      case 'personality':
        return `${prefix}/personalities/${entry.matchSlug}`;
      case 'country':
        return `${prefix}/countries/${entry.matchSlug}`;
      case 'party':
        return `${prefix}/parties/${entry.matchSlug}`;
    }
  };

  // Render visual element based on match type
  const renderMatchVisual = (entry: HistoryEntry) => {
    switch (entry.matchType) {
      case 'ideology':
        return <IdeologyCompass entry={entry} />;
      
      case 'personality': {
        const imageSrc = entry.imagePath ? resolvePersonalityImageSrc(entry.imagePath) : '';
        return (
          <div className="e-history-portrait">
            {imageSrc && (
              <img src={imageSrc} alt={entry.matchName} onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.add('e-visible');
              }} />
            )}
            <div className={!imageSrc ? 'e-history-initials e-visible' : 'e-history-initials'}>
              {personalityInitials(entry.matchName)}
            </div>
          </div>
        );
      }
      
      case 'country': {
        const flagSrc = entry.imagePath ? resolveCountryFlagSrc(entry.imagePath) : '';
        return (
          <div className="e-history-flag">
            {flagSrc ? (
              <img 
                src={flagSrc} 
                alt={entry.matchName}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="e-history-flag-placeholder">
                {entry.matchName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        );
      }
      
      case 'party': {
        const logoSrc = entry.imagePath ? resolvePartyLogoSrc(entry.imagePath) : '';
        return (
          <div className="e-history-logo">
            {logoSrc && (
              <img src={logoSrc} alt={entry.matchName} onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.add('e-visible');
              }} />
            )}
            <div className={!logoSrc ? 'e-history-logo-placeholder e-visible' : 'e-history-logo-placeholder'}>
              {entry.matchName.charAt(0)}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="e-screen e-history">
      <header className="e-header">
        <div className="e-wrap">
          <button className="e-btn e-btn-icon" onClick={onClose} aria-label={t.closeLabel}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="e-title">{t.historyTitle}</h1>
        </div>
      </header>

      <div className="e-content">
        <div className="e-wrap e-wrap-narrow">
          {history.length === 0 ? (
            <div className="e-history-empty">
              <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{t.historyEmpty}</p>
            </div>
          ) : (
            <>
              <div className="e-history-actions">
                <p className="e-history-count">
                  {t.historyCount(history.length)}
                </p>
                {history.length > 0 && (
                  <button
                    className="e-btn e-btn-ghost e-btn-sm"
                    onClick={() => setClearConfirm(true)}
                  >
                    {t.historyClearAll}
                  </button>
                )}
              </div>

              <div className="e-history-list">
                {history.map((entry) => (
                  <article key={entry.id} className="e-history-card">
                    <div className="e-history-card-header">
                      <div className="e-history-card-meta">
                        <span className="e-history-card-type">
                          {getMatchTypeLabel(entry.matchType)}
                        </span>
                        <time className="e-history-card-date">
                          {formatDate(entry.timestamp)}
                        </time>
                      </div>
                      <button
                        className="e-btn e-btn-icon e-btn-sm"
                        onClick={() => setDeleteConfirm(entry.id)}
                        aria-label={t.historyDelete}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h12M5 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6h12z" />
                        </svg>
                      </button>
                    </div>

                    <div className="e-history-card-content">
                      <div className="e-history-visual">
                        {renderMatchVisual(entry)}
                      </div>

                      <div className="e-history-card-info">
                        <h3 className="e-history-card-match">
                          <a href={getProfileUrl(entry)} className="e-history-card-link">
                            {entry.matchName}
                          </a>
                        </h3>

                        <div className="e-history-card-scores">
                          {Object.entries(entry.scores).map(([axis, value]) => (
                            <div key={axis} className="e-history-score">
                              <span className="e-history-score-label">{axis.toUpperCase()}</span>
                              <span className="e-history-score-value">{value.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="e-history-card-actions">
                      <a href={entry.url} className="e-btn e-btn-primary e-btn-sm">
                        {t.historyViewResult}
                      </a>
                    </div>

                    {deleteConfirm === entry.id && (
                      <div className="e-history-delete-confirm">
                        <p>{t.historyDeleteConfirm}</p>
                        <div className="e-history-delete-actions">
                          <button
                            className="e-btn e-btn-danger e-btn-sm"
                            onClick={() => handleDelete(entry.id)}
                          >
                            {t.historyDeleteYes}
                          </button>
                          <button
                            className="e-btn e-btn-ghost e-btn-sm"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            {t.historyDeleteNo}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {clearConfirm && (
        <div className="e-modal-overlay" onClick={() => setClearConfirm(false)}>
          <div className="e-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="e-modal-title">{t.historyClearConfirm}</h2>
            <p className="e-modal-body">{t.historyClearConfirmBody}</p>
            <div className="e-modal-actions">
              <button className="e-btn e-btn-danger" onClick={handleClearAll}>
                {t.historyClearYes}
              </button>
              <button className="e-btn e-btn-ghost" onClick={() => setClearConfirm(false)}>
                {t.historyClearNo}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
