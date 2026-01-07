import { z } from "zod";

// Un "id" simple
const ZId = z.string().min(1);

// Esquema mínimo de un item de inventario (lo hacemos flexible para no bloquearte)
export const ZGameItemMinimal = z.object({
  id: ZId,
  name: z.string().min(1),
  type: z.string().min(1),
  effect_mechanical: z.string().default(""),
  effect_narrative: z.string().default(""),
  uses: z.string().min(1),

  // opcionales
  uses_remaining: z.number().int().nonnegative().optional(),
  equipped: z.boolean().optional(),
});

export const ZStatePatch = z.object({
  character_patch: z
    .object({
      hp: z
        .object({
          current: z.number().int().nonnegative().optional(),
          max: z.number().int().nonnegative().optional(),
        })
        .optional(),

      // Stats adicionales (para que el panel lateral se sincronice)
      gold: z.number().int().nonnegative().optional(),
      experience: z.number().int().nonnegative().optional(),
      level: z.number().int().positive().optional(),

      attributes: z
        .object({
          agility: z.number().int().min(1).max(5).optional(),
          strength: z.number().int().min(1).max(5).optional(),
          intelligence: z.number().int().min(1).max(5).optional(),
          willpower: z.number().int().min(1).max(5).optional(),
        })
        .optional(),

      inventory: z
        .object({
          // Preferido: snapshot completo del inventario (fuente de verdad)
          set: z.array(ZGameItemMinimal).optional(),
          // Incremental (por compatibilidad)
          add: z.array(ZGameItemMinimal).optional(),
          remove: z.array(ZId).optional(),
        })
        .optional(),
    })
    .optional(),

  adventure_patch: z
    .object({
      // Estado global/turno
      tension: z.number().int().min(0).max(10).optional(),
      corruption: z.number().int().min(0).max(10).optional(),

      // Mapa
      current_zone_id: z.string().min(1).optional(),
      explored_zones_add: z.array(z.string().min(1)).optional(),
    })
    .optional(),
});

export type StatePatch = z.infer<typeof ZStatePatch>;
