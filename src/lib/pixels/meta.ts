import { extractMetaPixelDetails, httpRequest } from "../http";
import type {
  AdvancedMatchingOptionsType,
  MetaConfigType,
  MetaServerEventDataType,
  ProductType,
} from "./types";

declare global {
  interface Window {
    fbq?: (
      type: string,
      event: string,
      options?: any,
      mainConfig?: any,
    ) => void;
  }
}

/**
 * Hash data to be sent to meta
 *
 * @param value the string to hash
 * @returns hashed instance of value using sha256
 */
async function hash(value: string) {
  let hashedValue = "";

  try {
    if (typeof window !== "undefined") {
      const textAsBuffer = new TextEncoder().encode(value);
      const hashBuffer = await window.crypto.subtle.digest(
        "SHA-256",
        textAsBuffer,
      );
      const hashArray = Array.from(
        new Uint8Array(hashBuffer),
      );
      hashedValue = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch (error) {
    hashedValue = "";
  }

  return hashedValue;
}

/**
 * Send Meta event data to the server
 *
 * @param url server endpoint
 * @param body data to send to the server
 */
export async function sendMetaEventsToServerByStore(
  storeKey: string,
  body: MetaServerEventDataType,
) {
  const metaServiceEndpoint =
    import.meta.env.NODE_ENV === "production"
      ? "https://meta.zzenz.com/events"
      : "https://meta.zzenz.com/events";
  // add meta browser id and click id
  const { fbc, fbp } = extractMetaPixelDetails();
  body = {
    ...body,
    userData: {
      ...body.userData,
      fbc,
      fbp,
    },
  };
  await httpRequest({
    url: `${metaServiceEndpoint}/${storeKey}`,
    requestConfig: {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    },
  });
}

async function constructUserData(object: MetaServerEventDataType["userData"]|undefined) {
  const result: Partial<MetaServerEventDataType["userData"]> = {};
  
  if (object?.fn) result.fn = await hash(object.fn);
  if (object?.ln) result.ln = await hash(object.ln);
  if (object?.ph) result.ph = await hash(object.ph);
  if (object?.ct) result.ct = await hash(object.ct);
  if (object?.st) result.st = await hash(object.st);
  
  return result;
}

/**
 * Fire a standard event "AddToCart" using facebook pixek sdk
 * @param product details of the product
 * @see https://developers.facebook.com/docs/meta-pixel/reference#standard-events
 */
export async function addToCart(
  product: Pick<
    ProductType,
    "id" | "regular_price" | "name" | "sku"
  >,
  quantity = 1,
  metaConfig: MetaConfigType,
  userData?: MetaServerEventDataType["userData"],
) {
  if (typeof window !== "undefined") {
    userData = await constructUserData(userData);
    try {
      const eventName = "AddToCart";
      const eventID = `event.id.atc-${product.id}-${Date.now()}`;
      !!metaConfig?.storeKey && await sendMetaEventsToServerByStore(
        metaConfig.storeKey,
        {
          pixelId: metaConfig.pixelId,
          eventData: {
            event_name: eventName,
            event_id: eventID,
            event_source_url: metaConfig.sourceUrl,
            action_source: "website",
          },
          customData: {
            value: Number(product.regular_price),
            currency: "DZD",
            contents: [
              {
                id: `${product.id}`,
                quantity: quantity,
              },
            ],
            content_type: "product",
            content_name: product.name,
            ...userData,
          },
          userData: {
            client_user_agent: navigator.userAgent,
          }
        },
      );
      window?.fbq &&
        window.fbq(
          "track",
          eventName,
          {
            content_name: product.name,
            content_ids: [`${product.id}`],
            content_type: "product",
            value: product.regular_price,
            currency: "DZD",
            contents: [
              {
                id: `${product.id}`,
                quantity: quantity,
              },
            ],
            source: "zzenz",
            version: "1.0.0",
            client_user_agent: navigator.userAgent,
          },
          { eventID },
        );
    } catch (error) { }
  }
}

export async function initiateCheckout(
  data: MetaServerEventDataType["customData"],
  metaConfig: MetaConfigType,
) {
  if (typeof window !== "undefined") {
    try {
      const eventName = "InitiateCheckout";
      !!metaConfig?.storeKey && await sendMetaEventsToServerByStore(
        metaConfig.storeKey,
        {
          pixelId: metaConfig.pixelId,
          eventData: {
            event_name: eventName,
            event_id: `${metaConfig.eventID}`,
            event_source_url: metaConfig.sourceUrl,
            action_source: "website",
          },
          customData: {
            value: Number(data?.value),
            currency: "DZD",
            num_items: data?.num_items || 1,
            content_ids: data?.content_ids || [],
            contents: data?.contents || [],
            content_type: "product",
          },
        },
      );
      // window?.fbq && window.fbq('track', eventName, {
      //   "value": data.value,
      //   "currency": data.currency || "DZD",
      //   "num_items": data?.num_items || 1,
      //   "content_ids": JSON.stringify(data?.content_ids || []),
      //   "content_type": "product",
      //   "timestamp": `${Date.now()}`
      // });
    } catch (error) { }
  }
}

/**
 * Fire a standard event "Purchase" using facebook pixek sdk
 * @param product details of the product
 * @see https://developers.facebook.com/docs/meta-pixel/reference#standard-events
 */
export async function purchase(
  price: number,
  content_ids: string[],
  contents: Record<string, string>[],
  currency = "DZD",
  content_type = "product",
  metaConfig?: MetaConfigType,
  userData?: MetaServerEventDataType["userData"],
) {
  if (typeof window !== "undefined") {
    try {
      const eventName = "Purchase";
      const eventId = `${metaConfig?.eventID}`;
    userData = await constructUserData(userData);
      
      !!metaConfig?.storeKey && await sendMetaEventsToServerByStore(
        `${metaConfig?.storeKey}`,
        {
          pixelId: `${metaConfig?.pixelId}`,
          eventData: {
            event_name: eventName,
            event_id: eventId,
            event_source_url: `${metaConfig?.sourceUrl}`,
            action_source: "website",
          },
          customData: {
            currency,
            value: price,
            content_ids: content_ids,
            contents: contents as any,
            content_type: "product",
          },
          userData: {
            em: !!userData?.em
              ? await hash(userData?.em)
              : null,
            fn: !!userData?.fn
              ? await hash(userData?.fn)
              : null,
            ln: !!userData?.ln
              ? await hash(userData?.ln)
              : null,
            ph: !!userData?.ph
              ? await hash(userData?.ph)
              : null,
            st: !!userData?.st
              ? await hash(userData?.st)
              : null,
            country: await hash("dz"),
            client_user_agent: navigator.userAgent,
          },
        },
      );
      !!window?.fbq &&
        window.fbq(
          "track",
          eventName,
          {
            currency: currency,
            value: price,
            content_name: "Checkout",
            content_ids: content_ids,
            contents: contents,
            content_type: content_type,
            source: "zzenz",
            version: "1.0.0",
            timestamp: `${Date.now()}`,
            ...userData
          },
          { eventID: eventId },
        );
    } catch (error) { }
  }
}

/**
 * Send manual advanced matching event to optimize ad campaign
 * @param product details of the product
 * @see https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching
 */
export function manualAdvancedMatching(
  facebookPixelId: string,
  customerDetails: AdvancedMatchingOptionsType,
) {
  if (window?.fbq) {
    try {
      window.fbq("init", facebookPixelId, customerDetails);
    } catch (error) { }
  }
}

/**
 * Send a custom event to meta pixel
 * @param eventName custom event name
 * @param attributes details(meta event attributes)
 * @see https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking#custom-events
 */
export function customEvent(
  eventName: string,
  attributes?: any | undefined,
) {
  if (window.fbq) {
    try {
      window.fbq("trackCustom", eventName, attributes);
    } catch (error) {
      // avoid error if the function doest exists(not loaded yet)
    }
  }
}


// Helper function to check if a string contains HTML/script tags
export const isScriptTag = (str: string): boolean => {
  return str.includes('<script') || str.includes('</script>');
};

// Helper function to extract pixel ID from script or return as-is if it's just an ID
export function extractPixelId(pixelData: string): string {
  if (isScriptTag(pixelData)) {
    // Try to extract Facebook pixel ID from script
    const fbMatch = pixelData.match(/fbq\(['"]init['"],\s*['"]([^'"]+)['"]/);
    if (fbMatch) return fbMatch[1];

    // Try to extract TikTok pixel ID from script
    const ttMatch = pixelData.match(/ttq\.load\(['"]([^'"]+)['"]/);
    if (ttMatch) return ttMatch[1];

    // Try to extract Google Analytics ID from script
    const gaMatch = pixelData.match(/gtag\(['"]config['"],\s*['"]([^'"]+)['"]/);
    if (gaMatch) return gaMatch[1];

    // If no ID found, return empty string
    return '';
  }
  return pixelData;
};