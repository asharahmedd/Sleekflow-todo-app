import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  todoId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    todoId: {
      type: Schema.Types.ObjectId,
      ref: 'Todo',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CommentSchema.index({ todoId: 1, createdAt: -1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
