'use client';

<<<<<<< HEAD
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
import { FilePlus2, MoreHorizontal, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type BOM = {
  id: string;
  productName: string;
  description: string;
  itemCount: number;
  createdAt: string;
};

const initialBoms: BOM[] = [
  {
    id: 'BOM-PA-01',
    productName: 'Product Alpha',
    description: 'BOM for the standard Product Alpha',
    itemCount: 5,
    createdAt: '2024-08-01',
  },
  {
    id: 'BOM-PB-01',
    productName: 'Product Beta',
    description: 'BOM for the high-end Product Beta',
    itemCount: 8,
    createdAt: '2024-08-15',
  },
];

export default function BomsPage() {
  const [boms, setBoms] = useState<BOM[]>(initialBoms);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const defaultNewBom: BOM = {
    id: `BOM-NEW-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    productName: '',
    description: '',
    itemCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };
  const [formState, setFormState] = useState<BOM>(defaultNewBom);

  const handleAddBom = () => {
    setBoms([...boms, formState]);
    setFormState(defaultNewBom);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-semibold">
          Bill of Materials (BOMs)
        </h1>
        <p className="text-muted-foreground">
          Manage the components for your manufactured items.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>BOM Master</CardTitle>
              <CardDescription>
                A list of all Bills of Materials.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setFormState(defaultNewBom)}>
                  <FilePlus2 className="mr-2" />
                  New BOM
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Bill of Materials</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new BOM.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="productName" className="text-right">
                      Product Name
                    </Label>
                    <Input id="productName" value={formState.productName} onChange={(e) => setFormState({...formState, productName: e.target.value})} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea id="description" value={formState.description} onChange={(e) => setFormState({...formState, description: e.target.value})} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="itemCount" className="text-right">
                      Item Count
                    </Label>
                    <Input id="itemCount" type="number" value={formState.itemCount} onChange={(e) => setFormState({...formState, itemCount: parseInt(e.target.value) || 0})} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" onClick={handleAddBom}>Create BOM</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search BOMs..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BOM ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Item Count</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boms.map((bom) => (
                <TableRow key={bom.id}>
                  <TableCell className="font-medium">{bom.id}</TableCell>
                  <TableCell>{bom.productName}</TableCell>
                  <TableCell>{bom.description}</TableCell>
                  <TableCell>{bom.itemCount}</TableCell>
                  <TableCell>{bom.createdAt}</TableCell>
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
                        <DropdownMenuItem>Edit BOM</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
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
=======
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BomsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-3xl font-semibold">
            Bill of Materials (BOMs)
          </h1>
          <p className="text-muted-foreground">
            Manage the components for your manufactured items.
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md md:max-w-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl md:text-3xl">COMING SOON</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground text-sm md:text-base">
                This feature is under development and will be available soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
>>>>>>> main
    </div>
  );
}
