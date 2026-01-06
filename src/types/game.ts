// ============= SISTEMA DE REGLAS CONSOLIDADO (VERSIÓN DM-IA) =============

// ATRIBUTOS: Valores 1-5 (modifican la tirada D20)
export interface CharacterAttributes {
  agility: number;    // Esquiva, sigilo, precisión
  strength: number;   // Ataques físicos, resistencia
  intelligence: number; // Magia, análisis, conocimiento
  willpower: number;  // Resistencia mental, habilidades especiales
}

// HABILIDADES DE CLASE
export interface Skill {
  id: string;
  name: string;
  class: string;
  type: 'active' | 'passive';
  cost?: string;          // Ej: "1 tensión", "turno de preparación"
  effect_mechanical: string;
  effect_narrative: string;
  conditions?: string;
}

// OBJETOS con estructura completa
export interface GameItem {
  id: string;
  name: string;
  type: 'weapon' | 'consumable' | 'utility' | 'relic';
  effect_mechanical: string;
  effect_narrative: string;
  uses: 'limited' | 'unlimited';
  uses_remaining?: number;
  restrictions?: string;
  equipped?: boolean;
  // Weapon specific
  damage?: number;
  // Armor/utility specific
  armor_value?: number;
}

// PERSONAJE según el reglamento
export interface Character {
  id: string;
  user_id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  
  // Stats derivados
  health: number;
  max_health: number;
  base_damage: number;
  armor: number;
  
  // Atributos base (1-5, modifican D10)
  agility: number;
  strength: number;
  intelligence: number;
  willpower: number;
  
  // Legacy D&D stats (para compatibilidad DB)
  dexterity: number;
  constitution: number;
  wisdom: number;
  charisma: number;
  
  // Rasgos
  active_trait?: string;
  passive_trait?: string;
  
  // Habilidades adquiridas
  skills: Skill[];
  
  // Inventario
  inventory: GameItem[];
  equipment: Equipment;
  
  gold: number;
  experience: number;
  background?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  weapon?: GameItem;
  armor?: GameItem;
  accessory?: GameItem;
}

// Para compatibilidad con InventoryItem viejo
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
  // Rondas
  scenario_round: number;
  max_scenario_rounds: number;
  zone_round: number;
  max_zone_rounds: number;
  in_zone: boolean;
  current_zone?: Zone;
  
  // Contadores críticos
  tension: number;      // 0-10, por jugador
  corruption: number;   // 0-10, global
  
  // Estado del turno
  turn_phase: TurnPhase;
  is_combat: boolean;
  combat_state?: CombatState;
  
  // Zonas
  zones: Zone[];
  explored_zones: string[];
  events_resolved: string[];
  
  // Decisiones narrativas clave (para persistencia)
  key_decisions: string[];
  
  // Estados activos del personaje
  active_states: ActiveState[];
}

export interface ActiveState {
  id: string;
  name: string;
  effect: string;
  duration?: number; // rondas restantes, undefined = permanente
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
  result: number;       // Resultado del dado crudo
  attribute?: string;   // Atributo usado
  modifier?: number;    // Valor del atributo
  total: number;        // resultado + modificador
  type?: string;
  outcome?: DiceOutcome;
}

export type DiceOutcome = 'muy_mala' | 'mala' | 'neutra' | 'buena' | 'excelente';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Constantes
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

// Clases definidas del sistema
export const CLASSES = [
  'Soldado',
  'Hechicero',
  'Cazador',
  'Merodeador',
] as const;

// Definición de clases con atributos recomendados
export const CLASS_INFO = {
  'Soldado': {
    description: 'Guerrero resistente especializado en combate cuerpo a cuerpo',
    recommended: 'Fuerza alta recomendada',
    primary: 'strength',
  },
  'Hechicero': {
    description: 'Maestro de las artes arcanas y la magia',
    recommended: 'Inteligencia alta recomendada',
    primary: 'intelligence',
  },
  'Cazador': {
    description: 'Experto en rastreo, arcos y combate a distancia',
    recommended: 'Agilidad alta recomendada',
    primary: 'agility',
  },
  'Merodeador': {
    description: 'Sigiloso y astuto, maestro del engaño y el sigilo',
    recommended: 'Agilidad y Voluntad recomendadas',
    primary: 'agility',
  },
} as const;

export const SETTINGS = [
  'Fantasía Medieval',
  'Fantasía Oscura',
  'Fantasía Épica',
  'Steampunk',
  'Mundo Abierto',
] as const;

// Atributos disponibles para tiradas
export const ATTRIBUTES = [
  { id: 'agility', name: 'Agilidad', description: 'Esquiva, sigilo, precisión' },
  { id: 'strength', name: 'Fuerza', description: 'Ataques físicos, resistencia' },
  { id: 'intelligence', name: 'Inteligencia', description: 'Magia, análisis, conocimiento' },
  { id: 'willpower', name: 'Voluntad', description: 'Resistencia mental, habilidades especiales' },
] as const;

// Acciones del jugador (fuera de combate)
export const PLAYER_ACTIONS = [
  { id: 'explore', name: 'Explorar', description: 'Examinar la habitación o zona actual', attribute: 'intelligence' },
  { id: 'use_consumable', name: 'Usar Consumible', description: 'Usar una poción u objeto consumible', attribute: null },
  { id: 'use_ability', name: 'Usar Habilidad', description: 'Activar una habilidad especial', attribute: null },
  { id: 'attack', name: 'Atacar', description: 'Atacar a un enemigo o objetivo', attribute: 'strength' },
  { id: 'prepare_dodge', name: 'Preparar Esquiva', description: 'Prepararse para esquivar', attribute: 'agility' },
  { id: 'prepare_defend', name: 'Preparar Defensa', description: 'Prepararse para defender', attribute: 'strength' },
  { id: 'active_trait', name: 'Rasgo Activo', description: 'Activar tu rasgo especial', attribute: null },
  { id: 'pass', name: 'Pasar Turno', description: 'No realizar ninguna acción', attribute: null },
] as const;

// Acciones de combate
export const COMBAT_ACTIONS = [
  { id: 'attack', name: 'Atacar', description: 'Atacar con el arma equipada', attribute: 'strength' },
  { id: 'ability', name: 'Habilidad', description: 'Usar una habilidad de combate', attribute: null },
  { id: 'use_item', name: 'Usar Objeto', description: 'Usar cualquier objeto del inventario', attribute: null },
  { id: 'consumable', name: 'Consumible', description: 'Usar un consumible', attribute: null },
  { id: 'dodge', name: 'Esquivar', description: 'Prepararse para esquivar el próximo ataque', attribute: 'agility' },
  { id: 'defend', name: 'Defender', description: 'Prepararse para defender', attribute: 'strength' },
  { id: 'trait', name: 'Rasgo Activo', description: 'Activar tu rasgo especial', attribute: 'willpower' },
] as const;

// Niveles de tensión con efectos
export const TENSION_LEVELS = [
  { min: 0, max: 4, name: 'Tranquilo', effect: 'Sin efectos', color: 'bg-green-500', damage_mod: 0, armor_mod: 0, can_heal: true },
  { min: 5, max: 6, name: 'Estresado', effect: '-1 daño', color: 'bg-yellow-500', damage_mod: -1, armor_mod: 0, can_heal: true },
  { min: 7, max: 9, name: 'Ansioso', effect: '-1 daño, -1 armadura', color: 'bg-orange-500', damage_mod: -1, armor_mod: -1, can_heal: true },
  { min: 10, max: 10, name: 'Agotado', effect: '-1 daño, -1 armadura, no puede curarse', color: 'bg-red-500', damage_mod: -1, armor_mod: -1, can_heal: false },
] as const;

// Niveles de corrupción con efectos
export const CORRUPTION_LEVELS = [
  { min: 0, max: 4, name: 'Estable', effect: 'Sin efectos', color: 'bg-green-500', enemy_health: 0, enemy_damage: 0, enemy_armor: 0, extra_enemies: 0 },
  { min: 5, max: 6, name: 'Infección Creciente', effect: 'Enemigos +1 vida', color: 'bg-yellow-500', enemy_health: 1, enemy_damage: 0, enemy_armor: 0, extra_enemies: 0 },
  { min: 7, max: 9, name: 'Putrefacción', effect: 'Enemigos +1 vida, +1 daño', color: 'bg-purple-500', enemy_health: 1, enemy_damage: 1, enemy_armor: 0, extra_enemies: 0 },
  { min: 10, max: 10, name: 'Corrupto', effect: '+1 vida, +1 daño, +1 armadura, +1 enemigo', color: 'bg-red-900', enemy_health: 1, enemy_damage: 1, enemy_armor: 1, extra_enemies: 1 },
] as const;

// ============= FUNCIONES DE UTILIDAD =============

// Interpreta el resultado FINAL (D20 + atributo)
export function getDiceOutcome(total: number): DiceOutcome {
  if (total <= 5) return 'muy_mala';
  if (total <= 9) return 'mala';
  if (total <= 14) return 'neutra';
  if (total <= 19) return 'buena';
  return 'excelente';
}

export function getOutcomeLabel(outcome: DiceOutcome): string {
  const labels: Record<DiceOutcome, string> = {
    'muy_mala': 'Muy Mala',
    'mala': 'Mala',
    'neutra': 'Neutra',
    'buena': 'Buena',
    'excelente': 'Excelente',
  };
  return labels[outcome];
}

export function getOutcomeColor(outcome: DiceOutcome): string {
  const colors: Record<DiceOutcome, string> = {
    'muy_mala': 'text-red-500',
    'mala': 'text-orange-500',
    'neutra': 'text-muted-foreground',
    'buena': 'text-green-500',
    'excelente': 'text-primary',
  };
  return colors[outcome];
}

export function getTensionLevel(tension: number) {
  return TENSION_LEVELS.find(l => tension >= l.min && tension <= l.max) || TENSION_LEVELS[0];
}

export function getCorruptionLevel(corruption: number) {
  return CORRUPTION_LEVELS.find(l => corruption >= l.min && corruption <= l.max) || CORRUPTION_LEVELS[0];
}

// Calcula el daño efectivo considerando tensión
export function getEffectiveDamage(baseDamage: number, tension: number): number {
  const level = getTensionLevel(tension);
  return Math.max(0, baseDamage + level.damage_mod);
}

// Calcula la armadura efectiva considerando tensión
export function getEffectiveArmor(baseArmor: number, tension: number): number {
  const level = getTensionLevel(tension);
  return Math.max(0, baseArmor + level.armor_mod);
}

// Aplica buffs de corrupción a un enemigo
export function applyCorruptionToEnemy(enemy: Enemy, corruption: number): Enemy {
  const level = getCorruptionLevel(corruption);
  return {
    ...enemy,
    health: enemy.health + level.enemy_health,
    max_health: enemy.max_health + level.enemy_health,
    damage: enemy.damage + level.enemy_damage,
    armor: enemy.armor + level.enemy_armor,
  };
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
    key_decisions: [],
    active_states: [],
  };
}

// Convierte atributos D&D (3-18) a nuevo sistema (1-5)
export function convertDndToNewSystem(dndValue: number): number {
  // 3-6 = 1, 7-9 = 2, 10-12 = 3, 13-15 = 4, 16+ = 5
  if (dndValue <= 6) return 1;
  if (dndValue <= 9) return 2;
  if (dndValue <= 12) return 3;
  if (dndValue <= 15) return 4;
  return 5;
}

// Crea un personaje con los nuevos atributos a partir de los datos del creador
export function createCharacterFromCreator(data: {
  name: string;
  race: string;
  class: string;
  agility: number;
  strength: number;
  intelligence: number;
  willpower: number;
  background: string;
}): Partial<Character> {
  const baseHealth = 10 + data.strength; // Vida base + fuerza
  
  return {
    name: data.name,
    race: data.race,
    class: data.class,
    level: 1,
    health: baseHealth,
    max_health: baseHealth,
    base_damage: 1 + Math.floor(data.strength / 2),
    armor: 0,
    agility: data.agility,
    strength: data.strength,
    intelligence: data.intelligence,
    willpower: data.willpower,
    // Legacy fields
    dexterity: data.agility * 3 + 1,
    constitution: data.strength * 3 + 1,
    wisdom: data.willpower * 3 + 1,
    charisma: 10,
    skills: [],
    inventory: [],
    equipment: {},
    gold: 50,
    experience: 0,
    background: data.background,
  };
}
