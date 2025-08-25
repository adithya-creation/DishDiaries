import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, ChefHat, ArrowLeft, Loader2, Copy, Check, Leaf, Beef, Sprout, Send, Twitter, Facebook, Link2, MessageCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = recipe ? `${recipe.title} — check out this recipe on DishDiaries!` : 'Check out this recipe on DishDiaries!';

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe?.title || 'DishDiaries', text: shareText, url: shareUrl });
      } catch (err) {
        // Silently ignore if user cancels
      }
    } else {
      await handleShareRecipe();
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    openInNewTab(url);
  };

  const handleShareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    openInNewTab(url);
  };

  const handleShareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    openInNewTab(url);
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

  const getDietaryPreferenceStyle = (preference: string) => {
    switch (preference) {
      case 'Vegetarian':
        return {
          bg: 'bg-green-500',
          icon: Leaf,
          iconColor: 'text-white'
        };
      case 'Non-Vegetarian':
        return {
          bg: 'bg-red-500',
          icon: Beef,
          iconColor: 'text-white'
        };
      case 'Vegan':
        return {
          bg: 'bg-emerald-500',
          icon: Sprout,
          iconColor: 'text-white'
        };
      default:
        return {
          bg: 'bg-gray-500',
          icon: Leaf,
          iconColor: 'text-white'
        };
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
                  <ChefHat className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium">by {recipe.author?.username || 'Unknown Chef'}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-gray-500">{new Date(recipe.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Share Recipe - Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="default" 
                  aria-label="Share recipe"
                  className="group relative overflow-hidden px-5 py-3 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 md:h-5 md:w-5 opacity-90 group-hover:opacity-100" />
                    <span className="hidden sm:inline font-semibold tracking-wide">
                      Share
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto p-2">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" aria-label="Share to X" onClick={handleShareToTwitter} className="rounded-full hover:bg-gray-100">
                    <Twitter className="h-5 w-5 text-sky-500" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Share to Facebook" onClick={handleShareToFacebook} className="rounded-full hover:bg-gray-100">
                    <Facebook className="h-5 w-5 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Share to WhatsApp" onClick={handleShareToWhatsApp} className="rounded-full hover:bg-gray-100">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.242.489 1.665.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" fill="#25D366"/>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Copy link" onClick={handleShareRecipe} className="rounded-full hover:bg-gray-100">
                    {copied ? <Check className="h-5 w-5 text-green-600" /> : <Link2 className="h-5 w-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Native share" onClick={handleWebShare} className="rounded-full hover:bg-gray-100">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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
              {(() => {
                const style = getDietaryPreferenceStyle(recipe.dietaryPreference);
                const IconComponent = style.icon;
                return (
                  <span className={`inline-flex items-center px-4 py-2 ${style.bg} text-white rounded-full text-sm font-semibold shadow-lg`}>
                    <IconComponent className={`w-4 h-4 mr-2 ${style.iconColor}`} />
                    {recipe.dietaryPreference}
                  </span>
                );
              })()}
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