import { Request, Response } from 'express';
import Item from '../models/Item';
import Category from '../models/Category';
import User from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  // Get basic counts
  const [totalItems, totalCategories, totalUsers, lowStockCount] = await Promise.all([
    Item.countDocuments({ status: 'active' }),
    Category.countDocuments(),
    User.countDocuments({ isActive: true }),
    Item.countDocuments({
      $expr: { $lte: ['$quantity', '$minStock'] },
      status: 'active'
    })
  ]);

  // Get total inventory value
  const inventoryValue = await Item.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
      }
    }
  ]);

  // Get recent items (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentItems = await Item.find({
    createdAt: { $gte: sevenDaysAgo },
    status: 'active'
  })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get low stock items
  const lowStockItems = await Item.find({
    $expr: { $lte: ['$quantity', '$minStock'] },
    status: 'active'
  })
    .populate('category', 'name')
    .sort({ quantity: 1 })
    .limit(10);

  // Get category distribution
  const categoryStats = await Item.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: '$category'
    },
    {
      $project: {
        name: '$category.name',
        count: 1,
        totalValue: 1
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Get monthly trends (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTrends = await Item.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        itemsAdded: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalItems,
        totalCategories,
        totalUsers,
        lowStockCount,
        totalValue: inventoryValue[0]?.totalValue || 0
      },
      recentItems,
      lowStockItems,
      categoryStats,
      monthlyTrends
    }
  });
});

export const getInventoryOverview = asyncHandler(async (req: Request, res: Response) => {
  const overview = await Item.aggregate([
    {
      $facet: {
        statusDistribution: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
            }
          }
        ],
        stockLevels: [
          {
            $project: {
              name: 1,
              quantity: 1,
              minStock: 1,
              maxStock: 1,
              stockLevel: {
                $cond: [
                  { $lte: ['$quantity', '$minStock'] },
                  'low',
                  {
                    $cond: [
                      { $gte: ['$quantity', '$maxStock'] },
                      'high',
                      'normal'
                    ]
                  }
                ]
              }
            }
          },
          {
            $group: {
              _id: '$stockLevel',
              count: { $sum: 1 }
            }
          }
        ],
        priceRanges: [
          {
            $bucket: {
              groupBy: '$price',
              boundaries: [0, 10, 50, 100, 500, 1000, Infinity],
              default: 'Other',
              output: {
                count: { $sum: 1 },
                totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
              }
            }
          }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: overview[0]
  });
});