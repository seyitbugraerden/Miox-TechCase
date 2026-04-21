import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="grid min-h-svh gap-6 p-4 md:grid-cols-[16rem_minmax(0,1fr)] md:p-6">
      <Card className="hidden md:block">
        <CardContent className="space-y-4 p-4">
          <Skeleton className="h-20 rounded-3xl" />
          <Skeleton className="h-10 rounded-2xl" />
          <Skeleton className="h-10 rounded-2xl" />
          <Skeleton className="h-10 rounded-2xl" />
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-16 rounded-3xl" />
            <div className="grid gap-3 md:grid-cols-4">
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
