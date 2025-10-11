

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Wishlist, { IWishlist } from '@/models/wishlist.model';
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

// GET the user's wishlist
export async function GET(req: Request) {
    try {
        await dbConnect();

        const userId = getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const wishlist = await Wishlist.findOne({ userId }).populate({
            path: 'products',
            model: Product,
            select: 'name images sellingPrice mrp category rating storefront stock brand',
        });
        
        if (!wishlist) {
            return NextResponse.json({ wishlist: { products: [] } }, { status: 200 });
        }

        return NextResponse.json({ wishlist }, { status: 200 });

    } catch (error) {
        console.error('Get Wishlist Error:', error);
        if (error instanceof Error && (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError')) {
            return NextResponse.json({ message: 'Session expired, please log in again.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}


// Add or remove a product from the wishlist
export async function POST(req: Request) {
  try {
    await dbConnect();

    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    if (!Types.ObjectId.isValid(productId)) {
        return NextResponse.json({ message: 'Invalid Product ID' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    let wishlist: IWishlist | null = await Wishlist.findOne({ userId });

    let message: string;

    if (wishlist) {
      const productIndex = wishlist.products.findIndex(p => p.toString() === productId);

      if (productIndex > -1) {
        wishlist.products.splice(productIndex, 1);
        message = 'Product removed from wishlist.';
      } else {
        wishlist.products.push(new Types.ObjectId(productId));
        message = 'Product added to wishlist.';
      }
      await wishlist.save();
    } else {
      wishlist = await Wishlist.create({
        userId,
        products: [new Types.ObjectId(productId)],
      });
      message = 'Product added to wishlist.';
    }

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
        path: 'products',
        model: Product,
        select: 'name images sellingPrice mrp category rating storefront stock brand',
    });

    return NextResponse.json({ message, wishlist: populatedWishlist }, { status: 200 });

  } catch (error) {
    console.error('Wishlist Error:', error);
    if (error instanceof Error && (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError')) {
        return NextResponse.json({ message: 'Session expired, please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
