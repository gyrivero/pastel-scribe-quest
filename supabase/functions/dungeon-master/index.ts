import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un Dungeon Master experto y creativo para juegos de rol de fantasía. Tu rol es:

1. NARRACIÓN: Crear descripciones inmersivas, atmosféricas y evocadoras de escenas, lugares y personajes. Usa un lenguaje rico pero conciso.

2. REGLAS DEL JUEGO:
   - Cuando el jugador intente una acción que requiera habilidad, indica qué tipo de tirada necesita (ej: "Tirada de Destreza" o "Tirada de Fuerza")
   - Indica la dificultad: Fácil (DC 10), Medio (DC 13), Difícil (DC 16), Muy Difícil (DC 19)
   - Si el jugador incluye un resultado de dado en su mensaje, interpreta el resultado según las reglas

3. COMBATE:
   - Gestiona turnos de combate de forma clara
   - Calcula daño basándote en los stats del personaje
   - Describe los efectos de las acciones de forma dramática

4. COHERENCIA:
   - Mantén consistencia con los eventos previos de la historia
   - Recuerda los NPCs, lugares y objetos mencionados
   - Respeta las limitaciones del personaje (salud, inventario, habilidades)

5. FORMATO:
   - Usa párrafos cortos para mejor legibilidad
   - Incluye ocasionalmente diálogos de NPCs entre comillas
   - Al final de cada respuesta, ofrece 2-3 opciones de acción para el jugador

6. TONO:
   - Mantén un balance entre drama y diversión
   - Adapta la dificultad para mantener el juego interesante
   - Celebra los éxitos críticos y haz memorables los fallos críticos

Responde siempre en español.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, character, adventure } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context with character and adventure info
    let contextMessage = SYSTEM_PROMPT;
    
    if (character) {
      contextMessage += `\n\n--- PERSONAJE ACTUAL ---
Nombre: ${character.name}
Raza: ${character.race}
Clase: ${character.class}
Nivel: ${character.level}
Salud: ${character.health}/${character.max_health}
Fuerza: ${character.strength}
Destreza: ${character.dexterity}
Constitución: ${character.constitution}
Inteligencia: ${character.intelligence}
Sabiduría: ${character.wisdom}
Carisma: ${character.charisma}
Experiencia: ${character.experience}
Oro: ${character.gold}
Inventario: ${JSON.stringify(character.inventory || [])}
Trasfondo: ${character.background || 'Desconocido'}`;
    }

    if (adventure) {
      contextMessage += `\n\n--- AVENTURA ACTUAL ---
Título: ${adventure.title}
Ambientación: ${adventure.setting}
Escena actual: ${adventure.current_scene || 'Inicio de la aventura'}`;
    }

    console.log("Calling Lovable AI with context:", { 
      hasCharacter: !!character, 
      hasAdventure: !!adventure,
      messageCount: messages?.length || 0 
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: contextMessage },
          ...(messages || []),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Se requiere pago. Por favor añade créditos a tu workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Dungeon Master error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
