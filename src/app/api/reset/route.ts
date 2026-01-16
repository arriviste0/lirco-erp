import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InventoryStatus from '@/lib/models/InventoryStatus';

export async function POST() {
  try {
    await dbConnect();

    // Clear all inventory statuses
    await InventoryStatus.deleteMany({});

    return NextResponse.json({ message: 'Data reset successfully' });
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
  }
}