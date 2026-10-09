/** Request body of POST /api/admin/blog/ai/generate/. */
import { z } from "zod";
import { TARGETS } from "./fields.mjs";

const text = (max) => z.string().max(max).optional();

export const generateSchema = z.object({
  target: z.enum(TARGETS),
  fields: z
    .object({
      title: text(400),
      excerpt: text(600),
      slug: text(160),
      tags: z.array(z.string().max(80)).max(20).optional(),
      metaTitle: text(300),
      metaDescription: text(600),
      coverAlt: text(600),
      coverCaption: text(1000),
      contentJson: z.looseObject({ type: z.literal("doc") }).optional(),
    })
    .default({}),
  selection: text(20000),
  nearbyText: text(5000),
  image: z.object({ caption: text(1000), nearbyText: text(5000) }).optional(),
});
