import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InventoryPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-semibold">Inventory</h1>
      <p className="text-muted-foreground">
        Track your stock levels, goods receipts, and dispatches.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Inventory management interface will be here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
