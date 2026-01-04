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
    character_id: string | null;
  }) => void;
  onCancel: () => void;
}

export function AdventureCreator({ characters, onSubmit, onCancel }: AdventureCreatorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [setting, setSetting] = useState('Fantasía Medieval');
  const [characterId, setCharacterId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      setting,
      character_id: characterId || null,
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

        <div>
          <Label htmlFor="character">Personaje</Label>
          <Select value={characterId} onValueChange={setCharacterId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecciona un personaje" />
            </SelectTrigger>
            <SelectContent>
              {characters.length === 0 ? (
                <SelectItem value="none" disabled>
                  No hay personajes creados
                </SelectItem>
              ) : (
                characters.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} - {c.race} {c.class}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {characters.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Crea un personaje primero para asignarlo a esta aventura
            </p>
          )}
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
