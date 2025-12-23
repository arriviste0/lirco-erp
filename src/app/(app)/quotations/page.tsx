'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Send, FilePlus2 } from 'lucide-react';

const quotations = [
    {
        id: 'Q-12345',
        customer: 'Innovate Inc.',
        amount: '$5,400.00',
        status: 'Sent',
        date: '2024-09-12',
    },
    {
        id: 'Q-12346',
        customer: 'Tech Solutions Ltd.',
        amount: '$12,800.00',
        status: 'Draft',
        date: '2024-09-15',
    },
    {
        id: 'Q-12347',
        customer: 'Global Corp.',
        amount: '$2,150.00',
        status: 'Accepted',
        date: '2024-09-10',
    },
];

export default function QuotationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-semibold">Quotations</h1>
        <p className="text-muted-foreground">
          Create and manage quotations for your customers.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Quotations</CardTitle>
                <Send className="size-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                    Quotations awaiting response
                </p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Quotations</CardTitle>
            <CardDescription>
              A list of your most recent quotations.
            </CardDescription>
          </div>
          <Button>
            <FilePlus2 className="mr-2" />
            New Quotation
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.id}</TableCell>
                  <TableCell>{quote.customer}</TableCell>
                  <TableCell>{quote.date}</TableCell>
                  <TableCell className="text-right">{quote.amount}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        quote.status === 'Accepted'
                          ? 'default'
                          : quote.status === 'Sent'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {quote.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
