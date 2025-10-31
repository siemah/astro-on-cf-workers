import { defineCollection, z } from "astro:content";
import { getDataFromStoreWorker } from "@/services";
import { productSchema } from "./lib/utils";

const products = defineCollection({
  schema: productSchema,
  async loader() {
    const products =
      await getDataFromStoreWorker("products");
    console.log(products.length, "products loaded");
    return products;
  },
});

const shippingOptionSchema = z
  .object({
    zone_id: z.string(),
    instance_id: z.number(),
    method: z.enum(
      ["free_shipping", "flat_rate", "local_pickup"],
      {
        errorMap: () => ({
          message: "يرجى اختيار طريقة شحن صالحة",
        }),
      },
    ),
    state: z
      .string({
        errorMap: () => ({
          message: "يرجى اختيار ولاية صالحة",
        }),
      })
      .regex(
        /^DZ-[0-9]{1,}$/,
        "Please select a valid state",
      ),
    price: z.coerce
      .number({
        errorMap: () => ({
          message: "يرجى إدخال سعر صالح",
        }),
      })
      .min(0),
    pickupLocation: z.string().optional(),
    stopdesk: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "local_pickup") {
      if (!data.pickupLocation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Pickup location is required when method is pickup",
          path: ["pickupLocation"],
        });
      }
      // if (!data.stopdesk) {
      //   ctx.addIssue({
      //     code: z.ZodIssueCode.custom,
      //     message:
      //       "Stopdesk is required when method is pickup",
      //     path: ["stopdesk"],
      //   });
      // }
    }
  });
export const shippingSchema = z.object({
  id: z.string({
    errorMap: () => ({
      message: "معرف مجموعة الشحن مطلوب",
    }),
  }),
  data: z.array(shippingOptionSchema, {
    errorMap: () => ({
      message: "بيانات الشحن غير صالحة وليست قائمة",
    }),
  }),
});

const shippings = defineCollection({
  schema: shippingSchema,
  async loader() {
    const results =
      await getDataFromStoreWorker("shipping");
    console.log(JSON.stringify(results, null, 4));
    return results;
  },
});

const settingObjectSchema = z.object({
  id: z.string(),
  data: z.union([z.string(), z.array(z.string())], {
    errorMap: () => ({
      message: "بيانات الإعدادات غير صالحة وليست قائمة",
    }),
  }),
});

const storeDetails = defineCollection({
  schema: settingObjectSchema,
  async loader() {
    const results =
      await getDataFromStoreWorker("store-details");
    console.log(
      `${Object.keys(results).length} store details loaded`,
    );
    let response: Record<
      string,
      z.infer<typeof settingObjectSchema>
    > = {};
    Object.keys(results).forEach((key) => {
      response[key] = { id: key, data: results[key] };
    });

    return response;
  },
});

// 3. Export a single `collections` object to register your collection(s)
export const collections = {
  products,
  shippings,
  storeDetails,
};
