'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Edit, Redo, Trash2, Undo } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type InquiryFormState = {
  slNo: string;
  date: string;
  name: string;
  address: string;
  contactNo: string;
  kindAttn: string;
  sentVia: string;
  item: string;
  widthOd: string;
  thickness: string;
  length: string;
  quantity: string;
  weightPerNo: string;
  offerNo: string;
  ratePerPiece: string;
  ratePerKg: string;
  remarks: string;
  confirmedPoNo: string;
  reasons: string;
};

type InquiryRecord = {
  _id?: string;
  slNo: string;
  date: string;
  name: string;
  address: string;
  contactNo: string;
  kindAttn: string;
  sentVia: string;
  item: string;
  widthOd: number;
  thickness: number;
  length: number;
  quantity: number;
  weightPerNo: number;
  totalWeight: number;
  offerNo: string;
  ratePerPiece: number;
  ratePerKg: number;
  amount: number;
  remarks: string;
  confirmedPoNo: string;
  reasons: string;
  createdAt?: string;
  updatedAt?: string;
};

const createInitialState = (): InquiryFormState => ({
  slNo: `INQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`,
  date: '',
  name: '',
  address: '',
  contactNo: '',
  kindAttn: '',
  sentVia: '',
  item: '',
  widthOd: '',
  thickness: '',
  length: '',
  quantity: '',
  weightPerNo: '',
  offerNo: '',
  ratePerPiece: '',
  ratePerKg: '',
  remarks: '',
  confirmedPoNo: '',
  reasons: '',
});

const toFormState = (record: InquiryRecord): InquiryFormState => ({
  slNo: record.slNo,
  date: record.date,
  name: record.name,
  address: record.address,
  contactNo: record.contactNo ?? '',
  kindAttn: record.kindAttn ?? '',
  sentVia: record.sentVia,
  item: record.item,
  widthOd: record.widthOd ? String(record.widthOd) : '',
  thickness: record.thickness ? String(record.thickness) : '',
  length: record.length ? String(record.length) : '',
  quantity: record.quantity ? String(record.quantity) : '',
  weightPerNo: record.weightPerNo ? String(record.weightPerNo) : '',
  offerNo: record.offerNo,
  ratePerPiece: record.ratePerPiece ? String(record.ratePerPiece) : '',
  ratePerKg: record.ratePerKg ? String(record.ratePerKg) : '',
  remarks: record.remarks,
  confirmedPoNo: record.confirmedPoNo,
  reasons: record.reasons,
});

export default function InquiryPage() {
  const [formState, setFormState] = useState<InquiryFormState>(() => createInitialState());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [history, setHistory] = useState<InquiryRecord[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const quantityValue = useMemo(() => Number.parseFloat(formState.quantity) || 0, [formState.quantity]);
  const weightPerNoValue = useMemo(() => Number.parseFloat(formState.weightPerNo) || 0, [formState.weightPerNo]);
  const ratePerPieceValue = useMemo(() => Number.parseFloat(formState.ratePerPiece) || 0, [formState.ratePerPiece]);
  const ratePerKgValue = useMemo(() => {
    if (weightPerNoValue <= 0 || ratePerPieceValue <= 0) return 0;
    return ratePerPieceValue / weightPerNoValue;
  }, [ratePerPieceValue, weightPerNoValue]);

  const totalWeight = useMemo(() => quantityValue * weightPerNoValue, [quantityValue, weightPerNoValue]);
  const amount = useMemo(() => {
    if (ratePerPieceValue > 0) {
      return quantityValue * ratePerPieceValue;
    }
    return totalWeight * ratePerKgValue;
  }, [quantityValue, ratePerPieceValue, ratePerKgValue, totalWeight]);

  const updateField = (field: keyof InquiryFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const applySnapshot = (next: InquiryRecord[]) => {
    setHistory((prev) => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      nextHistory.push(next);
      setHistoryIndex(nextHistory.length - 1);
      return nextHistory;
    });
    setInquiries(next);
  };

  const syncInquiriesToServer = async (nextState: InquiryRecord[]) => {
    await Promise.all(
      inquiries.map((entry) =>
        fetch(`/api/inquiries/${encodeURIComponent(entry.slNo)}`, { method: 'DELETE' })
      )
    );
    const responses = await Promise.all(
      nextState.map((entry) => {
        const { _id, createdAt, updatedAt, ...payload } = entry;
        return fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      })
    );
    const saved = await Promise.all(
      responses.map((response) => response.json())
    );
    setInquiries(saved);
  };

  const handleUndo = async () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setIsSyncing(true);
      try {
        await syncInquiriesToServer(previousState);
        setHistoryIndex(historyIndex - 1);
      } catch (error) {
        console.error('Failed to undo:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleRedo = async () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setIsSyncing(true);
      try {
        await syncInquiriesToServer(nextState);
        setHistoryIndex(historyIndex + 1);
      } catch (error) {
        console.error('Failed to redo:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    if (history.length === 0) {
      setHistory([inquiries]);
      setHistoryIndex(0);
    }
  }, [history.length, inquiries]);

  useEffect(() => {
    let isMounted = true;
    const loadInquiries = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const response = await fetch('/api/inquiries');
        if (!response.ok) {
          throw new Error('Failed to fetch inquiries');
        }
        const data = await response.json();
        if (isMounted) {
          const normalized = Array.isArray(data)
            ? data.map((entry) => ({
                ...entry,
                contactNo: entry.contactNo ?? '',
                kindAttn: entry.kindAttn ?? '',
              }))
            : [];
          setInquiries(normalized);
          setHistory([normalized]);
          setHistoryIndex(0);
        }
      } catch (error) {
        console.error('Failed to load inquiries:', error);
        if (isMounted) {
          setLoadError('Failed to load inquiries.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadInquiries();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!formState.date) nextErrors.date = 'Date is required.';
    if (!formState.name.trim()) nextErrors.name = 'Name is required.';
    if (!formState.sentVia) nextErrors.sentVia = 'Sent Via is required.';
    if (!formState.item.trim()) nextErrors.item = 'Item is required.';
    if (quantityValue <= 0) nextErrors.quantity = 'Quantity must be greater than 0.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaveError('');
    const payload = {
      ...formState,
      contactNo: formState.contactNo ?? '',
      kindAttn: formState.kindAttn ?? '',
      widthOd: Number.parseFloat(formState.widthOd) || 0,
      thickness: Number.parseFloat(formState.thickness) || 0,
      length: Number.parseFloat(formState.length) || 0,
      quantity: quantityValue,
      weightPerNo: weightPerNoValue,
      totalWeight,
      ratePerPiece: ratePerPieceValue,
      ratePerKg: ratePerKgValue,
      amount,
    };

    try {
      const response = await fetch(
        dialogMode === 'edit' && editingId ? `/api/inquiries/${encodeURIComponent(editingId)}` : '/api/inquiries',
        {
          method: dialogMode === 'edit' ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to save inquiry');
      }
      const saved = await response.json();
      const normalizedSaved = {
        ...saved,
        contactNo: saved?.contactNo ?? '',
        kindAttn: saved?.kindAttn ?? '',
      };
      if (dialogMode === 'edit' && editingId) {
        const nextList = inquiries.map((entry) =>
          entry.slNo === editingId ? normalizedSaved : entry
        );
        applySnapshot(nextList);
      } else {
        const nextList = [normalizedSaved, ...inquiries];
        applySnapshot(nextList);
      }
      setIsDialogOpen(false);
      setFormState(createInitialState());
      setErrors({});
      setEditingId(null);
      setDialogMode('add');
    } catch (error) {
      console.error('Failed to save inquiry:', error);
      setSaveError(
        error instanceof Error ? error.message : 'Failed to save inquiry.'
      );
    }
  };

  const handleReset = () => {
    setFormState(createInitialState());
    setErrors({});
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setErrors({});
      setSaveError('');
      setDialogMode('add');
    }
  };

  const handleAddInquiry = () => {
    setDialogMode('add');
    setEditingId(null);
    setFormState(createInitialState());
    setErrors({});
    setSaveError('');
    setIsDialogOpen(true);
  };

  const handleEditInquiry = (entry: InquiryRecord) => {
    setDialogMode('edit');
    setEditingId(entry.slNo);
    setFormState(toFormState(entry));
    setErrors({});
    setSaveError('');
    setIsDialogOpen(true);
  };

  const handleDeleteInquiry = async (entry: InquiryRecord) => {
    try {
      const response = await fetch(`/api/inquiries/${encodeURIComponent(entry.slNo)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to delete inquiry');
      }
      const nextList = inquiries.filter((item) => item.slNo !== entry.slNo);
      applySnapshot(nextList);
    } catch (error) {
      console.error('Failed to delete inquiry:', error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-3xl font-semibold">Inquiry</h1>
          <p className="text-muted-foreground">
            Capture and manage customer inquiries with detailed requirements.
          </p>
        </div>

        <Card className="border border-border">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Inquiry Register</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add inquiries and review them in the list below.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0 || isSyncing}>
                <Undo className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Undo</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1 || isSyncing}>
                <Redo className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Redo</span>
              </Button>
              <Button size="sm" onClick={handleAddInquiry}>Add Inquiry</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Loading inquiries...
              </div>
            ) : loadError ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-destructive">
                {loadError}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No inquiries added yet. Click "Add Inquiry" to create the first entry.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Sl. No.</TableHead>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Address</TableHead>
                      <TableHead className="whitespace-nowrap">Contact No.</TableHead>
                      <TableHead className="whitespace-nowrap">Kind Attn.</TableHead>
                      <TableHead className="whitespace-nowrap">Sent Via</TableHead>
                      <TableHead className="whitespace-nowrap">Item</TableHead>
                      <TableHead className="whitespace-nowrap">Width / OD (mm.)</TableHead>
                      <TableHead className="whitespace-nowrap">Thickness (mm.)</TableHead>
                      <TableHead className="whitespace-nowrap">Length (mm.)</TableHead>
                      <TableHead className="whitespace-nowrap">Quantity</TableHead>
                      <TableHead className="whitespace-nowrap">Weight / No.</TableHead>
                      <TableHead className="whitespace-nowrap">Total Weight</TableHead>
                      <TableHead className="whitespace-nowrap">Offer No.</TableHead>
                      <TableHead className="whitespace-nowrap">Rate / Piece</TableHead>
                      <TableHead className="whitespace-nowrap">Rate / Kg</TableHead>
                      <TableHead className="whitespace-nowrap">Amount</TableHead>
                      <TableHead className="whitespace-nowrap">Remarks</TableHead>
                      <TableHead className="whitespace-nowrap">Confirmed P.O. No.</TableHead>
                      <TableHead className="whitespace-nowrap">Reasons</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((entry) => (
                      <TableRow key={entry.slNo}>
                        <TableCell className="whitespace-nowrap font-medium">{entry.slNo}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.date}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.name}</TableCell>
                        <TableCell className="min-w-[200px] whitespace-nowrap">{entry.address || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.contactNo || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.kindAttn || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.sentVia}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.item}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.widthOd || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.thickness || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.length || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.quantity}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.weightPerNo || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.totalWeight.toFixed(2)}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.offerNo || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.ratePerPiece || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.ratePerKg || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.amount.toFixed(2)}</TableCell>
                        <TableCell className="min-w-[200px] whitespace-nowrap">{entry.remarks || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.confirmedPoNo || '-'}</TableCell>
                        <TableCell className="min-w-[200px] whitespace-nowrap">{entry.reasons || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditInquiry(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteInquiry(entry)}
                            >
                              <Trash2 className="h-4 w-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Edit Inquiry' : 'New Inquiry'}</DialogTitle>
          </DialogHeader>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            {saveError && (
              <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {saveError}
              </div>
            )}
            <div className="rounded-lg border border-border p-4">
              <h2 className="text-sm font-semibold text-foreground">General Details</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="slNo">Sl. No.</Label>
                  <Input id="slNo" value={formState.slNo} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formState.date}
                    onChange={(event) => updateField('date', event.target.value)}
                    aria-invalid={Boolean(errors.date)}
                  />
                  {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                </div>
                <div className="space-y-2 md:col-span-2 xl:col-span-2">
                  <Label htmlFor="name">Name of Enquirer</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sentVia">Sent Via</Label>
                  <Select
                    value={formState.sentVia}
                    onValueChange={(value) => updateField('sentVia', value)}
                  >
                    <SelectTrigger id="sentVia" aria-invalid={Boolean(errors.sentVia)}>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="In-Person">In-Person</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sentVia && <p className="text-sm text-destructive">{errors.sentVia}</p>}
                </div>
                <div className="space-y-2 md:col-span-2 xl:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formState.address}
                    onChange={(event) => updateField('address', event.target.value)}
                    className="min-h-[90px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNo">Contact No</Label>
                  <Input
                    id="contactNo"
                    value={formState.contactNo}
                    onChange={(event) => updateField('contactNo', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kindAttn">Kind Attn.</Label>
                  <Input
                    id="kindAttn"
                    value={formState.kindAttn}
                    onChange={(event) => updateField('kindAttn', event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h2 className="text-sm font-semibold text-foreground">Description</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="item">Item</Label>
                  <Input
                    id="item"
                    value={formState.item}
                    onChange={(event) => updateField('item', event.target.value)}
                    aria-invalid={Boolean(errors.item)}
                  />
                  {errors.item && <p className="text-sm text-destructive">{errors.item}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="widthOd">Width / OD (mm.)</Label>
                  <Input
                    id="widthOd"
                    type="number"
                    inputMode="decimal"
                    value={formState.widthOd}
                    onChange={(event) => updateField('widthOd', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thickness">Thickness (mm.)</Label>
                  <Input
                    id="thickness"
                    type="number"
                    inputMode="decimal"
                    value={formState.thickness}
                    onChange={(event) => updateField('thickness', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Length (mm.)</Label>
                  <Input
                    id="length"
                    type="number"
                    inputMode="decimal"
                    value={formState.length}
                    onChange={(event) => updateField('length', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    inputMode="numeric"
                    value={formState.quantity}
                    onChange={(event) => updateField('quantity', event.target.value)}
                    aria-invalid={Boolean(errors.quantity)}
                  />
                  {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightPerNo">Weight per No.</Label>
                  <Input
                    id="weightPerNo"
                    type="number"
                    inputMode="decimal"
                    value={formState.weightPerNo}
                    onChange={(event) => updateField('weightPerNo', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalWeight">Total Weight</Label>
                  <Input
                    id="totalWeight"
                    value={Number.isFinite(totalWeight) ? totalWeight.toFixed(2) : ''}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h2 className="text-sm font-semibold text-foreground">Offer & Pricing</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="offerNo">Offer No.</Label>
                  <Input
                    id="offerNo"
                    value={formState.offerNo}
                    onChange={(event) => updateField('offerNo', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ratePerPiece">Rate Per Piece</Label>
                  <Input
                    id="ratePerPiece"
                    type="number"
                    inputMode="decimal"
                    value={formState.ratePerPiece}
                    onChange={(event) => updateField('ratePerPiece', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ratePerKg">Rate Per Kg</Label>
                  <Input
                    id="ratePerKg"
                    value={Number.isFinite(ratePerKgValue) && ratePerKgValue > 0 ? ratePerKgValue.toFixed(4) : ''}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    value={Number.isFinite(amount) ? amount.toFixed(2) : ''}
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    Rate Per Kg is derived from Rate Per Piece ÷ Weight per No.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h2 className="text-sm font-semibold text-foreground">Additional Information</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formState.remarks}
                    onChange={(event) => updateField('remarks', event.target.value)}
                    className="min-h-[90px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmedPoNo">Confirmed P.O. No.</Label>
                  <Input
                    id="confirmedPoNo"
                    value={formState.confirmedPoNo}
                    onChange={(event) => updateField('confirmedPoNo', event.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="reasons">Reasons for Not Getting Order</Label>
                  <Textarea
                    id="reasons"
                    value={formState.reasons}
                    onChange={(event) => updateField('reasons', event.target.value)}
                    className="min-h-[90px]"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit">{dialogMode === 'edit' ? 'Save Changes' : 'Submit'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

