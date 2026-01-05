import { CombatState, Enemy } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Swords, 
  Heart, 
  Shield, 
  Skull,
  Zap,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CombatPanelProps {
  combatState: CombatState;
  onClose?: () => void;
}

export function CombatPanel({ combatState, onClose }: CombatPanelProps) {
  const renderEnemy = (enemy: Enemy, index: number) => {
    const healthPercentage = (enemy.health / enemy.max_health) * 100;
    const isDead = enemy.health <= 0;

    return (
      <Card
        key={enemy.id}
        className={cn(
          "p-3 fantasy-border transition-all",
          isDead ? "opacity-50 bg-muted/30" : "bg-destructive/5"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isDead ? "bg-muted" : "bg-destructive/20"
          )}>
            <Skull className={cn("w-5 h-5", isDead ? "text-muted-foreground" : "text-destructive")} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{enemy.name}</h4>
              {isDead && <Badge variant="outline" className="text-xs">Derrotado</Badge>}
            </div>
            
            {/* Health Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-destructive" />
                <Progress 
                  value={healthPercentage} 
                  className="flex-1 h-2"
                />
                <span className="text-xs text-muted-foreground">
                  {enemy.health}/{enemy.max_health}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-orange-400" />
                <span className="text-xs">{enemy.damage}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-400" />
                <span className="text-xs">{enemy.armor}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const aliveEnemies = combatState.enemies.filter(e => e.health > 0);
  const deadEnemies = combatState.enemies.filter(e => e.health <= 0);

  return (
    <Card className="p-4 bg-card/95 backdrop-blur-sm shadow-card fantasy-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-fantasy text-lg font-semibold flex items-center gap-2">
          <Swords className="w-5 h-5 text-destructive" />
          Combate
          <Badge variant="destructive" className="text-xs">
            Ronda {combatState.round}
          </Badge>
        </h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Turn Indicator */}
      <div className={cn(
        "mb-4 p-3 rounded-lg text-center",
        combatState.player_turn ? "bg-primary/10" : "bg-destructive/10"
      )}>
        <span className={cn(
          "font-medium text-sm",
          combatState.player_turn ? "text-primary" : "text-destructive"
        )}>
          {combatState.player_turn ? "¡Tu turno!" : "Turno del enemigo..."}
        </span>
      </div>

      {/* Dice Results Legend */}
      <div className="mb-4 p-2 bg-muted/30 rounded-lg">
        <p className="text-xs font-medium mb-2 text-muted-foreground">Resultados del D20 del sistema:</p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400">1 natural: Catástrofe</Badge>
          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-400">2-4: Muy malo</Badge>
          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500">5-8: Malo</Badge>
          <Badge variant="outline" className="text-xs bg-muted/60 text-muted-foreground">9-12: Neutro</Badge>
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500">13-16: Bueno</Badge>
          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500">17-19: Muy bueno</Badge>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary">20+: Perfecto</Badge>
        </div>
      </div>

      {/* Enemies */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Enemigos ({aliveEnemies.length} vivos)</span>
        </div>
        
        {combatState.enemies.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Skull className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay enemigos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {aliveEnemies.map(renderEnemy)}
            {deadEnemies.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground pt-2">Derrotados:</p>
                {deadEnemies.map(renderEnemy)}
              </>
            )}
          </div>
        )}
      </div>

      {/* Combat Tips */}
      <div className="mt-4 p-2 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 Recuerda: Una sola acción por turno y cada acción usa el D20 con su modificador. El 1 natural siempre es Catástrofe.
        </p>
      </div>
    </Card>
  );
}
