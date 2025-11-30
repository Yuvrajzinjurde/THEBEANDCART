
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import { Types } from 'mongoose';

// Helper function to get admin role ID
const getAdminRoleId = async (): Promise<Types.ObjectId | null> => {
    const adminRole = await Role.findOne({ name: 'admin' });
    return adminRole ? adminRole._id : null;
};

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand');

    const adminRoleId = await getAdminRoleId();

    // Base query to exclude admins
    const query: any = {
        ...(adminRoleId && { roles: { $ne: adminRoleId } })
    };

    if (brand && brand !== 'All Brands') {
        query.brand = brand;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        
        const body = await req.json();
        const { status } = body;

        if (!userId || !status) {
            return NextResponse.json({ message: 'User ID and status are required' }, { status: 400 });
        }

        if (!Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
        }

        if (!['active', 'blocked'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { status }, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User status updated successfully', user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error('Failed to update user status:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
