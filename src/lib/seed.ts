
'use server';

import dbConnect from './mongodb';
import Product, { IProduct } from '@/models/product.model';
import { Types } from 'mongoose';
import Review from '@/models/review.model';
import User from '@/models/user.model';
import Brand from '@/models/brand.model';

const productTemplates = [
    {
      name: 'Classic Leather Jacket',
      description: "A timeless classic, this genuine leather jacket offers both style and durability. Perfect for a night out or a casual day, it features a sleek design, comfortable lining, and sturdy zippers. A must-have for any wardrobe.",
      baseCategory: 'Apparel',
      brand: 'Reeva',
      storefront: 'reeva',
      keywords: ['jacket', 'leather', 'outerwear', 'fashion'],
      mrp: 14999,
      sellingPrice: 11999
    },
    {
      name: 'Noise-Cancelling Headphones',
      description: "Immerse yourself in pure audio with these state-of-the-art noise-cancelling headphones. Enjoy crystal-clear sound, deep bass, and up to 30 hours of battery life on a single charge. Ergonomically designed for maximum comfort.",
      baseCategory: 'Electronics',
      brand: 'Aura',
      storefront: 'aura',
      keywords: ['headphones', 'audio', 'gadget', 'wireless'],
      mrp: 19999,
      sellingPrice: 14999
    },
    {
      name: 'Organic Cotton Bath Towel Set',
      description: "Wrap yourself in luxury with this ultra-soft and absorbent bath towel set. Made from 100% organic cotton, these towels are gentle on your skin and environmentally friendly. Set includes two bath towels, two hand towels, and two washcloths.",
      baseCategory: 'Home Goods',
      brand: 'Reeva',
      storefront: 'reeva',
      keywords: ['towel', 'bathroom', 'organic', 'home'],
      mrp: 4999,
      sellingPrice: 3499
    },
    {
      name: 'Chronograph Watch',
      description: "A statement of elegance and precision. This stainless steel chronograph watch features a sophisticated dial, water resistance up to 50 meters, and a durable sapphire crystal face. Perfect for both formal and casual occasions.",
      baseCategory: 'Accessories',
      brand: 'Aura',
      storefront: 'aura',
      keywords: ['watch', 'chronograph', 'accessory', 'timepiece'],
      mrp: 24999,
      sellingPrice: 19999
    },
    {
      name: 'Ethereal Diamond Necklace',
      description: "Add a touch of sparkle to any outfit with this exquisite diamond necklace. Featuring a stunning, ethically-sourced diamond set in a delicate 18k white gold chain, it's the perfect gift for a loved one or a special treat for yourself.",
      baseCategory: 'Jewelry',
      brand: 'Reeva',
      storefront: 'reeva',
      keywords: ['necklace', 'diamond', 'jewelry', 'luxury'],
      mrp: 79999,
      sellingPrice: 69999
    },
];

const variantColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Silver', 'Gold'];
const variantSizes = ['S', 'M', 'L', 'XL'];

export async function seedProducts() {
  await dbConnect();
  console.log('Starting product seeding process...');

  await Product.deleteMany({});
  console.log('Cleared existing products.');

  const productsToCreate = [];
  for (const template of productTemplates) {
    const styleId = new Types.ObjectId().toHexString();
    const variantCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 variants
    const usedColors = new Set<string>();

    for (let i = 0; i < variantCount; i++) {
      let color: string;
      do {
        color = variantColors[Math.floor(Math.random() * variantColors.length)];
      } while (usedColors.has(color));
      usedColors.add(color);

      const size = variantSizes[Math.floor(Math.random() * variantSizes.length)];
      const stock = Math.floor(Math.random() * 100) + 10;
      const rating = parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
      
      const images = Array.from({ length: 5 }, (_, j) => `https://picsum.photos/seed/${styleId}-${color}-${j}/600/600`);
      
      productsToCreate.push({
        name: `${template.name} - ${color}, ${size}`,
        description: template.description,
        mrp: template.mrp,
        sellingPrice: template.sellingPrice,
        category: [template.baseCategory, color, template.brand, ...template.keywords.slice(0,2)],
        images,
        stock,
        rating,
        brand: template.brand,
        storefront: template.storefront,
        keywords: template.keywords,
        returnPeriod: 15,
        styleId,
        color,
        size,
        views: Math.floor(Math.random() * 500),
        clicks: Math.floor(Math.random() * 50),
      });
    }
  }

  if (productsToCreate.length > 0) {
    await Product.insertMany(productsToCreate);
    const message = `Successfully seeded database with ${productsToCreate.length} new product variants.`;
    console.log(message);
    return { success: true, message };
  } else {
    const message = "No products were generated to seed.";
    console.log(message);
    return { success: false, message };
  }
}

const reviewTemplates = [
    { rating: 5, review: "Absolutely love this product! The quality is outstanding and it exceeded all my expectations. Highly recommended!" },
    { rating: 4, review: "Very good product. It works as described and I'm happy with my purchase. The color is slightly different than the picture, but still nice." },
    { rating: 5, review: "Five stars! This is exactly what I was looking for. The shipping was fast and the item was well-packaged. Will buy from this brand again." },
    { rating: 3, review: "It's an okay product. It does the job, but I feel like it could be better for the price. The material feels a bit cheap." },
    { rating: 5, review: "A fantastic purchase! I've been using it for a week now and I'm very impressed. The build quality is excellent." }
];

export async function seedReviews() {
    await dbConnect();
    console.log('Starting review seeding...');

    await Review.deleteMany({});
    console.log('Cleared existing reviews.');

    const products = await Product.find({}).limit(50);
    const users = await User.find({ roles: { $ne: 'admin' } }).limit(20);
    const brands = await Brand.find({});

    if (products.length === 0 || users.length === 0) {
        throw new Error('Need at least one product and one non-admin user to seed reviews.');
    }

    const reviewsToCreate = [];
    for (const product of products) {
        const reviewCount = Math.floor(Math.random() * 4); // 0 to 3 reviews per product
        for (let i = 0; i < reviewCount; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomReview = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];

            reviewsToCreate.push({
                productId: product._id,
                userId: randomUser._id,
                userName: `${randomUser.firstName} ${randomUser.lastName.charAt(0)}.`,
                rating: randomReview.rating,
                review: randomReview.review,
            });
        }
    }
    
    let resultMessage = "No reviews to create.";
    if (reviewsToCreate.length > 0) {
        await Review.insertMany(reviewsToCreate);
        resultMessage = `Successfully seeded ${reviewsToCreate.length} reviews.`;
    }

    console.log(resultMessage);
    return { success: true, message: resultMessage };
}


export async function seedDatabase() {
    try {
        const productsResult = await seedProducts();
        const reviewsResult = await seedReviews();
        return {
            success: true,
            message: `${productsResult.message} ${reviewsResult.message}`
        }
    } catch(error: any) {
        console.error('Error during database seeding process:', error);
        throw new Error(`Failed to seed database: ${error.message}`);
    }
}
