'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ConfirmedOrder = {
  id: string;
  offerNo: string;
  partyName: string;
  offerDate?: string;
  refNo?: string;
  refDate?: string;
  poNumber: string;
  poDate: string;
  costSheetNos: string[];
  createdAt: string;
};

const ordersStorageKey = 'lirco-confirmed-orders';

const readOrders = (): ConfirmedOrder[] => {
  try {
    const stored = localStorage.getItem(ordersStorageKey);
    return stored ? (JSON.parse(stored) as ConfirmedOrder[]) : [];
  } catch (error) {
    console.error('Failed to read orders', error);
    return [];
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<ConfirmedOrder[]>([]);

  useEffect(() => {
    setOrders(readOrders());
  }, []);

  const persistOrders = (next: ConfirmedOrder[]) => {
    setOrders(next);
    try {
      localStorage.setItem(ordersStorageKey, JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save orders', error);
    }
  };

  const handleDelete = (orderId: string) => {
    const next = orders.filter((order) => order.id !== orderId);
    persistOrders(next);
  };

  const handleAction = (label: string, order: ConfirmedOrder) => {
    console.log(`${label} action for order ${order.offerNo}`, order);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-headline text-3xl font-semibold">Orders</h1>
          <p className="text-muted-foreground">
            Confirmed orders from quotations.
          </p>
        </div>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Confirmed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No confirmed orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Offer No.</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>PO No.</TableHead>
                      <TableHead>PO Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.offerNo}
                        </TableCell>
                        <TableCell>{order.partyName || '-'}</TableCell>
                        <TableCell>{order.offerDate || '-'}</TableCell>
                        <TableCell>{order.poNumber || '-'}</TableCell>
                        <TableCell>{order.poDate || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(order.id)}
                            >
                              Delete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('Packing List', order)}
                            >
                              Packing List
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('Work Order', order)}
                            >
                              Work Order
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('Proforma Invoice', order)}
                            >
                              Proforma Invoice
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
