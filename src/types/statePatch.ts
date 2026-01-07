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

      inventory: z
        .object({
          add: z.array(ZGameItemMinimal).optional(),
          remove: z.array(ZId).optional(),
        })
        .optional(),
    })
    .optional(),

  adventure_patch: z
    .object({
      current_zone_id: z.string().min(1).optional(),
      explored_zones_add: z.array(z.string().min(1)).optional(),
    })
    .optional(),
});

export type StatePatch = z.infer<typeof ZStatePatch>;
