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
      result.title = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    } catch (e) {
      result.title = placeMatch[1];
    }
  }
  return result;
}

const handler = eventHandler(async (event) => {
  const body = await readBody(event);
  const url = body && body.url ? String(body.url) : "";
  if (!url) {
    return { success: false, error: "Missing url in request body" };
  }
  try {
    // Follow redirects server-side to obtain final URL (res.url)
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      // Use some browser-like headers to reduce bot blocking from Google
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "Mozilla/5.0 (compatible; GoogleMapsResolver/1.0)",
      },
    });
    const finalUrl = res && (res as Response).url ? (res as Response).url : url;
    const parsed = parseGoogleMapsUrlString(finalUrl);
    return { success: true, finalUrl, parsed };
  } catch (err: any) {
    return {
      success: false,
      error: err && err.message ? err.message : String(err),
    };
  }
});

export default handler;
