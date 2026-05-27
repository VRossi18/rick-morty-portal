import { computeSpent, POINT_POOL_MAX } from './characterCreationMath';
import type { AbilityId, AbilityScores, RaceId } from './types';

export type CharacterPresetId = 'rickOp' | 'morty' | 'evilMorty';

export interface CharacterPreset {
   id: CharacterPresetId;
   labelKey: `rpg.presets.${CharacterPresetId}.name`;
   descriptionKey: `rpg.presets.${CharacterPresetId}.description`;
   characterName: string;
   raceId: RaceId;
   portraitUrl: string;
   scores: AbilityScores;
   humanBonusChoices?: [AbilityId, AbilityId];
}

export const CHARACTER_PRESETS: readonly CharacterPreset[] = [
   {
      id: 'rickOp',
      labelKey: 'rpg.presets.rickOp.name',
      descriptionKey: 'rpg.presets.rickOp.description',
      characterName: 'Rick Sanchez',
      raceId: 'humans',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
      scores: { str: 12, dex: 14, con: 12, int: 15, cha: 14 },
   },
   {
      id: 'morty',
      labelKey: 'rpg.presets.morty.name',
      descriptionKey: 'rpg.presets.morty.description',
      characterName: 'Morty Smith',
      raceId: 'humans',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
      scores: { str: 13, dex: 15, con: 13, int: 13, cha: 13 },
      humanBonusChoices: ['dex', 'cha'],
   },
   {
      id: 'evilMorty',
      labelKey: 'rpg.presets.evilMorty.name',
      descriptionKey: 'rpg.presets.evilMorty.description',
      characterName: 'Evil Morty',
      raceId: 'humans',
      portraitUrl: 'https://rickandmortyapi.com/api/character/avatar/118.jpeg',
      scores: { str: 11, dex: 14, con: 13, int: 15, cha: 14 },
   },
] as const;

if (import.meta.env.DEV) {
   for (const preset of CHARACTER_PRESETS) {
      const spent = computeSpent(preset.scores);
      if (spent !== POINT_POOL_MAX) {
         throw new Error(
            `Preset "${preset.id}" must spend exactly ${POINT_POOL_MAX} points (got ${spent}).`,
         );
      }
   }
}
