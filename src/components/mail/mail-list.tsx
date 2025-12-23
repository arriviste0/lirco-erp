'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Email } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MailListProps {
  emails: Email[];
}

export function MailList({ emails }: MailListProps) {
  const pathname = usePathname();

  return (
    <ScrollArea className="h-[calc(100%-89px)]">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {emails.map((email) => (
          <Link
            key={email.id}
            href={`/mail/${email.id}`}
            className={cn(
              'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
              pathname === `/mail/${email.id}` && 'bg-accent'
            )}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{email.from.name}</div>
                  {!email.read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    'ml-auto text-xs',
                    pathname === `/mail/${email.id}`
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {formatDistanceToNow(new Date(email.date), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-xs font-medium">{email.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {email.body.substring(0, 300)}
            </div>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
}
