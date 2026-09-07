import { Request, Response } from 'express';
import Item from '../models/Item';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getItems = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    status,
    lowStock
  } = req.query;

  // Build query
  const query: any = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category) {
    query.category = category;
  }
  
  if (status) {
    query.status = status;
  }
  
  if (lowStock === 'true') {
    query.$expr = { $lte: ['$quantity', '$minStock'] };
  }

  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    populate: {
      path: 'category',
      select: 'name description'
    },
    sort: { createdAt: -1 }
  };

  const result = await (Item as any).paginate(query, options);

  res.json({
    success: true,
    data: result
  });
});

export const getItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.id).populate('category', 'name description');
  
  if (!item) {
    res.status(404).json({
      success: false,
      message: 'Item not found'
    });
    return;
  }

  res.json({
    success: true,
    data: item
  });
});

export const createItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log('📦 Creating item with data:', JSON.stringify(req.body, null, 2));
  
  try {
    const item = await Item.create(req.body);
    console.log('✅ Item created successfully:', item._id);
    
    const populatedItem = await Item.findById(item._id).populate('category', 'name description');

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: populatedItem
    });
  } catch (error: any) {
    console.error('❌ Error creating item:', error.message);
    console.error('📋 Validation errors:', error.errors);
    
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors
    });
  }
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  console.log('📝 Updating item:', req.params.id);
  console.log('📦 Update data:', JSON.stringify(req.body, null, 2));
  
  try {
    // Get the current item first
    const currentItem = await Item.findById(req.params.id);
    if (!currentItem) {
      console.log('❌ Item not found:', req.params.id);
      res.status(404).json({
        success: false,
        message: 'Item not found'
      });
      return;
    }

    // Prepare update data (maxStock is now optional)
    const updateData = { ...req.body };
    console.log('📦 Final update data:', JSON.stringify(updateData, null, 2));

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name description');

    if (!item) {
      console.log('❌ Item not found after update:', req.params.id);
      res.status(404).json({
        success: false,
        message: 'Item not found after update'
      });
      return;
    }

    console.log('✅ Item updated successfully:', item._id);
    res.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error: any) {
    console.error('❌ Error updating item:', error.message);
    console.error('📋 Validation errors:', error.errors);
    
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors
    });
  }
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findByIdAndDelete(req.params.id);

  if (!item) {
    res.status(404).json({
      success: false,
      message: 'Item not found'
    });
    return;
  }

  res.json({
    success: true,
    message: 'Item deleted successfully'
  });
});

export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const { quantity, operation } = req.body; // operation: 'add' | 'subtract' | 'set'
  
  const item = await Item.findById(req.params.id);
  
  if (!item) {
    res.status(404).json({
      success: false,
      message: 'Item not found'
    });
    return;
  }

  let newQuantity = item.quantity;
  
  switch (operation) {
    case 'add':
      newQuantity += quantity;
      break;
    case 'subtract':
      newQuantity = Math.max(0, newQuantity - quantity);
      break;
    case 'set':
      newQuantity = quantity;
      break;
    default:
      res.status(400).json({
        success: false,
        message: 'Invalid operation. Use add, subtract, or set'
      });
      return;
  }

  item.quantity = newQuantity;
  await item.save();

  const updatedItem = await Item.findById(item._id).populate('category', 'name description');

  res.json({
    success: true,
    message: 'Stock updated successfully',
    data: updatedItem
  });
});

export const getLowStockItems = asyncHandler(async (req: Request, res: Response) => {
  const items = await Item.find({
    $expr: { $lte: ['$quantity', '$minStock'] },
    status: 'active'
  }).populate('category', 'name description').sort({ quantity: 1 });

  res.json({
    success: true,
    data: items
  });
});

export const getItemStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Item.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
        lowStockItems: {
          $sum: {
            $cond: [{ $lte: ['$quantity', '$minStock'] }, 1, 0]
          }
        },
        activeItems: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        }
      }
    }
  ]);

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
        _id: 1,
        name: '$category.name',
        count: 1,
        totalValue: 1
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        activeItems: 0
      },
      categoryStats
    }
  });
});