
import dbConnect from './mongodb';
import Role from '@/models/role.model';
import User from '@/models/user.model';
import Product from '@/models/product.model';
import bcrypt from 'bcryptjs';

const CATEGORIES = ['Electronics', 'Apparel', 'Books', 'Home Goods', 'Health'];

export const seedDatabase = async () => {
  await dbConnect();

  try {
    // Clear existing data
    await Role.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared existing data.');

    // --- Create Roles ---
    const userRole = new Role({ name: 'user' });
    const adminRole = new Role({ name: 'admin' });
    await userRole.save();
    await adminRole.save();
    console.log('Created roles.');

    // --- Create Admin User ---
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
    
    // --- Create Products ---
    const products = [];
    for (let i = 1; i <= 50; i++) {
      const category = CATEGORIES[i % CATEGORIES.length];
      products.push({
        name: `${category} Product ${i}`,
        description: `This is a detailed description for product number ${i}. It is a high-quality item from the ${category.toLowerCase()} category, designed for modern needs and built to last. Enjoy its premium features and elegant design.`,
        price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
        category: category,
        brand: 'reeva', // Set all products to the 'reeva' brand
        images: [
          `https://picsum.photos/seed/${i}/600/600`,
          `https://picsum.photos/seed/${i}_2/600/600`,
          `https://picsum.photos/seed/${i}_3/600/600`,
          `https://picsum.photos/seed/${i}_4/600/600`,
        ],
        stock: Math.floor(Math.random() * 100),
        rating: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      });
    }

    await Product.insertMany(products);
    console.log(`Created ${products.length} products.`);


    return { success: true, message: 'Database seeded successfully!' };
  } catch (error: any) {
    console.error('Error seeding database:', error);
    throw new Error('Error seeding database: ' + error.message);
  }
};
