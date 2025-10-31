import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ProductMeta } from "./types";
import { z } from "astro/zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nanoid() {
  return crypto.randomUUID();
}

export function getProductMeta(productMeta: ProductMeta[]) {
  let product: Record<string, any> = {};
  productMeta?.forEach(
    ({ meta_key: metaKey, meta_value: metaValue }) => {
      let key = metaKey.substring(1);

      if (key === "_product_attributes") {
        key = "options";
      }

      product = {
        ...product,
        [key]: JSON.parse(metaValue),
      };
    },
  );

  return product;
}

/**
 * Check if the given value is a valid number
 * @param value The value to check
 * @returns True if the value is a valid number, false otherwise
 */
export function formatNumber(number: number | string) {
  return new Intl.NumberFormat("fr-FR").format(
    parseFloat(`${number}`),
  );
}

/**
 * Handle results of a Promise.allSettled
 *
 * @param results setteled results list of a given promises
 * @returns values list returned by promises
 */
export function handleAllSettledResults<
  T extends unknown[],
>(results: {
  [K in keyof T]: PromiseSettledResult<T[K]>;
}): T {
  const errors: PromiseRejectedResult[] = [];
  const resultValues: unknown[] = [];

  results.forEach((resultItem) => {
    if (resultItem.status === "rejected") {
      console.log(resultItem.reason);
      errors.push(resultItem);
    } else {
      resultValues.push(resultItem.value);
    }
  });

  if (errors.length) {
    // Aggregate all errors into one
    throw new AggregateError(errors);
  }

  return resultValues as T;
}

const mainProductSchema = z.object({
  id: z.string(),
  slug: z.string().nullable(),
  title: z.string(),
  regular_price: z.coerce.number(),
  sale_price: z.coerce.number().nullable().optional(),
});

export const productSchema = z.object({
  ...mainProductSchema.shape,
  attributes: z
    .array(
      z.object(
        {
          name: z.string(),
          values: z.array(z.string()),
        },
        {
          errorMap: () => ({
            message: "Please provide valid attribute",
          }),
        },
      ),
      {
        errorMap: () => ({
          message: "Attributes is an array",
        }),
      },
    )
    .optional(),
  status: z.enum(["draft", "published", "archived"]),
  excerpt: z.string().nullable(),
  content: z.string().nullable(),
  // product_type: z.enum(["product_variation", "product", "attachment"]),
  // product_parent: z.string().nullable(),
  images: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
    }),
  ),
  variations: z.array(mainProductSchema).optional(),
  height: z.coerce.number().nullable().optional(),
  weight: z.coerce.number().nullable().optional(),
  length: z.coerce.number().nullable().optional(),
  width: z.coerce.number().nullable().optional(),
});
