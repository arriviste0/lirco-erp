import mongoose from 'mongoose';

export interface InventoryStatus {
  _id?: string;
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
  history: any[];
  __v: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const inventoryStatusSchema = new mongoose.Schema({
  id: { type: String, required: true },
  material: { type: String, required: true },
  size: { type: String, required: true },
  pi: { type: String, required: true },
  totalRequired: { type: Number, required: true },
  unit: { type: String, required: true },
  presentStock: { type: Number, required: true },
  requireToOrder: { type: Number, required: true },
  alreadyOrdered: { type: Number, required: true },
  orderDate: { type: String, required: true },
  orderQuantityBL: { type: Number, required: true },
  supplier: { type: String, required: true },
  ratePc: { type: Number, required: true },
  history: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { timestamps: true });

export default mongoose.models.InventoryStatus || mongoose.model('InventoryStatus', inventoryStatusSchema);