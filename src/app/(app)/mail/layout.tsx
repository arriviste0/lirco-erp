import { MailList } from '@/components/mail/mail-list';
import { getEmails } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

export default function MailLayout({ children }: { children: React.ReactNode }) {
  const emails = getEmails();

  return (
    <div className="h-[calc(100vh-120px)] overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex h-full">
        <div className="w-full max-w-xs">
          <div className="p-4">
            <h1 className="font-headline text-xl font-semibold">Inbox</h1>
            <p className="text-sm text-muted-foreground">
              {emails.filter(e => !e.read).length} unread messages
            </p>
          </div>
          <Separator />
          <MailList emails={emails} />
        </div>
        <Separator orientation="vertical" />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
