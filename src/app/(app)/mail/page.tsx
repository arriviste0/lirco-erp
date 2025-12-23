import { Inbox } from 'lucide-react';

export default function MailPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <Inbox className="size-16" />
      <h2 className="text-2xl font-semibold">Select an Email</h2>
      <p>Choose an email from the list to read it.</p>
    </div>
  );
}
