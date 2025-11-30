
'use server';

import dbConnect from './mongodb';
import Brand from '@/models/brand.model';
import type { ICategoryGridItem } from '@/models/brand.model';

// Helper function to generate placeholder content for a category
const generateCategoryGridItem = (category: string, brandName: string): ICategoryGridItem => {
    const sanitizedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Generate up to 8 unique images for each category
    const images = Array.from({ length: 8 }, (_, i) => ({
      url: `https://picsum.photos/seed/${sanitizedCategory}-${brandName}-${i + 1}/600/400`,
      hint: `${category} product ${i + 1}`
    }));

    return {
        category: category,
        title: `Explore Our ${category}`,
        description: `Discover the finest selection of ${category}. Curated just for you.`,
        images: images,
        buttonLink: `/${brandName}/products?category=${encodeURIComponent(category)}`,
    };
};


export async function seedDatabase() {
  await dbConnect();
  console.log('Starting category grid seeding process...');

  try {
    const brands = await Brand.find({});
    if (brands.length === 0) {
        const message = "No brands found to seed. Please create a brand first.";
        console.log(message);
        return { success: false, message };
    }

    let updatedBrandsCount = 0;

    for (const brand of brands) {
        if (brand.categories && brand.categories.length > 0) {
            const categoryGridItems: ICategoryGridItem[] = brand.categories.map(cat => 
                generateCategoryGridItem(cat, brand.permanentName)
            );
            
            // Add an 'All' category for the grid as well
            categoryGridItems.unshift({
                category: 'All',
                title: 'Curated For You',
                description: `Browse our complete collection of hand-picked items, perfect for any occasion.`,
                images: Array.from({ length: 8 }, (_, i) => ({
                    url: `https://picsum.photos/seed/${brand.permanentName}-all-${i + 1}/600/400`,
                    hint: `lifestyle collection ${i + 1}`
                })),
                buttonLink: `/${brand.permanentName}/products`
            });

            brand.categoryGrid = categoryGridItems;
            await brand.save();
            updatedBrandsCount++;
        }
    }
    
    const message = `Successfully seeded category grids for ${updatedBrandsCount} brand(s).`;
    console.log(message);
    return { success: true, message, updatedBrands: updatedBrandsCount };

  } catch(error: any) {
    console.error('Error during database seeding process:', error);
    throw new Error(`Failed to seed category grids: ${error.message}`);
  }
}
