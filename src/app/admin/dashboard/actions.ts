
'use server';

import dbConnect from '@/lib/mongodb';
import Product from '@/models/product.model';
import User from '@/models/user.model';
import Order from '@/models/order.model';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';


export interface DashboardStats {
  totalInventoryValue: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  totalLoss: number;
  revenueChartData: { month: string; revenue: number }[];
  salesByCategoryData: { name: string; value: number }[];
  percentageChanges: {
    revenue: number;
    loss: number;
    inventory: number;
    users: number;
  };
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};


export async function getDashboardStats(brand: string): Promise<DashboardStats> {
    await dbConnect();
    try {
        const brandQuery = brand === 'All Brands' ? {} : { brand: { $regex: new RegExp(`^${brand}$`, 'i') } };
        
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        
        const startOfLastMonth = startOfMonth(lastMonth);
        const endOfLastMonth = endOfMonth(lastMonth);

        // === Current Stats ===
        const productAggregation = await Product.aggregate([
            { $match: brandQuery },
            { $group: {
                _id: null,
                totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
                totalCount: { $sum: 1 }
            }}
        ]);
        
        const totalUsers = await User.countDocuments(brandQuery);

        const orderAggregation = await Order.aggregate([
            { $match: { ...brandQuery, status: { $ne: 'cancelled' } } },
            { $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" }
            }}
        ]);
        
        const cancelledOrderAggregation = await Order.aggregate([
            { $match: { ...brandQuery, status: 'cancelled' } },
            { $group: {
                _id: null,
                totalLoss: { $sum: "$totalAmount" }
            }}
        ]);

        // === Previous Month Stats ===
        const prevProductAggregation = await Product.aggregate([
             { $match: { ...brandQuery, createdAt: { $lte: endOfLastMonth } } },
             { $group: {
                _id: null,
                totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
            }}
        ]);

        const prevTotalUsers = await User.countDocuments({ ...brandQuery, createdAt: { $lte: endOfLastMonth } });
        
        const prevOrderAggregation = await Order.aggregate([
            { $match: { ...brandQuery, status: { $ne: 'cancelled' }, createdAt: { $lte: endOfLastMonth } } },
            { $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" }
            }}
        ]);
        
        const prevCancelledOrderAggregation = await Order.aggregate([
            { $match: { ...brandQuery, status: 'cancelled', createdAt: { $lte: endOfLastMonth } } },
            { $group: {
                _id: null,
                totalLoss: { $sum: "$totalAmount" }
            }}
        ]);

        // === Process Stats ===
        const productStats = productAggregation[0] || { totalValue: 0, totalCount: 0 };
        const orderStats = orderAggregation[0] || { totalRevenue: 0 };
        const cancelledOrderStats = cancelledOrderAggregation[0] || { totalLoss: 0 };

        const prevProductStats = prevProductAggregation[0] || { totalValue: 0 };
        const prevOrderStats = prevOrderAggregation[0] || { totalRevenue: 0 };
        const prevCancelledOrderStats = prevCancelledOrderAggregation[0] || { totalLoss: 0 };


        // === Category Stats ===
        const categoryAggregation = await Product.aggregate([
            { $match: brandQuery },
            { $group: { _id: "$category", value: { $sum: 1 } } },
            { $sort: { value: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, name: "$_id", value: 1 } }
        ]);

        // === Chart Data ===
        const monthlyRevenue = await Order.aggregate([
          { $match: { ...brandQuery, status: { $ne: 'cancelled' } } },
          { $group: {
              _id: { month: { $month: "$createdAt" } },
              revenue: { $sum: "$totalAmount" }
          }},
          { $sort: { "_id.month": 1 } }
        ]);
        
        const revenueChartData = monthNames.map((month, index) => {
            const monthData = monthlyRevenue.find(d => d._id.month === index + 1);
            return { month, revenue: monthData ? monthData.revenue : 0 };
        });

        // === Final Stats & Percentages ===
        const percentageChanges = {
            revenue: calculatePercentageChange(orderStats.totalRevenue, prevOrderStats.totalRevenue),
            loss: calculatePercentageChange(cancelledOrderStats.totalLoss, prevCancelledOrderStats.totalLoss),
            inventory: calculatePercentageChange(productStats.totalValue, prevProductStats.totalValue),
            users: calculatePercentageChange(totalUsers, prevTotalUsers),
        };

        return {
            totalInventoryValue: productStats.totalValue,
            totalProducts: productStats.totalCount,
            totalUsers: totalUsers,
            totalRevenue: orderStats.totalRevenue,
            totalLoss: cancelledOrderStats.totalLoss,
            revenueChartData: revenueChartData,
            salesByCategoryData: categoryAggregation,
            percentageChanges: percentageChanges,
        };

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw new Error('Could not fetch dashboard statistics from the database.');
    }
}
