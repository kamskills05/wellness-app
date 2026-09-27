import React from "react";
import { useLang } from "@/lib/i18n";

const STYLES = {
  active: "bg-primary/10 text-primary",
  paused: "bg-accent text-accent-foreground",
  completed: "bg-secondary text-muted-foreground",
  archived: "bg-secondary text-muted-foreground",
};

export default function StatusBadge({ status }) {
  const { t } = useLang();
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STYLES[status]}`}>
      {t(`status_${status}`)}
    </span>
  );
}