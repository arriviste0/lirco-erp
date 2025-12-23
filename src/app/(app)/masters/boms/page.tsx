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
import { FilePlus2, MoreHorizontal, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const boms = [
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
            <Button>
              <FilePlus2 className="mr-2" />
              New BOM
            </Button>
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
    </div>
  );
}
