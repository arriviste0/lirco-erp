import mongoose from 'mongoose';

export interface ICostSheet {
  _id?: string;
  costSheetNo: string;
  sheetDate: string;
  data: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

const costSheetSchema = new mongoose.Schema(
  {
    costSheetNo: { type: String, required: true, unique: true },
    sheetDate: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.CostSheet ||
  mongoose.model<ICostSheet>('CostSheet', costSheetSchema);
