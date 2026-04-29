import { useMemo, useState } from "react";
import { useNetworkRequests } from "./hooks/useNetworkRequests";
import { buildGroups } from "./lib/dedupKey";
import type { DedupSettings, RequestGroup } from "./lib/types";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { RequestList } from "./components/RequestList/RequestList";
import { RequestDetails } from "./components/RequestDetails/RequestDetails";
import styles from "./App.module.scss";

type SortMode = "recent" | "count";

export function App() {
  const [preserveLog, setPreserveLog] = useState(false);
  const [settings, setSettings] = useState<DedupSettings>({
    includeQuery: true,
    includeBody: false,
  });
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<SortMode>("recent");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { entries, clear } = useNetworkRequests(preserveLog);

  // Recompute groups whenever raw entries or dedup settings change. The hook
  // never mutates entries in place, so the array reference change is enough
  // for memoization to do the right thing.
  const groups = useMemo(
    () => buildGroups(entries, settings),
    [entries, settings],
  );

  const visibleGroups = useMemo(() => {
    let list: RequestGroup[] = Array.from(groups.values());
    const q = filter.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.url.toLowerCase().includes(q) ||
          g.method.toLowerCase().includes(q),
      );
    }
    if (sort === "count") {
      list.sort((a, b) => b.count - a.count || b.lastAt - a.lastAt);
    } else {
      list.sort((a, b) => b.lastAt - a.lastAt);
    }
    return list;
  }, [groups, filter, sort]);

  const selectedGroup =
    (selectedKey && groups.get(selectedKey)) || null;

  const handleClear = () => {
    clear();
    setSelectedKey(null);
  };

  return (
    <div className={styles.app}>
      <Toolbar
        preserveLog={preserveLog}
        onPreserveLogChange={setPreserveLog}
        settings={settings}
        onSettingsChange={setSettings}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        onClear={handleClear}
        totalRaw={entries.length}
        totalUnique={groups.size}
      />
      <div className={styles.body}>
        <RequestList
          groups={visibleGroups}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
        />
        <RequestDetails group={selectedGroup} />
      </div>
    </div>
  );
}
