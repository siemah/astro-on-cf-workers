export interface AdvancedMatchingOptionsType {
  em?: string;
  fn?: string;
  ln?: string;
  ph?: string;
  st?: string;
  country?: string;
}

export interface MetaConfigType {
  pixelId: string;
  storeKey?: string;
  sourceUrl: string;
  eventID?: string;
}

export interface MetaServerEventDataType {
  pixelId: MetaConfigType["pixelId"];
  eventData: {
    event_name: string;
    event_id: string;
    event_source_url?: MetaConfigType["sourceUrl"];
    action_source:
      | "website"
      | "app"
      | "email"
      | "phone_call"
      | "chat"
      | "physical_store"
      | "system_generated"
      | "other";
  };
  customData?: {
    value: number;
    currency: string;
    contents?: {
      id: string;
      quantity?: number;
      item_price?: number;
      delivery_category?:
        | "in_store"
        | "curbside"
        | "home_delivery";
    }[];
    content_ids?: string[];
    content_type?: "product" | "product_group";
    content_name?: string;
    num_items?: number;
  };
  userData?: {
    em?: string | null;
    ph?: string | null;
    fn?: string | null;
    ln?: string | null;
    ct?: string | null;
    st?: string | null;
    country?: string | null;
    fbc?: string | null;
    fbp?: string | null;
    client_user_agent?: string | null;
  };
}

export interface AttributesPropsTypes {
  id: number;
  name: string;
  options: string[];
  visible: boolean;
}
export type ImageType = {
  id?: number;
  src: string;
  width: number;
  height: number;
};
type ProductDateType = {
  date: string;
  timezone: string;
};
export interface ProductType {
  id: string;
  name: string;
  slug: string;
  wordpress_id?: number;
  status?: string;
  thumbnail?: ImageType;
  price?: number;
  regular_price?: number;
  category_ids?: number[];
  attributes?: AttributesPropsTypes[];
  description?: string;
  short_description?: string;
  sku?: string;
  images?: ImageType[];
  date_created: ProductDateType;
  date_modified: ProductDateType;
  stock_status?: string;
  stock_quantity?: number;
  total_sales?: number;
  manage_stock?: boolean;
  length?: number;
  height?: number;
  width?: number;
  weight?: number;
}
