import type { AbilityScores, RaceId } from './types';

/** Base term in max HP = `DERIVED_HP_BASE + totals.con` (monotonic in CON). */
export const DERIVED_HP_BASE = 10;

/**
 * Extra player attacks that resolve before a typical enemy's first strike.
 * DEX total thresholds: &lt;14 → 0, 14–15 → 1, 16–17 → 2, ≥18 → 3.
 */
export function extraStrikesBeforeEnemy(dexTotal: number): number {
   if (dexTotal >= 18) {
      return 3;
   }
   if (dexTotal >= 16) {
      return 2;
   }
   if (dexTotal >= 14) {
      return 1;
   }
   return 0;
}

export type DexSpeedTier = 0 | 1 | 2 | 3;

export function dexSpeedTier(dexTotal: number): DexSpeedTier {
   const n = extraStrikesBeforeEnemy(dexTotal);
   return n as DexSpeedTier;
}

export function physicalAttackRating(totals: AbilityScores): number {
   return totals.str;
}

export function magicalAttackRating(totals: AbilityScores): number {
   return totals.int;
}

export function socialInfluencePool(totals: AbilityScores): number {
   return totals.cha;
}

export function hitPointsMax(totals: AbilityScores): number {
   return DERIVED_HP_BASE + totals.con;
}

export const STEALTH_RACIAL_BONUS = 2;

export function stealthRacialBonus(raceId: RaceId): number {
   if (raceId === 'birdPeople' || raceId === 'parasites') {
      return STEALTH_RACIAL_BONUS;
   }
   return 0;
}

export function stealthRating(totals: AbilityScores, raceId: RaceId): number {
   return totals.dex + stealthRacialBonus(raceId);
}

export interface RpgDerivedSheet {
   hitPointsMax: number;
   physicalAttackRating: number;
   magicalAttackRating: number;
   socialInfluencePool: number;
   dexSpeedTier: DexSpeedTier;
   extraStrikesBeforeEnemy: number;
   stealthRating: number;
   stealthRacialBonus: number;
}

export function buildDerivedSheet(totals: AbilityScores, raceId: RaceId): RpgDerivedSheet {
   const dex = totals.dex;
   const extra = extraStrikesBeforeEnemy(dex);
   const srb = stealthRacialBonus(raceId);
   return {
      hitPointsMax: hitPointsMax(totals),
      physicalAttackRating: physicalAttackRating(totals),
      magicalAttackRating: magicalAttackRating(totals),
      socialInfluencePool: socialInfluencePool(totals),
      dexSpeedTier: dexSpeedTier(dex),
      extraStrikesBeforeEnemy: extra,
      stealthRating: totals.dex + srb,
      stealthRacialBonus: srb,
   };
}
