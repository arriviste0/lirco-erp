'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BomsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-3xl font-semibold">
            Bill of Materials (BOMs)
          </h1>
          <p className="text-muted-foreground">
            Manage the components for your manufactured items.
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md md:max-w-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl md:text-3xl">COMING SOON</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground text-sm md:text-base">
                This feature is under development and will be available soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
