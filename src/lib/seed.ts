'use server';

import dbConnect from './mongodb';
import Brand from '@/models/brand.model';
import Legal, { legalDocTypes, type ILegal } from '@/models/legal.model';

const staticCategories = [
    'T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Kurtas', 'Sarees', 'Dresses', 
    'Skirts', 'Heels', 'Flats', 'Sneakers', 'Boots', 'Handbags', 'Wallets', 
    'Belts', 'Sunglasses', 'Watches', 'Rings', 'Earrings', 'Necklaces', 
    'Bracelets', 'Moisturizers', 'Sunscreens', 'Face Washes', 'Serums', 
    'Lipsticks', 'Foundations', 'Eyeshadows', 'Combos', 'Corrugated Boxes'
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
}

export const seedDatabase = async () => {
    try {
        await dbConnect();
        console.log('Connected to the database, starting seed process...');

        const brands = await Brand.find({});
        let updatedCatCount = 0;
        let createdLegalCount = 0;
        
        // --- Seed Categories for all Brands ---
        if (brands.length > 0) {
            for (const brand of brands) {
                const currentCategories = new Set(brand.categories || []);
                const initialSize = currentCategories.size;
                staticCategories.forEach(cat => currentCategories.add(cat));
                if (currentCategories.size > initialSize) {
                    brand.categories = Array.from(currentCategories).sort();
                    await brand.save();
                    updatedCatCount++;
                    console.log(`Updated categories for brand: ${brand.displayName}`);
                }
            }
        }

        // --- Seed global Legal Documents ---
        for (const docType of legalDocTypes) {
            const existingDoc = await Legal.findOne({ docType });
            if (!existingDoc) {
                const newDoc = new Legal({
                    docType: docType,
                    title: getLegalDocTitle(docType),
                    content: getLegalDocPlaceholder(docType),
                });
                await newDoc.save();
                createdLegalCount++;
                console.log(`Created global '${docType}' document.`);
            }
        }
        
        let message = '';
        if (updatedCatCount > 0) message += `${updatedCatCount} brand(s) updated with categories. `;
        if (createdLegalCount > 0) message += `${createdLegalCount} new legal documents created.`;
        if (!message) message = 'All brands and legal documents were already up-to-date.';

        console.log(`Seeding complete. ${message}`);
        return { success: true, message };

    } catch (error: any) {
        console.error('Error during database seeding:', error);
        throw new Error('Failed to seed database.');
    }
};
