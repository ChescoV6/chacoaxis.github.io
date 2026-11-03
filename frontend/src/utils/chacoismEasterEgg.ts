/**
 * Chacoism Easter Egg Detection
 * 
 * Detects when user results match the extreme Third Position ideology profile
 * and shows a special easter egg message alongside the real results.
 */

import type { QuizResult } from '../types/quiz';

export interface ChacoismMatch {
  isChacoism: boolean;
  confidence: number; // 0-100, how close to the ideal Chacoism profile
  message: string;
}

/**
 * Target Chacoism profile based on the reference results:
 * - Extreme economic statism (ECO ~95%)
 * - Extreme authoritarianism (POD ~96%)
 * - Extreme nationalism (NAT ~98%)
 * - Extreme federalism/centralization (FED ~96%)
 * - Extreme social traditionalism (SOC ~90%)
 * - Extreme religious influence (REL ~95%)
 * - Very low on liberty dimensions (SEC, CIV, PRO, MIL all very low)
 * - Very low representation/democracy (REP ~4%)
 * - Very low on structure decentralization (EST ~5-30%)
 */
const CHACOISM_PROFILE = {
  est: { min: 0, max: 35, ideal: 15 },      // Low decentralization (centralized)
  rep: { min: 0, max: 10, ideal: 4 },       // Extreme anti-democracy
  pod: { min: 90, max: 100, ideal: 96 },    // Extreme authoritarianism
  eco: { min: 90, max: 100, ideal: 95 },    // Extreme economic statism
  fed: { min: 90, max: 100, ideal: 96 },    // Extreme centralization
  sec: { min: 0, max: 15, ideal: 4 },       // Very low security liberty
  civ: { min: 0, max: 70, ideal: 10 },      // Low civil liberties (flexible)
  soc: { min: 85, max: 100, ideal: 90 },    // Extreme traditionalism
  rel: { min: 85, max: 100, ideal: 95 },    // Extreme religious influence
  pro: { min: 0, max: 15, ideal: 5 },       // Very low progressive
  mil: { min: 0, max: 15, ideal: 3 },       // Very low military restraint
  nat: { min: 90, max: 100, ideal: 98 },    // Extreme nationalism
};

const CHACOISM_THRESHOLD = 85; // Need 85%+ match confidence to trigger

/**
 * Check if quiz results match the Chacoism profile
 */
export function detectChacoism(result: QuizResult): ChacoismMatch {
  const scores = {
    est: result.axes[0].leftPercent,
    rep: result.axes[1].leftPercent,
    pod: result.axes[2].leftPercent,
    eco: result.axes[3].leftPercent,
    fed: result.axes[4].leftPercent,
    sec: result.axes[5].leftPercent,
    civ: result.axes[6].leftPercent,
    soc: result.axes[7].leftPercent,
    rel: result.axes[8].leftPercent,
    pro: result.axes[9].leftPercent,
    mil: result.axes[10].leftPercent,
    nat: result.axes[11].leftPercent,
  };

  let totalMatch = 0;
  let axisCount = 0;

  // Calculate how close each axis is to the Chacoism profile
  for (const [axis, value] of Object.entries(scores)) {
    const profile = CHACOISM_PROFILE[axis as keyof typeof CHACOISM_PROFILE];
    
    if (value >= profile.min && value <= profile.max) {
      // Within range - calculate closeness to ideal
      const distance = Math.abs(value - profile.ideal);
      const maxDistance = Math.max(
        Math.abs(profile.max - profile.ideal),
        Math.abs(profile.min - profile.ideal)
      );
      const match = 100 * (1 - distance / maxDistance);
      totalMatch += match;
    } else {
      // Outside range - penalize based on distance
      const distance = Math.min(
        Math.abs(value - profile.min),
        Math.abs(value - profile.max)
      );
      const penalty = Math.max(0, 100 - distance * 2);
      totalMatch += penalty;
    }
    
    axisCount++;
  }

  const confidence = totalMatch / axisCount;
  const isChacoism = confidence >= CHACOISM_THRESHOLD;

  let message = '';
  if (isChacoism) {
    if (confidence >= 95) {
      message = '🎉 CONGRATULATIONS! You are a true Chacoist! Your ideology perfectly embodies the principles of Third Position Chacoism: extreme nationalism, traditional values, strong centralized authority, and total state control over economy and society. The Chaco flag flies proudly for you!';
    } else if (confidence >= 90) {
      message = '🏴 Well done! You\'re a strong Chacoist! Your beliefs align closely with Third Position Chacoism, embracing authoritarian nationalism, traditional social values, and economic statism. You understand the true meaning of strength and order!';
    } else {
      message = '⚡ You\'re a Chacoist! Your political profile matches the rare ideology of Chacoism - a Third Position blend of extreme nationalism, authoritarianism, traditionalism, and state control. Few reach this level of ideological consistency!';
    }
  }

  return {
    isChacoism,
    confidence,
    message,
  };
}

/**
 * Get the Chacoism flag path
 */
export function getChacoismFlagPath(): string {
  return '/countries/flags/chaco.png';
}

/**
 * Chacoism ideology data for display
 */
export const CHACOISM_IDEOLOGY = {
  ideologyId: 'chacoism',
  name: 'Chacoism',
  category: 'Third Position',
  description: 'An extreme Third Position ideology combining ultranationalism, authoritarianism, religious traditionalism, and complete state economic control. Named after the person Chesco, it represents an uncompromising synthesis of nationalist supremacy, centralized power, and traditional social order under one unified authority.',
  longDescription: 'Chacoism is a rare Third Position ideology that pushes nationalist authoritarianism to its absolute extreme. It advocates for total centralized power under a strong leader, complete state control over all economic activity, strict enforcement of traditional religious and social values, and uncompromising ethnic nationalism. This ideology rejects liberal democracy, individual rights, communist internationalism, and any form of pluralism in favor of a unified ethno-nationalist state where the collective will of the nation is embodied in absolute authority. Compatibility indicates how close your answers are to this profile.',
  phrase: 'I want a nation unified under one supreme authority with total state control, traditional values enforced by religious law, and nationalism as the foundation of all policy.',
  compatibility: 100,
};
