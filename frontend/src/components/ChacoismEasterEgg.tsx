/**
 * Chacoism Easter Egg Banner
 * Shows as an integrated section in results when user matches the Chacoism profile
 */

import type { ChacoismMatch } from '../utils/chacoismEasterEgg';
import { CHACOISM_IDEOLOGY, getChacoismFlagPath } from '../utils/chacoismEasterEgg';
import { resolveCountryFlagSrc } from '../utils/countryFlags';

interface ChacoismEasterEggProps {
  match: ChacoismMatch;
}

export function ChacoismEasterEgg({ match }: ChacoismEasterEggProps) {
  if (!match.isChacoism) {
    return null;
  }

  const flagSrc = resolveCountryFlagSrc(getChacoismFlagPath());

  return (
    <article className="e-panel e-chacoism-card">
      <div className="e-chacoism-header">
        <div className="e-chacoism-flag-wrap">
          <img 
            src={flagSrc} 
            alt="Chacoism Flag" 
            className="e-chacoism-flag"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="e-chacoism-title-wrap">
          <span className="e-tag">{CHACOISM_IDEOLOGY.category}</span>
          <h3 className="e-chacoism-title">{CHACOISM_IDEOLOGY.name}</h3>
          <p className="e-chacoism-confidence">{match.confidence.toFixed(0)}% match</p>
        </div>
      </div>

      <blockquote className="e-chacoism-phrase">
        {CHACOISM_IDEOLOGY.phrase}
      </blockquote>

      <p className="e-chacoism-description">
        {CHACOISM_IDEOLOGY.description}
      </p>

      <p className="e-chacoism-note">
        ✦ You've unlocked a rare easter egg ideology based on your extreme results ✦
      </p>
    </article>
  );
}
