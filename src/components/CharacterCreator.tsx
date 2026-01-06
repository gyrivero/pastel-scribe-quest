import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { RACES, CLASSES, ATTRIBUTES, CLASS_INFO } from '@/types/game';
import { Sparkles, Dices, Plus, Minus } from 'lucide-react';

interface CharacterCreatorProps {
  onSubmit: (character: {
    name: string;
    race: string;
    class: string;
    agility: number;
    strength: number;
    intelligence: number;
    willpower: number;
    background: string;
  }) => void;
  onCancel: () => void;
}

const INITIAL_POINTS = 10;
const MIN_ATTR = 1;
const MAX_ATTR = 5;

export function CharacterCreator({ onSubmit, onCancel }: CharacterCreatorProps) {
  const [name, setName] = useState('');
  const [race, setRace] = useState('Humano');
  const [characterClass, setCharacterClass] = useState('Guerrero');
  const [background, setBackground] = useState('');
  const [stats, setStats] = useState({
    agility: 2,
    strength: 3,
    intelligence: 2,
    willpower: 3,
  });

  const usedPoints = stats.agility + stats.strength + stats.intelligence + stats.willpower;
  const remainingPoints = INITIAL_POINTS - usedPoints;

  const adjustStat = (stat: keyof typeof stats, delta: number) => {
    const newValue = stats[stat] + delta;
    if (newValue < MIN_ATTR || newValue > MAX_ATTR) return;
    if (delta > 0 && remainingPoints <= 0) return;
    
    setStats(prev => ({ ...prev, [stat]: newValue }));
  };

  const rollStats = () => {
    // Distribuye puntos aleatoriamente
    let remaining = INITIAL_POINTS;
    const newStats = { agility: 1, strength: 1, intelligence: 1, willpower: 1 };
    remaining -= 4; // Ya asignamos 1 a cada uno
    
    // Distribuir puntos restantes
    const keys = Object.keys(newStats) as (keyof typeof newStats)[];
    while (remaining > 0) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      if (newStats[randomKey] < MAX_ATTR) {
        newStats[randomKey]++;
        remaining--;
      }
    }
    
    setStats(newStats);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSubmit({
      name: name.trim(),
      race,
      class: characterClass,
      background: background.trim(),
      ...stats,
    });
  };

  const getClassRecommendation = () => {
    const classInfo = CLASS_INFO[characterClass as keyof typeof CLASS_INFO];
    return classInfo?.recommended || '';
  };

  const getClassDescription = () => {
    const classInfo = CLASS_INFO[characterClass as keyof typeof CLASS_INFO];
    return classInfo?.description || '';
  };

  return (
    <Card className="p-6 bg-card/90 backdrop-blur-sm shadow-card fantasy-border max-w-md w-full mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fantasy-lavender to-fantasy-blush flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-foreground" />
        </div>
        <div>
          <h2 className="font-fantasy text-2xl font-bold">Crear Personaje</h2>
          <p className="text-sm text-muted-foreground">Da vida a tu héroe</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Thorin Escudo de Roble"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="race">Raza</Label>
            <Select value={race} onValueChange={setRace}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RACES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="class">Clase</Label>
            <Select value={characterClass} onValueChange={setCharacterClass}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(getClassRecommendation() || getClassDescription()) && (
          <div className="p-2 rounded-lg bg-muted/50 text-xs">
            {getClassDescription() && (
              <p className="text-muted-foreground mb-1">{getClassDescription()}</p>
            )}
            {getClassRecommendation() && (
              <p className="text-primary font-medium">💡 {getClassRecommendation()}</p>
            )}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Atributos (1-5)</Label>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${remainingPoints < 0 ? 'text-destructive' : remainingPoints === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                Puntos: {remainingPoints}/{INITIAL_POINTS}
              </span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={rollStats}
                className="gap-1"
              >
                <Dices className="w-4 h-4" />
                Aleatorio
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {ATTRIBUTES.map((attr) => {
              const value = stats[attr.id as keyof typeof stats];
              return (
                <div key={attr.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{attr.name}</p>
                    <p className="text-xs text-muted-foreground">{attr.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => adjustStat(attr.id as keyof typeof stats, -1)}
                      disabled={value <= MIN_ATTR}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center text-lg font-bold">{value}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => adjustStat(attr.id as keyof typeof stats, 1)}
                      disabled={value >= MAX_ATTR || remainingPoints <= 0}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats preview */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs font-medium mb-1">Vista previa del personaje:</p>
          <p className="text-sm">
            ❤️ Vida: <strong>{10 + stats.strength}</strong> | 
            ⚔️ Daño base: <strong>{1 + Math.floor(stats.strength / 2)}</strong> | 
            🛡️ Armadura: <strong>0</strong>
          </p>
        </div>

        <div>
          <Label htmlFor="background">Trasfondo (opcional)</Label>
          <Textarea
            id="background"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="¿Cuál es la historia de tu personaje?"
            className="mt-1 min-h-[80px]"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={!name.trim() || remainingPoints !== 0} className="flex-1">
            Crear Personaje
          </Button>
        </div>
      </form>
    </Card>
  );
}
