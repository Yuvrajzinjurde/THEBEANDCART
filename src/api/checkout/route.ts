
import { NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const checkoutSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
});

interface DecodedToken {
  userId: string;
}

const getUserIdFromToken = (req: Request): string | null => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { amount } = validation.data;

    // Simulate order creation for now
    const simulatedOrder = {
        id: `order_${new Date().getTime()}`,
        entity: "order",
        amount: amount * 100,
        amount_paid: 0,
        amount_due: amount * 100,
        currency: "INR",
        receipt: `receipt_order_${new Date().getTime()}`,
        status: "created",
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000)
    };


    return NextResponse.json({ order: simulatedOrder }, { status: 200 });

  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
