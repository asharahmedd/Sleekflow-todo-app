import mongoose, { Document, Schema } from 'mongoose';

export type TodoStatus = 'Not Started' | 'In Progress' | 'Completed';
export type TodoPriority = 'Low' | 'Medium' | 'High';

export interface ITodo extends Document {
  createdBy: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId[];
  name: string;
  description: string;
  dueDate: Date;
  status: TodoStatus;
  priority: TodoPriority;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITodo>('Todo', TodoSchema);