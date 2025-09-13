
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

// Helper to generate some fake but realistic looking chart data
const generateRevenueData = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months.map(month => ({
        month,
        revenue: Math.floor(Math.random() * (50000 - 10000 + 1) + 10000)
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
                    value: { $sum: 1 }
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
        const totalRevenue = revenueChartData.reduce((acc, current) => acc + current.revenue, 0);


        return {
            totalInventoryValue: productStats.totalValue,
            totalProducts: productStats.totalCount,
            totalUsers: totalUsers,
            totalRevenue: totalRevenue,
            totalLoss: Math.floor(Math.random() * (5000 - 1000 + 1) + 1000),
            revenueChartData: revenueChartData,
            salesByCategoryData: categoryAggregation,
        };

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw new Error('Could not fetch dashboard statistics from the database.');
    }
}
