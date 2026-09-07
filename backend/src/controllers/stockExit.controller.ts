import { Request, Response } from 'express';
import StockExit from '../models/StockExit';
import Item from '../models/Item';
import { AuthRequest } from '../middleware/auth';

// Get all stock exits with pagination and filters
export const getStockExits = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const reason = req.query.reason as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        // Build filter object
        const filter: any = {};

        if (reason) {
            filter.reason = reason;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        // Build aggregation pipeline for search
        const pipeline: any[] = [
            {
                $lookup: {
                    from: 'items',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'item'
                }
            },
            {
                $unwind: '$item'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                }
            },
            {
                $unwind: '$createdBy'
            }
        ];

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'item.name': { $regex: search, $options: 'i' } },
                        { 'item.barcode': { $regex: search, $options: 'i' } },
                        { destination: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        if (Object.keys(filter).length > 0) {
            pipeline.push({ $match: filter });
        }

        pipeline.push({ $sort: { createdAt: -1 } });

        const exits = await StockExit.aggregate([
            ...pipeline,
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);

        const totalExits = await StockExit.aggregate([
            ...pipeline,
            { $count: 'total' }
        ]);

        const total = totalExits.length > 0 ? totalExits[0].total : 0;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                docs: exits,
                totalDocs: total,
                limit,
                page,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching stock exits:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stock exits',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get single stock exit
export const getStockExit = async (req: Request, res: Response): Promise<any> => {
    try {
        const exit = await StockExit.findById(req.params.id)
            .populate('item')
            .populate('createdBy', 'name email');

        if (!exit) {
            return res.status(404).json({
                success: false,
                message: 'Stock exit not found'
            });
        }

        res.json({
            success: true,
            data: exit
        });
    } catch (error) {
        console.error('Error fetching stock exit:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stock exit',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Create new stock exit
export const createStockExit = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { itemId, quantity, unitCost, destination, reason, notes } = req.body;

        // Validate required fields
        if (!itemId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Item and quantity are required'
            });
        }

        // Check if item exists and has enough stock
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        if (item.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}`
            });
        }

        // Create stock exit
        const exit = new StockExit({
            item: itemId,
            quantity,
            unitCost: unitCost || 0,
            destination,
            reason: reason || 'exit',
            notes,
            createdBy: req.user!._id
        });

        await exit.save();

        // Update item quantity
        item.quantity -= quantity;
        await item.save();

        // Populate the exit for response
        await exit.populate('item');
        await exit.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            data: exit,
            message: 'Stock exit created successfully'
        });
    } catch (error) {
        console.error('Error creating stock exit:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating stock exit',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Update stock exit
export const updateStockExit = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { quantity, unitCost, destination, reason, notes } = req.body;

        const exit = await StockExit.findById(req.params.id);
        if (!exit) {
            return res.status(404).json({
                success: false,
                message: 'Stock exit not found'
            });
        }

        // Get the item to update quantity if needed
        const item = await Item.findById(exit.item);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Associated item not found'
            });
        }

        // If quantity changed, update item quantity
        if (quantity && quantity !== exit.quantity) {
            const quantityDiff = quantity - exit.quantity;
            const newItemQuantity = item.quantity - quantityDiff;

            if (newItemQuantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for this change. Available: ${item.quantity + exit.quantity}`
                });
            }

            item.quantity = newItemQuantity;
            await item.save();
        }

        // Update exit
        if (quantity) exit.quantity = quantity;
        if (unitCost !== undefined) exit.unitCost = unitCost;
        if (destination !== undefined) exit.destination = destination;
        if (reason) exit.reason = reason;
        if (notes !== undefined) exit.notes = notes;

        await exit.save();
        await exit.populate('item');
        await exit.populate('createdBy', 'name email');

        res.json({
            success: true,
            data: exit,
            message: 'Stock exit updated successfully'
        });
    } catch (error) {
        console.error('Error updating stock exit:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating stock exit',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Delete stock exit
export const deleteStockExit = async (req: Request, res: Response): Promise<any> => {
    try {
        const exit = await StockExit.findById(req.params.id);
        if (!exit) {
            return res.status(404).json({
                success: false,
                message: 'Stock exit not found'
            });
        }

        // Get the item to update quantity
        const item = await Item.findById(exit.item);
        if (item) {
            // Add back the exit quantity to item quantity
            item.quantity += exit.quantity;
            await item.save();
        }

        await StockExit.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Stock exit deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting stock exit:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting stock exit',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};