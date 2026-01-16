export type InventoryStatus = {
  id: string;
  material: string;
  size: string;
  pi: string;
  totalRequired: number;
  unit: string;
  presentStock: number;
  requireToOrder: number;
  alreadyOrdered: number;
  orderDate: string;
  orderQuantityBL: number;
  supplier: string;
  ratePc: number;
  history?: HistoryEntry[];
};

export type HistoryEntry = {
  date: string;
  action: string;
  quantityChange: number;
  newQuantity: number;
};

export const initialInventoryStatuses: InventoryStatus[] = [
  {
    id: 'INV-001',
    material: 'Steel Rod',
    size: '10mm',
    pi: 'PI-123',
    totalRequired: 100,
    unit: 'kg',
    presentStock: 50,
    requireToOrder: 50,
    alreadyOrdered: 20,
    orderDate: '2024-12-01',
    orderQuantityBL: 30,
    supplier: 'Supplier A',
    ratePc: 10.5,
    history: [],
  },
  {
    id: 'INV-002',
    material: 'Aluminum Sheet',
    size: '2x4 ft',
    pi: 'PI-124',
    totalRequired: 200,
    unit: 'pcs',
    presentStock: 150,
    requireToOrder: 50,
    alreadyOrdered: 30,
    orderDate: '2024-12-05',
    orderQuantityBL: 20,
    supplier: 'Supplier B',
    ratePc: 25.0,
    history: [],
  },
];