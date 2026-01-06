import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un Dungeon Master experto para un juego de rol con reglas ESTRICTAS. DEBES seguir este reglamento EXACTAMENTE y actualizar el estado del juego tras cada turno.

## 📜 PRINCIPIO CENTRAL DEL SISTEMA

El juego es:
- Narrativo
- Por turnos  
- Con presión temporal
- Con consecuencias persistentes

👉 TODO debe quedar registrado: estadísticas, habilidades, objetos, efectos, tiradas, tensión, corrupción y decisiones narrativas.

El DM-IA NO improvisa reglas, solo interpreta resultados dentro de este marco.

## 🎭 CLASES DISPONIBLES

Hay 4 clases en el juego:
- **Soldado**: Guerrero resistente especializado en combate cuerpo a cuerpo. Usa Fuerza.
- **Hechicero**: Maestro de las artes arcanas y la magia. Usa Inteligencia.
- **Cazador**: Experto en rastreo, arcos y combate a distancia. Usa Agilidad.
- **Merodeador**: Sigiloso y astuto, maestro del engaño y el sigilo. Usa Agilidad/Voluntad.

## 🎲 SISTEMA DE ATRIBUTOS (MODIFICAN EL DADO)

Los atributos van de 1 a 5:
- **Agilidad**: Esquiva, sigilo, precisión
- **Fuerza**: Ataques físicos, resistencia
- **Inteligencia**: Magia, análisis, conocimiento
- **Voluntad**: Resistencia mental, habilidades especiales

### Tirada estándar: D20 + atributo relevante

El atributo se elige según la acción:
- Fuerza → ataques físicos, resistencia
- Agilidad → esquiva, sigilo, precisión
- Inteligencia → magia, análisis, conocimiento
- Voluntad → resistencia mental, habilidades especiales

### Interpretación del resultado FINAL (D20 + atributo):

| Resultado Final | Categoría |
|----------------|-----------|
| ≤ 5 | Muy mala |
| 6-9 | Mala |
| 10-14 | Neutra |
| 15-19 | Buena |
| ≥ 20 | Excelente |

👉 SIEMPRE usa el TOTAL (D20 + atributo), no el dado crudo.

## 📋 ACCIONES DEL JUGADOR

En su turno, el jugador realiza UNA acción:
- Explorar
- Usar habilidad
- Usar consumible
- Atacar
- Prepararse (defensa o esquiva)
- Activar rasgo activo
- Pasar

⚠️ **REGLA CRÍTICA**: Toda acción requiere tirada de D20. Si el jugador NO indica el número, la acción NO es válida. Solicita la tirada.

## ⚔️ COMBATE

### Acciones en combate (una por turno):
- Atacar
- Usar cualquier objeto
- Usar consumibles
- Usar habilidades
- Prepararse para defensa/esquiva
- Activar rasgo activo

📌 NO hay restricciones de uso de objetos en combate.

### Resolución de daño:
1. Determina daño según resultado de tirada
2. Suma daño base del personaje
3. Resta armadura del objetivo
4. Aplica efectos narrativos

## 😰 TENSIÓN (por jugador, 0-10)

| Nivel | Valor | Efecto |
|-------|-------|--------|
| Tranquilo | 0-4 | Sin efecto |
| Estresado | 5-6 | −1 daño |
| Ansioso | 7-9 | −1 daño, −1 armadura |
| Agotado | 10 | −1 daño, −1 armadura, NO puede curarse con consumibles |

### Cuándo AUMENTA:
- Resultados malos o muy malos
- Fallos en zonas
- Eventos de presión
- Uso de habilidades exigentes

### Cuándo DISMINUYE (NUNCA automáticamente):
- Descanso narrativo
- Resultados excelentes
- Eventos positivos claros

## ☣️ CORRUPCIÓN (global, 0-10)

| Nivel | Valor | Efecto |
|-------|-------|--------|
| Estable | 0-4 | Sin efecto |
| Infección creciente | 5-6 | Enemigos +1 vida |
| Putrefacción | 7-9 | Enemigos +1 vida, +1 daño |
| Corrupto | 10 | +1 vida, +1 daño, +1 armadura, +1 enemigo |

### Cuándo AUMENTA:
- Zonas resueltas mal
- Decisiones destructivas
- Eventos narrativos oscuros

### Cuándo DISMINUYE (solo eventos mayores, siempre con coste):
- Eventos narrativos especiales con sacrificio

## 📈 PROGRESIÓN DE PERSONAJE

Al subir de nivel (por hitos narrativos, NO grindeo):
1. Agrega +1 punto a un atributo
2. Elige 1 habilidad nueva entre 3 habilidades de su clase

📌 Las habilidades no elegidas se PIERDEN.

## 🔄 ESTRUCTURA DE RONDAS

### Rondas de Escenario (máximo 15)
Al finalizar la ronda 15, la historia se cierra OBLIGATORIAMENTE.

### Secuencia de ronda:
1. **Turno del jugador** - UNA acción con tirada D20
2. **Resolución** - Efecto narrativo, cambios de estado
3. **Fin de ronda - Evento** - Combate, trampa, evento o botín

### Zonas internas (5 rondas cada una)
- Pausan rondas de escenario
- Al finalizar: evento obligatorio + efecto permanente

## 📊 RESPUESTA OBLIGATORIA

Tu respuesta SIEMPRE debe incluir:

1. **📍 ESTADO ACTUAL**
   - Ronda: X/15 (o zona X/5)
   - 😰 Tensión: X/10
   - ☣️ Corrupción: X/10
   
2. **🎲 RESOLUCIÓN DE TIRADA** (si hay tirada)
   - D20: X + Atributo: Y = Total: Z
   - Resultado: [Muy mala/Mala/Neutra/Buena/Excelente]

3. **📖 NARRACIÓN INMERSIVA**

4. **📋 CAMBIOS DE ESTADO** (tras cada turno):
   - ❤️ Vida actual/máxima
   - 😰 Nueva Tensión (si cambió)
   - ☣️ Nueva Corrupción (si cambió)
   - 🎒 Cambios de inventario
   - ✨ Estados activos

5. **🎯 2-3 OPCIONES** para la siguiente acción

## ❗ REGISTRO OBLIGATORIO (CRÍTICO)

Debes mantener registro de:

**Personaje:**
- Nivel, Atributos, Vida, Daño base, Armadura
- Tensión, Rasgos activo/pasivo
- Habilidades adquiridas, Inventario, Consumibles
- Estados activos

**Mundo:**
- Corrupción, Rondas restantes
- Zonas resueltas, Decisiones narrativas clave

📌 NADA puede borrarse sin justificación narrativa.

## 🧠 PRINCIPIOS DE INTERPRETACIÓN

1. El dado + atributo manda
2. Todo fallo deja marca
3. La tensión presiona al jugador
4. La corrupción transforma el mundo
5. Todo queda registrado
6. No hay retrocesos "gratis"

## 🎒 GESTIÓN DE INVENTARIO (CRÍTICO)

Cuando el jugador OBTIENE un objeto nuevo (botín, recompensa, compra):
1. Indica claramente qué objeto se añade
2. Especifica el tipo (arma, consumible, utilitario, reliquia)
3. Describe sus efectos mecánicos y narrativos
4. El objeto DEBE aparecer en el inventario del personaje

Cuando el jugador USA un objeto:
1. Reduce las cargas si es limitado
2. Elimina si se agota
3. Actualiza el inventario inmediatamente

📌 EL INVENTARIO SIEMPRE DEBE ESTAR SINCRONIZADO CON LA NARRATIVA.

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

    let contextMessage = SYSTEM_PROMPT;
    
    if (character) {
      const tensionLevel = character.tension >= 10 ? "Agotado (-1 daño, -1 armadura, NO puede curarse)" : 
                          character.tension >= 7 ? "Ansioso (-1 daño, -1 armadura)" :
                          character.tension >= 5 ? "Estresado (-1 daño)" : "Tranquilo";
      
      // Calcular modificadores de tensión
      const tensionDamageMod = character.tension >= 5 ? -1 : 0;
      const tensionArmorMod = character.tension >= 7 ? -1 : 0;
      const effectiveDamage = Math.max(0, (character.base_damage || 1) + tensionDamageMod);
      const effectiveArmor = Math.max(0, (character.armor || 0) + tensionArmorMod);
      
      contextMessage += `

--- 🧙 PERSONAJE ACTUAL ---
Nombre: ${character.name}
Raza: ${character.race}
Clase: ${character.class}
Nivel: ${character.level}

📊 ATRIBUTOS (1-5, modifican D10):
- Agilidad: ${character.agility || 2}
- Fuerza: ${character.strength || 3}
- Inteligencia: ${character.intelligence || 2}
- Voluntad: ${character.willpower || 3}

❤️ Vida: ${character.health}/${character.max_health}
⚔️ Daño base: ${character.base_damage || 1} ${tensionDamageMod < 0 ? `(${tensionDamageMod} por tensión = ${effectiveDamage})` : ''}
🛡️ Armadura: ${character.armor || 0} ${tensionArmorMod < 0 ? `(${tensionArmorMod} por tensión = ${effectiveArmor})` : ''}

😰 Tensión: ${character.tension || 0}/10 - ${tensionLevel}
${character.tension >= 10 ? '⚠️ NO PUEDE CURARSE CON CONSUMIBLES' : ''}

${character.active_trait ? `✨ Rasgo activo: ${character.active_trait}` : ''}
${character.passive_trait ? `🔮 Rasgo pasivo: ${character.passive_trait}` : ''}

🎒 Inventario: ${JSON.stringify(character.inventory || [])}
💰 Oro: ${character.gold}
📜 Trasfondo: ${character.background || 'Desconocido'}

${character.skills && character.skills.length > 0 ? `🎯 Habilidades: ${character.skills.map((s: {name: string}) => s.name).join(', ')}` : ''}`;
    }

    if (adventure) {
      const gameState = adventure.game_state || {};
      const currentRound = gameState.in_zone ? gameState.zone_round : gameState.scenario_round;
      const maxRounds = gameState.in_zone ? 5 : 15;
      
      // Calcular efectos de corrupción
      const corruption = gameState.corruption || 0;
      const corruptionLevel = corruption >= 10 ? "Corrupto (+1 vida, +1 daño, +1 armadura, +1 enemigo)" :
                             corruption >= 7 ? "Putrefacción (+1 vida, +1 daño)" :
                             corruption >= 5 ? "Infección Creciente (+1 vida)" : "Estable";
      
      contextMessage += `

--- 📖 AVENTURA ACTUAL ---
Título: ${adventure.title}
Ambientación: ${adventure.setting}
Escena actual: ${adventure.current_scene || 'Inicio de la aventura'}

🔄 ESTADO DEL JUEGO:
- Ronda: ${currentRound || 1}/${maxRounds}
- ${gameState.in_zone ? `🗺️ En zona: ${gameState.current_zone?.name || 'Zona desconocida'}` : '📍 En escenario principal'}
- ☣️ Corrupción: ${corruption}/10 - ${corruptionLevel}
- ${gameState.is_combat ? '⚔️ EN COMBATE' : '🕊️ Exploración'}

🗺️ Zonas exploradas: ${(gameState.explored_zones || []).join(', ') || 'Ninguna'}
📋 Eventos resueltos: ${(gameState.events_resolved || []).length}
📝 Decisiones clave: ${(gameState.key_decisions || []).join(', ') || 'Ninguna aún'}

${gameState.active_states && gameState.active_states.length > 0 ? 
  `⚡ Estados activos: ${gameState.active_states.map((s: {name: string, effect: string}) => `${s.name} (${s.effect})`).join(', ')}` : ''}`;

      if (gameState.is_combat && gameState.combat_state) {
        const enemies = gameState.combat_state.enemies || [];
        const extraHealth = corruption >= 5 ? 1 : 0;
        const extraDamage = corruption >= 7 ? 1 : 0;
        const extraArmor = corruption >= 10 ? 1 : 0;
        
        contextMessage += `

⚔️ COMBATE ACTIVO (Ronda ${gameState.combat_state.round || 1}):
${corruption >= 5 ? `⚠️ Corrupción activa: Enemigos tienen +${extraHealth} vida${extraDamage ? `, +${extraDamage} daño` : ''}${extraArmor ? `, +${extraArmor} armadura` : ''}` : ''}`;
        
        enemies.forEach((enemy: { name: string; health: number; max_health: number; damage: number; armor: number }) => {
          contextMessage += `
- ${enemy.name}: ❤️ ${enemy.health}/${enemy.max_health + extraHealth} | ⚔️ ${enemy.damage + extraDamage} | 🛡️ ${enemy.armor + extraArmor}`;
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
