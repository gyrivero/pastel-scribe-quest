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
  equipment: Equipment;
  background?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  // New attributes for the ruleset
  agility: number;
  willpower: number;
  base_damage: number;
  armor: number;
  active_trait?: string;
  passive_trait?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'misc';
  subtype?: 'light' | 'medium' | 'heavy' | 'melee' | 'ranged';
  quantity: number;
  description?: string;
  effect?: string;
  damage?: number;
  armor_value?: number;
  equipped?: boolean;
}

export interface Equipment {
  weapon?: InventoryItem;
  armor?: InventoryItem;
  accessory?: InventoryItem;
}

export interface Adventure {
  id: string;
  user_id: string;
  character_id?: string;
  title: string;
  description?: string;
  setting: string;
  current_scene?: string;
  game_state: GameState;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameState {
  scenario_round: number;
  max_scenario_rounds: number;
  zone_round: number;
  max_zone_rounds: number;
  in_zone: boolean;
  current_zone?: Zone;
  tension: number;
  corruption: number;
  turn_phase: TurnPhase;
  is_combat: boolean;
  combat_state?: CombatState;
  zones: Zone[];
  explored_zones: string[];
  events_resolved: string[];
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  explored: boolean;
  cleared: boolean;
  connected_zones: string[];
  position: { x: number; y: number };
  type: 'entrance' | 'room' | 'boss' | 'treasure' | 'trap' | 'exit';
}

export interface CombatState {
  enemies: Enemy[];
  player_turn: boolean;
  round: number;
  player_action_taken: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  max_health: number;
  damage: number;
  armor: number;
}

export type TurnPhase = 'player_action' | 'resolution' | 'event' | 'end_round';

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
  outcome?: DiceOutcome;
}

export type DiceOutcome = 'muy_mala' | 'mala' | 'neutra' | 'buena' | 'excelente';

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

export const PLAYER_ACTIONS = [
  { id: 'explore', name: 'Explorar', description: 'Examinar la habitación o zona actual' },
  { id: 'use_consumable', name: 'Usar Consumible', description: 'Usar una poción u objeto consumible' },
  { id: 'use_ability', name: 'Usar Habilidad', description: 'Activar una habilidad especial' },
  { id: 'pass', name: 'Pasar Turno', description: 'No realizar ninguna acción' },
] as const;

export const COMBAT_ACTIONS = [
  { id: 'attack', name: 'Atacar', description: 'Atacar con el arma equipada' },
  { id: 'ability', name: 'Habilidad', description: 'Usar una habilidad de combate' },
  { id: 'consumable', name: 'Consumible', description: 'Usar un consumible' },
  { id: 'dodge', name: 'Esquivar', description: 'Prepararse para esquivar el próximo ataque' },
  { id: 'defend', name: 'Defender', description: 'Prepararse para defender' },
  { id: 'trait', name: 'Rasgo Activo', description: 'Activar tu rasgo especial' },
] as const;

export const TENSION_LEVELS = [
  { min: 0, max: 4, name: 'Tranquilo', effect: 'Sin efectos', color: 'bg-green-500' },
  { min: 5, max: 6, name: 'Estresado', effect: '-1 daño', color: 'bg-yellow-500' },
  { min: 7, max: 9, name: 'Ansioso', effect: '-1 daño, -1 armadura', color: 'bg-orange-500' },
  { min: 10, max: 10, name: 'Agotado', effect: '-1 daño, -1 armadura, no puede curarse', color: 'bg-red-500' },
] as const;

export const CORRUPTION_LEVELS = [
  { min: 0, max: 4, name: 'Estable', effect: 'Sin efectos', color: 'bg-green-500' },
  { min: 5, max: 6, name: 'Infección Creciente', effect: 'Enemigos +1 vida', color: 'bg-yellow-500' },
  { min: 7, max: 9, name: 'Putrefacción', effect: 'Enemigos +1 vida, +1 daño', color: 'bg-purple-500' },
  { min: 10, max: 10, name: 'Corrupto', effect: 'Enemigos +1 vida, +1 daño, +1 armadura, +1 enemigo', color: 'bg-red-900' },
] as const;

export function getDiceOutcome(result: number): DiceOutcome {
  if (result === 1) return 'muy_mala';
  if (result <= 3) return 'mala';
  if (result <= 6) return 'neutra';
  if (result <= 9) return 'buena';
  return 'excelente';
}

export function getTensionLevel(tension: number) {
  return TENSION_LEVELS.find(l => tension >= l.min && tension <= l.max) || TENSION_LEVELS[0];
}

export function getCorruptionLevel(corruption: number) {
  return CORRUPTION_LEVELS.find(l => corruption >= l.min && corruption <= l.max) || CORRUPTION_LEVELS[0];
}

export function createDefaultGameState(): GameState {
  return {
    scenario_round: 1,
    max_scenario_rounds: 15,
    zone_round: 0,
    max_zone_rounds: 5,
    in_zone: false,
    tension: 0,
    corruption: 0,
    turn_phase: 'player_action',
    is_combat: false,
    zones: [],
    explored_zones: [],
    events_resolved: [],
  };
}
