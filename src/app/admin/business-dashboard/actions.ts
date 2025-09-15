
'use server';

import dbConnect from '@/lib/mongodb';
import Order from '@/models/order.model';
import Product from '@/models/product.model';
import mongoose from 'mongoose';

interface ProductPerformance {
  _id: string;
  name: string;
  totalRevenue: number;
  unitsSold: number;
  imageUrl: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  stock: number;
  imageUrl: string;
}

export interface BusinessDashboardData {
  topByRevenue: ProductPerformance[];
  topByUnitsSold: ProductPerformance[];
  lowStockProducts: LowStockProduct[];
}

export async function getBusinessDashboardData(brand: string): Promise<BusinessDashboardData> {
  await dbConnect();

  try {
    const brandQuery = brand === 'All Brands' ? {} : { brand };

    // Top selling products by revenue
    const topByRevenue = await Order.aggregate([
      { $match: { ...brandQuery, status: { $in: ['delivered', 'shipped'] } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: '$productInfo._id',
          name: '$productInfo.name',
          totalRevenue: 1,
          imageUrl: { $arrayElemAt: ['$productInfo.images', 0] },
        },
      },
    ]);

    // Top selling products by units sold
    const topByUnitsSold = await Order.aggregate([
      { $match: { ...brandQuery, status: { $in: ['delivered', 'shipped'] } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          unitsSold: { $sum: '$products.quantity' },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: '$productInfo._id',
          name: '$productInfo.name',
          unitsSold: 1,
          imageUrl: { $arrayElemAt: ['$productInfo.images', 0] },
        },
      },
    ]);

    // Products with low stock
    const lowStockProducts = await Product.find({
      ...brandQuery,
      stock: { $lt: 10, $gt: 0 },
    })
      .sort({ stock: 1 })
      .limit(10)
      .select('name stock images')
      .lean();

    return {
      topByRevenue: JSON.parse(JSON.stringify(topByRevenue)),
      topByUnitsSold: JSON.parse(JSON.stringify(topByUnitsSold)),
      lowStockProducts: lowStockProducts.map(p => ({...p, imageUrl: p.images[0]})) as LowStockProduct[],
    };
  } catch (error) {
    console.error('Failed to fetch business dashboard data:', error);
    throw new Error('Could not fetch business dashboard data from the database.');
  }
}
