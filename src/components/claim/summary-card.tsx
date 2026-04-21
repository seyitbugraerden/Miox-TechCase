export function SummaryCard({
  title,
  value,
  hint,
}: {
  title: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card/75 p-4 shadow-sm backdrop-blur">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 text-lg font-semibold leading-6">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}
