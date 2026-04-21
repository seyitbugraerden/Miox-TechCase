import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DocumentAnalysis } from '@/types'

export function AnalysisResult({ analysis }: { analysis: DocumentAnalysis }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{analysis.fileName}</p>
          <p className="text-xs text-muted-foreground">
            {analysis.documentType} checked at{' '}
            {new Date(analysis.analyzedAt).toLocaleString('en-GB')}
          </p>
        </div>
        <Badge
          className={cn(
            'rounded-full shadow-none',
            analysis.status === 'approved'
              ? 'bg-emerald-500/10 text-emerald-700'
              : 'bg-amber-500/10 text-amber-700'
          )}
        >
          {analysis.status === 'approved' ? 'Approved' : 'Needs Review'}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{analysis.summary}</p>

      <div className="space-y-2">
        {analysis.checks.map((check) => (
          <div
            key={check.label}
            className="rounded-xl border border-border/70 bg-background/80 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{check.label}</p>
              <Badge variant="outline">
                {check.passed ? 'Passed' : 'Flagged'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{check.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
