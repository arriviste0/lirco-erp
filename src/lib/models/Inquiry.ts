import mongoose from 'mongoose';

export interface Inquiry {
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
  createdAt?: Date;
  updatedAt?: Date;
}

const inquirySchema = new mongoose.Schema(
  {
    slNo: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, default: '' },
    contactNo: { type: String, default: '' },
    kindAttn: { type: String, default: '' },
    sentVia: { type: String, required: true },
    item: { type: String, required: true },
    widthOd: { type: Number, default: 0 },
    thickness: { type: Number, default: 0 },
    length: { type: Number, default: 0 },
    quantity: { type: Number, required: true },
    weightPerNo: { type: Number, default: 0 },
    totalWeight: { type: Number, default: 0 },
    offerNo: { type: String, default: '' },
    ratePerPiece: { type: Number, default: 0 },
    ratePerKg: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
    confirmedPoNo: { type: String, default: '' },
    reasons: { type: String, default: '' },
  },
  { timestamps: true }
);

const existingInquiryModel = mongoose.models.Inquiry as
  | mongoose.Model<Inquiry>
  | undefined;

if (existingInquiryModel) {
  existingInquiryModel.schema.add({
    contactNo: { type: String, default: '' },
    kindAttn: { type: String, default: '' },
  });
}

export default existingInquiryModel ||
  mongoose.model<Inquiry>('Inquiry', inquirySchema);
