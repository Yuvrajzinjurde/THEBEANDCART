
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';
import { ProductFormSchema } from '@/lib/product-schema';
import { Types } from 'mongoose';


export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: 'Invalid product ID format' }, { status: 400 });
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await req.json();

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid Product ID' }, { status: 400 });
        }

        const validation = ProductFormSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const { variants, ...commonData } = validation.data;
        
        const updateData: any = {
            ...commonData,
            variants: (variants || []).map(v => ({
                ...v,
                availableQuantity: v.stock, // Map stock to availableQuantity
            })),
        };
        
        // Calculate total stock from variants if they exist
        if (updateData.variants && updateData.variants.length > 0) {
            updateData.stock = updateData.variants.reduce((acc: number, v: any) => acc + v.availableQuantity, 0);
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedProduct) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product updated successfully', product: updatedProduct }, { status: 200 });

    } catch (error) {
        console.error('Failed to update product:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
