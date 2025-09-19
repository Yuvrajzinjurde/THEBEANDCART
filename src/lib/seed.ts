
'use server';

import dbConnect from './mongodb';
import Box from '@/models/box.model';

const boxTemplates = [
  // == DEFAULT FREE ITEMS ==
  {
    name: 'Default Gift Box',
    description: 'A simple and elegant default gift box for any occasion. Included free with gift wrapping service.',
    boxType: 'box',
    variants: [{
      name: 'Standard',
      size: 'Medium',
      color: 'White',
      mrp: 0,
      sellingPrice: 0,
      stock: 9999,
      images: [
        'https://picsum.photos/seed/free-box-1/400/400',
        'https://picsum.photos/seed/free-box-2/400/400',
        'https://picsum.photos/seed/free-box-3/400/400',
        'https://picsum.photos/seed/free-box-4/400/400'
      ]
    }]
  },
  {
    name: 'Default Shopping Bag',
    description: 'A sturdy and eco-friendly shopping bag for your purchases. Included free with every order.',
    boxType: 'bag',
    variants: [{
      name: 'Standard',
      size: 'Medium',
      color: 'Kraft Brown',
      mrp: 0,
      sellingPrice: 0,
      stock: 9999,
      images: [
        'https://picsum.photos/seed/free-bag-1/400/400',
        'https://picsum.photos/seed/free-bag-2/400/400',
        'https://picsum.photos/seed/free-bag-3/400/400',
        'https://picsum.photos/seed/free-bag-4/400/400'
      ]
    }]
  },

  // == BOXES ==
  {
    name: 'Classic Cardboard Boxes',
    description: 'Sturdy and reliable cardboard boxes, perfect for shipping items securely. Made from recycled materials.',
    boxType: 'box',
    variants: [
      { name: 'Small', size: 'Small', color: 'Brown', mrp: 30, sellingPrice: 25, stock: 500, images: ['https://picsum.photos/seed/sm-card-1/400/400', 'https://picsum.photos/seed/sm-card-2/400/400', 'https://picsum.photos/seed/sm-card-3/400/400', 'https://picsum.photos/seed/sm-card-4/400/400'] },
      { name: 'Medium', size: 'Medium', color: 'Brown', mrp: 50, sellingPrice: 40, stock: 300, images: ['https://picsum.photos/seed/md-card-1/400/400', 'https://picsum.photos/seed/md-card-2/400/400', 'https://picsum.photos/seed/md-card-3/400/400', 'https://picsum.photos/seed/md-card-4/400/400'] },
      { name: 'Large', size: 'Large', color: 'Brown', mrp: 75, sellingPrice: 60, stock: 150, images: ['https://picsum.photos/seed/lg-card-1/400/400', 'https://picsum.photos/seed/lg-card-2/400/400', 'https://picsum.photos/seed/lg-card-3/400/400', 'https://picsum.photos/seed/lg-card-4/400/400'] },
    ],
  },
  {
    name: 'Premium Jewelry Boxes',
    description: 'A premium, velvet-lined box designed to present fine jewelry with elegance. Features a soft-touch exterior and a secure magnetic clasp.',
    boxType: 'box',
    variants: [
        { name: 'Ring Box', size: 'Extra Small', color: 'Black', mrp: 300, sellingPrice: 250, stock: 100, images: ['https://picsum.photos/seed/ring-box-1/400/400', 'https://picsum.photos/seed/ring-box-2/400/400', 'https://picsum.photos/seed/ring-box-3/400/400', 'https://picsum.photos/seed/ring-box-4/400/400'] },
        { name: 'Necklace Box', size: 'Large', color: 'Navy Blue', mrp: 200, sellingPrice: 150, stock: 200, images: ['https://picsum.photos/seed/necklace-box-1/400/400', 'https://picsum.photos/seed/necklace-box-2/400/400', 'https://picsum.photos/seed/necklace-box-3/400/400', 'https://picsum.photos/seed/necklace-box-4/400/400'] },
    ],
  },
  {
    name: 'Gourmet Hamper Boxes',
    description: 'Create a beautiful gift with this hamper box. Features a glossy finish and a clear lid to showcase the products inside. Comes with filler paper.',
    boxType: 'box',
    variants: [
        { name: 'Medium Hamper', size: 'Medium', color: 'White', mrp: 350, sellingPrice: 300, stock: 80, images: ['https://picsum.photos/seed/md-hamper-1/400/400', 'https://picsum.photos/seed/md-hamper-2/400/400', 'https://picsum.photos/seed/md-hamper-3/400/400', 'https://picsum.photos/seed/md-hamper-4/400/400'] },
        { name: 'Large Hamper', size: 'Large', color: 'Black', mrp: 500, sellingPrice: 450, stock: 50, images: ['https://picsum.photos/seed/lg-hamper-1/400/400', 'https://picsum.photos/seed/lg-hamper-2/400/400', 'https://picsum.photos/seed/lg-hamper-3/400/400', 'https://picsum.photos/seed/lg-hamper-4/400/400'] },
    ],
  },
  {
    name: 'Celebration Surprise Box',
    description: 'A fun and festive box with a "Surprise!" motif. Designed with a special lid that pops open. Perfect for birthdays and celebrations.',
    boxType: 'box',
    variants: [{ name: 'Standard', size: 'Medium', color: 'Multicolor', mrp: 400, sellingPrice: 350, stock: 75, images: ['https://picsum.photos/seed/surprise-box-1/400/400', 'https://picsum.photos/seed/surprise-box-2/400/400', 'https://picsum.photos/seed/surprise-box-3/400/400', 'https://picsum.photos/seed/surprise-box-4/400/400'] }],
  },
  {
      name: 'Matte Finish Gift Box',
      description: 'A sophisticated and modern gift box with a smooth matte finish and a matching ribbon.',
      boxType: 'box',
      variants: [
          { name: 'Small', size: 'Small', color: 'Pastel Pink', mrp: 150, sellingPrice: 120, stock: 150, images: ['https://picsum.photos/seed/matte-pink-1/400/400', 'https://picsum.photos/seed/matte-pink-2/400/400', 'https://picsum.photos/seed/matte-pink-3/400/400', 'https://picsum.photos/seed/matte-pink-4/400/400']},
          { name: 'Medium', size: 'Medium', color: 'Sage Green', mrp: 220, sellingPrice: 180, stock: 120, images: ['https://picsum.photos/seed/matte-green-1/400/400', 'https://picsum.photos/seed/matte-green-2/400/400', 'https://picsum.photos/seed/matte-green-3/400/400', 'https://picsum.photos/seed/matte-green-4/400/400']},
      ]
  },
  {
    name: 'Minimalist White Box',
    description: 'Clean, simple, and elegant. A versatile white box for any product.',
    boxType: 'box',
    variants: [{ name: 'Standard', size: 'Medium', color: 'White', mrp: 90, sellingPrice: 90, stock: 300, images: ['https://picsum.photos/seed/min-white-1/400/400', 'https://picsum.photos/seed/min-white-2/400/400', 'https://picsum.photos/seed/min-white-3/400/400', 'https://picsum.photos/seed/min-white-4/400/400'] }],
  },
  {
    name: 'Eco-Friendly Product Box',
    description: 'A sustainable choice, this box is made from 100% compostable materials.',
    boxType: 'box',
    variants: [{ name: 'Standard', size: 'Small', color: 'Natural', mrp: 50, sellingPrice: 50, stock: 400, images: ['https://picsum.photos/seed/eco-box-1/400/400', 'https://picsum.photos/seed/eco-box-2/400/400', 'https://picsum.photos/seed/eco-box-3/400/400', 'https://picsum.photos/seed/eco-box-4/400/400'] }],
  },
  {
    name: 'Windowed Product Box',
    description: 'Showcase your products with this box featuring a clear acetate window.',
    boxType: 'box',
    variants: [{ name: 'Standard', size: 'Medium', color: 'Black', mrp: 125, sellingPrice: 110, stock: 200, images: ['https://picsum.photos/seed/window-box-1/400/400', 'https://picsum.photos/seed/window-box-2/400/400', 'https://picsum.photos/seed/window-box-3/400/400', 'https://picsum.photos/seed/window-box-4/400/400'] }],
  },
  {
    name: 'Magnetic Closure Box',
    description: 'A premium feel with a satisfying snap. This rigid box has a hidden magnetic closure.',
    boxType: 'box',
    variants: [{ name: 'Standard', size: 'Large', color: 'Gray', mrp: 550, sellingPrice: 500, stock: 100, images: ['https://picsum.photos/seed/magnetic-box-1/400/400', 'https://picsum.photos/seed/magnetic-box-2/400/400', 'https://picsum.photos/seed/magnetic-box-3/400/400', 'https://picsum.photos/seed/magnetic-box-4/400/400'] }],
  },

  // == BAGS ==
  {
    name: 'Standard Paper Shopping Bags',
    description: 'Simple and elegant paper shopping bags with sturdy rope handles. Ideal for in-store purchases and gifting.',
    boxType: 'bag',
    variants: [
        { name: 'Small', size: 'Small', color: 'Cream', mrp: 15, sellingPrice: 15, stock: 1000, images: ['https://picsum.photos/seed/sm-bag-1/400/400', 'https://picsum.photos/seed/sm-bag-2/400/400', 'https://picsum.photos/seed/sm-bag-3/400/400', 'https://picsum.photos/seed/sm-bag-4/400/400'] },
        { name: 'Medium', size: 'Medium', color: 'Cream', mrp: 25, sellingPrice: 25, stock: 1000, images: ['https://picsum.photos/seed/md-bag-1/400/400', 'https://picsum.photos/seed/md-bag-2/400/400', 'https://picsum.photos/seed/md-bag-3/400/400', 'https://picsum.photos/seed/md-bag-4/400/400'] },
    ],
  },
  {
    name: 'Luxury Boutique Bags',
    description: 'Make a statement with these high-end boutique bags. Made from thick, textured paper with satin ribbon handles.',
    boxType: 'bag',
    variants: [
        { name: 'Medium', size: 'Medium', color: 'Matte Black', mrp: 60, sellingPrice: 50, stock: 250, images: ['https://picsum.photos/seed/lux-bag-black-1/400/400', 'https://picsum.photos/seed/lux-bag-black-2/400/400', 'https://picsum.photos/seed/lux-bag-black-3/400/400', 'https://picsum.photos/seed/lux-bag-black-4/400/400'] },
        { name: 'Large', size: 'Large', color: 'Pearl White', mrp: 85, sellingPrice: 70, stock: 200, images: ['https://picsum.photos/seed/lux-bag-white-1/400/400', 'https://picsum.photos/seed/lux-bag-white-2/400/400', 'https://picsum.photos/seed/lux-bag-white-3/400/400', 'https://picsum.photos/seed/lux-bag-white-4/400/400'] },
    ],
  },
  {
    name: 'Reusable Canvas Tote Bag',
    description: 'An eco-friendly and stylish tote bag that customers can use again and again. Features a printed brand logo.',
    boxType: 'bag',
    variants: [{ name: 'Standard', size: 'Large', color: 'Natural Canvas', mrp: 250, sellingPrice: 200, stock: 300, images: ['https://picsum.photos/seed/tote-bag-1/400/400', 'https://picsum.photos/seed/tote-bag-2/400/400', 'https://picsum.photos/seed/tote-bag-3/400/400', 'https://picsum.photos/seed/tote-bag-4/400/400'] }],
  },
  {
    name: 'Clear PVC Gift Bag',
    description: 'A modern and trendy transparent PVC bag, perfect for showcasing product collections. Comes with a small inner pouch.',
    boxType: 'bag',
    variants: [{ name: 'Standard', size: 'Medium', color: 'Clear', mrp: 180, sellingPrice: 180, stock: 150, images: ['https://picsum.photos/seed/pvc-bag-1/400/400', 'https://picsum.photos/seed/pvc-bag-2/400/400', 'https://picsum.photos/seed/pvc-bag-3/400/400', 'https://picsum.photos/seed/pvc-bag-4/400/400'] }],
  },
  {
    name: 'Drawstring Pouch',
    description: 'A soft, fabric drawstring pouch ideal for small items, jewelry, or as an inner bag for hampers.',
    boxType: 'bag',
    variants: [
        { name: 'Velvet', size: 'Small', color: 'Burgundy', mrp: 80, sellingPrice: 80, stock: 400, images: ['https://picsum.photos/seed/velvet-pouch-1/400/400', 'https://picsum.photos/seed/velvet-pouch-2/400/400', 'https://picsum.photos/seed/velvet-pouch-3/400/400', 'https://picsum.photos/seed/velvet-pouch-4/400/400']},
        { name: 'Satin', size: 'Small', color: 'Silver', mrp: 60, sellingPrice: 60, stock: 500, images: ['https://picsum.photos/seed/satin-pouch-1/400/400', 'https://picsum.photos/seed/satin-pouch-2/400/400', 'https://picsum.photos/seed/satin-pouch-3/400/400', 'https://picsum.photos/seed/satin-pouch-4/400/400']},
    ]
  },
  {
    name: 'Bottle Bag',
    description: 'A specially designed tall and sturdy bag for gifting bottles of wine, spirits, or premium oils.',
    boxType: 'bag',
    variants: [{ name: 'Standard', size: 'Tall', color: 'Forest Green', mrp: 75, sellingPrice: 75, stock: 200, images: ['https://picsum.photos/seed/bottle-bag-1/400/400', 'https://picsum.photos/seed/bottle-bag-2/400/400', 'https://picsum.photos/seed/bottle-bag-3/400/400', 'https://picsum.photos/seed/bottle-bag-4/400/400'] }],
  },
  {
    name: 'Die-Cut Handle Bag',
    description: 'A sleek plastic bag with die-cut handles, offering a modern alternative to traditional shopping bags.',
    boxType: 'bag',
    variants: [{ name: 'Standard', size: 'Medium', color: 'Frosted White', mrp: 30, sellingPrice: 30, stock: 800, images: ['https://picsum.photos/seed/diecut-bag-1/400/400', 'https://picsum.photos/seed/diecut-bag-2/400/400', 'https://picsum.photos/seed/diecut-bag-3/400/400', 'https://picsum.photos/seed/diecut-bag-4/400/400'] }],
  },
  {
    name: 'Patterned Paper Bag',
    description: 'A vibrant paper bag with a unique, artistic pattern. Perfect for seasonal promotions or adding a pop of color.',
    boxType: 'bag',
    variants: [{ name: 'Floral', size: 'Medium', color: 'Multicolor', mrp: 45, sellingPrice: 40, stock: 350, images: ['https://picsum.photos/seed/pattern-bag-1/400/400', 'https://picsum.photos/seed/pattern-bag-2/400/400', 'https://picsum.photos/seed/pattern-bag-3/400/400', 'https://picsum.photos/seed/pattern-bag-4/400/400'] }],
  },
  {
    name: 'Jute Gift Bag',
    description: 'A rustic and eco-friendly jute bag with a window to see the contents. Great for organic and natural products.',
    boxType: 'bag',
    variants: [{ name: 'Standard', size: 'Medium', color: 'Natural Jute', mrp: 120, sellingPrice: 120, stock: 200, images: ['https://picsum.photos/seed/jute-bag-1/400/400', 'https://picsum.photos/seed/jute-bag-2/400/400', 'https://picsum.photos/seed/jute-bag-3/400/400', 'https://picsum.photos/seed/jute-bag-4/400/400'] }],
  },
];


export async function seedDatabase() {
  await dbConnect();
  console.log('Starting box seeding process...');

  try {
    // Clear only the 'boxes' collection
    const deleteResult = await Box.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing boxes and bags.`);
    
    if (boxTemplates.length > 0) {
      await Box.insertMany(boxTemplates);
      const message = `Successfully seeded database with ${boxTemplates.length} new box/bag types.`;
      console.log(message);
      return { success: true, message };
    } else {
      const message = "No boxes or bags were generated to seed.";
      console.log(message);
      return { success: false, message };
    }

  } catch(error: any) {
    console.error('Error during database seeding process:', error);
    throw new Error(`Failed to seed boxes and bags: ${error.message}`);
  }
}
