export const ABILITY_IDS = ['str', 'dex', 'con', 'int', 'cha'] as const;
export type AbilityId = (typeof ABILITY_IDS)[number];

export const RACE_IDS = [
   'ciancans',
   'cronenbergs',
   'birdPeople',
   'chuds',
   'cromulons',
   'parasites',
   'gearPeople',
   'gromflomites',
   'humans',
] as const;
export type RaceId = (typeof RACE_IDS)[number];

export type AbilityScores = Record<AbilityId, number>;

export interface RaceDefinition {
   id: RaceId;
   portraitUrl: string;
   cardClass: string;
   modifiers: Partial<Record<AbilityId, number>>;
   drawbackModifiers?: Partial<Record<AbilityId, number>>;
}
