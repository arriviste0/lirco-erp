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
import {
  Send,
  FilePlus2,
  CheckCircle,
  FileText,
  DollarSign,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

type Quotation = {
  id: string;
  customer: string;
  amount: number;
  status: 'Sent' | 'Draft' | 'Accepted' | 'Rejected';
  date: string;
};

const initialQuotations: Quotation[] = [
  {
    id: 'Q-12345',
    customer: 'Innovate Inc.',
    amount: 5400.0,
    status: 'Sent',
    date: '2024-09-12',
  },
  {
    id: 'Q-12346',
    customer: 'Tech Solutions Ltd.',
    amount: 12800.0,
    status: 'Draft',
    date: '2024-09-15',
  },
  {
    id: 'Q-12347',
    customer: 'Global Corp.',
    amount: 2150.0,
    status: 'Accepted',
    date: '2024-09-10',
  },
];

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const defaultNewQuote = {
    id: `Q-${Math.floor(Math.random() * 10000) + 12348}`,
    customer: '',
    amount: 0,
    status: 'Draft' as const,
    date: new Date().toISOString().split('T')[0],
  }
  const [formState, setFormState] = useState<Quotation>(defaultNewQuote);

  const handleAddQuotation = () => {
    setQuotations([...quotations, formState]);
    setFormState(defaultNewQuote);
    setIsAddDialogOpen(false);
  };
  
  const openQuotations = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length;
  const acceptedQuotations = quotations.filter(q => q.status === 'Accepted').length;
  const draftQuotations = quotations.filter(q => q.status === 'Draft').length;
  const totalQuotedValue = quotations.reduce((sum, q) => sum + q.amount, 0);


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
            <CardTitle className="text-sm font-medium">
              Open Quotations
            </CardTitle>
            <Send className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openQuotations}</div>
            <p className="text-xs text-muted-foreground">
              Quotations awaiting response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Draft Quotations
            </CardTitle>
            <FileText className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftQuotations}</div>
            <p className="text-xs text-muted-foreground">
              Quotations not yet sent
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Accepted Quotations
            </CardTitle>
            <CheckCircle className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedQuotations}</div>
            <p className="text-xs text-muted-foreground">
              This financial year
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Quoted Value
            </CardTitle>
            <DollarSign className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalQuotedValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Value of all quotations
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormState(defaultNewQuote)}>
                <FilePlus2 className="mr-2" />
                New Quotation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Quotation</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new quotation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customer" className="text-right">
                    Customer
                  </Label>
                  <Input id="customer" value={formState.customer} onChange={(e) => setFormState({...formState, customer: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input id="date" type="date" value={formState.date} onChange={(e) => setFormState({...formState, date: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input id="amount" type="number" value={formState.amount} onChange={(e) => setFormState({...formState, amount: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddQuotation}>Save Quotation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <TableCell className="text-right">${quote.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        quote.status === 'Accepted'
                          ? 'default'
                          : quote.status === 'Sent'
                          ? 'secondary'
                          : quote.status === 'Draft' ? 'outline' : 'destructive'
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
