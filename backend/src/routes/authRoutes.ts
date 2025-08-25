import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  deactivateAccount,
  followUser,
  unfollowUser
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
// import { validateRegister, validateLogin, validateUpdateProfile, validateChangePassword } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', authLimiter /* validateRegister, */, register);
router.post('/login', authLimiter /* validateLogin, */, login);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', /* validateUpdateProfile, */ updateProfile);
router.put('/change-password', /* validateChangePassword, */ changePassword);
router.delete('/deactivate', deactivateAccount);

// User follow/unfollow routes
router.post('/follow/:id', followUser);
router.delete('/unfollow/:id', unfollowUser);

export default router; 