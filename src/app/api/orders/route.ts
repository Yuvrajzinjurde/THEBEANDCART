
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/order.model';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: Request) {
    try {
        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');

        if (!startDateStr || !endDateStr) {
            return NextResponse.json({ message: 'Start date and end date are required.' }, { status: 400 });
        }

        const startDate = startOfDay(new Date(startDateStr));
        const endDate = endOfDay(new Date(endDateStr));

        const orders = await Order.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        }).sort({ createdAt: -1 });

        return NextResponse.json({ orders }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
