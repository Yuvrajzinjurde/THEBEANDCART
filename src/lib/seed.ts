
'use server';

import dbConnect from './mongodb';
import Product from '@/models/product.model';
import { Types } from 'mongoose';

const reevaTemplates = [
    {
      name: 'Ethereal Diamond Solitaire Ring',
      description: "A timeless masterpiece, this ring features a brilliant-cut, ethically sourced 0.75-carat diamond set in a classic 18k white gold band. The epitome of elegance and a symbol of everlasting love.",
      baseCategory: 'Jewelry',
      brand: 'Reeva',
      storefront: 'reeva',
      keywords: ['ring', 'diamond', 'solitaire', 'engagement', 'gold'],
      mrp: 249999,
      sellingPrice: 219999
    },
    {
      name: 'Sapphire Teardrop Necklace',
      description: "Captivate with the deep blue allure of this stunning teardrop sapphire pendant. Surrounded by a halo of micro-pavé diamonds and suspended from a delicate platinum chain, it's a piece of pure sophistication.",
      baseCategory: 'Jewelry',
      brand: 'Reeva',
      storefront: 'reeva',
      keywords: ['necklace', 'sapphire', 'pendant', 'gemstone', 'luxury'],
      mrp: 189999,
      sellingPrice: 159999
    },
    {
      name: 'Celestial Pearl Drop Earrings',
      description: "Luminous freshwater pearls gently dangle from polished sterling silver hooks. These earrings blend classic charm with modern simplicity, making them perfect for any occasion, from brunch to a black-tie event.",
      baseCategory: 'Jewelry',
      brand: 'Reeva',
      storefront: 'reeva',
      keywords: ['earrings', 'pearl', 'silver', 'dangle', 'classic'],
      mrp: 49999,
      sellingPrice: 39999
    },
    {
      name: 'Rose Gold Infinity Bracelet',
      description: "Symbolize eternal connection with this beautifully crafted infinity bracelet in warm 18k rose gold. Dotted with tiny, sparkling diamonds, this delicate piece adds a touch of meaningful glamour to your wrist.",
      baseCategory: 'Jewelry',
      brand: 'Reeva',
      storefront: 'reeva',
      keywords: ['bracelet', 'rosegold', 'infinity', 'diamond', 'gift'],
      mrp: 89999,
      sellingPrice: 74999
    },
    {
      name: 'Emerald-Cut Emerald Studs',
      description: "Make a statement with the vibrant green of these exquisite emerald-cut emerald stud earrings. Set in rich 18k yellow gold, they offer a pop of color and a dose of timeless luxury.",
      baseCategory: 'Jewelry',
      brand: 'Reeva',
      storefront: 'reeva',
      keywords: ['earrings', 'studs', 'emerald', 'gemstone', 'gold'],
      mrp: 129999,
      sellingPrice: 109999
    },
    {
        name: 'Men\'s Titanium Link Bracelet',
        description: "Modern, masculine, and lightweight. This bracelet is crafted from high-grade titanium with a brushed finish, offering a contemporary look that's durable enough for everyday wear.",
        baseCategory: 'Jewelry',
        brand: 'Reeva',
        storefront: 'reeva',
        keywords: ['bracelet', 'men', 'titanium', 'modern'],
        mrp: 34999,
        sellingPrice: 29999
      },
      {
        name: 'Ruby Heart Pendant',
        description: "A passionate and romantic piece, this heart-shaped ruby pendant is set in a polished sterling silver frame. It's the perfect way to express your love, making it an ideal anniversary or birthday gift.",
        baseCategory: 'Jewelry',
        brand: 'Reeva',
        storefront: 'reeva',
        keywords: ['pendant', 'necklace', 'ruby', 'heart', 'love'],
        mrp: 69999,
        sellingPrice: 59999
      },
      {
        name: 'Diamond Tennis Bracelet',
        description: "The ultimate in classic luxury. An unbroken line of brilliant-cut diamonds encircles the wrist, set in gleaming 14k white gold. This iconic piece offers breathtaking sparkle from every angle.",
        baseCategory: 'Jewelry',
        brand: 'Reeva',
        storefront: 'reeva',
        keywords: ['bracelet', 'diamond', 'tennis', 'luxury', 'classic'],
        mrp: 499999,
        sellingPrice: 429999
      },
      {
        name: 'Minimalist Gold Bar Necklace',
        description: "Chic, simple, and perfect for layering. A sleek, polished bar of 14k yellow gold hangs from a delicate chain. This minimalist necklace is a versatile addition to any modern jewelry collection.",
        baseCategory: 'Jewelry',
        brand: 'Reeva',
        storefront: 'reeva',
        keywords: ['necklace', 'gold', 'minimalist', 'bar', 'modern'],
        mrp: 45999,
        sellingPrice: 38999
      },
      {
        name: 'Aquamarine Halo Stud Earrings',
        description: "Evoke the serene beauty of the ocean with these stunning aquamarine earrings. Each round-cut aquamarine is surrounded by a sparkling halo of diamonds, set in cool sterling silver for a truly elegant look.",
        baseCategory: 'Jewelry',
        brand: 'Reeva',
        storefront: 'reeva',
        keywords: ['earrings', 'aquamarine', 'halo', 'studs', 'gemstone'],
        mrp: 99999,
        sellingPrice: 84999
      }
];

const auraTemplates = [
    {
        name: 'Classic Leather Jacket',
        description: "A timeless classic, this genuine leather jacket offers both style and durability. Perfect for a night out or a casual day, it features a sleek design, comfortable lining, and sturdy zippers. A must-have for any wardrobe.",
        baseCategory: 'Apparel',
        brand: 'Aura',
        storefront: 'aura',
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
        name: 'Smart Garden Indoor Herb Kit',
        description: "Grow fresh herbs and salads year-round with this smart indoor garden. Automated LED lighting and watering systems make it effortless. Includes a starter pack of basil, mint, and lettuce seeds.",
        baseCategory: 'Home Goods',
        brand: 'Aura',
        storefront: 'aura',
        keywords: ['garden', 'smart', 'home', 'tech', 'kitchen'],
        mrp: 9999,
        sellingPrice: 7999
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
        name: '4K Streaming Media Player',
        description: "Upgrade your TV to a smart entertainment hub. This media player streams in stunning 4K HDR with Dolby Atmos audio. Access all your favorite apps like Netflix, YouTube, and more with a voice-controlled remote.",
        baseCategory: 'Electronics',
        brand: 'Aura',
        storefront: 'aura',
        keywords: ['streaming', '4k', 'gadget', 'tv', 'media'],
        mrp: 7999,
        sellingPrice: 5999
      },
      {
        name: 'Merino Wool Performance Tee',
        description: "The ultimate do-it-all t-shirt. Made from ultra-fine merino wool, it's naturally moisture-wicking, odor-resistant, and temperature-regulating. Perfect for travel, hiking, or everyday wear.",
        baseCategory: 'Apparel',
        brand: 'Aura',
        storefront: 'aura',
        keywords: ['shirt', 'merino', 'performance', 'travel', 'activewear'],
        mrp: 6999,
        sellingPrice: 5499
      },
      {
        name: 'Portable Power Bank 20000mAh',
        description: "Never run out of battery again. This high-capacity power bank can charge your smartphone up to 5 times. Features dual USB-A and one USB-C port for fast, versatile charging on the go.",
        baseCategory: 'Electronics',
        brand: 'Aura',
        storefront: 'aura',
        keywords: ['powerbank', 'charger', 'gadget', 'mobile', 'battery'],
        mrp: 4999,
        sellingPrice: 3999
      },
      {
        name: 'Minimalist Commuter Backpack',
        description: "Designed for the modern professional. This sleek, water-resistant backpack has a padded laptop compartment (up to 15\"), smart organization pockets, and a hidden anti-theft pocket for your valuables.",
        baseCategory: 'Accessories',
        brand: 'Aura',
        storefront: 'aura',
        keywords: ['backpack', 'bag', 'commuter', 'laptop', 'minimalist'],
        mrp: 8999,
        sellingPrice: 6999
      },
      {
        name: 'Smart WiFi Connected Mug',
        description: "Keep your coffee or tea at the perfect temperature from the first sip to the last. Control the exact temperature via a smartphone app. A game-changer for any hot beverage lover.",
        baseCategory: 'Home Goods',
        brand: 'Aura',
        storefront: 'aura',
        keywords: ['mug', 'smart', 'gadget', 'coffee', 'tech'],
        mrp: 12999,
        sellingPrice: 9999
      },
      {
        name: 'UV-C Water Purifying Bottle',
        description: "Enjoy clean, safe drinking water anywhere. This innovative bottle uses UV-C light to eliminate up to 99.9% of bacteria and viruses in just 60 seconds at the touch of a button. Stainless steel, insulated design.",
        baseCategory: 'Accessories',
        brand: 'Aura',
        storefront: 'aura',
        keywords: ['bottle', 'water', 'purifier', 'gadget', 'travel'],
        mrp: 7499,
        sellingPrice: 5999
      }
];


const productTemplates = [...reevaTemplates, ...auraTemplates];

const variantColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Silver', 'Gold', 'Rose Gold', 'Platinum', 'Titanium'];
const variantSizes = ['S', 'M', 'L', 'XL', 'One Size'];

export async function seedDatabase() {
  await dbConnect();
  console.log('Starting product seeding process...');

  try {
    // This will delete ALL products. Be careful in production.
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

        const size = template.baseCategory === 'Apparel' 
          ? variantSizes[Math.floor(Math.random() * 4)] // S, M, L, XL
          : 'One Size';
        
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
  } catch(error: any) {
    console.error('Error during database seeding process:', error);
    throw new Error(`Failed to seed database: ${error.message}`);
  }
}

    