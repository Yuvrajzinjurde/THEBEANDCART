
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
        const mainProduct = await Product.findById(id);
        const styleId = mainProduct?.styleId || new Types.ObjectId().toHexString();
        
        if (!variants || variants.length === 0) {
            // This is a simple update for a single product without variants
            const updatedProduct = await Product.findByIdAndUpdate(id, { ...commonData, styleId }, { new: true });
            if (!updatedProduct) {
                return NextResponse.json({ message: 'Product not found' }, { status: 404 });
            }
            return NextResponse.json({ message: 'Product updated successfully', products: [updatedProduct] }, { status: 200 });
        }
        
        // This is an update for a product with variants (a catalog)
        const variantIdsFromPayload = variants.map(v => (v as any)._id).filter(Boolean).map(vid => new Types.ObjectId(vid));
        
        // Delete variants that are no longer in the payload
        await Product.deleteMany({
            styleId: styleId,
            _id: { $nin: variantIdsFromPayload }
        });

        // Update existing variants and insert new ones
        const bulkOps = variants.map(variant => {
            const variantData = {
                ...commonData,
                ...variant,
                styleId,
                name: `${commonData.name} - ${variant.color || ''} ${variant.size || ''}`.trim(),
            };
            
            if ((variant as any)._id) {
                // Update existing variant
                return {
                    updateOne: {
                        filter: { _id: new Types.ObjectId((variant as any)._id), styleId },
                        update: { $set: variantData },
                        upsert: false // Do not create a new doc if it doesn't exist
                    }
                };
            } else {
                // Insert new variant
                return {
                    insertOne: {
                        document: variantData
                    }
                };
            }
        });
        
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
