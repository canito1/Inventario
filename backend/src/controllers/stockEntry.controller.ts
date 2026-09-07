import { Request, Response } from 'express';
import StockEntry from '../models/StockEntry';
import Item from '../models/Item';
import { AuthRequest } from '../middleware/auth';

// Get all stock entries with pagination and filters
export const getStockEntries = async (req: Request, res: Response) => {
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
                        { supplier: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        if (Object.keys(filter).length > 0) {
            pipeline.push({ $match: filter });
        }

        pipeline.push({ $sort: { createdAt: -1 } });

        const entries = await StockEntry.aggregate([
            ...pipeline,
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);

        const totalEntries = await StockEntry.aggregate([
            ...pipeline,
            { $count: 'total' }
        ]);

        const total = totalEntries.length > 0 ? totalEntries[0].total : 0;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                docs: entries,
                totalDocs: total,
                limit,
                page,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching stock entries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stock entries',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get single stock entry
export const getStockEntry = async (req: Request, res: Response): Promise<any> => {
    try {
        const entry = await StockEntry.findById(req.params.id)
            .populate('item')
            .populate('createdBy', 'name email');

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Stock entry not found'
            });
        }

        res.json({
            success: true,
            data: entry
        });
    } catch (error) {
        console.error('Error fetching stock entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stock entry',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Create new stock entry
export const createStockEntry = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { itemId, quantity, unitCost, supplier, reason, notes } = req.body;

        // Validate required fields
        if (!itemId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Item and quantity are required'
            });
        }

        // Check if item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Create stock entry
        const entry = new StockEntry({
            item: itemId,
            quantity,
            unitCost: unitCost || 0,
            supplier,
            reason: reason || 'purchase',
            notes,
            createdBy: req.user!._id
        });

        await entry.save();

        // Update item quantity
        item.quantity += quantity;
        await item.save();

        // Populate the entry for response
        await entry.populate('item');
        await entry.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            data: entry,
            message: 'Stock entry created successfully'
        });
    } catch (error) {
        console.error('Error creating stock entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating stock entry',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Update stock entry
export const updateStockEntry = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { quantity, unitCost, supplier, reason, notes } = req.body;

        const entry = await StockEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Stock entry not found'
            });
        }

        // Get the item to update quantity if needed
        const item = await Item.findById(entry.item);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Associated item not found'
            });
        }

        // If quantity changed, update item quantity
        if (quantity && quantity !== entry.quantity) {
            const quantityDiff = quantity - entry.quantity;
            item.quantity += quantityDiff;
            await item.save();
        }

        // Update entry
        if (quantity) entry.quantity = quantity;
        if (unitCost !== undefined) entry.unitCost = unitCost;
        if (supplier !== undefined) entry.supplier = supplier;
        if (reason) entry.reason = reason;
        if (notes !== undefined) entry.notes = notes;

        await entry.save();
        await entry.populate('item');
        await entry.populate('createdBy', 'name email');

        res.json({
            success: true,
            data: entry,
            message: 'Stock entry updated successfully'
        });
    } catch (error) {
        console.error('Error updating stock entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating stock entry',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Delete stock entry
export const deleteStockEntry = async (req: Request, res: Response): Promise<any> => {
    try {
        const entry = await StockEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Stock entry not found'
            });
        }

        // Get the item to update quantity
        const item = await Item.findById(entry.item);
        if (item) {
            // Subtract the entry quantity from item quantity
            item.quantity -= entry.quantity;
            if (item.quantity < 0) item.quantity = 0;
            await item.save();
        }

        await StockEntry.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Stock entry deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting stock entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting stock entry',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};