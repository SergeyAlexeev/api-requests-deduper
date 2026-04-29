import styles from "./Tabs.module.scss";

export interface TabDef<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: TabDef<T>[];
  active: T;
  onChange: (id: T) => void;
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: TabsProps<T>) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === active}
          className={[styles.tab, tab.id === active ? styles.active : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
