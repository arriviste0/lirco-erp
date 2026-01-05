'use client';

import type { CSSProperties } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Calculator,
  Copy,
  Edit,
  FileDown,
  FileSpreadsheet,
  Trash2,
  Layers,
  Plus,
  Minus,
  Undo,
  Printer,
  Save,
  Scale,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const presetTypes = [
  'CRCA Sheet',
  'Pipe',
  'Spikes',
  'Wedges',
  'Joint Piece',
  'Reinforcement Clip',
  'Hanger Plate',
];

const templateWidths = ['445', '480', '497', '616'];

const defaultProducts = [
  { value: 'ce', label: 'Collecting Electrode (CE)' },
  { value: 'de', label: 'Discharge Electrode (DE)' },
  { value: 'fde', label: 'Formed Discharge Electrode (FDE)' },
];

const defaultStandards = [
  { value: 'thermax', label: 'Thermax' },
  { value: 'elex', label: 'ETS ELEX' },
  { value: 'bhel', label: 'BHEL & Alstom' },
  { value: 'blanked', label: 'Blanked DE' },
  { value: 'enviro', label: 'Envirocare DE' },
];

const rateFields = [
  { key: 'packingRate', label: 'Packing rate', unit: 'Rs/kg' },
  { key: 'transport', label: 'Transport', unit: 'Lumpsum' },
  { key: 'labour', label: 'Labour', unit: 'Rs/kg' },
  { key: 'overhead', label: 'Overhead', unit: '%' },
];

const defaultRows = [
  {
    id: 'row-1',
    type: 'CRCA Sheet',
    spec: 'CRCA 0.8',
    width: '616',
    thk: '1.2',
    length: '2500',
    qty: '2',
    weight: '12.40',
    scrap: '2',
    ratePerUnit: '0',
    remark: 'Blanking',
  },
  {
    id: 'row-2',
    type: 'Pipe',
    spec: 'OD 19',
    width: '19',
    thk: '1.6',
    length: '2310',
    qty: '2',
    weight: '7.20',
    scrap: '1',
    ratePerUnit: '0',
    remark: 'Cut -390',
  },
  {
    id: 'row-3',
    type: 'Wedges',
    spec: 'MS',
    width: '45',
    thk: '6.0',
    length: '120',
    qty: '6',
    weight: '0.32',
    scrap: '0',
    ratePerUnit: '0',
    remark: 'Punch',
  },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);

const formatMoney = (value: number, currency: string) =>
  `${currency} ${formatNumber(value)}`;

const parseNumber = (value: string | number) => {
  if (typeof value === 'number') return value;
  const normalized = value.replace(/,/g, '').trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const generateCostSheetNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const seed = String(Math.floor(Math.random() * 900) + 100);
  return `CS-${year}-${seed}`;
};

const generateUniqueCostSheetNo = (reserved: Set<string>) => {
  let next = generateCostSheetNo();
  let attempts = 0;
  while (reserved.has(next.toLowerCase()) && attempts < 20) {
    next = generateCostSheetNo();
    attempts += 1;
  }
  if (reserved.has(next.toLowerCase())) {
    next = `CS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  }
  return next;
};

type CostSheetListItem = {
  _id?: string;
  costSheetNo: string;
};

type WeightRow = {
  id: string;
  type: string;
  spec: string;
  width: string;
  thk: string;
  length: string;
  qty: string;
  weight: string;
  scrap: string;
  ratePerUnit: string;
  remark: string;
};

type StandardTemplate = {
  value: string;
  label: string;
  product: string;
  width: string;
  rows: Omit<WeightRow, 'id'>[];
};

type CostSheetConfig = {
  products: { value: string; label: string }[];
  standards: { value: string; label: string }[];
  customStandards: StandardTemplate[];
  templateWidths: string[];
};

type TemplateDefinition = {
  totalQty: string;
  rows: Omit<WeightRow, 'id'>[];
};

const thermaxTemplates: Record<
  string,
  Record<string, TemplateDefinition>
> = {
  ce: {
    '445': {
      totalQty: '500',
      rows: [
        {
          type: 'CRCA Sheet',
          spec: 'IS 513 D',
          width: '616',
          thk: '1.25',
          length: '11708',
          qty: '1',
          weight: '70.77',
          scrap: '0',
          ratePerUnit: '0',
          remark: '',
        },
      ],
    },
    '480': {
      totalQty: '450',
      rows: [
        {
          type: 'CRCA Sheet',
          spec: 'IS 513 D',
          width: '660',
          thk: '1.5',
          length: '1000',
          qty: '1',
          weight: '7.77',
          scrap: '0',
          ratePerUnit: '0',
          remark: '',
        },
      ],
    },
    '497': {
      totalQty: '25',
      rows: [
        {
          type: 'CRCA Sheet',
          spec: 'IS 513 D',
          width: '620',
          thk: '1.2',
          length: '7800',
          qty: '25',
          weight: '45.56',
          scrap: '0',
          ratePerUnit: '0',
          remark: '',
        },
      ],
    },
  },
  de: {
    default: {
      totalQty: '216',
      rows: [
        {
          type: 'Pipe',
          spec: 'IS 5429',
          width: '44.5',
          thk: '1.25',
          length: '8600',
          qty: '1',
          weight: '11.46',
          scrap: '0',
          ratePerUnit: '0',
          remark: '',
        },
        {
          type: 'Nails',
          spec: '',
          width: '2.6',
          thk: '2.6',
          length: '65',
          qty: '150',
          weight: '0.41',
          scrap: '0',
          ratePerUnit: '0',
          remark: '',
        },
        {
          type: 'Joint Piece',
          spec: 'IS 5429',
          width: '44.5',
          thk: '1.5',
          length: '150',
          qty: '1',
          weight: '0.24',
          scrap: '0',
          ratePerUnit: '0',
          remark: '',
        },
      ],
    },
  },
};

type Variant = {
  id: string;
  name: string;
  width: string;
  length: string;
  thickness: string;
  specification: string;
  coilNote: string;
  useStandardTable: boolean;
  marginPercent: string;
  rows: WeightRow[];
};

type JobSetup = {
  customerName: string;
  projectRef: string;
  product: string;
  standard: string;
  totalQty: string;
  notes: string;
};

type Rates = {
  crcaRate: string;
  hrRate: string;
  pipeRate: string;
  scrapValue: string;
  packingRate: string;
  transport: string;
  labour: string;
  overhead: string;
};

type CostSheetRecord = {
  _id: string;
  costSheetNo: string;
  sheetDate: string;
  data: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const createVariant = (index: number): Variant => ({
  id: `variant-${Date.now()}-${index}`,
  name: `Variant ${index + 1}`,
  width: '616',
  length: '2500',
  thickness: '1.2',
  specification: '',
  coilNote: 'For 616mm wide coils',
  useStandardTable: true,
  marginPercent: '12',
  rows: defaultRows.map((row) => ({
    ...row,
    id: `${row.id}-${index}`,
  })),
});

export default function CostSheetBuilderPage() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement | null>(null);
  const skipConfigSaveRef = useRef(true);
  const [companyName, setCompanyName] = useState('Lirco Engineering');
  const [currency, setCurrency] = useState('Rs');
  const [costSheetNo, setCostSheetNo] = useState(generateCostSheetNo());
  const [sheetDate, setSheetDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('create');
  const [existingCostSheets, setExistingCostSheets] = useState<CostSheetListItem[]>([]);
  const [costSheetNoError, setCostSheetNoError] = useState('');
  const [costSheets, setCostSheets] = useState<CostSheetRecord[]>([]);
  const [deletedCostSheet, setDeletedCostSheet] = useState<CostSheetRecord | null>(null);
  const [isUndoingDelete, setIsUndoingDelete] = useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [jobSetup, setJobSetup] = useState<JobSetup>({
    customerName: '',
    projectRef: '',
    product: '',
    standard: '',
    totalQty: '100',
    notes: '',
  });
  const [rates, setRates] = useState<Rates>({
    crcaRate: '65',
    hrRate: '58',
    pipeRate: '120',
    scrapValue: '22',
    packingRate: '6',
    transport: '4500',
    labour: '8.5',
    overhead: '12',
  });
  const [variants, setVariants] = useState<Variant[]>([createVariant(0)]);
  const [activeVariantId, setActiveVariantId] = useState(variants[0].id);
  const [availableWidths, setAvailableWidths] = useState<string[]>(templateWidths);
  const [productOptions, setProductOptions] = useState(defaultProducts);
  const [standardOptions, setStandardOptions] = useState(defaultStandards);
  const [newProductName, setNewProductName] = useState('');
  const [newStandardName, setNewStandardName] = useState('');
  const [newStandardProduct, setNewStandardProduct] = useState('');
  const [newStandardWidth, setNewStandardWidth] = useState('');
  const [standardRows, setStandardRows] = useState<WeightRow[]>([]);
  const [editingStandardValue, setEditingStandardValue] = useState<string | null>(null);
  const [customStandards, setCustomStandards] = useState<StandardTemplate[]>([]);
  const [productHistory, setProductHistory] = useState([defaultProducts]);
  const [productHistoryIndex, setProductHistoryIndex] = useState(0);
  const [standardHistory, setStandardHistory] = useState<
    { options: typeof standardOptions; custom: StandardTemplate[] }[]
  >([{ options: defaultStandards, custom: [] }]);
  const [standardHistoryIndex, setStandardHistoryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) return;
        const data = await response.json();
        if (data.companyName) setCompanyName(data.companyName);
        if (data.currency) {
          setCurrency(data.currency.toUpperCase() === 'INR' ? 'Rs' : data.currency);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };

    loadSettings();
  }, []);

  const buildConfigPayload = (overrides?: Partial<CostSheetConfig>): CostSheetConfig => ({
    products: overrides?.products ?? productOptions,
    standards: overrides?.standards ?? standardOptions,
    customStandards: overrides?.customStandards ?? customStandards,
    templateWidths: overrides?.templateWidths ?? availableWidths,
  });

  const saveConfig = async (payload: CostSheetConfig) => {
    try {
      await fetch('/api/cost-sheet-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to save cost sheet config', error);
    }
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/cost-sheet-config');
        if (!response.ok) {
          setIsConfigLoaded(true);
          return;
        }
        const data = await response.json();
        if (!data) {
          const defaults = buildConfigPayload({
            products: defaultProducts,
            standards: defaultStandards,
            customStandards: [],
            templateWidths,
          });
          setProductOptions(defaults.products);
          setStandardOptions(defaults.standards);
          setCustomStandards(defaults.customStandards);
          setAvailableWidths(defaults.templateWidths);
          setProductHistory([defaults.products]);
          setProductHistoryIndex(0);
          setStandardHistory([{ options: defaults.standards, custom: [] }]);
          setStandardHistoryIndex(0);
          await saveConfig(defaults);
          setIsConfigLoaded(true);
          return;
        }

        const nextProducts = Array.isArray(data.products) ? data.products : defaultProducts;
        const nextStandards = Array.isArray(data.standards) ? data.standards : defaultStandards;
        const nextCustomStandards = Array.isArray(data.customStandards) ? data.customStandards : [];
        const nextTemplateWidths = Array.isArray(data.templateWidths)
          ? data.templateWidths
          : templateWidths;

        setProductOptions(nextProducts);
        setStandardOptions(nextStandards);
        setCustomStandards(nextCustomStandards);
        setAvailableWidths(nextTemplateWidths);
        setProductHistory([nextProducts]);
        setProductHistoryIndex(0);
        setStandardHistory([{ options: nextStandards, custom: nextCustomStandards }]);
        setStandardHistoryIndex(0);
      } catch (error) {
        console.error('Failed to load cost sheet config', error);
      } finally {
        setIsConfigLoaded(true);
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    if (!isConfigLoaded) return;
    if (skipConfigSaveRef.current) {
      skipConfigSaveRef.current = false;
      return;
    }
    saveConfig(buildConfigPayload());
  }, [availableWidths, customStandards, isConfigLoaded, productOptions, standardOptions]);

  useEffect(() => {
    const loadCostSheets = async () => {
      try {
        const response = await fetch('/api/cost-sheets');
        if (!response.ok) return;
        const data = await response.json();
        if (!Array.isArray(data)) return;
        const normalized = data
          .map((item) => ({
            _id: String(item?._id ?? ''),
            costSheetNo: String(item?.costSheetNo ?? '').trim(),
            sheetDate: String(item?.sheetDate ?? ''),
            data: item?.data ?? {},
            createdAt: item?.createdAt,
            updatedAt: item?.updatedAt,
          }))
          .filter((item) => item.costSheetNo && item._id);
        setCostSheets(normalized);
        setExistingCostSheets(
          normalized.map((item) => ({
            _id: item._id,
            costSheetNo: item.costSheetNo,
          }))
        );
        const reserved = new Set(
          normalized.map((item) => item.costSheetNo.toLowerCase())
        );
        if (reserved.has(costSheetNo.trim().toLowerCase())) {
          setCostSheetNo(generateUniqueCostSheetNo(reserved));
        }
      } catch (error) {
        console.error('Failed to load cost sheets', error);
      }
    };

    loadCostSheets();
  }, []);

  const activeVariant = useMemo(
    () => variants.find((variant) => variant.id === activeVariantId),
    [variants, activeVariantId]
  );

  const useTotalQtyForWeight = jobSetup.standard === 'thermax';

  const getRowTotalWeight = (row: WeightRow, totalQty: number) =>
    parseNumber(row.weight) *
    (useTotalQtyForWeight ? totalQty : parseNumber(row.qty));

  const getRowTotalAmount = (row: WeightRow, totalQty: number) =>
    getRowTotalWeight(row, totalQty) * parseNumber(row.ratePerUnit);

  const isDefaultStandard = (value: string) =>
    defaultStandards.some((standard) => standard.value === value);

  const filteredStandardOptions = useMemo(() => {
    if (!jobSetup.product) return standardOptions;
    return standardOptions.filter((option) => {
      if (isDefaultStandard(option.value)) return true;
      const custom = customStandards.find((item) => item.value === option.value);
      return custom?.product === jobSetup.product;
    });
  }, [customStandards, jobSetup.product, standardOptions]);

  const totals = useMemo(() => {
    const totalQty = parseNumber(jobSetup.totalQty);
    const rows = activeVariant?.rows ?? [];
    const totalWeight = rows.reduce((acc, row) => {
      const rowWeight = getRowTotalWeight(row, totalQty);
      return acc + rowWeight;
    }, 0);
    const weightPerPiece = totalQty > 0 ? totalWeight / totalQty : 0;
    const lengthMeters = parseNumber(activeVariant?.length ?? '0') / 1000;
    const weightPerMeter = lengthMeters > 0 ? weightPerPiece / lengthMeters : 0;

    return {
      totalQty,
      totalWeight,
      weightPerPiece,
      weightPerMeter,
    };
  }, [activeVariant, jobSetup.totalQty, useTotalQtyForWeight]);

  const amountTotals = useMemo(() => {
    const rows = activeVariant?.rows ?? [];
    const totalAmount = rows.reduce(
      (acc, row) => acc + getRowTotalAmount(row, totals.totalQty),
      0
    );
    return { totalAmount };
  }, [activeVariant, totals.totalQty]);

  const costSummary = useMemo(() => {
    const totalWeight = totals.totalWeight;
    const materialCost = amountTotals.totalAmount;
    const labourCost = totalWeight * parseNumber(rates.labour);
    const packingCost = totalWeight * parseNumber(rates.packingRate);
    const transportCost = parseNumber(rates.transport);
    const overheadCost =
      (materialCost + labourCost) * (parseNumber(rates.overhead) / 100);
    const totalCost =
      materialCost + labourCost + packingCost + transportCost + overheadCost;
    const costPerPiece = totals.totalQty > 0 ? totalCost / totals.totalQty : 0;
    const marginPercent = parseNumber(activeVariant?.marginPercent ?? '0');
    const sellingRatePerPieceRaw = costPerPiece * (1 + marginPercent / 100);
    const sellingRatePerPiece = Math.round(sellingRatePerPieceRaw);
    const costPerKg = totalWeight > 0 ? totalCost / totalWeight : 0;
    const sellingRatePerKgRaw = costPerKg * (1 + marginPercent / 100);
    const sellingRatePerKg = Number(sellingRatePerKgRaw.toFixed(2));

    return {
      materialCost,
      labourCost,
      overheadCost,
      packingCost,
      transportCost,
      totalCost,
      costPerPiece,
      costPerKg,
      sellingRatePerPiece,
      sellingRatePerKg,
      marginPercent,
    };
  }, [activeVariant?.marginPercent, amountTotals.totalAmount, rates, totals]);

  const isCostSheetNoDuplicate = (value: string, currentId?: string | null) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    return existingCostSheets.some(
      (sheet) =>
        sheet.costSheetNo.trim().toLowerCase() === normalized &&
        sheet._id !== currentId
    );
  };

  useEffect(() => {
    const normalized = costSheetNo.trim();
    if (!normalized) {
      setCostSheetNoError('Cost Sheet No is required.');
      return;
    }
    if (isCostSheetNoDuplicate(costSheetNo, sheetId)) {
      setCostSheetNoError('Cost Sheet No already exists.');
      return;
    }
    setCostSheetNoError('');
  }, [costSheetNo, existingCostSheets, sheetId]);

  const updateJobSetup = (key: keyof JobSetup, value: string) => {
    setJobSetup((prev) => ({ ...prev, [key]: value }));
  };

  const updateRates = (key: keyof Rates, value: string) => {
    setRates((prev) => ({ ...prev, [key]: value }));
  };

  const updateActiveVariant = (updates: Partial<Variant>) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === activeVariantId ? { ...variant, ...updates } : variant
      )
    );
  };

  const updateRow = (rowId: string, key: keyof WeightRow, value: string) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== activeVariantId) return variant;
        return {
          ...variant,
          rows: variant.rows.map((row) =>
            row.id === rowId ? { ...row, [key]: value } : row
          ),
        };
      })
    );
  };

  const addPresetRow = (preset: string) => {
    const newRow: WeightRow = {
      id: `row-${Date.now()}`,
      type: preset,
      spec: '',
      width: activeVariant?.width ?? '',
      thk: activeVariant?.thickness ?? '',
      length: activeVariant?.length ?? '',
      qty: '1',
      weight: '',
      scrap: '0',
      ratePerUnit: '0',
      remark: '',
    };

    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === activeVariantId
          ? { ...variant, rows: [...variant.rows, newRow] }
          : variant
      )
    );
  };

  const handleRemovePresetRow = (preset: string) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== activeVariantId) return variant;
        const lastIndex = [...variant.rows].map((row) => row.type).lastIndexOf(preset);
        if (lastIndex === -1) return variant;
        return {
          ...variant,
          rows: variant.rows.filter((_, index) => index !== lastIndex),
        };
      })
    );
  };

  const pushProductHistory = (nextProducts: typeof productOptions) => {
    setProductHistory((prev) => {
      const next = prev.slice(0, productHistoryIndex + 1);
      next.push(nextProducts);
      return next;
    });
    setProductHistoryIndex((prev) => prev + 1);
  };

  const handleAddProduct = (value?: string) => {
    const nextProduct = value ?? '';
    const sanitized = nextProduct.trim();
    if (!sanitized) return;
    const baseSlug = toSlug(sanitized) || `product-${Date.now()}`;
    let slug = baseSlug;
    let counter = 1;
    while (productOptions.some((option) => option.value === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
    const nextOptions = [...productOptions, { value: slug, label: sanitized }];
    setProductOptions(nextOptions);
    pushProductHistory(nextOptions);
    updateJobSetup('product', slug);
  };

  const handleRemoveProductByValue = (value: string) => {
    const nextOptions = productOptions.filter((option) => option.value !== value);
    setProductOptions(nextOptions);
    pushProductHistory(nextOptions);
    if (jobSetup.product === value) {
      updateJobSetup('product', '');
    }
  };

  const handleUndoProductChange = () => {
    if (productHistoryIndex <= 0) return;
    const previous = productHistory[productHistoryIndex - 1];
    setProductHistoryIndex(productHistoryIndex - 1);
    setProductOptions(previous);
    if (!previous.some((option) => option.value === jobSetup.product)) {
      updateJobSetup('product', '');
    }
  };

  const getTemplateDefinition = (width: string, standardValue?: string) => {
    const standardKey = standardValue ?? jobSetup.standard;
    if (standardKey !== 'thermax') return null;
    const productKey = jobSetup.product || '';
    if (productKey === 'de') {
      return thermaxTemplates.de.default ?? null;
    }
    if (productKey === 'ce') {
      return thermaxTemplates.ce[width] ?? null;
    }
    return null;
  };

  const applyTemplateForWidth = (width: string) => {
    const template = getTemplateDefinition(width);
    const templateRows = template?.rows.map((row, index) => ({
      ...row,
      id: `row-${Date.now()}-${index}`,
    }));
    updateActiveVariant({
      width,
      rows: templateRows ?? activeVariant?.rows ?? [],
    });
    if (template?.totalQty) {
      updateJobSetup('totalQty', template.totalQty);
    }
    if (template) {
      toast({
        title: 'Template applied',
        description: 'Thermax format loaded for the selected template.',
      });
    }
  };

  const pushStandardHistory = (
    nextOptions: typeof standardOptions,
    nextCustom: StandardTemplate[]
  ) => {
    setStandardHistory((prev) => {
      const next = prev.slice(0, standardHistoryIndex + 1);
      next.push({ options: nextOptions, custom: nextCustom });
      return next;
    });
    setStandardHistoryIndex((prev) => prev + 1);
  };

  const addStandardRowByType = (type: string) => {
    if (!activeVariant) return;
    const newRow: WeightRow = {
      id: `standard-row-${Date.now()}`,
      type,
      spec: '',
      width: activeVariant.width,
      thk: activeVariant.thickness,
      length: activeVariant.length,
      qty: '1',
      weight: '',
      scrap: '0',
      ratePerUnit: '0',
      remark: '',
    };
    setStandardRows((prev) => [...prev, newRow]);
  };

  const updateStandardRow = (rowId: string, key: keyof WeightRow, value: string) => {
    setStandardRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [key]: value } : row))
    );
  };

  const removeStandardRow = (rowId: string) => {
    setStandardRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const applyStandardTemplate = (standardValue: string) => {
    if (!activeVariant) return;
    if (standardValue === 'thermax') {
      const template = getTemplateDefinition(activeVariant.width, standardValue);
      if (!template) return;
      const templateRows = template.rows.map((row, index) => ({
        ...row,
        id: `row-${Date.now()}-${index}`,
      }));
      updateActiveVariant({ rows: templateRows });
      if (template.totalQty) {
        updateJobSetup('totalQty', template.totalQty);
      }
      return;
    }

    const custom = customStandards.find((item) => item.value === standardValue);
    if (!custom) return;
    updateActiveVariant({ width: custom.width || activeVariant.width });
    const rows = custom.rows.map((row, index) => ({
      ...row,
      id: `row-${Date.now()}-${index}`,
    }));
    updateActiveVariant({ rows });
  };

  const handleStandardChange = (value: string) => {
    updateJobSetup('standard', value);
    applyStandardTemplate(value);
  };

  const handleAddStandard = () => {
    const sanitized = newStandardName.trim();
    if (!sanitized) return;
    if (!newStandardProduct) return;
    if (!newStandardWidth) return;
    if (standardRows.length === 0) return;
    const baseSlug = toSlug(sanitized) || `standard-${Date.now()}`;
    let slug = baseSlug;
    let counter = 1;
    while (standardOptions.some((option) => option.value === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
    const nextOptions = [...standardOptions, { value: slug, label: sanitized }];
    const nextCustom = [
      ...customStandards,
      {
        value: slug,
        label: sanitized,
        product: newStandardProduct,
        width: newStandardWidth,
        rows: standardRows.map(({ id, ...rest }) => rest),
      },
    ];
    setStandardOptions(nextOptions);
    setCustomStandards(nextCustom);
    pushStandardHistory(nextOptions, nextCustom);
    setNewStandardName('');
    setNewStandardProduct('');
    setNewStandardWidth('');
    setStandardRows([]);
  };

  const handleEditStandard = (standardValue: string) => {
    const custom = customStandards.find((item) => item.value === standardValue);
    if (!custom) return;
    setNewStandardName(custom.label);
    setNewStandardProduct(custom.product);
    setNewStandardWidth(custom.width);
    setStandardRows(
      custom.rows.map((row, index) => ({
        ...row,
        id: `standard-edit-${standardValue}-${index}`,
      }))
    );
    setEditingStandardValue(standardValue);
  };

  const handleSaveStandardEdit = () => {
    if (!editingStandardValue) return;
    const sanitized = newStandardName.trim();
    if (!sanitized) return;
    if (!newStandardProduct) return;
    if (!newStandardWidth) return;
    if (standardRows.length === 0) return;
    const nextCustom = customStandards.map((item) =>
      item.value === editingStandardValue
        ? {
            ...item,
            label: sanitized,
            product: newStandardProduct,
            width: newStandardWidth,
            rows: standardRows.map(({ id, ...rest }) => rest),
          }
        : item
    );
    const nextOptions = standardOptions.map((option) =>
      option.value === editingStandardValue
        ? { ...option, label: sanitized }
        : option
    );
    setCustomStandards(nextCustom);
    setStandardOptions(nextOptions);
    pushStandardHistory(nextOptions, nextCustom);
    setEditingStandardValue(null);
    setNewStandardName('');
    setNewStandardProduct('');
    setNewStandardWidth('');
    setStandardRows([]);
  };

  const handleRemoveStandardByValue = (value: string) => {
    const nextOptions = standardOptions.filter((option) => option.value !== value);
    const nextCustom = customStandards.filter((item) => item.value !== value);
    setStandardOptions(nextOptions);
    setCustomStandards(nextCustom);
    pushStandardHistory(nextOptions, nextCustom);
    if (jobSetup.standard === value) {
      updateJobSetup('standard', '');
    }
  };

  const handleUndoStandardChange = () => {
    if (standardHistoryIndex <= 0) return;
    const previous = standardHistory[standardHistoryIndex - 1];
    setStandardHistoryIndex(standardHistoryIndex - 1);
    setStandardOptions(previous.options);
    setCustomStandards(previous.custom);
    if (!previous.options.some((option) => option.value === jobSetup.standard)) {
      updateJobSetup('standard', '');
    }
  };

  const handleDeleteRow = (rowId: string) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === activeVariantId
          ? { ...variant, rows: variant.rows.filter((row) => row.id !== rowId) }
          : variant
      )
    );
  };

  const handleLoadStandardFormat = () => {
    if (!activeVariant) return;
    const template = getTemplateDefinition(activeVariant.width);
    const updatedRows = (template?.rows ?? defaultRows).map((row, index) => {
      const baseId = 'id' in row ? row.id : `row-${index}`;
      return {
        ...row,
        id: `${baseId}-${activeVariant.id}-${index}`,
        width: row.width || activeVariant.width,
        thk: row.thk || activeVariant.thickness,
        length: row.length || activeVariant.length,
      };
    });
    updateActiveVariant({ rows: updatedRows });
    if (template?.totalQty) {
      updateJobSetup('totalQty', template.totalQty);
    }
    toast({
      title: 'Standard format loaded',
      description: template
        ? 'Thermax template rows populated for the selected variant.'
        : 'Template rows populated for the selected variant.',
    });
  };

  const handleAddVariant = () => {
    const newVariant = createVariant(variants.length);
    setVariants((prev) => [...prev, newVariant]);
    setActiveVariantId(newVariant.id);
    toast({
      title: 'Variant added',
      description: 'A new variant has been created for this cost sheet.',
    });
  };

  const handleAddTemplate = () => {
    const nextWidth = window.prompt('Enter new template width (mm)');
    if (!nextWidth) return;
    const sanitized = nextWidth.trim();
    if (!sanitized) return;
    setAvailableWidths((prev) =>
      prev.includes(sanitized) ? prev : [...prev, sanitized]
    );
    toast({
      title: 'Template added',
      description: `Width ${sanitized} is now available in templates.`,
    });
  };

  const handleApplyMarginToAll = () => {
    if (!activeVariant) return;
    setVariants((prev) =>
      prev.map((variant) => ({
        ...variant,
        marginPercent: activeVariant.marginPercent,
      }))
    );
    toast({
      title: 'Margin applied',
      description: 'Margin percentage applied to all variants.',
    });
  };

  const handleSave = async () => {
    if (!activeVariant) return;
    const normalizedCostSheetNo = costSheetNo.trim();
    if (!normalizedCostSheetNo) {
      setCostSheetNoError('Cost Sheet No is required.');
      return;
    }
    if (isCostSheetNoDuplicate(normalizedCostSheetNo, sheetId)) {
      setCostSheetNoError('Cost Sheet No already exists.');
      toast({
        title: 'Duplicate cost sheet number',
        description: 'Please choose a unique Cost Sheet No before saving.',
        variant: 'destructive',
      });
      return;
    }
    if (normalizedCostSheetNo !== costSheetNo) {
      setCostSheetNo(normalizedCostSheetNo);
    }
    setIsSaving(true);
    try {
      const payload = {
        costSheetNo: normalizedCostSheetNo,
        sheetDate,
        jobSetup,
        rates,
        variants,
        activeVariantId,
        summary: {
          totals,
          costSummary,
        },
      };

      const response = await fetch(
        sheetId ? `/api/cost-sheets/${sheetId}` : '/api/cost-sheets',
        {
          method: sheetId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 409) {
        setCostSheetNoError('Cost Sheet No already exists.');
        toast({
          title: 'Duplicate cost sheet number',
          description: 'Please choose a unique Cost Sheet No before saving.',
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to save cost sheet');
      }

      const data = await response.json();
      const nextId = data._id ?? sheetId;
      setSheetId(nextId);
      if (nextId) {
        setExistingCostSheets((prev) => {
          const next = prev.filter((item) => item._id !== nextId);
          return [{ _id: nextId, costSheetNo: normalizedCostSheetNo }, ...next];
        });
        setCostSheets((prev) => {
          const next = prev.filter((item) => item._id !== nextId);
          return [
            {
              _id: nextId,
              costSheetNo: normalizedCostSheetNo,
              sheetDate,
              data: payload,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            },
            ...next,
          ];
        });
      }
      toast({
        title: 'Cost sheet saved',
        description: `Saved ${normalizedCostSheetNo} successfully.`,
      });
    } catch (error) {
      console.error('Save failed', error);
      toast({
        title: 'Save failed',
        description: 'Unable to save the cost sheet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = () => {
    const reserved = new Set(
      existingCostSheets.map((item) => item.costSheetNo.toLowerCase())
    );
    reserved.add(costSheetNo.trim().toLowerCase());
    setSheetId(null);
    setCostSheetNo(generateUniqueCostSheetNo(reserved));
    setCostSheetNoError('');
    setSheetDate(new Date().toISOString().slice(0, 10));
    toast({
      title: 'Cost sheet duplicated',
      description: 'A new draft copy has been created.',
    });
  };

  const handleEditCostSheet = (record: CostSheetRecord) => {
    const data = record.data ?? {};
    const nextJobSetup = (data as { jobSetup?: JobSetup }).jobSetup;
    const nextRates = (data as { rates?: Rates }).rates;
    const nextVariants = (data as { variants?: Variant[] }).variants;
    const nextActiveVariantId = (data as { activeVariantId?: string }).activeVariantId;

    setSheetId(record._id);
    setCostSheetNo(record.costSheetNo);
    setSheetDate(record.sheetDate || (data as { sheetDate?: string }).sheetDate || sheetDate);
    setJobSetup(
      nextJobSetup ?? {
        customerName: '',
        projectRef: '',
        product: '',
        standard: '',
        totalQty: '100',
        notes: '',
      }
    );
    setRates(
      nextRates ?? {
        crcaRate: '65',
        hrRate: '58',
        pipeRate: '120',
        scrapValue: '22',
        packingRate: '6',
        transport: '4500',
        labour: '8.5',
        overhead: '12',
      }
    );

    if (Array.isArray(nextVariants) && nextVariants.length > 0) {
      setVariants(nextVariants);
      setActiveVariantId(nextActiveVariantId ?? nextVariants[0].id);
    } else {
      const fallback = [createVariant(0)];
      setVariants(fallback);
      setActiveVariantId(fallback[0].id);
    }

    setCostSheetNoError('');
    setActiveTab('create');
    toast({
      title: 'Cost sheet loaded',
      description: `Editing ${record.costSheetNo}.`,
    });
  };

  const getResponseErrorMessage = async (response: Response) => {
    try {
      const data = await response.json();
      if (data?.error) return String(data.error);
    } catch {
      try {
        const text = await response.text();
        if (text) return text;
      } catch {
        return `Request failed with status ${response.status}.`;
      }
    }
    return `Request failed with status ${response.status}.`;
  };

  const handleDeleteCostSheet = async (record: CostSheetRecord) => {
    try {
      const response = await fetch(`/api/cost-sheets/${record._id}`, { method: 'DELETE' });
      if (!response.ok) {
        const message = await getResponseErrorMessage(response);
        throw new Error(message);
      }
      setDeletedCostSheet(record);
      setCostSheets((prev) => prev.filter((item) => item._id !== record._id));
      setExistingCostSheets((prev) => prev.filter((item) => item._id !== record._id));
      toast({
        title: 'Cost sheet deleted',
        description: `${record.costSheetNo} removed. You can undo this action.`,
      });
    } catch (error) {
      console.error('Delete failed', error);
      toast({
        title: 'Delete failed',
        description:
          error instanceof Error
            ? error.message
            : 'Unable to delete the cost sheet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUndoDelete = async () => {
    if (!deletedCostSheet) return;
    setIsUndoingDelete(true);
    try {
      const restorePayload = {
        ...(deletedCostSheet.data ?? {}),
        costSheetNo: deletedCostSheet.costSheetNo,
        sheetDate: deletedCostSheet.sheetDate,
      };
      const response = await fetch('/api/cost-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restorePayload),
      });
      if (response.status === 409) {
        toast({
          title: 'Unable to restore',
          description: 'Cost Sheet No already exists. Please refresh the list.',
          variant: 'destructive',
        });
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to restore cost sheet');
      }
      const data = await response.json();
      const restored: CostSheetRecord = {
        _id: String(data._id ?? ''),
        costSheetNo: deletedCostSheet.costSheetNo,
        sheetDate: deletedCostSheet.sheetDate,
        data: restorePayload,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
      setCostSheets((prev) => [restored, ...prev]);
      setExistingCostSheets((prev) => [
        { _id: restored._id, costSheetNo: restored.costSheetNo },
        ...prev,
      ]);
      setDeletedCostSheet(null);
      toast({
        title: 'Cost sheet restored',
        description: `${restored.costSheetNo} has been restored.`,
      });
    } catch (error) {
      console.error('Undo delete failed', error);
      toast({
        title: 'Restore failed',
        description: 'Unable to restore the cost sheet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUndoingDelete(false);
    }
  };

  const handleExportPdf = () => {
    if (!activeVariant) return;
    const doc = new jsPDF();
    doc.text(`Cost Sheet: ${costSheetNo}`, 14, 16);
    doc.text(`Customer: ${jobSetup.customerName || '-'}`, 14, 24);
    doc.text(`Product: ${jobSetup.product || '-'}`, 14, 32);
    doc.text(`Standard: ${jobSetup.standard || '-'}`, 14, 40);
    doc.text(`Date: ${sheetDate}`, 14, 48);

    const rows = activeVariant.rows.map((row, index) => [
      String(index + 1),
      row.type,
      row.spec,
      row.width,
      row.thk,
      row.length,
      row.qty,
      row.weight,
      formatNumber(getRowTotalWeight(row, totals.totalQty)),
      row.ratePerUnit,
      formatNumber(getRowTotalAmount(row, totals.totalQty)),
      row.remark,
    ]);

    (doc as any).autoTable({
      startY: 56,
      head: [
        [
          'Sl',
          'Item Type',
          'Spec',
          'Width/OD',
          'Thk',
          'Length',
          'Qty',
          'Wt/Unit',
          'Total Wt',
          'Rate/Unit',
          'Total Amount',
          'Remark',
        ],
      ],
      body: rows,
    });

    doc.save(`${costSheetNo}.pdf`);
  };

  const handleExportExcel = () => {
    if (!activeVariant) return;
    const summarySheet = XLSX.utils.json_to_sheet([
      {
        'Cost Sheet No': costSheetNo,
        Date: sheetDate,
        Customer: jobSetup.customerName,
        Product: jobSetup.product,
        Standard: jobSetup.standard,
        'Total Qty': totals.totalQty,
        'Total Weight': totals.totalWeight,
        'Cost / Piece': costSummary.costPerPiece,
        'Selling Rate / Piece': costSummary.sellingRatePerPiece,
        'Selling Rate / Kg': costSummary.sellingRatePerKg,
      },
    ]);

    const itemsSheet = XLSX.utils.json_to_sheet(
      activeVariant.rows.map((row, index) => ({
        'Sl No': index + 1,
        'Item Type': row.type,
        Specification: row.spec,
        'Width / OD': row.width,
        Thk: row.thk,
        Length: row.length,
        Qty: row.qty,
        'Wt/Unit': row.weight,
        'Total Wt': getRowTotalWeight(row, totals.totalQty),
        'Rate/Unit': row.ratePerUnit,
        'Total Amount': getRowTotalAmount(row, totals.totalQty),
        Remark: row.remark,
      }))
    );

    const ratesSheet = XLSX.utils.json_to_sheet([
      {
        'CRCA rate': rates.crcaRate,
        'HR rate': rates.hrRate,
        'Pipe rate': rates.pipeRate,
        'Scrap value': rates.scrapValue,
        'Packing rate': rates.packingRate,
        Transport: rates.transport,
        Labour: rates.labour,
        Overhead: rates.overhead,
      },
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Items');
    XLSX.utils.book_append_sheet(workbook, ratesSheet, 'Rates');
    XLSX.writeFile(workbook, `${costSheetNo}.xlsx`);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '', 'height=900,width=1200');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${costSheetNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { font-size: 20px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; }
            th { background: #f2f2f2; }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{
        '--sheet-accent': '15 118 110',
        '--sheet-warm': '249 115 22',
        '--sheet-ink': '15 23 42',
        background:
          'radial-gradient(circle at top, rgba(15,118,110,0.12), transparent 45%), radial-gradient(circle at bottom, rgba(249,115,22,0.12), transparent 50%)',
      } as CSSProperties}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-10 pt-6">
        <header className="rounded-2xl border bg-background/90 p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {companyName}
              </p>
              <h1 className="font-headline text-3xl font-semibold text-foreground">
                Cost Sheet Builder
              </h1>
              <p className="text-sm text-muted-foreground">
                Create multi-variant cost sheets with auto-filled weight tables.
              </p>
            </div>
            <div className="text-left lg:text-center">
              <p className="text-sm font-medium text-muted-foreground">Cost Sheet No.</p>
              <Input
                value={costSheetNo}
                onChange={(event) => setCostSheetNo(event.target.value)}
                onBlur={(event) => setCostSheetNo(event.target.value.trim())}
                aria-invalid={Boolean(costSheetNoError)}
                className="h-9 w-[220px] text-lg font-semibold"
              />
              {costSheetNoError && (
                <p className="mt-1 text-xs text-destructive">{costSheetNoError}</p>
              )}
              <div className="mt-2 flex justify-start lg:justify-center">
                <Input
                  type="date"
                  value={sheetDate}
                  onChange={(event) => setSheetDate(event.target.value)}
                  className="h-9 w-[160px]"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button className="gap-2" size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleDuplicate}>
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportPdf}>Export PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>Export Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start gap-2 rounded-xl bg-white/80 p-2 shadow-sm">
            <TabsTrigger value="create">Create Cost Sheet</TabsTrigger>
            <TabsTrigger value="standards">Standards Library</TabsTrigger>
            <TabsTrigger value="products">Products Library</TabsTrigger>
            <TabsTrigger value="reports">Reports / History</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <div ref={printRef}>
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-4 w-4 text-slate-500" />
                      Job Setup
                    </CardTitle>
                    <CardDescription>
                      Capture customer, product, and standard details for the sheet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Customer Name</Label>
                        <Input
                          value={jobSetup.customerName}
                          onChange={(event) =>
                            updateJobSetup('customerName', event.target.value)
                          }
                          placeholder="Shree Industrial Works"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Inquiry ID</Label>
                        <Input
                          value={jobSetup.projectRef}
                          onChange={(event) =>
                            updateJobSetup('projectRef', event.target.value)
                          }
                          placeholder="PO-2215 / ESP-12"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Product</Label>
                        <Select
                          value={jobSetup.product}
                          onValueChange={(value) => updateJobSetup('product', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {productOptions.map((product) => (
                              <SelectItem key={product.value} value={product.value}>
                                {product.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Standard</Label>
                        <Select value={jobSetup.standard} onValueChange={handleStandardChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select standard" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredStandardOptions.map((standard) => (
                              <SelectItem key={standard.value} value={standard.value}>
                                {standard.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Total Qty (Nos.)</Label>
                        <Input
                          value={jobSetup.totalQty}
                          onChange={(event) =>
                            updateJobSetup('totalQty', event.target.value)
                          }
                          placeholder="100"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Notes</Label>
                        <Input
                          value={jobSetup.notes}
                          onChange={(event) => updateJobSetup('notes', event.target.value)}
                          placeholder="Special packing or delivery notes"
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Template Picker
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {availableWidths.map((width) => (
                          <Button
                            key={width}
                            variant="outline"
                            size="sm"
                            onClick={() => applyTemplateForWidth(width)}
                          >
                            Width {width}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={handleAddTemplate}
                        >
                          <Plus className="h-4 w-4" />
                          Add template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Layers className="h-4 w-4 text-slate-500" />
                      Variant Selector
                    </CardTitle>
                    <CardDescription>
                      Choose width, length, and thickness to load the standard format.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <Label>Active Variant</Label>
                        <Select
                          value={activeVariantId}
                          onValueChange={(value) => setActiveVariantId(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select variant" />
                          </SelectTrigger>
                          <SelectContent>
                            {variants.map((variant) => (
                              <SelectItem key={variant.id} value={variant.id}>
                                {variant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Developed Width</Label>
                        <Select
                          value={activeVariant?.width}
                          onValueChange={(value) => applyTemplateForWidth(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select width" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableWidths.map((width) => (
                              <SelectItem key={width} value={width}>
                                {width}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Specifications</Label>
                        <Input
                          value={activeVariant?.specification ?? ''}
                          onChange={(event) =>
                            updateActiveVariant({ specification: event.target.value })
                          }
                          placeholder="IS 513 D"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>CE Length</Label>
                        <Input
                          value={activeVariant?.length ?? ''}
                          onChange={(event) =>
                            updateActiveVariant({ length: event.target.value })
                          }
                          placeholder="2500"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Thickness</Label>
                        <Select
                          value={activeVariant?.thickness}
                          onValueChange={(value) =>
                            updateActiveVariant({ thickness: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select thickness" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1.0">1.0</SelectItem>
                            <SelectItem value="1.2">1.2</SelectItem>
                            <SelectItem value="1.25">1.25</SelectItem>
                            <SelectItem value="1.5">1.5</SelectItem>
                            <SelectItem value="1.6">1.6</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Coil width note</Label>
                        <Input
                          value={activeVariant?.coilNote ?? ''}
                          onChange={(event) =>
                            updateActiveVariant({ coilNote: event.target.value })
                          }
                          placeholder="For 616mm wide coils"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">Use standard W/mtr table</p>
                          <p className="text-xs text-muted-foreground">
                            Auto-fill weights from standards library
                          </p>
                        </div>
                        <Switch
                          checked={activeVariant?.useStandardTable ?? true}
                          onCheckedChange={(value) =>
                            updateActiveVariant({ useStandardTable: value })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button className="gap-2" onClick={handleLoadStandardFormat}>
                        <FileSpreadsheet className="h-4 w-4" />
                        Load Standard Format
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={handleAddVariant}>
                        <Plus className="h-4 w-4" />
                        Add Another Variant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-4 w-4 text-slate-500" />
                    Weight Calculation Builder
                  </CardTitle>
                  <CardDescription>
                    Editable grid for weight calculation, aligned with your Excel format.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {presetTypes.map((preset) => (
                        <Button
                          key={preset}
                          variant="outline"
                          size="sm"
                          onClick={() => addPresetRow(preset)}
                        >
                          {preset}
                        </Button>
                      ))}
                    </div>
                    <div className="min-h-[420px] rounded-xl border">
                      <Table className="min-w-[1200px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sl No</TableHead>
                            <TableHead>Item Type</TableHead>
                            <TableHead>Specification</TableHead>
                            <TableHead>Width / OD</TableHead>
                            <TableHead className="min-w-[80px]">Thk</TableHead>
                            <TableHead>Length</TableHead>
                          <TableHead>Qty/Unit</TableHead>
                          <TableHead>Wt/Unit</TableHead>
                          <TableHead>Total Wt</TableHead>
                          <TableHead>Rate/Unit</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Remark</TableHead>
                          <TableHead className="text-right">Delete</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(activeVariant?.rows ?? []).map((row, index) => (
                            <TableRow key={row.id}>
                              <TableCell className="font-medium">
                                {String(index + 1).padStart(2, '0')}
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={row.type}
                                  onChange={(event) =>
                                    updateRow(row.id, 'type', event.target.value)
                                  }
                                  className="h-8 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={row.spec}
                                  onChange={(event) =>
                                    updateRow(row.id, 'spec', event.target.value)
                                  }
                                  className="h-8 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={row.width}
                                  onChange={(event) =>
                                    updateRow(row.id, 'width', event.target.value)
                                  }
                                  className="h-8 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={row.thk}
                                  onChange={(event) =>
                                    updateRow(row.id, 'thk', event.target.value)
                                  }
                                  className="h-8 min-w-[80px] border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={row.length}
                                  onChange={(event) =>
                                    updateRow(row.id, 'length', event.target.value)
                                  }
                                  className="h-8 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={row.qty}
                                  onChange={(event) =>
                                    updateRow(row.id, 'qty', event.target.value)
                                  }
                                  className="h-8 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={row.weight}
                                  onChange={(event) =>
                                    updateRow(row.id, 'weight', event.target.value)
                                  }
                                  className="h-8 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                                />
                              </TableCell>
                              <TableCell>
                                {formatNumber(
                                  getRowTotalWeight(row, totals.totalQty)
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={row.ratePerUnit}
                                  onChange={(event) =>
                                    updateRow(row.id, 'ratePerUnit', event.target.value)
                                  }
                                  className="h-8 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                                />
                              </TableCell>
                              <TableCell>
                                {formatNumber(getRowTotalAmount(row, totals.totalQty))}
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={row.remark}
                                  onChange={(event) =>
                                    updateRow(row.id, 'remark', event.target.value)
                                  }
                                  className="h-8 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteRow(row.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">Delete row</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-orange-50/60">
                            <TableCell colSpan={13}>
                              <div className="flex items-center gap-4 text-xs text-slate-600">
                                <span>Notes: Length of CRCA sheet = total length - 220mm</span>
                                <span>Pipe length = DE length - 390mm</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <Card className="border-slate-200 bg-white/90">
                    <CardContent className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="text-muted-foreground">Total Qty</span>
                        <span className="ml-2 font-semibold">{totals.totalQty} Nos</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="text-muted-foreground">Total Weight</span>
                        <span className="ml-2 font-semibold">
                          {formatNumber(totals.totalWeight)} kg
                        </span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="text-muted-foreground">Weight / Piece</span>
                        <span className="ml-2 font-semibold">
                          {formatNumber(totals.weightPerPiece)} kg
                        </span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="text-muted-foreground">Weight / Meter</span>
                        <span className="ml-2 font-semibold">
                          {formatNumber(totals.weightPerMeter)} kg
                        </span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="text-muted-foreground">Grand total</span>
                        <span className="ml-2 font-semibold">
                          {formatMoney(amountTotals.totalAmount, currency)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="text-muted-foreground">Material Breakup</span>
                        <Badge variant="secondary">CRCA 68%</Badge>
                        <Badge variant="secondary">Pipe 22%</Badge>
                        <Badge variant="secondary">MS 10%</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Scale className="h-4 w-4 text-slate-500" />
                      Rate Inputs
                    </CardTitle>
                    <CardDescription>Update standard rates and overheads.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    {rateFields.map((rate) => (
                      <div
                        key={rate.key}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {rate.label}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <Input
                            className="h-9 max-w-[110px]"
                            value={rates[rate.key as keyof Rates]}
                            onChange={(event) =>
                              updateRates(rate.key as keyof Rates, event.target.value)
                            }
                          />
                          <span className="text-xs text-muted-foreground">{rate.unit}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Cost Output</CardTitle>
                    <CardDescription>Breakdown for the selected variant.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border">
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">Material cost</TableCell>
                            <TableCell className="text-right text-sm">
                              {formatMoney(costSummary.materialCost, currency)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">Labour</TableCell>
                            <TableCell className="text-right text-sm">
                              {formatMoney(costSummary.labourCost, currency)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">Overheads</TableCell>
                            <TableCell className="text-right text-sm">
                              {formatMoney(costSummary.overheadCost, currency)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">Packing</TableCell>
                            <TableCell className="text-right text-sm">
                              {formatMoney(costSummary.packingCost, currency)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">Transport</TableCell>
                            <TableCell className="text-right text-sm">
                              {formatMoney(costSummary.transportCost, currency)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">Total cost</TableCell>
                            <TableCell className="text-right text-sm font-semibold">
                              {formatMoney(costSummary.totalCost, currency)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">Cost / kg</TableCell>
                            <TableCell className="text-right text-sm">
                              {formatMoney(
                                totals.totalWeight > 0
                                  ? costSummary.costPerKg
                                  : 0,
                                currency
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">Cost / piece</TableCell>
                            <TableCell className="text-right text-sm">
                              {formatMoney(costSummary.costPerPiece, currency)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">Suggested margin</TableCell>
                            <TableCell className="text-right text-sm">
                              <Input
                                value={activeVariant?.marginPercent ?? '0'}
                                onChange={(event) =>
                                  updateActiveVariant({ marginPercent: event.target.value })
                                }
                                className="h-8 w-[120px] text-right"
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">Selling rate / piece</TableCell>
                            <TableCell className="text-right text-sm font-semibold">
                              {formatMoney(costSummary.sellingRatePerPiece, currency)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-sm text-muted-foreground">Selling rate / kg</TableCell>
                            <TableCell className="text-right text-sm font-semibold">
                              {formatMoney(costSummary.sellingRatePerKg, currency)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" className="gap-2" onClick={handleApplyMarginToAll}>
                        Apply margin to all variants
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="standards">
            <Card className="mt-6 border-slate-200">
              <CardHeader>
                <CardTitle>Standards Library</CardTitle>
                <CardDescription>
                  Maintain templates, W/mtr tables, and standard rules.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="rounded-xl border p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
                      <div className="grid gap-2">
                        <Label>Standard name</Label>
                        <Input
                          value={newStandardName}
                          onChange={(event) => setNewStandardName(event.target.value)}
                          placeholder="Thermax CE"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Product</Label>
                        <Select
                          value={newStandardProduct}
                          onValueChange={(value) => setNewStandardProduct(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {productOptions.map((product) => (
                              <SelectItem key={product.value} value={product.value}>
                                {product.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Width</Label>
                        <Select
                          value={newStandardWidth}
                          onValueChange={(value) => setNewStandardWidth(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select width" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableWidths.map((width) => (
                              <SelectItem key={width} value={width}>
                                {width}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {presetTypes.map((type) => (
                          <Button
                            key={type}
                            variant="outline"
                            size="sm"
                            onClick={() => addStandardRowByType(type)}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                      <div className="rounded-xl border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item Type</TableHead>
                              <TableHead>Specification</TableHead>
                              <TableHead>Width / OD</TableHead>
                              <TableHead className="min-w-[80px]">Thk</TableHead>
                              <TableHead>Length</TableHead>
                          <TableHead>Qty/Unit</TableHead>
                          <TableHead>Wt/Unit</TableHead>
                          <TableHead>Total Wt</TableHead>
                          <TableHead>Rate/Unit</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Remark</TableHead>
                          <TableHead className="text-right">Remove</TableHead>
                        </TableRow>
                          </TableHeader>
                          <TableBody>
                            {standardRows.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell>
                                  <Input
                                    value={row.type}
                                    onChange={(event) =>
                                      updateStandardRow(row.id, 'type', event.target.value)
                                    }
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={row.spec}
                                    onChange={(event) =>
                                      updateStandardRow(row.id, 'spec', event.target.value)
                                    }
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={row.width}
                                    onChange={(event) =>
                                      updateStandardRow(row.id, 'width', event.target.value)
                                    }
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={row.thk}
                                    onChange={(event) =>
                                      updateStandardRow(row.id, 'thk', event.target.value)
                                    }
                                    className="h-8 min-w-[80px]"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={row.length}
                                    onChange={(event) =>
                                      updateStandardRow(row.id, 'length', event.target.value)
                                    }
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={row.qty}
                                    onChange={(event) =>
                                      updateStandardRow(row.id, 'qty', event.target.value)
                                    }
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={row.weight}
                                    onChange={(event) =>
                                      updateStandardRow(row.id, 'weight', event.target.value)
                                    }
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  {formatNumber(
                                    parseNumber(row.qty) * parseNumber(row.weight)
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={row.ratePerUnit}
                                    onChange={(event) =>
                                      updateStandardRow(row.id, 'ratePerUnit', event.target.value)
                                    }
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  {formatNumber(
                                    parseNumber(row.qty) * parseNumber(row.weight) *
                                      parseNumber(row.ratePerUnit)
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={row.remark}
                                    onChange={(event) =>
                                      updateStandardRow(row.id, 'remark', event.target.value)
                                    }
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeStandardRow(row.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Remove row</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {standardRows.length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={12}
                                  className="text-center text-sm text-muted-foreground"
                                >
                                  Add item types to build the standard template.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        className="h-9"
                        onClick={editingStandardValue ? handleSaveStandardEdit : handleAddStandard}
                        disabled={
                          !newStandardName.trim() ||
                          !newStandardProduct ||
                          !newStandardWidth ||
                          standardRows.length === 0
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {editingStandardValue ? 'Save standard' : 'Add standard'}
                      </Button>
                      <Button
                        variant="outline"
                        className="h-9"
                        disabled={standardHistoryIndex <= 0}
                        onClick={handleUndoStandardChange}
                      >
                        <Undo className="mr-2 h-4 w-4" />
                        Undo
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-xl border">
                    <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Standard</TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead>Width</TableHead>
                              <TableHead>Item Types</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                      <TableBody>
                        {standardOptions.map((standard) => {
                          const custom = customStandards.find(
                            (item) => item.value === standard.value
                          );
                          return (
                            <TableRow key={standard.value}>
                              <TableCell className="font-medium">
                                {standard.label}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {custom?.product
                                  ? productOptions.find(
                                      (product) => product.value === custom.product
                                    )?.label ?? custom.product
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {custom?.width ?? '-'}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {custom?.rows?.length
                                  ? custom.rows.map((row) => row.type).join(', ')
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="inline-flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditStandard(standard.value)}
                                    disabled={!custom}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit standard</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveStandardByValue(standard.value)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove standard</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {standardOptions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                              No standards added yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="mt-6 border-slate-200">
              <CardHeader>
                <CardTitle>Products Library</CardTitle>
                <CardDescription>
                  Manage product categories, defaults, and BOM rules.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                    <div className="grid gap-2">
                      <Label>New product</Label>
                      <Input
                        value={newProductName}
                        onChange={(event) => setNewProductName(event.target.value)}
                        placeholder="Collecting Electrode (CE)"
                      />
                    </div>
                    <Button
                      className="h-9"
                      disabled={!newProductName.trim()}
                      onClick={() => {
                        handleAddProduct(newProductName);
                        setNewProductName('');
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add product
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9"
                      disabled={productHistoryIndex <= 0}
                      onClick={handleUndoProductChange}
                    >
                      <Undo className="mr-2 h-4 w-4" />
                      Undo
                    </Button>
                  </div>
                  <div className="rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Remove</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productOptions.map((product) => (
                          <TableRow key={product.value}>
                            <TableCell className="font-medium">
                              {product.label}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveProductByValue(product.value)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove product</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {productOptions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                              No products added yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="mt-6 border-slate-200">
              <CardHeader>
                <CardTitle>Reports & History</CardTitle>
                <CardDescription>
                  Track revisions, approvals, and historical cost sheets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                      {costSheets.length} saved cost sheet
                      {costSheets.length === 1 ? '' : 's'}.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUndoDelete}
                      disabled={!deletedCostSheet || isUndoingDelete}
                    >
                      <Undo className="mr-2 h-4 w-4" />
                      Undo Delete
                    </Button>
                  </div>
                  <div className="rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cost Sheet No.</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {costSheets.map((record) => {
                          const jobSetupData = record.data as { jobSetup?: JobSetup };
                          const customerName = jobSetupData.jobSetup?.customerName ?? '-';
                          return (
                            <TableRow key={record._id}>
                              <TableCell className="font-medium">
                                {record.costSheetNo}
                              </TableCell>
                              <TableCell>{record.sheetDate || '-'}</TableCell>
                              <TableCell>{customerName || '-'}</TableCell>
                              <TableCell className="text-right">
                                <div className="inline-flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditCostSheet(record)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit cost sheet</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteCostSheet(record)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete cost sheet</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {costSheets.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center text-sm text-muted-foreground"
                            >
                              No cost sheets saved yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
