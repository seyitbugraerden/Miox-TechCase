import { describe, expect, it } from 'vitest'

import { claimProcessPayload } from '@/data/claim-process'
import {
  analyzeDocument,
  buildAiInsight,
  formatMetadataValue,
  getStepRegistryEntry,
  mergeTimeline,
  normalizeProcessSteps,
} from '@/lib/claim-utils'
import type { TimelineStep, UserTimelineStep } from '@/types'

describe('claim-utils', () => {
  it('normalizes the heterogeneous API payload into timeline steps', () => {
    const timeline = normalizeProcessSteps(claimProcessPayload.processDetails)

    expect(timeline).toHaveLength(claimProcessPayload.processDetails.length)
    expect(timeline[0]).toMatchObject({
      id: 'process-1',
      title: 'Towing Service',
      status: 'Completed',
      kind: 'process',
      source: 'api',
    })
    expect(timeline[0]?.metadata).toEqual({
      pickupLocation: 'Istanbul/Kadikoy',
      towingDate: '10/09/2025 14:30',
    })
  })

  it('merges inserted nodes directly after the matching step and keeps them ordered', () => {
    const baseTimeline = normalizeProcessSteps(claimProcessPayload.processDetails)
    const insertedNodes: UserTimelineStep[] = [
      {
        id: 'node-late',
        title: 'Information Note',
        status: 'FYI',
        kind: 'note',
        source: 'user',
        afterStepId: 'process-2',
        createdAt: '2025-09-11T09:30:00.000Z',
        metadata: {
          message: 'Late note',
          emphasis: 'FYI',
          createdAt: '2025-09-11T09:30:00.000Z',
        },
      },
      {
        id: 'node-early',
        title: 'Additional Attachment',
        status: 'Ready for Validation',
        kind: 'attachment',
        source: 'user',
        afterStepId: 'process-2',
        createdAt: '2025-09-11T09:00:00.000Z',
        metadata: {
          fileName: 'Occupational_Certificate.pdf',
          note: 'Uploaded for review',
          reviewStatus: 'Ready for Validation',
          uploadedAt: '2025-09-11T09:00:00.000Z',
        },
      },
    ]

    const merged = mergeTimeline(baseTimeline, insertedNodes)
    const secondStepIndex = merged.findIndex((step) => step.id === 'process-2')

    expect(merged[secondStepIndex + 1]?.id).toBe('node-early')
    expect(merged[secondStepIndex + 2]?.id).toBe('node-late')
  })

  it('builds AI insight copy that preserves the next action from the case payload', () => {
    const timeline = normalizeProcessSteps(claimProcessPayload.processDetails)
    const deductionStep = timeline.find(
      (step) => step.title === 'Deduction Reason'
    ) as TimelineStep

    const insight = buildAiInsight(deductionStep, claimProcessPayload)

    expect(insight.summary).toContain('claim 9239182380')
    expect(insight.nextAction).toBe('Upload Occupational Certificate')
    expect(insight.bullets[1]).toContain('explicit action request')
  })

  it('approves strong document uploads and flags weak ones', () => {
    const strongFile = new File(['demo'], 'occupational_certificate.pdf', {
      type: 'application/pdf',
    })
    const weakFile = new File(['demo'], 'notes.txt', {
      type: 'text/plain',
    })
    Object.defineProperty(strongFile, 'size', { value: 512_000 })
    Object.defineProperty(weakFile, 'size', { value: 8 * 1024 * 1024 })

    const approved = analyzeDocument(strongFile, {
      documentType: 'Occupational Certificate',
      note: 'Updated after employer verification.',
    })
    const flagged = analyzeDocument(weakFile, {
      documentType: 'Occupational Certificate',
      note: 'short',
    })

    expect(approved.status).toBe('approved')
    expect(approved.checks.every((check) => check.passed)).toBe(true)
    expect(flagged.status).toBe('needs-review')
    expect(flagged.checks.filter((check) => !check.passed)).toHaveLength(4)
  })

  it('falls back to a generic registry entry for unknown steps', () => {
    const fallback = getStepRegistryEntry({
      id: 'custom-step',
      title: 'Unexpected Stage',
      status: 'Pending',
      kind: 'process',
      source: 'api',
      createdAt: '2025-09-10T12:00:00.000Z',
      metadata: {
        customField: 'Custom Value',
      },
    })

    expect(fallback.stage).toBe('General')
    expect(fallback.fields).toEqual([{ key: 'customField', label: 'Custom Field' }])
  })

  it('formats ISO-like metadata timestamps for display', () => {
    const formatted = formatMetadataValue('2025-09-10T14:30:00.000Z')

    expect(formatted).toContain('10/09/2025')
  })
})
