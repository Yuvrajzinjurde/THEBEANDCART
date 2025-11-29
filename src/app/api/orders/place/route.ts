
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/order.model';
import Product from '@/models/product.model';
import User from '@/models/user.model';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const OrderItemSchema = z.object({
    productId: z.string().refine(val => Types.ObjectId.isValid(val)),
    quantity: z.number().int().min(1),
    price: z.number().min(0),
    color: z.string().optional(),
    size: z.string().optional(),
});

const PlaceOrderSchema = z.object({
    items: z.array(OrderItemSchema),
    subtotal: z.number().min(0),
});

interface DecodedToken {
  sub: string;
  brand: string;
}

const getAuthFromToken = (req: Request): DecodedToken | null => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        
        const auth = getAuthFromToken(req);
        if (!auth) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        const userId = new Types.ObjectId(auth.sub);
        
        const body = await req.json();
        const validation = PlaceOrderSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid order data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { items, subtotal } = validation.data;
        
        if (items.length === 0) {
            return NextResponse.json({ message: 'Cannot place an empty order.' }, { status: 400 });
        }

        // --- Stock & Price Verification ---
        const productIds = items.map(item => new Types.ObjectId(item.productId));
        const productsFromDB = await Product.find({ '_id': { $in: productIds } });

        let calculatedSubtotal = 0;
        const bulkWriteOps = [];

        for (const item of items) {
            const product = productsFromDB.find(p => p._id.toString() === item.productId);
            if (!product) {
                return NextResponse.json({ message: `Product with ID ${item.productId} not found.` }, { status: 404 });
            }
            if (product.stock < item.quantity) {
                return NextResponse.json({ message: `Not enough stock for ${product.name}. Only ${product.stock} available.` }, { status: 400 });
            }
            if (product.sellingPrice !== item.price) {
                 return NextResponse.json({ message: `Price for ${product.name} has changed. Please refresh your cart.` }, { status: 409 });
            }
            
            calculatedSubtotal += item.price * item.quantity;
            
            bulkWriteOps.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: { $inc: { stock: -item.quantity } },
                }
            });
        }
        
        // Allow a small tolerance for floating point inaccuracies
        if (Math.abs(calculatedSubtotal - subtotal) > 0.01) {
            return NextResponse.json({ message: `Total amount mismatch. Please try again.` }, { status: 409 });
        }
        
        const user = await User.findById(userId);
        if (!user) {
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }


        // --- Create Order ---
        const newOrder = new Order({
            userId,
            products: items.map(item => ({...item, productId: new Types.ObjectId(item.productId)})),
            totalAmount: calculatedSubtotal, // Use the server-calculated total
            status: 'pending',
            brand: auth.brand,
            shippingAddress: user.address,
        });
        
        await newOrder.save();
        await Product.bulkWrite(bulkWriteOps);

        // --- Notifications Removed due to persistent errors ---
        // This section can be re-implemented correctly later.

        return NextResponse.json({ message: 'Order placed successfully', orderId: newOrder._id }, { status: 201 });

    } catch (error) {
        console.error('Place Order Error:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
