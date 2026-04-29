import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiRequest, NetworkEntry } from "../lib/types";

/** Resource types that we treat as "API" requests. */
const API_RESOURCE_TYPES = new Set(["xhr", "fetch"]);

let nextId = 1;

function toApiRequest(entry: NetworkEntry): ApiRequest {
  return {
    id: nextId++,
    method: (entry.request.method || "GET").toUpperCase(),
    url: entry.request.url,
    status: entry.response?.status ?? 0,
    durationMs: entry.time ?? 0,
    receivedAt: Date.now(),
    raw: entry,
  };
}

interface UseNetworkRequestsResult {
  /** All raw API entries received in the current session, in capture order.
   *  The list is reset on navigation when `preserveLog` is false. */
  entries: ApiRequest[];
  /** Drops every captured entry. */
  clear: () => void;
}

/** Subscribes to chrome.devtools.network and returns the running list of
 *  XHR/fetch requests. The hook is the single source of "raw" data — the
 *  caller is responsible for applying dedup settings on top of `entries`. */
export function useNetworkRequests(
  preserveLog: boolean,
): UseNetworkRequestsResult {
  const [entries, setEntries] = useState<ApiRequest[]>([]);

  // Latest value of preserveLog that the navigation listener can read without
  // forcing the listener to re-subscribe on every toggle change.
  const preserveLogRef = useRef(preserveLog);
  useEffect(() => {
    preserveLogRef.current = preserveLog;
  }, [preserveLog]);

  useEffect(() => {
    // chrome.devtools is only defined when running inside the DevTools host
    // page; guard so that the panel still renders if opened standalone.
    if (typeof chrome === "undefined" || !chrome.devtools?.network) {
      return;
    }

    const onRequestFinished = (entry: NetworkEntry) => {
      const type = entry._resourceType;
      if (!type || !API_RESOURCE_TYPES.has(type)) return;
      setEntries((prev) => [...prev, toApiRequest(entry)]);
    };

    const onNavigated = () => {
      if (!preserveLogRef.current) {
        setEntries([]);
      }
    };

    chrome.devtools.network.onRequestFinished.addListener(onRequestFinished);
    chrome.devtools.network.onNavigated.addListener(onNavigated);

    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(
        onRequestFinished,
      );
      chrome.devtools.network.onNavigated.removeListener(onNavigated);
    };
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, clear };
}
