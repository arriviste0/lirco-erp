import { Skeleton } from "@/components/ui/skeleton"

export default function MailLoading() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="grid gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="whitespace-pre-wrap p-4 text-sm">
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="p-4">
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
