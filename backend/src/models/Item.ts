import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IItem extends Document {
  name: string;
  description: string;
  category: mongoose.Types.ObjectId;
  quantity: number;
  minStock: number;
  maxStock?: number;
  price: number;
  currency: 'PEN' | 'USD';
  location: string;
  barcode?: string;
  image?: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
  isLowStock(): boolean;
}

const itemSchema = new Schema<IItem>({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  minStock: {
    type: Number,
    required: [true, 'Minimum stock is required'],
    min: [0, 'Minimum stock cannot be negative'],
    default: 0
  },
  maxStock: {
    type: Number,
    required: false,
    min: [0, 'Maximum stock cannot be negative'],
    default: null
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    enum: ['PEN', 'USD'],
    default: 'PEN',
    required: [true, 'Currency is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
itemSchema.index({ name: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ quantity: 1 });

itemSchema.index({ createdAt: -1 });

// Compound indexes
itemSchema.index({ category: 1, status: 1 });
itemSchema.index({ quantity: 1, minStock: 1 });

// Virtual for low stock check
itemSchema.methods.isLowStock = function (): boolean {
  return this.quantity <= this.minStock;
};

// Add text search index
itemSchema.index({
  name: 'text',
  description: 'text',
  location: 'text'
});

// Plugin for pagination
itemSchema.plugin(mongoosePaginate);

export default mongoose.model<IItem>('Item', itemSchema);