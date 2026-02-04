import express from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getCommentCount,
} from '../controllers/commentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Comment routes
router.get('/:commentId', getComments); // This will be changed below
router.put('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);

export default router;
