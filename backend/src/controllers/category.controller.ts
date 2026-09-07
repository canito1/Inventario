import { Request, Response } from 'express';
import Category from '../models/Category';
import Item from '../models/Item';
import { asyncHandler } from '../middleware/errorHandler';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });

  res.json({
    success: true,
    data: categories
  });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404).json({
      success: false,
      message: 'Category not found'
    });
    return;
  }

  res.json({
    success: true,
    data: category
  });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    res.status(404).json({
      success: false,
      message: 'Category not found'
    });
    return;
  }

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: category
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404).json({
      success: false,
      message: 'Category not found'
    });
    return;
  }

  // Check if category has items
  const itemCount = await Item.countDocuments({ category: req.params.id });
  
  if (itemCount > 0) {
    res.status(400).json({
      success: false,
      message: `Cannot delete category. It has ${itemCount} items associated with it.`
    });
    return;
  }

  await Category.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

export const getCategoryStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Category.aggregate([
    {
      $lookup: {
        from: 'items',
        localField: '_id',
        foreignField: 'category',
        as: 'items'
      }
    },
    {
      $project: {
        name: 1,
        description: 1,
        itemCount: { $size: '$items' },
        totalValue: {
          $sum: {
            $map: {
              input: '$items',
              as: 'item',
              in: { $multiply: ['$$item.quantity', '$$item.price'] }
            }
          }
        },
        lowStockItems: {
          $size: {
            $filter: {
              input: '$items',
              as: 'item',
              cond: { $lte: ['$$item.quantity', '$$item.minStock'] }
            }
          }
        }
      }
    },
    {
      $sort: { itemCount: -1 }
    }
  ]);

  res.json({
    success: true,
    data: stats
  });
});