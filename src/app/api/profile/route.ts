import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await dbConnect();

    // For single user system, get the first user or create default
    let user = await User.findOne();
    if (!user) {
      user = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@erp-lite.com',
        phone: '+1 (555) 123-4567',
        bio: 'ERP system administrator with expertise in inventory management and production planning.',
        role: 'Administrator',
        accountStatus: 'Active',
        memberSince: new Date('2024-01-01'),
        lastLogin: new Date(),
      });
      await user.save();
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    let user = await User.findOne();
    if (!user) {
      user = new User(body);
    } else {
      Object.assign(user, body);
    }
    await user.save();

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}