import mongoose, { Document, Schema } from 'mongoose';

export interface IStockExit extends Document {
  item: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number;
  totalCost: number;
  destination?: string;
  reason: 'sale' | 'damage' | 'loss' | 'transfer' | 'adjustment' | 'return' | 'exit';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stockExitSchema = new Schema<IStockExit>({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitCost: {
    type: Number,
    min: [0, 'Unit cost cannot be negative'],
    default: 0
  },
  totalCost: {
    type: Number,
    min: [0, 'Total cost cannot be negative']
  },
  destination: {
    type: String,
    trim: true,
    maxlength: [100, 'Destination cannot exceed 100 characters']
  },
  reason: {
    type: String,
    enum: ['sale', 'damage', 'loss', 'transfer', 'adjustment', 'return', 'exit'],
    default: 'exit'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to calculate total cost
stockExitSchema.pre('save', function (next) {
  this.totalCost = this.quantity * (this.unitCost || 0);
  next();
});

// Indexes
stockExitSchema.index({ item: 1, createdAt: -1 });
stockExitSchema.index({ reason: 1, createdAt: -1 });
stockExitSchema.index({ createdBy: 1, createdAt: -1 });
stockExitSchema.index({ createdAt: -1 });

export default mongoose.model<IStockExit>('StockExit', stockExitSchema);