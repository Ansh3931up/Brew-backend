import mongoose, { Document, Schema } from 'mongoose'

export interface ITask extends Document {
  title: string
  description?: string
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'active' | 'completed'
  flagged: boolean
  userId: mongoose.Types.ObjectId
  assignedBy?: mongoose.Types.ObjectId
  assignedByEmail?: string
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    dueDate: {
      type: Date
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['todo', 'active', 'completed'],
      default: 'todo'
    },
    flagged: {
      type: Boolean,
      default: false
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedByEmail: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

// Indexes for better query performance
taskSchema.index({ userId: 1, status: 1 })
taskSchema.index({ userId: 1, priority: 1 })
taskSchema.index({ userId: 1, flagged: 1 })
taskSchema.index({ userId: 1, dueDate: 1 })
taskSchema.index({ userId: 1, createdAt: -1 })

const Task = mongoose.model<ITask>('Task', taskSchema)

export default Task
