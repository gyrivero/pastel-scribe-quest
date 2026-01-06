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

## 🗺️ MAPA DE ZONAS (OBLIGATORIO)

Cada escenario DEBE tener un mapa abstracto de zonas. Al inicio de cada aventura:

1. **Genera el mapa** con 5-8 zonas conectadas
2. **Define cada zona** con:
   - Nombre descriptivo
   - Tipo (entrada, habitación, trampa, tesoro, jefe, salida)
   - Conexiones con otras zonas
   - Estado inicial (sin explorar)

### Estados de zona:
- **Sin explorar**: El jugador no ha entrado
- **Explorada**: El jugador entró y examinó
- **Completada**: Se resolvió el evento de la zona
- **Bloqueada**: Requiere algo específico para acceder

📌 Este es un MAPA DE OPORTUNIDADES NARRATIVAS, no un mapa táctico.

### Al describir el mapa:
\`\`\`
🗺️ ZONAS DEL ESCENARIO:
1. [Nombre] - [Estado] - [Conexiones]
2. [Nombre] - [Estado] - [Conexiones]
...
\`\`\`

## 🔍 SISTEMA DE BÚSQUEDA DE OBJETOS

### Intención explícita
El jugador puede declarar qué busca:
- Un arma
- Un consumible
- Un objeto útil
- Algo narrativo específico

### Regla clave
⚠️ **BUSCAR NO GARANTIZA ENCONTRAR LO BUSCADO**

El resultado depende de:
1. Categoría del dado
2. Coherencia con la historia
3. Disposición real de la zona

### Ejemplo:
Jugador busca un arma → puede encontrar:
- Un arma (si hay y el dado lo permite)
- Un consumible diferente
- Un arma rota/defectuosa
- Un objeto narrativo
- Nada

### Generación de objetos por zona (PERSISTENCIA CRÍTICA)

Al entrar POR PRIMERA VEZ a una zona:
1. **Genera en secreto** la lista completa de objetos disponibles
2. **NO muestres** esta lista al jugador
3. **Guarda** esta lista de forma persistente
4. Los objetos solo se revelan cuando el jugador los encuentra

📌 La lista de objetos de una zona NUNCA cambia después de generarse.

## 👥 PERSONAJES JUGABLES (MULTIJUGADOR NARRATIVO)

Puede haber uno o más personajes jugables en una misma aventura.

### Cada personaje tiene:
- Su propia character sheet
- Su propio inventario
- Su propio nivel
- Su propia tensión
- Su propio turno

### Turnos
- Los personajes actúan de a uno por ronda
- Cada uno realiza una única acción en su turno
- Cuando todos actuaron, se resuelve el evento de fin de ronda

### Al inicio de cada ronda (multijugador):
\`\`\`
👥 ORDEN DE TURNOS:
1. [Nombre del personaje] - Turno actual
2. [Nombre del personaje] - Esperando
...
\`\`\`

## 📋 ACCIONES DEL JUGADOR

En su turno, el jugador realiza UNA acción:
- Explorar la habitación
- Buscar objeto específico (arma/consumible/útil/narrativo)
- Usar habilidad
- Usar consumible
- Atacar
- Prepararse (defensa o esquiva)
- Activar rasgo activo
- Pasar

⚠️ **REGLA CRÍTICA**: 
- Una acción = una intención
- Un turno = una tirada
- Sin número de dado → acción NO válida

## 🎬 INICIO DE AVENTURA (OBLIGATORIO)

Cada aventura DEBE comenzar con:

1. **Introducción corta** que indique:
   - Dónde está el/los personaje/s
   - Cómo llegaron allí
   - Qué se percibe inicialmente

2. **Mapa inicial** con zonas generadas

3. **Estado inicial** de todos los personajes

📌 La introducción NO resuelve nada, solo establece contexto.

### Ejemplo de inicio:
\`\`\`
📖 INTRODUCCIÓN

[Descripción atmosférica de 2-3 párrafos]

🗺️ ZONAS DEL ESCENARIO:
1. Entrada Principal - Sin explorar - Conecta con: Vestíbulo
2. Vestíbulo Oscuro - Sin explorar - Conecta con: Entrada, Sala Este, Sala Oeste
3. Sala Este - Sin explorar - Conecta con: Vestíbulo
4. Sala Oeste - Bloqueada (requiere llave) - Conecta con: Vestíbulo
5. Cámara del Guardián - Sin explorar - Conecta con: Sala Este
6. Salida Secreta - Sin explorar - Conecta con: Cámara del Guardián

📍 Ubicación actual: Entrada Principal
🎯 Opciones iniciales: Explorar la entrada, Examinar los alrededores, Avanzar al vestíbulo
\`\`\`

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
   - 😰 Tensión: X/10 (por cada personaje)
   - ☣️ Corrupción: X/10
   
2. **🗺️ MAPA DE ZONAS** (resumen)
   - Zonas: X exploradas / Y total
   - Zona actual: [nombre]
   
3. **🎲 RESOLUCIÓN DE TIRADA** (si hay tirada)
   - D20: X + Atributo: Y = Total: Z
   - Resultado: [Muy mala/Mala/Neutra/Buena/Excelente]

4. **📖 NARRACIÓN INMERSIVA**

5. **📋 CAMBIOS DE ESTADO** (tras cada turno):
   - ❤️ Vida actual/máxima
   - 😰 Nueva Tensión (si cambió)
   - ☣️ Nueva Corrupción (si cambió)
   - 🎒 Cambios de inventario
   - ✨ Estados activos

6. **🎯 2-3 OPCIONES** para la siguiente acción

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

## ⚠️ PRINCIPIOS FUNDAMENTALES

1. Una acción = una intención
2. Un turno = una tirada
3. Un personaje = una hoja independiente
4. Los recursos son FINITOS
5. TODO se registra y persiste
6. El DM-IA debe poner límites activamente
7. El dado + atributo manda
8. Todo fallo deja marca
9. No hay retrocesos "gratis"

Responde SIEMPRE en español.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, character, characters, adventure } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let contextMessage = SYSTEM_PROMPT;
    
    // Función para generar contexto de un personaje
    const generateCharacterContext = (char: any, charTension?: number) => {
      const tension = charTension ?? char.tension ?? 0;
      const tensionLevel = tension >= 10 ? "Agotado (-1 daño, -1 armadura, NO puede curarse)" : 
                          tension >= 7 ? "Ansioso (-1 daño, -1 armadura)" :
                          tension >= 5 ? "Estresado (-1 daño)" : "Tranquilo";
      
      const tensionDamageMod = tension >= 5 ? -1 : 0;
      const tensionArmorMod = tension >= 7 ? -1 : 0;
      const effectiveDamage = Math.max(0, (char.base_damage || 1) + tensionDamageMod);
      const effectiveArmor = Math.max(0, (char.armor || 0) + tensionArmorMod);
      
      return `
Nombre: ${char.name}
Raza: ${char.race}
Clase: ${char.class}
Nivel: ${char.level}

📊 ATRIBUTOS (1-5, modifican D20):
- Agilidad: ${char.agility || 2}
- Fuerza: ${char.strength || 3}
- Inteligencia: ${char.intelligence || 2}
- Voluntad: ${char.willpower || 3}

❤️ Vida: ${char.health}/${char.max_health}
⚔️ Daño base: ${char.base_damage || 1} ${tensionDamageMod < 0 ? `(${tensionDamageMod} por tensión = ${effectiveDamage})` : ''}
🛡️ Armadura: ${char.armor || 0} ${tensionArmorMod < 0 ? `(${tensionArmorMod} por tensión = ${effectiveArmor})` : ''}

😰 Tensión: ${tension}/10 - ${tensionLevel}
${tension >= 10 ? '⚠️ NO PUEDE CURARSE CON CONSUMIBLES' : ''}

${char.active_trait ? `✨ Rasgo activo: ${char.active_trait}` : ''}
${char.passive_trait ? `🔮 Rasgo pasivo: ${char.passive_trait}` : ''}

🎒 Inventario: ${JSON.stringify(char.inventory || [])}
💰 Oro: ${char.gold}
📜 Trasfondo: ${char.background || 'Desconocido'}

${char.skills && char.skills.length > 0 ? `🎯 Habilidades: ${char.skills.map((s: {name: string}) => s.name).join(', ')}` : ''}`;
    };
    
    // Soporte multijugador
    if (characters && Array.isArray(characters) && characters.length > 0) {
      contextMessage += `\n\n--- 👥 PERSONAJES JUGABLES (${characters.length}) ---`;
      
      const gameState = adventure?.game_state || {};
      const characterTensions = gameState.character_tensions || {};
      
      characters.forEach((char: any, index: number) => {
        const charTension = characterTensions[char.id] ?? char.tension ?? 0;
        contextMessage += `\n\n🧙 PERSONAJE ${index + 1}:`;
        contextMessage += generateCharacterContext(char, charTension);
      });
      
      // Indicar turno actual
      if (gameState.current_turn_character_id) {
        const currentChar = characters.find((c: any) => c.id === gameState.current_turn_character_id);
        if (currentChar) {
          contextMessage += `\n\n👉 TURNO ACTUAL: ${currentChar.name}`;
        }
      }
    } else if (character) {
      const gameState = adventure?.game_state || {};
      const charTension = gameState.tension ?? character.tension ?? 0;
      
      contextMessage += `\n\n--- 🧙 PERSONAJE ACTUAL ---`;
      contextMessage += generateCharacterContext(character, charTension);
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

🗺️ MAPA DE ZONAS:`;

      // Incluir información de zonas
      const zones = gameState.zones || [];
      if (zones.length > 0) {
        zones.forEach((zone: any, index: number) => {
          const status = zone.status || (zone.cleared ? 'cleared' : zone.explored ? 'explored' : 'unexplored');
          const statusLabel = status === 'cleared' ? 'Completada' : 
                             status === 'explored' ? 'Explorada' : 
                             status === 'blocked' ? 'Bloqueada' : 'Sin explorar';
          const isCurrent = gameState.current_zone?.id === zone.id;
          contextMessage += `
${index + 1}. ${zone.name} - ${statusLabel}${isCurrent ? ' (ACTUAL)' : ''} - Conecta con: ${zone.connected_zones?.length || 0} zonas`;
        });
      } else {
        contextMessage += `
⚠️ No hay zonas generadas aún. DEBES generar el mapa de zonas en tu primera respuesta.`;
      }

      contextMessage += `

📋 Zonas exploradas: ${(gameState.explored_zones || []).length}/${zones.length}
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
      hasCharacters: !!(characters && characters.length > 0),
      characterCount: characters?.length || (character ? 1 : 0),
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