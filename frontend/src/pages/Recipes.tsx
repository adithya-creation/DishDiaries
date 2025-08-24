import React, { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RecipeCard } from "@/components/RecipeCard";
import { useRecipes } from "@/hooks/useRecipes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Recipes = () => {
  console.log("Recipes component rendering - FULL VERSION WITH ERROR HANDLING");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");

  // Fetch all recipes with error handling
  let recipesResponse, isLoading, error;
  
  try {
    const result = useRecipes({ limit: 50 });
    recipesResponse = result.data;
    isLoading = result.isLoading;
    error = result.error;
  } catch (err) {
    console.error("Error in useRecipes hook:", err);
    error = err;
    isLoading = false;
    recipesResponse = null;
  }

  const recipes = recipesResponse?.data?.recipes || [];

  // Get unique tags and difficulties for filters
  const allTags = useMemo(() => {
    try {
      const tags = new Set<string>();
      recipes.forEach(recipe => {
        if (recipe.tags) {
          recipe.tags.forEach(tag => tags.add(tag));
        }
      });
      return Array.from(tags).sort();
    } catch (err) {
      console.error("Error processing tags:", err);
      return [];
    }
  }, [recipes]);

  const allDifficulties = useMemo(() => {
    try {
      const difficulties = new Set<string>();
      recipes.forEach(recipe => {
        if (recipe.difficulty) {
          difficulties.add(recipe.difficulty);
        }
      });
      return Array.from(difficulties).sort();
    } catch (err) {
      console.error("Error processing difficulties:", err);
      return [];
    }
  }, [recipes]);

  // Filter recipes based on search and filters
  const filteredRecipes = useMemo(() => {
    try {
      return recipes.filter(recipe => {
        const matchesSearch = searchTerm === "" || 
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

        const matchesDifficulty = selectedDifficulty === "all" || recipe.difficulty === selectedDifficulty;
        const matchesTag = selectedTag === "all" || (recipe.tags && recipe.tags.includes(selectedTag));

        return matchesSearch && matchesDifficulty && matchesTag;
      });
    } catch (err) {
      console.error("Error filtering recipes:", err);
      return [];
    }
  }, [recipes, searchTerm, selectedDifficulty, selectedTag]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDifficulty("all");
    setSelectedTag("all");
  };

  // If there's a critical error, show error state
  if (error && !recipesResponse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="bg-red-100 p-6 rounded-lg border border-red-300 max-w-md mx-auto">
              <p className="text-red-800 font-medium text-lg mb-2">Critical Error</p>
              <p className="text-red-700 text-sm mb-4">
                Unable to load recipes due to a system error.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Delicious Recipes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of carefully curated recipes from around the world. 
            Find your next favorite dish with our easy-to-use search and filters.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Recipes
              </label>
              <Input
                id="search"
                placeholder="Search by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
                  {allDifficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tag Filter */}
            <div>
              <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-2">
                Tag
              </label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedDifficulty !== "all" || selectedTag !== "all") && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {filteredRecipes.length === 1 ? '1 Recipe' : `${filteredRecipes.length} Recipes`}
            </h2>
            {filteredRecipes.length !== recipes.length && (
              <p className="text-gray-600">
                Showing {filteredRecipes.length} of {recipes.length} recipes
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading delicious recipes...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-16">
            <div className="bg-red-100 p-6 rounded-lg border border-red-300 max-w-md mx-auto">
              <p className="text-red-800 font-medium text-lg mb-2">Unable to load recipes</p>
              <p className="text-red-700 text-sm mb-4">
                {error.message || 'An error occurred while loading recipes.'}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && filteredRecipes.length === 0 && recipes.length > 0 && (
          <div className="text-center py-16">
            <div className="bg-yellow-100 p-6 rounded-lg border border-yellow-300 max-w-md mx-auto">
              <p className="text-yellow-800 font-medium text-lg mb-2">No recipes found</p>
              <p className="text-yellow-700 text-sm mb-4">
                Try adjusting your search terms or filters to find more recipes.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Recipe Grid */}
        {!isLoading && !error && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe: any) => (
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
        )}

        {/* Empty State (when no recipes in database) */}
        {!isLoading && !error && recipes.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-blue-100 p-6 rounded-lg border border-blue-300 max-w-md mx-auto">
              <p className="text-blue-800 font-medium text-lg mb-2">No recipes available</p>
              <p className="text-blue-700 text-sm mb-4">
                It looks like there are no recipes in the database yet.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href="/create-recipe">Create Your First Recipe</a>
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Recipes; 