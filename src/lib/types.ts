import { shippingSchema } from "@/content.config";
import type { productSchema } from "@/lib/utils";
import type { z } from "astro/zod";

export interface ProductMeta {
  meta_key: string;
  meta_value: string;
}

export type StructuredProduct = z.infer<
  typeof productSchema
>;
type ProductAttribute = {
  name: string;
  values: string[];
};
export type FullProduct = StructuredProduct & {
  attributes?: ProductAttribute[];
};

// Export the inferred types
export type ShippingOption = z.infer<typeof shippingSchema>;
export type ShippingData = ShippingOption["data"];
export type Shipping = Record<
  string,
  ShippingOption["data"]
>;

export interface RequestConfigTypes {
  url: string;
  requestConfig?: RequestInit | undefined;
}

export interface ResponseConfigTypes {
  code: string;
  errors: Record<string, any>;
}
