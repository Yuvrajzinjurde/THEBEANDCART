

import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import dbConnect from '@/lib/mongodb';
import Wishlist, { IWishlist } from '@/models/wishlist.model';
import Product from '@/models/product.model';
import { Types } from 'mongoose';

interface DecodedToken {
  userId: string;
}

// GET the user's wishlist
export async function GET(req: Request) {
    try {
        await dbConnect();

        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        const decoded = jwtDecode<DecodedToken>(token);
        const userId = decoded.userId;

        const wishlist = await Wishlist.findOne({ userId }).populate('products');
        
        if (!wishlist) {
            return NextResponse.json({ wishlist: { products: [], totalItems: 0 } }, { status: 200 });
        }

        return NextResponse.json({ wishlist }, { status: 200 });

    } catch (error) {
        console.error('Get Wishlist Error:', error);
        if (error instanceof Error && error.name === 'ExpiredSignatureError') {
            return NextResponse.json({ message: 'Session expired, please log in again.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}


// Add or remove a product from the wishlist
export async function POST(req: Request) {
  try {
    await dbConnect();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const decoded = jwtDecode<DecodedToken>(token);
    const userId = decoded.userId;

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
      // Wishlist exists for user
      const productIndex = wishlist.products.findIndex(p => p.toString() === productId);

      if (productIndex > -1) {
        // Product is already in the wishlist, remove it
        wishlist.products.splice(productIndex, 1);
        message = 'Product removed from wishlist.';
      } else {
        // Product is not in the wishlist, add it
        wishlist.products.push(new Types.ObjectId(productId));
        message = 'Product added to wishlist.';
      }
      await wishlist.save();
    } else {
      // No wishlist for user, create a new one
      wishlist = await Wishlist.create({
        userId,
        products: [new Types.ObjectId(productId)],
      });
      message = 'Product added to wishlist.';
    }

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');

    return NextResponse.json({ message, wishlist: populatedWishlist }, { status: 200 });

  } catch (error) {
    console.error('Wishlist Error:', error);
    if (error instanceof Error && error.name === 'ExpiredSignatureError') {
        return NextResponse.json({ message: 'Session expired, please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
