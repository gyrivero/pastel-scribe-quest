import { GameState, TurnPhase, PLAYER_ACTIONS, COMBAT_ACTIONS, getTensionLevel, getCorruptionLevel } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Swords, 
  AlertTriangle, 
  Skull,
  MapPin,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TurnTrackerProps {
  gameState: GameState;
  onAction?: (actionId: string) => void;
  disabled?: boolean;
}

export function TurnTracker({ gameState, onAction, disabled }: TurnTrackerProps) {
  const tensionLevel = getTensionLevel(gameState.tension);
  const corruptionLevel = getCorruptionLevel(gameState.corruption);

  const currentRound = gameState.in_zone ? gameState.zone_round : gameState.scenario_round;
  const maxRounds = gameState.in_zone ? gameState.max_zone_rounds : gameState.max_scenario_rounds;
  const roundProgress = (currentRound / maxRounds) * 100;

  const actions = gameState.is_combat ? COMBAT_ACTIONS : PLAYER_ACTIONS;

  const getPhaseLabel = (phase: TurnPhase) => {
    switch (phase) {
      case 'player_action': return 'Tu Turno';
      case 'resolution': return 'Resolución';
      case 'event': return 'Evento';
      case 'end_round': return 'Fin de Ronda';
    }
  };

  return (
    <Card className="p-4 bg-card/95 backdrop-blur-sm shadow-card fantasy-border space-y-4">
      {/* Round Counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">
              {gameState.in_zone ? 'Ronda de Zona' : 'Ronda de Escenario'}
            </span>
          </div>
          <Badge variant="outline" className="font-mono">
            {currentRound} / {maxRounds}
          </Badge>
        </div>
        <Progress value={roundProgress} className="h-2" />
        {currentRound >= maxRounds - 2 && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            ¡Pocas rondas restantes!
          </p>
        )}
      </div>

      {/* Zone Indicator */}
      {gameState.in_zone && gameState.current_zone && (
        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{gameState.current_zone.name}</span>
        </div>
      )}

      {/* Combat Indicator */}
      {gameState.is_combat && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
          <Swords className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">¡En Combate!</span>
        </div>
      )}

      {/* Current Phase */}
      <div className="text-center py-2">
        <Badge variant="secondary" className="text-sm px-4 py-1">
          {getPhaseLabel(gameState.turn_phase)}
        </Badge>
        <p className="text-[11px] text-muted-foreground mt-1">Una acción = una intención. Sin acumulaciones.</p>
      </div>

      {/* Tension & Corruption Meters */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tension */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Tensión
            </span>
            <span className="text-xs font-medium">{gameState.tension}/10</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", tensionLevel.color)}
              style={{ width: `${(gameState.tension / 10) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{tensionLevel.name}</p>
        </div>

        {/* Corruption */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Skull className="w-3 h-3" />
              Corrupción
            </span>
            <span className="text-xs font-medium">{gameState.corruption}/10</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", corruptionLevel.color)}
              style={{ width: `${(gameState.corruption / 10) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{corruptionLevel.name}</p>
        </div>
      </div>

      {/* Status Effects */}
      {(gameState.tension >= 5 || gameState.corruption >= 5) && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Efectos Activos:</p>
          <div className="flex flex-wrap gap-1">
            {gameState.tension >= 5 && (
              <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600">
                {tensionLevel.effect}
              </Badge>
            )}
            {gameState.corruption >= 5 && (
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600">
                {corruptionLevel.effect}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {gameState.turn_phase === 'player_action' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Acciones Disponibles:</p>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="h-auto py-2 px-3 flex-col items-start text-left"
                onClick={() => onAction?.(action.id)}
                disabled={disabled}
              >
                <span className="font-medium text-xs">{action.name}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {action.description}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
