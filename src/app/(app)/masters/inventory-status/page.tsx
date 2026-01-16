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
import { FilePlus2, MoreHorizontal, Search, Edit, Trash2, FileDown, Undo, Boxes, Package, AlertTriangle, ArchiveX, History, MinusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { InventoryStatus, HistoryEntry } from '@/lib/inventory-data';
import { useInventory } from '@/lib/inventory-context';


export default function InventoryStatusPage() {
  const { inventoryStatuses, refreshInventoryStatuses } = useInventory();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [isUseStockDialogOpen, setIsUseStockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryStatus | null>(null);
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockDate, setStockDate] = useState('');
  const [stockError, setStockError] = useState('');
  const [history, setHistory] = useState<InventoryStatus[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const defaultNewItem: InventoryStatus = {
    id: `INV-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    material: '',
    size: '',
    pi: '',
    totalRequired: 0,
    unit: '',
    presentStock: 0,
    requireToOrder: 0,
    alreadyOrdered: 0,
    orderDate: '',
    orderQuantityBL: 0,
    supplier: '',
    ratePc: 0,
    history: [],
  };
  const [formState, setFormState] = useState<InventoryStatus>(defaultNewItem);

  const handleAddItem = async () => {
    try {
      saveToHistory(inventoryStatuses);
      const newItem: InventoryStatus = {
        ...formState,
        history: [{
          date: new Date().toISOString(),
          action: 'Added',
          quantityChange: 0,
          newQuantity: 0,
        }],
      };
      const response = await fetch('/api/inventory-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (response.ok) {
        await refreshInventoryStatuses();
        setFormState(defaultNewItem);
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem) return;
    try {
      saveToHistory(inventoryStatuses);
      const presentStockChanged = formState.presentStock !== selectedItem.presentStock;
      const quantityChange = presentStockChanged ? formState.presentStock - selectedItem.presentStock : 0;
      const updatedItem = {
        ...formState,
        history: [
          ...(selectedItem.history || []),
          {
            date: new Date().toISOString(),
            action: presentStockChanged ? 'Updated Present Stock' : 'Edited Details',
            quantityChange,
            newQuantity: presentStockChanged ? formState.presentStock : 0,
          },
        ],
      };
      const response = await fetch(`/api/inventory-status/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      if (response.ok) {
        await refreshInventoryStatuses();
        setIsEditDialogOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to edit item:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    try {
      saveToHistory(inventoryStatuses);
      const response = await fetch(`/api/inventory-status/${selectedItem.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await refreshInventoryStatuses();
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };


  const handleOpenEditDialog = (item: InventoryStatus) => {
    setSelectedItem(item);
    setFormState(item);
    setIsEditDialogOpen(true);
  };

  const handleViewHistory = (item: InventoryStatus) => {
    setSelectedItem(item);
    setIsHistoryDialogOpen(true);
  };

  const handleOpenAddStockDialog = (item: InventoryStatus) => {
    setSelectedItem(item);
    setStockQuantity(0);
    setStockDate('');
    setStockError('');
    setIsAddStockDialogOpen(true);
  };

  const handleOpenUseStockDialog = (item: InventoryStatus) => {
    setSelectedItem(item);
    setStockQuantity(0);
    setStockDate('');
    setStockError('');
    setIsUseStockDialogOpen(true);
  };

  const handleAddStock = async () => {
    if (!selectedItem) return;

    setStockError('');

    if (stockQuantity <= 0) {
      setStockError('Quantity must be greater than 0.');
      return;
    }

    try {
      saveToHistory(inventoryStatuses);
      const updatedItem = {
        ...selectedItem,
        presentStock: selectedItem.presentStock + stockQuantity,
        orderQuantityBL: Math.max(0, selectedItem.alreadyOrdered - stockQuantity),
        requireToOrder: Math.max(0, selectedItem.requireToOrder - stockQuantity),
        history: [
          ...(selectedItem.history || []),
          {
            date: stockDate ? new Date(stockDate).toISOString() : new Date().toISOString(),
            action: 'Added Stock',
            quantityChange: stockQuantity,
            newQuantity: selectedItem.presentStock + stockQuantity,
          },
        ],
      };
      const response = await fetch(`/api/inventory-status/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      if (response.ok) {
        await refreshInventoryStatuses();
        setIsAddStockDialogOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to add stock:', error);
    }
  };

  const handleUseStock = async () => {
    if (!selectedItem) return;

    setStockError('');

    if (stockQuantity <= 0) {
      setStockError('Quantity must be greater than 0.');
      return;
    }

    if (selectedItem.presentStock < stockQuantity) {
      setStockError('Cannot use more stock than available.');
      return;
    }

    try {
      saveToHistory(inventoryStatuses);
      const updatedItem = {
        ...selectedItem,
        presentStock: selectedItem.presentStock - stockQuantity,
        history: [
          ...(selectedItem.history || []),
          {
            date: stockDate ? new Date(stockDate).toISOString() : new Date().toISOString(),
            action: 'Used Stock',
            quantityChange: -stockQuantity,
            newQuantity: selectedItem.presentStock - stockQuantity,
          },
        ],
      };
      const response = await fetch(`/api/inventory-status/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      if (response.ok) {
        await refreshInventoryStatuses();
        setIsUseStockDialogOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to use stock:', error);
    }
  };

  const saveToHistory = (state: InventoryStatus[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...state]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = async () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      // Update database with previous state
      try {
        // Delete all current items
        await Promise.all(inventoryStatuses.map(item =>
          fetch(`/api/inventory-status/${item.id}`, { method: 'DELETE' })
        ));
        // Add back the previous state
        await Promise.all(previousState.map(item =>
          fetch('/api/inventory-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })
        ));
        await refreshInventoryStatuses();
      } catch (error) {
        console.error('Failed to undo:', error);
      }
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Inventory Status Report', 20, 10);
    let y = 30;
    inventoryStatuses.forEach((item, index) => {
      if (y > 250) { // New page if needed
        doc.addPage();
        y = 20;
      }
      doc.text(`ID: ${item.id}`, 20, y);
      doc.text(`Material: ${item.material}`, 20, y + 5);
      doc.text(`Size: ${item.size}`, 20, y + 10);
      doc.text(`PI: ${item.pi}`, 20, y + 15);
      doc.text(`Total Required: ${item.totalRequired}`, 20, y + 20);
      doc.text(`Unit: ${item.unit}`, 20, y + 25);
      doc.text(`Present Stock: ${item.presentStock}`, 20, y + 30);
      doc.text(`Require to Order: ${item.requireToOrder}`, 20, y + 35);
      doc.text(`Already Ordered: ${item.alreadyOrdered}`, 20, y + 40);
      doc.text(`Order Date: ${item.orderDate}`, 20, y + 45);
      doc.text(`Order Quantity B/L: ${item.orderQuantityBL}`, 20, y + 50);
      doc.text(`Supplier: ${item.supplier}`, 20, y + 55);
      doc.text(`Rate/Pc: ${item.ratePc}`, 20, y + 60);
      y += 70;
    });
    doc.save('inventory-status.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(inventoryStatuses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Status');
    XLSX.writeFile(workbook, 'inventory-status.xlsx');
  };

  const totalPresentStock = inventoryStatuses.reduce((acc, item) => acc + item.presentStock, 0);
  const totalAlreadyOrdered = inventoryStatuses.reduce((acc, item) => acc + item.alreadyOrdered, 0);
  const totalRequireToOrder = inventoryStatuses.reduce((acc, item) => acc + item.requireToOrder, 0);
  const totalPendingStock = inventoryStatuses.reduce((acc, item) => acc + (item.totalRequired - item.presentStock - item.alreadyOrdered), 0);

  useEffect(() => {
    if (inventoryStatuses.length > 0 && history.length === 0) {
      setHistory([inventoryStatuses]);
      setHistoryIndex(0);
    }
  }, [inventoryStatuses]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-semibold">
          Inventory Status
        </h1>
        <p className="text-muted-foreground">
          Manage inventory status and ordering details.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Present Stock</CardTitle>
            <Boxes className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPresentStock}</div>
            <p className="text-xs text-muted-foreground">
              Current stock across all items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Already Ordered</CardTitle>
            <Package className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlreadyOrdered}</div>
            <p className="text-xs text-muted-foreground">
              Stock already on order
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Require to Order</CardTitle>
            <AlertTriangle className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequireToOrder}</div>
            <p className="text-xs text-muted-foreground">
              Additional stock needed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending Stock</CardTitle>
            <ArchiveX className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingStock}</div>
            <p className="text-xs text-muted-foreground">
              Stock still pending delivery
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle>Inventory Status Master</CardTitle>
              <CardDescription>
                A list of all inventory status items.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
               <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
                 <Undo className="h-4 w-4" />
                 <span className="hidden sm:inline ml-2">Undo</span>
               </Button>
               <Button variant="outline" size="sm" onClick={exportToPDF}>
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Export PDF</span>
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Export Excel</span>
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setFormState(defaultNewItem)}>
                    <FilePlus2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">New Item</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Inventory Status Item</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the new inventory status item.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="material" className="sm:text-right">Material</Label>
                      <Input id="material" value={formState.material} onChange={(e) => setFormState({...formState, material: e.target.value})} className="sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="size" className="sm:text-right">Size</Label>
                      <Input id="size" value={formState.size} onChange={(e) => setFormState({...formState, size: e.target.value})} className="sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="pi" className="sm:text-right">PI</Label>
                      <Input id="pi" value={formState.pi} onChange={(e) => setFormState({...formState, pi: e.target.value})} className="sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="totalRequired" className="sm:text-right">Total Required</Label>
                      <Input id="totalRequired" type="number" value={formState.totalRequired} onChange={(e) => setFormState({...formState, totalRequired: parseFloat(e.target.value) || 0})} className="sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="unit" className="sm:text-right">Unit</Label>
                      <Input id="unit" value={formState.unit} onChange={(e) => setFormState({...formState, unit: e.target.value})} className="sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="presentStock" className="sm:text-right">Present Stock</Label>
                      <Input id="presentStock" type="number" value={formState.presentStock} onChange={(e) => setFormState({...formState, presentStock: parseFloat(e.target.value) || 0})} className="sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="requireToOrder" className="sm:text-right">Require to Order</Label>
                      <Input id="requireToOrder" type="number" value={formState.requireToOrder} onChange={(e) => setFormState({...formState, requireToOrder: parseFloat(e.target.value) || 0})} className="sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="alreadyOrdered" className="sm:text-right">Already Ordered</Label>
                      <Input id="alreadyOrdered" type="number" value={formState.alreadyOrdered} onChange={(e) => setFormState({...formState, alreadyOrdered: parseFloat(e.target.value) || 0})} className="sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="orderDate" className="sm:text-right">Order Date</Label>
                      <Input id="orderDate" type="date" value={formState.orderDate} onChange={(e) => setFormState({...formState, orderDate: e.target.value})} className="sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="orderQuantityBL" className="sm:text-right">Order Quantity B/L</Label>
                      <Input id="orderQuantityBL" type="number" value={formState.orderQuantityBL} onChange={(e) => setFormState({...formState, orderQuantityBL: parseFloat(e.target.value) || 0})} className="sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="supplier" className="sm:text-right">Supplier</Label>
                      <Input id="supplier" value={formState.supplier} onChange={(e) => setFormState({...formState, supplier: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="ratePc" className="sm:text-right">Rate/Pc</Label>
                      <Input id="ratePc" type="number" step="0.01" value={formState.ratePc} onChange={(e) => setFormState({...formState, ratePc: parseFloat(e.target.value) || 0})} className="sm:col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleAddItem}>Create Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Inventory Status Item - {selectedItem?.material}</DialogTitle>
                <DialogDescription>
                  Update the item details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-material" className="sm:text-right">Material</Label>
                  <Input id="edit-material" value={formState.material} onChange={(e) => setFormState({...formState, material: e.target.value})} className="sm:col-span-3" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-size" className="sm:text-right">Size</Label>
                  <Input id="edit-size" value={formState.size} onChange={(e) => setFormState({...formState, size: e.target.value})} className="sm:col-span-3" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-pi" className="sm:text-right">PI</Label>
                  <Input id="edit-pi" value={formState.pi} onChange={(e) => setFormState({...formState, pi: e.target.value})} className="sm:col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-totalRequired" className="text-right">Total Required</Label>
                  <Input id="edit-totalRequired" type="number" value={formState.totalRequired} onChange={(e) => setFormState({...formState, totalRequired: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-unit" className="text-right">Unit</Label>
                  <Input id="edit-unit" value={formState.unit} onChange={(e) => setFormState({...formState, unit: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-presentStock" className="text-right">Present Stock</Label>
                  <Input id="edit-presentStock" type="number" value={formState.presentStock} onChange={(e) => setFormState({...formState, presentStock: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-requireToOrder" className="text-right">Require to Order</Label>
                  <Input id="edit-requireToOrder" type="number" value={formState.requireToOrder} onChange={(e) => setFormState({...formState, requireToOrder: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-alreadyOrdered" className="text-right">Already Ordered</Label>
                  <Input id="edit-alreadyOrdered" type="number" value={formState.alreadyOrdered} onChange={(e) => setFormState({...formState, alreadyOrdered: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-orderDate" className="text-right">Order Date</Label>
                  <Input id="edit-orderDate" type="date" value={formState.orderDate} onChange={(e) => setFormState({...formState, orderDate: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-orderQuantityBL" className="text-right">Order Quantity B/L</Label>
                  <Input id="edit-orderQuantityBL" type="number" value={formState.orderQuantityBL} onChange={(e) => setFormState({...formState, orderQuantityBL: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-supplier" className="text-right">Supplier</Label>
                  <Input id="edit-supplier" value={formState.supplier} onChange={(e) => setFormState({...formState, supplier: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-ratePc" className="text-right">Rate/Pc</Label>
                  <Input id="edit-ratePc" type="number" step="0.01" value={formState.ratePc} onChange={(e) => setFormState({...formState, ratePc: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="button" onClick={handleEditItem}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Inventory Status Item</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete item "{selectedItem?.material}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteItem}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search inventory items..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>PI</TableHead>
                <TableHead>Total Required</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Present Stock</TableHead>
                <TableHead>Require to Order</TableHead>
                <TableHead>Already Ordered</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Order Quantity B/L</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Rate/Pc</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryStatuses.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.material}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.pi}</TableCell>
                  <TableCell>{item.totalRequired}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.presentStock}</TableCell>
                  <TableCell>{item.requireToOrder}</TableCell>
                  <TableCell>{item.alreadyOrdered}</TableCell>
                  <TableCell>{item.orderDate}</TableCell>
                  <TableCell>{item.orderQuantityBL}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>{item.ratePc}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu open={dropdownStates[item.id] || false} onOpenChange={(open) => setDropdownStates(prev => ({...prev, [item.id]: open}))}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setDropdownStates(prev => ({...prev, [item.id]: false})); handleOpenAddStockDialog(item); }}>
                          <FilePlus2 className="mr-2 h-4 w-4" />
                          Add Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setDropdownStates(prev => ({...prev, [item.id]: false})); handleOpenUseStockDialog(item); }}>
                          <MinusCircle className="mr-2 h-4 w-4" />
                          Use Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setDropdownStates(prev => ({...prev, [item.id]: false})); handleOpenEditDialog(item); }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Item
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setDropdownStates(prev => ({...prev, [item.id]: false})); handleViewHistory(item); }}>
                          <History className="mr-2 h-4 w-4" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setDropdownStates(prev => ({...prev, [item.id]: false})); setSelectedItem(item); setIsDeleteDialogOpen(true); }} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>History - {selectedItem?.material}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedItem?.history && selectedItem.history.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {selectedItem.history.slice().reverse().map((entry, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {entry.quantityChange > 0 ? '+' : ''}{entry.quantityChange}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          New Qty: {entry.newQuantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-center text-muted-foreground">No history available.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Stock Dialog */}
      <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>
              Item: {selectedItem?.material} (Present Stock: {selectedItem?.presentStock}, Already Ordered: {selectedItem?.alreadyOrdered}, Require to Order: {selectedItem?.requireToOrder})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-stock-quantity" className="text-right">
                Quantity
              </Label>
              <Input id="add-stock-quantity" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-stock-date" className="text-right">
                Date
              </Label>
              <Input id="add-stock-date" type="date" value={stockDate} onChange={(e) => setStockDate(e.target.value)} className="col-span-3" />
            </div>
            {stockError && (
              <div className="text-sm text-destructive">
                {stockError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStockDialogOpen(false)}>Cancel</Button>
            <DialogClose asChild>
              <Button type="button" onClick={handleAddStock}>Add Stock</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Use Stock Dialog */}
      <Dialog open={isUseStockDialogOpen} onOpenChange={setIsUseStockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Use Stock</DialogTitle>
            <DialogDescription>
              Item: {selectedItem?.material} (Current Stock: {selectedItem?.presentStock})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="use-stock-quantity" className="text-right">
                Quantity
              </Label>
              <Input id="use-stock-quantity" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="use-stock-date" className="text-right">
                Date
              </Label>
              <Input id="use-stock-date" type="date" value={stockDate} onChange={(e) => setStockDate(e.target.value)} className="col-span-3" />
            </div>
            {stockError && (
              <div className="text-sm text-destructive">
                {stockError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUseStockDialogOpen(false)}>Cancel</Button>
            <DialogClose asChild>
              <Button type="button" onClick={handleUseStock}>Use Stock</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
