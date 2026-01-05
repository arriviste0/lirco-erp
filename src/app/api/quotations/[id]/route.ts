import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quotation from '@/lib/models/Quotation';

const isDuplicateKeyError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: number }).code === 11000;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const quotation = await Quotation.findById(params.id);
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }
    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json({ error: 'Failed to fetch quotation' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();
    const quotation = await Quotation.findByIdAndUpdate(
      params.id,
      {
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
      },
      { new: true }
    );
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }
    return NextResponse.json(quotation);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: 'Offer number already exists' },
        { status: 409 }
      );
    }
    console.error('Error updating quotation:', error);
    return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const quotation = await Quotation.findByIdAndDelete(params.id);
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 });
  }
}
