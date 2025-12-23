import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Logged Out</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You have been successfully logged out.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
