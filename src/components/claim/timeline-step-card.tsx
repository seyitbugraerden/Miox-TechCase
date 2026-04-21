import { useState } from 'react'

import {
  ChevronDown,
  FileUp,
  Sparkles,
} from 'lucide-react'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatMetadataValue, getStepRegistryEntry } from '@/lib/claim-utils'
import type { TimelineStep } from '@/types'
import { StatusBadge } from '@/components/claim/status-badge'

export function TimelineStepCard({
  step,
  isCurrentStage,
  isRecentlyAdded,
  onExplain,
  onRemove,
}: {
  step: TimelineStep
  isCurrentStage: boolean
  isRecentlyAdded?: boolean
  onExplain: () => void
  onRemove?: () => void
}) {
  const registry = getStepRegistryEntry(step)
  const Icon = registry.icon
  const hasActionRequired = Boolean(step.metadata.actionRequired)
  const [isExpanded, setIsExpanded] = useState(
    isCurrentStage || isRecentlyAdded || hasActionRequired
  )
  const visibleFieldCount = registry.fields.filter(
    (field) => step.metadata[field.key]
  ).length

  return (
    <Card
      id={`timeline-node-${step.id}`}
      className={cn(
        'gap-0 overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md',
        isCurrentStage && 'ring-1 ring-primary/30',
        isRecentlyAdded && 'ring-2 ring-sky-400/60 shadow-lg shadow-sky-500/10'
      )}
    >
      <div className={cn('bg-gradient-to-r p-5', registry.tone)}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-card/85 shadow-sm">
              <Icon className="size-5" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{registry.stage}</Badge>
                <StatusBadge status={step.status} />
                {step.source === 'user' ? (
                  <Badge className="bg-primary/10 text-primary shadow-none">
                    Dynamic node
                  </Badge>
                ) : null}
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isCurrentStage
                    ? 'This stage currently drives the customer-facing action area.'
                    : 'Rendered through the polymorphic timeline registry.'}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {visibleFieldCount} detail{visibleFieldCount === 1 ? '' : 's'} available
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="h-10"
              variant="ghost"
              onClick={() => setIsExpanded((current) => !current)}
            >
              {isExpanded ? 'Hide details' : 'View details'}
              <ChevronDown
                className={cn(
                  'size-4 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </Button>
            <Button className="h-10" variant="outline" onClick={onExplain}>
              <Sparkles />
              Explain with AI
            </Button>
            {onRemove ? (
              <Button className="h-10" variant="ghost" onClick={onRemove}>
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <CardContent
            className={cn(
              'space-y-4 p-5 transition-all duration-300 ease-out',
              isExpanded
                ? 'translate-y-0 opacity-100'
                : '-translate-y-1 opacity-0'
            )}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {registry.fields
                .filter((field) => step.metadata[field.key])
                .map((field) => (
                  <div
                    key={field.key}
                    className="rounded-2xl border border-border/70 bg-muted/25 p-3"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {field.label}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6">
                      {formatMetadataValue(step.metadata[field.key])}
                    </p>
                  </div>
                ))}
            </div>

            {step.title === 'Deduction Reason' ? (
              <>
                <Separator />
                <Alert className="border-amber-500/20 bg-amber-500/5">
                  <FileUp className="size-4" />
                  <AlertTitle>Customer action is blocking the downstream flow</AlertTitle>
                  <AlertDescription>
                    Uploading the occupational certificate is the clearest next step
                    to unblock deduction validation and payment preparation.
                  </AlertDescription>
                </Alert>
              </>
            ) : null}
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
