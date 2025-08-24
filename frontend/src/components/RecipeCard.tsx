
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ChefHat } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  tags: string[];
  imageUrl: string;
  author: string;
}

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    prepTime: number;
    servings: number;
    difficulty: string;
    dietaryPreference?: string;
    tags: string[];
    author: string;
  };
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="card-modern hover-lift group overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <ChefHat className="h-10 w-10 text-orange-500" />
            </div>
          </div>
        )}
        
        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className={`text-xs font-medium shadow-lg ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </Badge>
          {recipe.dietaryPreference && (
            <Badge className="text-xs font-medium shadow-lg bg-green-500 text-white">
              {recipe.dietaryPreference}
            </Badge>
          )}
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {recipe.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>

        {/* Recipe Details */}
        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
            <span className="font-medium">{recipe.prepTime}m prep</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            <span className="font-medium">{recipe.servings} servings</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {recipe.tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 transition-colors"
            >
              {tag}
            </Badge>
          ))}
          {recipe.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
              +{recipe.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Author and Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full flex items-center justify-center">
              <span className="text-xs text-orange-700 font-medium">C</span>
            </div>
            <span className="font-medium">by {recipe.author}</span>
          </div>
          
          <Link
            to={`/recipe/${recipe.id}`}
            className="text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors group-hover:underline"
          >
            View Recipe →
          </Link>
        </div>
      </div>
    </div>
  );
};
