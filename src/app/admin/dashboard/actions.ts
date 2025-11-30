
'use server';

import dbConnect from '@/lib/mongodb';
import Product, { IProduct } from '@/models/product.model';
import User from '@/models/user.model';
import Order from '@/models/order.model';
import { subDays, startOfDay, format } from 'date-fns';
import { Types } from 'mongoose';


export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalInventoryValue: number;
  totalLoss: number;
  allProducts: IProduct[];
  chartData: { date: string; sales: number, orders: number }[];
  percentageChanges: {
    revenue: number;
    orders: number;
    products: number;
    users: number;
    inventory: number;
    loss: number;
    views: number;
    clicks: number;
    conversion: number;
  };
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
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
        const brandQuery = brand === 'All Brands' ? {} : { storefront: brand };
        
        const now = new Date();
        const sevenDaysAgo = startOfDay(subDays(now, 6));
        const prevSevenDaysAgo = startOfDay(subDays(now, 13));

        // === Product, User, and Inventory Stats ===
        const allProducts = await Product.find(brandQuery).lean();
        const allProductsObject: IProduct[] = JSON.parse(JSON.stringify(allProducts));

        const adminRoleId = await Types.ObjectId.createFromHexString('66a55e97573d808e7c1e5a5b'); // Assuming this is the admin role ID
        const userQuery: any = { roles: { $ne: adminRoleId } };
        if (brand !== 'All Brands') {
            userQuery.brand = brand;
        }
        const totalUsers = await User.countDocuments(userQuery);

        const totalProducts = allProductsObject.length;
        const totalInventoryValue = allProductsObject.reduce((sum, p) => sum + (p.sellingPrice * p.stock), 0);
        
        const totalViews = allProductsObject.reduce((sum, p) => sum + (p.views || 0), 0);
        const totalClicks = allProductsObject.reduce((sum, p) => sum + (p.clicks || 0), 0);
        
        // Dummy previous data for percentage change calculation
        const prevTotalProducts = Math.floor(totalProducts / 2);
        const prevTotalUsers = Math.floor(totalUsers / 2);
        const prevTotalInventoryValue = Math.floor(totalInventoryValue / 2);
        const prevTotalViews = Math.floor(totalViews / 2);
        const prevTotalClicks = Math.floor(totalClicks / 2);

        // === Order Stats (Current & Previous) ===
        const orderBrandQuery = brand === 'All Brands' ? {} : { brand: brand };
        const currentOrders = await Order.find({ ...orderBrandQuery, status: { $ne: 'cancelled' }, createdAt: { $gte: sevenDaysAgo } });
        const previousOrders = await Order.find({ ...orderBrandQuery, status: { $ne: 'cancelled' }, createdAt: { $gte: prevSevenDaysAgo, $lt: sevenDaysAgo } });
        
        const totalOrders = currentOrders.length;
        const prevTotalOrders = previousOrders.length;

        const totalRevenue = currentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const prevTotalRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // === Chart Data (Last 7 Days) ===
        const dailyStats = await Order.aggregate([
          { $match: { ...orderBrandQuery, status: { $ne: 'cancelled' }, createdAt: { $gte: sevenDaysAgo } } },
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
        const conversionRate = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;
        const prevConversionRate = prevTotalClicks > 0 ? (prevTotalOrders / prevTotalClicks) * 100 : 0;

        const percentageChanges = {
            revenue: calculatePercentageChange(totalRevenue, prevTotalRevenue),
            orders: calculatePercentageChange(totalOrders, prevTotalOrders),
            products: calculatePercentageChange(totalProducts, prevTotalProducts),
            users: calculatePercentageChange(totalUsers, prevTotalUsers),
            inventory: calculatePercentageChange(totalInventoryValue, prevTotalInventoryValue),
            loss: 0, // No loss tracking yet
            views: calculatePercentageChange(totalViews, prevTotalViews),
            clicks: calculatePercentageChange(totalClicks, prevTotalClicks),
            conversion: calculatePercentageChange(conversionRate, prevConversionRate),
        };

        return {
            totalRevenue,
            totalOrders,
            totalProducts,
            totalUsers,
            totalInventoryValue,
            totalLoss: 0, // No loss tracking yet
            allProducts: allProductsObject,
            chartData,
            percentageChanges,
            totalViews,
            totalClicks,
            conversionRate,
        };

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw new Error('Could not fetch dashboard statistics from the database.');
    }
}
