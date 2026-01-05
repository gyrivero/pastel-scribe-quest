import { Character, getTensionLevel, getEffectiveDamage, getEffectiveArmor, ATTRIBUTES } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Sword, Sparkles, Coins, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterSheetProps {
  character: Character;
  compact?: boolean;
  tension?: number;
}

export function CharacterSheet({ character, compact = false, tension = 0 }: CharacterSheetProps) {
  const healthPercentage = (character.health / character.max_health) * 100;
  const tensionLevel = getTensionLevel(tension);
  const effectiveDamage = getEffectiveDamage(character.base_damage || 1, tension);
  const effectiveArmor = getEffectiveArmor(character.armor || 0, tension);

  const stats = [
    { id: 'agility', name: 'AGI', value: character.agility || 2, description: 'Esquiva, sigilo' },
    { id: 'strength', name: 'FUE', value: character.strength || 3, description: 'Ataque físico' },
    { id: 'intelligence', name: 'INT', value: character.intelligence || 2, description: 'Magia, análisis' },
    { id: 'willpower', name: 'VOL', value: character.willpower || 3, description: 'Resistencia mental' },
  ];

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
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              <Sword className="w-3 h-3 mr-1" />
              {effectiveDamage} daño
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              {effectiveArmor} armadura
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Coins className="w-3 h-3 mr-1" />
              {character.gold}
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
        {/* Health */}
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

        {/* Combat Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
            <Sword className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-xs text-muted-foreground">Daño Base</p>
              <p className="text-lg font-bold">
                {character.base_damage || 1}
                {tension >= 5 && (
                  <span className="text-sm text-destructive ml-1">(-1)</span>
                )}
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Armadura</p>
              <p className="text-lg font-bold">
                {character.armor || 0}
                {tension >= 7 && (
                  <span className="text-sm text-destructive ml-1">(-1)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Attributes (1-5, modify D20) */}
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">
            Atributos (modifican D20)
          </p>
          <div className="grid grid-cols-4 gap-2">
            {stats.map(({ id, name, value, description }) => (
              <div 
                key={id}
                className="text-center p-3 rounded-lg bg-muted/50"
                title={description}
              >
                <p className="text-xs text-muted-foreground mb-1">{name}</p>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-xs text-primary">+{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tension indicator */}
        {tension > 0 && (
          <div className={cn(
            "p-3 rounded-lg flex items-center gap-3",
            tension >= 10 ? "bg-red-500/20" :
            tension >= 7 ? "bg-orange-500/20" :
            tension >= 5 ? "bg-yellow-500/20" : "bg-muted/50"
          )}>
            <AlertTriangle className={cn(
              "w-5 h-5",
              tension >= 7 ? "text-orange-400" : "text-yellow-400"
            )} />
            <div>
              <p className="text-sm font-medium">{tensionLevel.name}</p>
              <p className="text-xs text-muted-foreground">{tensionLevel.effect}</p>
            </div>
          </div>
        )}

        {/* Traits */}
        {(character.active_trait || character.passive_trait) && (
          <div className="space-y-2">
            {character.active_trait && (
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">Activo:</span>
                <span className="text-muted-foreground">{character.active_trait}</span>
              </div>
            )}
            {character.passive_trait && (
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Pasivo:</span>
                <span className="text-muted-foreground">{character.passive_trait}</span>
              </div>
            )}
          </div>
        )}

        {/* Gold & Items */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-fantasy-gold" />
            <span className="text-sm font-medium">{character.gold} oro</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{character.inventory?.length || 0} objetos</span>
          </div>
        </div>

        {/* Background */}
        {character.background && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Trasfondo</h4>
            <p className="text-sm text-muted-foreground">{character.background}</p>
          </div>
        )}

        {/* Skills */}
        {character.skills && character.skills.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Habilidades</h4>
            <div className="flex flex-wrap gap-2">
              {character.skills.map(skill => (
                <Badge 
                  key={skill.id} 
                  variant={skill.type === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
