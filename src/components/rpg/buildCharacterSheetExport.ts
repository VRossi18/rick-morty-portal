import {
   BASE_SCORE,
   FINAL_SCORE_WARNING_THRESHOLD,
   MAX_SCORE_BEFORE_RACE,
   MIN_SCORE_BEFORE_RACE,
   POINT_POOL_MAX,
} from './characterCreationMath';
import { buildDerivedSheet } from './rpgDerivedSheet';
import { ABILITY_IDS } from './types';
import type { AbilityId, AbilityScores, RaceDefinition, RaceId } from './types';

export type CharacterSheetExportTranslate = (key: string) => string;

export const CHARACTER_SHEET_EXPORT_SCHEMA_VERSION = 3 as const;

export interface CharacterSheetExportInput {
   exportedAt: string;
   locale: string;
   characterName: string;
   generator?: string;
   schemaVersion?: number;
   selectedRaceId: RaceId;
   selectedRace: RaceDefinition;
   scores: AbilityScores;
   sheetRacialBonus: Record<AbilityId, number>;
   sheetDrawback: Record<AbilityId, number>;
   totals: AbilityScores;
   highTotalFlags: Record<AbilityId, boolean>;
   spent: number;
   remaining: number;
   humanBonusChoices: readonly [AbilityId, AbilityId];
}

export interface CharacterSheetExportMeta {
   schemaVersion: number;
   exportedAt: string;
   locale: string;
   app: string;
   generator?: string;
   llmInstructions: string;
}

export interface CharacterSheetExportDerivedFormulas {
   hitPoints: string;
   physicalAttack: string;
   magicalAttack: string;
   socialPool: string;
   dexSpeed: string;
   stealth: string;
}

export interface CharacterSheetExportRules {
   summary: string;
   baseScore: number;
   minScoreBeforeRace: number;
   maxScoreBeforeRace: number;
   pointPoolMax: number;
   finalScoreWarningThreshold: number;
   derivedFormulas: CharacterSheetExportDerivedFormulas;
}

export interface CharacterSheetExportPointPool {
   max: number;
   spent: number;
   remaining: number;
}

export interface CharacterSheetExportRaceSkillAttack {
   id: 'attack1' | 'attack2';
   name: string;
   summary: string;
}

export interface CharacterSheetExportRaceSkillSupport {
   id: 'support';
   name: string;
   summary: string;
}

export interface CharacterSheetExportRaceSkillItem {
   id: 'item';
   name: string;
   summary: string;
   outOfCombat: string;
}

export interface CharacterSheetExportRaceSkills {
   attacks: [CharacterSheetExportRaceSkillAttack, CharacterSheetExportRaceSkillAttack];
   support: CharacterSheetExportRaceSkillSupport;
   item: CharacterSheetExportRaceSkillItem;
}

export interface CharacterSheetExportRace {
   id: RaceId;
   name: string;
   visualDescription: string;
   drawbackDescription: string;
   portraitUrl: string;
   racialModifiers: Record<AbilityId, number>;
   drawbackModifiers: Record<AbilityId, number>;
   skills: CharacterSheetExportRaceSkills;
}

export interface CharacterSheetExportHumanSlot {
   abilityId: AbilityId;
   abilityName: string;
}

export interface CharacterSheetExportHumanPlaystyle {
   title: string;
   summary: string;
}

export interface CharacterSheetExportHuman {
   bonusSlots: [CharacterSheetExportHumanSlot, CharacterSheetExportHumanSlot];
   playstyle: CharacterSheetExportHumanPlaystyle;
}

export interface CharacterSheetExportAbilityRow {
   id: AbilityId;
   name: string;
   base: number;
   pointsInvested: number;
   racialBonus: number;
   drawback: number;
   total: number;
   highTotalWarning: boolean;
   d20Modifier: number;
}

export interface CharacterSheetExportCharacter {
   name: string;
}

export interface CharacterSheetExportDerived {
   hitPointsMax: number;
   physicalAttackRating: number;
   magicalAttackRating: number;
   socialInfluencePool: number;
   dexSpeedTier: number;
   extraStrikesBeforeEnemy: number;
   stealthRating: number;
   stealthRacialBonus: number;
}

export interface CharacterSheetExportDocument {
   meta: CharacterSheetExportMeta;
   character: CharacterSheetExportCharacter;
   rules: CharacterSheetExportRules;
   pointPool: CharacterSheetExportPointPool;
   race: CharacterSheetExportRace;
   derived: CharacterSheetExportDerived;
   human?: CharacterSheetExportHuman;
   abilities: CharacterSheetExportAbilityRow[];
}

/** @deprecated Use {@link CharacterSheetExportDocument}; kept for older imports. */
export type CharacterSheetExportV1 = CharacterSheetExportDocument;

function fullAbilityRecord(
   partial: Partial<Record<AbilityId, number>> | undefined,
): Record<AbilityId, number> {
   const out: Record<AbilityId, number> = { str: 0, dex: 0, con: 0, int: 0, cha: 0 };
   if (!partial) {
      return out;
   }
   for (const id of ABILITY_IDS) {
      const v = partial[id];
      if (typeof v === 'number') {
         out[id] = v;
      }
   }
   return out;
}

function d20Modifier(total: number): number {
   return Math.floor((total - 10) / 2);
}

function raceSkillsFromLocale(
   t: CharacterSheetExportTranslate,
   raceId: RaceId,
): CharacterSheetExportRaceSkills {
   const p = `rpg.races.${raceId}.skills`;
   return {
      attacks: [
         {
            id: 'attack1',
            name: t(`${p}.attack1.name`),
            summary: t(`${p}.attack1.summary`),
         },
         {
            id: 'attack2',
            name: t(`${p}.attack2.name`),
            summary: t(`${p}.attack2.summary`),
         },
      ],
      support: {
         id: 'support',
         name: t(`${p}.support.name`),
         summary: t(`${p}.support.summary`),
      },
      item: {
         id: 'item',
         name: t(`${p}.item.name`),
         summary: t(`${p}.item.summary`),
         outOfCombat: t(`${p}.item.outOfCombat`),
      },
   };
}

export function buildCharacterSheetExport(
   t: CharacterSheetExportTranslate,
   input: CharacterSheetExportInput,
): CharacterSheetExportDocument {
   const schemaVersion = input.schemaVersion ?? CHARACTER_SHEET_EXPORT_SCHEMA_VERSION;
   const raceId = input.selectedRace.id;
   const trimmedName = input.characterName.trim();
   const derivedSheet = buildDerivedSheet(input.totals, raceId);

   const race: CharacterSheetExportRace = {
      id: raceId,
      name: t(`rpg.races.${raceId}.name`),
      visualDescription: t(`rpg.races.${raceId}.visualDescription`),
      drawbackDescription: t(`rpg.races.${raceId}.drawbackDescription`),
      portraitUrl: input.selectedRace.portraitUrl,
      racialModifiers: fullAbilityRecord(input.selectedRace.modifiers),
      drawbackModifiers: fullAbilityRecord(input.selectedRace.drawbackModifiers),
      skills: raceSkillsFromLocale(t, raceId),
   };

   const abilities: CharacterSheetExportAbilityRow[] = ABILITY_IDS.map((id) => ({
      id,
      name: t(`rpg.abilities.${id}`),
      base: input.scores[id],
      pointsInvested: input.scores[id] - BASE_SCORE,
      racialBonus: input.sheetRacialBonus[id],
      drawback: input.sheetDrawback[id],
      total: input.totals[id],
      highTotalWarning: input.highTotalFlags[id],
      d20Modifier: d20Modifier(input.totals[id]),
   }));

   const derived: CharacterSheetExportDerived = {
      hitPointsMax: derivedSheet.hitPointsMax,
      physicalAttackRating: derivedSheet.physicalAttackRating,
      magicalAttackRating: derivedSheet.magicalAttackRating,
      socialInfluencePool: derivedSheet.socialInfluencePool,
      dexSpeedTier: derivedSheet.dexSpeedTier,
      extraStrikesBeforeEnemy: derivedSheet.extraStrikesBeforeEnemy,
      stealthRating: derivedSheet.stealthRating,
      stealthRacialBonus: derivedSheet.stealthRacialBonus,
   };

   const out: CharacterSheetExportDocument = {
      meta: {
         schemaVersion,
         exportedAt: input.exportedAt,
         locale: input.locale,
         app: 'rick-morty-portal',
         ...(input.generator ? { generator: input.generator } : {}),
         llmInstructions: t('rpg.llmInstructions'),
      },
      character: {
         name: trimmedName,
      },
      rules: {
         summary: t('rpg.subtitle'),
         baseScore: BASE_SCORE,
         minScoreBeforeRace: MIN_SCORE_BEFORE_RACE,
         maxScoreBeforeRace: MAX_SCORE_BEFORE_RACE,
         pointPoolMax: POINT_POOL_MAX,
         finalScoreWarningThreshold: FINAL_SCORE_WARNING_THRESHOLD,
         derivedFormulas: {
            hitPoints: t('rpg.derivedFormulas.hitPoints'),
            physicalAttack: t('rpg.derivedFormulas.physicalAttack'),
            magicalAttack: t('rpg.derivedFormulas.magicalAttack'),
            socialPool: t('rpg.derivedFormulas.socialPool'),
            dexSpeed: t('rpg.derivedFormulas.dexSpeed'),
            stealth: t('rpg.derivedFormulas.stealth'),
         },
      },
      pointPool: {
         max: POINT_POOL_MAX,
         spent: input.spent,
         remaining: input.remaining,
      },
      race,
      derived,
      abilities,
   };

   if (input.selectedRaceId === 'humans') {
      const [a, b] = input.humanBonusChoices;
      out.human = {
         bonusSlots: [
            { abilityId: a, abilityName: t(`rpg.abilities.${a}`) },
            { abilityId: b, abilityName: t(`rpg.abilities.${b}`) },
         ],
         playstyle: {
            title: t('rpg.human.playstyleTitle'),
            summary: t('rpg.human.playstyleSummary'),
         },
      };
   }

   return out;
}
