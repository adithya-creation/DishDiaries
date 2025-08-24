
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChefHat } from 'lucide-react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover-scale">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              DishDiaries
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/recipes" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
              Recipes
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
              About
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 font-medium">
                  Welcome, {user?.username}!
                </span>
                <Link to="/create-recipe">
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover-lift">
                    <span className="mr-2 text-sm">+</span>
                    Create Recipe
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50 hover-lift"
                >
                  <span className="mr-2 text-sm">→</span>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50 hover-lift">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover-lift">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 hover-lift"
            >
              <span className="text-lg">☰</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col space-y-3">
              <Link to="/recipes" className="text-gray-600 hover:text-orange-600 py-2 transition-colors font-medium">
                Recipes
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-orange-600 py-2 transition-colors font-medium">
                About
              </Link>
              {isAuthenticated && (
                <Link to="/create-recipe" className="text-gray-600 hover:text-orange-600 py-2 transition-colors font-medium">
                  Create Recipe
                </Link>
              )}
            </nav>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="flex flex-col space-y-3">
                  <span className="text-sm text-gray-600 py-2 font-medium">
                    Welcome, {user?.username}!
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50 justify-start hover-lift"
                  >
                    <span className="mr-2 text-sm">→</span>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="w-full text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50 justify-start hover-lift">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white justify-start shadow-lg hover-lift">
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
