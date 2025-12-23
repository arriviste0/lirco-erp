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
import { Boxes, PackagePlus } from 'lucide-react';

const inventoryItems = [
  {
    id: 'ITEM-001',
    name: 'Product Alpha',
    stock: 500,
    status: 'In Stock',
  },
  {
    id: 'ITEM-002',
    name: 'Product Beta',
    stock: 0,
    status: 'Out of Stock',
  },
  {
    id: 'ITEM-003',
    name: 'Component Gamma',
    stock: 20,
    status: 'Low Stock',
  },
  {
    id: 'ITEM-004',
    name: 'Raw Material Delta',
    stock: 1200,
    status: 'In Stock',
  },
];

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-semibold">Inventory</h1>
        <p className="text-muted-foreground">
          Track your stock levels, goods receipts, and dispatches.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Items
            </CardTitle>
            <Boxes className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Total distinct items in inventory
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              A list of all items in your inventory.
            </CardDescription>
          </div>
          <Button>
            <PackagePlus className="mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.stock}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        item.status === 'In Stock'
                          ? 'secondary'
                          : item.status === 'Low Stock'
                          ? 'outline'
                          : 'destructive'
                      }
                    >
                      {item.status}
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
