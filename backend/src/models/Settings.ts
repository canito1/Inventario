import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  singleton: boolean;
  name: string;
  email: string;
  timezone: string;
  defaultCurrency: 'PEN' | 'USD';
  exchangeRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  singleton: {
    type: Boolean,
    default: true,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
    default: 'Mi Empresa'
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    default: 'contacto@miempresa.com'
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    default: 'America/Lima'
  },
  defaultCurrency: {
    type: String,
    enum: ['PEN', 'USD'],
    default: 'PEN',
    required: true
  },
  exchangeRate: {
    type: Number,
    required: [true, 'Exchange rate is required'],
    min: [0.01, 'Exchange rate must be at least 0.01'],
    max: [20, 'Exchange rate cannot exceed 20'],
    default: 3.75 // Default: 1 USD = 3.75 PEN
  }
}, {
  timestamps: true
});

// Index for singleton constraint
settingsSchema.index({ singleton: 1 }, { unique: true });

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Settings').countDocuments();
    if (count > 0) {
      const error = new Error('Only one settings document is allowed');
      return next(error);
    }
  }
  next();
});

export default mongoose.model<ISettings>('Settings', settingsSchema);
