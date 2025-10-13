

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
        
        const { variants, ...updateData } = validation.data;
        const mainProduct = await Product.findById(id);
        const styleId = mainProduct?.styleId || new Types.ObjectId().toHexString();
        
        if (!variants || variants.length === 0) {
            // Update a single product
            const updatedProduct = await Product.findByIdAndUpdate(id, { ...updateData, styleId }, { new: true });
            if (!updatedProduct) {
                return NextResponse.json({ message: 'Product not found' }, { status: 404 });
            }
            return NextResponse.json({ message: 'Product updated successfully', product: updatedProduct }, { status: 200 });
        }
        
        // Update a product with variants
        const productIdsToKeep: string[] = [];
        const bulkOps = variants.map(variant => {
            const variantData = {
                ...updateData,
                ...variant,
                styleId,
                name: `${updateData.name} - ${variant.color || ''} ${variant.size || ''}`.trim(),
            };

            if ((variant as any)._id) { // Existing variant
                const variantId = (variant as any)._id;
                productIdsToKeep.push(variantId);
                return {
                    updateOne: {
                        filter: { _id: new Types.ObjectId(variantId), styleId },
                        update: { $set: variantData },
                    },
                };
            } else { // New variant
                return {
                    insertOne: {
                        document: variantData,
                    },
                };
            }
        });

        // Delete variants that were removed from the form
        const existingVariants = await Product.find({ styleId });
        const variantsToDelete = existingVariants.filter(v => !productIdsToKeep.includes(v._id.toString()));
        
        for (const variantToDelete of variantsToDelete) {
             bulkOps.push({
                deleteOne: {
                    filter: { _id: variantToDelete._id }
                }
            });
        }
        
        if (bulkOps.length > 0) {
            await Product.bulkWrite(bulkOps as any);
        }

        const updatedProducts = await Product.find({ styleId });

        return NextResponse.json({ message: 'Product catalog updated successfully', products: updatedProducts }, { status: 200 });

    } catch (error) {
        console.error('Failed to update product:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
