import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Recipe } from '../models/Recipe';
import { User } from '../models/User';
import { database } from '../config/database';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

const sampleRecipes = [
  {
    title: "Creamy Mushroom Risotto",
    description: "A rich and creamy Italian comfort food perfect for cozy evenings",
    ingredients: [
      { name: "Arborio rice", amount: "1", unit: "cup" },
      { name: "Mixed mushrooms", amount: "300", unit: "g" },
      { name: "Vegetable broth", amount: "4", unit: "cups" },
      { name: "White wine", amount: "1/2", unit: "cup" },
      { name: "Onion", amount: "1", unit: "medium" },
      { name: "Parmesan cheese", amount: "1/2", unit: "cup" },
      { name: "Butter", amount: "2", unit: "tbsp" },
      { name: "Olive oil", amount: "2", unit: "tbsp" }
    ],
    instructions: [
      { step: 1, description: "Heat broth in a separate pot and keep warm" },
      { step: 2, description: "Sauté mushrooms in butter until golden, set aside" },
      { step: 3, description: "In same pan, cook onion until translucent" },
      { step: 4, description: "Add rice and stir for 2 minutes until coated" },
      { step: 5, description: "Add wine and stir until absorbed" },
      { step: 6, description: "Add warm broth one ladle at a time, stirring constantly" },
      { step: 7, description: "Continue for 18-20 minutes until rice is creamy" },
      { step: 8, description: "Stir in mushrooms, parmesan, and season to taste" }
    ],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: "Medium",
    tags: ["italian", "vegetarian", "comfort food"],
    imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop&crop=center"
  },
  {
    title: "Honey Garlic Salmon",
    description: "Flaky salmon glazed with a sweet and savory honey garlic sauce",
    ingredients: [
      { name: "Salmon fillets", amount: "4", unit: "pieces" },
      { name: "Honey", amount: "3", unit: "tbsp" },
      { name: "Soy sauce", amount: "2", unit: "tbsp" },
      { name: "Garlic", amount: "3", unit: "cloves" },
      { name: "Lemon juice", amount: "1", unit: "tbsp" },
      { name: "Olive oil", amount: "1", unit: "tbsp" },
      { name: "Green onions", amount: "2", unit: "stalks" }
    ],
    instructions: [
      { step: 1, description: "Preheat oven to 400°F (200°C)" },
      { step: 2, description: "Mix honey, soy sauce, minced garlic, and lemon juice" },
      { step: 3, description: "Heat olive oil in oven-safe skillet" },
      { step: 4, description: "Season salmon and sear skin-side up for 3 minutes" },
      { step: 5, description: "Flip salmon and brush with honey garlic sauce" },
      { step: 6, description: "Transfer to oven and bake for 8-10 minutes" },
      { step: 7, description: "Garnish with chopped green onions and serve" }
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: "Easy",
    tags: ["seafood", "healthy", "quick"],
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop&crop=center"
  },
  {
    title: "Classic Chocolate Chip Cookies",
    description: "Soft, chewy cookies with melted chocolate chips in every bite",
    ingredients: [
      { name: "All-purpose flour", amount: "2 1/4", unit: "cups" },
      { name: "Butter", amount: "1", unit: "cup" },
      { name: "Brown sugar", amount: "3/4", unit: "cup" },
      { name: "White sugar", amount: "3/4", unit: "cup" },
      { name: "Eggs", amount: "2", unit: "large" },
      { name: "Vanilla extract", amount: "2", unit: "tsp" },
      { name: "Baking soda", amount: "1", unit: "tsp" },
      { name: "Salt", amount: "1", unit: "tsp" },
      { name: "Chocolate chips", amount: "2", unit: "cups" }
    ],
    instructions: [
      { step: 1, description: "Preheat oven to 375°F (190°C)" },
      { step: 2, description: "Cream butter and both sugars until fluffy" },
      { step: 3, description: "Beat in eggs one at a time, then vanilla" },
      { step: 4, description: "Mix flour, baking soda, and salt in separate bowl" },
      { step: 5, description: "Gradually add dry ingredients to wet ingredients" },
      { step: 6, description: "Fold in chocolate chips" },
      { step: 7, description: "Drop rounded tablespoons onto ungreased baking sheets" },
      { step: 8, description: "Bake 9-11 minutes until golden brown" },
      { step: 9, description: "Cool on baking sheet for 2 minutes before transferring" }
    ],
    prepTime: 20,
    cookTime: 12,
    servings: 24,
    difficulty: "Easy",
    tags: ["dessert", "baking", "classic"],
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop&crop=center"
  }
];

async function seedRecipes() {
  try {
    await database.connect();

    // Find or create a default user for the recipes
    let user = await User.findOne({ email: 'demo@dishdiaries.com' });
    
    if (!user) {
      user = new User({
        username: 'chef_demo',
        email: 'demo@dishdiaries.com',
        password: 'demo123456', // This will be hashed by the pre-save hook
        bio: 'Demo chef account for sample recipes'
      });
      await user.save();
      logger.info('Created demo user');
    }

    // Clear existing recipes
    await Recipe.deleteMany({});
    logger.info('Cleared existing recipes');

    // Create new recipes
    const recipes = sampleRecipes.map(recipe => ({
      ...recipe,
      author: user._id,
      isPublic: true
    }));

    await Recipe.insertMany(recipes);
    logger.info(`Seeded ${recipes.length} recipes successfully`);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding recipes:', error);
    process.exit(1);
  }
}

// Run the seeder
seedRecipes(); 