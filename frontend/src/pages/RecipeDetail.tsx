import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, ChefHat, ArrowLeft, User, Loader2, Copy, Check } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useRecipe } from '@/hooks/useRecipes';
import { useState } from 'react';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useRecipe(id!);
  const [copied, setCopied] = useState(false);

  const recipe = response?.data?.recipe;

  const handleShareRecipe = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <span className="ml-2 text-gray-600">Loading recipe...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recipe not found</h1>
          <p className="text-gray-600 mb-6">
            The recipe you're looking for doesn't exist or may have been removed.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-lg mb-6">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute top-4 right-4">
            <Badge className={`${getDifficultyColor(recipe.difficulty)} border-0 font-medium`}>
              {recipe.difficulty}
            </Badge>
          </div>
        </div>

        {/* Recipe Info */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {recipe.title}
          </h1>
          
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {recipe.description}
          </p>

          {/* Modern Recipe Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <span className="font-medium">{totalTime} min total</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium">{recipe.servings} servings</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium">by {recipe.author?.username || 'Unknown Chef'}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-gray-500">{new Date(recipe.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Share Recipe Button - Right Side */}
            <Button 
              variant="outline" 
              onClick={handleShareRecipe}
              className="group relative overflow-hidden px-6 py-3 bg-white border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-orange-100 rounded-lg p-1 group-hover:bg-orange-200 transition-colors duration-300">
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-orange-600" />
                  )}
                </div>
                <span className="font-medium text-gray-700 group-hover:text-orange-700 transition-colors duration-300">
                  {copied ? 'Copied!' : 'Share Recipe'}
                </span>
              </div>
            </Button>
          </div>

          {/* Modern Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {recipe.tags.map((tag: string, index: number) => (
                <span 
                  key={index} 
                  className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-sm font-medium border border-gray-300/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Modern Dietary Preference Badge */}
          {recipe.dietaryPreference && (
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-semibold shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                {recipe.dietaryPreference}
              </span>
            </div>
          )}


        </div>

        {/* Recipe Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Prep Time Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-orange-700 mb-2 uppercase tracking-wide">Prep Time</h3>
              <div className="text-3xl font-bold text-orange-900 mb-1">
                {recipe.prepTime}
              </div>
              <div className="text-sm text-orange-600 font-medium">minutes</div>
            </div>
          </div>
          
          {/* Cook Time Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Cook Time</h3>
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {recipe.cookTime}
              </div>
              <div className="text-sm text-blue-600 font-medium">minutes</div>
            </div>
          </div>
          
          {/* Servings Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-green-100 to-green-200 border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-green-700 mb-2 uppercase tracking-wide">Servings</h3>
              <div className="text-3xl font-bold text-green-900 mb-1">
                {recipe.servings}
              </div>
              <div className="text-sm text-green-600 font-medium">people</div>
            </div>
          </div>
        </div>

        {/* Ingredients and Instructions in Two Columns */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Ingredients */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recipe.ingredients?.map((ingredient: any, index: number) => (
                  <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700 flex-1">
                      {ingredient.name}
                      {ingredient.remarks && (
                        <span className="text-gray-500 ml-1">({ingredient.remarks})</span>
                      )}
                    </span>
                    <span className="text-sm text-gray-500 ml-2 font-medium">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipe.instructions?.map((instruction: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-7 h-7 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {instruction.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">
                        {instruction.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nutrition Section (if available) */}
        {recipe.nutrition && (
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle>Nutrition (per serving)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recipe.nutrition.calories && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{recipe.nutrition.calories}</div>
                    <div className="text-sm text-gray-600">Calories</div>
                  </div>
                )}
                {recipe.nutrition.protein && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{recipe.nutrition.protein}g</div>
                    <div className="text-sm text-gray-600">Protein</div>
                  </div>
                )}
                {recipe.nutrition.carbs && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{recipe.nutrition.carbs}g</div>
                    <div className="text-sm text-gray-600">Carbs</div>
                  </div>
                )}
                {recipe.nutrition.fat && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{recipe.nutrition.fat}g</div>
                    <div className="text-sm text-gray-600">Fat</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
} 