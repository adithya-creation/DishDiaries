
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecipeCard } from "@/components/RecipeCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useRecipes } from "@/hooks/useRecipes";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { data: recipesResponse, isLoading, error } = useRecipes({ limit: 3 });
  const recipes = recipesResponse?.data?.recipes || [];
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover & Share
            <span className="text-orange-600 block">Delicious Recipes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our community of food lovers. Create, discover, and share your favorite recipes 
            in a beautiful, distraction-free space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/create-recipe">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
                  Create Recipe
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <span className="ml-2 text-gray-600">Loading recipes...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-400 font-light">!</span>
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
                <Button variant="outline" size="lg" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  View All Recipes
                  <span className="ml-2">→</span>
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
            <Card className="text-center border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {/* Easy to Use Icon - Simple Interface */}
                  <div className="relative w-6 h-6">
                    <div className="w-6 h-1 bg-orange-600 rounded-full mb-1"></div>
                    <div className="w-4 h-1 bg-orange-600 rounded-full mb-1"></div>
                    <div className="w-5 h-1 bg-orange-600 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
                <p className="text-gray-600">
                  Simple, intuitive interface that makes recipe creation and discovery effortless.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {/* Community Icon - People */}
                  <div className="relative w-6 h-6">
                    <div className="w-2 h-2 bg-orange-600 rounded-full absolute top-0 left-0"></div>
                    <div className="w-2 h-2 bg-orange-600 rounded-full absolute top-0 right-0"></div>
                    <div className="w-2 h-2 bg-orange-600 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
                <p className="text-gray-600">
                  Share your recipes with a growing community of passionate home chefs.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {/* Fast & Modern Icon - Lightning */}
                  <div className="relative w-6 h-6">
                    <div className="w-0 h-0 border-l-3 border-r-3 border-b-6 border-l-transparent border-r-transparent border-b-orange-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    <div className="w-1 h-3 bg-orange-600 absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                  </div>
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
