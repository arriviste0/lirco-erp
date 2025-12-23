import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuotationsPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-semibold">Quotations</h1>
      <p className="text-muted-foreground">
        Create and manage quotations for your customers.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quotation Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Quotation management interface will be here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
