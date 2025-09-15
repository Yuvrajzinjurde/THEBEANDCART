
'use server';

import dbConnect from '@/lib/mongodb';
import Product, { IProduct } from '@/models/product.model';
import User from '@/models/user.model';
import Order from '@/models/order.model';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';


export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  returnPercentage: number;
  allProducts: IProduct[];
  revenueChartData: { month: string; revenue: number }[];
  percentageChanges: {
    revenue: number;
    orders: number;
    views: number;
    clicks: number;
    conversion: number;
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
        
        const startOfThisMonth = startOfMonth(now);
        const startOfLastMonth = startOfMonth(lastMonth);
        const endOfLastMonth = endOfMonth(lastMonth);

        // === Product Stats (Current & Previous) ===
        const allProducts = await Product.find(brandQuery).lean();
        const allProductsObject: IProduct[] = JSON.parse(JSON.stringify(allProducts));

        const productStats = allProductsObject.reduce((acc, p) => {
            acc.totalViews += p.views || 0;
            acc.totalClicks += p.clicks || 0;
            return acc;
        }, { totalViews: 0, totalClicks: 0 });

        // Dummy previous month data for views/clicks as we don't have historical tracking
        const prevProductStats = {
            totalViews: productStats.totalViews / 2,
            totalClicks: productStats.totalClicks / 2,
        };
        

        // === Order Stats (Current & Previous) ===
        const currentOrders = await Order.find({ ...brandQuery, status: { $ne: 'cancelled' }, createdAt: { $gte: startOfThisMonth } });
        const previousOrders = await Order.find({ ...brandQuery, status: { $ne: 'cancelled' }, createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } });
        
        const totalOrders = currentOrders.length;
        const prevTotalOrders = previousOrders.length;

        const totalRevenue = currentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const prevTotalRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);

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

        // === Calculations & Percentages ===
        const conversionRate = productStats.totalClicks > 0 ? (totalOrders / productStats.totalClicks) * 100 : 0;
        const prevConversionRate = prevProductStats.totalClicks > 0 ? (prevTotalOrders / prevProductStats.totalClicks) * 100 : 0;
        
        const percentageChanges = {
            revenue: calculatePercentageChange(totalRevenue, prevTotalRevenue),
            orders: calculatePercentageChange(totalOrders, prevTotalOrders),
            views: calculatePercentageChange(productStats.totalViews, prevProductStats.totalViews),
            clicks: calculatePercentageChange(productStats.totalClicks, prevProductStats.totalClicks),
            conversion: calculatePercentageChange(conversionRate, prevConversionRate),
        };

        return {
            totalRevenue,
            totalOrders,
            totalViews: productStats.totalViews,
            totalClicks: productStats.totalClicks,
            conversionRate,
            returnPercentage: 0, // Not tracked yet
            allProducts: allProductsObject,
            revenueChartData,
            percentageChanges,
        };

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw new Error('Could not fetch dashboard statistics from the database.');
    }
}
