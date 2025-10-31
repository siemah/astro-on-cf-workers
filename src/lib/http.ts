import type {
  RequestConfigTypes,
  ResponseConfigTypes,
} from "./types";

/**
 * Send requests 2external services and handle response by
 * assigning a defailt error response in case the request fails
 * @param config request config such as url and fetch options @see https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
 * @param responseConfig response config such as default error
 * @returns response from third party(wordpress api)
 */
export async function httpRequest<Response = any>(
  config: RequestConfigTypes,
  responseConfig?: ResponseConfigTypes | undefined,
) {
  let response;

  try {
    const request = await fetch(
      config.url,
      config.requestConfig,
    );
    response = await request.json();
  } catch (error: any) {
    const customErrorResponse = {
      code: "failed",
      status: 400,
      errors: {
        global: error?.message,
      },
    };
    response = responseConfig ?? customErrorResponse;
  }

  return response as Response;
}

/**
 * Generate fbclid(fb click id)
 *
 * @returns generated fb click id or null
 */
function generateMetaFBCFromUrl() {
  const fbClckId = new URL(
    window.location.href,
  ).searchParams.get("fbclid");
  const fbc =
    fbClckId !== null
      ? `fb.1.${Date.now()}.${fbClckId}`
      : fbClckId;

  return fbc;
}

/**
 * Extract fbc(facebook click id) & fbp(facebook browser id)
 *
 * @returns object contains fbc & fbp
 */
export function extractMetaPixelDetails() {
  let fbc: string | null = null;
  let fbp: string | null = null;

  window.document.cookie.split("; ").forEach((cookie) => {
    const [name, value] = cookie.split("=");
    if ("_fbc" === name) {
      fbc = value;
    } else if (name === "_fbp") {
      fbp = value;
    }
  });

  if (fbc === null) {
    fbc = generateMetaFBCFromUrl();
  }

  return {
    fbc,
    fbp,
  };
}
