
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecipeCard } from "@/components/RecipeCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRecipes } from "@/hooks/useRecipes";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Loader2, AlertCircle, Utensils, Users, Zap, PlusCircle } from "lucide-react";

const Index = () => {
  const { data: recipesResponse, isLoading, error } = useRecipes({ limit: 3 });
  const recipes = recipesResponse?.data?.recipes || [];
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100 py-20">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700 border border-orange-200 mb-4">
            <Zap className="h-4 w-4" /> Fresh flavors. Modern experience.
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Discover & Share
            <span className="text-orange-600 block">Delicious Recipes</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our community of food lovers. Create, discover, and share your favorite recipes 
            in a beautiful, distraction-free space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/create-recipe">
                <Button size="lg" className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create Recipe
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-xl">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" /> Loved by home chefs
            </div>
            <div className="hidden sm:block h-4 w-px bg-gray-300" />
            <div className="hidden sm:flex items-center gap-2">
              <Utensils className="h-4 w-4 text-orange-600" /> Thousands of tasty ideas
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Recipes
            </h2>
            <p className="text-lg text-gray-600">
              Discover our most popular and delicious recipes
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
              <span className="mt-2 block text-gray-600">Loading recipes...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to load recipes</h3>
              <p className="text-gray-600 mb-4">Please try again later</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {recipes.map((recipe: any) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={{
                    id: recipe._id,
                    title: recipe.title,
                    description: recipe.description,
                    prepTime: recipe.prepTime,
                    cookTime: recipe.cookTime,
                    servings: recipe.servings,
                    difficulty: recipe.difficulty,
                    tags: recipe.tags || [],
                    imageUrl: recipe.imageUrl,
                    author: recipe.author?.username || 'Unknown Chef'
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-400 font-light">+</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No recipes available</h3>
              <p className="text-gray-600 mb-4">Be the first to create a recipe!</p>
              {isAuthenticated && (
                <Link to="/create-recipe">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Create Recipe
                  </Button>
                </Link>
              )}
            </div>
          )}

          {recipes.length > 0 && (
            <div className="text-center">
              <Link to="/recipes">
                <Button variant="outline" size="lg" className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl">
                  View All Recipes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose DishDiaries?
            </h2>
            <p className="text-lg text-gray-600">
              Built for food lovers, by food lovers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
                <p className="text-gray-600">
                  Simple, intuitive interface that makes recipe creation and discovery effortless.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
                <p className="text-gray-600">
                  Share your recipes with a growing community of passionate home chefs.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Modern</h3>
                <p className="text-gray-600">
                  Built with modern technology for a fast, responsive experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
