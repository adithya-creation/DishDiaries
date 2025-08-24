import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse, ValidationError } from '@/types';
import { ValidationErrorClass } from './errorHandler';

// Validation schemas
export const schemas = {
  // User validation schemas
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username can only contain letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .max(100)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 100 characters',
        'any.required': 'Password is required'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  updateProfile: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .messages({
        'string.alphanum': 'Username can only contain letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters'
      }),
    bio: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(6)
      .max(100)
      .required()
      .messages({
        'string.min': 'New password must be at least 6 characters long',
        'string.max': 'New password cannot exceed 100 characters',
        'any.required': 'New password is required'
      })
  }),

  // Recipe validation schemas
  createRecipe: Joi.object({
    title: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.min': 'Recipe title is required',
        'string.max': 'Recipe title cannot exceed 100 characters',
        'any.required': 'Recipe title is required'
      }),
    description: Joi.string()
      .min(1)
      .max(1000)
      .trim()
      .required()
      .messages({
        'string.min': 'Recipe description is required',
        'string.max': 'Recipe description cannot exceed 1000 characters',
        'any.required': 'Recipe description is required'
      }),
    ingredients: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().trim().required(),
          amount: Joi.string().trim().required(),
          unit: Joi.string().trim().required()
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Recipe must have at least one ingredient',
        'any.required': 'Recipe ingredients are required'
      }),
    instructions: Joi.array()
      .items(
        Joi.object({
          step: Joi.number().integer().min(1).required(),
          description: Joi.string().trim().max(1000).required()
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Recipe must have at least one instruction',
        'any.required': 'Recipe instructions are required'
      }),
    prepTime: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.min': 'Preparation time cannot be negative',
        'any.required': 'Preparation time is required'
      }),
    cookTime: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.min': 'Cooking time cannot be negative',
        'any.required': 'Cooking time is required'
      }),
    servings: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.min': 'Servings must be at least 1',
        'any.required': 'Number of servings is required'
      }),
    difficulty: Joi.string()
      .valid('Easy', 'Medium', 'Hard')
      .required()
      .messages({
        'any.only': 'Difficulty must be Easy, Medium, or Hard',
        'any.required': 'Difficulty level is required'
      }),
    tags: Joi.array()
      .items(Joi.string().trim().lowercase())
      .default([]),
    nutrition: Joi.object({
      calories: Joi.number().min(0),
      protein: Joi.number().min(0),
      carbs: Joi.number().min(0),
      fat: Joi.number().min(0),
      fiber: Joi.number().min(0),
      sugar: Joi.number().min(0),
      sodium: Joi.number().min(0)
    }).optional(),
    imageUrl: Joi.string()
      .min(1)
      .required()
      .messages({
        'string.min': 'Recipe image URL is required',
        'any.required': 'Recipe image URL is required'
      }),
    isPublic: Joi.boolean().default(true)
  }),

  updateRecipe: Joi.object({
    title: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .messages({
        'string.min': 'Recipe title cannot be empty',
        'string.max': 'Recipe title cannot exceed 100 characters'
      }),
    description: Joi.string()
      .min(1)
      .max(1000)
      .trim()
      .messages({
        'string.min': 'Recipe description cannot be empty',
        'string.max': 'Recipe description cannot exceed 1000 characters'
      }),
    ingredients: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().trim().required(),
          amount: Joi.string().trim().required(),
          unit: Joi.string().trim().required()
        })
      )
      .min(1)
      .messages({
        'array.min': 'Recipe must have at least one ingredient'
      }),
    instructions: Joi.array()
      .items(
        Joi.object({
          step: Joi.number().integer().min(1).required(),
          description: Joi.string().trim().max(1000).required()
        })
      )
      .min(1)
      .messages({
        'array.min': 'Recipe must have at least one instruction'
      }),
    prepTime: Joi.number()
      .integer()
      .min(0)
      .messages({
        'number.min': 'Preparation time cannot be negative'
      }),
    cookTime: Joi.number()
      .integer()
      .min(0)
      .messages({
        'number.min': 'Cooking time cannot be negative'
      }),
    servings: Joi.number()
      .integer()
      .min(1)
      .messages({
        'number.min': 'Servings must be at least 1'
      }),
    difficulty: Joi.string()
      .valid('Easy', 'Medium', 'Hard')
      .messages({
        'any.only': 'Difficulty must be Easy, Medium, or Hard'
      }),
    tags: Joi.array()
      .items(Joi.string().trim().lowercase()),
    nutrition: Joi.object({
      calories: Joi.number().min(0),
      protein: Joi.number().min(0),
      carbs: Joi.number().min(0),
      fat: Joi.number().min(0),
      fiber: Joi.number().min(0),
      sugar: Joi.number().min(0),
      sodium: Joi.number().min(0)
    }),
    isPublic: Joi.boolean()
  }),

  // Comment validation
  addComment: Joi.object({
    text: Joi.string()
      .trim()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.min': 'Comment cannot be empty',
        'string.max': 'Comment cannot exceed 500 characters',
        'any.required': 'Comment text is required'
      })
  }),

  // Collection validation
  createCollection: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Collection name is required',
        'string.max': 'Collection name cannot exceed 100 characters',
        'any.required': 'Collection name is required'
      }),
    description: Joi.string()
      .trim()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Collection description cannot exceed 500 characters'
      }),
    isPublic: Joi.boolean().default(true)
  }),

  updateCollection: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .messages({
        'string.min': 'Collection name cannot be empty',
        'string.max': 'Collection name cannot exceed 100 characters'
      }),
    description: Joi.string()
      .trim()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Collection description cannot exceed 500 characters'
      }),
    isPublic: Joi.boolean()
  }),

  // Query parameter validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('createdAt', 'updatedAt', 'title', 'rating', 'views', 'likes').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  recipeFilters: Joi.object({
    search: Joi.string().trim().allow(''),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard'),
    tags: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ),
    prepTimeMin: Joi.number().integer().min(0),
    prepTimeMax: Joi.number().integer().min(0),
    cookTimeMin: Joi.number().integer().min(0),
    cookTimeMax: Joi.number().integer().min(0),
    servingsMin: Joi.number().integer().min(1),
    servingsMax: Joi.number().integer().min(1),
    author: Joi.string().hex().length(24)
  })
};

// Generic validation middleware
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      next(new ValidationErrorClass(validationErrors));
      return;
    }

    // Replace the original data with validated data
    req[property] = value;
    next();
  };
};

// Specific validation middleware functions
export const validateRegister = validate(schemas.register);
export const validateLogin = validate(schemas.login);
export const validateUpdateProfile = validate(schemas.updateProfile);
export const validateChangePassword = validate(schemas.changePassword);
export const validateCreateRecipe = validate(schemas.createRecipe);
export const validateUpdateRecipe = validate(schemas.updateRecipe);
export const validateAddComment = validate(schemas.addComment);
export const validateCreateCollection = validate(schemas.createCollection);
export const validateUpdateCollection = validate(schemas.updateCollection);
export const validatePagination = validate(schemas.pagination, 'query');
export const validateRecipeFilters = validate(schemas.recipeFilters, 'query');

// MongoDB ObjectId validation middleware
export function validateObjectId(paramName: string = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: `Invalid ${paramName}`,
        error: 'INVALID_ID'
      } as ApiResponse);
      return;
    }

    next();
  };
} 