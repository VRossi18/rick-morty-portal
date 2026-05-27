import { useCallback, useMemo, useState } from 'react';
import {
   computeSpent,
   computeTotals,
   defaultScores,
   remainingPoints,
   totalExceedsWarning,
   MAX_SCORE_BEFORE_RACE,
   MIN_SCORE_BEFORE_RACE,
   POINT_POOL_MAX,
} from './characterCreationMath';
import type { CharacterPreset, CharacterPresetId } from './presets';
import { defaultRaceId, drawbackModifierMap, getRaceById, mergeAbilityDeltas, racialBonusMap } from './races';
import type { AbilityId, AbilityScores, RaceId } from './types';

/**
 * Point-buy + race: `scores` are capped at 15 before race (`incrementAbility` /
 * `decrementAbility`); `totals` add per-ability deltas on top: racial bonuses,
 * human flexible +1s, and optional `drawbackModifiers` (negative). Example:
 * INT 15 on sheet, +2 racial, -1 drawback → `totals.int` 16.
 */
export function useCharacterCreation() {
   const [characterName, setCharacterName] = useState('');
   const [selectedRaceId, setSelectedRaceId] = useState<RaceId>(() => defaultRaceId());
   const [scores, setScores] = useState<AbilityScores>(() => defaultScores());
   const [humanBonusChoices, setHumanBonusChoices] = useState<[AbilityId, AbilityId]>([
      'str',
      'dex',
   ]);
   const [selectedPresetId, setSelectedPresetId] = useState<CharacterPresetId | null>(null);

   const selectedRace = useMemo(() => getRaceById(selectedRaceId), [selectedRaceId]);

   const sheetRacialBonus = useMemo(() => {
      let withHuman = racialBonusMap(selectedRace);
      if (selectedRaceId === 'humans') {
         const [a, b] = humanBonusChoices;
         withHuman = {
            ...withHuman,
            [a]: withHuman[a] + 1,
            [b]: withHuman[b] + 1,
         };
      }
      return withHuman;
   }, [selectedRace, selectedRaceId, humanBonusChoices]);

   const sheetDrawback = useMemo(() => drawbackModifierMap(selectedRace), [selectedRace]);

   const racialBonus = useMemo(
      () => mergeAbilityDeltas(sheetRacialBonus, sheetDrawback),
      [sheetRacialBonus, sheetDrawback],
   );
   const spent = useMemo(() => computeSpent(scores), [scores]);
   const remaining = useMemo(() => remainingPoints(scores), [scores]);
   const totals = useMemo(() => computeTotals(scores, racialBonus), [scores, racialBonus]);
   const highTotalFlags = useMemo(() => totalExceedsWarning(totals), [totals]);

   const setRace = useCallback((id: RaceId) => {
      setSelectedRaceId(id);
      setSelectedPresetId(null);
   }, []);

   const applyPreset = useCallback((preset: CharacterPreset) => {
      setCharacterName(preset.characterName);
      setSelectedRaceId(preset.raceId);
      setScores({ ...preset.scores });
      setHumanBonusChoices(preset.humanBonusChoices ?? ['str', 'dex']);
      setSelectedPresetId(preset.id);
   }, []);

   const setHumanBonusSlot = useCallback((slot: 0 | 1, ability: AbilityId) => {
      setHumanBonusChoices(([first, second]) => {
         const other = slot === 0 ? second : first;
         if (ability === other) {
            return [first, second];
         }
         return slot === 0 ? [ability, second] : [first, ability];
      });
   }, []);

   const incrementAbility = useCallback((id: AbilityId) => {
      setScores((prev) => {
         const current = prev[id];
         if (current >= MAX_SCORE_BEFORE_RACE) {
            return prev;
         }
         const next = { ...prev, [id]: current + 1 };
         if (computeSpent(next) > POINT_POOL_MAX) {
            return prev;
         }
         return next;
      });
   }, []);

   const decrementAbility = useCallback((id: AbilityId) => {
      setScores((prev) => {
         const current = prev[id];
         if (current <= MIN_SCORE_BEFORE_RACE) {
            return prev;
         }
         return { ...prev, [id]: current - 1 };
      });
   }, []);

   return {
      characterName,
      setCharacterName,
      selectedPresetId,
      selectedRaceId,
      selectedRace,
      scores,
      racialBonus,
      sheetRacialBonus,
      sheetDrawback,
      spent,
      remaining,
      totals,
      highTotalFlags,
      setRace,
      applyPreset,
      incrementAbility,
      decrementAbility,
      humanBonusChoices,
      setHumanBonusSlot,
   };
}
