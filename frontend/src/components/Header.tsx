
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChefHat, Plus } from 'lucide-react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              DishDiaries
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link to="/recipes" className="px-4 py-2 text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium rounded-lg hover:bg-orange-50">
              Recipes
            </Link>
            <Link to="/about" className="px-4 py-2 text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium rounded-lg hover:bg-orange-50">
              About
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    {user?.username}
                  </span>
                </div>
                <Link to="/my-recipes" className="px-4 py-2 text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium rounded-lg hover:bg-orange-50">
                  My Recipes
                </Link>
                <Link to="/create-recipe">
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Recipe
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 rounded-xl px-4"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 rounded-xl px-6">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200/60 pt-4">
            <nav className="flex flex-col space-y-2">
              <Link to="/recipes" className="px-4 py-3 text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium rounded-lg hover:bg-orange-50">
                Recipes
              </Link>
              <Link to="/about" className="px-4 py-3 text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium rounded-lg hover:bg-orange-50">
                About
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/my-recipes" className="px-4 py-3 text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium rounded-lg hover:bg-orange-50">
                    My Recipes
                  </Link>
                  <Link to="/create-recipe" className="px-4 py-3 text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium rounded-lg hover:bg-orange-50">
                    Create Recipe
                  </Link>
                </>
              )}
            </nav>
            
            <div className="mt-4 pt-4 border-t border-gray-200/60">
              {isAuthenticated ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 font-medium">
                      {user?.username}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50 justify-start transition-all duration-200 rounded-xl"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="w-full text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50 justify-start transition-all duration-200 rounded-xl">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white justify-start shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
