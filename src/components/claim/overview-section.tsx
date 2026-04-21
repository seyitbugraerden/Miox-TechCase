import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SummaryCard } from '@/components/claim/summary-card'

export function OverviewSection({
  currentStatus,
  progressValue,
  fileNo,
  estimatedRemainingTime,
  actionLabel,
  insertedNodeCount,
  completedCount,
  pendingSteps,
}: {
  currentStatus: string
  progressValue: number
  fileNo: string
  estimatedRemainingTime: string
  actionLabel: string
  insertedNodeCount: number
  completedCount: number
  pendingSteps: number
}) {
  return (
    <section id="overview" className="space-y-4">
      <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-background via-background to-amber-500/10 shadow-sm">
        <CardContent className="grid gap-5 p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit rounded-full bg-primary/12 px-3 py-1 text-primary shadow-none">
                Under 3-second answer promise
              </Badge>
              <div className="space-y-2">
                <h2 className="max-w-2xl text-2xl font-semibold tracking-tight md:text-4xl">
                  {currentStatus}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Customers can immediately see their claim number, current
                  stage, estimated remaining time, and the exact action required
                  without waiting for support.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Progress confidence
              </p>
              <p className="mt-2 text-3xl font-semibold">{progressValue}%</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {completedCount} completed, {pendingSteps} active milestones
              </p>
            </div>
          </div>

          <Progress value={progressValue} className="h-2.5" />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Claim Number"
              value={fileNo}
              hint="Synced from the payload"
            />
            <SummaryCard
              title="Estimated Time"
              value={estimatedRemainingTime}
              hint="Displayed up front"
            />
            <SummaryCard
              title="Immediate Action"
              value={actionLabel}
              hint="Actionability surfaced"
            />
            <SummaryCard
              title="Dynamic Nodes"
              value={`${insertedNodeCount} inserted`}
              hint="Registry-driven custom flow"
            />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
