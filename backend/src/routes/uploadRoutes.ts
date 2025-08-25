import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Recipe image upload
router.post('/recipe-image', uploadLimiter, (req: Request, res: Response) => {
  res.json({ message: 'Recipe image upload route - TODO: implement' });
});

export default router; 