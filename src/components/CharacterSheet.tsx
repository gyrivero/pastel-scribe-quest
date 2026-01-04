import { Character } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Sword, Sparkles, Coins, Package } from 'lucide-react';

interface CharacterSheetProps {
  character: Character;
  compact?: boolean;
}

export function CharacterSheet({ character, compact = false }: CharacterSheetProps) {
  const healthPercentage = (character.health / character.max_health) * 100;

  const stats = [
    { name: 'FUE', value: character.strength, icon: Sword },
    { name: 'DES', value: character.dexterity, icon: Shield },
    { name: 'CON', value: character.constitution, icon: Heart },
    { name: 'INT', value: character.intelligence, icon: Sparkles },
    { name: 'SAB', value: character.wisdom, icon: Sparkles },
    { name: 'CAR', value: character.charisma, icon: Sparkles },
  ];

  const getModifier = (value: number) => {
    const mod = Math.floor((value - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  if (compact) {
    return (
      <Card className="p-4 bg-card/80 backdrop-blur-sm shadow-card fantasy-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fantasy-lavender to-fantasy-blush flex items-center justify-center">
            <span className="text-xl font-fantasy font-bold text-foreground">
              {character.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-fantasy text-lg font-semibold truncate">{character.name}</h3>
            <p className="text-sm text-muted-foreground">
              {character.race} • {character.class} Nv. {character.level}
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-destructive" />
            <Progress value={healthPercentage} className="flex-1 h-2" />
            <span className="text-xs text-muted-foreground">
              {character.health}/{character.max_health}
            </span>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              <Coins className="w-3 h-3 mr-1" />
              {character.gold}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Package className="w-3 h-3 mr-1" />
              {character.inventory?.length || 0}
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm shadow-card fantasy-border">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-fantasy-lavender to-fantasy-blush flex items-center justify-center shadow-soft">
          <span className="text-3xl font-fantasy font-bold text-foreground">
            {character.name.charAt(0)}
          </span>
        </div>
        <div>
          <h2 className="font-fantasy text-2xl font-bold">{character.name}</h2>
          <p className="text-muted-foreground">
            {character.race} {character.class}
          </p>
          <Badge className="mt-2">Nivel {character.level}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Heart className="w-4 h-4 text-destructive" />
              Salud
            </span>
            <span className="text-sm text-muted-foreground">
              {character.health}/{character.max_health}
            </span>
          </div>
          <Progress value={healthPercentage} className="h-3" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ name, value }) => (
            <div 
              key={name}
              className="text-center p-3 rounded-lg bg-muted/50"
            >
              <p className="text-xs text-muted-foreground mb-1">{name}</p>
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-primary">{getModifier(value)}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-fantasy-gold" />
            <span className="text-sm font-medium">{character.gold} oro</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{character.experience} XP</span>
          </div>
        </div>

        {character.background && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Trasfondo</h4>
            <p className="text-sm text-muted-foreground">{character.background}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
