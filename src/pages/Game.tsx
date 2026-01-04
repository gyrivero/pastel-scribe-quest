import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Character, Adventure, ChatMessage, DiceRoll } from '@/types/game';
import { ChatInterface } from '@/components/ChatInterface';
import { CharacterSheet } from '@/components/CharacterSheet';
import { DiceRoller } from '@/components/DiceRoller';
import { CharacterCreator } from '@/components/CharacterCreator';
import { AdventureCreator } from '@/components/AdventureCreator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { 
  LogOut, 
  Plus, 
  BookOpen, 
  User, 
  Menu,
  Sparkles,
  Scroll
} from 'lucide-react';

type View = 'home' | 'create-character' | 'create-adventure' | 'playing';

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
        setCharacters(charactersRes.data.map(c => ({
          ...c,
          inventory: Array.isArray(c.inventory) ? c.inventory : []
        })) as unknown as Character[]);
      }
      if (adventuresRes.data) {
        setAdventures(adventuresRes.data as Adventure[]);
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
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    background: string;
  }) => {
    try {
      const maxHealth = 10 + Math.floor((characterData.constitution - 10) / 2);
      
      const { data, error } = await supabase.from('characters').insert({
        user_id: user!.id,
        ...characterData,
        health: maxHealth,
        max_health: maxHealth,
        inventory: [],
      }).select().single();

      if (error) throw error;
      
      const newCharacter = { ...data, inventory: [] } as Character;
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
      const { data, error } = await supabase.from('adventures').insert({
        user_id: user!.id,
        ...adventureData,
      }).select().single();

      if (error) throw error;
      
      const newAdventure = data as Adventure;
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

  const handleDiceRoll = (dice: string, result: number) => {
    setLastDiceRoll({ dice, result, total: result });
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
                    {currentCharacter.name}
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
              <SheetContent className="w-[320px] p-4">
                <div className="space-y-4">
                  {currentCharacter && (
                    <CharacterSheet character={currentCharacter} />
                  )}
                  <DiceRoller onRoll={handleDiceRoll} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Chat */}
        <main className="flex-1 p-4 pb-0">
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
