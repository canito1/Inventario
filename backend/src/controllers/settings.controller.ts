import { Response } from 'express';
import Settings from '../models/Settings';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc    Get system settings
 * @route   GET /api/settings
 * @access  Private (authenticated users)
 */
export const getSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    // Try to find existing settings document
    let settings = await Settings.findOne({ singleton: true });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        singleton: true,
        name: 'Mi Empresa',
        email: 'contacto@miempresa.com',
        timezone: 'America/Lima',
        defaultCurrency: 'PEN',
        exchangeRate: 3.75 // Default: 1 USD = 3.75 PEN
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving settings. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Update system settings
 * @route   PUT /api/settings
 * @access  Private (admin only)
 */
export const updateSettings = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, timezone, defaultCurrency, exchangeRate } = req.body;

    // Validate that at least one field is provided
    if (!name && !email && !timezone && !defaultCurrency && exchangeRate === undefined) {
      res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update'
      });
      return;
    }

    // Additional validation for exchangeRate
    if (exchangeRate !== undefined) {
      if (typeof exchangeRate !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Exchange rate must be a number'
        });
        return;
      }
      if (exchangeRate <= 0) {
        res.status(400).json({
          success: false,
          message: 'Exchange rate must be greater than 0'
        });
        return;
      }
      if (exchangeRate < 0.01) {
        res.status(400).json({
          success: false,
          message: 'Exchange rate must be at least 0.01'
        });
        return;
      }
      if (exchangeRate > 20) {
        res.status(400).json({
          success: false,
          message: 'Exchange rate cannot exceed 20'
        });
        return;
      }
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (defaultCurrency !== undefined) updateData.defaultCurrency = defaultCurrency;
    if (exchangeRate !== undefined) updateData.exchangeRate = exchangeRate;

    // Update or create settings document (upsert)
    const settings = await Settings.findOneAndUpdate(
      { singleton: true },
      { ...updateData, singleton: true },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    // Log the update for audit purposes
    console.log(`Settings updated by user ${req.user?.email || 'unknown'}:`, updateData);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
      return;
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Error updating settings. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
