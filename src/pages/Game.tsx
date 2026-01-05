import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Character, Adventure, ChatMessage, DiceRoll, GameState, createDefaultGameState, GameItem, Zone, ActiveState } from '@/types/game';
import { ChatInterface } from '@/components/ChatInterface';
import { CharacterSheet } from '@/components/CharacterSheet';
import { DiceRoller } from '@/components/DiceRoller';
import { CharacterCreator } from '@/components/CharacterCreator';
import { AdventureCreator } from '@/components/AdventureCreator';
import { InventoryPanel } from '@/components/InventoryPanel';
import { TurnTracker } from '@/components/TurnTracker';
import { ZoneMap } from '@/components/ZoneMap';
import { CombatPanel } from '@/components/CombatPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  LogOut, 
  Plus, 
  BookOpen, 
  User, 
  Menu,
  Sparkles,
  Scroll,
  Package,
  Map,
  Swords
} from 'lucide-react';

type View = 'home' | 'create-character' | 'create-adventure' | 'playing';
type SidePanel = 'character' | 'inventory' | 'map' | 'combat';

// Helper to parse game_state from DB
function parseGameState(gameStateJson: unknown): GameState {
  if (!gameStateJson || typeof gameStateJson !== 'object') {
    return createDefaultGameState();
  }
  const gs = gameStateJson as Record<string, unknown>;
  return {
    scenario_round: (gs.scenario_round as number) || 1,
    max_scenario_rounds: (gs.max_scenario_rounds as number) || 25,
    zone_round: (gs.zone_round as number) || 0,
    max_zone_rounds: (gs.max_zone_rounds as number) || 5,
    in_zone: (gs.in_zone as boolean) || false,
    current_zone: gs.current_zone as Zone | undefined,
    tension: (gs.tension as number) || 0,
    corruption: (gs.corruption as number) || 0,
    turn_phase: (gs.turn_phase as GameState['turn_phase']) || 'player_action',
    is_combat: (gs.is_combat as boolean) || false,
    combat_state: gs.combat_state as GameState['combat_state'],
    zones: (gs.zones as Zone[]) || [],
    explored_zones: (gs.explored_zones as string[]) || [],
    events_resolved: (gs.events_resolved as string[]) || [],
    key_decisions: (gs.key_decisions as string[]) || [],
    active_states: (gs.active_states as ActiveState[]) || [],
  };
}

export default function Game() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('home');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [currentAdventure, setCurrentAdventure] = useState<Adventure | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastDiceRoll, setLastDiceRoll] = useState<DiceRoll | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<SidePanel>('character');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [charactersRes, adventuresRes] = await Promise.all([
        supabase.from('characters').select('*').order('created_at', { ascending: false }),
        supabase.from('adventures').select('*').order('created_at', { ascending: false }),
      ]);

      if (charactersRes.data) {
        setCharacters(charactersRes.data.map(c => {
          // Convert D&D-style attributes (3-18) to new system (1-5) if needed
          const convertAttr = (val: number) => {
            if (val <= 5) return val; // Already in new system
            if (val <= 6) return 1;
            if (val <= 9) return 2;
            if (val <= 12) return 3;
            if (val <= 15) return 4;
            return 5;
          };
          
          const agility = convertAttr(c.dexterity || 2);
          const strength = convertAttr(c.strength || 3);
          const intelligence = convertAttr(c.intelligence || 2);
          const willpower = convertAttr(c.wisdom || 3);
          
          return {
            ...c,
            inventory: Array.isArray(c.inventory) ? c.inventory : [],
            equipment: {},
            skills: [],
            agility,
            strength,
            intelligence,
            willpower,
            base_damage: 1 + Math.floor(strength / 2),
            armor: 0,
          };
        }) as unknown as Character[]);
      }
      if (adventuresRes.data) {
        setAdventures(adventuresRes.data.map(a => ({
          ...a,
          game_state: parseGameState(a.game_state),
        })) as Adventure[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const createCharacter = async (characterData: {
    name: string;
    race: string;
    class: string;
    agility: number;
    strength: number;
    intelligence: number;
    willpower: number;
    background: string;
  }) => {
    try {
      // New attribute system: health = 10 + strength
      const maxHealth = 10 + characterData.strength;
      const baseDamage = 1 + Math.floor(characterData.strength / 2);
      
      const { data, error } = await supabase.from('characters').insert({
        user_id: user!.id,
        name: characterData.name,
        race: characterData.race,
        class: characterData.class,
        background: characterData.background,
        // New attributes (1-5)
        strength: characterData.strength,
        dexterity: characterData.agility * 3 + 1, // Legacy conversion
        constitution: characterData.strength * 3 + 1,
        intelligence: characterData.intelligence,
        wisdom: characterData.willpower * 3 + 1,
        charisma: 10,
        health: maxHealth,
        max_health: maxHealth,
        inventory: [],
      }).select().single();

      if (error) throw error;
      
      // Create character object with new system
      const newCharacter: Character = {
        ...data,
        inventory: [],
        equipment: {},
        skills: [],
        agility: characterData.agility,
        strength: characterData.strength,
        intelligence: characterData.intelligence,
        willpower: characterData.willpower,
        base_damage: baseDamage,
        armor: 0,
      } as Character;
      
      setCharacters([newCharacter, ...characters]);
      setView('home');
      toast.success(`¡${characterData.name} ha sido creado!`);
    } catch (error) {
      console.error('Error creating character:', error);
      toast.error('Error al crear el personaje');
    }
  };

  const createAdventure = async (adventureData: {
    title: string;
    description: string;
    setting: string;
    character_id: string | null;
  }) => {
    try {
      const initialGameState = createDefaultGameState();
      
      const { data, error } = await supabase.from('adventures').insert([{
        user_id: user!.id,
        title: adventureData.title,
        description: adventureData.description,
        setting: adventureData.setting,
        character_id: adventureData.character_id,
        game_state: JSON.parse(JSON.stringify(initialGameState)),
      }]).select().single();

      if (error) throw error;
      
      const newAdventure = {
        ...data,
        game_state: parseGameState(data.game_state),
      } as Adventure;
      setAdventures([newAdventure, ...adventures]);
      
      // Start playing the new adventure
      const character = characters.find(c => c.id === adventureData.character_id);
      setCurrentAdventure(newAdventure);
      setCurrentCharacter(character || null);
      setMessages([]);
      setView('playing');
      toast.success('¡Aventura iniciada!');
    } catch (error) {
      console.error('Error creating adventure:', error);
      toast.error('Error al crear la aventura');
    }
  };

  const continueAdventure = async (adventure: Adventure) => {
    const character = characters.find(c => c.id === adventure.character_id);
    setCurrentAdventure(adventure);
    setCurrentCharacter(character || null);
    
    // Load story logs
    try {
      const { data } = await supabase
        .from('story_logs')
        .select('*')
        .eq('adventure_id', adventure.id)
        .order('created_at', { ascending: true });
      
      if (data) {
        setMessages(data.filter(l => l.role !== 'system').map(l => ({
          role: l.role as 'user' | 'assistant',
          content: l.content,
        })));
      }
    } catch (error) {
      console.error('Error loading story logs:', error);
    }
    
    setView('playing');
  };

  const handleAction = (actionId: string) => {
    // This will be used to pre-fill actions in the chat
    toast.info(`Acción: ${actionId}. Describe una única intención y añade el resultado del D20.`);
  };

  const handleUseItem = (item: GameItem) => {
    toast.info(`Usando ${item.name}. Describe la acción en el chat.`);
  };

  const handleEquipItem = (item: GameItem) => {
    if (!currentCharacter) return;
    // Toggle equip state
    const updatedInventory = currentCharacter.inventory.map(i => 
      i.id === item.id ? { ...i, equipped: !i.equipped } : i
    );
    setCurrentCharacter({ ...currentCharacter, inventory: updatedInventory });
    toast.success(item.equipped ? `${item.name} desequipado` : `${item.name} equipado`);
  };

  const handleSelectZone = (zone: Zone) => {
    toast.info(`Zona seleccionada: ${zone.name}. Describe tu acción en el chat.`);
  };

  const handleMessagesUpdate = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    // Save the last message to story logs
    if (newMessages.length > 0 && currentAdventure) {
      const lastMessage = newMessages[newMessages.length - 1];
      const diceRollData = lastDiceRoll ? {
        dice: lastDiceRoll.dice,
        result: lastDiceRoll.result,
        total: lastDiceRoll.total,
      } : null;
      
      supabase.from('story_logs').insert([{
        adventure_id: currentAdventure.id,
        role: lastMessage.role,
        content: lastMessage.content,
        dice_roll: diceRollData,
      }]).then(() => {
        if (lastMessage.role === 'user') {
          setLastDiceRoll(null);
        }
      });
    }
  };

  const handleDiceRoll = (dice: string, result: number, attribute?: string, modifier?: number, total?: number) => {
    setLastDiceRoll({ 
      dice, 
      result, 
      attribute,
      modifier,
      total: total || result 
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (view === 'create-character') {
    return (
      <div className="min-h-screen p-4 gradient-hero flex items-center justify-center">
        <CharacterCreator 
          onSubmit={createCharacter}
          onCancel={() => setView('home')}
        />
      </div>
    );
  }

  if (view === 'create-adventure') {
    return (
      <div className="min-h-screen p-4 gradient-hero flex items-center justify-center">
        <AdventureCreator 
          characters={characters}
          onSubmit={createAdventure}
          onCancel={() => setView('home')}
        />
      </div>
    );
  }

  if (view === 'playing') {
    const gameState = currentAdventure?.game_state || createDefaultGameState();

    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setView('home')}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-fantasy text-lg font-semibold line-clamp-1">
                  {currentAdventure?.title}
                </h1>
                {currentCharacter && (
                  <p className="text-xs text-muted-foreground">
                    {currentCharacter.name} • Ronda {gameState.in_zone ? gameState.zone_round : gameState.scenario_round}
                  </p>
                )}
              </div>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[340px] p-4 overflow-y-auto">
                <Tabs value={activePanel} onValueChange={(v) => setActivePanel(v as SidePanel)}>
                  <TabsList className="w-full grid grid-cols-4 h-10 mb-4">
                    <TabsTrigger value="character" className="text-xs">
                      <User className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="text-xs">
                      <Package className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="map" className="text-xs">
                      <Map className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="combat" className="text-xs">
                      <Swords className="w-4 h-4" />
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="character" className="space-y-4 m-0">
                    {currentCharacter && (
                      <CharacterSheet character={currentCharacter} />
                    )}
                    <DiceRoller onRoll={handleDiceRoll} character={currentCharacter} />
                  </TabsContent>

                  <TabsContent value="inventory" className="m-0">
                    {currentCharacter && (
                      <InventoryPanel 
                        character={currentCharacter}
                        onUseItem={handleUseItem}
                        onEquipItem={handleEquipItem}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="map" className="m-0">
                    <ZoneMap 
                      gameState={gameState}
                      onSelectZone={handleSelectZone}
                    />
                  </TabsContent>

                  <TabsContent value="combat" className="m-0">
                    {gameState.is_combat && gameState.combat_state ? (
                      <CombatPanel combatState={gameState.combat_state} />
                    ) : (
                      <Card className="p-6 text-center bg-muted/50">
                        <Swords className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-muted-foreground text-sm">
                          No estás en combate
                        </p>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Turn Tracker - Compact bar */}
        <div className="px-4 py-2 bg-card/50 border-b border-border">
          <TurnTracker 
            gameState={gameState} 
            onAction={handleAction}
            disabled={false}
          />
        </div>

        {/* Chat */}
        <main className="flex-1 p-4 pb-0 overflow-hidden">
          <ChatInterface
            character={currentCharacter}
            adventure={currentAdventure}
            messages={messages}
            onMessagesUpdate={handleMessagesUpdate}
            lastDiceRoll={lastDiceRoll}
          />
        </main>
      </div>
    );
  }

  // Home view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-fantasy-sage flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-fantasy text-xl font-bold">Quest Master</h1>
              <p className="text-xs text-muted-foreground">Tu asistente de rol</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Card className="p-5 bg-gradient-to-br from-primary/10 via-background to-fantasy-sage/10 fantasy-border">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Menu className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Menú principal</p>
                <h2 className="font-fantasy text-xl font-semibold">Crea y lanza tu aventura móvil</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Configura personajes independientes y arranca aventuras compatibles con Android/iOS. Cada escenario dura 25 rondas y las zonas se resuelven en bloques de 5 rondas, sin acciones dobles por turno.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setView('create-character')} className="gap-2">
                <User className="w-4 h-4" /> Crear personaje
              </Button>
              <Button variant="outline" onClick={() => setView('create-adventure')} className="gap-2">
                <Plus className="w-4 h-4" /> Iniciar aventura
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2 fantasy-border hover:bg-fantasy-lavender/20"
            onClick={() => setView('create-character')}
          >
            <User className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Nuevo Personaje</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 fantasy-border hover:bg-fantasy-sage/20"
            onClick={() => setView('create-adventure')}
          >
            <Plus className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Nueva Aventura</span>
          </Button>
        </div>

        {/* Characters */}
        <section>
          <h2 className="font-fantasy text-xl font-semibold mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Tus Personajes
          </h2>
          {characters.length === 0 ? (
            <Card className="p-6 text-center bg-muted/50">
              <p className="text-muted-foreground">
                Aún no tienes personajes. ¡Crea uno para comenzar!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {characters.map((character) => (
                <CharacterSheet 
                  key={character.id} 
                  character={character} 
                  compact 
                />
              ))}
            </div>
          )}
        </section>

        {/* Adventures */}
        <section>
          <h2 className="font-fantasy text-xl font-semibold mb-3 flex items-center gap-2">
            <Scroll className="w-5 h-5 text-primary" />
            Tus Aventuras
          </h2>
          {adventures.length === 0 ? (
            <Card className="p-6 text-center bg-muted/50">
              <p className="text-muted-foreground">
                No hay aventuras activas. ¡Comienza una nueva historia!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {adventures.map((adventure) => (
                <Card 
                  key={adventure.id}
                  className="p-4 bg-card/80 backdrop-blur-sm shadow-soft fantasy-border cursor-pointer hover:shadow-card transition-shadow"
                  onClick={() => continueAdventure(adventure)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-fantasy text-lg font-semibold">
                        {adventure.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {adventure.setting}
                      </p>
                      {adventure.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {adventure.description}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      Continuar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
