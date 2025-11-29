
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/order.model';
import Product, { IProduct } from '@/models/product.model';
import User from '@/models/user.model';
import Notification from '@/models/notification.model';
import Cart from '@/models/cart.model';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import Role from '@/models/role.model';
import mongoose from 'mongoose';

const OrderItemSchema = z.object({
    productId: z.string().refine(val => val === 'free-gift-id' || Types.ObjectId.isValid(val), {
        message: "Invalid product ID",
    }),
    quantity: z.number().int().min(1),
    price: z.number().min(0),
    color: z.string().optional().nullable(),
    size: z.string().optional().nullable(),
});


const PlaceOrderSchema = z.object({
    items: z.array(OrderItemSchema),
    subtotal: z.number().min(0),
    shippingAddressId: z.string().refine(val => Types.ObjectId.isValid(val)),
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

        const { items, subtotal, shippingAddressId } = validation.data;
        
        if (items.length === 0) {
            return NextResponse.json({ message: 'Cannot place an empty order.' }, { status: 400 });
        }

        // --- Stock & Price Verification ---
        const productIds = items
            .filter(item => item.productId !== 'free-gift-id') // Exclude free gift from DB query
            .map(item => new Types.ObjectId(item.productId));
            
        const productsFromDB = await Product.find({ '_id': { $in: productIds } });

        let calculatedSubtotal = 0;
        const bulkWriteOps = [];

        for (const item of items) {
            // Skip the free gift from verification logic
            if (item.productId === 'free-gift-id') continue;

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
            return NextResponse.json({ message: `Total amount mismatch. Please try again. Client: ${subtotal}, Server: ${calculatedSubtotal}` }, { status: 409 });
        }
        
        const user = await User.findById(userId);
        if (!user) {
             return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        const shippingAddress = user.addresses.find(addr => (addr._id as Types.ObjectId).toString() === shippingAddressId);
        if (!shippingAddress) {
            return NextResponse.json({ message: 'Shipping address not found.' }, { status: 404 });
        }

        // --- Create Order ---
        const itemsForOrder = items.map(item => {
            if (item.productId === 'free-gift-id') {
                // Use a consistent, static ID for the free gift placeholder product
                return { ...item, productId: new Types.ObjectId('66a9354045a279093079919f') }; 
            }
            return { ...item, productId: new Types.ObjectId(item.productId) }
        });

        const newOrder = new Order({
            userId,
            products: itemsForOrder,
            totalAmount: calculatedSubtotal, // The server-verified subtotal becomes the order's total amount
            status: 'pending',
            brand: auth.brand,
            shippingAddress: shippingAddress.toObject(),
        });
        
        await newOrder.save();
        
        // Only perform stock updates for actual products
        if (bulkWriteOps.length > 0) {
            await Product.bulkWrite(bulkWriteOps);
        }
        
        // Clear user's cart
        await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

        // --- Notification for customer ---
        try {
            await Notification.create({
                recipientUsers: [userId],
                title: 'Order Placed!',
                message: `Your order #${newOrder.orderId} for ₹${calculatedSubtotal.toFixed(2)} has been placed successfully.`,
                type: 'order_success',
                link: `/dashboard/orders/${newOrder._id}`,
            });
        } catch (notificationError) {
            // Log the error but don't fail the entire order process
            console.error("Failed to create customer notification:", notificationError);
        }
        

        return NextResponse.json({ message: 'Order placed successfully', orderId: newOrder._id }, { status: 201 });

    } catch (error: any) {
        console.error('Place Order Error:', error);
        return NextResponse.json({ message: `An internal server error occurred: ${error.message}` }, { status: 500 });
    }
}
