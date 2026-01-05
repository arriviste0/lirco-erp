import mongoose from 'mongoose';

export interface Quotation {
  _id?: string;
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
  styles?: Record<string, unknown>;
  costSheetNos: string[];
  rows: Array<{
    product: string;
    dimensions: string;
    qty: string;
    rate: string;
  }>;
  assets: {
    logo?: string;
    stamp?: string;
    signature?: string;
    headerBanner?: string;
    footerBanner?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const quotationSchema = new mongoose.Schema(
  {
    offerNo: { type: String, required: true, unique: true },
    offerDate: { type: String, default: '' },
    refNo: { type: String, default: '' },
    refDate: { type: String, default: '' },
    partyName: { type: String, required: true },
    partyAddress: { type: String, default: '' },
    contactNo: { type: String, default: '' },
    kindAttn: { type: String, default: '' },
    dearSir: { type: String, default: '' },
    priceTitle: { type: String, default: '' },
    termsTitle: { type: String, default: '' },
    footerCompany: { type: String, default: '' },
    footerName: { type: String, default: '' },
    notes: { type: String, default: '' },
    terms: { type: String, default: '' },
    styles: { type: mongoose.Schema.Types.Mixed, default: {} },
    costSheetNos: { type: [String], default: [] },
    rows: {
      type: [
        {
          product: { type: String, default: '' },
          dimensions: { type: String, default: '' },
          qty: { type: String, default: '' },
          rate: { type: String, default: '' },
        },
      ],
      default: [],
    },
    assets: {
      logo: { type: String, default: '' },
      stamp: { type: String, default: '' },
      signature: { type: String, default: '' },
      headerBanner: { type: String, default: '' },
      footerBanner: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Quotation ||
  mongoose.model<Quotation>('Quotation', quotationSchema);
