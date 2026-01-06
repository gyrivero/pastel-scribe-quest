import { Zone, GameState, getZoneStatus, getZoneStatusColor, getZoneStatusName, ZoneStatus } from '@/types/game';
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
  Ban,
  X,
  Eye,
  EyeOff
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

  const getStatusIcon = (status: ZoneStatus) => {
    switch (status) {
      case 'cleared': return CheckCircle2;
      case 'explored': return Eye;
      case 'blocked': return Ban;
      default: return EyeOff;
    }
  };

  const getZoneColor = (zone: Zone) => {
    const status = getZoneStatus(zone);
    const isCurrent = gameState.current_zone?.id === zone.id;
    
    if (isCurrent) return 'bg-primary/30 border-primary text-primary';
    return getZoneStatusColor(status);
  };

  const isZoneAccessible = (zone: Zone) => {
    const status = getZoneStatus(zone);
    if (status === 'blocked') return false;
    if (zone.explored || zone.cleared) return true;
    if (!gameState.current_zone) return zone.type === 'entrance';
    return gameState.current_zone.connected_zones.includes(zone.id);
  };

  // Create a simple grid layout for zones
  const gridSize = 5;
  const cellSize = 60;

  // Contadores por estado
  const zonesByStatus = {
    unexplored: gameState.zones.filter(z => getZoneStatus(z) === 'unexplored').length,
    explored: gameState.zones.filter(z => getZoneStatus(z) === 'explored').length,
    cleared: gameState.zones.filter(z => getZoneStatus(z) === 'cleared').length,
    blocked: gameState.zones.filter(z => getZoneStatus(z) === 'blocked').length,
  };

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

      {/* Info importante */}
      <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Map className="w-4 h-4 text-primary" />
          <span>📌 Este es un <strong>mapa de oportunidades narrativas</strong>, no un mapa táctico.</span>
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="text-xs bg-green-500/10">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Completada ({zonesByStatus.cleared})
        </Badge>
        <Badge variant="outline" className="text-xs bg-yellow-500/10">
          <Eye className="w-3 h-3 mr-1" /> Explorada ({zonesByStatus.explored})
        </Badge>
        <Badge variant="outline" className="text-xs bg-muted/50">
          <EyeOff className="w-3 h-3 mr-1" /> Sin explorar ({zonesByStatus.unexplored})
        </Badge>
        {zonesByStatus.blocked > 0 && (
          <Badge variant="outline" className="text-xs bg-red-500/10">
            <Ban className="w-3 h-3 mr-1" /> Bloqueada ({zonesByStatus.blocked})
          </Badge>
        )}
      </div>

      {gameState.zones.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Map className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">El mapa se revelará al explorar</p>
          <p className="text-xs mt-2">El escenario generará zonas conectadas</p>
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
                  
                  const zoneStatus = getZoneStatus(zone);
                  const connectedStatus = getZoneStatus(connectedZone);
                  const isBlocked = zoneStatus === 'blocked' || connectedStatus === 'blocked';
                  const isExplored = (zoneStatus === 'explored' || zoneStatus === 'cleared') && 
                                     (connectedStatus === 'explored' || connectedStatus === 'cleared');
                  
                  return (
                    <line
                      key={`${zone.id}-${connectedId}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isBlocked ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"}
                      strokeWidth="2"
                      strokeDasharray={isExplored ? "0" : "5,5"}
                      opacity={isBlocked ? "0.5" : "0.3"}
                    />
                  );
                })
              )}
            </svg>

            {/* Zone Nodes */}
            {gameState.zones.map(zone => {
              const Icon = getZoneIcon(zone.type);
              const status = getZoneStatus(zone);
              const StatusIcon = getStatusIcon(status);
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
                  title={`${zone.name} - ${getZoneStatusName(status)}`}
                >
                  <Icon className="w-5 h-5" />
                  {/* Status indicator */}
                  <div className="absolute -top-1 -right-1">
                    <StatusIcon className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Zone List */}
          <div className="mt-4 space-y-2">
            {gameState.zones.map(zone => {
              const Icon = getZoneIcon(zone.type);
              const status = getZoneStatus(zone);
              const StatusIcon = getStatusIcon(status);
              const accessible = isZoneAccessible(zone);
              const isCurrent = gameState.current_zone?.id === zone.id;
              
              return (
                <div
                  key={zone.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    isCurrent ? "bg-primary/10 border-primary" : "bg-muted/30 border-transparent",
                    accessible && !isCurrent && "cursor-pointer hover:bg-muted/50",
                    status === 'blocked' && "opacity-60"
                  )}
                  onClick={() => accessible && onSelectZone?.(zone)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      getZoneStatusColor(status)
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{zone.name}</span>
                        <StatusIcon className="w-3 h-3" />
                        {isCurrent && <Badge variant="secondary" className="text-xs">Actual</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {status === 'unexplored' ? '???' : 
                         status === 'blocked' ? zone.blocked_reason || 'Acceso bloqueado' : 
                         zone.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getZoneStatusName(status)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-muted-foreground">{zonesByStatus.unexplored}</p>
          <p className="text-xs text-muted-foreground">Sin explorar</p>
        </div>
        <div>
          <p className="text-lg font-bold text-yellow-500">{zonesByStatus.explored}</p>
          <p className="text-xs text-muted-foreground">Exploradas</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-500">{zonesByStatus.cleared}</p>
          <p className="text-xs text-muted-foreground">Completadas</p>
        </div>
        <div>
          <p className="text-lg font-bold text-red-500">{zonesByStatus.blocked}</p>
          <p className="text-xs text-muted-foreground">Bloqueadas</p>
        </div>
      </div>
    </Card>
  );
}