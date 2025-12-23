'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { MoreHorizontal, PackagePlus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const items = [
  {
    id: 'ITEM-001',
    name: 'Product Alpha',
    description: 'High-quality product alpha',
    type: 'Finished Good',
    price: 25.0,
  },
  {
    id: 'ITEM-002',
    name: 'Product Beta',
    description: 'Standard product beta',
    type: 'Finished Good',
    price: 45.0,
  },
  {
    id: 'ITEM-003',
    name: 'Component Gamma',
    description: 'Essential component gamma',
    type: 'Component',
    price: 5.5,
  },
  {
    id: 'ITEM-004',
    name: 'Raw Material Delta',
    description: 'Primary raw material delta',
    type: 'Raw Material',
    price: 2.0,
  },
];

export default function ItemsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-semibold">Item Master</h1>
        <p className="text-muted-foreground">
          Manage your products, components, and raw materials.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Items</CardTitle>
              <CardDescription>A list of all items in the master.</CardDescription>
            </div>
            <Button>
              <PackagePlus className="mr-2" />
              New Item
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Item</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
