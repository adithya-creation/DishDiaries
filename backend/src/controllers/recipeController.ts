import { Request, Response, NextFunction } from 'express';
import { Recipe } from '@/models/Recipe';
import { AuthRequest, ApiResponse } from '@/types';
import { asyncHandler, AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

// Get all recipes with optional filters
export const getRecipes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const {
    page = 1,
    limit = 20,
    search,
    difficulty,
    tags,
    sort = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build query
  const query: any = { isPublic: true };

  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } }
    ];
  }

  // Filter by difficulty
  if (difficulty) {
    query.difficulty = difficulty;
  }

  // Filter by tags
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagArray };
  }

  // Sort options
  const sortOptions: any = {};
  sortOptions[sort as string] = sortOrder === 'asc' ? 1 : -1;

  const recipes = await Recipe.find(query)
    .populate('author', 'username avatar')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await Recipe.countDocuments(query);

  res.status(200).json({
    success: true,
    message: 'Recipes retrieved successfully',
    data: {
      recipes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  } as ApiResponse);
});

// Get single recipe by ID
export const getRecipe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  console.log('getRecipe called with id:', req.params.id);
  console.log('Request headers:', req.headers);
  console.log('User ID from optional auth:', req.userId);
  
  const { id } = req.params;

  const recipe = await Recipe.findById(id)
    .populate('author', 'username avatar bio')
    .populate('comments.user', 'username avatar');

  if (!recipe) {
    console.log('Recipe not found for id:', id);
    return next(new AppError('Recipe not found', 404, 'RECIPE_NOT_FOUND'));
  }

  console.log('Recipe found:', recipe.title);

  // Increment views
  await recipe.incrementViews();

  res.status(200).json({
    success: true,
    message: 'Recipe retrieved successfully',
    data: { recipe }
  } as ApiResponse);
});

// Create new recipe
export const createRecipe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
  const {
    title,
    description,
    ingredients,
    instructions,
    prepTime,
    cookTime,
    servings,
    difficulty,
    tags,
    imageUrl,
    nutrition,
    isPublic = true
  } = req.body;

  const recipe = new Recipe({
    title,
    description,
    ingredients,
    instructions,
    prepTime,
    cookTime,
    servings,
    difficulty,
    tags,
    imageUrl,
    nutrition,
    isPublic,
    author: req.userId
  });

  await recipe.save();
  await recipe.populate('author', 'username avatar');

  logger.info('Recipe created successfully', {
    recipeId: recipe._id,
    userId: req.userId,
    title: recipe.title
  });

  res.status(201).json({
    success: true,
    message: 'Recipe created successfully',
    data: { recipe }
  } as ApiResponse);
  } catch (error) {
    console.error('Recipe creation error:', error);
    next(error);
  }
};

// Update recipe
export const updateRecipe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updates = req.body;

  const recipe = await Recipe.findById(id);

  if (!recipe) {
    return next(new AppError('Recipe not found', 404, 'RECIPE_NOT_FOUND'));
  }

  // Check if user is the author
  if (recipe.author.toString() !== req.userId) {
    return next(new AppError('Not authorized to update this recipe', 403, 'UNAUTHORIZED'));
  }

  Object.assign(recipe, updates);
  await recipe.save();
  await recipe.populate('author', 'username avatar');

  logger.info('Recipe updated successfully', {
    recipeId: recipe._id,
    userId: req.userId
  });

  res.status(200).json({
    success: true,
    message: 'Recipe updated successfully',
    data: { recipe }
  } as ApiResponse);
});

// Delete recipe
export const deleteRecipe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const recipe = await Recipe.findById(id);

  if (!recipe) {
    return next(new AppError('Recipe not found', 404, 'RECIPE_NOT_FOUND'));
  }

  // Check if user is the author
  if (recipe.author.toString() !== req.userId) {
    return next(new AppError('Not authorized to delete this recipe', 403, 'UNAUTHORIZED'));
  }

  await Recipe.findByIdAndDelete(id);

  logger.info('Recipe deleted successfully', {
    recipeId: id,
    userId: req.userId
  });

  res.status(200).json({
    success: true,
    message: 'Recipe deleted successfully'
  } as ApiResponse);
});

// Like/Unlike recipe
export const toggleLike = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const recipe = await Recipe.findById(id);

  if (!recipe) {
    return next(new AppError('Recipe not found', 404, 'RECIPE_NOT_FOUND'));
  }

  const userId = req.userId!;
  const hasLiked = recipe.likes.includes(userId as any);

  if (hasLiked) {
    await recipe.removeLike(userId);
  } else {
    await recipe.addLike(userId);
  }

  res.status(200).json({
    success: true,
    message: hasLiked ? 'Recipe unliked' : 'Recipe liked',
    data: {
      liked: !hasLiked,
      likesCount: recipe.likes.length
    }
  } as ApiResponse);
});

// Get recipes created by the authenticated user
export const getUserRecipes = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('getUserRecipes called with userId:', req.userId);
  console.log('Request headers:', req.headers);
  
  const {
    page = 1,
    limit = 20,
    search,
    difficulty,
    tags,
    sort = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build query - only recipes by the authenticated user
  const query: any = { author: req.userId };
  console.log('Query:', query);

  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } }
    ];
  }

  // Filter by difficulty
  if (difficulty) {
    query.difficulty = difficulty;
  }

  // Filter by tags
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagArray };
  }

  // Sort options
  const sortOptions: any = {};
  sortOptions[sort as string] = sortOrder === 'asc' ? 1 : -1;

  console.log('Final query:', query);
  console.log('Sort options:', sortOptions);

  const recipes = await Recipe.find(query)
    .populate('author', 'username avatar')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum)
    .lean();

  console.log('Found recipes:', recipes.length);

  const total = await Recipe.countDocuments(query);

  res.status(200).json({
    success: true,
    message: 'User recipes retrieved successfully',
    data: {
      recipes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  } as ApiResponse);
}); 