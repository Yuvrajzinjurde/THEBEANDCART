
import dbConnect from './mongodb';
import Role from '@/models/role.model';
import User from '@/models/user.model';
import Product from '@/models/product.model';
import Brand from '@/models/brand.model';
import Review from '@/models/review.model';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';


const realisticProducts = [
    {
        name: "Classic Crewneck T-Shirt",
        description: "A timeless wardrobe staple, this crewneck t-shirt is crafted from ultra-soft, breathable 100% premium cotton for all-day comfort. Its classic fit is not too tight, not too loose, making it perfect for layering or wearing on its own. Available in a variety of essential colors.",
        category: "Apparel",
        brand: "Reeva Basics",
        storefront: "reeva",
        variants: [
            {
                color: "Heather Grey", size: "M", stock: 89,
                images: ["https://picsum.photos/seed/grey-tshirt1/600/600", "https://picsum.photos/seed/grey-tshirt2/600/600"]
            },
            {
                color: "Heather Grey", size: "L", stock: 65,
                images: ["https://picsum.photos/seed/grey-tshirt1/600/600", "https://picsum.photos/seed/grey-tshirt2/600/600"]
            },
            {
                color: "Navy Blue", size: "M", stock: 78,
                images: ["https://picsum.photos/seed/blue-tshirt1/600/600", "https://picsum.photos/seed/blue-tshirt2/600/600"]
            },
            {
                color: "Navy Blue", size: "XL", stock: 43,
                images: ["https://picsum.photos/seed/blue-tshirt1/600/600", "https://picsum.photos/seed/blue-tshirt2/600/600"]
            },
             {
                color: "Forrest Green", size: "L", stock: 55,
                images: ["https://picsum.photos/seed/green-tshirt1/600/600", "https://picsum.photos/seed/green-tshirt2/600/600"]
            },
        ],
        tags: ["t-shirt", "apparel", "casual", "cotton", "menswear"],
        mrp: 1299,
        sellingPrice: 799,
    },
    {
        name: "Artisan Roast Coffee Beans",
        description: "Experience the rich, aromatic flavor of our single-origin artisan coffee beans. Sourced from the high-altitude farms of Colombia, these beans are medium-roasted to perfection, unlocking notes of chocolate, citrus, and caramel. Ideal for espresso, French press, or your favorite brewing method.",
        category: "Grocery",
        brand: "The Daily Grind",
        storefront: "reeva",
        variants: [
            {
                size: "250g", stock: 150,
                images: ["https://picsum.photos/seed/coffee1/600/600", "https://picsum.photos/seed/coffee2/600/600"]
            },
            {
                size: "500g", stock: 90,
                images: ["https://picsum.photos/seed/coffee3/600/600", "https://picsum.photos/seed/coffee4/600/600"]
            },
            {
                size: "1kg", stock: 40,
                images: ["https://picsum.photos/seed/coffee5/600/600", "https://picsum.photos/seed/coffee6/600/600"]
            }
        ],
        tags: ["coffee", "beans", "beverage", "grocery", "artisan"],
        mrp: 800,
        sellingPrice: 650,
    },
    {
        name: "Celestial Moonstone Necklace",
        description: "Adorn yourself with the ethereal glow of our Celestial Moonstone Necklace. This enchanting piece features a genuine, ethically-sourced rainbow moonstone, known for its calming energy and connection to the moon's cycles. The minimalist design showcases the stone's natural beauty, set in a delicate 925 sterling silver chain.",
        category: "Women Fashion",
        brand: "Luna Jewels",
        storefront: "nevermore",
        variants: [
            {
                color: "Silver", stock: 60,
                images: ["https://picsum.photos/seed/necklace1/600/600", "https://picsum.photos/seed/necklace2/600/600"]
            },
            {
                color: "Gold Plated", stock: 35,
                images: ["https://picsum.photos/seed/necklace3/600/600", "https://picsum.photos/seed/necklace4/600/600"]
            }
        ],
        tags: ["jewelry", "necklace", "moonstone", "silver", "women"],
        mrp: 4999,
        sellingPrice: 3499,
    },
    {
        name: "Evergreen Scented Soy Candle",
        description: "Bring the crisp, refreshing scent of a forest into your home with our Evergreen Scented Soy Candle. Hand-poured with 100% natural soy wax and infused with a blend of pine, cedarwood, and eucalyptus essential oils, this candle provides a clean, long-lasting burn. Housed in a minimalist ceramic jar that complements any decor.",
        category: "Home & Living",
        brand: "Hearth & Home",
        storefront: "reeva",
        variants: [
            {
                size: "8 oz", stock: 120,
                images: ["https://picsum.photos/seed/candle1/600/600", "https://picsum.photos/seed/candle2/600/600"]
            },
            {
                size: "12 oz", stock: 70,
                images: ["https://picsum.photos/seed/candle3/600/600", "https://picsum.photos/seed/candle4/600/600"]
            }
        ],
        tags: ["candle", "home-decor", "scented", "soy-wax", "evergreen"],
        mrp: 1500,
        sellingPrice: 1100,
    }
];


export const seedDatabase = async () => {
  await dbConnect();

  try {
    console.log('Starting database seed...');

    // --- Clean up old data ---
    console.log('Clearing old products and reviews...');
    await Product.deleteMany({ storefront: { $in: ['reeva', 'nevermore'] } });
    await Review.deleteMany({});
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

    // --- Create Products and Reviews ---
    console.log('Creating new realistic products...');
    let createdProductsCount = 0;
    const reviewPromises = [];

    for (const productTemplate of realisticProducts) {
        const styleId = new Types.ObjectId().toHexString();
        const productDocs = productTemplate.variants.map(variant => ({
            ...productTemplate,
            ...variant,
            styleId,
            name: `${productTemplate.name} - ${variant.color || ''} ${variant.size || ''}`.trim(),
            mrp: productTemplate.mrp,
            sellingPrice: productTemplate.sellingPrice,
            rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
            variants: undefined, // remove nested variants array
        }));
        
        const newProducts = await Product.insertMany(productDocs);
        createdProductsCount += newProducts.length;

        // Create reviews for the first product variant
        const firstProductId = newProducts[0]._id;
        reviewPromises.push(Review.create({
            productId: firstProductId,
            userId: new Types.ObjectId(), // dummy user
            userName: "Alex Doe",
            rating: 5,
            review: "Absolutely fantastic quality! It feels durable and looks even better in person. I've already gotten so many compliments. Highly recommend to anyone on the fence.",
        }));
        if (createdProductsCount % 2 === 0) { // Add a second review for some products
            reviewPromises.push(Review.create({
                productId: firstProductId,
                userId: new Types.ObjectId(), // dummy user
                userName: "Samira Jones",
                rating: 4,
                review: "Really great product, very happy with my purchase. It arrived quickly and was well-packaged. The color is slightly different than the photo, but I still love it.",
            }));
        }
    }

    await Promise.all(reviewPromises);
    console.log(`Created ${createdProductsCount} products and ${reviewPromises.length} reviews.`);
    console.log('Database seed completed successfully!');

    return { success: true, message: `Database seeded successfully with ${createdProductsCount} products and ${reviewPromises.length} reviews.` };

  } catch (error: any) {
    console.error('Error seeding database:', error);
    throw new Error('Error seeding database: ' + error.message);
  }
};

    