import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import env from '../config/env.js'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  googleId?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
  generateToken(): string
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      // Password is optional (for Google OAuth users), but validation middleware ensures it's provided for registration
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default
    },
    googleId: {
      type: String,
      sparse: true // Allow multiple null values
    }
  },
  {
    timestamps: true
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false
  }
  return bcrypt.compare(candidatePassword, this.password)
}

// Generate JWT token
userSchema.methods.generateToken = function (): string {
  const payload = { id: this._id.toString(), email: this.email }
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  } as jwt.SignOptions)
}

const User = mongoose.model<IUser>('User', userSchema)

export default User
