import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'DONOR' | 'RECIPIENT' | 'ADMIN'
  phone?: string
  organization?: string
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  verified: boolean
  profilePicture?: string
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  isActive: boolean
  preferences?: {
    notifications: boolean
    emailUpdates: boolean
    radius: number // in km
  }
  stats?: {
    donationsGiven: number
    donationsReceived: number
    totalImpact: number
  }
  settings?: {
    profileVisibility?: 'public' | 'private' | 'friends'
    showRealName?: boolean
    showContactInfo?: boolean
    emailNotifications?: {
      newDonations?: boolean
      reservationUpdates?: boolean
      pickupReminders?: boolean
      systemUpdates?: boolean
      marketing?: boolean
    }
    pushNotifications?: {
      newDonations?: boolean
      reservationUpdates?: boolean
      pickupReminders?: boolean
      urgentAlerts?: boolean
    }
    shareLocation?: boolean
    locationRadius?: number
    autoLocation?: boolean
    language?: 'en' | 'id'
    theme?: 'light' | 'dark' | 'system'
    currency?: 'IDR' | 'USD'
    timezone?: string
    dietaryRestrictions?: string[]
    preferredCategories?: string[]
    excludeExpired?: boolean
    minRating?: number
    twoFactorAuth?: boolean
    sessionTimeout?: number
    dataRetention?: number
  }
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },  role: {
    type: String,
    enum: ['DONOR', 'RECIPIENT', 'ADMIN'],
    required: true,
    default: 'RECIPIENT'
  },
  phone: {
    type: String,
    trim: true,
    sparse: true
  },
  organization: {
    type: String,
    trim: true,
    maxlength: 200
  },
  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    emailUpdates: {
      type: Boolean,
      default: true
    },
    radius: {
      type: Number,
      default: 5,
      min: 1,
      max: 25
    }
  },
  stats: {
    donationsGiven: {
      type: Number,
      default: 0,
      min: 0
    },
    donationsReceived: {
      type: Number,
      default: 0,
      min: 0
    },    totalImpact: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  settings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'public'
    },
    showRealName: {
      type: Boolean,
      default: true
    },
    showContactInfo: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      newDonations: { type: Boolean, default: true },
      reservationUpdates: { type: Boolean, default: true },
      pickupReminders: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    pushNotifications: {
      newDonations: { type: Boolean, default: true },
      reservationUpdates: { type: Boolean, default: true },
      pickupReminders: { type: Boolean, default: true },
      urgentAlerts: { type: Boolean, default: true }
    },
    shareLocation: {
      type: Boolean,
      default: true
    },
    locationRadius: {
      type: Number,
      default: 5,
      min: 1,
      max: 25
    },
    autoLocation: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      enum: ['en', 'id'],
      default: 'id'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    currency: {
      type: String,
      enum: ['IDR', 'USD'],
      default: 'IDR'
    },
    timezone: {
      type: String,
      default: 'Asia/Jakarta'
    },
    dietaryRestrictions: [{
      type: String
    }],
    preferredCategories: [{
      type: String
    }],
    excludeExpired: {
      type: Boolean,
      default: true
    },
    minRating: {
      type: Number,
      default: 3,
      min: 1,
      max: 5
    },
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 60,
      min: 15
    },
    dataRetention: {
      type: Number,
      default: 90,
      min: 30
    }
  }
}, {
  timestamps: true,
  collection: 'users'
})

// Indexes for better performance
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ 'location.latitude': 1, 'location.longitude': 1 })
UserSchema.index({ verified: 1 })
UserSchema.index({ isActive: 1 })

// Pre-save middleware to update lastLogin
UserSchema.pre('save', function(next) {
  if (this.isNew) {
    this.lastLogin = new Date()
  }
  next()
})

// Virtual for full location
UserSchema.virtual('fullLocation').get(function() {
  if (this.location && this.location.latitude && this.location.longitude) {
    return `${this.location.latitude},${this.location.longitude}`
  }
  return null
})

// Method to calculate distance between users
UserSchema.methods.distanceTo = function(otherUser: IUser): number | null {
  if (!this.location?.latitude || !this.location?.longitude || 
      !otherUser.location?.latitude || !otherUser.location?.longitude) {
    return null
  }

  const R = 6371 // Earth's radius in kilometers
  const dLat = (otherUser.location.latitude - this.location.latitude) * Math.PI / 180
  const dLon = (otherUser.location.longitude - this.location.longitude) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.location.latitude * Math.PI / 180) * Math.cos(otherUser.location.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

// Static method to find users within radius
UserSchema.statics.findWithinRadius = function(latitude: number, longitude: number, radiusKm: number = 5) {
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
    isActive: true
  })
}

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
