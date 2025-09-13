import dbConnect from './mongodb';
import Role from '@/models/role.model';
import User from '@/models/user.model';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  await dbConnect();

  try {
    // Clear existing data
    await Role.deleteMany({});
    await User.deleteMany({});

    console.log('Cleared existing data.');

    // Create roles
    const userRole = new Role({ name: 'user' });
    const adminRole = new Role({ name: 'admin' });

    await userRole.save();
    await adminRole.save();

    console.log('Created roles.');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt); // Default password, change as needed

    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@reeva.com',
      password: hashedPassword,
      roles: [adminRole._id],
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
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error: any) {
    console.error('Error seeding database:', error);
    throw new Error('Error seeding database: ' + error.message);
  }
};