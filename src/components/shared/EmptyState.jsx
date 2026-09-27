import React from "react";

export default function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-border px-6 py-14 text-center">
      <p className="font-heading text-lg italic text-muted-foreground">{text}</p>
    </div>
  );
}