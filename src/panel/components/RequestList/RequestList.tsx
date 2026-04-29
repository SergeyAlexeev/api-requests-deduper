import type { RequestGroup } from "../../lib/types";
import { RequestRow } from "../RequestRow/RequestRow";
import styles from "./RequestList.module.scss";

interface RequestListProps {
  groups: RequestGroup[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

export function RequestList({
  groups,
  selectedKey,
  onSelect,
}: RequestListProps) {
  if (groups.length === 0) {
    return (
      <div className={styles.list}>
        <div className={styles.empty}>
          <p>Recording API requests...</p>
          <p className={styles.hint}>
            Trigger XHR or fetch calls in the inspected page. Identical
            requests will be grouped under a single row with a counter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      <div className={styles.header}>
        <div className={styles.colCount}>×</div>
        <div className={styles.colMethod}>Method</div>
        <div className={styles.colUrl}>URL</div>
        <div className={styles.colStatus}>Status</div>
      </div>
      <div className={styles.rows}>
        {groups.map((g) => (
          <RequestRow
            key={g.key}
            group={g}
            selected={g.key === selectedKey}
            onClick={() => onSelect(g.key)}
          />
        ))}
      </div>
    </div>
  );
}
