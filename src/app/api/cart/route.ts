
import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import dbConnect from '@/lib/mongodb';
import Cart, { ICart } from '@/models/cart.model';
import Product from '@/models/product.model';
import { Types } from 'mongoose';

interface DecodedToken {
  userId: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const decoded = jwtDecode<DecodedToken>(token);
    const userId = decoded.userId;

    const { productId, quantity } = await req.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ message: 'Product ID and a valid quantity are required' }, { status: 400 });
    }

    if (!Types.ObjectId.isValid(productId)) {
        return NextResponse.json({ message: 'Invalid Product ID' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (product.stock < quantity) {
        return NextResponse.json({ message: 'Not enough stock available' }, { status: 400 });
    }

    let cart: ICart | null = await Cart.findOne({ userId });

    if (cart) {
      // Cart exists for user
      const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);

      if (itemIndex > -1) {
        // Product exists in the cart, update the quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Product does not exist in cart, add new item
        cart.items.push({ productId: new Types.ObjectId(productId), quantity });
      }
      await cart.save();
    } else {
      // No cart for user, create new cart
      cart = await Cart.create({
        userId,
        items: [{ productId: new Types.ObjectId(productId), quantity }],
      });
    }

    return NextResponse.json({ message: 'Product added to cart successfully', cart }, { status: 200 });
  } catch (error) {
    console.error('Add to Cart Error:', error);
    // Check for specific errors if needed, e.g., token expiration
    if (error instanceof Error && error.name === 'ExpiredSignatureError') {
        return NextResponse.json({ message: 'Session expired, please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
