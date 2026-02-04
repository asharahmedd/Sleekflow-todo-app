import express from 'express';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  shareWithUser,
  unshareWithUser,
  getSharedUsers,
} from '../controllers/todoController';
import {
  getComments,
  createComment,
  getCommentCount,
} from '../controllers/commentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.get('/', getAllTodos);
router.get('/:id', getTodoById);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

// Sharing routes
router.post('/:id/share', shareWithUser);
router.delete('/:todoId/share/:userId', unshareWithUser);
router.get('/:id/shared-users', getSharedUsers);

// Comment routes
router.get('/:todoId/comments', getComments);
router.post('/:todoId/comments', createComment);
router.get('/:todoId/comments/count', getCommentCount);

export default router;