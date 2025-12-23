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
import { MoreHorizontal, UserPlus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Party = {
  id: string;
  name: string;
  type: 'Customer' | 'Supplier';
  contact: string;
  email: string;
};

const initialParties: Party[] = [
  {
    id: 'CUST-001',
    name: 'Innovate Inc.',
    type: 'Customer',
    contact: 'Alice Johnson',
    email: 'alice.j@innovate.com',
  },
  {
    id: 'SUPP-001',
    name: 'Global Corp.',
    type: 'Supplier',
    contact: 'Charlie Brown',
    email: 'charlie.b@globalcorp.com',
  },
  {
    id: 'CUST-002',
    name: 'Tech Solutions Ltd.',
    type: 'Customer',
    contact: 'Bob Williams',
    email: 'bob.w@techsolutions.com',
  },
];

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>(initialParties);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const defaultNewParty: Party = {
    id: '',
    name: '',
    type: 'Customer',
    contact: '',
    email: '',
  };
  const [formState, setFormState] = useState<Party>(defaultNewParty);

  const handleAddParty = () => {
    const newId = `${formState.type.substring(0, 4).toUpperCase()}-${String(Math.floor(Math.random() * 1000) + 3).padStart(3, '0')}`;
    setParties([...parties, { ...formState, id: newId }]);
    setFormState(defaultNewParty);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-semibold">Party Master</h1>
        <p className="text-muted-foreground">
          Manage your customers, suppliers, and other business parties.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Parties</CardTitle>
              <CardDescription>
                A list of all customers and suppliers.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setFormState(defaultNewParty)}>
                  <UserPlus className="mr-2" />
                  New Party
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Party</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new party.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select value={formState.type} onValueChange={(value: Party['type']) => setFormState({...formState, type: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Customer">Customer</SelectItem>
                        <SelectItem value="Supplier">Supplier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact" className="text-right">
                      Contact Person
                    </Label>
                    <Input id="contact" value={formState.contact} onChange={(e) => setFormState({...formState, contact: e.target.value})} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" type="email" value={formState.email} onChange={(e) => setFormState({...formState, email: e.target.value})} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" onClick={handleAddParty}>Create Party</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
           <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search parties..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Party ID</TableHead>
                <TableHead>Party Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parties.map((party) => (
                <TableRow key={party.id}>
                  <TableCell className="font-medium">{party.id}</TableCell>
                  <TableCell>{party.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        party.type === 'Customer' ? 'default' : 'secondary'
                      }
                    >
                      {party.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{party.contact}</TableCell>
                  <TableCell>{party.email}</TableCell>
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
                        <DropdownMenuItem>Edit Party</DropdownMenuItem>
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
