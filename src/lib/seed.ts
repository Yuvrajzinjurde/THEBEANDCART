
'use server';

import dbConnect from './mongodb';
import Product from '@/models/product.model';
import Review from '@/models/review.model';
import { Types } from 'mongoose';

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
        console.log('Database connected, starting review seeding process...');

        // 1. Clear only the Review collection
        await Review.deleteMany({});
        console.log('Cleared existing Review collection.');

        // 2. Fetch all products
        const products = await Product.find({}).select('_id');
        if (products.length === 0) {
            const message = "No products found in the database. Cannot seed reviews.";
            console.log(message);
            return { success: true, message };
        }
        
        const reviewsToCreate = [];

        // 3. Create dummy reviews for each product
        for (const product of products) {
            // Create a random number of reviews for each product (1 to 5)
            const reviewCount = Math.floor(Math.random() * 5) + 1;
            for (let i = 0; i < reviewCount; i++) {
                const dummyReview = dummyReviews[Math.floor(Math.random() * dummyReviews.length)];
                reviewsToCreate.push({
                    productId: product._id,
                    userId: new Types.ObjectId(), // Dummy user ID
                    userName: dummyReview.userName,
                    rating: dummyReview.rating,
                    review: dummyReview.review,
                });
            }
        }
        
        // 4. Insert all reviews in one go
        if (reviewsToCreate.length > 0) {
            await Review.insertMany(reviewsToCreate);
            console.log(`Seeded ${reviewsToCreate.length} reviews across ${products.length} products.`);
        }

        const message = `Successfully seeded reviews for ${products.length} products.`;
        console.log(message);
        return { success: true, message };

    } catch (error: any) {
        console.error('Error during database review seeding:', error);
        throw new Error('Failed to seed reviews.');
    }
};
    
