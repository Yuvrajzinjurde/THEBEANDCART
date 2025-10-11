

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Cart, { ICart } from '@/models/cart.model';
import Product from '@/models/product.model';
import { Types } from 'mongoose';

interface DecodedToken {
  userId: string;
}

const getUserIdFromToken = (req: Request): string | null => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.decode(token) as DecodedToken;
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

// GET the user's cart
export async function GET(req: Request) {
    try {
        await dbConnect();
        
        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const cart = await Cart.findOne({ userId }).populate('items.productId', 'name images sellingPrice mrp stock storefront brand color size');
        if (!cart) {
            return NextResponse.json({ cart: { items: [], totalItems: 0 } }, { status: 200 });
        }

        return NextResponse.json({ cart }, { status: 200 });

    } catch (error) {
        console.error('Get Cart Error:', error);
        if (error instanceof Error && (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError')) {
            return NextResponse.json({ message: 'Session expired, please log in again.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}


export async function POST(req: Request) {
  try {
    await dbConnect();

    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { productId, quantity, size, color } = await req.json();

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
      // Cart exists for user. Check if the exact variant is already in the cart.
      const itemIndex = cart.items.findIndex(item => 
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (itemIndex > -1) {
        // Product variant exists in the cart, update the quantity
        cart.items[itemIndex].quantity = quantity;
      } else {
        // Product variant does not exist in cart, add new item
        cart.items.push({ productId: new Types.ObjectId(productId), quantity, size, color });
      }
      await cart.save();
    } else {
      // No cart for user, create new cart
      cart = await Cart.create({
        userId,
        items: [{ productId: new Types.ObjectId(productId), quantity, size, color }],
      });
    }

    const populatedCart = await Cart.findById(cart._id).populate('items.productId', 'name images sellingPrice mrp stock storefront brand color size');

    return NextResponse.json({ message: 'Cart updated successfully', cart: populatedCart }, { status: 200 });
  } catch (error) {
    console.error('Update Cart Error:', error);
    if (error instanceof Error && (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError')) {
        return NextResponse.json({ message: 'Session expired, please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
    try {
        await dbConnect();

        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        if (cart.items.length === initialLength) {
            return NextResponse.json({ message: 'Product not found in cart' }, { status: 404 });
        }

        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate('items.productId', 'name images sellingPrice mrp stock storefront brand color size');

        return NextResponse.json({ message: 'Product removed from cart', cart: populatedCart }, { status: 200 });

    } catch (error) {
        console.error('Remove from Cart Error:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
