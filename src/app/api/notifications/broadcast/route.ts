
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import Notification, { notificationTypes } from '@/models/notification.model';
import { z } from 'zod';

const broadcastSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().optional(),
  type: z.enum(notificationTypes).default('admin_announcement'),
});


export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const validation = broadcastSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { title, message, link, type } = validation.data;
    
    // Find admin role to exclude them from the broadcast
    const adminRole = await Role.findOne({ name: 'admin' });
    const adminRoleId = adminRole ? adminRole._id : null;

    const userQuery = adminRoleId ? { roles: { $ne: adminRoleId } } : {};
    const users = await User.find(userQuery, '_id');

    if (users.length === 0) {
      return NextResponse.json({ message: 'No users found to send notifications to.' }, { status: 200 });
    }
    
    const notifications = users.map(user => ({
      userId: user._id,
      title,
      message,
      link: link || '',
      type,
    }));

    await Notification.insertMany(notifications);

    return NextResponse.json({ message: 'Notifications sent successfully', notificationCount: users.length }, { status: 200 });

  } catch (error) {
    console.error('Failed to broadcast notification:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
