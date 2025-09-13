
'use server';

import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';
import User from '@/models/user.model';

export interface DashboardStats {
  totalInventoryValue: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  totalLoss: number;
  revenueChartData: { month: string; revenue: number }[];
  salesByCategoryData: { name: string; value: number }[];
}

// Helper to generate revenue data. Since we have no orders, it will be all zeros.
const generateRevenueData = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months.map(month => ({
        month,
        revenue: 0
    }));
};

export async function getDashboardStats(brand: string): Promise<DashboardStats> {
    await dbConnect();
    try {
        const brandQuery = brand === 'All Brands' ? {} : { brand };

        const productAggregation = await Product.aggregate([
            { $match: brandQuery },
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
                    totalCount: { $sum: 1 }
                }
            }
        ]);
        
        const categoryAggregation = await Product.aggregate([
            { $match: brandQuery },
            {
                $group: {
                    _id: "$category",
                    value: { $sum: 1 } // Counting products per category
                }
            },
            { $sort: { value: -1 } },
            { $limit: 5 },
            { 
                $project: {
                    _id: 0,
                    name: "$_id",
                    value: 1
                }
            }
        ]);

        const totalUsers = await User.countDocuments({});
        
        const productStats = productAggregation[0] || { totalValue: 0, totalCount: 0 };
        const revenueChartData = generateRevenueData();
        
        // Since there are no orders, revenue and loss are 0.
        const totalRevenue = 0;
        const totalLoss = 0;


        return {
            totalInventoryValue: productStats.totalValue,
            totalProducts: productStats.totalCount,
            totalUsers: totalUsers,
            totalRevenue: totalRevenue,
            totalLoss: totalLoss,
            revenueChartData: revenueChartData,
            salesByCategoryData: categoryAggregation,
        };

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw new Error('Could not fetch dashboard statistics from the database.');
    }
}
