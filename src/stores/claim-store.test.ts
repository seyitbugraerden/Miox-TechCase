import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AiInsight, DocumentAnalysis } from '@/types'
import { useClaimWorkspaceStore } from '@/stores/claim-store'

describe('claim store', () => {
  beforeEach(() => {
    useClaimWorkspaceStore.setState({
      insertedNodes: [],
      aiInsights: {},
      documentAnalysis: null,
    })
  })

  it('adds note and attachment nodes without mutating API steps', () => {
    const randomUuid = vi
      .spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValueOnce('note-node')
      .mockReturnValueOnce('attachment-node')

    const noteId = useClaimWorkspaceStore
      .getState()
      .addNode('process-3', {
        type: 'note',
        message: 'Customer said the certificate will arrive tomorrow.',
        emphasis: 'Important',
      })

    const attachmentId = useClaimWorkspaceStore
      .getState()
      .addNode('process-4', {
        type: 'attachment',
        fileName: 'Occupational_Certificate_v2.pdf',
        note: 'Resubmitted after validation feedback.',
        reviewStatus: 'Ready for Validation',
      })

    const { insertedNodes } = useClaimWorkspaceStore.getState()

    expect(noteId).toBe('note-node')
    expect(attachmentId).toBe('attachment-node')
    expect(insertedNodes).toHaveLength(2)
    expect(insertedNodes[0]).toMatchObject({
      id: 'note-node',
      title: 'Information Note',
      source: 'user',
      afterStepId: 'process-3',
      metadata: {
        emphasis: 'Important',
      },
    })
    expect(insertedNodes[1]).toMatchObject({
      id: 'attachment-node',
      title: 'Additional Attachment',
      source: 'user',
      afterStepId: 'process-4',
      metadata: {
        fileName: 'Occupational_Certificate_v2.pdf',
        reviewStatus: 'Ready for Validation',
      },
    })

    randomUuid.mockRestore()
  })

  it('removes only the targeted custom node', () => {
    useClaimWorkspaceStore.setState({
      insertedNodes: [
        {
          id: 'keep-me',
          title: 'Information Note',
          status: 'FYI',
          kind: 'note',
          source: 'user',
          afterStepId: 'process-2',
          createdAt: '2025-09-10T10:00:00.000Z',
          metadata: {
            message: 'Keep this node',
            emphasis: 'FYI',
            createdAt: '2025-09-10T10:00:00.000Z',
          },
        },
        {
          id: 'remove-me',
          title: 'Additional Attachment',
          status: 'Awaiting Review',
          kind: 'attachment',
          source: 'user',
          afterStepId: 'process-2',
          createdAt: '2025-09-10T11:00:00.000Z',
          metadata: {
            fileName: 'extra.pdf',
            note: 'Remove this node',
            reviewStatus: 'Awaiting Review',
            uploadedAt: '2025-09-10T11:00:00.000Z',
          },
        },
      ],
    })

    useClaimWorkspaceStore.getState().removeNode('remove-me')

    expect(useClaimWorkspaceStore.getState().insertedNodes).toHaveLength(1)
    expect(useClaimWorkspaceStore.getState().insertedNodes[0]?.id).toBe('keep-me')
  })

  it('caches AI insights and the latest document analysis', () => {
    const insight: AiInsight = {
      summary: 'File Review is in progress.',
      bullets: ['Review is active.'],
      nextAction: 'No customer action is required right now.',
    }
    const analysis: DocumentAnalysis = {
      status: 'approved',
      fileName: 'occupational_certificate.pdf',
      documentType: 'Occupational Certificate',
      analyzedAt: '2025-09-10T09:00:00.000Z',
      summary: 'Analyzer approved the document.',
      checks: [
        {
          label: 'File type validation',
          passed: true,
          detail: 'PDF detected.',
        },
      ],
    }

    useClaimWorkspaceStore.getState().cacheInsight('process-5', insight)
    useClaimWorkspaceStore.getState().setDocumentAnalysis(analysis)

    expect(useClaimWorkspaceStore.getState().aiInsights['process-5']).toEqual(
      insight
    )
    expect(useClaimWorkspaceStore.getState().documentAnalysis).toEqual(analysis)
  })
})
