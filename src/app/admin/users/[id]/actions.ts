
'use server';

import type { IUser } from '@/models/user.model';
import type { IOrder } from '@/models/order.model';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import Order from '@/models/order.model';
import { Types } from 'mongoose';


export interface UserDetails {
    user: IUser;
    orders: IOrder[];
    stats: {
        totalSpend: number;
        totalOrders: number;
        cancelledOrders: number;
    }
}

export async function getUserDetails(userId: string): Promise<UserDetails> {
    try {
        await dbConnect();

        if (!Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid User ID');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });

        const stats = orders.reduce((acc, order) => {
            if (order.status === 'cancelled') {
                acc.cancelledOrders += 1;
            } else {
                acc.totalOrders += 1;
                acc.totalSpend += order.totalAmount;
            }
            return acc;
        }, { totalSpend: 0, totalOrders: 0, cancelledOrders: 0 });

        const userObject = JSON.parse(JSON.stringify(user));
        const ordersObject = JSON.parse(JSON.stringify(orders));

        return { user: userObject, orders: ordersObject, stats };

    } catch (error) {
        console.error('Failed to fetch user details:', error);
        throw new Error('Could not fetch user details from the server.');
    }
}
