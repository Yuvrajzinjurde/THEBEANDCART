
import dbConnect from './mongodb';
import Role from '@/models/role.model';
import User from '@/models/user.model';
import Product from '@/models/product.model';
import Brand from '@/models/brand.model';
import bcrypt from 'bcryptjs';

const CATEGORIES = ['Electronics', 'Apparel', 'Books', 'Home Goods', 'Health'];

export const seedDatabase = async () => {
  await dbConnect();

  try {
    // --- Check for Roles and Admin User, create if they don't exist ---
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
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@reeva.com',
        password: hashedPassword,
        roles: [adminRole._id],
        brand: 'reeva',
        address: {
          street: '123 Admin St',
          city: 'Adminville',
          state: 'AS',
          zip: '12345',
          country: 'USA'
        }
      });
      await adminUser.save();
      console.log('Created admin user.');
    }
    
    // --- Create Default Brand if it doesn't exist ---
    const reevaBrandExists = await Brand.findOne({ permanentName: 'reeva' });
    if (!reevaBrandExists) {
      const reevaBrand = new Brand({
        displayName: 'Reeva',
        permanentName: 'reeva',
        logoUrl: 'https://picsum.photos/seed/reevalogo/200/200',
        banners: [
          {
            title: 'Welcome to Reeva',
            description: 'Your one-stop shop for everything you need.',
            imageUrl: 'https://picsum.photos/seed/reevabanner1/1600/400',
            imageHint: 'modern storefront',
          },
          {
            title: 'Summer Sale!',
            description: 'Up to 50% off on selected items. Dont miss out!',
            imageUrl: 'https://picsum.photos/seed/reevabanner2/1600/400',
            imageHint: 'shopping sale',
          }
        ],
        themeName: 'Blue',
        offers: [
            {
                title: 'Mega Monsoon Sale',
                description: 'Get flat 20% off on all items. Limited time offer!',
                code: 'MONSOON20',
            },
            {
                title: 'First-Time User?',
                description: 'Use this code to get a special discount on your first purchase.',
                code: 'NEWBIE15',
            },
            {
                title: 'Weekend Bonanza',
                description: 'Enjoy free shipping on all orders above ₹999.',
                code: 'WEEKEND',
            },
        ],
        reviews: [
            {
                customerName: 'Aisha Khan',
                rating: 5,
                reviewText: 'Absolutely love the quality and service. My go-to store for all fashion needs!',
                customerAvatarUrl: 'https://picsum.photos/seed/avatar1/100/100'
            },
            {
                customerName: 'Rohan Sharma',
                rating: 4,
                reviewText: 'Great collection and fast delivery. The packaging was also very impressive. Will shop again.',
                customerAvatarUrl: 'https://picsum.photos/seed/avatar2/100/100'
            },
            {
                customerName: 'Priya Singh',
                rating: 5,
                reviewText: 'Reeva never disappoints! Found exactly what I was looking for. Highly recommended to everyone.',
                customerAvatarUrl: 'https://picsum.photos/seed/avatar3/100/100'
            }
        ],
        promoBanner: {
            title: 'The Style Update',
            description: 'Discover the latest trends and refresh your wardrobe with our new arrivals. Explore curated collections just for you.',
            imageUrl: 'https://picsum.photos/seed/promobanner/1200/600',
            imageHint: 'fashion collection',
            buttonText: 'Shop New Arrivals',
            buttonLink: '/reeva/products'
        }
      });
      await reevaBrand.save();
      console.log('Created default "reeva" brand.');
    }


    // --- Check for existing products for the 'reeva' storefront ---
    const existingProducts = await Product.find({ storefront: 'reeva' });
    
    if (existingProducts.length > 0) {
        // --- Update Existing Products ---
        let updatedCount = 0;
        for (const product of existingProducts) {
            const mrp = parseFloat((Math.random() * 100 + 50).toFixed(2));
            const sellingPrice = parseFloat((mrp - (mrp * Math.random() * 0.5)).toFixed(2)); // 0-50% discount
            
            product.mrp = mrp;
            product.sellingPrice = sellingPrice;
            
            await product.save();
            updatedCount++;
        }
        console.log(`Updated ${updatedCount} products for storefront 'reeva' with new MRP and selling prices.`);
    } else {
        // --- Create New Products if none exist ---
        console.log("No products found for storefront 'reeva'. Seeding new products.");
        const products = [];
        for (let i = 1; i <= 50; i++) {
            const category = CATEGORIES[i % CATEGORIES.length];
            const mrp = parseFloat((Math.random() * 200 + 50).toFixed(2));
            const sellingPrice = parseFloat((mrp - (mrp * Math.random() * 0.4)).toFixed(2));

            products.push({
                name: `${category} Product ${i}`,
                description: `This is a detailed description for product number ${i}. It is a high-quality item from the ${category.toLowerCase()} category, designed for modern needs and built to last. Enjoy its premium features and elegant design.`,
                mrp: mrp,
                sellingPrice: sellingPrice,
                category: category,
                brand: 'Reeva Originals', // The product's actual brand
                storefront: 'reeva', // The storefront it belongs to
                images: [
                    `https://picsum.photos/seed/${i}/600/600`,
                    `https://picsum.photos/seed/${i}_2/600/600`,
                    `https://picsum.photos/seed/${i}_3/600/600`,
                    `https://picsum.photos/seed/${i}_4/600/600`,
                ],
                stock: Math.floor(Math.random() * 100),
                rating: parseFloat((Math.random() * 4 + 1).toFixed(1)), // Rating between 1.0 and 5.0
            });
        }
        await Product.insertMany(products);
        console.log(`Created ${products.length} products for storefront 'reeva'.`);
    }

    return { success: true, message: 'Database seed/update completed successfully!' };
  } catch (error: any) {
    console.error('Error seeding database:', error);
    throw new Error('Error seeding database: ' + error.message);
  }
};
