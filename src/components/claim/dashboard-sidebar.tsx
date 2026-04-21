import type { LucideIcon } from 'lucide-react'
import { Sparkles } from 'lucide-react'

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'

type NavItem = { label: string; href: string; icon: LucideIcon }

export function DashboardSidebar({
  navItems,
  activeHref,
  onNavigate,
  timelineCount,
  fileNo,
  currentStatus,
  estimatedRemainingTime,
  progressValue,
  pendingSteps,
  insertedNodeCount,
}: {
  navItems: NavItem[]
  activeHref: string
  onNavigate: (href: string) => void
  timelineCount: number
  fileNo: string
  currentStatus: string
  estimatedRemainingTime: string
  progressValue: number
  pendingSteps: number
  insertedNodeCount: number
}) {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/40 p-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold tracking-tight">
              Claim Orchestrator
            </p>
            <p className="text-xs text-sidebar-foreground/70">
              AI-assisted self-service dashboard
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={activeHref === item.href}
                    tooltip={item.label}
                    onClick={() => {
                      onNavigate(item.href)

                      if (isMobile) {
                        setOpenMobile(false)
                      }
                    }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.label === 'Timeline' ? (
                    <SidebarMenuBadge>{timelineCount}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Claim Pulse</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3 px-2">
            <Card className="border-sidebar-border/80 bg-sidebar-accent/30 text-sidebar-foreground shadow-none">
              <CardContent className="space-y-3 p-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-sidebar-foreground/60">
                  <span>File No</span>
                  <span>{fileNo}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{currentStatus}</p>
                  <p className="text-xs text-sidebar-foreground/70">
                    Estimated remaining time {estimatedRemainingTime}
                  </p>
                </div>
                <Progress value={progressValue} className="h-2" />
              </CardContent>
            </Card>

            <div className="grid gap-2">
              <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/25 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
                  Open actions
                </p>
                <p className="mt-1 text-xl font-semibold">{pendingSteps}</p>
              </div>
              <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/25 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
                  Custom nodes
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {insertedNodeCount}
                </p>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/35 p-3">
          <Avatar size="lg">
            <AvatarFallback>AI</AvatarFallback>
            <AvatarBadge />
          </Avatar>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium">Case Copilot</p>
            <p className="text-xs text-sidebar-foreground/70">
              Explains policy jargon and flags missing docs
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
