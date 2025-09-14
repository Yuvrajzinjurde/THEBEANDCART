
'use server';

import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';
import User from '@/models/user.model';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';


export interface DashboardStats {
  totalInventoryValue: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  totalLoss: number; // This will remain 0 as we don't have order data
  revenueChartData: { month: string; revenue: number }[];
  salesByCategoryData: { name: string; value: number }[];
  percentageChanges: {
    revenue: number;
    loss: number;
    inventory: number;
    users: number;
  };
}

// Helper to generate revenue data. Since we have no orders, it will be all zeros.
const generateRevenueData = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months.map(month => ({
        month,
        revenue: 0
    }));
};

const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};


export async function getDashboardStats(brand: string): Promise<DashboardStats> {
    await dbConnect();
    try {
        // Use a case-insensitive regex for the brand name
        const brandQuery = brand === 'All Brands' ? {} : { brand: { $regex: new RegExp(`^${brand}$`, 'i') } };
        
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        
        const startOfLastMonth = startOfMonth(lastMonth);
        const endOfLastMonth = endOfMonth(lastMonth);

        // === Product Stats ===
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

        const prevProductAggregation = await Product.aggregate([
             { $match: { ...brandQuery, createdAt: { $lte: endOfLastMonth } } },
             {
                $group: {
                    _id: null,
                    totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
                }
            }
        ]);

        // === User Stats ===
        const totalUsers = await User.countDocuments(brandQuery);
        const prevTotalUsers = await User.countDocuments({ ...brandQuery, createdAt: { $lte: endOfLastMonth } });
        

        const productStats = productAggregation[0] || { totalValue: 0, totalCount: 0 };
        const prevProductStats = prevProductAggregation[0] || { totalValue: 0 };

        // === Category Stats ===
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

        // === Chart Data & Final Stats ===
        const revenueChartData = generateRevenueData();
        const totalRevenue = 0; // Stays 0, no order data
        const totalLoss = 0; // Stays 0, no order data
        
        const percentageChanges = {
            revenue: calculatePercentageChange(totalRevenue, 0), // No historical data
            loss: calculatePercentageChange(totalLoss, 0),       // No historical data
            inventory: calculatePercentageChange(productStats.totalValue, prevProductStats.totalValue),
            users: calculatePercentageChange(totalUsers, prevTotalUsers),
        };

        return {
            totalInventoryValue: productStats.totalValue,
            totalProducts: productStats.totalCount,
            totalUsers: totalUsers,
            totalRevenue: totalRevenue,
            totalLoss: totalLoss,
            revenueChartData: revenueChartData,
            salesByCategoryData: categoryAggregation,
            percentageChanges: percentageChanges,
        };

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw new Error('Could not fetch dashboard statistics from the database.');
    }
}
