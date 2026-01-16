import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InventoryStatus from '@/lib/models/InventoryStatus';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const updatedInventoryStatus = await InventoryStatus.findOneAndUpdate(
      { id },
      body,
      { new: true }
    );
    if (!updatedInventoryStatus) {
      return NextResponse.json({ error: 'Inventory status not found' }, { status: 404 });
    }
    return NextResponse.json(updatedInventoryStatus);
  } catch (error) {
    console.error('Error updating inventory status:', error);
    return NextResponse.json({ error: 'Failed to update inventory status' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const deletedInventoryStatus = await InventoryStatus.findOneAndDelete({ id });
    if (!deletedInventoryStatus) {
      return NextResponse.json({ error: 'Inventory status not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Inventory status deleted' });
  } catch (error) {
    console.error('Error deleting inventory status:', error);
    return NextResponse.json({ error: 'Failed to delete inventory status' }, { status: 500 });
  }
}