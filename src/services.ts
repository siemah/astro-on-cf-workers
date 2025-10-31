import Cloudflare from "cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { getProductMeta, handleAllSettledResults } from "./lib/utils";
import type { ProductMeta, StructuredProduct } from "./lib/types";
import type { QueryResultsSinglePage } from "cloudflare/resources/d1/database.mjs";

const cf = new Cloudflare({
  apiEmail: import.meta.env.CLOUDFLARE_ACCOUNT_EMAIL,
  apiKey: import.meta.env.CLOUDFLARE_API_KEY,
});

export async function getProducts() {
  const D1 = {};
  const db = drizzle(D1 as Env["DB"], { schema });
  try {
    const sqlQuery = db
      .query
      .products
      .findMany({
        columns: {
          id: true,
          title: true,
          slug: true,
          status: true,
          excerpt: true,
          content: true,
        },
        where: (table, { eq, and }) => and(
          eq(table.product_type, "product"),
          eq(table.status, "published")
        ),
        orderBy: (table, { desc }) => desc(table.createdAt),
      })
      .toSQL();
    const { result } = await cf.d1.database.query(import.meta.env.DB_ID, {
      account_id: `${import.meta.env.CLOUDFLARE_ACCOUNT_ID}`,
      sql: sqlQuery.sql,
      params: sqlQuery.params as string[],
    });
    const products = (result?.[0].results || []) as Omit<schema.Product, "createdAt" | "updatedAt">[];
    const productsList: StructuredProduct[] = [];

    // loop through products and fetch some meta data
    for (let product of products) {
      const metaQuery = db
        .query
        .productMeta
        .findMany({
          columns: {
            metaKey: true,
            metaValue: true,
          },
          where: (table, { eq, and, inArray }) => and(
            eq(table.productId, product.id),
            inArray(table.metaKey, ["_regular_price", "_sale_price", "__product_attributes"])
          ),
        })
        .toSQL();
      const { result: mResult } = await cf.d1.database.query(import.meta.env.DB_ID, {
        account_id: `${import.meta.env.CLOUDFLARE_ACCOUNT_ID}`,
        sql: metaQuery.sql,
        params: metaQuery.params as string[],
      });
      const pmRes = (mResult?.[0].results || []) as ProductMeta[];
      let productMetas = getProductMeta(pmRes);
      // then and attachmen as well
      const attachmentQuery = db
        .query
        .products
        .findMany({
          columns: {
            id: true,
            slug: true,
          },
          where: (table, { eq, and }) => and(
            eq(table.product_parent, product.id),
            eq(table.product_type, "attachment")
          ),
        })
        .toSQL();
      const { result: attachmentResult } = await cf.d1.database.query(import.meta.env.DB_ID, {
        account_id: `${import.meta.env.CLOUDFLARE_ACCOUNT_ID}`,
        sql: attachmentQuery.sql,
        params: attachmentQuery.params as string[],
      });
      const attachments = (attachmentResult?.[0].results || []) as Pick<schema.Product, "slug" | "id">[];
      const images = attachments.map((attachement) => {
        return {
          id: attachement.id,
          url: `https://cdn.zzenz.com${attachement.slug}`,
        };
      });
      productsList.push({
        ...product,
        regular_price: productMetas._regular_price || "0",
        images,
        ...productMetas,
      });
    }

    return productsList;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

interface ShippingOption {
  zone_id: string;
  instance_id: string;
  state: string;
  method: string;
  price: string;
  stopdesk?: string;
  pickupLocation?: string;
}

export async function getShipping() {
  let shippingOptions: Record<string, { id: string, data: ShippingOption[] }> = {};

  try {
    const D1 = {};
    const db = drizzle(D1 as Env["DB"], { schema });

    const methodsQuery = await db.query.shippingZoneMethods.findMany({
      columns: {
        instanceId: true,
        method_id: true,
        zone_id: true,
      },
      orderBy: (shipping, { desc }) => [desc(shipping.zone_id)],
      where(table, { eq }) {
        return eq(table.is_enabled, true);
      },
      with: {
        zone: {
          columns: {},
          with: {
            locations: {
              columns: {
                locationCode: true
              },
            },
          },
        },
      },
    }).toSQL();
    const { result: [{ results }] } = await cf.d1.database.query(import.meta.env.DB_ID, {
      account_id: `${import.meta.env.CLOUDFLARE_ACCOUNT_ID}`,
      sql: methodsQuery.sql,
      params: methodsQuery.params as string[],
    });
    const methods = results as (schema.ShippingZoneMethods & { zone: string })[];

    if (methods.length === 0) {
      console.warn("<[No shipping methods found]>");
      return {};
    }

    // get extra details such as method title, price, stopdesk name...
    const options: Promise<QueryResultsSinglePage>[] = [];
    methods.forEach((item) => {
      const optionQuery = db.query.zzOptions.findFirst({
        where: (table, { eq }) =>
          // @ts-ignore
          eq(table.optionName, `zz_${item.method_id}_${item.instance_id!}_settings`),
        columns: {
          optionName: true,
          optionValue: true,
        },
      }).toSQL();

      options.push(
        cf.d1.database.query(import.meta.env.DB_ID, {
          account_id: `${import.meta.env.CLOUDFLARE_ACCOUNT_ID}`,
          sql: optionQuery.sql,
          params: optionQuery.params as string[],
        })
      );
    });
    const optionsResults = await Promise.allSettled(options);
    const shippingDetails = handleAllSettledResults(optionsResults) as QueryResultsSinglePage[];
    methods.forEach((item, index) => {
      const zoneArray = JSON.parse(item.zone);
      const countryStateCode: string = zoneArray?.[0]?.[0]?.[0] ?? "";
      const stateCode = countryStateCode.split(':')[1] ?? '';
      const { result: [{ results: extraDetailsItem }] } = shippingDetails[index];
      let extraDetails = {
        price: '0',
        stopdesk: '',
        pickupLocation: '',
      };

      if (!shippingOptions?.[stateCode]) {
        shippingOptions[stateCode] = {
          id: stateCode,
          data: [],
        };
      }

      if (extraDetailsItem?.[0] !== undefined) {
        // @ts-expect-error drizzle issue
        const { cost: price = '0', ...rest } = JSON.parse(extraDetailsItem?.[0].option_value) ?? {};

        extraDetails = {
          price,
          pickupLocation: rest?.title ?? undefined,
          ...rest,
        };
      }

      shippingOptions[stateCode].data.push({
        zone_id: item.zone_id,
        // @ts-ignore
        instance_id: item.instance_id,
        method: item.method_id,
        state: stateCode,
        ...extraDetails,
      });
    });
    console.log(`[Shipping Options] ${Object.keys(shippingOptions).length} states with shipping options found`);
  } catch (error) {
    console.error('[Error fetching shipping details]:', error);
    shippingOptions = {};
  }

  return shippingOptions;
}

export async function getDataFromStoreWorker(path: `shipping` | `products` | `store-details`) {
  try {
    const credentials = btoa(`${import.meta.env.WORKER_API_USER}:${import.meta.env.WORKER_API_PASSWORD}`);
    console.log(".....................................");
    console.log(import.meta.env);
    console.log(".....................................");
    const response = await fetch(`${import.meta.env.WORKER_API_URL}/${path}`, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[Error fetching ${path} from worker]:`, error);
    return null;
  }
}