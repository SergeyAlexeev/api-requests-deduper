import type { DedupSettings } from "../../lib/types";
import styles from "./Toolbar.module.scss";

type SortMode = "recent" | "count";

interface ToolbarProps {
  preserveLog: boolean;
  onPreserveLogChange: (value: boolean) => void;
  settings: DedupSettings;
  onSettingsChange: (next: DedupSettings) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  sort: SortMode;
  onSortChange: (mode: SortMode) => void;
  onClear: () => void;
  totalRaw: number;
  totalUnique: number;
}

export function Toolbar({
  preserveLog,
  onPreserveLogChange,
  settings,
  onSettingsChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  onClear,
  totalRaw,
  totalUnique,
}: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        className={styles.clearButton}
        onClick={onClear}
        title="Clear all captured requests"
      >
        Clear
      </button>

      <span className={styles.separator} />

      <label className={styles.checkbox} title="Keep entries on page reload">
        <input
          type="checkbox"
          checked={preserveLog}
          onChange={(e) => onPreserveLogChange(e.target.checked)}
        />
        Preserve log
      </label>

      <span className={styles.separator} />

      <label
        className={styles.checkbox}
        title="When off, requests that differ only by query string are merged"
      >
        <input
          type="checkbox"
          checked={settings.includeQuery}
          onChange={(e) =>
            onSettingsChange({ ...settings, includeQuery: e.target.checked })
          }
        />
        Include query string
      </label>

      <label
        className={styles.checkbox}
        title="Include request body in dedup key (useful for POST polling)"
      >
        <input
          type="checkbox"
          checked={settings.includeBody}
          onChange={(e) =>
            onSettingsChange({ ...settings, includeBody: e.target.checked })
          }
        />
        Include body
      </label>

      <span className={styles.separator} />

      <label className={styles.sortLabel}>
        Sort:
        <select
          className={styles.sortSelect}
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortMode)}
        >
          <option value="recent">Recent</option>
          <option value="count">Count</option>
        </select>
      </label>

      <input
        className={styles.filter}
        type="search"
        placeholder="Filter URL or method"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
      />

      <div className={styles.stats}>
        {totalUnique} unique / {totalRaw} total
      </div>
    </div>
  );
}
