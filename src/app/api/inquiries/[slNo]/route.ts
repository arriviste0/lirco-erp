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
      {
        slNo: params.slNo,
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
      },
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
