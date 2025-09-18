

'use server';

import dbConnect from './mongodb';
import Brand from '@/models/brand.model';
import Product from '@/models/product.model';
import Role from '@/models/role.model';
import User from '@/models/user.model';
import Order from '@/models/order.model';
import Legal, { legalDocTypes } from '@/models/legal.model';
import bcrypt from 'bcryptjs';

const brandsData = [
    {
        displayName: "Reeva",
        permanentName: "reeva",
        logoUrl: "https://picsum.photos/seed/reeva-logo/200/200",
        themeName: "Jewelry",
        categories: ["Necklaces", "Rings", "Earrings", "Bracelets", "Pendants", "Anklets", "Bridal Sets", "Men's Jewelry"],
        banners: [
            { title: "Timeless Elegance, Redefined", description: "Discover exquisite jewelry crafted to last a lifetime.", imageUrl: "https://picsum.photos/seed/reeva-elegance/1600/400", imageHint: "diamond necklace" },
            { title: "The Art of Adornment", description: "From classic designs to modern statements, find your signature piece.", imageUrl: "https://picsum.photos/seed/reeva-adornment/1600/400", imageHint: "jewelry collection" },
        ],
        categoryBanners: [
            { categoryName: "Necklaces", imageUrl: "https://picsum.photos/seed/reeva-cat-necklaces/400/600", imageHint: "gold necklace" },
            { categoryName: "Rings", imageUrl: "https://picsum.photos/seed/reeva-cat-rings/400/400", imageHint: "diamond ring" },
            { categoryName: "Earrings", imageUrl: "https://picsum.photos/seed/reeva-cat-earrings/400/600", imageHint: "pearl earrings" },
            { categoryName: "Bracelets", imageUrl: "https://picsum.photos/seed/reeva-cat-bracelets/400/400", imageHint: "silver bracelet" },
            { categoryName: "Pendants", imageUrl: "https://picsum.photos/seed/reeva-cat-pendants/400/400", imageHint: "gemstone pendant" },
            { categoryName: "Men's Jewelry", imageUrl: "https://picsum.photos/seed/reeva-cat-men/400/600", imageHint: "men's watch" },
            { categoryName: "Bridal Sets", imageUrl: "https://picsum.photos/seed/reeva-cat-bridal/400/400", imageHint: "wedding rings" },
            { categoryName: "Anklets", imageUrl: "https://picsum.photos/seed/reeva-cat-anklets/400/400", imageHint: "gold anklet" },
            { categoryName: "New Arrivals", imageUrl: "https://picsum.photos/seed/reeva-cat-new/400/400", imageHint: "jewelry box" },
        ],
        promoBanner: {
            title: "The Radiance Collection",
            description: "Celebrate every moment with our new collection of brilliant-cut diamonds and precious gems. Get 10% off your first order.",
            imageUrl: "https://picsum.photos/seed/reeva-promo/1200/600",
            imageHint: "luxury jewelry",
            buttonText: "Discover Now",
            buttonLink: "/reeva/products",
        },
        offers: [
            { title: "First Shine", description: "Enjoy 10% off your first jewelry purchase.", code: "SHINE10" },
            { title: "Free Insured Shipping", description: "Free, secure shipping on all orders over ₹5,000.", code: "SAFE" },
            { title: "Anniversary Special", description: "Get a surprise gift with every purchase from our Bridal Collection.", code: "FOREVER" },
        ],
        reviews: [
            { customerName: "Aisha P.", rating: 5, reviewText: "The necklace I bought is absolutely breathtaking. The craftsmanship is superb!", customerAvatarUrl: "https://picsum.photos/seed/aisha/100/100" },
            { customerName: "Vikram S.", rating: 5, reviewText: "I proposed with a ring from Reeva, and she said yes! The ring is stunning, thank you.", customerAvatarUrl: "https://picsum.photos/seed/vikram/100/100" },
            { customerName: "Sunita M.", rating: 4, reviewText: "Beautiful earrings, though the delivery took a bit longer than expected. Worth the wait!", customerAvatarUrl: "https://picsum.photos/seed/sunita/100/100" },
        ],
    },
    {
        displayName: "Nevermore",
        permanentName: "nevermore",
        logoUrl: "https://picsum.photos/seed/nevermore-logo/200/200",
        themeName: "Slate (Dark)",
        categories: ["T-Shirts", "Hoodies", "Jeans", "Jackets", "Dresses", "Accessories", "Boots", "Skirts"],
        banners: [
            { title: "Embrace The Shadows", description: "Discover our latest collection of gothic and alternative fashion.", imageUrl: "https://picsum.photos/seed/nevermore-shadows/1600/400", imageHint: "gothic fashion" },
            { title: "Midnight Bloom", description: "Dark florals and intricate lace for the modern romantic.", imageUrl: "https://picsum.photos/seed/nevermore-midnight/1600/400", imageHint: "dark floral pattern" },
        ],
        categoryBanners: [
            { categoryName: "T-Shirts", imageUrl: "https://picsum.photos/seed/nm-cat-tees/400/400", imageHint: "graphic tee" },
            { categoryName: "Hoodies", imageUrl: "https://picsum.photos/seed/nm-cat-hoodies/400/600", imageHint: "black hoodie" },
            { categoryName: "Jeans", imageUrl: "https://picsum.photos/seed/nm-cat-jeans/400/600", imageHint: "ripped jeans" },
            { categoryName: "Jackets", imageUrl: "https://picsum.photos/seed/nm-cat-jackets/400/400", imageHint: "leather jacket" },
            { categoryName: "Dresses", imageUrl: "https://picsum.photos/seed/nm-cat-dresses/400/600", imageHint: "goth dress" },
            { categoryName: "Accessories", imageUrl: "https://picsum.photos/seed/nm-cat-acc/400/400", imageHint: "silver chains" },
            { categoryName: "Boots", imageUrl: "https://picsum.photos/seed/nm-cat-boots/400/400", imageHint: "combat boots" },
            { categoryName: "Skirts", imageUrl: "https://picsum.photos/seed/nm-cat-skirts/400/400", imageHint: "plaid skirt" },
            { categoryName: "New Arrivals", imageUrl: "https://picsum.photos/seed/nm-cat-new/400/600", imageHint: "alternative model" },
        ],
        promoBanner: {
            title: "Rebel Against the Mainstream",
            description: "Free shipping on all orders over ₹999. Unleash your inner darkness.",
            imageUrl: "https://picsum.photos/seed/nevermore-promo/1200/600",
            imageHint: "urban cityscape night",
            buttonText: "Explore Collection",
            buttonLink: "/nevermore/products",
        },
        offers: [
            { title: "New Member Discount", description: "Sign up and get 10% off your first dark treasure.", code: "DARKSIGNUP" },
            { title: "Accessory Bundle", description: "Buy any two accessories, get the third 50% off.", code: "CHAINS" },
            { title: "Spooky Season Sale", description: "Up to 40% off on select items. Ends soon!", code: "SPOOKY40" },
        ],
        reviews: [
            { customerName: "Alex V.", rating: 5, reviewText: "The quality of the hoodies is insane. So comfortable and the print is top-notch.", customerAvatarUrl: "https://picsum.photos/seed/alex/100/100" },
            { customerName: "Morgan R.", rating: 5, reviewText: "Finally, a brand that gets my style. The combat boots are my new favorite shoes.", customerAvatarUrl: "https://picsum.photos/seed/morgan/100/100" },
            { customerName: "Casey L.", rating: 4, reviewText: "Shipping was fast and the dress is beautiful. A bit pricey but worth it.", customerAvatarUrl: "https://picsum.photos/seed/casey/100/100" },
        ],
    }
];

const reevaProducts = [
    { name: 'Ethereal Diamond Necklace', category: 'Necklaces', rating: 4.9 },
    { name: 'Opulent Ruby Ring', category: 'Rings', rating: 4.8 },
    { name: 'Sapphire Drop Earrings', category: 'Earrings', rating: 4.7 },
    { name: 'Classic Gold Bangle', category: 'Bracelets', rating: 4.9 },
    { name: 'Emerald Isle Pendant', category: 'Pendants', rating: 4.6 },
    { name: 'Pearl Strand Anklet', category: 'Anklets', rating: 4.5 },
    { name: 'Eternity Wedding Band', category: 'Bridal Sets', rating: 5.0 },
    { name: 'Titanium Link Bracelet', category: 'Men\'s Jewelry', rating: 4.7 },
    { name: 'Solitaire Diamond Studs', category: 'Earrings', rating: 4.9 },
    { name: 'Infinity Love Knot Ring', category: 'Rings', rating: 4.8 },
];

const nevermoreProducts = [
  { name: 'Gothic Print Hoodie', category: 'Hoodies', rating: 4.7 },
  { name: 'Distressed Black Jeans', category: 'Jeans', rating: 4.6 },
  { name: 'Platform Combat Boots', category: 'Boots', rating: 4.8 },
  { name: 'Vintage Band Tee', category: 'T-Shirts', rating: 4.5 },
  { name: 'Chain-Detail Choker', category: 'Accessories', rating: 4.4 },
  { name: 'Lace-Up Corset Top', category: 'Dresses', rating: 4.6 },
  { name: 'Plaid Mini Skirt', category: 'Skirts', rating: 4.5 },
  { name: 'Faux Leather Jacket', category: 'Jackets', rating: 4.8 },
  { name: 'Studded Belt', category: 'Accessories', rating: 4.3 },
  { name: 'Fishnet Stockings', category: 'Accessories', rating: 4.2 },
];


const generateProducts = (baseProducts: any[], brand: string, count: number) => {
    const products = [];
    for (let i = 0; i < count; i++) {
        const baseProduct = baseProducts[i % baseProducts.length];
        const productName = `${baseProduct.name} #${i + 1}`;
        const mrp = Math.floor(Math.random() * 20000) + 5000;
        const sellingPrice = mrp - Math.floor(Math.random() * 2500);
        const encodedProductName = encodeURIComponent(productName);

        products.push({
            name: productName,
            category: baseProduct.category,
            brand: brand.charAt(0).toUpperCase() + brand.slice(1),
            storefront: brand,
            rating: baseProduct.rating,
            description: `This is a high-quality ${productName}, perfect for any occasion. Made with the finest materials to ensure comfort and durability.`,
            mrp: mrp,
            sellingPrice: sellingPrice,
            stock: Math.floor(Math.random() * 100),
            images: Array.from({ length: 5 }, (_, j) => `https://picsum.photos/seed/${encodedProductName}-${j}/600/600`),
            keywords: [baseProduct.category, brand, baseProduct.name.split(' ')[0]],
            styleId: `style-${productName.replace(/\s/g, '-').toLowerCase()}`
        });
    }
    return products;
};


const getLegalDocTitle = (docType: typeof legalDocTypes[number]): string => {
    return docType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const getLegalDocPlaceholder = (docType: typeof legalDocTypes[number]): string => {
    const title = getLegalDocTitle(docType);
    return `
        <h1>${title} for Our Platform</h1>
        <p>This is the placeholder content for the ${title}. Please update this with your actual policy.</p>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        <h2>1. Introduction</h2>
        <p>Welcome to our platform. This document outlines our ${title.toLowerCase()}.</p>
        <h2>2. Section Two</h2>
        <p>Details for this section should be filled in here.</p>
        <h2>3. Contact Information</h2>
        <p>If you have any questions about this ${title}, please contact us.</p>
    `;
};

const seedAdminUser = async () => {
    const adminEmail = 'admin@brandify.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
        const roles = await Role.find({ name: 'admin' });
        if (roles.length === 0) {
            console.log('Admin role not found, cannot create admin user.');
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password', salt);
        
        await new User({
            email: adminEmail,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            roles: roles.map(r => r._id),
            brand: 'All Brands',
            address: { street: '', city: '', state: '', zip: '', country: '' }
        }).save();
        console.log('Created default admin user (admin@brandify.com).');
    } else {
        console.log('Admin user already exists.');
    }
};


export const seedDatabase = async () => {
    try {
        await dbConnect();
        console.log('Database connected, starting seed process...');

        // Clear only brands and products
        await Brand.deleteMany({});
        console.log('Cleared existing Brand collection.');
        await Product.deleteMany({});
        console.log('Cleared existing Product collection.');
        await Order.deleteMany({});
        console.log('Cleared existing Order collection.');
        
        // Seed Roles if they don't exist
        const rolesCount = await Role.countDocuments();
        if (rolesCount === 0) {
            await Role.insertMany([{ name: 'user' }, { name: 'admin' }]);
            console.log('Seeded Roles.');
        }

        // Seed Admin User
        await seedAdminUser();

        // Seed Brands
        await Brand.insertMany(brandsData);
        console.log('Seeded Brands with full data.');
        
        // Seed Products
        const allProductsToSeed = [
            ...generateProducts(reevaProducts, 'reeva', 50),
            ...generateProducts(nevermoreProducts, 'nevermore', 50)
        ];
        
        await Product.insertMany(allProductsToSeed);
        console.log(`Seeded ${allProductsToSeed.length} products.`);

        // Seed Legal Docs if they don't exist
        const legalsCount = await Legal.countDocuments();
        if (legalsCount === 0) {
            for (const docType of legalDocTypes) {
                await new Legal({
                    docType: docType,
                    title: getLegalDocTitle(docType),
                    content: getLegalDocPlaceholder(docType),
                }).save();
            }
            console.log(`Seeded ${legalDocTypes.length} legal documents.`);
        }
        
        const message = 'Database seeded successfully with fresh data. User and Role data were preserved or created if absent.';
        console.log(message);
        return { success: true, message };

    } catch (error: any) {
        console.error('Error during database seeding:', error);
        throw new Error('Failed to seed database.');
    }
};
