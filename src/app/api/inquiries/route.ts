import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Inquiry from '@/lib/models/Inquiry';

const isDuplicateKeyError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: number }).code === 11000;

export async function GET() {
  try {
    await dbConnect();
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const inquiry = new Inquiry({
      slNo: body.slNo,
      date: body.date,
      name: body.name,
      address: body.address,
      contactNo: body.contactNo ?? '',
      kindAttn: body.kindAttn ?? '',
      sentVia: body.sentVia,
      item: body.item,
      widthOd: body.widthOd,
      thickness: body.thickness,
      length: body.length,
      quantity: body.quantity,
      weightPerNo: body.weightPerNo,
      totalWeight: body.totalWeight,
      offerNo: body.offerNo,
      ratePerPiece: body.ratePerPiece,
      ratePerKg: body.ratePerKg,
      amount: body.amount,
      remarks: body.remarks,
      confirmedPoNo: body.confirmedPoNo,
      reasons: body.reasons,
    });
    await inquiry.save();
    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: 'Inquiry number already exists' },
        { status: 409 }
      );
    }
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 });
  }
}
