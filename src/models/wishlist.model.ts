

import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  products: Types.ObjectId[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

const WishlistSchema: Schema<IWishlist> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });


WishlistSchema.virtual('totalItems').get(function() {
    return this.products.length;
});

// Ensure virtuals are included
WishlistSchema.set('toObject', { virtuals: true });
WishlistSchema.set('toJSON', { virtuals: true });

const Wishlist: Model<IWishlist> = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export default Wishlist;
