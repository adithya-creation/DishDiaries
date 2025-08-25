import { Request } from 'express';
import { Document, Types } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  favorites: Types.ObjectId[];
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateJWT(): string;
}

// Recipe Types
export interface IIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface IInstruction {
  step: number;
  description: string;
}

export interface IComment {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
  _id?: Types.ObjectId;
}

export interface INutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface IRecipe extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  ingredients: IIngredient[];
  instructions: IInstruction[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dietaryPreference: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';
  tags: string[];
  imageUrl: string;
  imagePublicId?: string;
  author: Types.ObjectId;
  likes: Types.ObjectId[];
  comments: IComment[];
  nutrition?: INutrition;
  isPublic: boolean;
  views: number;
  rating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  addLike(userId: string): Promise<IRecipe>;
  removeLike(userId: string | Types.ObjectId): Promise<IRecipe>;
  addComment(userId: string, text: string): Promise<IRecipe>;
  removeComment(commentId: string | Types.ObjectId): Promise<IRecipe>;
  incrementViews(): Promise<IRecipe>;
}

// Collection Types
export interface ICollection extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  recipes: Types.ObjectId[];
  author: Types.ObjectId;
  isPublic: boolean;
  followers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: 'like' | 'comment' | 'follow' | 'recipe' | 'collection';
  entityId: Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Custom Request Types
export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
  resourceId?: string;
  params: any;
  query: any;
  headers: any;
  body: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Pagination Types
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search/Filter Types
export interface RecipeFilters {
  difficulty?: string;
  tags?: string[];
  prepTime?: { min?: number; max?: number };
  cookTime?: { min?: number; max?: number };
  servings?: { min?: number; max?: number };
  author?: string;
  search?: string;
}

// Socket.io Types
export interface SocketUser {
  userId: string;
  username: string;
  socketId: string;
}

export interface SocketEvents {
  'join-recipe': { recipeId: string };
  'leave-recipe': { recipeId: string };
  'like-recipe': { recipeId: string; userId: string };
  'add-comment': { recipeId: string; comment: IComment };
  'user-online': { userId: string };
  'recipe-updated': { recipe: IRecipe };
  'new-like': { recipeId: string; likesCount: number };
  'new-comment': { recipeId: string; comment: IComment };
  'user-status': { userId: string; online: boolean };
  'new-recipe': { recipe: IRecipe };
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

// Email Types
export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// File Upload Types
export interface UploadedFile {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// Analytics Types
export interface RecipeAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export interface UserAnalytics {
  recipesCount: number;
  followersCount: number;
  followingCount: number;
  totalLikes: number;
  totalViews: number;
} 