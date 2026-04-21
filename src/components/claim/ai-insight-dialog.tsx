import { Bot, Sparkles } from 'lucide-react'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AiInsight, TimelineStep } from '@/types'

export function AiInsightDialog({
  step,
  insight,
  onOpenChange,
}: {
  step: TimelineStep | null
  insight: AiInsight | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={Boolean(step)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            {step?.title ?? 'Step explanation'}
          </DialogTitle>
          <DialogDescription>
            AI summary for the selected stage in plain language.
          </DialogDescription>
        </DialogHeader>

        {insight ? (
          <ScrollArea className="max-h-[65vh] px-5">
            <div className="space-y-4 pb-5">
              <Card className="border-primary/15 bg-primary/5 shadow-none">
                <CardContent className="p-4 text-sm leading-6">
                  {insight.summary}
                </CardContent>
              </Card>

              <div>
                <p className="text-sm font-medium">Why this stage matters</p>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {insight.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-xl border border-border/70 bg-muted/30 p-3"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <Alert>
                <Bot className="size-4" />
                <AlertTitle>Recommended next move</AlertTitle>
                <AlertDescription>{insight.nextAction}</AlertDescription>
              </Alert>
            </div>
          </ScrollArea>
        ) : null}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
