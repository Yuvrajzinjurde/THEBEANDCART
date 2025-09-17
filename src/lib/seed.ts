
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
    },
    {
        displayName: "Nevermore",
        permanentName: "nevermore",
        logoUrl: "https://picsum.photos/seed/nevermore-logo/200/200",
        themeName: "Slate (Dark)",
    }
];

const productsData = [
  { name: 'Radiant Glow Serum', category: 'Skincare', brand: 'Reeva', storefront: 'reeva', rating: 4.8 },
  { name: 'Matte Velvet Lipstick', category: 'Makeup', brand: 'Reeva', storefront: 'reeva', rating: 4.5 },
  { name: 'Hydrating Face Cream', category: 'Skincare', brand: 'Reeva', storefront: 'reeva', rating: 4.9 },
  { name: 'Gothic Print Hoodie', category: 'Hoodies', brand: 'Nevermore', storefront: 'nevermore', rating: 4.7 },
  { name: 'Distressed Black Jeans', category: 'Jeans', brand: 'Nevermore', storefront: 'nevermore', rating: 4.6 },
  { name: 'Platform Combat Boots', category: 'Boots', brand: 'Nevermore', storefront: 'nevermore', rating: 4.8 },
  { name: 'Floral Maxi Dress', category: 'Dresses', brand: 'Reeva', storefront: 'reeva', rating: 4.6 },
  { name: 'Vintage Band Tee', category: 'T-Shirts', brand: 'Nevermore', storefront: 'nevermore', rating: 4.5 },
  { name: 'Nourishing Hair Oil', category: 'Haircare', brand: 'Reeva', storefront: 'reeva', rating: 4.8 },
  { name: 'Chain-Detail Choker', category: 'Accessories', brand: 'Nevermore', storefront: 'nevermore', rating: 4.4 },
];

const staticCategories = [
    'T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Kurtas', 'Sarees', 'Dresses', 
    'Skirts', 'Heels', 'Flats', 'Sneakers', 'Boots', 'Handbags', 'Wallets', 
    'Belts', 'Sunglasses', 'Watches', 'Rings', 'Earrings', 'Necklaces', 
    'Bracelets', 'Moisturizers', 'Sunscreens', 'Face Washes', 'Serums', 
    'Lipsticks', 'Foundations', 'Eyeshadows', 'Combos', 'Corrugated Boxes',
    'Skincare', 'Makeup', 'Haircare', 'Hoodies', 'Accessories'
];

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

        // Clear only product data to avoid wiping users and brands
        await Product.deleteMany({});
        console.log('Cleared existing product collection.');
        
        // Check if roles exist, if not, seed them
        const rolesCount = await Role.countDocuments();
        if (rolesCount === 0) {
            await Role.insertMany([{ name: 'user' }, { name: 'admin' }]);
            console.log('Seeded Roles.');
        }

        // Check if brands exist, if not, seed them
        const brandsCount = await Brand.countDocuments();
        if (brandsCount === 0) {
            await Brand.insertMany(brandsData.map(b => ({ ...b, categories: staticCategories })));
            console.log('Seeded Brands with categories.');
        }

        // Seed Products
        const createdProducts = await Product.insertMany(
            productsData.map((p, index) => {
                const mrp = Math.floor(Math.random() * 2000) + 1000;
                const sellingPrice = mrp - Math.floor(Math.random() * 500);
                return {
                    ...p,
                    description: `This is a high-quality ${p.name}, perfect for any occasion. Made with the finest materials to ensure comfort and durability.`,
                    mrp: mrp,
                    sellingPrice: sellingPrice,
                    stock: Math.floor(Math.random() * 100),
                    images: Array.from({ length: 5 }, (_, i) => `https://picsum.photos/seed/${p.name.replace(/\s/g, '-')}-${index}-${i}/600/600`),
                    keywords: [p.category, p.brand, p.name.split(' ')[0]],
                    styleId: `style-${p.name.replace(/\s/g, '-').toLowerCase()}`
                }
            })
        );
        console.log(`Seeded ${createdProducts.length} products.`);

        // Check if legal docs exist, if not, seed them
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
        
        const message = 'Database seeded successfully with fresh data.';
        console.log(message);
        return { success: true, message };

    } catch (error: any) {
        console.error('Error during database seeding:', error);
        throw new Error('Failed to seed database.');
    }
};
