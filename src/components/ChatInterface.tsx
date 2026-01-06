import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, Character, Adventure, DiceRoll } from '@/types/game';
import { cn } from '@/lib/utils';
import { Send, Loader2, Dices } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  character: Character | null;
  adventure: Adventure | null;
  messages: ChatMessage[];
  onMessagesUpdate: (messages: ChatMessage[]) => void;
  lastDiceRoll?: DiceRoll | null;
}

export function ChatInterface({ 
  character, 
  adventure, 
  messages, 
  onMessagesUpdate,
  lastDiceRoll 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    let messageContent = input.trim();
    
    // Include dice roll if recent - now with attribute modifier
    if (lastDiceRoll) {
      if (lastDiceRoll.attribute && lastDiceRoll.modifier) {
        messageContent += `\n\n[Tirada de ${lastDiceRoll.dice}: ${lastDiceRoll.result} + ${lastDiceRoll.attribute}: ${lastDiceRoll.modifier} = Total: ${lastDiceRoll.total}]`;
      } else {
        messageContent += `\n\n[Tirada de ${lastDiceRoll.dice}: ${lastDiceRoll.result}]`;
      }
    }

    const userMessage: ChatMessage = { role: 'user', content: messageContent };
    const updatedMessages = [...messages, userMessage];
    onMessagesUpdate(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dungeon-master`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages,
          character,
          adventure,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Límite de solicitudes excedido. Espera un momento.');
          return;
        }
        if (response.status === 402) {
          toast.error('Se requieren créditos adicionales.');
          return;
        }
        throw new Error('Error al conectar con el Dungeon Master');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No se pudo leer la respuesta');

      let assistantContent = '';
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              onMessagesUpdate([
                ...updatedMessages,
                { role: 'assistant', content: assistantContent },
              ]);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Error al comunicarse con el Dungeon Master');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm rounded-xl shadow-card fantasy-border overflow-hidden">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-fantasy text-lg mb-2">
                ¡Bienvenido a tu aventura!
              </p>
              <p className="text-sm">
                Escribe tu primera acción para comenzar...
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "animate-fade-in",
                message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 shadow-soft",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                )}
              >
                {message.role === 'assistant' && (
                  <p className="text-xs text-muted-foreground mb-1 font-medium">
                    Dungeon Master
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    El Dungeon Master está narrando...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-background/50">
        {lastDiceRoll && (
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
            <Dices className="w-4 h-4" />
            <span>
              {lastDiceRoll.dice}: <strong>{lastDiceRoll.result}</strong>
              {lastDiceRoll.attribute && lastDiceRoll.modifier !== undefined && (
                <> + {lastDiceRoll.attribute}: <strong>{lastDiceRoll.modifier}</strong> = <strong className="text-primary">{lastDiceRoll.total}</strong></>
              )}
            </span>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="¿Qué hace tu personaje?"
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-auto aspect-square"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
