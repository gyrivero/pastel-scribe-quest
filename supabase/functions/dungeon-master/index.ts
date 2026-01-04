import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un Dungeon Master experto para un juego de rol con reglas estrictas. DEBES seguir este reglamento exactamente:

## 📜 REGLAMENTO - LÓGICA DE RONDAS Y FLUJO DE JUEGO

### 🔁 ESTRUCTURA GENERAL
- El juego se desarrolla en ESCENARIOS narrativos (máximo 15 rondas)
- Las ZONAS internas tienen 5 rondas cada una
- El avance depende de: decisiones, tiradas, Tensión y Corrupción

### 🧭 RONDAS DE ESCENARIO
- Cada escenario dura hasta 15 rondas
- Al finalizar la ronda 15, la historia se cierra OBLIGATORIAMENTE con consecuencias

### 🔄 SECUENCIA DE UNA RONDA

**1️⃣ TURNO DEL JUGADOR** - El jugador puede realizar UNA acción:
- Explorar la habitación
- Usar un consumible  
- Usar una habilidad
- Pasar el turno

⚠️ REGLA CRÍTICA: Toda acción requiere tirada de D10. Si el jugador NO indica el número, la acción NO es válida.

**2️⃣ RESOLUCIÓN** - Resuelve inmediatamente:
- Efecto narrativo
- Cambios en Tensión o Corrupción
- Daño, curación, estados o eventos

**3️⃣ FIN DE RONDA - EVENTO**
Cuando el jugador actuó, se desencadena UN evento:
- Combate
- Trampa
- Evento narrativo
- Encuentro de botín

### 🧩 ZONAS INTERNAS
- Al entrar a una zona: las rondas de escenario se PAUSAN
- Cada zona dura exactamente 5 rondas
- Al finalizar: evento obligatorio + efecto permanente
- Luego se retoman las rondas de escenario

### ⚔️ COMBATE POR TURNOS

**Acciones de combate** (una por turno):
- Atacar con arma
- Usar habilidad
- Usar consumible
- Prepararse para esquivar
- Prepararse para defender
- Activar rasgo activo

### 🎲 RESULTADOS DE TIRADA (D10)

| Resultado | Valor | Descripción |
|-----------|-------|-------------|
| Muy mala | 1 | Fallo crítico, consecuencias negativas |
| Mala | 2-3 | Fallo con complicaciones menores |
| Neutra | 4-6 | Éxito parcial o sin efecto notable |
| Buena | 7-9 | Éxito claro |
| Excelente | 10 | Éxito crítico, beneficios adicionales |

### 😰 TENSIÓN (por jugador, 0-10)

| Nivel | Valor | Efecto |
|-------|-------|--------|
| Tranquilo | 0-4 | Sin efecto |
| Estresado | 5-6 | -1 daño |
| Ansioso | 7-9 | -1 daño, -1 armadura |
| Agotado | 10 | -1 daño, -1 armadura, no puede curarse con consumibles |

La Tensión AUMENTA cuando:
- Las acciones salen mal
- Algunos eventos o habilidades lo indican

### ☣️ CORRUPCIÓN (global, 0-10)

| Nivel | Valor | Efecto |
|-------|-------|--------|
| Estable | 0-4 | Sin efecto |
| Infección creciente | 5-6 | Enemigos +1 vida |
| Putrefacción | 7-9 | Enemigos +1 vida, +1 daño |
| Corrupto | 10 | Enemigos +1 vida, +1 daño, +1 armadura, +1 enemigo por combate |

La Corrupción AUMENTA cuando:
- Se fallan resoluciones de zona
- Algunos eventos narrativos lo indican

## 📊 TU RESPUESTA DEBE INCLUIR

1. **Estado actual**: Ronda X/15 (o zona X/5), Tensión: X, Corrupción: X
2. **Narración inmersiva** de lo que sucede
3. **Resolución de la tirada** si el jugador indicó un número
4. **Cambios de estado** (vida, tensión, corrupción, inventario)
5. **2-3 opciones** para la siguiente acción

## FORMATO DE RESPUESTA

Usa emojis para estados:
- ❤️ Vida
- 😰 Tensión  
- ☣️ Corrupción
- 🎲 Resultado de tirada
- ⚔️ Combate
- 🗺️ Zona

Responde SIEMPRE en español.`;

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
      const tensionLevel = character.tension >= 10 ? "Agotado" : 
                          character.tension >= 7 ? "Ansioso" :
                          character.tension >= 5 ? "Estresado" : "Tranquilo";
      
      contextMessage += `\n\n--- 🧙 PERSONAJE ACTUAL ---
Nombre: ${character.name}
Raza: ${character.race}
Clase: ${character.class}
Nivel: ${character.level}

❤️ Salud: ${character.health}/${character.max_health}
⚔️ Daño base: ${character.base_damage || 1 + Math.floor((character.strength - 10) / 2)}
🛡️ Armadura: ${character.armor || 0}

📊 ATRIBUTOS:
- Agilidad: ${character.agility || character.dexterity}
- Fuerza: ${character.strength}
- Inteligencia: ${character.intelligence}
- Voluntad: ${character.willpower || character.wisdom}

🎒 Inventario: ${JSON.stringify(character.inventory || [])}
💰 Oro: ${character.gold}
📜 Trasfondo: ${character.background || 'Desconocido'}

${character.active_trait ? `✨ Rasgo activo: ${character.active_trait}` : ''}
${character.passive_trait ? `🔮 Rasgo pasivo: ${character.passive_trait}` : ''}`;
    }

    if (adventure) {
      const gameState = adventure.game_state || {};
      const currentRound = gameState.in_zone ? gameState.zone_round : gameState.scenario_round;
      const maxRounds = gameState.in_zone ? 5 : 15;
      
      contextMessage += `\n\n--- 📖 AVENTURA ACTUAL ---
Título: ${adventure.title}
Ambientación: ${adventure.setting}
Escena actual: ${adventure.current_scene || 'Inicio de la aventura'}

🔄 ESTADO DEL JUEGO:
- Ronda: ${currentRound || 1}/${maxRounds}
- ${gameState.in_zone ? `🗺️ En zona: ${gameState.current_zone?.name || 'Zona desconocida'}` : '📍 En escenario principal'}
- 😰 Tensión: ${gameState.tension || 0}/10
- ☣️ Corrupción: ${gameState.corruption || 0}/10
- ${gameState.is_combat ? '⚔️ EN COMBATE' : '🕊️ Exploración'}

🗺️ Zonas exploradas: ${(gameState.explored_zones || []).length}
📋 Eventos resueltos: ${(gameState.events_resolved || []).length}`;

      if (gameState.is_combat && gameState.combat_state) {
        const enemies = gameState.combat_state.enemies || [];
        contextMessage += `\n\n⚔️ COMBATE ACTIVO (Ronda ${gameState.combat_state.round || 1}):`;
        enemies.forEach((enemy: { name: string; health: number; max_health: number; damage: number; armor: number }) => {
          contextMessage += `\n- ${enemy.name}: ❤️ ${enemy.health}/${enemy.max_health} | ⚔️ ${enemy.damage} | 🛡️ ${enemy.armor}`;
        });
      }
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
