import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BomsPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-semibold">
        Bill of Materials (BOMs)
      </h1>
      <p className="text-muted-foreground">
        Manage the components for your manufactured items.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>BOM Master</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            BOM management interface will be here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
