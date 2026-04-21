import { FileSearch } from 'lucide-react'

import type { StepRegistryEntry } from '@/components/claim/constants'
import { stepRegistry } from '@/components/claim/constants'
import type {
  AiInsight,
  ClaimProcess,
  DocumentAnalysis,
  DocumentAnalyzerValues,
  RawProcessStep,
  TimelineStep,
  UserTimelineStep,
} from '@/types'

export function normalizeProcessSteps(processDetails: RawProcessStep[]): TimelineStep[] {
  return processDetails.map((step, index) => {
    const { title, status, ...metadata } = step

    return {
      id: `process-${index + 1}`,
      title,
      status,
      kind: 'process',
      source: 'api',
      createdAt: new Date(2025, 8, index + 10).toISOString(),
      metadata: Object.fromEntries(
        Object.entries(metadata).map(([key, value]) => [key, String(value)])
      ),
    }
  })
}

export function mergeTimeline(
  baseTimeline: TimelineStep[],
  insertedNodes: UserTimelineStep[]
): TimelineStep[] {
  const insertedMap = insertedNodes.reduce<Record<string, UserTimelineStep[]>>(
    (accumulator, node) => {
      accumulator[node.afterStepId] ??= []
      accumulator[node.afterStepId].push(node)
      return accumulator
    },
    {}
  )

  return baseTimeline.flatMap((step) => [
    step,
    ...(insertedMap[step.id] ?? []).sort((left, right) =>
      left.createdAt.localeCompare(right.createdAt)
    ),
  ])
}

export function buildAiInsight(step: TimelineStep, claim: ClaimProcess): AiInsight {
  const registry = stepRegistry[step.title]
  const summary = `${step.title} is currently marked as ${step.status.toLowerCase()} in claim ${claim.fileNo}. This stage sits in ${registry?.stage.toLowerCase() ?? 'the active flow'} and the dashboard is translating the raw payload into customer-friendly language.`

  const bullets = [
    `The step exposes ${Object.keys(step.metadata).length} contextual field${Object.keys(step.metadata).length === 1 ? '' : 's'} from the payload, so the user does not need to call support for basic details.`,
    step.metadata.actionRequired
      ? `There is an explicit action request: ${step.metadata.actionRequired}.`
      : 'No blocking action has been attached to this stage yet, so the experience can stay reassurance-focused.',
    step.source === 'user'
      ? 'This node was inserted dynamically by the user, proving the timeline can absorb new heterogeneous content without hardcoded branches.'
      : 'This node comes directly from the API response and is rendered through the registry pattern instead of step-specific conditionals.',
  ]

  const nextAction =
    step.metadata.actionRequired ??
    (step.status.toLowerCase().includes('pending')
      ? 'Monitor this pending stage and gather any missing supporting documents.'
      : 'No customer task is required right now; keep the user informed with status clarity.')

  return {
    summary,
    bullets,
    nextAction,
  }
}

export function analyzeDocument(
  file: File,
  values: DocumentAnalyzerValues
): DocumentAnalysis {
  const isPdfOrImage =
    file.type.includes('pdf') || file.type.startsWith('image/')
  const fitsSize = file.size <= 5 * 1024 * 1024
  const hasStrongName = /occupational|certificate|meslek|cert/i.test(file.name)
  const includesContext = (values.note?.trim().length ?? 0) >= 8

  const checks = [
    {
      label: 'File type validation',
      passed: isPdfOrImage,
      detail: isPdfOrImage
        ? 'The upload uses a supported document format.'
        : 'Only PDF or image uploads are accepted in the simulated analyzer.',
    },
    {
      label: 'File size check',
      passed: fitsSize,
      detail: fitsSize
        ? 'The file is within the recommended 5 MB limit.'
        : 'The upload is larger than 5 MB and should be compressed before submission.',
    },
    {
      label: 'Semantic filename check',
      passed: hasStrongName || values.documentType !== 'Occupational Certificate',
      detail:
        hasStrongName || values.documentType !== 'Occupational Certificate'
          ? 'The filename strongly signals the expected document content.'
          : 'Rename the file so the document purpose is obvious to reviewers and downstream systems.',
    },
    {
      label: 'Review context',
      passed: includesContext,
      detail: includesContext
        ? 'The reviewer note gives enough context for the AI triage layer.'
        : 'Add a short note so the reviewer understands what changed or why this upload matters.',
    },
  ]

  const approved = checks.filter((check) => check.passed).length >= 3

  return {
    status: approved ? 'approved' : 'needs-review',
    fileName: file.name,
    documentType: values.documentType,
    analyzedAt: new Date().toISOString(),
    summary: approved
      ? 'The simulated AI analyzer is confident enough to move this document toward submission.'
      : 'The upload should be improved before it is submitted to avoid another back-and-forth with operations.',
    checks,
  }
}

export function readMetadataValue(step: RawProcessStep, key: string) {
  const value = step[key]
  return typeof value === 'string' ? value : undefined
}

export function formatMetadataValue(value: string) {
  if (/\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleString('en-GB')
  }

  return value
}

export function humanizeKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (char) => char.toUpperCase())
}

export function getStepRegistryEntry(step: TimelineStep): StepRegistryEntry {
  return (
    stepRegistry[step.title] ?? {
      icon: FileSearch,
      stage: 'General',
      fields: Object.keys(step.metadata).map((key) => ({
        key,
        label: humanizeKey(key),
      })),
      tone: 'from-slate-500/10 via-background to-background',
    }
  )
}
