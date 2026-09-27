import React from "react";

const parseLabels = (str = "") =>
  Object.fromEntries(
    str.split(",").map((p) => p.split("=").map((x) => x.trim())).filter((p) => p.length === 2 && p[0])
  );

export default function LikertInput({ min = 1, max = 5, labels, value, onChange }) {
  const map = parseLabels(labels);
  const values = Array.from({ length: Math.max(max - min + 1, 0) }, (_, i) => min + i);
  return (
    <div>
      <div className="flex gap-2">
        {values.map((v) => (
          <button
            type="button"
            key={v}
            onClick={() => onChange(v)}
            className={`h-12 flex-1 rounded-2xl border text-sm font-semibold transition-all duration-300 ${
              value === v ? "scale-[1.04] border-primary bg-primary text-primary-foreground shadow-md" : "bg-background hover:border-primary/40"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2 text-[11px] leading-tight text-muted-foreground">
        {values.map((v) => <span key={v} className="flex-1 text-center">{map[v] || ""}</span>)}
      </div>
    </div>
  );
}