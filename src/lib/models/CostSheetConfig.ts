import mongoose from 'mongoose';

export interface ICostSheetConfig {
  key: string;
  products: { value: string; label: string }[];
  standards: { value: string; label: string }[];
  customStandards: Record<string, unknown>[];
  templateWidths: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const costSheetConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    products: [
      {
        value: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
    standards: [
      {
        value: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
    customStandards: { type: [mongoose.Schema.Types.Mixed], default: [] },
    templateWidths: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.CostSheetConfig ||
  mongoose.model<ICostSheetConfig>('CostSheetConfig', costSheetConfigSchema);
