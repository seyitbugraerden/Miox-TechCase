import { z } from 'zod'

export const rawProcessStepSchema = z
  .object({
    title: z.string(),
    status: z.string(),
  })
  .catchall(z.string())

export const claimProcessSchema = z.object({
  title: z.string(),
  fileNo: z.string(),
  estimatedRemainingTime: z.string(),
  currentStatus: z.string(),
  processDetails: z.array(rawProcessStepSchema),
})

export const addNodeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('note'),
    message: z
      .string()
      .min(8, 'Please enter at least 8 characters for the operational note.'),
    emphasis: z.enum(['FYI', 'Important', 'Urgent']),
  }),
  z.object({
    type: z.literal('attachment'),
    fileName: z
      .string()
      .min(3, 'Attachment name must be at least 3 characters long.'),
    note: z
      .string()
      .min(6, 'Please enter at least 6 characters for the review note.'),
    reviewStatus: z.enum(['Awaiting Review', 'Ready for Validation']),
  }),
])

export const documentAnalyzerSchema = z.object({
  documentType: z.enum([
    'Occupational Certificate',
    'Repair Invoice',
    'Expert Addendum',
  ]),
  note: z.string().max(140, 'Keep the note under 140 characters.').optional(),
})

export type ClaimProcess = z.infer<typeof claimProcessSchema>
export type RawProcessStep = z.infer<typeof rawProcessStepSchema>
export type AddNodeValues = z.infer<typeof addNodeSchema>
export type DocumentAnalyzerValues = z.infer<typeof documentAnalyzerSchema>

export type TimelineKind = 'process' | 'note' | 'attachment'

export type TimelineStep = {
  id: string
  title: string
  status: string
  kind: TimelineKind
  source: 'api' | 'user'
  metadata: Record<string, string>
  createdAt: string
}

export type UserTimelineStep = TimelineStep & {
  source: 'user'
  kind: 'note' | 'attachment'
  afterStepId: string
}

export type AiInsight = {
  summary: string
  bullets: string[]
  nextAction: string
}

export type DocumentCheck = {
  label: string
  passed: boolean
  detail: string
}

export type DocumentAnalysis = {
  status: 'approved' | 'needs-review'
  fileName: string
  documentType: string
  analyzedAt: string
  summary: string
  checks: DocumentCheck[]
}
