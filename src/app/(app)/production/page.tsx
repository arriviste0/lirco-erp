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
import { Factory, PlusCircle } from 'lucide-react';

const productionOrders = [
  {
    id: 'PO-001',
    item: 'Product Alpha',
    quantity: 100,
    status: 'In Progress',
    date: '2024-09-20',
  },
  {
    id: 'PO-002',
    item: 'Product Beta',
    quantity: 50,
    status: 'Completed',
    date: '2024-09-18',
  },
  {
    id: 'PO-003',
    item: 'Product Alpha',
    quantity: 200,
    status: 'Pending',
    date: '2024-09-22',
  },
];

export default function ProductionPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-semibold">Production</h1>
        <p className="text-muted-foreground">
          Manage production orders, material issuance, and finished goods receipt.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Factory className="size-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">
                    Orders currently in production
                </p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Production Orders</CardTitle>
            <CardDescription>
              A list of all production orders.
            </CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2" />
            New Order
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.item}</TableCell>
                  <TableCell className="text-right">{order.quantity}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        order.status === 'Completed'
                          ? 'secondary'
                          : order.status === 'In Progress'
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {order.status}
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
