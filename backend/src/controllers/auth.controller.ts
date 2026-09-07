import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  if (!userId) {
    throw new Error('User ID is required for token generation');
  }
  
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
    return;
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'employee'
  });

  // Generate token
  if (!user._id) {
    res.status(500).json({
      success: false,
      message: 'User creation failed'
    });
    return;
  }
  const token = generateToken(user._id.toString());

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email, isActive: true }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
    return;
  }

  // Generate token
  if (!user._id) {
    res.status(500).json({
      success: false,
      message: 'User authentication failed'
    });
    return;
  }
  const token = generateToken(user._id.toString());

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);
  
  res.json({
    success: true,
    data: user
  });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { name, email },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user!._id).select('+password');
  
  if (!user || !(await user.comparePassword(currentPassword))) {
    res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
    return;
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});