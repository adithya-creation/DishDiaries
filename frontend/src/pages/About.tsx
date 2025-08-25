import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { ChefHat, Search, Users, FolderOpen, Heart, Zap, Shield, Network } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
              <ChefHat className="h-12 w-12 text-orange-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About DishDiaries
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're passionate about bringing people together through the joy of cooking. 
              Our platform makes it easy to discover, create, and share delicious recipes.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              To create a welcoming space where food lovers can connect, share their culinary 
              adventures, and inspire others to explore the wonderful world of cooking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Building a Community of Food Enthusiasts
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                DishDiaries was born from a simple idea: cooking should be accessible, 
                enjoyable, and social. We believe that every recipe tells a story, and 
                every kitchen is a place of creativity and connection.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Whether you're a seasoned chef or just starting your culinary journey, 
                our platform provides the tools and community you need to explore, 
                experiment, and share your love for food.
              </p>
            </div>
            <div className="bg-orange-100 rounded-lg p-8 text-center">
              <div className="w-24 h-24 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Network className="w-12 h-12 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Community First</h4>
              <p className="text-gray-600 text-sm">
                We prioritize building meaningful connections between food lovers worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Makes Us Special</h2>
            <p className="text-lg text-gray-600">
              Discover the features that set DishDiaries apart
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Smart Search</CardTitle>
                <CardDescription>
                  Find exactly what you're looking for with our intelligent search and filtering system
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Community Driven</CardTitle>
                <CardDescription>
                  Connect with fellow food enthusiasts and share your culinary creations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Easy Organization</CardTitle>
                <CardDescription>
                  Keep your recipes organized with tags, categories, and personal collections
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Share</CardTitle>
                <CardDescription>
                  Share your favorite recipes with friends and family
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Fast & Modern</CardTitle>
                <CardDescription>
                  Enjoy a lightning-fast experience built with modern web technologies
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Safe & Secure</CardTitle>
                <CardDescription>
                  Your data and privacy are protected with enterprise-grade security
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Start sharing your recipes and discovering new favorites today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-50 px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link to="/recipes">
              <Button size="lg" variant="outline" className="border-white text-white bg-orange-600 hover:bg-white hover:text-orange-600 px-8 py-3">
                Browse Recipes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About; 