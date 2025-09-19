

'use server';

import dbConnect from './mongodb';
import Box from '@/models/box.model';

const boxTemplates = [
    // Cardboard Boxes
    {
      name: 'Small Cardboard Box',
      description: 'A sturdy and reliable small cardboard box, perfect for shipping individual items securely. Made from recycled materials.',
      price: 25,
      images: ['https://picsum.photos/seed/small-box/400/400'],
      size: 'Small',
      color: 'Brown',
      stock: 500,
      storefront: 'aura',
    },
    {
      name: 'Medium Cardboard Box',
      description: 'Our most popular size. A versatile medium cardboard box ideal for packing multiple products or larger items.',
      price: 40,
      images: ['https://picsum.photos/seed/medium-box/400/400'],
      size: 'Medium',
      color: 'Brown',
      stock: 300,
      storefront: 'aura',
    },
     {
      name: 'Large Cardboard Box',
      description: 'For your biggest orders. This large box provides ample space and reinforced corners for heavy-duty shipping.',
      price: 60,
      images: ['https://picsum.photos/seed/large-box/400/400'],
      size: 'Large',
      color: 'Brown',
      stock: 150,
      storefront: 'reeva',
    },
    // Jewelry Boxes
    {
      name: 'Classic Jewelry Box',
      description: 'A premium, velvet-lined box designed to present fine jewelry with elegance. Features a soft-touch exterior and a secure magnetic clasp.',
      price: 150,
      images: ['https://picsum.photos/seed/jewelry-box/400/400'],
      size: 'Small',
      color: 'Black',
      stock: 200,
      storefront: 'reeva',
    },
    {
      name: 'Luxury Ring Box',
      description: 'The perfect box for the perfect ring. Lined with plush silk and featuring a single ring slot, this box adds a touch of luxury to any proposal or gift.',
      price: 250,
      images: ['https://picsum.photos/seed/ring-box/400/400'],
      size: 'Extra Small',
      color: 'Navy Blue',
      stock: 100,
      storefront: 'reeva',
    },
    // Hamper & Gift Boxes
    {
        name: 'Medium Hamper Box',
        description: 'Create a beautiful gift with this medium-sized hamper box. Features a glossy finish and a clear lid to showcase the products inside. Comes with filler paper.',
        price: 300,
        images: ['https://picsum.photos/seed/medium-hamper/400/400'],
        size: 'Medium',
        color: 'White',
        stock: 80,
        storefront: 'aura',
    },
    {
        name: 'Large Surprise Box',
        description: 'A fun and festive box with a "Surprise!" motif. Designed with a special lid that pops open. Perfect for birthdays and celebrations.',
        price: 450,
        images: ['https://picsum.photos/seed/surprise-box/400/400'],
        size: 'Large',
        color: 'Multicolor',
        stock: 50,
        storefront: 'reeva',
    },
    // Shopping Bags
    {
        name: 'Standard Shopping Bag',
        description: 'A simple and elegant paper shopping bag with sturdy rope handles. Ideal for in-store purchases and gifting.',
        price: 15,
        images: ['https://picsum.photos/seed/shopping-bag/400/400'],
        size: 'Medium',
        color: 'Cream',
        stock: 1000,
        storefront: 'aura',
    },
    {
        name: 'Luxury Boutique Bag',
        description: 'Make a statement with this high-end boutique bag. Made from thick, textured paper with satin ribbon handles and a reinforced bottom.',
        price: 50,
        images: ['https://picsum.photos/seed/luxury-bag/400/400'],
        size: 'Large',
        color: 'Matte Black',
        stock: 250,
        storefront: 'reeva',
    },
];

export async function seedDatabase() {
  await dbConnect();
  console.log('Starting box seeding process...');

  try {
    // Clear only the 'boxes' collection
    await Box.deleteMany({});
    console.log('Cleared existing boxes and bags.');
    
    if (boxTemplates.length > 0) {
      await Box.insertMany(boxTemplates);
      const message = `Successfully seeded database with ${boxTemplates.length} new boxes/bags.`;
      console.log(message);
      return { success: true, message };
    } else {
      const message = "No boxes were generated to seed.";
      console.log(message);
      return { success: false, message };
    }

  } catch(error: any) {
    console.error('Error during database seeding process:', error);
    throw new Error(`Failed to seed boxes and bags: ${error.message}`);
  }
}
