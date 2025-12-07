import mongoose, { Document, Schema } from 'mongoose'

export interface IFriend extends Document {
  requesterId: mongoose.Types.ObjectId
  recipientId: mongoose.Types.ObjectId
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

const friendSchema = new Schema<IFriend>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
)

// Prevent duplicate friend requests
friendSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true })

// Indexes for better query performance
friendSchema.index({ requesterId: 1, status: 1 })
friendSchema.index({ recipientId: 1, status: 1 })

const Friend = mongoose.model<IFriend>('Friend', friendSchema)

export default Friend
