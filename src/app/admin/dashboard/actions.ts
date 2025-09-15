
'use server';

import dbConnect from '@/lib/mongodb';
import Product, { IProduct } from '@/models/product.model';
import User from '@/models/user.model';
import Order from '@/models/order.model';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';


export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  returnPercentage: number;
  allProducts: IProduct[];
  chartData: { date: string; sales: number, orders: number }[];
  percentageChanges: {
    revenue: number;
    orders: number;
    views: number;
    clicks: number;
    conversion: number;
  };
}

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
        const sevenDaysAgo = startOfDay(subDays(now, 6));
        const prevSevenDaysAgo = startOfDay(subDays(now, 13));

        // === Product Stats (Current & Previous) ===
        const allProducts = await Product.find(brandQuery).lean();
        const allProductsObject: IProduct[] = JSON.parse(JSON.stringify(allProducts));

        const productStats = allProductsObject.reduce((acc, p) => {
            acc.totalViews += p.views || 0;
            acc.totalClicks += p.clicks || 0;
            return acc;
        }, { totalViews: 0, totalClicks: 0 });

        // Dummy previous month data for views/clicks as we don't have historical tracking
        // This is a simplification for calculating percentage change
        const prevProductStats = {
            totalViews: Math.floor(productStats.totalViews / 2),
            totalClicks: Math.floor(productStats.totalClicks / 2),
        };
        

        // === Order Stats (Current & Previous) ===
        const currentOrders = await Order.find({ ...brandQuery, status: { $ne: 'cancelled' }, createdAt: { $gte: sevenDaysAgo } });
        const previousOrders = await Order.find({ ...brandQuery, status: { $ne: 'cancelled' }, createdAt: { $gte: prevSevenDaysAgo, $lt: sevenDaysAgo } });
        
        const totalOrders = currentOrders.length;
        const prevTotalOrders = previousOrders.length;

        const totalRevenue = currentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const prevTotalRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // === Chart Data (Last 7 Days) ===
        const dailyStats = await Order.aggregate([
          { $match: { ...brandQuery, status: { $ne: 'cancelled' }, createdAt: { $gte: sevenDaysAgo } } },
          { $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              sales: { $sum: "$totalAmount" },
              orders: { $sum: 1 }
          }},
          { $sort: { "_id": 1 } }
        ]);

        const statsMap = new Map(dailyStats.map(d => [d._id, { sales: d.sales, orders: d.orders }]));
        
        const chartData = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(now, 6 - i);
            const dateString = format(date, 'yyyy-MM-dd');
            const data = statsMap.get(dateString) || { sales: 0, orders: 0 };
            return {
                date: format(date, 'EEE'), // Format as 'Mon', 'Tue', etc.
                sales: data.sales,
                orders: data.orders,
            };
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
            chartData,
            percentageChanges,
        };

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw new Error('Could not fetch dashboard statistics from the database.');
    }
}
