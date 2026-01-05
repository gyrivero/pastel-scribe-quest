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
  
  // Atributos base (1-5, modifican D20)
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
  character_id?: string; // Legacy single-character
  party_ids?: string[];  // Nuevo: aventura multijugador
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

  // Gestión de turnos y grupo
  active_character_id?: string;
  party_order?: string[];
  current_turn_index?: number;

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
  state?: 'unexplored' | 'explored' | 'exhausted' | 'blocked';
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

export type DiceOutcome =
  | 'catastrofe'
  | 'muy_malo'
  | 'malo'
  | 'neutro'
  | 'bueno'
  | 'muy_bueno'
  | 'perfecto';

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

export const CLASSES = [
  'Guerrero',
  'Hechicero',
  'Cazador',
  'Merodeador',
] as const;

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
  { id: 'attack', name: 'Atacar', description: 'Un solo ataque o intento de impacto', attribute: 'strength' },
  { id: 'use_ability', name: 'Usar habilidad', description: 'Activar una habilidad especial', attribute: null },
  { id: 'use_item', name: 'Usar objeto', description: 'Consumible, llave o herramienta', attribute: null },
  { id: 'explore', name: 'Explorar', description: 'Examinar la zona actual', attribute: 'intelligence' },
  { id: 'search', name: 'Buscar', description: 'Declarar un objetivo concreto a encontrar', attribute: 'intelligence' },
  { id: 'prepare_dodge', name: 'Prepararse (esquiva)', description: 'Enfocar el turno en esquivar', attribute: 'agility' },
  { id: 'prepare_defend', name: 'Prepararse (defensa)', description: 'Enfocar el turno en resistir', attribute: 'strength' },
  { id: 'active_trait', name: 'Activar rasgo', description: 'Rasgo activo único', attribute: null },
  { id: 'pass', name: 'Pasar', description: 'Ceder el turno sin actuar', attribute: null },
] as const;

// Acciones de combate
export const COMBAT_ACTIONS = [
  { id: 'attack', name: 'Atacar', description: 'Un único ataque con el arma equipada', attribute: 'strength' },
  { id: 'use_ability', name: 'Usar habilidad', description: 'Habilidad de clase o técnica', attribute: null },
  { id: 'use_item', name: 'Usar objeto', description: 'Arma secundaria, consumible o herramienta', attribute: null },
  { id: 'prepare_dodge', name: 'Prepararse (esquiva)', description: 'Centrarse en esquivar', attribute: 'agility' },
  { id: 'prepare_defend', name: 'Prepararse (defensa)', description: 'Centrarse en resistir daño', attribute: 'strength' },
  { id: 'active_trait', name: 'Activar rasgo', description: 'Rasgo activo único', attribute: 'willpower' },
  { id: 'pass', name: 'Pasar', description: 'No realizar acción en combate', attribute: null },
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

// Interpreta el resultado FINAL (D20 + atributo). El 1 natural siempre es catástrofe.
export function getDiceOutcome(natural: number, total?: number): DiceOutcome {
  if (natural === 1) return 'catastrofe';

  const finalTotal = total ?? natural;

  if (natural >= 20 || finalTotal >= 20) return 'perfecto';
  if (finalTotal >= 17) return 'muy_bueno';
  if (finalTotal >= 13) return 'bueno';
  if (finalTotal >= 9) return 'neutro';
  if (finalTotal >= 5) return 'malo';
  if (finalTotal >= 2) return 'muy_malo';
  return 'catastrofe';
}

export function getOutcomeLabel(outcome: DiceOutcome): string {
  const labels: Record<DiceOutcome, string> = {
    'catastrofe': 'Catástrofe',
    'muy_malo': 'Muy malo',
    'malo': 'Malo',
    'neutro': 'Neutro',
    'bueno': 'Bueno',
    'muy_bueno': 'Muy bueno',
    'perfecto': 'Perfecto',
  };
  return labels[outcome];
}

export function getOutcomeColor(outcome: DiceOutcome): string {
  const colors: Record<DiceOutcome, string> = {
    'catastrofe': 'text-red-600',
    'muy_malo': 'text-orange-600',
    'malo': 'text-amber-500',
    'neutro': 'text-muted-foreground',
    'bueno': 'text-green-500',
    'muy_bueno': 'text-emerald-500',
    'perfecto': 'text-primary',
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
    max_scenario_rounds: 25,
    zone_round: 0,
    max_zone_rounds: 5,
    in_zone: false,
    active_character_id: undefined,
    party_order: [],
    current_turn_index: 0,
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
