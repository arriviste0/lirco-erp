import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CostSheet from '@/lib/models/CostSheet';

const isDuplicateKeyError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: number }).code === 11000;

export async function GET() {
  try {
    await dbConnect();
    const costSheets = await CostSheet.find({}).sort({ createdAt: -1 });
    return NextResponse.json(costSheets);
  } catch (error) {
    console.error('Error fetching cost sheets:', error);
    return NextResponse.json({ error: 'Failed to fetch cost sheets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const costSheet = new CostSheet({
      costSheetNo: body.costSheetNo,
      sheetDate: body.sheetDate,
      data: body,
    });
    await costSheet.save();
    return NextResponse.json(costSheet, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: 'Cost sheet number already exists' },
        { status: 409 }
      );
    }
    console.error('Error creating cost sheet:', error);
    return NextResponse.json({ error: 'Failed to create cost sheet' }, { status: 500 });
  }
}
