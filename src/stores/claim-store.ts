import { create } from 'zustand'

import type {
  AddNodeValues,
  AiInsight,
  DocumentAnalysis,
  UserTimelineStep,
} from '@/types'

type ClaimWorkspaceState = {
  insertedNodes: UserTimelineStep[]
  aiInsights: Record<string, AiInsight>
  documentAnalysis: DocumentAnalysis | null
  addNode: (afterStepId: string, values: AddNodeValues) => string
  removeNode: (id: string) => void
  cacheInsight: (stepId: string, insight: AiInsight) => void
  setDocumentAnalysis: (analysis: DocumentAnalysis | null) => void
}

export const useClaimWorkspaceStore = create<ClaimWorkspaceState>((set) => ({
  insertedNodes: [],
  aiInsights: {},
  documentAnalysis: null,
  addNode: (afterStepId, values) => {
    const nextId = crypto.randomUUID()

    set((state) => {
      const createdAt = new Date().toISOString()

      const nextNode: UserTimelineStep =
        values.type === 'note'
          ? {
              id: nextId,
              title: 'Information Note',
              status: values.emphasis,
              kind: 'note',
              source: 'user',
              afterStepId,
              createdAt,
              metadata: {
                message: values.message,
                emphasis: values.emphasis,
                createdAt,
              },
            }
          : {
              id: nextId,
              title: 'Additional Attachment',
              status: values.reviewStatus,
              kind: 'attachment',
              source: 'user',
              afterStepId,
              createdAt,
              metadata: {
                fileName: values.fileName,
                note: values.note,
                reviewStatus: values.reviewStatus,
                uploadedAt: createdAt,
              },
            }

      return {
        insertedNodes: [...state.insertedNodes, nextNode],
      }
    })

    return nextId
  },
  removeNode: (id) =>
    set((state) => ({
      insertedNodes: state.insertedNodes.filter((node) => node.id !== id),
    })),
  cacheInsight: (stepId, insight) =>
    set((state) => ({
      aiInsights: {
        ...state.aiInsights,
        [stepId]: insight,
      },
    })),
  setDocumentAnalysis: (analysis) =>
    set({
      documentAnalysis: analysis,
    }),
}))
