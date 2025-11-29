

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Hamper from '@/models/hamper.model';
import Cart, { ICart } from '@/models/cart.model';
import Product from '@/models/product.model';
import Box from '@/models/box.model';
import { Types } from 'mongoose';

interface DecodedToken {
  sub: string;
}

const getUserIdFromToken = (req: Request): string | null => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decoded.sub;
    } catch (error) {
        return null;
    }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const hamper = await Hamper.findOne({ userId, isComplete: false });

    if (!hamper) {
      return NextResponse.json({ message: 'No active hamper found to checkout.' }, { status: 404 });
    }

    if (hamper.products.length === 0 || !hamper.boxId || !hamper.bagId) {
        return NextResponse.json({ message: 'Hamper is incomplete. Please select products, a box, and a bag.' }, { status: 400 });
    }
    
    // Mark the hamper as complete
    hamper.isComplete = true;
    hamper.isAddedToCart = true;
    await hamper.save();
    
    let cart: ICart | null = await Cart.findOne({ userId });
    
    // Create new cart if it doesn't exist
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }

    // Add all products from the hamper to the cart
    for (const productId of hamper.products) {
        const product = await Product.findById(productId);
        if (product && product.stock > 0) {
            cart.items.push({ productId: new Types.ObjectId(productId), quantity: 1 });
        }
    }

    // Add box and bag as items in the cart
    const box = await Box.findById(hamper.boxId);
    if(box && hamper.boxVariantId) {
        const boxVariant = box.variants.find(v => (v as any)._id.equals(hamper.boxVariantId));
        if (boxVariant && boxVariant.sellingPrice > 0) {
            // This is a simplification. A real app might have boxes as actual products.
            // For now, we find or create a temporary "product" for the box to add to cart
            const productName = `${box.name} (${boxVariant.name})`;
            let boxProduct = await Product.findOne({ name: productName, storefront: 'hamper-assets' });
            if (!boxProduct) {
                boxProduct = new Product({
                    name: productName,
                    storefront: 'hamper-assets',
                    category: 'Packaging',
                    brand: 'Packaging',
                    sellingPrice: boxVariant.sellingPrice,
                    mrp: boxVariant.mrp,
                    images: boxVariant.images,
                    stock: 999
                });
                await boxProduct.save();
            }
            cart.items.push({ productId: boxProduct._id, quantity: 1 });
        }
    }
    
    const bag = await Box.findById(hamper.bagId);
    if(bag && hamper.bagVariantId) {
        const bagVariant = bag.variants.find(v => (v as any)._id.equals(hamper.bagVariantId));
        if (bagVariant && bagVariant.sellingPrice > 0) {
            const productName = `${bag.name} (${bagVariant.name})`;
            let bagProduct = await Product.findOne({ name: productName, storefront: 'hamper-assets' });
             if (!bagProduct) {
                bagProduct = new Product({
                    name: productName,
                    storefront: 'hamper-assets',
                    category: 'Packaging',
                    brand: 'Packaging',
                    sellingPrice: bagVariant.sellingPrice,
                    mrp: bagVariant.mrp,
                    images: bagVariant.images,
                    stock: 999
                });
                await bagProduct.save();
            }
            cart.items.push({ productId: bagProduct._id, quantity: 1 });
        }
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.productId', 'name images sellingPrice mrp stock storefront brand color size maxOrderQuantity');


    return NextResponse.json({ message: 'Hamper added to cart!', cart: populatedCart }, { status: 200 });

  } catch (error) {
    console.error('Hamper Checkout Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
