import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: string }) {
  const badgeClass = /completed/i.test(status)
    ? 'bg-emerald-500/10 text-emerald-700'
    : /progress/i.test(status)
      ? 'bg-amber-500/10 text-amber-700'
      : /urgent/i.test(status)
        ? 'bg-rose-500/10 text-rose-700'
        : /important/i.test(status)
          ? 'bg-blue-500/10 text-blue-700'
          : 'bg-slate-500/10 text-slate-700'

  return (
    <Badge className={cn('rounded-full shadow-none', badgeClass)}>{status}</Badge>
  )
}
