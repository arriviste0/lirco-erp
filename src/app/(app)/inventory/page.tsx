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
  DollarSign,
  AlertTriangle,
  ArchiveX,
  FileDown,
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useInventory } from '@/lib/inventory-context';
import { InventoryStatus } from '@/lib/inventory-data';

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
  history?: any[];
};

const getStatus = (quantity: number): InventoryItem['status'] => {
  if (quantity === 0) return 'Out of Stock';
  if (quantity < 50) return 'Low Stock';
  return 'In Stock';
};

const mapToInventoryItem = (status: InventoryStatus): InventoryItem => ({
  id: status.id,
  name: status.material,
  poNo: status.pi,
  description: status.size,
  quantity: status.presentStock,
  status: getStatus(status.presentStock),
  price: status.ratePc,
  dateOfEntry: status.orderDate,
  supplier: status.supplier,
  history: status.history,
});

export default function InventoryPage() {
  const { inventoryStatuses } = useInventory();
  const inventoryItems = inventoryStatuses.map(mapToInventoryItem);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Inventory Report', 20, 10);
    let y = 30;
    inventoryItems.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`ID: ${item.id}`, 20, y);
      doc.text(`Name: ${item.name}`, 20, y + 5);
      doc.text(`PO No.: ${item.poNo}`, 20, y + 10);
      doc.text(`Description: ${item.description}`, 20, y + 15);
      doc.text(`Quantity: ${item.quantity}`, 20, y + 20);
      doc.text(`Status: ${item.status}`, 20, y + 25);
      doc.text(`Price: ${item.price}`, 20, y + 30);
      doc.text(`Date of Entry: ${item.dateOfEntry || ''}`, 20, y + 35);
      doc.text(`Supplier: ${item.supplier || ''}`, 20, y + 40);
      y += 50;
    });
    doc.save('inventory.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(inventoryItems.map(item => ({
      ID: item.id,
      Name: item.name,
      'PO No.': item.poNo,
      Description: item.description,
      Quantity: item.quantity,
      Status: item.status,
      Price: item.price,
      'Date of Entry': item.dateOfEntry || '',
      Supplier: item.supplier || '',
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, 'inventory.xlsx');
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
    <div className="mx-auto max-w-7xl">
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={exportToExcel}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
