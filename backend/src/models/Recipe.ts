import mongoose, { Schema, Types } from 'mongoose';
import { IRecipe, IIngredient, IInstruction, IComment, INutrition } from '@/types';

const IngredientSchema = new Schema<IIngredient>({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    trim: true
  },
  amount: {
    type: String,
    required: [true, 'Ingredient amount is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Ingredient unit is required'],
    trim: true
  }
}, { _id: false });

const InstructionSchema = new Schema<IInstruction>({
  step: {
    type: Number,
    required: [true, 'Step number is required'],
    min: [1, 'Step number must be at least 1']
  },
  description: {
    type: String,
    required: [true, 'Step description is required'],
    trim: true,
    maxlength: [1000, 'Step description cannot exceed 1000 characters']
  }
}, { _id: false });

const CommentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const NutritionSchema = new Schema<INutrition>({
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative']
  },
  protein: {
    type: Number,
    min: [0, 'Protein cannot be negative']
  },
  carbs: {
    type: Number,
    min: [0, 'Carbs cannot be negative']
  },
  fat: {
    type: Number,
    min: [0, 'Fat cannot be negative']
  },
  fiber: {
    type: Number,
    min: [0, 'Fiber cannot be negative']
  },
  sugar: {
    type: Number,
    min: [0, 'Sugar cannot be negative']
  },
  sodium: {
    type: Number,
    min: [0, 'Sodium cannot be negative']
  }
}, { _id: false });

const RecipeSchema = new Schema<IRecipe>({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [100, 'Recipe title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Recipe description is required'],
    trim: true,
    maxlength: [1000, 'Recipe description cannot exceed 1000 characters']
  },
  ingredients: {
    type: [IngredientSchema],
    required: [true, 'Recipe ingredients are required'],
    validate: {
      validator: function(ingredients: IIngredient[]) {
        return ingredients.length > 0;
      },
      message: 'Recipe must have at least one ingredient'
    }
  },
  instructions: {
    type: [InstructionSchema],
    required: [true, 'Recipe instructions are required'],
    validate: {
      validator: function(instructions: IInstruction[]) {
        return instructions.length > 0;
      },
      message: 'Recipe must have at least one instruction'
    }
  },
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [0, 'Preparation time cannot be negative']
  },
  cookTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [0, 'Cooking time cannot be negative']
  },
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Servings must be at least 1']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: 'Difficulty must be Easy, Medium, or Hard'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  imageUrl: {
    type: String,
    required: [true, 'Recipe image is required']
  },
  imagePublicId: {
    type: String
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipe author is required']
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema],
  nutrition: {
    type: NutritionSchema,
    default: undefined
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  ratingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
RecipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
RecipeSchema.index({ author: 1 });
RecipeSchema.index({ tags: 1 });
RecipeSchema.index({ difficulty: 1 });
RecipeSchema.index({ prepTime: 1 });
RecipeSchema.index({ cookTime: 1 });
RecipeSchema.index({ rating: -1 });
RecipeSchema.index({ createdAt: -1 });
RecipeSchema.index({ views: -1 });
RecipeSchema.index({ isPublic: 1 });
RecipeSchema.index({ 'likes': 1 });

// Virtual for total time
RecipeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

// Virtual for like count
RecipeSchema.virtual('likeCount').get(function() {
  return this.likes && this.likes.length ? this.likes.length : 0;
});

// Virtual for comment count
RecipeSchema.virtual('commentCount').get(function() {
  return this.comments && this.comments.length ? this.comments.length : 0;
});

// Virtual to check if user liked the recipe
RecipeSchema.virtual('isLiked').get(function() {
  // This will be set by the controller when user is authenticated
  return false;
});

// Method to add like
RecipeSchema.methods.addLike = function(userId: string) {
  if (!this.likes) {
    this.likes = [];
  }
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
  }
  return this.save();
};

// Method to remove like
RecipeSchema.methods.removeLike = function(userId: string | Types.ObjectId) {
  if (!this.likes) {
    this.likes = [];
  }
  this.likes = this.likes.filter((id: Types.ObjectId) => id.toString() !== userId.toString());
  return this.save();
};

// Method to add comment
RecipeSchema.methods.addComment = function(userId: string, text: string) {
  if (!this.comments) {
    this.comments = [];
  }
  this.comments.push({
    user: userId,
    text,
    createdAt: new Date()
  });
  return this.save();
};

// Method to remove comment
RecipeSchema.methods.removeComment = function(commentId: string | Types.ObjectId) {
  if (!this.comments) {
    this.comments = [];
  }
  this.comments = this.comments.filter((comment: IComment) =>
    comment._id && comment._id.toString() !== commentId.toString()
  );
  return this.save();
};

// Method to increment views
RecipeSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to find public recipes
RecipeSchema.statics.findPublicRecipes = function(filters: any = {}) {
  return this.find({ isPublic: true, ...filters });
};

// Static method to find recipes by author
RecipeSchema.statics.findByAuthor = function(authorId: string, includePrivate: boolean = false) {
  const query: any = { author: authorId };
  if (!includePrivate) {
    query.isPublic = true;
  }
  return this.find(query);
};

// Static method to search recipes
RecipeSchema.statics.searchRecipes = function(searchTerm: string, filters: any = {}) {
  const query: any = {
    isPublic: true,
    $text: { $search: searchTerm },
    ...filters
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

// Static method to get popular recipes
RecipeSchema.statics.getPopularRecipes = function(limit: number = 10) {
  return this.find({ isPublic: true })
    .sort({ views: -1, rating: -1, likeCount: -1 })
    .limit(limit);
};

// Pre-save middleware to sort instructions by step number
RecipeSchema.pre('save', function(next) {
  if (this.isModified('instructions') && this.instructions && this.instructions.length > 0) {
    this.instructions.sort((a, b) => a.step - b.step);
  }
  next();
});

// Pre-save middleware to validate instruction step numbers
RecipeSchema.pre('save', function(next) {
  if (this.isModified('instructions') && this.instructions && this.instructions.length > 0) {
    const steps = this.instructions.map(inst => inst.step);
    const uniqueSteps = [...new Set(steps)];
    
    if (steps.length !== uniqueSteps.length) {
      return next(new Error('Instruction step numbers must be unique'));
    }
    
    // Ensure steps start from 1 and are consecutive
    const sortedSteps = steps.sort((a, b) => a - b);
    for (let i = 0; i < sortedSteps.length; i++) {
      if (sortedSteps[i] !== i + 1) {
        return next(new Error('Instruction steps must be consecutive starting from 1'));
      }
    }
  }
  next();
});

export const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema); 