import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Inquiry from '@/lib/models/Inquiry';

type RouteParams = {
  params: {
    slNo: string;
  };
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const body = await request.json();
    const updated = await Inquiry.findOneAndUpdate(
      { slNo: params.slNo },
      { ...body, slNo: params.slNo },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const deleted = await Inquiry.findOneAndDelete({ slNo: params.slNo });
    if (!deleted) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
