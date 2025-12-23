import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PartiesPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-semibold">Parties</h1>
      <p className="text-muted-foreground">
        Manage your customers and suppliers.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Party Master</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Party management interface will be here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
