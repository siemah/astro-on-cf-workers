import { relations, sql } from "drizzle-orm";
import {
  text,
  sqliteTable,
  uniqueIndex,
  type AnySQLiteColumn,
  unique,
  index,
  integer as int,
} from "drizzle-orm/sqlite-core";
import { nanoid } from "../lib/utils";

export const products = sqliteTable('products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text('title').notNull(),
  slug: text('slug'),
  status: text('status', {
    enum: ['draft', 'published', 'archived'],
  })
    .notNull()
    .default('published'),
  excerpt: text('excerpt'),
  content: text('content'),
  product_type: text('product_type', { enum: ['product_variation', 'product', 'attachment'] })
    .notNull()
    .default('product'),
  product_parent: text('product_parent').references((): AnySQLiteColumn => products.id, {
    onDelete: 'cascade',
  }),

  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
},
  (products) => [uniqueIndex('product_slug_idx').on(products.slug)]
);

export type Product = typeof products.$inferSelect;

export const productMeta = sqliteTable('product_meta', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  metaKey: text('meta_key').notNull(),
  metaValue: text('meta_value').notNull(),
  productId: text('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
},
  (prodMeta) => [
    index('product_meta_meta_key_idx').on(prodMeta.metaKey),
    unique().on(prodMeta.metaKey, prodMeta.productId),
  ]
);

// setup relation between account and accountMeta
export const productsRelations = relations(products, ({ many }) => ({
  productMeta: many(productMeta),
  // images
  attachements: many(products, { relationName: 'attachment' }),
  // product variation
  variations: many(products, { relationName: 'product_variation' }),
}));
export const productMetaRelations = relations(productMeta, ({ one }) => ({
  product: one(products, {
    fields: [productMeta.productId],
    references: [products.id],
  }),
}));

/*******************************
 ****** Shipping Schema *******
 ******************************/
// Shipping related tables
export const shippingZones = sqliteTable(
  'shipping_zones',
  {
    zoneId: text('zone_id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    zoneName: text('zone_name').notNull().unique(),
    zoneOrder: text('zone_order').notNull().default('0'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [index('shipping_zone_name_idx').on(table.zoneName)]
);

export const shippingZoneLocations = sqliteTable(
  'shipping_zone_locations',
  {
    locationId: text('location_id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    zoneId: text('zone_id')
      .notNull()
      .references(() => shippingZones.zoneId, { onDelete: 'cascade' }),
    locationType: text('location_type', {
      enum: ['country', 'state', 'postcode', 'continent'],
    })
      .notNull()
      .default('state'),
    locationCode: text('location_code').notNull(),
  },
  (table) => [
    index('shipping_zone_location_idx').on(table.zoneId, table.locationType),
    index('shipping_zone_zode_id_idx').on(table.zoneId, table.zoneId),
    uniqueIndex('shipping_zone_location_type_code_idx').on(table.locationType, table.locationCode),
  ]
);

export const shippingZoneMethods = sqliteTable(
  'shipping_zone_methods',
  {
    instanceId: int('instance_id').primaryKey({ autoIncrement: true }),
    zone_id: text('zone_id')
      .references(() => shippingZones.zoneId, { onDelete: 'cascade' })
      .notNull(),
    method_id: text('method_id', {
      enum: ['flat_rate', 'free_shipping', 'local_pickup'],
    })
      .notNull()
      .default('flat_rate'),
    is_enabled: int({ mode: 'boolean' }).notNull().default(true),
    methodOrder: int('method_order').notNull(),
  },
  (table) => [index('shipping_method_zone_id_idx').on(table.zone_id)]
);

export type ShippingZoneMethods = typeof shippingZoneMethods.$inferSelect;

export const zzOptions = sqliteTable(
  'zz_options',
  {
    id: int('option_id').primaryKey({ autoIncrement: true }),
    optionName: text('option_key').notNull().unique(),
    optionValue: text('option_value').notNull(),
  },
  (table) => [index('options_option_name_idx').on(table.optionName)]
);

export type OptionsSelect = typeof zzOptions.$inferSelect;

export const shippingZonesRelations = relations(shippingZones, ({ many }) => ({
  locations: many(shippingZoneLocations),
  methods: many(shippingZoneMethods),
}));

export const shippingZoneLocationsRelations = relations(shippingZoneLocations, ({ one }) => ({
  zone: one(shippingZones, {
    fields: [shippingZoneLocations.zoneId],
    references: [shippingZones.zoneId],
  }),
}));

export const shippingZoneMethodsRelations = relations(shippingZoneMethods, ({ one }) => ({
  zone: one(shippingZones, {
    fields: [shippingZoneMethods.zone_id],
    references: [shippingZones.zoneId],
  }),
}));