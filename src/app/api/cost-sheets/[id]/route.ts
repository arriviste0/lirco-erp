import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CostSheet from '@/lib/models/CostSheet';

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
    const costSheet = await CostSheet.findById(params.id);
    if (!costSheet) {
      return NextResponse.json({ error: 'Cost sheet not found' }, { status: 404 });
    }
    return NextResponse.json(costSheet);
  } catch (error) {
    console.error('Error fetching cost sheet:', error);
    return NextResponse.json({ error: 'Failed to fetch cost sheet' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();
    const costSheet = await CostSheet.findByIdAndUpdate(
      params.id,
      {
        costSheetNo: body.costSheetNo,
        sheetDate: body.sheetDate,
        data: body,
      },
      { new: true }
    );
    if (!costSheet) {
      return NextResponse.json({ error: 'Cost sheet not found' }, { status: 404 });
    }
    return NextResponse.json(costSheet);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: 'Cost sheet number already exists' },
        { status: 409 }
      );
    }
    console.error('Error updating cost sheet:', error);
    return NextResponse.json({ error: 'Failed to update cost sheet' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const costSheet = await CostSheet.findByIdAndDelete(params.id);
    if (!costSheet) {
      return NextResponse.json({ error: 'Cost sheet not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cost sheet:', error);
    return NextResponse.json({ error: 'Failed to delete cost sheet' }, { status: 500 });
  }
}
