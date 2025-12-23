import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Boxes,
  Factory,
  Inbox,
  Send,
} from 'lucide-react';

const kpiData = [
  {
    title: 'New Emails',
    value: '3',
    icon: <Inbox className="size-6 text-muted-foreground" />,
    description: 'Unread emails in your inbox',
  },
  {
    title: 'Open Quotations',
    value: '12',
    icon: <Send className="size-6 text-muted-foreground" />,
    description: 'Quotations awaiting response',
  },
  {
    title: 'Items Low on Stock',
    value: '8',
    icon: <Boxes className="size-6 text-muted-foreground" />,
    description: 'Items below reorder level',
  },
  {
    title: 'Active Production Orders',
    value: '5',
    icon: <Factory className="size-6 text-muted-foreground" />,
    description: 'Orders currently in production',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s a quick overview of your business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Recent Activity</CardTitle>
                <CardDescription>A log of recent activities across the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-2"><Inbox className="size-4 text-primary"/></div>
                        <p className="text-sm">New RFQ received from Innovate Inc.</p>
                        <p className="text-sm text-muted-foreground ml-auto">10 mins ago</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-2"><Factory className="size-4 text-primary"/></div>
                        <p className="text-sm">Production order PO-001 completed.</p>
                        <p className="text-sm text-muted-foreground ml-auto">1 hour ago</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-2"><Send className="size-4 text-primary"/></div>
                        <p className="text-sm">Quotation Q-12345 marked as sent.</p>
                        <p className="text-sm text-muted-foreground ml-auto">3 hours ago</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Quick Actions</CardTitle>
                <CardDescription>Get started with common tasks.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">Quick actions will be available here.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
