import { Request, Response } from 'express';
import User from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;

  // Build query
  const query: any = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    query.role = role;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit as string) * 1)
    .skip((parseInt(page as string) - 1) * parseInt(limit as string));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      totalPages: Math.ceil(total / parseInt(limit as string)),
      currentPage: parseInt(page as string),
      totalUsers: total
    }
  });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    return;
  }

  res.json({
    success: true,
    data: user
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { password, ...updateData } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    return;
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  
  // Prevent self-deletion
  if (req.user!._id?.toString() === userId) {
    res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    });
    return;
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    return;
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  
  // Prevent self-deactivation
  if (req.user!._id?.toString() === userId) {
    res.status(400).json({
      success: false,
      message: 'You cannot deactivate your own account'
    });
    return;
  }

  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    return;
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        adminCount: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        },
        managerCount: {
          $sum: { $cond: [{ $eq: ['$role', 'manager'] }, 1, 0] }
        },
        employeeCount: {
          $sum: { $cond: [{ $eq: ['$role', 'employee'] }, 1, 0] }
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      adminCount: 0,
      managerCount: 0,
      employeeCount: 0
    }
  });
});