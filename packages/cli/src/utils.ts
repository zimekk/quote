import { z } from "zod";

export const parseQuote = (item) =>
  z
    .object({
      id: z.string(),
      symbol: z.string(),
      price_timestamp: z.string(),
    })
    .passthrough()
    .transform((item) => ({
      ...item,
      id: [item.symbol, item.price_timestamp].join("@"),
    }))
    .parse(item);
