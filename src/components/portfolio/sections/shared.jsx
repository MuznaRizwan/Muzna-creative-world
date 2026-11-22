/**
 * Small building blocks shared by the section views.
 */

/**
 * Marks where finished portfolio content will go. Placeholders say what
 * belongs there instead of inventing it.
 * @param {{ children: import("react").ReactNode }} props
 */
export function Placeholder({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-raised/40 px-4 py-3 text-sm leading-relaxed text-muted">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-lamp/80">Content coming soon</p>
      {children}
    </div>
  );
}

/** @param {{ children: import("react").ReactNode }} props */
export function Lead({ children }) {
  return <p className="text-[15px] leading-relaxed text-fg/90">{children}</p>;
}

/**
 * @param {{ title: string, children: import("react").ReactNode }} props
 */
export function Block({ title, children }) {
  return (
    <section className="space-y-2.5">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{title}</h3>
      {children}
    </section>
  );
}

/**
 * A two-column list of facts.
 * @param {{ items: [string, string][] }} props
 */
export function Facts({ items }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
      {items.map(([term, value]) => (
        <div key={term} className="contents">
          <dt className="text-muted">{term}</dt>
          <dd className="text-fg">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
