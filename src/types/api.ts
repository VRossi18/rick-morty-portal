export interface ResourceBase {
   name: string;
   url: string;
}

export interface Character {
   id: number;
   name: string;
   status: 'Alive' | 'Dead' | 'unknown';
   species: string;
   type: string;
   gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
   origin: ResourceBase;
   location: ResourceBase;
   image: string;
   episode: string[];
   url: string;
   created: string;
}

export interface Info {
   count: number;
   pages: number;
   next: string | null;
   prev: string | null;
}

export interface Episode {
   id: number;
   name: string;
   air_date: string;
   episode: string;
   characters: string[];
   url: string;
   created: string;
}

export interface Location {
   id: number;
   name: string;
   type: string;
   dimension: string;
   residents: string[];
   url: string;
   created: string;
}

export interface ApiResponse<T> {
   info: Info;
   results: T[];
}
