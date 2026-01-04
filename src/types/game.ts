export interface Character {
  id: string;
  user_id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  health: number;
  max_health: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  experience: number;
  gold: number;
  inventory: InventoryItem[];
  background?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'misc';
  quantity: number;
  description?: string;
}

export interface Adventure {
  id: string;
  user_id: string;
  character_id?: string;
  title: string;
  description?: string;
  setting: string;
  current_scene?: string;
  game_state: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoryLog {
  id: string;
  adventure_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  dice_roll?: DiceRoll;
  created_at: string;
}

export interface DiceRoll {
  dice: string;
  result: number;
  modifier?: number;
  total: number;
  type?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const RACES = [
  'Humano',
  'Elfo',
  'Enano',
  'Halfling',
  'Gnomo',
  'Semiorco',
  'Tiefling',
  'Dracónido',
] as const;

export const CLASSES = [
  'Guerrero',
  'Mago',
  'Pícaro',
  'Clérigo',
  'Paladín',
  'Ranger',
  'Bardo',
  'Druida',
  'Monje',
  'Brujo',
  'Hechicero',
  'Bárbaro',
] as const;

export const SETTINGS = [
  'Fantasía Medieval',
  'Fantasía Oscura',
  'Fantasía Épica',
  'Steampunk',
  'Mundo Abierto',
] as const;
