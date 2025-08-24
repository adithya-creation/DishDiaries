import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { uploadLimiter } from '@/middleware/rateLimiter';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Recipe image upload
router.post('/recipe-image', uploadLimiter, (req, res) => {
  res.json({ message: 'Recipe image upload route - TODO: implement' });
});

export default router; 