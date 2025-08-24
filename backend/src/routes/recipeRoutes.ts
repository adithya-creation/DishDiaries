import { Router } from 'express';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { validateCreateRecipe } from '@/middleware/validation';
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleLike
} from '@/controllers/recipeController';

const router = Router();

// Public routes
router.get('/', optionalAuth, getRecipes);
router.get('/:id', optionalAuth, getRecipe);

// Protected routes - require authentication
router.use(authenticate);

// Recipe CRUD operations
router.post('/', createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

// Recipe interactions
router.post('/:id/like', toggleLike);

export default router; 