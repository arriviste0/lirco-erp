import { MailDisplay } from '@/components/mail/mail-display';
import { getEmailById } from '@/lib/data';

export default function MailDisplayPage({ params }: { params: { id: string } }) {
  const email = getEmailById(params.id);

  if (!email) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Email not found.
      </div>
    );
  }

  return <MailDisplay email={email} />;
}
