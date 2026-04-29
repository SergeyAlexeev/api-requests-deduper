// `chrome.devtools.network.Request` extends the HAR `Entry` shape with a few
// Chrome-specific fields (the most useful here is `_resourceType`) plus the
// asynchronous `getContent(callback)` method that we use to lazily fetch the
// response body in the details pane.
export type NetworkEntry = chrome.devtools.network.Request;

/** A single normalized API call captured from DevTools. */
export interface ApiRequest {
  /** Stable id assigned at capture time, used as React key. */
  id: number;
  /** HTTP method (uppercased for consistent display/dedup). */
  method: string;
  /** Full request URL, exactly as Chrome reported it. */
  url: string;
  /** Response status code (0 if the request failed before getting a status). */
  status: number;
  /** Total wall-clock time of the request in milliseconds. */
  durationMs: number;
  /** Capture timestamp (ms since epoch) of when this entry was processed. */
  receivedAt: number;
  /** Underlying HAR entry; we keep it around so the details pane can render
   *  headers, query params, request body and lazily fetch the response body. */
  raw: NetworkEntry;
}

/** Toggles that control how requests are grouped in the list. */
export interface DedupSettings {
  /** If true the full URL (including query string) is part of the key.
   *  When false, two requests that only differ by query params are merged. */
  includeQuery: boolean;
  /** If true, the request body is appended to the dedup key. */
  includeBody: boolean;
}

/** A bucket of requests that share the same dedup key. */
export interface RequestGroup {
  key: string;
  method: string;
  /** URL of the most recently received request in this group (for display). */
  url: string;
  count: number;
  /** Most recent ApiRequest in this group; the details pane reads from it. */
  last: ApiRequest;
  firstAt: number;
  lastAt: number;
}
