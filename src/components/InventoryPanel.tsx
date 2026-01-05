import { useState } from 'react';
import { GameItem, Character } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sword, 
  Shield, 
  FlaskConical, 
  Package,
  Sparkles,
  X,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryPanelProps {
  character: Character;
  onUseItem?: (item: GameItem) => void;
  onEquipItem?: (item: GameItem) => void;
  onAddItem?: (item: Omit<GameItem, 'id'>) => void;
  onClose?: () => void;
}

export function InventoryPanel({ character, onUseItem, onEquipItem, onAddItem, onClose }: InventoryPanelProps) {
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<GameItem, 'id'>>({
    name: '',
    type: 'utility',
    effect_mechanical: '',
    effect_narrative: '',
    uses: 'unlimited',
    uses_remaining: undefined,
  });

  const getItemsByType = (type: GameItem['type']) => {
    return character.inventory?.filter(item => item.type === type) || [];
  };

  const getItemIcon = (type: GameItem['type']) => {
    switch (type) {
      case 'weapon': return Sword;
      case 'consumable': return FlaskConical;
      case 'relic': return Star;
      case 'utility': return Package;
      default: return Package;
    }
  };

  const getItemColor = (type: GameItem['type']) => {
    switch (type) {
      case 'weapon': return 'text-red-400 bg-red-500/10';
      case 'consumable': return 'text-green-400 bg-green-500/10';
      case 'relic': return 'text-purple-400 bg-purple-500/10';
      case 'utility': return 'text-blue-400 bg-blue-500/10';
      default: return 'text-muted-foreground bg-muted/50';
    }
  };

  const renderItemCard = (item: GameItem) => {
    const Icon = getItemIcon(item.type);
    const isEquipped = item.equipped;
    const isSelected = selectedItem?.id === item.id;

    return (
      <Card
        key={item.id}
        className={cn(
          "p-3 cursor-pointer transition-all fantasy-border",
          isSelected && "ring-2 ring-primary",
          isEquipped && "bg-primary/10"
        )}
        onClick={() => setSelectedItem(item)}
      >
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", getItemColor(item.type))}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              {isEquipped && (
                <Badge variant="secondary" className="text-xs">Equipado</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {item.effect_narrative || 'Sin descripción'}
            </p>
            {item.uses === 'limited' && item.uses_remaining !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                Usos: {item.uses_remaining}
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderEquipmentSlot = (slot: 'weapon' | 'armor' | 'accessory', label: string) => {
    const item = character.equipment?.[slot];
    const Icon = slot === 'weapon' ? Sword : slot === 'armor' ? Shield : Sparkles;

    return (
      <Card className="p-3 bg-muted/30 fantasy-border">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            item ? getItemColor(item.type) : "bg-muted/50"
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase">{label}</p>
            <p className="font-medium text-sm">
              {item ? item.name : 'Vacío'}
            </p>
            {item?.damage && (
              <p className="text-xs text-red-400">+{item.damage} daño</p>
            )}
            {item?.armor_value && (
              <p className="text-xs text-blue-400">+{item.armor_value} armadura</p>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Card className="p-4 bg-card/95 backdrop-blur-sm shadow-card fantasy-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-fantasy text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Inventario
        </h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Equipment Slots */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {renderEquipmentSlot('weapon', 'Arma')}
        {renderEquipmentSlot('armor', 'Armadura')}
        {renderEquipmentSlot('accessory', 'Accesorio')}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-9">
          <TabsTrigger value="all" className="text-xs">Todo</TabsTrigger>
          <TabsTrigger value="weapons" className="text-xs">Armas</TabsTrigger>
          <TabsTrigger value="consumables" className="text-xs">Consumibles</TabsTrigger>
          <TabsTrigger value="relics" className="text-xs">Reliquias</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[200px] mt-3">
          <TabsContent value="all" className="space-y-2 m-0">
            {character.inventory?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Tu inventario está vacío
              </p>
            ) : (
              character.inventory?.map(renderItemCard)
            )}
          </TabsContent>

          <TabsContent value="weapons" className="space-y-2 m-0">
            {getItemsByType('weapon').length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Sin armas
              </p>
            ) : (
              getItemsByType('weapon').map(renderItemCard)
            )}
          </TabsContent>

          <TabsContent value="consumables" className="space-y-2 m-0">
            {getItemsByType('consumable').length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Sin consumibles
              </p>
            ) : (
              getItemsByType('consumable').map(renderItemCard)
            )}
          </TabsContent>

          <TabsContent value="relics" className="space-y-2 m-0">
            {getItemsByType('relic').length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Sin reliquias
              </p>
            ) : (
              getItemsByType('relic').map(renderItemCard)
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {onAddItem && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Registrar objeto encontrado</h4>
            <Badge variant="outline">D20</Badge>
          </div>
          <Label className="text-xs">Nombre</Label>
          <Input
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Espada rota, Llave de cobre, Poción menor..."
          />
          <Label className="text-xs">Tipo</Label>
          <Select value={newItem.type} onValueChange={(v) => setNewItem({ ...newItem, type: v as GameItem['type'] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weapon">Arma</SelectItem>
              <SelectItem value="consumable">Consumible</SelectItem>
              <SelectItem value="utility">Objeto útil</SelectItem>
              <SelectItem value="relic">Reliquia</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-xs">Efecto mecánico</Label>
          <Input
            value={newItem.effect_mechanical}
            onChange={(e) => setNewItem({ ...newItem, effect_mechanical: e.target.value })}
            placeholder="Ej: +1 daño en la próxima tirada"
          />
          <Label className="text-xs">Efecto narrativo</Label>
          <Input
            value={newItem.effect_narrative}
            onChange={(e) => setNewItem({ ...newItem, effect_narrative: e.target.value })}
            placeholder="Ej: brilla con runas antiguas"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Usos</Label>
              <Select value={newItem.uses} onValueChange={(v) => setNewItem({ ...newItem, uses: v as GameItem['uses'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlimited">Ilimitado</SelectItem>
                  <SelectItem value="limited">Limitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newItem.uses === 'limited' && (
              <div>
                <Label className="text-xs">Usos restantes</Label>
                <Input
                  type="number"
                  min={1}
                  value={newItem.uses_remaining || 1}
                  onChange={(e) => setNewItem({ ...newItem, uses_remaining: Number(e.target.value) })}
                />
              </div>
            )}
          </div>
          <Button
            size="sm"
            className="w-full"
            disabled={!newItem.name.trim()}
            onClick={() => {
              onAddItem({ ...newItem, effect_narrative: newItem.effect_narrative || 'Hallazgo registrado', uses_remaining: newItem.uses === 'limited' ? (newItem.uses_remaining || 1) : undefined });
              setNewItem({ name: '', type: 'utility', effect_mechanical: '', effect_narrative: '', uses: 'unlimited', uses_remaining: undefined });
            }}
          >
            Añadir al inventario
          </Button>
        </div>
      )}

      {/* Selected Item Actions */}
      {selectedItem && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">{selectedItem.name}</h4>
          <p className="text-xs text-muted-foreground">{selectedItem.effect_narrative}</p>
          {selectedItem.effect_mechanical && (
            <p className="text-xs text-primary">Efecto: {selectedItem.effect_mechanical}</p>
          )}
          {selectedItem.restrictions && (
            <p className="text-xs text-destructive">Restricción: {selectedItem.restrictions}</p>
          )}
          <div className="flex gap-2 mt-2">
            {onUseItem && (
              <Button 
                size="sm" 
                onClick={() => onUseItem(selectedItem)}
                className="flex-1"
              >
                Usar
              </Button>
            )}
            {selectedItem.type === 'weapon' && onEquipItem && (
              <Button 
                size="sm" 
                variant={selectedItem.equipped ? "outline" : "default"}
                onClick={() => onEquipItem(selectedItem)}
                className="flex-1"
              >
                {selectedItem.equipped ? 'Desequipar' : 'Equipar'}
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setSelectedItem(null)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
