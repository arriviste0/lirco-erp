import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductionPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-semibold">Production</h1>
      <p className="text-muted-foreground">
        Manage production orders, material issuance, and finished goods receipt.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Production Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Production management interface will be here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
