import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Bot,
  Clock3,
  FileUp,
  LayoutDashboard,
  Sparkles,
  StickyNote,
} from 'lucide-react'
import { toast } from 'sonner'

import { AnalysisResult } from '@/components/claim/analysis-result'
import { AddNodeDrawer } from '@/components/claim/add-node-drawer'
import { AiInsightDialog } from '@/components/claim/ai-insight-dialog'
import {
  defaultAddNodeValues,
  defaultAnalyzerValues,
} from '@/components/claim/constants'
import { DashboardSkeleton } from '@/components/claim/dashboard-skeleton'
import { DashboardSidebar } from '@/components/claim/dashboard-sidebar'
import { MobileBottomNav } from '@/components/claim/mobile-bottom-nav'
import { OverviewSection } from '@/components/claim/overview-section'
import { RemoveNodeDialog } from '@/components/claim/remove-node-dialog'
import { TimelineSection } from '@/components/claim/timeline-section'
import { fetchClaimProcess } from '@/lib/api'
import {
  analyzeDocument,
  buildAiInsight,
  mergeTimeline,
  normalizeProcessSteps,
  readMetadataValue,
} from '@/lib/claim-utils'
import { useClaimWorkspaceStore } from '@/stores/claim-store'
import type {
  AddNodeValues,
  ClaimProcess,
  DocumentAnalyzerValues,
  TimelineStep,
  UserTimelineStep,
} from '@/types'
import {
  addNodeSchema,
  documentAnalyzerSchema,
} from '@/types'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Button,
} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

function App() {
  const claimQuery = useQuery({
    queryKey: ['claim-process'],
    queryFn: fetchClaimProcess,
  })

  if (claimQuery.isPending) {
    return <DashboardSkeleton />
  }

  if (claimQuery.isError || !claimQuery.data) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Alert className="max-w-lg border-destructive/30">
          <AlertTriangle className="size-4" />
          <AlertTitle>Claim payload could not be loaded</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              The dashboard could not validate the case study payload. Retry the
              query to continue.
            </p>
            <Button onClick={() => claimQuery.refetch()}>Retry payload</Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <ClaimDashboard claim={claimQuery.data} />
}

function ClaimDashboard({ claim }: { claim: ClaimProcess }) {
  const insertedNodes = useClaimWorkspaceStore((state) => state.insertedNodes)
  const aiInsights = useClaimWorkspaceStore((state) => state.aiInsights)
  const addNode = useClaimWorkspaceStore((state) => state.addNode)
  const removeNode = useClaimWorkspaceStore((state) => state.removeNode)
  const cacheInsight = useClaimWorkspaceStore((state) => state.cacheInsight)
  const documentAnalysis = useClaimWorkspaceStore(
    (state) => state.documentAnalysis
  )
  const setDocumentAnalysis = useClaimWorkspaceStore(
    (state) => state.setDocumentAnalysis
  )

  const [search, setSearch] = useState('')
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [addNodeValues, setAddNodeValues] =
    useState<AddNodeValues>(defaultAddNodeValues)
  const [nodeFormError, setNodeFormError] = useState<string | null>(null)
  const [selectedAfterStepId, setSelectedAfterStepId] = useState<string | null>(
    null
  )
  const [aiDialogStep, setAiDialogStep] = useState<TimelineStep | null>(null)
  const [pendingRemoval, setPendingRemoval] = useState<UserTimelineStep | null>(
    null
  )
  const [documentFormValues, setDocumentFormValues] =
    useState<DocumentAnalyzerValues>(defaultAnalyzerValues)
  const [documentFormError, setDocumentFormError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [actionTab, setActionTab] = useState<'actions' | 'ai'>('actions')
  const [activeNavHref, setActiveNavHref] = useState('#overview')
  const [latestInsertedNodeId, setLatestInsertedNodeId] = useState<string | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const navLockRef = useRef<string | null>(null)
  const navLockTimeoutRef = useRef<number | null>(null)

  const deferredSearch = useDeferredValue(search)

  const baseTimeline = useMemo(
    () => normalizeProcessSteps(claim.processDetails),
    [claim.processDetails]
  )

  const timeline = useMemo(
    () => mergeTimeline(baseTimeline, insertedNodes),
    [baseTimeline, insertedNodes]
  )

  const visibleTimeline = useMemo(() => {
    if (!deferredSearch.trim()) {
      return timeline
    }

    const needle = deferredSearch.trim().toLowerCase()

    return timeline.filter((step) => {
      const haystack = [
        step.title,
        step.status,
        ...Object.values(step.metadata),
      ].join(' ')

      return haystack.toLowerCase().includes(needle)
    })
  }, [deferredSearch, timeline])

  const completedCount = claim.processDetails.filter((step) =>
    /completed/i.test(step.status)
  ).length
  const inProgressCount = claim.processDetails.filter((step) =>
    /progress/i.test(step.status)
  ).length
  const actionStep =
    claim.processDetails.find((step) => 'actionRequired' in step) ??
    claim.processDetails.find((step) => /pending|progress/i.test(step.status)) ??
    claim.processDetails[0]
  const actionStepId =
    baseTimeline.find((step) => step.title === actionStep.title)?.id ??
    baseTimeline[0]?.id
  const progressValue = Math.round(
    ((completedCount + inProgressCount * 0.6) / claim.processDetails.length) *
      100
  )

  const activeInsight = aiDialogStep
    ? aiInsights[aiDialogStep.id] ?? buildAiInsight(aiDialogStep, claim)
    : null

  const navItems = [
    { label: 'Overview', href: '#overview', icon: LayoutDashboard },
    { label: 'Timeline', href: '#timeline', icon: Clock3 },
    { label: 'Action Center', href: '#action-center', icon: FileUp },
    { label: 'AI Desk', href: '#ai-desk', icon: Bot },
  ]

  const pendingSteps = claim.processDetails.filter((step) =>
    /pending|progress/i.test(step.status)
  ).length

  function computeActiveHref(currentActionTab: 'actions' | 'ai') {
    const sectionIds = ['overview', 'timeline', 'action-center'] as const
    const threshold = window.innerHeight * 0.35
    let nextHref = '#overview'

    for (const sectionId of sectionIds) {
      const section = document.getElementById(sectionId)

      if (!section) {
        continue
      }

      if (section.getBoundingClientRect().top <= threshold) {
        nextHref =
          sectionId === 'action-center'
            ? currentActionTab === 'ai'
              ? '#ai-desk'
              : '#action-center'
            : `#${sectionId}`
      }
    }

    return nextHref
  }

  function clearNavLock() {
    navLockRef.current = null

    if (navLockTimeoutRef.current) {
      window.clearTimeout(navLockTimeoutRef.current)
      navLockTimeoutRef.current = null
    }
  }

  function lockActiveNav(href: string) {
    clearNavLock()
    navLockRef.current = href
    setActiveNavHref(href)

    navLockTimeoutRef.current = window.setTimeout(() => {
      clearNavLock()
      setActiveNavHref(computeActiveHref(actionTab))
    }, 900)
  }

  useEffect(() => {
    const updateActiveSection = () => {
      const lockedHref = navLockRef.current

      if (lockedHref) {
        const targetElement = document.getElementById(lockedHref.slice(1))

        if (targetElement) {
          const reachedTarget =
            Math.abs(targetElement.getBoundingClientRect().top) <= 28

          if (reachedTarget) {
            clearNavLock()
            setActiveNavHref(lockedHref)
            return
          }
        }

        setActiveNavHref(lockedHref)
        return
      }

      setActiveNavHref(computeActiveHref(actionTab))
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [actionTab])

  useEffect(() => {
    return () => {
      clearNavLock()
    }
  }, [])

  function openAddNodeDrawer(afterStepId: string) {
    setSelectedAfterStepId(afterStepId)
    setNodeFormError(null)
    setAddNodeValues(defaultAddNodeValues)
    setAddDrawerOpen(true)
  }

  function submitAddNode() {
    if (!selectedAfterStepId) {
      setNodeFormError('Choose a placement point in the process flow first.')
      return
    }

    const result = addNodeSchema.safeParse(addNodeValues)
    if (!result.success) {
      setNodeFormError(result.error.issues[0]?.message ?? 'Invalid node data.')
      return
    }

    const insertedNodeId = addNode(selectedAfterStepId, result.data)
    setAddDrawerOpen(false)
    setAddNodeValues(defaultAddNodeValues)
    setNodeFormError(null)
    setSearch('')
    setLatestInsertedNodeId(insertedNodeId)
    toast.success('Custom node inserted into the claim timeline.')

    window.setTimeout(() => {
      const element = document.getElementById(`timeline-node-${insertedNodeId}`)
      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 180)

    window.setTimeout(() => {
      setLatestInsertedNodeId((current) =>
        current === insertedNodeId ? null : current
      )
    }, 2600)
  }

  function openAi(step: TimelineStep) {
    const insight = aiInsights[step.id] ?? buildAiInsight(step, claim)
    cacheInsight(step.id, insight)
    setAiDialogStep(step)
  }

  function runDocumentAnalysis() {
    const parsed = documentAnalyzerSchema.safeParse(documentFormValues)

    if (!parsed.success) {
      setDocumentFormError(
        parsed.error.issues[0]?.message ?? 'Please check the document inputs.'
      )
      return
    }

    if (!selectedFile) {
      setDocumentFormError('Please choose a file to validate.')
      return
    }

    const analysis = analyzeDocument(selectedFile, parsed.data)
    setDocumentAnalysis(analysis)
    setDocumentFormError(null)

    if (analysis.status === 'approved') {
      toast.success('AI analyzer cleared the document for submission.')
    } else {
      toast.warning('AI analyzer flagged the upload for manual review.')
    }
  }

  function resetDocumentAnalyzer() {
    setSelectedFile(null)
    setDocumentAnalysis(null)
    setDocumentFormError(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function scrollToSection(id: string) {
    const element = document.getElementById(id)

    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function navigateToSection(href: string) {
    lockActiveNav(href)

    if (href === '#action-center') {
      setActionTab('actions')
      window.requestAnimationFrame(() => {
        scrollToSection('action-center')
      })
      return
    }

    if (href === '#ai-desk') {
      setActionTab('ai')
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollToSection('ai-desk')
        })
      })
      return
    }

    scrollToSection(href.slice(1))
  }

  return (
    <SidebarProvider defaultOpen>
      <DashboardSidebar
        navItems={navItems}
        activeHref={activeNavHref}
        onNavigate={navigateToSection}
        timelineCount={timeline.length}
        fileNo={claim.fileNo}
        currentStatus={claim.currentStatus}
        estimatedRemainingTime={claim.estimatedRemainingTime}
        progressValue={progressValue}
        pendingSteps={pendingSteps}
        insertedNodeCount={insertedNodes.length}
      />

      <SidebarInset className="bg-transparent pb-[calc(env(safe-area-inset-bottom)+6.25rem)] md:pb-0">
        <header className="border-b border-border/70 md:sticky md:top-0 md:z-20 md:bg-background/85 md:backdrop-blur-xl">
          <div className="px-4 py-5 md:px-6 md:py-4">
            <div className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-card/80 p-4 shadow-sm md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none">
              <div className="flex items-start justify-between gap-3 md:items-center">
                <div className="flex items-start gap-3 md:items-center">
                  <SidebarTrigger className="mt-1 shrink-0 md:hidden" />
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    AI-Powered Claim Orchestrator
                  </p>
                  <h1 className="text-balance text-xl font-semibold tracking-tight md:text-2xl">
                    Mobile-first claim workspace for file {claim.fileNo}
                  </h1>
                </div>
              </div>

                <div className="hidden items-center gap-2 md:flex">
                  <Button
                    variant="outline"
                    onClick={() => openAddNodeDrawer(actionStepId)}
                  >
                    <StickyNote />
                    Add node
                  </Button>
                  <Button onClick={() => openAi(baseTimeline.find((step) => step.id === actionStepId) ?? baseTimeline[0])}>
                    <Sparkles />
                    Explain current stage
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:hidden">
                <Button
                  className="h-11"
                  variant="outline"
                  onClick={() => openAddNodeDrawer(actionStepId)}
                >
                  <StickyNote />
                  Insert note or attachment
                </Button>
                <Button
                  className="h-11"
                  onClick={() =>
                    openAi(
                      baseTimeline.find((step) => step.id === actionStepId) ??
                        baseTimeline[0]
                    )
                  }
                >
                  <Sparkles />
                  Explain current stage
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 md:px-6 md:py-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-6">
              <OverviewSection
                currentStatus={claim.currentStatus}
                progressValue={progressValue}
                fileNo={claim.fileNo}
                estimatedRemainingTime={claim.estimatedRemainingTime}
                actionLabel={readMetadataValue(actionStep, 'actionRequired') ?? 'Monitoring only'}
                insertedNodeCount={insertedNodes.length}
                completedCount={completedCount}
                pendingSteps={pendingSteps}
              />

              <TimelineSection
                visibleTimeline={visibleTimeline}
                actionStepId={actionStepId}
                latestInsertedNodeId={latestInsertedNodeId}
                search={search}
                onSearchChange={(value) =>
                  startTransition(() => setSearch(value))
                }
                onOpenAddNode={openAddNodeDrawer}
                onExplainStep={openAi}
                onRequestRemoveStep={(step) => setPendingRemoval(step)}
              />
            </div>

            <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
              <section id="action-center">
                <Card className="border-border/70 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Action center</CardTitle>
                    <CardDescription>
                      Surfaces the next task, validates uploads, and keeps AI
                      recommendations one tap away on mobile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      value={actionTab}
                      onValueChange={(value) => {
                        const nextValue = value as 'actions' | 'ai'
                        setActionTab(nextValue)
                        clearNavLock()
                        setActiveNavHref(
                          nextValue === 'ai' ? '#ai-desk' : '#action-center'
                        )
                      }}
                      className="gap-4"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="actions">Actions</TabsTrigger>
                        <TabsTrigger value="ai">AI Desk</TabsTrigger>
                      </TabsList>

                      <TabsContent value="actions" className="space-y-4">
                        <Alert className="border-primary/20 bg-primary/5">
                          <FileUp className="size-4" />
                          <AlertTitle>
                            {readMetadataValue(actionStep, 'actionRequired') ??
                              'Current orchestration update'}
                          </AlertTitle>
                          <AlertDescription>
                            The next high-impact action is attached to{' '}
                            <strong>{actionStep.title}</strong>. Completing this
                            upload can unlock the finance and closure stages.
                          </AlertDescription>
                        </Alert>

                        <Card className="border-dashed border-border/80 shadow-none">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                              AI document analyzer
                            </CardTitle>
                            <CardDescription>
                              Simulates pre-submission validation for the
                              required occupational certificate.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Document type
                              </label>
                              <Select
                                value={documentFormValues.documentType}
                                onValueChange={(value) =>
                                  setDocumentFormValues((current) => ({
                                    ...current,
                                    documentType:
                                      value as DocumentAnalyzerValues['documentType'],
                                  }))
                                }
                              >
                                <SelectTrigger className="h-11 w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Occupational Certificate">
                                    Occupational Certificate
                                  </SelectItem>
                                  <SelectItem value="Repair Invoice">
                                    Repair Invoice
                                  </SelectItem>
                                  <SelectItem value="Expert Addendum">
                                    Expert Addendum
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Upload file
                              </label>
                              <Input
                                ref={fileInputRef}
                                className="h-11"
                                type="file"
                                onClick={(event) => {
                                  event.currentTarget.value = ''
                                }}
                                onChange={(event) =>
                                  {
                                    setSelectedFile(
                                      event.target.files?.[0] ?? null
                                    )
                                    setDocumentAnalysis(null)
                                    setDocumentFormError(null)
                                  }
                                }
                              />
                              {selectedFile ? (
                                <p className="text-xs font-medium text-foreground/80">
                                  Selected file: {selectedFile.name}
                                </p>
                              ) : null}
                              <p className="text-xs text-muted-foreground">
                                PDF or image uploads are preferred. The analyzer
                                checks naming, size, and required file type.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Review note
                              </label>
                              <Textarea
                                placeholder="Optional context for the validation agent"
                                value={documentFormValues.note ?? ''}
                                onChange={(event) =>
                                  setDocumentFormValues((current) => ({
                                    ...current,
                                    note: event.target.value,
                                  }))
                                }
                              />
                            </div>

                            {documentFormError ? (
                              <p className="text-sm text-destructive">
                                {documentFormError}
                              </p>
                            ) : null}

                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button className="h-11 flex-1" onClick={runDocumentAnalysis}>
                                <Bot />
                                Analyze before submission
                              </Button>
                              <Button
                                className="h-11 sm:w-auto"
                                variant="outline"
                                onClick={resetDocumentAnalyzer}
                              >
                                Clear
                              </Button>
                            </div>

                            {documentAnalysis ? (
                              <AnalysisResult analysis={documentAnalysis} />
                            ) : null}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="ai" className="space-y-4" id="ai-desk">
                        <Card className="shadow-none">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                              AI insight memory
                            </CardTitle>
                            <CardDescription>
                              Explanations that were requested by the user stay
                              cached in Zustand for a snappy revisit.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {Object.entries(aiInsights).length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
                                Open any step with “Explain current stage” to
                                build the AI insight feed.
                              </div>
                            ) : (
                              Object.entries(aiInsights).map(([stepId, insight]) => (
                                <div
                                  key={stepId}
                                  className="rounded-2xl border border-border/70 bg-muted/30 p-4"
                                >
                                  <div className="flex items-center gap-2 text-sm font-medium">
                                    <Sparkles className="size-4 text-primary" />
                                    {timeline.find((step) => step.id === stepId)
                                      ?.title ?? 'Claim step'}
                                  </div>
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {insight.summary}
                                  </p>
                                </div>
                              ))
                            )}
                          </CardContent>
                        </Card>

                        <Card className="shadow-none">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                              Payload snapshot
                            </CardTitle>
                            <CardDescription>
                              Quick evidence that the interface is wired against
                              the case-study response contract.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="font-medium">
                                    Title
                                  </TableCell>
                                  <TableCell>{claim.title}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">
                                    File No
                                  </TableCell>
                                  <TableCell>{claim.fileNo}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">
                                    Remaining Time
                                  </TableCell>
                                  <TableCell>
                                    {claim.estimatedRemainingTime}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">
                                    Timeline Nodes
                                  </TableCell>
                                  <TableCell>{timeline.length}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </section>
            </aside>
          </div>
        </div>
      </SidebarInset>

      <MobileBottomNav
        navItems={navItems}
        activeHref={activeNavHref}
        onNavigate={navigateToSection}
      />

      <AddNodeDrawer
        open={addDrawerOpen}
        onOpenChange={setAddDrawerOpen}
        values={addNodeValues}
        nodeFormError={nodeFormError}
        onTypeChange={(value) => {
          setNodeFormError(null)
          setAddNodeValues(
            value === 'attachment'
              ? {
                  type: 'attachment',
                  fileName: '',
                  note: '',
                  reviewStatus: 'Awaiting Review',
                }
              : defaultAddNodeValues
          )
        }}
        onMessageChange={(value) =>
          setAddNodeValues((current) => ({
            ...(current.type === 'note' ? current : defaultAddNodeValues),
            message: value,
          }))
        }
        onPriorityChange={(value) =>
          setAddNodeValues((current) => ({
            ...(current.type === 'note' ? current : defaultAddNodeValues),
            emphasis: value as 'FYI' | 'Important' | 'Urgent',
          }))
        }
        onAttachmentNameChange={(value) =>
          setAddNodeValues((current) => ({
            ...(current.type === 'attachment'
              ? current
              : {
                  type: 'attachment',
                  fileName: '',
                  note: '',
                  reviewStatus: 'Awaiting Review',
                }),
            fileName: value,
          }))
        }
        onReviewNoteChange={(value) =>
          setAddNodeValues((current) => ({
            ...(current.type === 'attachment'
              ? current
              : {
                  type: 'attachment',
                  fileName: '',
                  note: '',
                  reviewStatus: 'Awaiting Review',
                }),
            note: value,
          }))
        }
        onReviewStateChange={(value) =>
          setAddNodeValues((current) => ({
            ...(current.type === 'attachment'
              ? current
              : {
                  type: 'attachment',
                  fileName: '',
                  note: '',
                  reviewStatus: 'Awaiting Review',
                }),
            reviewStatus: value as 'Awaiting Review' | 'Ready for Validation',
          }))
        }
        onSubmit={submitAddNode}
      />

      <AiInsightDialog
        step={aiDialogStep}
        insight={activeInsight}
        onOpenChange={(open) => {
          if (!open) {
            setAiDialogStep(null)
          }
        }}
      />

      <RemoveNodeDialog
        pendingRemoval={pendingRemoval}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRemoval(null)
          }
        }}
        onConfirm={() => {
          if (pendingRemoval) {
            removeNode(pendingRemoval.id)
            toast.success('Custom node removed from the timeline.')
          }
          setPendingRemoval(null)
        }}
      />
    </SidebarProvider>
  )
}

export default App
