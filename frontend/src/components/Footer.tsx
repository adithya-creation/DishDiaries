
import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Brand Section */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-orange-600 rounded-lg flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">DishDiaries</span>
          </div>
          <p className="text-gray-300 text-sm">
            Your personal recipe haven. Simple, clean, and delicious.
          </p>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Adithya Mittapally. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
