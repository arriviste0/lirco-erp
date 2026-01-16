import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CostSheetConfig from '@/lib/models/CostSheetConfig';

const CONFIG_KEY = 'default';

export async function GET() {
  try {
    await dbConnect();
    const config = await CostSheetConfig.findOne({ key: CONFIG_KEY });
    return NextResponse.json(config ?? null);
  } catch (error) {
    console.error('Error fetching cost sheet config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost sheet config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const config = await CostSheetConfig.findOneAndUpdate(
      { key: CONFIG_KEY },
      {
        key: CONFIG_KEY,
        products: body.products ?? [],
        standards: body.standards ?? [],
        customStandards: body.customStandards ?? [],
        templateWidths: body.templateWidths ?? [],
      },
      { new: true, upsert: true }
    );
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error saving cost sheet config:', error);
    return NextResponse.json(
      { error: 'Failed to save cost sheet config' },
      { status: 500 }
    );
  }
}
