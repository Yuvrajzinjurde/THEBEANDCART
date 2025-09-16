
import dbConnect from './mongodb';
import Role from '@/models/role.model';
import User from '@/models/user.model';
import Product from '@/models/product.model';
import Brand from '@/models/brand.model';
import Review from '@/models/review.model';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

const CATEGORIES = [
    "Men Fashion", "Women Fashion", "Home & Living", "Kids & Toys",
    "Personal Care & Wellness", "Mobiles & Tablets", "Consumer Electronics",
    "Appliances", "Automotive", "Beauty & Personal Care", "Home Utility",
    "Kids", "Grocery", "Women", "Home & Kitchen", "Health & Wellness",
    "Beauty & Makeup", "Personal Care", "Men'S Grooming",
    "Craft & Office Supplies", "Sports & Fitness", "Automotive Accessories",
    "Pet Supplies", "Office Supplies & Stationery",
    "Industrial & Scientific Products", "Musical Instruments", "Books",
    "Eye Utility", "Bags, Luggage & Travel Accessories", "Mens Personal Care & Grooming"
];


export const seedDatabase = async () => {
  await dbConnect();

  try {
    console.log('Starting database seed...');

    // --- Clean up old data ---
    console.log('Clearing old products and reviews for seeded brands...');
    await Product.deleteMany({ storefront: { $in: ['reeva', 'nevermore'] } });
    await Review.deleteMany({}); // Clearing all reviews
    console.log('Old data cleared.');
    

    // --- Ensure Roles and Admin User exist ---
    let userRole = await Role.findOne({ name: 'user' });
    let adminRole = await Role.findOne({ name: 'admin' });

    if (!userRole) {
      userRole = new Role({ name: 'user' });
      await userRole.save();
      console.log('Created user role.');
    }
    if (!adminRole) {
      adminRole = new Role({ name: 'admin' });
      await adminRole.save();
      console.log('Created admin role.');
    }

    const adminUserExists = await User.findOne({ email: 'admin@reeva.com' });
    if (!adminUserExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      const adminUser = new User({
        firstName: 'Admin', lastName: 'User', email: 'admin@reeva.com',
        password: hashedPassword, roles: [adminRole._id], brand: 'reeva',
        address: { street: '123 Admin St', city: 'Adminville', state: 'AS', zip: '12345', country: 'USA' }
      });
      await adminUser.save();
      console.log('Created admin user.');
    }
    
    // --- Upsert Brands ---
    const reevaBrandData = {
      displayName: 'Reeva', permanentName: 'reeva', logoUrl: 'https://picsum.photos/seed/reevalogo/200/200',
      banners: [
        { title: 'Welcome to Reeva', description: 'Your one-stop shop for everything you need.', imageUrl: 'https://picsum.photos/seed/reevabanner1/1600/400', imageHint: 'modern storefront' },
        { title: 'Summer Sale!', description: 'Up to 50% off on selected items. Dont miss out!', imageUrl: 'https://picsum.photos/seed/reevabanner2/1600/400', imageHint: 'shopping sale' }
      ],
      themeName: 'Blue',
      offers: [
          { title: 'Mega Monsoon Sale', description: 'Get flat 20% off on all items. Limited time offer!', code: 'MONSOON20' },
          { title: 'First-Time User?', description: 'Use this code to get a special discount on your first purchase.', code: 'NEWBIE15' },
          { title: 'Weekend Bonanza', description: 'Enjoy free shipping on all orders above ₹999.', code: 'WEEKEND' },
      ],
      reviews: [
          { customerName: 'Aisha Khan', rating: 5, reviewText: 'Absolutely love the quality and service. My go-to store for all fashion needs!', customerAvatarUrl: 'https://picsum.photos/seed/avatar1/100/100' },
          { customerName: 'Rohan Sharma', rating: 4, reviewText: 'Great collection and fast delivery. The packaging was also very impressive. Will shop again.', customerAvatarUrl: 'https://picsum.photos/seed/avatar2/100/100' },
          { customerName: 'Priya Singh', rating: 5, reviewText: 'Reeva never disappoints! Found exactly what I was looking for. Highly recommended to everyone.', customerAvatarUrl: 'https://picsum.photos/seed/avatar3/100/100' }
      ],
      promoBanner: {
          title: 'The Style Update', description: 'Discover the latest trends and refresh your wardrobe with our new arrivals. Explore curated collections just for you.',
          imageUrl: 'https://picsum.photos/seed/reevapromo/1200/600', imageHint: 'fashion collection', buttonText: 'Shop New Arrivals', buttonLink: '/reeva/products'
      },
      categoryBanners: [
          { categoryName: "Women's Fashion", imageUrl: "https://picsum.photos/seed/cat1/400/600", imageHint: "woman fashion" },
          { categoryName: "Men's Fashion", imageUrl: "https://picsum.photos/seed/cat2/400/400", imageHint: "man fashion" },
          { categoryName: "Kids & Toys", imageUrl: "https://picsum.photos/seed/cat3/400/400", imageHint: "kids toys" },
          { categoryName: "Home & Living", imageUrl: "https://picsum.photos/seed/cat4/400/600", imageHint: "living room" },
          { categoryName: "Beauty", imageUrl: "https://picsum.photos/seed/cat5/400/400", imageHint: "beauty products" },
          { categoryName: "Electronics", imageUrl: "https://picsum.photos/seed/cat6/400/400", imageHint: "gadgets electronics" },
          { categoryName: "Groceries", imageUrl: "https://picsum.photos/seed/cat7/400/600", imageHint: "fresh groceries" },
          { categoryName: "Sports", imageUrl: "https://picsum.photos/seed/cat8/400/400", imageHint: "sports equipment" },
          { categoryName: "Books", imageUrl: "https://picsum.photos/seed/cat9/400/400", imageHint: "old books" },
      ]
    };
    await Brand.findOneAndUpdate({ permanentName: 'reeva' }, reevaBrandData, { upsert: true, new: true });
    console.log('Upserted "reeva" brand.');

    const nevermoreBrandData = {
      displayName: 'Nevermore', permanentName: 'nevermore', logoUrl: 'https://picsum.photos/seed/nevermorelogo/200/200',
      banners: [{ title: 'Nevermore: Style Redefined', description: 'Embrace the darkness. Unique fashion for the bold.', imageUrl: 'https://picsum.photos/seed/nevermorebanner1/1600/400', imageHint: 'dark fashion' }],
      themeName: 'Slate (Dark)',
      offers: [{ title: 'Eternal Night Sale', description: '25% off all black apparel.', code: 'ETERNAL25' }],
      reviews: [{ customerName: 'Edgar A.', rating: 5, reviewText: 'Quoth the raven, "This is amazing!"', customerAvatarUrl: 'https://picsum.photos/seed/avatar4/100/100' }],
      promoBanner: {
          title: 'Gothic Glamour', description: 'Unleash your inner enigma with our latest collection of gothic-inspired attire.',
          imageUrl: 'https://picsum.photos/seed/nevermorepromo/1200/600', imageHint: 'gothic fashion', buttonText: 'Explore the Shadows', buttonLink: '/nevermore/products'
      },
      categoryBanners: [
          { categoryName: "Corsets", imageUrl: "https://picsum.photos/seed/nmcat1/400/600", imageHint: "gothic corset" },
          { categoryName: "Gowns", imageUrl: "https://picsum.photos/seed/nmcat2/400/400", imageHint: "black gown" },
          { categoryName: "Accessories", imageUrl: "https://picsum.photos/seed/nmcat3/400/400", imageHint: "gothic accessories" },
      ]
    };
    await Brand.findOneAndUpdate({ permanentName: 'nevermore' }, nevermoreBrandData, { upsert: true, new: true });
    console.log('Upserted "nevermore" brand.');

    // --- Create Products ---
    console.log('Generating 100 new products...');
    const productsToCreate = [];
    const brandsToSeed = ['reeva', 'nevermore'];

    for (const storefront of brandsToSeed) {
        for (let i = 1; i <= 50; i++) {
            const category = CATEGORIES[i % CATEGORIES.length];
            const sellingPrice = Math.floor(Math.random() * 5000) + 500;
            const mrp = sellingPrice + Math.floor(Math.random() * 1000) + 200;

            const product = {
                name: `${storefront.charAt(0).toUpperCase() + storefront.slice(1)} Product #${i}`,
                description: `This is a high-quality ${category.toLowerCase()} product from ${storefront}. Item number ${i} is designed for excellence and durability.`,
                mrp,
                sellingPrice,
                category,
                images: [], // Ensure no images are seeded
                stock: Math.floor(Math.random() * 200),
                rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
                brand: `${storefront.charAt(0).toUpperCase() + storefront.slice(1)} Designs`,
                storefront: storefront,
                tags: [storefront, category.split(' ')[0]],
                styleId: new Types.ObjectId().toHexString(),
            };
            productsToCreate.push(product);
        }
    }
    
    await Product.insertMany(productsToCreate);
    console.log(`Created ${productsToCreate.length} products.`);

    console.log('Database seed completed successfully!');

    return { success: true, message: `Database seeded successfully with ${productsToCreate.length} products.` };

  } catch (error: any) {
    console.error('Error seeding database:', error);
    throw new Error('Error seeding database: ' + error.message);
  }
};
