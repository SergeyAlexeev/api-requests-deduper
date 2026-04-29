import type { RequestGroup } from "../../lib/types";
import styles from "./RequestRow.module.scss";

interface RequestRowProps {
  group: RequestGroup;
  selected: boolean;
  onClick: () => void;
}

/** Returns just the path + query of a URL — what users actually want to see in
 *  the list. Falls back to the raw string for non-parseable URLs. */
function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

function statusClass(status: number): string {
  if (status === 0) return styles.statusUnknown;
  if (status >= 500) return styles.status5xx;
  if (status >= 400) return styles.status4xx;
  if (status >= 300) return styles.status3xx;
  return styles.status2xx;
}

function methodClass(method: string): string {
  switch (method) {
    case "GET":
      return styles.methodGet;
    case "POST":
      return styles.methodPost;
    case "PUT":
      return styles.methodPut;
    case "DELETE":
      return styles.methodDelete;
    case "PATCH":
      return styles.methodPatch;
    default:
      return styles.methodOther;
  }
}

export function RequestRow({ group, selected, onClick }: RequestRowProps) {
  const path = shortenUrl(group.url);
  const isHot = group.count > 1;

  return (
    <div
      className={[
        styles.row,
        selected ? styles.selected : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      title={`${group.method} ${group.url}`}
    >
      <div className={styles.count}>
        <span
          className={[styles.counter, isHot ? styles.counterHot : ""]
            .filter(Boolean)
            .join(" ")}
        >
          ×{group.count}
        </span>
      </div>
      <div className={[styles.method, methodClass(group.method)].join(" ")}>
        {group.method}
      </div>
      <div className={styles.url}>{path}</div>
      <div className={[styles.status, statusClass(group.last.status)].join(" ")}>
        {group.last.status || "—"}
      </div>
    </div>
  );
}
