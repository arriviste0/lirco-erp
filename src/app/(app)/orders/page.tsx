'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ConfirmedOrder = {
  id: string;
  offerNo: string;
  partyName: string;
  offerDate?: string;
  refNo?: string;
  refDate?: string;
  poNumber: string;
  poDate: string;
  costSheetNos: string[];
  createdAt: string;
};

type InquiryRecord = {
  _id?: string;
  slNo: string;
  offerNo?: string;
  name?: string;
  address?: string;
  item: string;
  widthOd?: number;
  thickness?: number;
  length?: number;
  quantity?: number;
};

type PackingListItem = {
  id: string;
  itemType: 'CE' | 'DE' | 'COM';
  design: string;
  width: string;
  thickness: string;
  length: string;
  qty: string;
  drawing: string;
  daysRequired: string;
  angleWeldType: 'd' | 'b';
  ceExtended: string;
  customCrates: string;
  deType: 'p' | 's' | 'f';
  wedgeOption: '0' | '1' | '2';
  wedgeType1: string;
  wedgeType2: string;
  joinPcs: 'y' | 'n';
  spikeType: string;
  spikeQty: string;
  stripWidth: string;
  maxCrateWidth: string;
};

const ordersStorageKey = 'lirco-confirmed-orders';
const packingListDefaultItems: PackingListItem[] = [];
const designOptions = [
  'elex',
  'elex_cut',
  'elex_weld',
  'bhel',
  'thermax',
  'thermax_497',
  'sitson',
  'bhel_387',
];
const wedgeOptions = ['1', '2', '3', '4', '5', '6'];
const spikeOptions = ['1', '2', '3', '4', '5', '6'];

const readOrders = (): ConfirmedOrder[] => {
  try {
    const stored = localStorage.getItem(ordersStorageKey);
    return stored ? (JSON.parse(stored) as ConfirmedOrder[]) : [];
  } catch (error) {
    console.error('Failed to read orders', error);
    return [];
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<ConfirmedOrder[]>([]);
  const [lastDeleted, setLastDeleted] = useState<{
    order: ConfirmedOrder;
    index: number;
  } | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [packingListOrder, setPackingListOrder] = useState<ConfirmedOrder | null>(
    null
  );
  const [isPackingListOpen, setIsPackingListOpen] = useState(false);
  const [packingListForm, setPackingListForm] = useState({
    piNo: '',
    packingListNo: '',
    packingListDate: new Date().toISOString().slice(0, 10),
    partyName: '',
    addressLine1: '',
    gstNumber: '',
  });
  const [packingListItems, setPackingListItems] = useState<PackingListItem[]>(
    packingListDefaultItems
  );
  const [packingListTrailer, setPackingListTrailer] = useState({
    bedWidth: '2500',
    bedHeight: '2400',
    separateLoad: 'n' as 'y' | 'n',
  });
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [inquiryCustomers, setInquiryCustomers] = useState<
    Array<{ name: string; address: string }>
  >([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  useEffect(() => {
    setOrders(readOrders());
  }, []);

  const persistOrders = (next: ConfirmedOrder[]) => {
    setOrders(next);
    try {
      localStorage.setItem(ordersStorageKey, JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save orders', error);
    }
  };

  const handleDelete = (orderId: string) => {
    const deleteIndex = orders.findIndex((order) => order.id === orderId);
    if (deleteIndex === -1) {
      return;
    }
    setLastDeleted({ order: orders[deleteIndex], index: deleteIndex });
    const next = orders.filter((order) => order.id !== orderId);
    persistOrders(next);
  };

  const handleUndo = () => {
    if (!lastDeleted) {
      return;
    }
    const next = [...orders];
    next.splice(lastDeleted.index, 0, lastDeleted.order);
    persistOrders(next);
    setLastDeleted(null);
  };

  const handleAction = async (
    type: 'packing-list' | 'work-order' | 'proforma-invoice',
    order: ConfirmedOrder,
    input?: Record<string, unknown>
  ) => {
    setActionError('');
    setActionLoadingId(`${type}-${order.id}`);
    try {
      const response = await fetch(`/api/orders/documents/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, input }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to generate document');
      }
      const data = await response.json();
      if (data?.downloadUrl) {
        window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Missing download URL');
      }
    } catch (error) {
      console.error('Document generation failed', error);
      setActionError(
        error instanceof Error ? error.message : 'Failed to generate document'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const openPackingListDialog = (order: ConfirmedOrder) => {
    setPackingListOrder(order);
    setPackingListForm((prev) => ({
      ...prev,
      piNo: order.offerNo || prev.piNo,
      partyName: order.partyName || prev.partyName,
    }));
    setSelectedCustomer('');
    setIsPackingListOpen(true);
  };

  const loadPackingListInquiries = async (order: ConfirmedOrder) => {
    setIsLoadingInquiries(true);
    try {
      const response = await fetch('/api/inquiries');
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as InquiryRecord[];
      const customerMap = new Map<string, string>();
      data.forEach((entry) => {
        if (entry?.name) {
          customerMap.set(entry.name, entry.address ?? '');
        }
      });
      const customerList = Array.from(customerMap.entries()).map(
        ([name, address]) => ({ name, address })
      );
      setInquiryCustomers(customerList);
      const matching = data.filter((entry) => entry.offerNo === order.offerNo);
      if (matching.length === 0) {
        return;
      }
      const mapped = matching.map((entry) => ({
        id: `item-${entry.slNo}`,
        itemType: entry.item?.toLowerCase().includes('de') ? 'DE' : 'CE',
        design: 'elex',
        width: String(entry.widthOd ?? ''),
        thickness: String(entry.thickness ?? ''),
        length: String(entry.length ?? ''),
        qty: String(entry.quantity ?? ''),
        drawing: '',
        daysRequired: '1',
        angleWeldType: 'd',
        ceExtended: '',
        customCrates: '',
        deType: 'p',
        wedgeOption: '0',
        wedgeType1: '1',
        wedgeType2: '1',
        joinPcs: 'n',
        spikeType: '1',
        spikeQty: '',
        stripWidth: '',
        maxCrateWidth: '1200',
      }));
      setPackingListItems(mapped);
    } catch (error) {
      console.error('Failed to load inquiries for packing list', error);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  useEffect(() => {
    if (isPackingListOpen && packingListOrder) {
      loadPackingListInquiries(packingListOrder);
    }
  }, [isPackingListOpen, packingListOrder]);

  const updatePackingItem = (id: string, patch: Partial<PackingListItem>) => {
    setPackingListItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleCustomerSelect = (value: string) => {
    setSelectedCustomer(value);
    const match = inquiryCustomers.find((customer) => customer.name === value);
    setPackingListForm((prev) => ({
      ...prev,
      partyName: value,
      addressLine1: match?.address ?? prev.addressLine1,
    }));
  };

  const addPackingItem = () => {
    setPackingListItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        itemType: 'CE',
        design: 'elex',
        width: '',
        thickness: '',
        length: '',
        qty: '',
        drawing: '',
        daysRequired: '1',
        angleWeldType: 'd',
        ceExtended: '',
        customCrates: '',
        deType: 'p',
        wedgeOption: '0',
        wedgeType1: '1',
        wedgeType2: '1',
        joinPcs: 'n',
        spikeType: '1',
        spikeQty: '',
        stripWidth: '',
        maxCrateWidth: '1200',
      },
    ]);
  };

  const removePackingItem = (id: string) => {
    setPackingListItems((prev) => prev.filter((item) => item.id !== id));
  };

  const parseCustomCrates = (value: string) => {
    if (!value.trim()) {
      return [];
    }
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const normalized = entry.replace(/x/gi, ' ');
        const [profiles, count] = normalized.split(/\s+/).map((part) => Number(part));
        if (!profiles || !count) {
          return null;
        }
        return { profilesPerCrate: profiles, noOfCrates: count };
      })
      .filter(Boolean);
  };

  const handlePackingListSubmit = async () => {
    if (!packingListOrder) {
      return;
    }
    const items = packingListItems.map((item) => ({
      itemType: item.itemType,
      design: item.design,
      width: Number(item.width || 0),
      thickness: Number(item.thickness || 0),
      length: Number(item.length || 0),
      qty: Number(item.qty || 0),
      drawing: item.drawing,
      daysRequired: Number(item.daysRequired || 1),
      angleWeldType: item.angleWeldType,
      ceExtended: item.ceExtended ? Number(item.ceExtended) : null,
      customCrates: parseCustomCrates(item.customCrates),
      deType: item.deType,
      wedgeOption: Number(item.wedgeOption || 0),
      wedgeType1: Number(item.wedgeType1 || 1),
      wedgeType2: Number(item.wedgeType2 || 1),
      joinPcs: item.joinPcs,
      spikeType: Number(item.spikeType || 1),
      spikeQty: Number(item.spikeQty || 0),
      stripWidth: Number(item.stripWidth || 0),
      maxCrateWidth: Number(item.maxCrateWidth || 1200),
    }));
    const input = {
      packingList: packingListForm,
      items,
      trailer: packingListTrailer,
    };
    setIsPackingListOpen(false);
    await handleAction('packing-list', packingListOrder, input);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-headline text-3xl font-semibold">Orders</h1>
              <p className="text-muted-foreground">
                Confirmed orders from quotations.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!lastDeleted}
            >
              Undo
            </Button>
          </div>
        </div>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Confirmed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {actionError ? (
              <div className="mb-4 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {actionError}
              </div>
            ) : null}
            {orders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No confirmed orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Offer No.</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>PO No.</TableHead>
                      <TableHead>PO Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.offerNo}
                        </TableCell>
                        <TableCell>{order.partyName || '-'}</TableCell>
                        <TableCell>{order.offerDate || '-'}</TableCell>
                        <TableCell>{order.poNumber || '-'}</TableCell>
                        <TableCell>{order.poDate || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(order.id)}
                            >
                              Delete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPackingListDialog(order)}
                              disabled={actionLoadingId === `packing-list-${order.id}`}
                            >
                              {actionLoadingId === `packing-list-${order.id}`
                                ? 'Generating...'
                                : 'Packing List'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('work-order', order)}
                              disabled={actionLoadingId === `work-order-${order.id}`}
                            >
                              {actionLoadingId === `work-order-${order.id}`
                                ? 'Generating...'
                                : 'Work Order'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('proforma-invoice', order)}
                              disabled={actionLoadingId === `proforma-invoice-${order.id}`}
                            >
                              {actionLoadingId === `proforma-invoice-${order.id}`
                                ? 'Generating...'
                                : 'Proforma Invoice'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPackingListOpen} onOpenChange={setIsPackingListOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Packing List Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 pr-2">
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Packing List Header
              </h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="piNo">PI No</Label>
                  <Input
                    id="piNo"
                    value={packingListForm.piNo}
                    onChange={(event) =>
                      setPackingListForm((prev) => ({
                        ...prev,
                        piNo: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="packingListNo">Packing List No</Label>
                  <Input
                    id="packingListNo"
                    value={packingListForm.packingListNo}
                    onChange={(event) =>
                      setPackingListForm((prev) => ({
                        ...prev,
                        packingListNo: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="packingListDate">Packing List Date</Label>
                  <Input
                    id="packingListDate"
                    type="date"
                    value={packingListForm.packingListDate}
                    onChange={(event) =>
                      setPackingListForm((prev) => ({
                        ...prev,
                        packingListDate: event.target.value,
                      }))
                    }
                  />
                </div>
              <div className="space-y-1">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={packingListForm.gstNumber}
                    onChange={(event) =>
                      setPackingListForm((prev) => ({
                        ...prev,
                        gstNumber: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="customerSelect">Select Customer</Label>
                  <Select value={selectedCustomer} onValueChange={handleCustomerSelect}>
                    <SelectTrigger id="customerSelect">
                      <SelectValue placeholder="Pick from inquiries" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiryCustomers.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          No inquiry customers found
                        </SelectItem>
                      ) : (
                        inquiryCustomers.map((customer) => (
                          <SelectItem key={customer.name} value={customer.name}>
                            {customer.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="partyName">Party Name</Label>
                  <Input
                    id="partyName"
                    value={packingListForm.partyName}
                    onChange={(event) =>
                      setPackingListForm((prev) => ({
                        ...prev,
                        partyName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="addressLine1">Address</Label>
                  <Textarea
                    id="addressLine1"
                    value={packingListForm.addressLine1}
                    onChange={(event) =>
                      setPackingListForm((prev) => ({
                        ...prev,
                        addressLine1: event.target.value,
                      }))
                    }
                    className="min-h-[90px]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Trailer</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="bedWidth">Trailer Bed Width (mm)</Label>
                  <Input
                    id="bedWidth"
                    value={packingListTrailer.bedWidth}
                    onChange={(event) =>
                      setPackingListTrailer((prev) => ({
                        ...prev,
                        bedWidth: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bedHeight">Trailer Height (mm)</Label>
                  <Input
                    id="bedHeight"
                    value={packingListTrailer.bedHeight}
                    onChange={(event) =>
                      setPackingListTrailer((prev) => ({
                        ...prev,
                        bedHeight: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="separateLoad">Separate load by profile length?</Label>
                  <Select
                    value={packingListTrailer.separateLoad}
                    onValueChange={(value) =>
                      setPackingListTrailer((prev) => ({
                        ...prev,
                        separateLoad: value as 'y' | 'n',
                      }))
                    }
                  >
                    <SelectTrigger id="separateLoad">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="n">No</SelectItem>
                      <SelectItem value="y">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-muted-foreground">
                  Items
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addPackingItem}>
                  Add item
                </Button>
              </div>
              {isLoadingInquiries ? (
                <div className="rounded-md border border-border p-3 text-sm text-muted-foreground">
                  Loading inquiry items...
                </div>
              ) : null}
              {packingListItems.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                  No items added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {packingListItems.map((item) => (
                    <div key={item.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Item {item.id}</div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePackingItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label>Item Type</Label>
                          <Select
                            value={item.itemType}
                            onValueChange={(value) =>
                              updatePackingItem(item.id, {
                                itemType: value as PackingListItem['itemType'],
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CE">CE</SelectItem>
                              <SelectItem value="DE">DE</SelectItem>
                              <SelectItem value="COM">COM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Design</Label>
                          <Select
                            value={item.design}
                            onValueChange={(value) =>
                              updatePackingItem(item.id, { design: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {designOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Width/OD (mm)</Label>
                          <Input
                            value={item.width}
                            onChange={(event) =>
                              updatePackingItem(item.id, { width: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Thickness (mm)</Label>
                          <Input
                            value={item.thickness}
                            onChange={(event) =>
                              updatePackingItem(item.id, { thickness: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Length (mm)</Label>
                          <Input
                            value={item.length}
                            onChange={(event) =>
                              updatePackingItem(item.id, { length: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Quantity</Label>
                          <Input
                            value={item.qty}
                            onChange={(event) =>
                              updatePackingItem(item.id, { qty: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Drawing No</Label>
                          <Input
                            value={item.drawing}
                            onChange={(event) =>
                              updatePackingItem(item.id, { drawing: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Days Required</Label>
                          <Input
                            value={item.daysRequired}
                            onChange={(event) =>
                              updatePackingItem(item.id, { daysRequired: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Angle Weld Type</Label>
                          <Select
                            value={item.angleWeldType}
                            onValueChange={(value) =>
                              updatePackingItem(item.id, {
                                angleWeldType: value as PackingListItem['angleWeldType'],
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="d">Diagonal</SelectItem>
                              <SelectItem value="b">Box</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>CE Extended (optional)</Label>
                          <Input
                            value={item.ceExtended}
                            onChange={(event) =>
                              updatePackingItem(item.id, { ceExtended: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label>Custom Crates (profiles x crates, comma separated)</Label>
                          <Input
                            value={item.customCrates}
                            onChange={(event) =>
                              updatePackingItem(item.id, { customCrates: event.target.value })
                            }
                            placeholder="42 5, 40 1"
                          />
                        </div>
                      </div>

                      {item.itemType === 'DE' ? (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="space-y-1">
                            <Label>DE Type</Label>
                            <Select
                              value={item.deType}
                              onValueChange={(value) =>
                                updatePackingItem(item.id, {
                                  deType: value as PackingListItem['deType'],
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="p">Pipe</SelectItem>
                                <SelectItem value="s">Strips</SelectItem>
                                <SelectItem value="f">Formed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Wedge Option</Label>
                            <Select
                              value={item.wedgeOption}
                              onValueChange={(value) =>
                                updatePackingItem(item.id, {
                                  wedgeOption: value as PackingListItem['wedgeOption'],
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">None</SelectItem>
                                <SelectItem value="1">One side</SelectItem>
                                <SelectItem value="2">Both sides</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Wedge Type 1</Label>
                            <Select
                              value={item.wedgeType1}
                              onValueChange={(value) =>
                                updatePackingItem(item.id, { wedgeType1: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {wedgeOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {item.wedgeOption === '2' ? (
                            <div className="space-y-1">
                              <Label>Wedge Type 2</Label>
                              <Select
                                value={item.wedgeType2}
                                onValueChange={(value) =>
                                  updatePackingItem(item.id, { wedgeType2: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {wedgeOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : null}
                          <div className="space-y-1">
                            <Label>Joining Pieces</Label>
                            <Select
                              value={item.joinPcs}
                              onValueChange={(value) =>
                                updatePackingItem(item.id, {
                                  joinPcs: value as PackingListItem['joinPcs'],
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="n">No</SelectItem>
                                <SelectItem value="y">Yes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Spike/Nail Type</Label>
                            <Select
                              value={item.spikeType}
                              onValueChange={(value) =>
                                updatePackingItem(item.id, { spikeType: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {spikeOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Spike Qty per Pc</Label>
                            <Input
                              value={item.spikeQty}
                              onChange={(event) =>
                                updatePackingItem(item.id, { spikeQty: event.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Strip Width</Label>
                            <Input
                              value={item.stripWidth}
                              onChange={(event) =>
                                updatePackingItem(item.id, { stripWidth: event.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Max Crate Width</Label>
                            <Input
                              value={item.maxCrateWidth}
                              onChange={(event) =>
                                updatePackingItem(item.id, {
                                  maxCrateWidth: event.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPackingListOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePackingListSubmit}>Generate Packing List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
