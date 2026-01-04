import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dices } from 'lucide-react';

interface DiceRollerProps {
  onRoll: (dice: string, result: number) => void;
}

const DICE_TYPES = [
  { name: 'd4', sides: 4 },
  { name: 'd6', sides: 6 },
  { name: 'd8', sides: 8 },
  { name: 'd10', sides: 10 },
  { name: 'd12', sides: 12 },
  { name: 'd20', sides: 20 },
  { name: 'd100', sides: 100 },
];

export function DiceRoller({ onRoll }: DiceRollerProps) {
  const [lastRoll, setLastRoll] = useState<{ dice: string; result: number } | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = (dice: string, sides: number) => {
    setIsRolling(true);
    
    // Animate for a moment
    setTimeout(() => {
      const result = Math.floor(Math.random() * sides) + 1;
      setLastRoll({ dice, result });
      setIsRolling(false);
      onRoll(dice, result);
    }, 600);
  };

  const isCritical = lastRoll?.dice === 'd20' && lastRoll.result === 20;
  const isFumble = lastRoll?.dice === 'd20' && lastRoll.result === 1;

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 shadow-card fantasy-border">
      <div className="flex items-center gap-2 mb-3">
        <Dices className="w-5 h-5 text-primary" />
        <h3 className="font-fantasy text-lg font-semibold">Dados</h3>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {DICE_TYPES.map(({ name, sides }) => (
          <Button
            key={name}
            variant="outline"
            size="sm"
            onClick={() => rollDice(name, sides)}
            disabled={isRolling}
            className="min-w-[3rem] font-medium hover:bg-primary/10 hover:border-primary/50 transition-all"
          >
            {name}
          </Button>
        ))}
      </div>
      
      {lastRoll && (
        <div 
          className={cn(
            "flex items-center justify-center p-4 rounded-lg transition-all",
            isRolling && "animate-dice-roll",
            isCritical && "bg-primary/20 ring-2 ring-primary",
            isFumble && "bg-destructive/20 ring-2 ring-destructive",
            !isCritical && !isFumble && "bg-muted"
          )}
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">{lastRoll.dice}</p>
            <p className={cn(
              "text-3xl font-fantasy font-bold",
              isCritical && "text-primary",
              isFumble && "text-destructive"
            )}>
              {lastRoll.result}
            </p>
            {isCritical && (
              <p className="text-xs text-primary font-medium mt-1">¡Crítico!</p>
            )}
            {isFumble && (
              <p className="text-xs text-destructive font-medium mt-1">¡Pifia!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
