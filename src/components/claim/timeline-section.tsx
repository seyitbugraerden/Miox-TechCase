import { ArrowRight, Paperclip, Search } from 'lucide-react'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TimelineStepCard } from '@/components/claim/timeline-step-card'
import type { TimelineStep, UserTimelineStep } from '@/types'

export function TimelineSection({
  visibleTimeline,
  actionStepId,
  latestInsertedNodeId,
  search,
  onSearchChange,
  onOpenAddNode,
  onExplainStep,
  onRequestRemoveStep,
}: {
  visibleTimeline: TimelineStep[]
  actionStepId: string
  latestInsertedNodeId: string | null
  search: string
  onSearchChange: (value: string) => void
  onOpenAddNode: (afterStepId: string) => void
  onExplainStep: (step: TimelineStep) => void
  onRequestRemoveStep: (step: UserTimelineStep) => void
}) {
  return (
    <section id="timeline" className="space-y-4">
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">Process timeline</CardTitle>
              <CardDescription>
                Registry-driven rendering for heterogeneous step data, with
                dynamic note and attachment insertion between stages.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-11 w-full pl-10 sm:w-72"
                  placeholder="Search timeline details"
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                />
              </div>
              <Button
                className="h-11"
                variant="outline"
                onClick={() => onOpenAddNode(actionStepId)}
              >
                <Paperclip />
                Insert node
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleTimeline.length === 0 ? (
            <Alert>
              <Search className="size-4" />
              <AlertTitle>No matching timeline nodes</AlertTitle>
              <AlertDescription>
                Try a broader search term or clear the filter.
              </AlertDescription>
            </Alert>
          ) : (
            visibleTimeline.map((step, index) => {
              const isCurrentStage = step.id === actionStepId

              return (
                <div key={step.id} className="space-y-4">
                  <TimelineStepCard
                    step={step}
                    isCurrentStage={isCurrentStage}
                    isRecentlyAdded={step.id === latestInsertedNodeId}
                    onExplain={() => onExplainStep(step)}
                    onRemove={
                      step.source === 'user'
                        ? () => onRequestRemoveStep(step as UserTimelineStep)
                        : undefined
                    }
                  />

                  {step.source === 'api' && index !== visibleTimeline.length - 1 ? (
                    <div className="flex justify-center">
                      <Button
                        className="h-10 rounded-full border-dashed px-4"
                        variant="outline"
                        onClick={() => onOpenAddNode(step.id)}
                      >
                        <ArrowRight />
                        Add note or attachment after this step
                      </Button>
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </section>
  )
}
