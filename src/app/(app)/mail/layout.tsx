import { Inbox } from 'lucide-react';

export default function MailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <Inbox className="size-16" />
      <h2 className="text-2xl font-semibold">Coming Soon</h2>
      <p>The mail inbox feature is under construction.</p>
    </div>
  );
}
