import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ItemsPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-semibold">Items</h1>
      <p className="text-muted-foreground">
        Manage your products and materials.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Item Master</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Item management interface will be here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
