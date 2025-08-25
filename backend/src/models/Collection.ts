import mongoose, { Schema, Types } from 'mongoose';
import { ICollection } from '../types';

const CollectionSchema = new Schema<ICollection>({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    maxlength: [100, 'Collection name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Collection description cannot exceed 500 characters']
  },
  recipes: [{
    type: Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Collection author is required']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
CollectionSchema.index({ author: 1 });
CollectionSchema.index({ name: 'text', description: 'text' });
CollectionSchema.index({ isPublic: 1 });
CollectionSchema.index({ followers: 1 });

// Virtual for recipe count
CollectionSchema.virtual('recipeCount').get(function() {
  return this.recipes.length;
});

// Virtual for follower count
CollectionSchema.virtual('followerCount').get(function() {
  return this.followers.length;
});

// Method to add recipe
CollectionSchema.methods.addRecipe = function(recipeId: string) {
  if (!this.recipes.includes(recipeId)) {
    this.recipes.push(recipeId);
  }
  return this.save();
};

// Method to remove recipe
CollectionSchema.methods.removeRecipe = function(recipeId: string | Types.ObjectId) {
  this.recipes = this.recipes.filter((id: Types.ObjectId) => id.toString() !== recipeId.toString());
  return this.save();
};

// Method to add follower
CollectionSchema.methods.addFollower = function(userId: string) {
  if (!this.followers.includes(userId)) {
    this.followers.push(userId);
  }
  return this.save();
};

// Method to remove follower
CollectionSchema.methods.removeFollower = function(userId: string | Types.ObjectId) {
  this.followers = this.followers.filter((id: Types.ObjectId) => id.toString() !== userId.toString());
  return this.save();
};

// Static method to find public collections
CollectionSchema.statics.findPublicCollections = function(filters: any = {}) {
  return this.find({ isPublic: true, ...filters });
};

// Static method to find collections by author
CollectionSchema.statics.findByAuthor = function(authorId: string, includePrivate: boolean = false) {
  const query: any = { author: authorId };
  if (!includePrivate) {
    query.isPublic = true;
  }
  return this.find(query);
};

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema); 