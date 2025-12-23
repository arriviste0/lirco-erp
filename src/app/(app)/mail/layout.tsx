import { MailList } from '@/components/mail/mail-list';
import { getEmails } from '@/lib/data';

export default function MailLayout({ children }: { children: React.ReactNode }) {
  const emails = getEmails();

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[320px_1fr]">
      <div className="flex flex-col border-r">
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="font-headline text-xl font-semibold">Inbox</h2>
        </div>
        <MailList emails={emails} />
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
