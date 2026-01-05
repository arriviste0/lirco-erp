import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quotation from '@/lib/models/Quotation';

const isDuplicateKeyError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: number }).code === 11000;

export async function GET() {
  try {
    await dbConnect();
    const quotations = await Quotation.find({}).sort({ createdAt: -1 });
    return NextResponse.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const quotation = new Quotation({
      offerNo: body.offerNo,
      offerDate: body.offerDate,
      refNo: body.refNo,
      refDate: body.refDate,
      partyName: body.partyName,
      partyAddress: body.partyAddress,
      contactNo: body.contactNo,
      kindAttn: body.kindAttn,
      dearSir: body.dearSir,
      priceTitle: body.priceTitle,
      termsTitle: body.termsTitle,
      footerCompany: body.footerCompany,
      footerName: body.footerName,
      notes: body.notes,
      terms: body.terms,
      styles: body.styles,
      costSheetNos: body.costSheetNos,
      rows: body.rows,
      assets: body.assets,
    });
    await quotation.save();
    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: 'Offer number already exists' },
        { status: 409 }
      );
    }
    console.error('Error creating quotation:', error);
    return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 });
  }
}
