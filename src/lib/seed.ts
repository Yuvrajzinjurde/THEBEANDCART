

'use server';

import dbConnect from './mongodb';
import Brand from '@/models/brand.model';
import Product from '@/models/product.model';
import Role from '@/models/role.model';
import User from '@/models/user.model';
import Order from '@/models/order.model';
import Legal, { legalDocTypes } from '@/models/legal.model';

const brandsData = [
    {
        displayName: "Reeva",
        permanentName: "reeva",
        logoUrl: "https://picsum.photos/seed/reeva-logo/200/200",
        themeName: "Rose",
        categories: ["Wellness", "Skincare", "Makeup", "Haircare", "Fragrance", "Body Care", "Men's Grooming", "Beauty Tools"],
        banners: [
            { title: "Discover Your Natural Glow", description: "Pure ingredients, powerful results. Shop our new arrivals.", imageUrl: "https://picsum.photos/seed/reeva-glow/1600/400", imageHint: "skincare model" },
            { title: "Summer Radiance Collection", description: "Lightweight formulas for a sun-kissed look. Limited edition.", imageUrl: "https://picsum.photos/seed/reeva-summer/1600/400", imageHint: "summer beach" },
        ],
        categoryBanners: [
            { categoryName: "Skincare", imageUrl: "https://picsum.photos/seed/reeva-cat-skincare/400/600", imageHint: "face serum" },
            { categoryName: "Makeup", imageUrl: "https://picsum.photos/seed/reeva-cat-makeup/400/400", imageHint: "lipstick palette" },
            { categoryName: "Haircare", imageUrl: "https://picsum.photos/seed/reeva-cat-haircare/400/600", imageHint: "hair oil" },
            { categoryName: "Body Care", imageUrl: "https://picsum.photos/seed/reeva-cat-bodycare/400/400", imageHint: "body lotion" },
            { categoryName: "Fragrance", imageUrl: "https://picsum.photos/seed/reeva-cat-fragrance/400/400", imageHint: "perfume bottle" },
            { categoryName: "Men's Grooming", imageUrl: "https://picsum.photos/seed/reeva-cat-men/400/600", imageHint: "shaving kit" },
            { categoryName: "Beauty Tools", imageUrl: "https://picsum.photos/seed/reeva-cat-tools/400/400", imageHint: "makeup brushes" },
            { categoryName: "Wellness", imageUrl: "https://picsum.photos/seed/reeva-cat-wellness/400/400", imageHint: "yoga meditation" },
            { categoryName: "Combos", imageUrl: "https://picsum.photos/seed/reeva-cat-combos/400/400", imageHint: "gift set" },
        ],
        promoBanner: {
            title: "Exclusive Online Offer",
            description: "Join our community and receive 20% off your first order. Plus, get a free gift at checkout!",
            imageUrl: "https://picsum.photos/seed/reeva-promo/1200/600",
            imageHint: "beauty products",
            buttonText: "Shop Now",
            buttonLink: "/reeva/products",
        },
        offers: [
            { title: "First Purchase Bonus", description: "Get 15% off your first order with us.", code: "REEVA15" },
            { title: "Free Shipping", description: "Enjoy free shipping on all orders over ₹499.", code: "FREESHIP" },
            { title: "Skincare Special", description: "Buy any 2 serums and get a free face mask.", code: "GLOWUP" },
        ],
        reviews: [
            { customerName: "Priya S.", rating: 5, reviewText: "The Vitamin C serum is a game changer! My skin has never felt brighter.", customerAvatarUrl: "https://picsum.photos/seed/priya/100/100" },
            { customerName: "Rahul M.", rating: 4, reviewText: "Great products, especially the men's line. The beard oil is fantastic.", customerAvatarUrl: "https://picsum.photos/seed/rahul/100/100" },
            { customerName: "Anjali K.", rating: 5, reviewText: "I'm in love with the fragrances. They last all day and are so unique!", customerAvatarUrl: "https://picsum.photos/seed/anjali/100/100" },
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
    { name: 'Radiant Glow Serum', category: 'Skincare', rating: 4.8 },
    { name: 'Matte Velvet Lipstick', category: 'Makeup', rating: 4.5 },
    { name: 'Hydrating Face Cream', category: 'Skincare', rating: 4.9 },
    { name: 'Nourishing Hair Oil', category: 'Haircare', rating: 4.8 },
    { name: 'Dewy Finish Foundation', category: 'Makeup', rating: 4.6 },
    { name: 'Rosewater Face Mist', category: 'Skincare', rating: 4.7 },
    { name: 'Volumizing Hair Mousse', category: 'Haircare', rating: 4.4 },
    { name: 'Jasmine Body Lotion', category: 'Body Care', rating: 4.8 },
    { name: 'Midnight Oud Perfume', category: 'Fragrance', rating: 4.9 },
    { name: 'Charcoal Face Wash', category: 'Men\'s Grooming', rating: 4.6 },
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
        const mrp = Math.floor(Math.random() * 2000) + 1000;
        const sellingPrice = mrp - Math.floor(Math.random() * 500);

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
            images: Array.from({ length: 5 }, (_, j) => `https://picsum.photos/seed/${productName.replace(/\s/g, '-')}-${j}/600/600`),
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


export const seedDatabase = async () => {
    try {
        await dbConnect();
        console.log('Database connected, starting seed process...');

        // Clear only brands and products
        await Brand.deleteMany({});
        console.log('Cleared existing Brand collection.');
        await Product.deleteMany({});
        console.log('Cleared existing Product collection.');
        
        // Seed Roles if they don't exist
        const rolesCount = await Role.countDocuments();
        if (rolesCount === 0) {
            await Role.insertMany([{ name: 'user' }, { name: 'admin' }]);
            console.log('Seeded Roles.');
        }

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
        
        const message = 'Database seeded successfully with fresh data. User data was not affected.';
        console.log(message);
        return { success: true, message };

    } catch (error: any) {
        console.error('Error during database seeding:', error);
        throw new Error('Failed to seed database.');
    }
};
