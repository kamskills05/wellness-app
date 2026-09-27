import React from "react";

export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
        )}
        <h1 className="font-heading text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-xl text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}