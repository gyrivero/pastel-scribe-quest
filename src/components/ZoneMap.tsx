import { Zone, GameState } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Map, 
  MapPin, 
  DoorOpen, 
  Skull, 
  Gem, 
  AlertTriangle,
  CheckCircle2,
  Lock,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZoneMapProps {
  gameState: GameState;
  onSelectZone?: (zone: Zone) => void;
  onClose?: () => void;
}

export function ZoneMap({ gameState, onSelectZone, onClose }: ZoneMapProps) {
  const getZoneIcon = (type: Zone['type']) => {
    switch (type) {
      case 'entrance': return DoorOpen;
      case 'boss': return Skull;
      case 'treasure': return Gem;
      case 'trap': return AlertTriangle;
      case 'exit': return DoorOpen;
      default: return MapPin;
    }
  };

  const getZoneColor = (zone: Zone) => {
    if (zone.cleared) return 'bg-green-500/20 border-green-500/50 text-green-400';
    if (zone.explored) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
    if (gameState.current_zone?.id === zone.id) return 'bg-primary/30 border-primary text-primary';
    return 'bg-muted/50 border-muted-foreground/30 text-muted-foreground';
  };

  const isZoneAccessible = (zone: Zone) => {
    if (zone.explored || zone.cleared) return true;
    if (!gameState.current_zone) return zone.type === 'entrance';
    return gameState.current_zone.connected_zones.includes(zone.id);
  };

  // Create a simple grid layout for zones
  const gridSize = 5;
  const cellSize = 60;

  return (
    <Card className="p-4 bg-card/95 backdrop-blur-sm shadow-card fantasy-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-fantasy text-lg font-semibold flex items-center gap-2">
          <Map className="w-5 h-5 text-primary" />
          Mapa de Zonas
        </h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="text-xs bg-green-500/10">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Completada
        </Badge>
        <Badge variant="outline" className="text-xs bg-yellow-500/10">
          <MapPin className="w-3 h-3 mr-1" /> Explorada
        </Badge>
        <Badge variant="outline" className="text-xs bg-muted/50">
          <Lock className="w-3 h-3 mr-1" /> Sin explorar
        </Badge>
      </div>

      {gameState.zones.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Map className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">El mapa se revelará al explorar</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div 
            className="relative mx-auto"
            style={{ 
              width: gridSize * cellSize, 
              height: gridSize * cellSize,
              minHeight: 200
            }}
          >
            {/* Connection Lines */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
              {gameState.zones.map(zone => 
                zone.connected_zones.map(connectedId => {
                  const connectedZone = gameState.zones.find(z => z.id === connectedId);
                  if (!connectedZone) return null;
                  
                  const x1 = zone.position.x * cellSize + cellSize / 2;
                  const y1 = zone.position.y * cellSize + cellSize / 2;
                  const x2 = connectedZone.position.x * cellSize + cellSize / 2;
                  const y2 = connectedZone.position.y * cellSize + cellSize / 2;
                  
                  return (
                    <line
                      key={`${zone.id}-${connectedId}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="2"
                      strokeDasharray={zone.explored && connectedZone.explored ? "0" : "5,5"}
                      opacity="0.3"
                    />
                  );
                })
              )}
            </svg>

            {/* Zone Nodes */}
            {gameState.zones.map(zone => {
              const Icon = getZoneIcon(zone.type);
              const accessible = isZoneAccessible(zone);
              const isCurrent = gameState.current_zone?.id === zone.id;
              
              return (
                <button
                  key={zone.id}
                  className={cn(
                    "absolute w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all",
                    getZoneColor(zone),
                    accessible ? "cursor-pointer hover:scale-110" : "cursor-not-allowed opacity-50",
                    isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse"
                  )}
                  style={{
                    left: zone.position.x * cellSize + (cellSize - 48) / 2,
                    top: zone.position.y * cellSize + (cellSize - 48) / 2,
                  }}
                  onClick={() => accessible && onSelectZone?.(zone)}
                  disabled={!accessible}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          {/* Zone List */}
          <div className="mt-4 space-y-2">
            {gameState.zones.map(zone => {
              const Icon = getZoneIcon(zone.type);
              const accessible = isZoneAccessible(zone);
              const isCurrent = gameState.current_zone?.id === zone.id;
              
              return (
                <div
                  key={zone.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    isCurrent ? "bg-primary/10 border-primary" : "bg-muted/30 border-transparent",
                    accessible && !isCurrent && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => accessible && onSelectZone?.(zone)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      zone.cleared ? "bg-green-500/20" : zone.explored ? "bg-yellow-500/20" : "bg-muted"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{zone.name}</span>
                        {zone.cleared && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                        {isCurrent && <Badge variant="secondary" className="text-xs">Actual</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {zone.explored ? zone.description : '???'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold">{gameState.explored_zones.length}</p>
          <p className="text-xs text-muted-foreground">Exploradas</p>
        </div>
        <div>
          <p className="text-lg font-bold">{gameState.zones.filter(z => z.cleared).length}</p>
          <p className="text-xs text-muted-foreground">Completadas</p>
        </div>
        <div>
          <p className="text-lg font-bold">{gameState.zones.length - gameState.explored_zones.length}</p>
          <p className="text-xs text-muted-foreground">Por descubrir</p>
        </div>
      </div>
    </Card>
  );
}
