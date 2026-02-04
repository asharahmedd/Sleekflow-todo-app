import express from 'express';
import { register, login, getMe, searchUsers } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users/search', protect, searchUsers);

export default router;