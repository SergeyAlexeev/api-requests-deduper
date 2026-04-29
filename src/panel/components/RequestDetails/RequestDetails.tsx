import { useEffect, useMemo, useState } from "react";
import type { ApiRequest, RequestGroup } from "../../lib/types";
import { Tabs, type TabDef } from "../Tabs/Tabs";
import styles from "./RequestDetails.module.scss";

type TabId = "headers" | "query" | "requestBody" | "response";

const TABS: TabDef<TabId>[] = [
  { id: "headers", label: "Headers" },
  { id: "query", label: "Query" },
  { id: "requestBody", label: "Request Body" },
  { id: "response", label: "Response" },
];

interface RequestDetailsProps {
  group: RequestGroup | null;
}

export function RequestDetails({ group }: RequestDetailsProps) {
  const [tab, setTab] = useState<TabId>("headers");

  if (!group) {
    return (
      <div className={styles.details}>
        <div className={styles.placeholder}>
          Select a request to inspect headers, query params, request body and
          response.
        </div>
      </div>
    );
  }

  const last = group.last;

  return (
    <div className={styles.details}>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div className={styles.body}>
        {tab === "headers" && <HeadersTab req={last} group={group} />}
        {tab === "query" && <QueryTab req={last} />}
        {tab === "requestBody" && <RequestBodyTab req={last} />}
        {tab === "response" && <ResponseTab req={last} />}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function KeyValueList({ items }: { items: { name: string; value: string }[] }) {
  if (items.length === 0) {
    return <div className={styles.empty}>(none)</div>;
  }
  return (
    <dl className={styles.kv}>
      {items.map((it, i) => (
        <div className={styles.kvRow} key={`${it.name}-${i}`}>
          <dt className={styles.kvKey}>{it.name}</dt>
          <dd className={styles.kvValue}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function HeadersTab({ req, group }: { req: ApiRequest; group: RequestGroup }) {
  const reqHeaders = req.raw.request.headers ?? [];
  const resHeaders = req.raw.response.headers ?? [];

  return (
    <>
      <Section title="General">
        <KeyValueList
          items={[
            { name: "Request URL", value: req.url },
            { name: "Method", value: req.method },
            {
              name: "Status",
              value: req.status ? String(req.status) : "(no response)",
            },
            { name: "Duration", value: `${Math.round(req.durationMs)} ms` },
            { name: "Times observed", value: String(group.count) },
          ]}
        />
      </Section>
      <Section title="Request Headers">
        <KeyValueList items={reqHeaders} />
      </Section>
      <Section title="Response Headers">
        <KeyValueList items={resHeaders} />
      </Section>
    </>
  );
}

function QueryTab({ req }: { req: ApiRequest }) {
  const qs = req.raw.request.queryString ?? [];
  return (
    <Section title="Query String Parameters">
      <KeyValueList items={qs} />
    </Section>
  );
}

function tryPrettyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

function isJsonMime(mime: string | undefined | null): boolean {
  if (!mime) return false;
  const m = mime.toLowerCase();
  return m.includes("application/json") || m.endsWith("+json");
}

function RequestBodyTab({ req }: { req: ApiRequest }) {
  const post = req.raw.request.postData;
  if (!post || (!post.text && !post.params?.length)) {
    return (
      <Section title="Request Body">
        <div className={styles.empty}>(no body)</div>
      </Section>
    );
  }

  const text = post.text ?? "";
  const display = isJsonMime(post.mimeType) ? tryPrettyJson(text) : text;

  return (
    <Section title="Request Body">
      {post.mimeType ? (
        <div className={styles.mime}>{post.mimeType}</div>
      ) : null}
      <pre className={styles.code}>{display}</pre>
    </Section>
  );
}

function ResponseTab({ req }: { req: ApiRequest }) {
  // Lazy-load the response body when this tab is opened. We key the request
  // we are loading for, so switching to a different selection cancels the
  // (in-flight) result by ignoring the late callback.
  const [body, setBody] = useState<{
    text: string;
    encoding: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // chrome.devtools.network.Request.getContent invokes its callback at most
  // once. We need a stable identity per request so that React effect cleanup
  // can ignore stale callbacks.
  const reqKey = req.id;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setBody(null);
    try {
      req.raw.getContent((content, encoding) => {
        if (cancelled) return;
        setBody({ text: content ?? "", encoding: encoding ?? null });
        setLoading(false);
      });
    } catch {
      if (!cancelled) setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [reqKey, req.raw]);

  const mime = req.raw.response?.content?.mimeType;
  const display = useMemo(() => {
    if (!body) return "";
    if (body.encoding === "base64") {
      return "(binary content — base64 omitted)";
    }
    return isJsonMime(mime) ? tryPrettyJson(body.text) : body.text;
  }, [body, mime]);

  return (
    <Section title="Response">
      {mime ? <div className={styles.mime}>{mime}</div> : null}
      {loading ? (
        <div className={styles.empty}>Loading response body…</div>
      ) : body && body.text.length > 0 ? (
        <pre className={styles.code}>{display}</pre>
      ) : (
        <div className={styles.empty}>(empty response)</div>
      )}
    </Section>
  );
}
