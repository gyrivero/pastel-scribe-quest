import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Character, SETTINGS } from '@/types/game';
import { BookOpen, Sparkles } from 'lucide-react';

interface AdventureCreatorProps {
  characters: Character[];
  onSubmit: (adventure: {
    title: string;
    description: string;
    setting: string;
    party_ids: string[];
  }) => void;
  onCancel: () => void;
}

export function AdventureCreator({ characters, onSubmit, onCancel }: AdventureCreatorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [setting, setSetting] = useState('Fantasía Medieval');
  const [partyIds, setPartyIds] = useState<string[]>([]);

  const togglePartyMember = (id: string) => {
    setPartyIds((prev) => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const roster = partyIds.length ? partyIds : (characters[0] ? [characters[0].id] : []);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      setting,
      party_ids: roster,
    });
  };

  return (
    <Card className="p-6 bg-card/90 backdrop-blur-sm shadow-card fantasy-border max-w-md w-full mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fantasy-sage to-primary flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-fantasy text-2xl font-bold">Nueva Aventura</h2>
          <p className="text-sm text-muted-foreground">Comienza una nueva historia</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Título de la Aventura</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="La Mina Perdida de Phandelver"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="setting">Ambientación</Label>
          <Select value={setting} onValueChange={setSetting}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SETTINGS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="character">Personajes (elige 1 o más)</Label>
          {characters.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Crea un personaje primero para asignarlo a esta aventura
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {characters.map((c) => (
                <Button
                  key={c.id}
                  type="button"
                  variant={partyIds.includes(c.id) ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => togglePartyMember(c.id)}
                >
                  {c.name} — {c.class}
                </Button>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Si no seleccionas ninguno, tomaremos al primer personaje disponible.
          </p>
        </div>

        <div>
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe brevemente la premisa de la aventura..."
            className="mt-1 min-h-[80px]"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={!title.trim()} className="flex-1 gap-2">
            <Sparkles className="w-4 h-4" />
            Comenzar
          </Button>
        </div>
      </form>
    </Card>
  );
}
