

'use server';

import dbConnect from './mongodb';
import Product from '@/models/product.model';
import Review, { IReview } from '@/models/review.model';
import User from '@/models/user.model';
import Role from '@/models/role.model';
import Coupon from '@/models/coupon.model';
import Brand from '@/models/brand.model';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

const dummyReviews = [
    {
        rating: 5,
        review: "Absolutely love this product! The quality is outstanding and it exceeded all my expectations. Highly recommend to anyone on the fence.",
        userName: "Priya S."
    },
    {
        rating: 4,
        review: "Really good item, works as described. The packaging was great and it arrived on time. Only reason for 4 stars is I wish it came in more colors.",
        userName: "Rahul M."
    },
    {
        rating: 5,
        review: "A game-changer! I've been using this for a few weeks now and the difference is noticeable. Worth every penny.",
        userName: "Anjali K."
    },
    {
        rating: 3,
        review: "It's a decent product, but a bit overpriced for what it is. It does the job, but I've seen similar items for less.",
        userName: "Vikram S."
    },
    {
        rating: 5,
        review: "Perfect! Exactly what I was looking for. The customer service was also excellent when I had a question.",
        userName: "Sunita M."
    },
];

export const seedDatabase = async () => {
    try {
        await dbConnect();
        console.log('Database connected, starting seeding process...');

        // 1. Clear existing Review, non-admin User, and Coupon collections
        await Review.deleteMany({});
        console.log('Cleared existing Review collection.');
        
        await Coupon.deleteMany({});
        console.log('Cleared existing Coupon collection.');

        const adminRole = await Role.findOne({ name: 'admin' });
        if (adminRole) {
            await User.deleteMany({ roles: { $ne: adminRole._id } });
            console.log('Cleared existing non-admin User collection.');
        } else {
            console.log('Admin role not found, skipping user cleanup.');
        }

        // 2. Fetch all products and brands
        const products = await Product.find({}).select('_id storefront');
        if (products.length === 0) {
            const message = "No products found. Cannot seed reviews, users, or coupons.";
            console.log(message);
            return { success: true, message };
        }
        const brands = await Brand.find({}).select('permanentName');
        const brandNames = brands.map(b => b.permanentName);

        const reviewsToCreate: Omit<IReview, keyof Document>[] = [];
        const usersToCreate = new Map<string, any>();
        const userRole = await Role.findOne({ name: 'user' });
        
        if (!userRole) {
            throw new Error("User role not found in database.");
        }

        // 3. Create dummy reviews and prepare user data
        for (const product of products) {
            const reviewCount = Math.floor(Math.random() * 5) + 1;
            for (let i = 0; i < reviewCount; i++) {
                const dummyReview = dummyReviews[Math.floor(Math.random() * dummyReviews.length)];
                
                reviewsToCreate.push({
                    productId: product._id,
                    userId: new Types.ObjectId(), // Placeholder
                    userName: dummyReview.userName,
                    rating: dummyReview.rating,
                    review: dummyReview.review,
                });
                
                if (!usersToCreate.has(dummyReview.userName)) {
                     const [firstName, lastName] = dummyReview.userName.split(' ');
                     const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace('.', '')}@example.com`;
                     const salt = await bcrypt.genSalt(10);
                     const hashedPassword = await bcrypt.hash('password123', salt);

                     usersToCreate.set(dummyReview.userName, {
                         firstName,
                         lastName,
                         email,
                         password: hashedPassword,
                         brand: product.storefront,
                         roles: [userRole._id],
                         status: 'active',
                         address: { street: '', city: '', state: '', zip: '', country: '' }
                     });
                }
            }
        }
        
        // 4. Create dummy coupons
        const couponsToCreate = [];
        for (const brandName of brandNames) {
            couponsToCreate.push({
                code: `${brandName.toUpperCase()}SAVE10`,
                type: 'percentage',
                value: 10,
                minPurchase: 500,
                brand: brandName,
            });
            couponsToCreate.push({
                code: 'FLAT150',
                type: 'fixed',
                value: 150,
                minPurchase: 1000,
                brand: brandName,
            });
        }
         couponsToCreate.push({
            code: 'GLOBALFREESHIP',
            type: 'free-shipping',
            minPurchase: 750,
            brand: 'All Brands',
        });


        // 5. Insert all data
        if (reviewsToCreate.length > 0) {
            await Review.insertMany(reviewsToCreate);
            console.log(`Seeded ${reviewsToCreate.length} reviews.`);
        }
        
        if (usersToCreate.size > 0) {
            const userDocs = Array.from(usersToCreate.values());
            await User.insertMany(userDocs);
            console.log(`Seeded ${usersToCreate.size} users.`);
        }
        
        if (couponsToCreate.length > 0) {
            await Coupon.insertMany(couponsToCreate);
            console.log(`Seeded ${couponsToCreate.length} coupons.`);
        }

        const message = `Successfully seeded ${reviewsToCreate.length} reviews, ${usersToCreate.size} users, and ${couponsToCreate.length} coupons.`;
        console.log(message);
        return { success: true, message };

    } catch (error: any) {
        console.error('Error during database seeding:', error);
        throw new Error(`Failed to seed database: ${error.message}`);
    }
};