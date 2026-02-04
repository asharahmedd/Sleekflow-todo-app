import { Request, Response } from 'express';
import Todo from '../models/Todo';
import { broadcastActivity } from '../services/socketService';
import User from '../models/User';
import { CreateTodoDTO } from '../dtos/request/CreateTodoDTO';
import { UpdateTodoDTO } from '../dtos/request/UpdateTodoDTO';
import { TodoResponseDTO } from '../dtos/response/TodoResponseDTO';
import { ErrorResponseDTO } from '../dtos/response/ErrorResponseDTO';

// Get all todos (for logged-in user - includes shared todos)
export const getAllTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    // Show todos created by user OR shared with user
    const todos = await Todo.find({
      $or: [
        { createdBy: req.user?.id },
        { sharedWith: req.user?.id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email')
    .populate('sharedWith', 'name email');
    
    // Return formatted response using DTO
    const todoResponses = todos.map(todo => new TodoResponseDTO(todo));
    res.status(200).json(todoResponses);
  } catch (error) {
    res.status(500).json(new ErrorResponseDTO('Error fetching todos', 500));
  }
};

// Get single todo (check ownership or shared access)
export const getTodoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const todo = await Todo.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('sharedWith', 'name email');
    
    if (!todo) {
      res.status(404).json(new ErrorResponseDTO('Todo not found', 404));
      return;
    }
    
    // Check if user has access (is creator or in sharedWith array)
    const hasAccess = 
      todo.createdBy._id.toString() === req.user?.id ||
      todo.sharedWith.some((user: any) => user._id.toString() === req.user?.id);
    
    if (!hasAccess) {
      res.status(403).json(new ErrorResponseDTO('Access denied', 403));
      return;
    }
    
    // Return formatted response using DTO
    const todoResponse = new TodoResponseDTO(todo);
    res.status(200).json(todoResponse);
  } catch (error) {
    res.status(500).json(new ErrorResponseDTO('Error fetching todo', 500));
  }
};

// Create new todo (add createdBy and sharedWith)
export const createTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input using DTO
    const createTodoDTO = new CreateTodoDTO(req.body);
    
    const newTodo = await Todo.create({
      createdBy: req.user?.id,
      sharedWith: [],
      name: createTodoDTO.name,
      description: createTodoDTO.description,
      dueDate: createTodoDTO.dueDate,
      status: createTodoDTO.status,
      priority: createTodoDTO.priority,
    });
    
    // Return formatted response using DTO
    const todoResponse = new TodoResponseDTO(newTodo);
    res.status(201).json(todoResponse);
    
    const user = await User.findById(req.user?.id);
    await broadcastActivity(
      'todo_created',
      req.user!.id,
      user!.name,
      `${user!.name} created a new todo: "${newTodo.name}"`,
      { todoId: newTodo._id.toString(), todoName: newTodo.name }
    );
  } catch (error: any) {
    // Handle DTO validation errors
    if (error.message && (error.message.includes('required') || error.message.includes('Invalid'))) {
      res.status(400).json(new ErrorResponseDTO(error.message, 400));
    } else {
      res.status(500).json(new ErrorResponseDTO('Error creating todo', 500));
    }
  }
}; 

// Update todo (check ownership or shared access)
export const updateTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input using DTO
    const updateTodoDTO = new UpdateTodoDTO(req.body);
    
    // Get user info
    const user = await User.findById(req.user?.id);
    
    // Get OLD todo BEFORE updating to check status change AND access
    const oldTodo = await Todo.findById(req.params.id);
    
    if (!oldTodo) {
      res.status(404).json(new ErrorResponseDTO('Todo not found', 404));
      return;
    }
    
    // Check if user has access (is creator or in sharedWith array)
    const hasAccess = 
      oldTodo.createdBy.toString() === req.user?.id ||
      oldTodo.sharedWith.some((userId: any) => userId.toString() === req.user?.id);
    
    if (!hasAccess) {
      res.status(403).json(new ErrorResponseDTO('Access denied', 403));
      return;
    }
    
    // Update todo with validated fields
    const updateData = updateTodoDTO.toObject();
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('sharedWith', 'name email');
    
    if (!todo) {
      res.status(404).json(new ErrorResponseDTO('Todo not found', 404));
      return;
    }
    
    // Return formatted response using DTO
    const todoResponse = new TodoResponseDTO(todo);
    res.status(200).json(todoResponse);
    
    // Check if status changed
    if (updateData.status && oldTodo.status !== updateData.status && user) {
      await broadcastActivity(
        'todo_status_changed',
        req.user!.id,
        user.name,
        `${user.name} changed "${todo.name}" from ${oldTodo.status} to ${updateData.status}`,
        {
          todoId: todo._id.toString(),
          todoName: todo.name,
          oldStatus: oldTodo.status,
          newStatus: updateData.status
        }
      );
      
      if (updateData.status === 'Completed') {
        await broadcastActivity(
          'todo_completed',
          req.user!.id,
          user.name,
          `${user.name} completed "${todo.name}" ✅`,
          { todoId: todo._id.toString(), todoName: todo.name }
        );
      }
    }
    
    // Check if priority changed
    if (updateData.priority && oldTodo.priority !== updateData.priority && user) {
      await broadcastActivity(
        'todo_priority_changed',
        req.user!.id,
        user.name,
        `${user.name} changed "${todo.name}" priority from ${oldTodo.priority} to ${updateData.priority}`,
        {
          todoId: todo._id.toString(),
          todoName: todo.name,
          oldPriority: oldTodo.priority,
          newPriority: updateData.priority
        }
      );
    }
  } catch (error: any) {
    // Handle DTO validation errors
    if (error.message && (error.message.includes('required') || error.message.includes('Invalid'))) {
      res.status(400).json(new ErrorResponseDTO(error.message, 400));
    } else {
      res.status(500).json(new ErrorResponseDTO('Error updating todo', 500));
    }
  }
};

// Delete todo (only creator can delete)
export const deleteTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      res.status(404).json(new ErrorResponseDTO('Todo not found', 404));
      return;
    }
    
    // Only creator can delete (not shared users)
    if (todo.createdBy.toString() !== req.user?.id) {
      res.status(403).json(new ErrorResponseDTO('Only the creator can delete this todo', 403));
      return;
    }
    
    await Todo.findByIdAndDelete(req.params.id);
    
    const user = await User.findById(req.user?.id);
    if (user) {
      await broadcastActivity(
        'todo_deleted',
        req.user!.id,
        user.name,
        `${user.name} deleted "${todo.name}"`, 
        { todoId: todo._id.toString(), todoName: todo.name }
      );
    }
    
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json(new ErrorResponseDTO('Error deleting todo', 500));
  }
};

// Share todo with another user
export const shareWithUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userEmail } = req.body;
    const todoId = req.params.id;
    
    // Find the todo
    const todo = await Todo.findById(todoId);
    if (!todo) {
      res.status(404).json({ message: 'Todo not found' });
      return;
    }
    
    // Check if requester is the creator
    if (todo.createdBy.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Only the creator can share this todo' });
      return;
    }
    
    // Find the user to share with
    const userToShare = await User.findOne({ email: userEmail });
    if (!userToShare) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Check if already shared
    if (todo.sharedWith.some(id => id.toString() === userToShare._id.toString())) {
      res.status(400).json({ message: 'Todo already shared with this user' });
      return;
    }
    
    // Add user to sharedWith array
    todo.sharedWith.push(userToShare._id);
    await todo.save();
    
    // Broadcast activity
    const creator = await User.findById(req.user?.id);
    if (creator) {
      await broadcastActivity(
        'todo_shared',
        req.user!.id,
        creator.name,
        `${creator.name} shared "${todo.name}" with ${userToShare.name}`,
        { 
          todoId: todo._id.toString(), 
          todoName: todo.name,
          sharedWithUserId: userToShare._id.toString(),
          sharedWithUserName: userToShare.name
        }
      );
      
      // Send email notification
      try {
        const NotificationPreferences = (await import('../models/NotificationPreferences')).default;
        const { sendTodoSharedEmail } = await import('../services/emailService');
        
        const prefs = await NotificationPreferences.findOne({ userId: userToShare._id });
        if (!prefs || prefs.emailOnTodoShared) {
          await sendTodoSharedEmail(
            userToShare.email,
            userToShare.name,
            creator.name,
            todo.name,
            todo._id.toString()
          );
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error sharing todo', error });
  }
};

// Unshare todo with a user
export const unshareWithUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { todoId, userId } = req.params;
    
    // Find the todo
    const todo = await Todo.findById(todoId);
    if (!todo) {
      res.status(404).json({ message: 'Todo not found' });
      return;
    }
    
    // Check if requester is the creator
    if (todo.createdBy.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Only the creator can unshare this todo' });
      return;
    }
    
    // Remove user from sharedWith array
    todo.sharedWith = todo.sharedWith.filter(
      id => id.toString() !== userId
    );
    await todo.save();
    
    // Broadcast activity
    const creator = await User.findById(req.user?.id);
    const unsharedUser = await User.findById(userId);
    if (creator && unsharedUser) {
      await broadcastActivity(
        'todo_unshared',
        req.user!.id,
        creator.name,
        `${creator.name} removed ${unsharedUser.name} from "${todo.name}"`,
        { 
          todoId: todo._id.toString(), 
          todoName: todo.name,
          removedUserId: userId as string,
          removedUserName: unsharedUser.name
        }
      );
    }
    
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error unsharing todo', error });
  }
};

// Get list of users who have access to a todo
export const getSharedUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const todo = await Todo.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('sharedWith', 'name email');
    
    if (!todo) {
      res.status(404).json({ message: 'Todo not found' });
      return;
    }
    
    // Check if user has access
    const hasAccess = 
      todo.createdBy._id.toString() === req.user?.id ||
      todo.sharedWith.some((user: any) => user._id.toString() === req.user?.id);
    
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    res.status(200).json({
      creator: todo.createdBy,
      sharedWith: todo.sharedWith
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shared users', error });
  }
};