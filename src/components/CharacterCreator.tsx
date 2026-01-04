import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { RACES, CLASSES } from '@/types/game';
import { Sparkles, Dices } from 'lucide-react';

interface CharacterCreatorProps {
  onSubmit: (character: {
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
  }) => void;
  onCancel: () => void;
}

export function CharacterCreator({ onSubmit, onCancel }: CharacterCreatorProps) {
  const [name, setName] = useState('');
  const [race, setRace] = useState('Humano');
  const [characterClass, setCharacterClass] = useState('Guerrero');
  const [background, setBackground] = useState('');
  const [stats, setStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  const rollStat = () => {
    // Roll 4d6, drop lowest
    const rolls = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    return rolls.slice(0, 3).reduce((sum, val) => sum + val, 0);
  };

  const rollAllStats = () => {
    setStats({
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    });
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Estadísticas</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={rollAllStats}
              className="gap-2"
            >
              <Dices className="w-4 h-4" />
              Tirar dados
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(stats).map(([stat, value]) => (
              <div key={stat} className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase mb-1">
                  {stat.slice(0, 3)}
                </p>
                <p className="text-lg font-bold">{value}</p>
              </div>
            ))}
          </div>
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
          <Button type="submit" disabled={!name.trim()} className="flex-1">
            Crear Personaje
          </Button>
        </div>
      </form>
    </Card>
  );
}
