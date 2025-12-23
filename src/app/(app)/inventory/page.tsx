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
  Boxes,
  PackagePlus,
  DollarSign,
  AlertTriangle,
  ArchiveX,
  PlusCircle,
  MinusCircle,
  Edit,
  History,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

type InventoryItem = {
  id: string;
  name: string;
  poNo: string;
  description: string;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  price: number;
  dateOfEntry?: string;
  supplier?: string;
};

const initialInventoryItems: InventoryItem[] = [
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

const getStatus = (quantity: number): InventoryItem['status'] => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 50) return 'Low Stock';
    return 'In Stock';
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] =
    useState<InventoryItem[]>(initialInventoryItems);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockAction, setStockAction] = useState<'add' | 'use' | null>(null);
  const [stockQuantity, setStockQuantity] = useState(0);

  const defaultNewItem = {
    id: '',
    name: '',
    poNo: '',
    quantity: 0,
    description: '',
    dateOfEntry: '',
    supplier: '',
    price: 0,
  };
  const [formState, setFormState] = useState<Omit<InventoryItem, 'status'>>(defaultNewItem);
  

  const handleAddItem = () => {
    const newItem: InventoryItem = {
      ...formState,
      status: getStatus(formState.quantity),
    };
    setInventoryItems([...inventoryItems, newItem]);
    setFormState(defaultNewItem);
    setIsAddDialogOpen(false);
  };
  
  const handleEditItem = () => {
    if(!selectedItem) return;
    const updatedItem = {
      ...formState,
      quantity: selectedItem.quantity,
      status: getStatus(selectedItem.quantity),
    };
    setInventoryItems(inventoryItems.map(item => item.id === selectedItem.id ? updatedItem : item));
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  }

  const handleOpenEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormState(item);
    setIsEditDialogOpen(true);
  };

  const handleOpenStockDialog = (item: InventoryItem, action: 'add' | 'use') => {
    setSelectedItem(item);
    setStockAction(action);
    setStockQuantity(0);
    setIsStockDialogOpen(true);
  }

  const handleStockUpdate = () => {
    if (!selectedItem || !stockAction) return;

    const newQuantity = stockAction === 'add' 
      ? selectedItem.quantity + stockQuantity 
      : selectedItem.quantity - stockQuantity;
    
    if (newQuantity < 0) {
      // Or show a toast/error message
      alert("Cannot use more stock than available.");
      return;
    }

    const updatedItems = inventoryItems.map(item => 
      item.id === selectedItem.id 
        ? { ...item, quantity: newQuantity, status: getStatus(newQuantity) }
        : item
    );
    setInventoryItems(updatedItems);
    setIsStockDialogOpen(false);
    setSelectedItem(null);
  }

  const handleViewHistory = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsHistoryDialogOpen(true);
  }


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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormState(defaultNewItem)}>
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
                  <Input id="itemId" value={formState.id} onChange={(e) => setFormState({...formState, id: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="poNo" className="text-right">
                    PO No.
                  </Label>
                  <Input id="poNo" value={formState.poNo} onChange={(e) => setFormState({...formState, poNo: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input id="quantity" type="number" value={formState.quantity} onChange={(e) => setFormState({...formState, quantity: parseInt(e.target.value) || 0})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input id="price" type="number" value={formState.price} onChange={(e) => setFormState({...formState, price: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea id="description" value={formState.description} onChange={(e) => setFormState({...formState, description: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dateOfEntry" className="text-right">
                    Date of Entry
                  </Label>
                  <Input id="dateOfEntry" type="date" value={formState.dateOfEntry} onChange={(e) => setFormState({...formState, dateOfEntry: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">
                    Supplier
                  </Label>
                  <Input id="supplier" value={formState.supplier} onChange={(e) => setFormState({...formState, supplier: e.target.value})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddItem}>Save Item</Button>
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
                        <DropdownMenuItem onClick={() => handleOpenStockDialog(item, 'add')}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          <span>Add Stock</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenStockDialog(item, 'use')}>
                          <MinusCircle className="mr-2 h-4 w-4" />
                          <span>Use Stock</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewHistory(item)}>
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
      
      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Item - {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-itemId" className="text-right">
                    Item ID
                  </Label>
                  <Input id="edit-itemId" value={formState.id} onChange={(e) => setFormState({...formState, id: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input id="edit-name" value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-poNo" className="text-right">
                    PO No.
                  </Label>
                  <Input id="edit-poNo" value={formState.poNo} onChange={(e) => setFormState({...formState, poNo: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-price" className="text-right">
                    Price
                  </Label>
                  <Input id="edit-price" type="number" value={formState.price} onChange={(e) => setFormState({...formState, price: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Textarea id="edit-description" value={formState.description} onChange={(e) => setFormState({...formState, description: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-dateOfEntry" className="text-right">
                    Date of Entry
                  </Label>
                  <Input id="edit-dateOfEntry" type="date" value={formState.dateOfEntry} onChange={(e) => setFormState({...formState, dateOfEntry: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-supplier" className="text-right">
                    Supplier
                  </Label>
                  <Input id="edit-supplier" value={formState.supplier} onChange={(e) => setFormState({...formState, supplier: e.target.value})} className="col-span-3" />
                </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add/Use Stock Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{stockAction === 'add' ? 'Add Stock' : 'Use Stock'}</DialogTitle>
            <DialogDescription>
              Item: {selectedItem?.name} (Current: {selectedItem?.quantity})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock-quantity" className="text-right">
                Quantity
              </Label>
              <Input id="stock-quantity" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleStockUpdate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View History Dialog */}
       <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Stock History - {selectedItem?.name}</DialogTitle>
          </DialogHeader>
            <div className="py-4 text-center text-muted-foreground">
                <p>History tracking is not yet implemented.</p>
                <p>This is where stock adjustments for this item would be shown.</p>
            </div>
          <DialogFooter>
            <Button onClick={() => setIsHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
