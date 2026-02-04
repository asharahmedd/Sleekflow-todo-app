import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Todo from '../models/Todo';
import User from '../models/User';
import { broadcastActivity } from '../services/socketService';
import { CreateCommentDTO } from '../dtos/request/CreateCommentDTO';
import { CommentResponseDTO } from '../dtos/response/CommentResponseDTO';
import { ErrorResponseDTO } from '../dtos/response/ErrorResponseDTO';

// @desc    Get all comments for a todo
// @route   GET /api/todos/:todoId/comments
// @access  Private
export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { todoId } = req.params;

    // Check if todo exists and user has access
    const todo = await Todo.findById(todoId);
    if (!todo) {
      res.status(404).json(new ErrorResponseDTO('Todo not found', 404));
      return;
    }

    // Check access (creator or shared user)
    const hasAccess =
      todo.createdBy.toString() === req.user?.id ||
      todo.sharedWith.some((userId: any) => userId.toString() === req.user?.id);

    if (!hasAccess) {
      res.status(403).json(new ErrorResponseDTO('Access denied', 403));
      return;
    }

    // Get comments sorted by oldest first
    const comments = await Comment.find({ todoId })
      .sort({ createdAt: 1 })  
      .populate('userId', 'name email')  
      .lean();

    // Return formatted response using DTO
    const commentResponses = comments.map(comment => new CommentResponseDTO(comment));
    res.status(200).json(commentResponses);
  } catch (error) {
    res.status(500).json(new ErrorResponseDTO('Error fetching comments', 500));
  }
};

// @desc    Create a new comment
// @route   POST /api/todos/:todoId/comments
// @access  Private
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { todoId } = req.params;
    
    // Validate input using DTO
    const createCommentDTO = new CreateCommentDTO(req.body);

    // Check if todo exists and user has access
    const todo = await Todo.findById(todoId);
    if (!todo) {
      res.status(404).json(new ErrorResponseDTO('Todo not found', 404));
      return;
    }

    // Check access (creator or shared user)
    const hasAccess =
      todo.createdBy.toString() === req.user?.id ||
      todo.sharedWith.some((userId: any) => userId.toString() === req.user?.id);

    if (!hasAccess) {
      res.status(403).json(new ErrorResponseDTO('Access denied', 403));
      return;
    }

    // Get user info
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json(new ErrorResponseDTO('User not found', 404));
      return;
    }

    // Create comment
    const comment = await Comment.create({
      todoId,
      userId: req.user?.id,
      userName: user.name,
      content: createCommentDTO.content,
    });

    // Populate userId before sending response
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name email')
      .lean();

    // Return formatted response using DTO
    const commentResponse = new CommentResponseDTO(populatedComment);
    res.status(201).json(commentResponse);

    // Broadcast activity
    await broadcastActivity(
      'comment_added',
      req.user!.id,
      user.name,
      `${user.name} commented on "${todo.name}"`,
      {
        todoId: todo._id.toString(),
        todoName: todo.name,
      }
    );
    
    // Send email notifications to todo creator and shared users
    try {
      const NotificationPreferences = (await import('../models/NotificationPreferences')).default;
      const { sendCommentNotificationEmail } = await import('../services/emailService');
      
      // Get all users who should be notified (creator + shared users, excluding commenter)
      const userIdsToNotify: string[] = [];
      
      // Add creator if not the commenter
      if (todo.createdBy.toString() !== req.user?.id) {
        userIdsToNotify.push(todo.createdBy.toString());
      }
      
      // Add shared users if not the commenter
      todo.sharedWith.forEach((userId: any) => {
        if (userId.toString() !== req.user?.id) {
          userIdsToNotify.push(userId.toString());
        }
      });
      
      // Send emails to all notified users
      for (const userId of userIdsToNotify) {
        const userToNotify = await User.findById(userId);
        if (userToNotify) {
          const prefs = await NotificationPreferences.findOne({ userId });
          if (!prefs || prefs.emailOnComment) {
            await sendCommentNotificationEmail(
              userToNotify.email,
              userToNotify.name,
              user.name,
              todo.name,
              createCommentDTO.content,
              todo._id.toString()
            );
          }
        }
      }
    } catch (emailError) {
      console.error('Error sending comment notification emails:', emailError);
      // Don't fail the request if email fails
    }
  } catch (error: any) {
    // Handle DTO validation errors
    if (error.message && (error.message.includes('required') || error.message.includes('Invalid'))) {
      res.status(400).json(new ErrorResponseDTO(error.message, 400));
    } else {
      res.status(500).json(new ErrorResponseDTO('Error creating comment', 500));
    }
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:commentId
// @access  Private
export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ message: 'Comment content is required' });
      return;
    }

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    // Only comment owner can update
    if (comment.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'You can only edit your own comments' });
      return;
    }

    // Update comment
    comment.content = content.trim();
    await comment.save();

    res.status(200).json(comment);

    // Get todo info for activity
    const todo = await Todo.findById(comment.todoId);
    if (todo) {
      await broadcastActivity(
        'comment_updated',
        req.user!.id,
        comment.userName,
        `${comment.userName} edited a comment on "${todo.name}"`,
        {
          todoId: todo._id.toString(),
          todoName: todo.name,
        }
      );
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    // Only comment owner can delete
    if (comment.userId.toString() !== req.user?.id) {
      res.status(403).json({ message: 'You can only delete your own comments' });
      return;
    }

    // Get todo info before deleting
    const todo = await Todo.findById(comment.todoId);

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ message: 'Comment deleted successfully' });

    // Broadcast activity
    if (todo) {
      await broadcastActivity(
        'comment_deleted',
        req.user!.id,
        comment.userName,
        `${comment.userName} deleted a comment on "${todo.name}"`,
        {
          todoId: todo._id.toString(),
          todoName: todo.name,
        }
      );
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error });
  }
};

// @desc    Get comment count for a todo
// @route   GET /api/todos/:todoId/comments/count
// @access  Private
export const getCommentCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { todoId } = req.params;

    const count = await Comment.countDocuments({ todoId });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json(new ErrorResponseDTO('Error getting comment count', 500));
  }
};
