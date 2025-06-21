import mongoose, { Schema, Document } from 'mongoose'

export interface IFoodDonation extends Document {
  title: string
  description: string
  category: 'prepared' | 'packaged' | 'fresh' | 'baked' | 'frozen' | 'other'
  quantity: number
  unit: 'servings' | 'kg' | 'pieces' | 'bags' | 'boxes' | 'other'
  expiryDate?: Date
  preparedDate?: Date
  donor: mongoose.Types.ObjectId
  recipient?: mongoose.Types.ObjectId
  status: 'available' | 'reserved' | 'picked_up' | 'cancelled' | 'expired'
  location: {
    latitude: number
    longitude: number
    address: string
  }
  images?: string[]
  allergens?: string[]
  dietaryInfo?: {
    vegetarian: boolean
    vegan: boolean
    glutenFree: boolean
    halal: boolean
    kosher: boolean
  }
  pickupInstructions?: string
  pickupTimeStart?: Date
  pickupTimeEnd?: Date
  verificationStatus: 'pending' | 'approved' | 'rejected'
  verifiedBy?: mongoose.Types.ObjectId
  verificationNotes?: string
  createdAt: Date
  updatedAt: Date
  reservedAt?: Date
  pickedUpAt?: Date
  rating?: {
    score: number
    comment?: string
    ratedBy: mongoose.Types.ObjectId
  }
  reportCount: number
  isUrgent: boolean
}

const FoodDonationSchema = new Schema<IFoodDonation>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['prepared', 'packaged', 'fresh', 'baked', 'frozen', 'other'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    enum: ['servings', 'kg', 'pieces', 'bags', 'boxes', 'other'],
    required: true,
    default: 'servings'
  },
  expiryDate: {
    type: Date
  },
  preparedDate: {
    type: Date
  },
  donor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'picked_up', 'cancelled', 'expired'],
    default: 'available'
  },
  location: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  images: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    trim: true
  }],
  dietaryInfo: {
    vegetarian: {
      type: Boolean,
      default: false
    },
    vegan: {
      type: Boolean,
      default: false
    },
    glutenFree: {
      type: Boolean,
      default: false
    },
    halal: {
      type: Boolean,
      default: false
    },
    kosher: {
      type: Boolean,
      default: false
    }
  },
  pickupInstructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  pickupTimeStart: {
    type: Date
  },
  pickupTimeEnd: {
    type: Date
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  reservedAt: {
    type: Date
  },
  pickedUpAt: {
    type: Date
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500
    },
    ratedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  reportCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isUrgent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'food_donations'
})

// Indexes for better performance
FoodDonationSchema.index({ donor: 1 })
FoodDonationSchema.index({ recipient: 1 })
FoodDonationSchema.index({ status: 1 })
FoodDonationSchema.index({ verificationStatus: 1 })
FoodDonationSchema.index({ 'location.latitude': 1, 'location.longitude': 1 })
FoodDonationSchema.index({ category: 1 })
FoodDonationSchema.index({ expiryDate: 1 })
FoodDonationSchema.index({ createdAt: -1 })
FoodDonationSchema.index({ isUrgent: 1 })

// Compound indexes
FoodDonationSchema.index({ status: 1, verificationStatus: 1 })
FoodDonationSchema.index({ 
  'location.latitude': 1, 
  'location.longitude': 1, 
  status: 1, 
  verificationStatus: 1 
})

// Virtual for time remaining until expiry
FoodDonationSchema.virtual('timeUntilExpiry').get(function() {
  if (!this.expiryDate) return null
  const now = new Date()
  const timeDiff = this.expiryDate.getTime() - now.getTime()
  return Math.max(0, timeDiff)
})

// Virtual for hours until expiry
FoodDonationSchema.virtual('hoursUntilExpiry').get(function() {
  if (!this.expiryDate) return null
  const now = new Date()
  const timeDiff = this.expiryDate.getTime() - now.getTime()
  if (timeDiff <= 0) return 0
  return Math.floor(timeDiff / (1000 * 60 * 60))
})

// Method to check if expired
FoodDonationSchema.methods.isExpired = function(): boolean {
  if (!this.expiryDate) return false
  return new Date() > this.expiryDate
}

// Method to calculate distance from a point
FoodDonationSchema.methods.distanceFrom = function(latitude: number, longitude: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (latitude - this.location.latitude) * Math.PI / 180
  const dLon = (longitude - this.location.longitude) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.location.latitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

// Static method to find donations within radius
FoodDonationSchema.statics.findWithinRadius = function(
  latitude: number, 
  longitude: number, 
  radiusKm: number = 5
) {
  const radiusRad = radiusKm / 6371 // Convert to radians
  
  return this.find({
    'location.latitude': {
      $gte: latitude - (radiusRad * 180 / Math.PI),
      $lte: latitude + (radiusRad * 180 / Math.PI)
    },
    'location.longitude': {
      $gte: longitude - (radiusRad * 180 / Math.PI),
      $lte: longitude + (radiusRad * 180 / Math.PI)
    },
    status: 'available',
    verificationStatus: 'approved'
  })
}

// Pre-save middleware to auto-expire donations
FoodDonationSchema.pre('save', function(next) {
  if (this.expiryDate && new Date() > this.expiryDate && this.status === 'available') {
    this.status = 'expired'
  }
  next()
})

export const FoodDonation = mongoose.models.FoodDonation || mongoose.model<IFoodDonation>('FoodDonation', FoodDonationSchema)
