import { eventHandler, readBody } from "h3";

function parseGoogleMapsUrlString(url: string) {
  const result: { lat?: string; lng?: string; title?: string } = {};
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    result.lat = atMatch[1];
    result.lng = atMatch[2];
  }
  const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (!result.lat && llMatch) {
    result.lat = llMatch[1];
    result.lng = llMatch[2];
  }
  const dMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (!result.lat && dMatch) {
    result.lat = dMatch[1];
    result.lng = dMatch[2];
  }
  const placeMatch = url.match(/\/place\/([^\/\?]+)/);
  if (placeMatch) {
    try {
      result.title = decodeURIComponent((placeMatch[1] ?? "").replace(/\+/g, " "));
    } catch (e) {
      result.title = placeMatch[1];
    }
  }
  return result;
}

/**
 * Extract high-precision coordinates (and a clean title) from Google Maps HTML.
 * Tries several patterns in order of reliability:
 *  1. <link rel="canonical"> – the canonical URL always has @lat,lng in it
 *  2. <meta property="og:url">  – same format
 *  3. Inline JS blob: null,null,LAT,LNG (≥6 decimal places found in APP_INITIALIZATION_STATE)
 *  4. "center":{"lat":LAT,"lng":LNG} JSON pattern
 *  5. og:title meta for a cleaner place name
 */
function extractFromHtml(html: string): { lat?: string; lng?: string; title?: string } {
  const result: { lat?: string; lng?: string; title?: string } = {};

  // 1. Canonical link tag
  const canonicalMatch =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if (canonicalMatch && canonicalMatch[1]) {
    const c = parseGoogleMapsUrlString(canonicalMatch[1]);
    if (c.lat) { result.lat = c.lat; result.lng = c.lng; result.title = c.title; }
  }

  // 2. og:url meta
  if (!result.lat) {
    const ogUrlMatch =
      html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i);
    if (ogUrlMatch && ogUrlMatch[1]) {
      const c = parseGoogleMapsUrlString(ogUrlMatch[1]);
      if (c.lat) { result.lat = c.lat; result.lng = c.lng; }
    }
  }

  // 3. APP_INITIALIZATION_STATE style: null,null,LAT,LNG (high precision ≥6 decimals)
  if (!result.lat) {
    const hiPrec = html.match(/null,null,(-?\d+\.\d{6,}),(-?\d+\.\d{6,})/);
    if (hiPrec) { result.lat = hiPrec[1]; result.lng = hiPrec[2]; }
  }

  // 4. "center":{"lat":LAT,"lng":LNG}
  if (!result.lat) {
    const centerMatch = html.match(/"center"\s*:\s*\{\s*"lat"\s*:\s*(-?\d+\.\d+)\s*,\s*"lng"\s*:\s*(-?\d+\.\d+)/);
    if (centerMatch) { result.lat = centerMatch[1]; result.lng = centerMatch[2]; }
  }

  // 5. og:title gives a nicer, human-readable place name
  const ogTitle =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  if (ogTitle) result.title = ogTitle[1];

  return result;
}

const handler = eventHandler(async (event) => {
  const body = await readBody(event);
  const url = body && body.url ? String(body.url) : "";
  if (!url) {
    return { success: false, error: "Missing url in request body" };
  }
  try {
    // Use a plain (non-browser) User-Agent so that short Google Maps URLs
    // (maps.app.goo.gl) return a clean 302 -> full Maps URL instead of
    // serving the Firebase Dynamic Links JavaScript interstitial page.
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "curl/8.7.1",
        Accept: "text/html,*/*",
      },
    });

    const finalUrl = (res as Response).url || url;
    const html = await (res as Response).text();

    const fromUrl = parseGoogleMapsUrlString(finalUrl);
    const fromHtml = extractFromHtml(html);

    // Prefer the result with more decimal places (higher precision).
    const countDecimals = (s?: string) => s ? (s.split(".")[1] ?? "").length : 0;
    const parsed: { lat?: string; lng?: string; title?: string } = {};

    if (countDecimals(fromHtml.lat) >= countDecimals(fromUrl.lat)) {
      if (fromHtml.lat) { parsed.lat = fromHtml.lat; parsed.lng = fromHtml.lng; }
      else if (fromUrl.lat) { parsed.lat = fromUrl.lat; parsed.lng = fromUrl.lng; }
    } else {
      if (fromUrl.lat) { parsed.lat = fromUrl.lat; parsed.lng = fromUrl.lng; }
    }
    // Prefer URL-decoded place name; only use og:title when it is more specific
    // than the generic "Google Maps" string the Maps page often returns.
    const htmlTitle = fromHtml.title && !/^google maps$/i.test(fromHtml.title.trim())
      ? fromHtml.title
      : undefined;
    parsed.title = htmlTitle || fromUrl.title;

    return { success: true, finalUrl, parsed };
  } catch (err: any) {
    return {
      success: false,
      error: err && err.message ? err.message : String(err),
    };
  }
});

export default handler;
