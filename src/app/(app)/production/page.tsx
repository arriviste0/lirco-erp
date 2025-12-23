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
import { Factory, PlusCircle, Clock, CheckSquare, ListTodo } from 'lucide-react';
import { useState } from 'react';
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

type ProductionOrder = {
  id: string;
  item: string;
  quantity: number;
  status: 'In Progress' | 'Completed' | 'Pending';
  date: string;
}

const initialProductionOrders: ProductionOrder[] = [
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
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(initialProductionOrders);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const defaultNewOrder = {
    id: `PO-${String(Math.floor(Math.random() * 1000) + 4).padStart(3, '0')}`,
    item: '',
    quantity: 0,
    status: 'Pending' as const,
    date: new Date().toISOString().split('T')[0],
  };

  const [formState, setFormState] = useState<ProductionOrder>(defaultNewOrder);

  const handleAddOrder = () => {
    setProductionOrders([...productionOrders, formState]);
    setFormState(defaultNewOrder);
    setIsAddDialogOpen(false);
  };

  const activeOrders = productionOrders.filter(o => o.status === 'In Progress').length;
  const pendingOrders = productionOrders.filter(o => o.status === 'Pending').length;
  const completedToday = productionOrders.filter(o => o.status === 'Completed' && o.date === new Date().toISOString().split('T')[0]).length;

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
                <div className="text-2xl font-bold">{activeOrders}</div>
                <p className="text-xs text-muted-foreground">
                    Orders currently in production
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <ListTodo className="size-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                    Orders waiting to be started
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                <CheckSquare className="size-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{completedToday}</div>
                <p className="text-xs text-muted-foreground">
                    Orders finished today
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Lead Time</CardTitle>
                <Clock className="size-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">3.5 Days</div>
                <p className="text-xs text-muted-foreground">
                    Average time from start to finish
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
           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormState(defaultNewOrder)}>
                <PlusCircle className="mr-2" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Production Order</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new production order.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="item" className="text-right">
                    Item
                  </Label>
                  <Input id="item" value={formState.item} onChange={(e) => setFormState({...formState, item: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input id="quantity" type="number" value={formState.quantity} onChange={(e) => setFormState({...formState, quantity: parseInt(e.target.value) || 0})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Due Date
                  </Label>
                  <Input id="date" type="date" value={formState.date} onChange={(e) => setFormState({...formState, date: e.target.value})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddOrder}>Create Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
