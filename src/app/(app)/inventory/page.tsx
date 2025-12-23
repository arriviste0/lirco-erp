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
import { Boxes, PackagePlus, DollarSign, AlertTriangle, ArchiveX, PlusCircle, MinusCircle, Edit, History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

const initialInventoryItems = [
  {
    id: 'ITEM-001',
    name: 'Product Alpha',
    poNo: 'PO-123',
    description: 'High-quality product alpha',
    quantity: 500,
    status: 'In Stock',
    price: 25.0,
  },
  {
    id: 'ITEM-002',
    name: 'Product Beta',
    poNo: 'PO-124',
    description: 'Standard product beta',
    quantity: 0,
    status: 'Out of Stock',
    price: 45.0,
  },
  {
    id: 'ITEM-003',
    name: 'Component Gamma',
    poNo: 'PO-125',
    description: 'Essential component gamma',
    quantity: 20,
    status: 'Low Stock',
    price: 5.5,
  },
  {
    id: 'ITEM-004',
    name: 'Raw Material Delta',
    poNo: 'PO-126',
    description: 'Primary raw material delta',
    quantity: 1200,
    status: 'In Stock',
    price: 2.0,
  },
];

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);
  const [newItem, setNewItem] = useState({
    id: '',
    name: '',
    poNo: '',
    quantity: 0,
    description: '',
    dateOfEntry: '',
    supplier: '',
    price: 0,
  });

  const handleAddItem = () => {
    const status = newItem.quantity === 0 ? 'Out of Stock' : newItem.quantity < 50 ? 'Low Stock' : 'In Stock';
    setInventoryItems([...inventoryItems, { ...newItem, status }]);
    // Reset form
    setNewItem({
        id: '',
        name: '',
        poNo: '',
        quantity: 0,
        description: '',
        dateOfEntry: '',
        supplier: '',
        price: 0,
    });
  };

  const totalStockValue = inventoryItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const lowStockItems = inventoryItems.filter(
    (item) => item.status === 'Low Stock'
  ).length;
  const outOfStockItems = inventoryItems.filter(
    (item) => item.status === 'Out of Stock'
  ).length;

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
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Boxes className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Total distinct items in inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Value
            </CardTitle>
            <DollarSign className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalStockValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current value of all items in stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items that are below their reorder level
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Out of Stock Items
            </CardTitle>
            <ArchiveX className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items with zero stock available
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
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PackagePlus className="mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="itemId" className="text-right">
                    Item ID
                  </Label>
                  <Input id="itemId" value={newItem.id} onChange={(e) => setNewItem({...newItem, id: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="poNo" className="text-right">
                    PO No.
                  </Label>
                  <Input id="poNo" value={newItem.poNo} onChange={(e) => setNewItem({...newItem, poNo: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input id="quantity" type="number" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea id="description" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dateOfEntry" className="text-right">
                    Date of Entry
                  </Label>
                  <Input id="dateOfEntry" type="date" value={newItem.dateOfEntry} onChange={(e) => setNewItem({...newItem, dateOfEntry: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">
                    Supplier
                  </Label>
                  <Input id="supplier" value={newItem.supplier} onChange={(e) => setNewItem({...newItem, supplier: e.target.value})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit" onClick={handleAddItem}>Save Item</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>PO No.</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.poNo}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
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
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          <span>Add Stock</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MinusCircle className="mr-2 h-4 w-4" />
                          <span>Use Stock</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <History className="mr-2 h-4 w-4" />
                          <span>View History</span>
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
