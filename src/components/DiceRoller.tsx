import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Dices } from 'lucide-react';
import { ATTRIBUTES, getDiceOutcome, getOutcomeLabel, getOutcomeColor, Character } from '@/types/game';

interface DiceRollerProps {
  onRoll: (dice: string, result: number, attribute?: string, modifier?: number, total?: number) => void;
  character?: Character | null;
}

export function DiceRoller({ onRoll, character }: DiceRollerProps) {
  const [lastRoll, setLastRoll] = useState<{ 
    dice: string; 
    result: number; 
    attribute?: string;
    modifier: number;
    total: number;
  } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<string>('none');

  const rollD20 = () => {
    setIsRolling(true);
    
    setTimeout(() => {
      const result = Math.floor(Math.random() * 20) + 1;
      
      let modifier = 0;
      let attrName: string | undefined;
      
      if (selectedAttribute !== 'none' && character) {
        modifier = character[selectedAttribute as keyof typeof character] as number || 0;
        attrName = ATTRIBUTES.find(a => a.id === selectedAttribute)?.name;
      }
      
      const total = result + modifier;
      
      setLastRoll({ dice: 'd20', result, attribute: attrName, modifier, total });
      setIsRolling(false);
      onRoll('d20', result, attrName, modifier, total);
    }, 600);
  };

  const outcome = lastRoll ? getDiceOutcome(lastRoll.total) : null;

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 shadow-card fantasy-border">
      <div className="flex items-center gap-2 mb-3">
        <Dices className="w-5 h-5 text-primary" />
        <h3 className="font-fantasy text-lg font-semibold">Tirada D20</h3>
      </div>
      
      {/* Attribute selector */}
      <div className="mb-4">
        <Label className="text-xs text-muted-foreground mb-1 block">
          Atributo (modifica la tirada)
        </Label>
        <Select value={selectedAttribute} onValueChange={setSelectedAttribute}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sin atributo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin atributo</SelectItem>
            {ATTRIBUTES.map((attr) => {
              const value = character?.[attr.id as keyof typeof character] as number;
              return (
                <SelectItem key={attr.id} value={attr.id}>
                  {attr.name} {value !== undefined && `(+${value})`}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Roll button */}
      <Button
        onClick={rollD20}
        disabled={isRolling}
        className="w-full gap-2 mb-4"
        size="lg"
      >
        <Dices className={cn("w-5 h-5", isRolling && "animate-spin")} />
        Tirar D20
      </Button>
      
      {/* Result display */}
      {lastRoll && (
        <div 
          className={cn(
            "flex flex-col items-center justify-center p-4 rounded-lg transition-all",
            isRolling && "animate-dice-roll",
            outcome === 'excelente' && "bg-primary/20 ring-2 ring-primary",
            outcome === 'muy_mala' && "bg-destructive/20 ring-2 ring-destructive",
            !['excelente', 'muy_mala'].includes(outcome || '') && "bg-muted"
          )}
        >
          {/* Dice result */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-fantasy font-bold">{lastRoll.result}</span>
            {lastRoll.modifier > 0 && (
              <>
                <span className="text-muted-foreground">+</span>
                <span className="text-lg font-medium text-primary">{lastRoll.modifier}</span>
                <span className="text-xs text-muted-foreground">({lastRoll.attribute})</span>
              </>
            )}
            <span className="text-muted-foreground">=</span>
            <span className={cn("text-3xl font-fantasy font-bold", outcome && getOutcomeColor(outcome))}>
              {lastRoll.total}
            </span>
          </div>
          
          {/* Outcome label */}
          {outcome && (
            <p className={cn("text-sm font-medium", getOutcomeColor(outcome))}>
              {getOutcomeLabel(outcome)}
            </p>
          )}
          
          {/* Outcome guide */}
          <div className="mt-3 text-xs text-muted-foreground text-center">
            <p>≤5: Muy Mala | 6-9: Mala | 10-14: Neutra | 15-19: Buena | ≥20: Excelente</p>
          </div>
        </div>
      )}
    </div>
  );
}
