import type { ApiRequest, DedupSettings, RequestGroup } from "./types";

const SEP = "\u0000";

/** Strips the query string from a URL. Falls back to manual `?` split when the
 *  URL is not parseable (e.g. blob: or data: URLs that the WHATWG parser may
 *  reject when given without an absolute base). */
function stripQuery(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    const i = url.indexOf("?");
    return i === -1 ? url : url.slice(0, i);
  }
}

/** Build a dedup key for a given request and settings. */
export function buildDedupKey(
  req: ApiRequest,
  settings: DedupSettings,
): string {
  const url = settings.includeQuery ? req.url : stripQuery(req.url);
  const body = settings.includeBody
    ? (req.raw.request.postData?.text ?? "")
    : "";
  return `${req.method}${SEP}${url}${SEP}${body}`;
}

/** Rebuild the full group map from the raw log. Used both for incremental
 *  updates (single-element array) and for full recomputation when dedup
 *  settings change. */
export function buildGroups(
  entries: ApiRequest[],
  settings: DedupSettings,
): Map<string, RequestGroup> {
  const groups = new Map<string, RequestGroup>();
  for (const req of entries) {
    const key = buildDedupKey(req, settings);
    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
      existing.last = req;
      existing.url = req.url;
      existing.lastAt = req.receivedAt;
    } else {
      groups.set(key, {
        key,
        method: req.method,
        url: req.url,
        count: 1,
        last: req,
        firstAt: req.receivedAt,
        lastAt: req.receivedAt,
      });
    }
  }
  return groups;
}
