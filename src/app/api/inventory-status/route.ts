import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InventoryStatus from '@/lib/models/InventoryStatus';
import { initialInventoryStatuses } from '@/lib/inventory-data';

export async function GET() {
  try {
    await dbConnect();

    // Check if collection is empty, if so, seed with initial data
    const count = await InventoryStatus.countDocuments();
    if (count === 0) {
      await InventoryStatus.insertMany(initialInventoryStatuses);
    }

    const inventoryStatuses = await InventoryStatus.find({});
    return NextResponse.json(inventoryStatuses);
  } catch (error) {
    console.error('Error fetching inventory statuses:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory statuses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const inventoryStatus = new InventoryStatus(body);
    await inventoryStatus.save();
    return NextResponse.json(inventoryStatus, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory status:', error);
    return NextResponse.json({ error: 'Failed to create inventory status' }, { status: 500 });
  }
}