import { Mail } from 'lucide-react';

export default function MailLayout() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <Mail className="size-16" />
      <h2 className="text-2xl font-semibold">Coming Soon</h2>
      <p>The mail inbox feature is under construction.</p>
    </div>
  );
}
