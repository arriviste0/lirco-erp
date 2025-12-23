import { Inbox } from 'lucide-react';

export default function MailPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <Inbox className="size-16" />
      <h2 className="text-xl font-semibold">Select an email to read</h2>
      <p>Nothing is selected.</p>
    </div>
  );
}
