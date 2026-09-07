import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
categorySchema.index({ name: 1 });

// Prevent deletion if category has items
categorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const Item = mongoose.model('Item');
  const itemCount = await Item.countDocuments({ category: this._id });
  
  if (itemCount > 0) {
    const error = new Error('Cannot delete category with existing items');
    return next(error);
  }
  
  next();
});

export default mongoose.model<ICategory>('Category', categorySchema);