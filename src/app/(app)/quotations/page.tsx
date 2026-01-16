<<<<<<< HEAD
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
  Send,
  FilePlus2,
  CheckCircle,
  FileText,
  DollarSign,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

type Quotation = {
  id: string;
  customer: string;
  amount: number;
  status: 'Sent' | 'Draft' | 'Accepted' | 'Rejected';
  date: string;
};

const initialQuotations: Quotation[] = [
  {
    id: 'Q-12345',
    customer: 'Innovate Inc.',
    amount: 5400.0,
    status: 'Sent',
    date: '2024-09-12',
  },
  {
    id: 'Q-12346',
    customer: 'Tech Solutions Ltd.',
    amount: 12800.0,
    status: 'Draft',
    date: '2024-09-15',
  },
  {
    id: 'Q-12347',
    customer: 'Global Corp.',
    amount: 2150.0,
    status: 'Accepted',
    date: '2024-09-10',
  },
];

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const defaultNewQuote = {
    id: `Q-${Math.floor(Math.random() * 10000) + 12348}`,
    customer: '',
    amount: 0,
    status: 'Draft' as const,
    date: new Date().toISOString().split('T')[0],
  }
  const [formState, setFormState] = useState<Quotation>(defaultNewQuote);

  const handleAddQuotation = () => {
    setQuotations([...quotations, formState]);
    setFormState(defaultNewQuote);
    setIsAddDialogOpen(false);
  };
  
  const openQuotations = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length;
  const acceptedQuotations = quotations.filter(q => q.status === 'Accepted').length;
  const draftQuotations = quotations.filter(q => q.status === 'Draft').length;
  const totalQuotedValue = quotations.reduce((sum, q) => sum + q.amount, 0);


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-semibold">Quotations</h1>
        <p className="text-muted-foreground">
          Create and manage quotations for your customers.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Quotations
            </CardTitle>
            <Send className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openQuotations}</div>
            <p className="text-xs text-muted-foreground">
              Quotations awaiting response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Draft Quotations
            </CardTitle>
            <FileText className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftQuotations}</div>
            <p className="text-xs text-muted-foreground">
              Quotations not yet sent
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Accepted Quotations
            </CardTitle>
            <CheckCircle className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedQuotations}</div>
            <p className="text-xs text-muted-foreground">
              This financial year
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Quoted Value
            </CardTitle>
            <DollarSign className="size-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalQuotedValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Value of all quotations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Quotations</CardTitle>
            <CardDescription>
              A list of your most recent quotations.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormState(defaultNewQuote)}>
                <FilePlus2 className="mr-2" />
                New Quotation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Quotation</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new quotation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customer" className="text-right">
                    Customer
                  </Label>
                  <Input id="customer" value={formState.customer} onChange={(e) => setFormState({...formState, customer: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input id="date" type="date" value={formState.date} onChange={(e) => setFormState({...formState, date: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input id="amount" type="number" value={formState.amount} onChange={(e) => setFormState({...formState, amount: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddQuotation}>Save Quotation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.id}</TableCell>
                  <TableCell>{quote.customer}</TableCell>
                  <TableCell>{quote.date}</TableCell>
                  <TableCell className="text-right">${quote.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        quote.status === 'Accepted'
                          ? 'default'
                          : quote.status === 'Sent'
                          ? 'secondary'
                          : quote.status === 'Draft' ? 'outline' : 'destructive'
                      }
                    >
                      {quote.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
=======

'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  ArrowDown,
  ArrowUp,
  FileDown,
  FileSpreadsheet,
  ImagePlus,
  Plus,
  Printer,
  Save,
  Trash2,
} from 'lucide-react';
import headerBanner from './assets/header.jpg';
import footerBanner from './assets/Footer.jpeg';
import signatureStamp from './assets/Dr C L Patel Sign.png';

type QuotationRow = {
  id: string;
  product: string;
  dimensions: string;
  qty: string;
  rate: string;
};

type TextStyle = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  color: string;
  textAlign: CSSProperties['textAlign'];
  lineHeight: string;
  letterSpacing: string;
};

type TextStyleConfig = {
  global: TextStyle;
  blocks: Partial<Record<TextStyleBlock, Partial<TextStyle>>>;
};

type TextStyleBlock =
  | 'party'
  | 'offer'
  | 'intro'
  | 'priceTitle'
  | 'table'
  | 'termsTitle'
  | 'termsBody'
  | 'footer';

type QuotationPayload = {
  offerNo: string;
  offerDate: string;
  refNo: string;
  refDate: string;
  partyName: string;
  partyAddress: string;
  contactNo: string;
  kindAttn: string;
  dearSir: string;
  priceTitle: string;
  termsTitle: string;
  footerCompany: string;
  footerName: string;
  notes: string;
  terms: string;
  styles: TextStyleConfig;
  costSheetNos: string[];
  rows: QuotationRow[];
  assets: {
    logo?: string;
    stamp?: string;
    signature?: string;
    headerBanner?: string;
    footerBanner?: string;
  };
};

type CostSheetVariant = {
  id: string;
  rows?: Array<{
    type?: string;
    spec?: string;
    width?: string;
    thk?: string;
    length?: string;
    qty?: string;
    ratePerUnit?: string;
  }>;
};

type CostSheetRecord = {
  _id: string;
  costSheetNo: string;
  sheetDate?: string;
  data?: {
    jobSetup?: {
      product?: string;
      totalQty?: string;
    };
    variants?: CostSheetVariant[];
    activeVariantId?: string;
    summary?: {
      totals?: {
        totalQty?: number;
      };
      costSummary?: {
        sellingRatePerPiece?: number;
      };
    };
  };
};

type InquiryRecord = {
  _id?: string;
  slNo: string;
  name: string;
  address: string;
  contactNo?: string;
  kindAttn?: string;
  offerNo?: string;
  widthOd?: number;
  thickness?: number;
  length?: number;
};

type QuotationRecord = QuotationPayload & {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
};

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

type QuotationSnapshot = {
  formState: QuotationPayload;
  quotationId: string | null;
  selectedCostSheets: string[];
};

const defaultNotes =
  'Thank you for the chance to provide an offer for the above mentioned enquiry. We are pleased to submit a commercial offer for your kind consideration.';
const defaultTerms = `1. The above prices given are on Ex works - Dehgam, Gandhinagar basis.
2. GST & other duties and taxes - if applicable will be extra, at actual.
3. Standard steel crate packing, as per our design, is inclusive in the above prices. Any changes in the design may incur extra cost.
4. The Collecting  Electrodes will be as per your standard drawing. Manufacturing will start after getting approvals from your end.
5. Arrangement of transportation and transit insurance are in your scope.
6. Rust Preventive Oil - T A - 506 II (Bonita Make) will be applied and is inclusive in the above prices.
7. The delivery period will be within 30 days starting on the day your Purchase Order was technically and financially cleared.
8. Payment Terms - An advance payment of 30% along with tech. & comm. cleared PO and rest against PI after inspection prior to despatch.
9. The final inspection shall be at our works, prior to despatch. Any third party inspection - if required, will be in your scope.
10. This offer will remain valid till 15 days from the date of issuance of this quotation.
11. After completion of manufacturing, please lift the material within 30 days. Carrying costs will be applicable, thereafter.

We hope the above proposal meets your requirements. Please get in touch with us if you have any more queries. Awaiting your esteemed Purchase Order.`;

const defaultTextStyle: TextStyle = {
  fontFamily: 'Calibri',
  fontSize: '11',
  fontWeight: '400',
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#111827',
  textAlign: 'left',
  lineHeight: '1.4',
  letterSpacing: '0',
};

const defaultAssets = {
  headerBanner: headerBanner.src,
  footerBanner: footerBanner.src,
  stamp: signatureStamp.src,
};

const ordersStorageKey = 'lirco-confirmed-orders';

const cloneFormState = (value: QuotationPayload): QuotationPayload =>
  JSON.parse(JSON.stringify(value));

const fontOptions = [
  'Calibri',
  'Arial',
  'Tahoma',
  'Times New Roman',
  'Georgia',
  'Verdana',
];

const fontFamilyMap: Record<string, string> = {
  Calibri: 'Calibri, Arial, sans-serif',
  Arial: 'Arial, sans-serif',
  Tahoma: 'Tahoma, sans-serif',
  'Times New Roman': '"Times New Roman", Times, serif',
  Georgia: 'Georgia, serif',
  Verdana: 'Verdana, sans-serif',
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').trim();

const textStyleBlocks: { value: TextStyleBlock; label: string }[] = [
  { value: 'party', label: 'Party Details' },
  { value: 'offer', label: 'Offer Details' },
  { value: 'intro', label: 'Dear Sir Paragraph' },
  { value: 'priceTitle', label: 'Price Title' },
  { value: 'table', label: 'Price Table' },
  { value: 'termsTitle', label: 'Terms Title' },
  { value: 'termsBody', label: 'Terms Body' },
  { value: 'footer', label: 'Footer Block' },
];

const createRowId = () => `row-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const toDisplayValue = (value?: string | null) => value ?? '';

const productLabelMap: Record<string, string> = {
  ce: 'Collecting Electrode',
  de: 'Discharge Electrode',
  fde: 'Formed Discharge Electrode',
};

const getProductLabel = (value?: string) => {
  if (!value) return '';
  const normalized = value.trim().toLowerCase();
  return productLabelMap[normalized] ?? value;
};

const normalizeMatchValue = (value?: string) =>
  (value ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

const ensureBoldHtml = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/<\s*strong\b/i.test(trimmed)) return trimmed;
  return `<strong>${trimmed}</strong>`;
};

const mergeTextStyles = (base: TextStyle, override?: Partial<TextStyle>): TextStyle => ({
  ...base,
  ...(override ?? {}),
});

const toCssTextStyle = (style: TextStyle): CSSProperties => ({
  fontFamily: fontFamilyMap[style.fontFamily] ?? style.fontFamily,
  fontSize: style.fontSize ? `${style.fontSize}pt` : undefined,
  fontWeight: style.fontWeight,
  fontStyle: style.fontStyle,
  textDecoration: style.textDecoration,
  color: style.color,
  textAlign: style.textAlign,
  lineHeight: style.lineHeight,
  letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
});

const normalizeStyleConfig = (value?: Partial<TextStyleConfig> | null): TextStyleConfig => ({
  global: mergeTextStyles(defaultTextStyle, value?.global),
  blocks: value?.blocks ?? {},
});

const formatDimensions = (row: {
  width?: string;
  thk?: string;
  length?: string;
}) => {
  const parts = [row.width, row.thk, row.length].filter((part) => part && part.trim());
  return parts.join(' X ');
};

const buildRowsFromCostSheet = (
  record: CostSheetRecord | undefined,
  inquiry?: InquiryRecord
) => {
  if (!record?.data?.variants?.length) return [];
  const activeVariant =
    record.data.variants.find((variant) => variant.id === record.data?.activeVariantId) ??
    record.data.variants[0];
  if (!activeVariant) return [];
  const summaryQty =
    record.data.summary?.totals?.totalQty ??
    Number.parseFloat(record.data.jobSetup?.totalQty ?? '') ||
    undefined;
  const summaryRate = record.data.summary?.costSummary?.sellingRatePerPiece;
  const firstSpec =
    activeVariant.rows?.find((row) => row.spec && row.spec.trim())?.spec?.trim() ?? '';
  const productLabel = getProductLabel(record.data.jobSetup?.product) || 'Product';
  const productLines = [productLabel];
  if (firstSpec) {
    productLines.push(`MOC - ${firstSpec}`);
  }
  const inquiryDimensions = inquiry
    ? `${inquiry.widthOd || ''} X ${inquiry.thickness || ''} X ${inquiry.length || ''}`.replace(
        /(^\s*X\s*|\s*X\s*$)/g,
        ''
      )
    : '';
  return [
    {
      id: createRowId(),
      product: productLines.join('\n'),
      dimensions: inquiryDimensions,
      qty: summaryQty ? String(summaryQty) : '',
      rate: summaryRate ? String(summaryRate) : '',
    },
  ];
};

export default function QuotationsPage() {
  const initialFormState: QuotationPayload = {
    offerNo: '',
    offerDate: new Date().toISOString().slice(0, 10),
    refNo: '',
    refDate: '',
    partyName: '',
    partyAddress: '',
    contactNo: '',
    kindAttn: '',
    dearSir: '<strong>Dear Sir,</strong>',
    priceTitle: '<strong>I. PRICE -</strong>',
    termsTitle: '<strong>II. TERMS & CONDITIONS -</strong>',
    footerCompany: 'For LIRCO ENGINEERING PVT. LTD.',
    footerName: '<strong>Dr. C L PATEL</strong>',
    notes: defaultNotes,
    terms: defaultTerms,
    styles: normalizeStyleConfig(),
    costSheetNos: [],
    rows: [],
    assets: { ...defaultAssets },
  };
  const printRef = useRef<HTMLDivElement | null>(null);
  const [costSheets, setCostSheets] = useState<CostSheetRecord[]>([]);
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCostSheet, setSelectedCostSheet] = useState('');
  const [selectedCostSheets, setSelectedCostSheets] = useState<string[]>([]);
  const [formState, setFormState] = useState<QuotationPayload>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [activeStyleBlock, setActiveStyleBlock] =
    useState<TextStyleBlock>('party');
  const activeEditableRef = useRef<HTMLElement | null>(null);
  const [activeEditableKey, setActiveEditableKey] = useState<
    keyof QuotationPayload | null
  >(null);
  const [selectionFont, setSelectionFont] = useState(defaultTextStyle.fontFamily);
  const [selectionSize, setSelectionSize] = useState(defaultTextStyle.fontSize);
  const [selectionColor, setSelectionColor] = useState(defaultTextStyle.color);
  const [openEditorSections, setOpenEditorSections] = useState<string[]>([]);
  const router = useRouter();
  const lastSnapshotRef = useRef<QuotationSnapshot>({
    formState: cloneFormState(initialFormState),
    quotationId: null,
    selectedCostSheets: [],
  });

  useEffect(() => {
    const loadCostSheets = async () => {
      try {
        const response = await fetch('/api/cost-sheets');
        if (!response.ok) return;
        const data = await response.json();
        if (!Array.isArray(data)) return;
        const normalized = data.map((item) => ({
          _id: String(item?._id ?? ''),
          costSheetNo: String(item?.costSheetNo ?? '').trim(),
          sheetDate: item?.sheetDate,
          data: item?.data ?? {},
        }));
        setCostSheets(normalized.filter((entry) => entry.costSheetNo && entry._id));
      } catch (error) {
        console.error('Failed to load cost sheets', error);
      }
    };

    const loadQuotations = async () => {
      try {
        const response = await fetch('/api/quotations');
        if (!response.ok) return;
        const data = await response.json();
        if (!Array.isArray(data)) return;
        const normalized = data.map((item) => ({
          _id: String(item?._id ?? ''),
          offerNo: String(item?.offerNo ?? '').trim(),
          offerDate: String(item?.offerDate ?? ''),
          refNo: String(item?.refNo ?? ''),
          refDate: String(item?.refDate ?? ''),
          partyName: String(item?.partyName ?? ''),
          partyAddress: String(item?.partyAddress ?? ''),
          contactNo: String(item?.contactNo ?? ''),
          kindAttn: String(item?.kindAttn ?? ''),
          dearSir: String(item?.dearSir ?? '<strong>Dear Sir,</strong>'),
          priceTitle: String(item?.priceTitle ?? '<strong>I. PRICE -</strong>'),
          termsTitle: String(item?.termsTitle ?? '<strong>II. TERMS & CONDITIONS -</strong>'),
          footerCompany: String(item?.footerCompany ?? 'For LIRCO ENGINEERING PVT. LTD.'),
          footerName: String(item?.footerName ?? '<strong>Dr. C L PATEL</strong>'),
          notes: String(item?.notes ?? ''),
          terms: String(item?.terms ?? ''),
          styles: normalizeStyleConfig(item?.styles),
          costSheetNos: Array.isArray(item?.costSheetNos) ? item.costSheetNos : [],
          rows: Array.isArray(item?.rows) ? item.rows : [],
          assets: item?.assets ?? {},
          createdAt: item?.createdAt,
          updatedAt: item?.updatedAt,
        }));
        setQuotations(normalized.filter((entry) => entry.offerNo && entry._id));
      } catch (error) {
        console.error('Failed to load quotations', error);
      }
    };

    const loadInquiries = async () => {
      try {
        const response = await fetch('/api/inquiries');
        if (!response.ok) return;
        const data = await response.json();
        if (!Array.isArray(data)) return;
        const normalized = data.map((item) => ({
          _id: String(item?._id ?? ''),
          slNo: String(item?.slNo ?? ''),
          name: String(item?.name ?? ''),
          address: String(item?.address ?? ''),
          contactNo: String(item?.contactNo ?? ''),
          kindAttn: String(item?.kindAttn ?? ''),
          offerNo: String(item?.offerNo ?? ''),
          widthOd: Number(item?.widthOd ?? 0),
          thickness: Number(item?.thickness ?? 0),
          length: Number(item?.length ?? 0),
        }));
        setInquiries(normalized);
      } catch (error) {
        console.error('Failed to load inquiries', error);
      }
    };

    loadCostSheets();
    loadQuotations();
    loadInquiries();
  }, []);

  const activeRows = useMemo(() => formState.rows, [formState.rows]);
  const resolvedStyles = useMemo(() => {
    const global = toCssTextStyle(formState.styles.global);
    const block = (key: TextStyleBlock) =>
      toCssTextStyle(
        mergeTextStyles(formState.styles.global, formState.styles.blocks[key])
      );
    return {
      global,
      party: block('party'),
      offer: block('offer'),
      intro: block('intro'),
      priceTitle: block('priceTitle'),
      table: block('table'),
      termsTitle: block('termsTitle'),
      termsBody: block('termsBody'),
      footer: block('footer'),
    };
  }, [formState.styles]);

  const updateFormField = (field: keyof QuotationPayload, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const updateGlobalStyle = (field: keyof TextStyle, value: string) => {
    setFormState((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        global: { ...prev.styles.global, [field]: value },
      },
    }));
  };

  const updateBlockStyle = (
    block: TextStyleBlock,
    field: keyof TextStyle,
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        blocks: {
          ...prev.styles.blocks,
          [block]: { ...(prev.styles.blocks[block] ?? {}), [field]: value },
        },
      },
    }));
  };

  const setSnapshot = (
    nextFormState: QuotationPayload,
    nextQuotationId: string | null,
    nextSelectedCostSheets: string[]
  ) => {
    lastSnapshotRef.current = {
      formState: cloneFormState(nextFormState),
      quotationId: nextQuotationId,
      selectedCostSheets: [...nextSelectedCostSheets],
    };
  };

  const mapFontSizeToExec = (size: string) => {
    const numeric = Number.parseFloat(size);
    if (numeric <= 8) return '1';
    if (numeric <= 10) return '2';
    if (numeric <= 12) return '3';
    if (numeric <= 14) return '4';
    if (numeric <= 18) return '5';
    if (numeric <= 24) return '6';
    return '7';
  };

  const applySelectionCommand = (command: string, value?: string) => {
    if (!activeEditableRef.current) return;
    activeEditableRef.current.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    if (activeEditableKey) {
      const html = activeEditableRef.current.innerHTML;
      setFormState((prev) => ({ ...prev, [activeEditableKey]: html }));
    }
  };

  const EditableText = ({
    html,
    onChange,
    className,
    style,
    placeholder,
    editableKey,
    as = 'div',
  }: {
    html: string;
    onChange: (value: string) => void;
    className?: string;
    style?: CSSProperties;
    placeholder?: string;
    editableKey: keyof QuotationPayload;
    as?: 'div' | 'span';
  }) => {
    const Tag = as;
    return (
      <Tag
        className={className}
        style={style}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={(event) => {
          activeEditableRef.current = event.currentTarget;
          setActiveEditableKey(editableKey);
        }}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: html || '' }}
      />
    );
  };

  const updateAsset = (key: keyof QuotationPayload['assets'], file?: File | null) => {
    if (!file) {
      setFormState((prev) => ({
        ...prev,
        assets: { ...prev.assets, [key]: undefined },
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormState((prev) => ({
        ...prev,
        assets: { ...prev.assets, [key]: result },
      }));
    };
    reader.readAsDataURL(file);
  };

  const addRow = () => {
    setFormState((prev) => ({
      ...prev,
      rows: [
        ...prev.rows,
        { id: createRowId(), product: '', dimensions: '', qty: '', rate: '' },
      ],
    }));
  };

  const updateRow = (rowId: string, field: keyof QuotationRow, value: string) => {
    setFormState((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    }));
  };

  const removeRow = (rowId: string) => {
    setFormState((prev) => ({
      ...prev,
      rows: prev.rows.filter((row) => row.id !== rowId),
    }));
  };

  const moveRow = (rowId: string, direction: 'up' | 'down') => {
    setFormState((prev) => {
      const index = prev.rows.findIndex((row) => row.id === rowId);
      if (index < 0) return prev;
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.rows.length) return prev;
      const nextRows = [...prev.rows];
      const [moved] = nextRows.splice(index, 1);
      nextRows.splice(nextIndex, 0, moved);
      return { ...prev, rows: nextRows };
    });
  };

  const handleGenerateQuotation = () => {
    if (!selectedCostSheets.length) return;
    const nextRows = selectedCostSheets.flatMap((sheetNo) => {
      const sheet = costSheets.find((entry) => entry.costSheetNo === sheetNo);
      const inquiryId = sheet?.data?.jobSetup?.projectRef?.trim() ?? '';
      const inquiryMatch = inquiryId
        ? inquiries.find(
            (entry) => normalizeMatchValue(entry.slNo) === normalizeMatchValue(inquiryId)
          )
        : undefined;
      return buildRowsFromCostSheet(sheet, inquiryMatch);
    });
    const firstSheet = costSheets.find(
      (entry) => entry.costSheetNo === selectedCostSheets[0]
    );
    const inquiryId = firstSheet?.data?.jobSetup?.projectRef?.trim() ?? '';
    const inquiryById = inquiryId
      ? inquiries.find(
          (entry) => normalizeMatchValue(entry.slNo) === normalizeMatchValue(inquiryId)
        )
      : undefined;
    const customerName = firstSheet?.data?.jobSetup?.customerName?.trim() ?? '';
    const normalizedCustomer = normalizeMatchValue(customerName);
    const inquiryByName = normalizedCustomer
      ? inquiries.find(
          (entry) => normalizeMatchValue(entry.name) === normalizedCustomer
        ) ??
        inquiries.find((entry) =>
          normalizeMatchValue(entry.name).startsWith(normalizedCustomer)
        ) ??
        inquiries.find((entry) =>
          normalizeMatchValue(entry.name).includes(normalizedCustomer)
        )
      : undefined;
    const matchedInquiry = inquiryById ?? inquiryByName;
    const offerNoFromInquiry = matchedInquiry?.offerNo?.trim();
    setFormState((prev) => ({
      ...prev,
      costSheetNos: selectedCostSheets,
      rows: nextRows.length ? nextRows : prev.rows,
      partyName: matchedInquiry?.name
        ? ensureBoldHtml(matchedInquiry.name)
        : prev.partyName,
      partyAddress: matchedInquiry?.address || prev.partyAddress,
      contactNo: matchedInquiry?.contactNo || prev.contactNo,
      kindAttn: matchedInquiry?.kindAttn || prev.kindAttn,
      offerNo: offerNoFromInquiry || prev.offerNo,
    }));
    setIsDialogOpen(false);
  };

  const handleAddCostSheet = () => {
    if (!selectedCostSheet.trim()) return;
    setSelectedCostSheets((prev) =>
      prev.includes(selectedCostSheet) ? prev : [...prev, selectedCostSheet]
    );
    setSelectedCostSheet('');
  };

  const handleRemoveCostSheet = (sheetNo: string) => {
    setSelectedCostSheets((prev) => prev.filter((item) => item !== sheetNo));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!printRef.current) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    await doc.html(printRef.current, {
      margin: [10, 10, 10, 10],
      autoPaging: 'text',
      html2canvas: { scale: 0.8 },
    });
    doc.save(`${formState.offerNo || 'quotation'}.pdf`);
  };

  const handleExportExcel = () => {
    const rows = activeRows.map((row, index) => ({
      'Sl. No.': index + 1,
      Product: row.product,
      Dimensions: row.dimensions,
      Qty: row.qty,
      'Rate/Pc. (INR)': row.rate,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Quotation');
    XLSX.writeFile(workbook, `${formState.offerNo || 'quotation'}.xlsx`);
  };

  const handleSave = async () => {
    setSaveError('');
    if (!formState.offerNo.trim()) {
      setSaveError('Offer No is required.');
      return;
    }
    if (!formState.partyName.trim()) {
      setSaveError('Party Name is required.');
      return;
    }
    setIsSaving(true);
    try {
      const payload: QuotationPayload = {
        ...formState,
        costSheetNos: selectedCostSheets,
      };
      const response = await fetch(
        quotationId ? `/api/quotations/${quotationId}` : '/api/quotations',
        {
          method: quotationId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to save quotation');
      }
      const saved = await response.json();
      setQuotationId(saved._id);
      setSnapshot(
        { ...formState, costSheetNos: selectedCostSheets },
        saved._id,
        selectedCostSheets
      );
      setQuotations((prev) => {
        const next = prev.filter((item) => item._id !== saved._id);
        return [saved, ...next];
      });
    } catch (error) {
      console.error('Save failed', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save quotation.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenConfirmOrder = () => {
    setSaveError('');
    setConfirmError('');
    setIsConfirmOpen(true);
  };

  const handleConfirmOrder = () => {
    setSaveError('');
    if (!formState.offerNo.trim() || !formState.partyName.trim()) {
      setConfirmError('Offer No and Party Name are required to confirm an order.');
      return;
    }
    if (!poNumber.trim() || !poDate.trim()) {
      setConfirmError('PO Number and PO Date are required.');
      return;
    }
    const nextOrder: ConfirmedOrder = {
      id: `order-${Date.now()}`,
      offerNo: formState.offerNo.trim(),
      partyName: stripHtml(formState.partyName) || formState.partyName,
      offerDate: formState.offerDate || undefined,
      refNo: formState.refNo || undefined,
      refDate: formState.refDate || undefined,
      poNumber: poNumber.trim(),
      poDate: poDate.trim(),
      costSheetNos: [...selectedCostSheets],
      createdAt: new Date().toISOString(),
    };
    try {
      const stored = localStorage.getItem(ordersStorageKey);
      const parsed = stored ? (JSON.parse(stored) as ConfirmedOrder[]) : [];
      const next = [nextOrder, ...parsed];
      localStorage.setItem(ordersStorageKey, JSON.stringify(next));
      setIsConfirmOpen(false);
      setPoNumber('');
      setPoDate('');
      router.push('/orders');
    } catch (error) {
      console.error('Failed to confirm order', error);
      setConfirmError('Failed to confirm order.');
    }
  };

  const handleEditQuotation = (record: QuotationRecord) => {
    setQuotationId(record._id);
    const nextFormState: QuotationPayload = {
      offerNo: record.offerNo,
      offerDate: record.offerDate ?? '',
      refNo: record.refNo ?? '',
      refDate: record.refDate ?? '',
      partyName: record.partyName ?? '',
      partyAddress: record.partyAddress ?? '',
      contactNo: record.contactNo ?? '',
      kindAttn: record.kindAttn ?? '',
      dearSir: record.dearSir ?? '<strong>Dear Sir,</strong>',
      priceTitle: record.priceTitle ?? '<strong>I. PRICE -</strong>',
      termsTitle: record.termsTitle ?? '<strong>II. TERMS & CONDITIONS -</strong>',
      footerCompany: record.footerCompany ?? 'For LIRCO ENGINEERING PVT. LTD.',
      footerName: record.footerName ?? '<strong>Dr. C L PATEL</strong>',
      notes: record.notes ?? defaultNotes,
      terms: record.terms ?? defaultTerms,
      styles: normalizeStyleConfig(record.styles),
      costSheetNos: record.costSheetNos ?? [],
      rows: record.rows ?? [],
      assets: { ...defaultAssets, ...(record.assets ?? {}) },
    };
    setFormState(nextFormState);
    const nextSelected = record.costSheetNos ?? [];
    setSelectedCostSheets(nextSelected);
    setSnapshot(nextFormState, record._id, nextSelected);
  };

  const handleConfirmFromSaved = (record: QuotationRecord) => {
    handleEditQuotation(record);
    handleOpenConfirmOrder();
  };

  const handleDeleteQuotation = async (record: QuotationRecord) => {
    try {
      const response = await fetch(`/api/quotations/${record._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) return;
      setQuotations((prev) => prev.filter((item) => item._id !== record._id));
      if (quotationId === record._id) {
        setQuotationId(null);
      }
    } catch (error) {
      console.error('Failed to delete quotation', error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-headline text-3xl font-semibold">Quotations</h1>
          <p className="text-muted-foreground">
            Build printable quotations and map them to cost sheets.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex flex-col gap-4">
            <Card className="border border-border">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Quotation Preview</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A4 layout ready for print or export.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPdf}>
                    <FileDown className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="bg-muted/30">
                <div className="flex justify-center">
                  <div
                    ref={printRef}
                    className="bg-white shadow-sm print-area"
                    style={{
                      width: '210mm',
                      minHeight: '297mm',
                      padding: '12mm',
                      ...resolvedStyles.global,
                    }}
                  >
                    {formState.assets.headerBanner ? (
                      <img
                        src={formState.assets.headerBanner}
                        alt="Header banner"
                        className="mb-3 h-24 object-fill"
                        style={{
                          width: 'calc(100% + 24mm)',
                          maxWidth: 'calc(100% + 24mm)',
                          marginLeft: '-12mm',
                          marginRight: '-12mm',
                          marginTop: 'calc(-1 * var(--print-padding, 12mm))',
                          display: 'block',
                        }}
                      />
                    ) : null}
                    <div className="flex justify-between gap-6">
                      <div className="w-2/3">
                        <div className="text-[11px] leading-tight" style={resolvedStyles.party}>
                          <p>To,</p>
                          <EditableText
                            html={formState.partyName || 'Party Name'}
                            onChange={(value) => updateFormField('partyName', value)}
                            className="font-semibold"
                            style={resolvedStyles.party}
                            editableKey="partyName"
                          />
                          <EditableText
                            html={formState.partyAddress || 'Party Address'}
                            onChange={(value) => updateFormField('partyAddress', value)}
                            className="whitespace-pre-wrap"
                            style={resolvedStyles.party}
                            editableKey="partyAddress"
                          />
                          <p>
                            Contact No:{' '}
                            <EditableText
                              html={formState.contactNo || '---'}
                              onChange={(value) => updateFormField('contactNo', value)}
                              editableKey="contactNo"
                              as="span"
                            />
                          </p>
                          <p>
                            Kind Attn.:{' '}
                            <EditableText
                              html={formState.kindAttn || '---'}
                              onChange={(value) => updateFormField('kindAttn', value)}
                              editableKey="kindAttn"
                              as="span"
                            />
                          </p>
                        </div>
                      </div>
                      <div className="w-1/3">
                        <table
                        className="w-full border-collapse border border-slate-500 text-[10px]"
                        style={resolvedStyles.offer}
                      >
                        <tbody>
                          <tr>
                              <td className="border border-slate-500 px-1 py-0.5 font-semibold">
                                Offer No.
                              </td>
                              <td className="border border-slate-500 px-1 py-0.5">
                                <EditableText
                                  html={formState.offerNo || '-'}
                                  onChange={(value) => updateFormField('offerNo', value)}
                                  editableKey="offerNo"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-slate-500 px-1 py-0.5 font-semibold">
                                Date
                              </td>
                              <td className="border border-slate-500 px-1 py-0.5">
                                <EditableText
                                  html={formState.offerDate || '-'}
                                  onChange={(value) => updateFormField('offerDate', value)}
                                  editableKey="offerDate"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-slate-500 px-1 py-0.5 font-semibold">
                                Ref.
                              </td>
                              <td className="border border-slate-500 px-1 py-0.5">
                                <EditableText
                                  html={formState.refNo || '-'}
                                  onChange={(value) => updateFormField('refNo', value)}
                                  editableKey="refNo"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-slate-500 px-1 py-0.5 font-semibold">
                                Dated
                              </td>
                              <td className="border border-slate-500 px-1 py-0.5">
                                <EditableText
                                  html={formState.refDate || '-'}
                                  onChange={(value) => updateFormField('refDate', value)}
                                  editableKey="refDate"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-left" style={resolvedStyles.intro}>
                      <EditableText
                        html={formState.dearSir}
                        onChange={(value) => updateFormField('dearSir', value)}
                        editableKey="dearSir"
                      />
                      <EditableText
                        html={formState.notes}
                        onChange={(value) => updateFormField('notes', value)}
                        className="mt-2 text-sm leading-relaxed"
                        editableKey="notes"
                      />
                    </div>

                    <div className="mt-4">
                      <EditableText
                        html={formState.priceTitle}
                        onChange={(value) => updateFormField('priceTitle', value)}
                        className="text-sm font-semibold underline"
                        style={resolvedStyles.priceTitle}
                        editableKey="priceTitle"
                      />
                    </div>

                    <div className="mt-2">
                      <table
                        className="w-full border-collapse border border-slate-500 text-[9px]"
                        style={resolvedStyles.table}
                      >
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="border border-slate-500 px-1 py-0.5 text-left">Sl. No.</th>
                            <th className="border border-slate-500 px-1 py-0.5 text-left">Product</th>
                            <th className="border border-slate-500 px-1 py-0.5 text-left">Dimensions (mm.)</th>
                            <th className="border border-slate-500 px-1 py-0.5 text-left">Qty. (Nos.)</th>
                            <th className="border border-slate-500 px-1 py-0.5 text-left">Rate/Pc. (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeRows.length > 0 ? (
                            activeRows.map((row, index) => (
                              <tr key={row.id}>
                                <td className="border border-slate-500 px-1 py-0.5 align-top">
                                  {index + 1}
                                </td>
                                <td className="border border-slate-500 px-1 py-0.5 whitespace-pre-wrap align-top">
                                  {row.product || '-'}
                                </td>
                                <td className="border border-slate-500 px-1 py-0.5 align-top">
                                  {row.dimensions || '-'}
                                </td>
                                <td className="border border-slate-500 px-1 py-0.5 align-top">
                                  {row.qty || '-'}
                                </td>
                                <td className="border border-slate-500 px-1 py-0.5 align-top">
                                  {row.rate || '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={5}
                                className="border border-slate-500 px-1.5 py-4 text-center text-slate-500"
                              >
                                No items yet. Generate from cost sheets or add rows manually.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4">
                      <EditableText
                        html={formState.termsTitle}
                        onChange={(value) => updateFormField('termsTitle', value)}
                        className="text-sm font-semibold underline"
                        style={resolvedStyles.termsTitle}
                        editableKey="termsTitle"
                      />
                      <EditableText
                        html={formState.terms}
                        onChange={(value) => updateFormField('terms', value)}
                        className="mt-2 whitespace-pre-wrap text-sm"
                        style={resolvedStyles.termsBody}
                        editableKey="terms"
                      />
                    </div>

                    <div className="mt-3 flex items-end justify-end">
                      <div
                        className="inline-flex flex-col items-end"
                        style={resolvedStyles.footer}
                      >
                        <EditableText
                          html={formState.footerCompany}
                          onChange={(value) => updateFormField('footerCompany', value)}
                          className="text-sm font-semibold"
                          editableKey="footerCompany"
                        />
                        {formState.assets.stamp ? (
                          <img
                            src={formState.assets.stamp}
                            alt="Stamp"
                            className="ml-auto my-1 h-14 object-contain"
                          />
                        ) : (
                          <div className="ml-auto my-1 h-14 w-32 border border-dashed border-slate-300 text-center text-[10px] text-slate-400">
                            LRICO STAMP
                          </div>
                        )}
                        <EditableText
                          html={formState.footerName}
                          onChange={(value) => updateFormField('footerName', value)}
                          className="text-sm"
                          editableKey="footerName"
                        />
                      </div>
                    </div>

                    {formState.assets.footerBanner ? (
                      <img
                        src={formState.assets.footerBanner}
                        alt="Footer banner"
                        className="mt-4 h-16 object-fill"
                        style={{
                          width: 'calc(100% + 24mm)',
                          maxWidth: 'calc(100% + 24mm)',
                          marginLeft: '-12mm',
                          marginRight: '-12mm',
                          marginBottom: 'calc(-1 * var(--print-padding, 12mm))',
                          display: 'block',
                        }}
                      />
                    ) : null}

                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border print:hidden print-hidden">
              <CardHeader>
                <CardTitle>Saved Quotations</CardTitle>
              </CardHeader>
              <CardContent>
                {quotations.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No quotations saved yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Offer No.</TableHead>
                          <TableHead>Party</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quotations.map((record) => (
                          <TableRow key={record._id}>
                            <TableCell className="font-medium">{record.offerNo}</TableCell>
                            <TableCell>{stripHtml(record.partyName) || '-'}</TableCell>
                            <TableCell>{record.offerDate || '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditQuotation(record)}>
                                  Edit
                                </Button>
                                <Button size="sm" onClick={() => handleConfirmFromSaved(record)}>
                                  Confirm Order
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteQuotation(record)}
                                >
                                  Delete
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

          <div className="flex flex-col gap-4 print:hidden print-hidden">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Formatting</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-xs text-muted-foreground">
                  Click any text in the preview to edit, then format the selection.
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySelectionCommand('bold')}
                  >
                    Bold
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySelectionCommand('italic')}
                  >
                    Italic
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySelectionCommand('underline')}
                  >
                    Underline
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySelectionCommand('removeFormat')}
                  >
                    Clear
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="selectionFont">Font</Label>
                    <Select
                      value={selectionFont}
                      onValueChange={(value) => {
                        setSelectionFont(value);
                        applySelectionCommand('fontName', value);
                      }}
                    >
                      <SelectTrigger id="selectionFont">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="selectionSize">Font size (pt)</Label>
                    <Input
                      id="selectionSize"
                      type="number"
                      value={selectionSize}
                      onChange={(event) => {
                        const next = event.target.value;
                        setSelectionSize(next);
                        applySelectionCommand('fontSize', mapFontSizeToExec(next));
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="selectionColor">Text color</Label>
                    <Input
                      id="selectionColor"
                      type="color"
                      value={selectionColor}
                      onChange={(event) => {
                        const next = event.target.value;
                        setSelectionColor(next);
                        applySelectionCommand('foreColor', next);
                      }}
                    />
                  </div>
                </div>
                <div
                  className="flex flex-wrap gap-2"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySelectionCommand('justifyLeft')}
                  >
                    Left
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySelectionCommand('justifyCenter')}
                  >
                    Center
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySelectionCommand('justifyRight')}
                  >
                    Right
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySelectionCommand('justifyFull')}
                  >
                    Justify
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Editor Controls</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {saveError ? (
                  <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {saveError}
                  </div>
                ) : null}

                <Accordion
                  type="multiple"
                  value={openEditorSections}
                  onValueChange={setOpenEditorSections}
                  className="w-full"
                >
                  <AccordionItem value="party">
                    <AccordionTrigger>Party Details</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="partyName">Party Name</Label>
                      <Input
                        id="partyName"
                              value={stripHtml(formState.partyName)}
                              onChange={(event) => updateFormField('partyName', event.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="partyAddress">Party Address</Label>
                      <Textarea
                        id="partyAddress"
                              value={stripHtml(formState.partyAddress)}
                              onChange={(event) => updateFormField('partyAddress', event.target.value)}
                        className="min-h-[90px]"
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="contactNo">Contact No</Label>
                        <Input
                          id="contactNo"
                              value={stripHtml(formState.contactNo)}
                              onChange={(event) => updateFormField('contactNo', event.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="kindAttn">Kind Attn.</Label>
                        <Input
                          id="kindAttn"
                              value={stripHtml(formState.kindAttn)}
                              onChange={(event) => updateFormField('kindAttn', event.target.value)}
                        />
                      </div>
                    </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="offer">
                    <AccordionTrigger>Offer Details</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="offerNo">Offer No</Label>
                        <Input
                          id="offerNo"
                              value={stripHtml(formState.offerNo)}
                              onChange={(event) => updateFormField('offerNo', event.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="offerDate">Date</Label>
                        <Input
                          id="offerDate"
                          type="date"
                              value={stripHtml(formState.offerDate)}
                              onChange={(event) => updateFormField('offerDate', event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="refNo">Ref.</Label>
                        <Input
                          id="refNo"
                              value={stripHtml(formState.refNo)}
                              onChange={(event) => updateFormField('refNo', event.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="refDate">Dated</Label>
                        <Input
                          id="refDate"
                          type="date"
                              value={stripHtml(formState.refDate)}
                              onChange={(event) => updateFormField('refDate', event.target.value)}
                        />
                      </div>
                    </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="mapping">
                    <AccordionTrigger>Cost Sheet Mapping</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground">
                        Pick cost sheets to auto-fill quotation rows from the final variant.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Select cost sheets
                        </Button>
                        {selectedCostSheets.length > 0 ? (
                          <span className="text-xs text-muted-foreground">
                            {selectedCostSheets.join(', ')}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No cost sheets selected.
                          </span>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="rows">
                    <AccordionTrigger>Quotation Rows</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-3">
                        <Button variant="outline" size="sm" onClick={addRow} className="w-fit">
                          <Plus className="mr-2 h-4 w-4" />
                          Add row
                        </Button>
                        {activeRows.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                            No rows yet.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Dimensions</TableHead>
                                  <TableHead>Qty</TableHead>
                                  <TableHead>Rate/Pc.</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {activeRows.map((row, index) => (
                                  <TableRow key={row.id}>
                                    <TableCell className="min-w-[200px]">
                                      <Textarea
                                        value={row.product}
                                        onChange={(event) =>
                                          updateRow(row.id, 'product', event.target.value)
                                        }
                                        className="min-h-[70px]"
                                      />
                                    </TableCell>
                                    <TableCell className="min-w-[160px]">
                                      <Input
                                        value={row.dimensions}
                                        onChange={(event) =>
                                          updateRow(row.id, 'dimensions', event.target.value)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="min-w-[80px]">
                                      <Input
                                        value={row.qty}
                                        onChange={(event) =>
                                          updateRow(row.id, 'qty', event.target.value)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="min-w-[110px]">
                                      <Input
                                        value={row.rate}
                                        onChange={(event) =>
                                          updateRow(row.id, 'rate', event.target.value)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="inline-flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => moveRow(row.id, 'up')}
                                          disabled={index === 0}
                                        >
                                          <ArrowUp className="h-4 w-4" />
                                          <span className="sr-only">Move up</span>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => moveRow(row.id, 'down')}
                                          disabled={index === activeRows.length - 1}
                                        >
                                          <ArrowDown className="h-4 w-4" />
                                          <span className="sr-only">Move down</span>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeRow(row.id)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          <span className="sr-only">Remove row</span>
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="notes">
                    <AccordionTrigger>Notes / Paragraph</AccordionTrigger>
                    <AccordionContent>
                      <Textarea
                        value={stripHtml(formState.notes)}
                        onChange={(event) => updateFormField('notes', event.target.value)}
                        className="min-h-[90px]"
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="terms">
                    <AccordionTrigger>Terms & Conditions</AccordionTrigger>
                    <AccordionContent>
                      <Textarea
                        value={stripHtml(formState.terms)}
                        onChange={(event) => updateFormField('terms', event.target.value)}
                        className="min-h-[160px]"
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="assets">
                    <AccordionTrigger>Assets</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3">
                        <div>
                          <Label htmlFor="headerUpload">Upload Header Banner (full-width)</Label>
                          <Input
                            id="headerUpload"
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              updateAsset('headerBanner', event.target.files?.[0])
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="stampUpload">Upload Stamp</Label>
                          <Input
                            id="stampUpload"
                            type="file"
                            accept="image/*"
                            onChange={(event) => updateAsset('stamp', event.target.files?.[0])}
                          />
                        </div>
                        <div>
                          <Label htmlFor="footerUpload">Upload Footer Banner (full-width)</Label>
                          <Input
                            id="footerUpload"
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              updateAsset('footerBanner', event.target.files?.[0])
                            }
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save quotation'}
                  </Button>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline" onClick={handleExportPdf}>
                    <FileDown className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" onClick={handleExportExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select cost sheet numbers</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label>Cost Sheet Number</Label>
              <Select value={selectedCostSheet} onValueChange={setSelectedCostSheet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cost sheet" />
                </SelectTrigger>
                <SelectContent>
                  {costSheets.map((sheet) => (
                    <SelectItem key={sheet._id} value={sheet.costSheetNo}>
                      {sheet.costSheetNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleAddCostSheet} disabled={!selectedCostSheet}>
              <ImagePlus className="mr-2 h-4 w-4" />
              Add cost sheet
            </Button>
            <div className="rounded-md border border-border p-3">
              {selectedCostSheets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cost sheets selected yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedCostSheets.map((sheetNo) => (
                    <div
                      key={sheetNo}
                      className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm"
                    >
                      <span>{sheetNo}</span>
                      <button
                        type="button"
                        className="text-destructive"
                        onClick={() => handleRemoveCostSheet(sheetNo)}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateQuotation} disabled={selectedCostSheets.length === 0}>
              Generate quotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm order details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {confirmError ? (
              <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {confirmError}
              </div>
            ) : null}
            <div className="space-y-1">
              <Label htmlFor="poNumber">PO Number</Label>
              <Input
                id="poNumber"
                value={poNumber}
                onChange={(event) => setPoNumber(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="poDate">PO Date</Label>
              <Input
                id="poDate"
                type="date"
                value={poDate}
                onChange={(event) => setPoDate(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmOrder}>Confirm Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
>>>>>>> main
    </div>
  );
}
