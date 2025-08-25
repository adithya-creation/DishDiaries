import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateCreateRecipe } from '../middleware/validation';
import { uploadImageSingle } from '../middleware/upload';
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleLike,
  getUserRecipes
} from '../controllers/recipeController';

const router = Router();

// Public routes - these must come first
router.get('/', optionalAuth, getRecipes);
router.get('/:id', optionalAuth, getRecipe);

// Protected routes - require authentication
router.use(authenticate);

// User's own recipes
router.get('/user/me', getUserRecipes);

// Recipe CRUD operations
router.post('/', uploadImageSingle, createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

// Recipe interactions
router.post('/:id/like', toggleLike);

export default router; 