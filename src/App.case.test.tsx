import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '@/App'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useClaimWorkspaceStore } from '@/stores/claim-store'

function renderCaseApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

describe('Technical Case acceptance', () => {
  beforeEach(() => {
    useClaimWorkspaceStore.setState({
      insertedNodes: [],
      aiInsights: {},
      documentAnalysis: null,
    })
  })

  it('surfaces claim number, status, ETA, and immediate action from the case payload', async () => {
    renderCaseApp()

    expect(
      await screen.findByRole(
        'heading',
        { name: 'File Review Process Continues' },
        { timeout: 2_000 }
      )
    ).toBeInTheDocument()
    expect(screen.getAllByText('9239182380').length).toBeGreaterThan(0)
    expect(screen.getAllByText('20 Days').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Upload Occupational Certificate').length
    ).toBeGreaterThan(0)
  })

  it('keeps the in-progress step expanded and opens Explain with AI for the selected stage', async () => {
    renderCaseApp()

    const fileReviewHeading = await screen.findByRole(
      'heading',
      { name: 'File Review' },
      { timeout: 2_000 }
    )
    const fileReviewCard = fileReviewHeading.closest('[id^="timeline-node-"]')

    expect(fileReviewCard).not.toBeNull()
    expect(
      within(fileReviewCard as HTMLElement).getByRole('button', {
        name: /hide details/i,
      })
    ).toBeInTheDocument()
    expect(
      within(fileReviewCard as HTMLElement).getByText('Referral Date')
    ).toBeInTheDocument()

    await userEvent.click(
      within(fileReviewCard as HTMLElement).getByRole('button', {
        name: /explain with ai/i,
      })
    )

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/AI summary for the selected stage/i)).toBeInTheDocument()
    expect(screen.getByText(/claim 9239182380/i)).toBeInTheDocument()
    expect(screen.getByText('Recommended next move')).toBeInTheDocument()
  })
})
