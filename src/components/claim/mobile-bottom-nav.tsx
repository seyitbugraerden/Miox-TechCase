import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export function MobileBottomNav({
  navItems,
  activeHref,
  onNavigate,
}: {
  navItems: NavItem[]
  activeHref: string
  onNavigate: (href: string) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 md:hidden">
      <div className="border-t border-border/80 bg-background/95 p-2 shadow-[0_-20px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl [padding-bottom:calc(env(safe-area-inset-bottom)+0.5rem)]">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const isActive = activeHref === item.href

            return (
              <button
                key={item.href}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-15 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
                onClick={() => onNavigate(item.href)}
              >
                <item.icon className="size-4.5" />
                <span className="leading-none">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
