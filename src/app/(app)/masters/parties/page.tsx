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

const parties = [
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
            <Button>
              <UserPlus className="mr-2" />
              New Party
            </Button>
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
