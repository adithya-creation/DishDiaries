import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { recipeAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  remarks?: string;
}

interface Instruction {
  step: number;
  description: string;
}

export default function CreateRecipe() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Predefined units for ingredients
  const predefinedUnits = [
    'cup', 'cups', 'tablespoon', 'teaspoon', 'gram', 'kilogram', 'ounce', 'pound',
    'milliliter', 'liter', 'pinch', 'dash', 'bunch', 'sprig', 'clove',
    'slice', 'piece', 'whole', 'half', 'quarter', 'can', 'jar', 'packet',
    'Other'
  ];

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('30');
  const [cookTime, setCookTime] = useState('45');
  const [servings, setServings] = useState('4');
  const [difficulty, setDifficulty] = useState('Medium');
  const [dietaryPreference, setDietaryPreference] = useState('Vegetarian');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'link'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '', unit: '', remarks: '' }
  ]);
  const [instructions, setInstructions] = useState<Instruction[]>([
    { step: 1, description: '' }
  ]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }



  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '', remarks: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = ingredients.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, { step: instructions.length + 1, description: '' }]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updated = instructions
        .filter((_, i) => i !== index)
        .map((instruction, i) => ({ ...instruction, step: i + 1 }));
      setInstructions(updated);
    }
  };

  const updateInstruction = (index: number, description: string) => {
    const updated = instructions.map((instruction, i) => 
      i === index ? { ...instruction, description } : instruction
    );
    setInstructions(updated);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Enhanced validation with better error messages
    if (!title.trim()) {
      toast.error('Please enter a recipe title');
      setLoading(false);
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please enter a recipe description');
      setLoading(false);
      return;
    }
    
    if (!prepTime || prepTime <= 0) {
      toast.error('Please enter a valid prep time (greater than 0)');
      setLoading(false);
      return;
    }
    
    if (!cookTime || cookTime <= 0) {
      toast.error('Please enter a valid cook time (greater than 0)');
      setLoading(false);
      return;
    }
    
    if (!servings || servings <= 0) {
      toast.error('Please enter a valid number of servings (greater than 0)');
      setLoading(false);
      return;
    }
    
    if (!difficulty) {
      toast.error('Please select a difficulty level');
      setLoading(false);
      return;
    }
    
    if (!dietaryPreference) {
      toast.error('Please select a dietary preference');
      setLoading(false);
      return;
    }
    
    if (imageMode === 'upload' && !imageFile) {
      toast.error('Please upload an image file');
      setLoading(false);
      return;
    }
    if (imageMode === 'link' && !imageUrl.trim()) {
      toast.error('Please provide an image URL');
      setLoading(false);
      return;
    }

    // Check ingredients
    const invalidIngredients = ingredients.filter(ing => !ing.name.trim() || !ing.amount.trim() || !ing.unit.trim());
    if (invalidIngredients.length > 0) {
      toast.error('Please complete all ingredient fields (name, amount, and unit are required)');
      setLoading(false);
      return;
    }

    // Check instructions
    const invalidInstructions = instructions.filter(inst => !inst.description.trim());
    if (invalidInstructions.length > 0) {
      toast.error('Please complete all instruction descriptions');
      setLoading(false);
      return;
    }

    // Debug: Log the values being submitted
    console.log('Form values being submitted:', {
      title: title.trim(),
      description: description.trim(),
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings),
      difficulty,
      dietaryPreference,
      imageMode,
      imageFile: imageFile?.name,
      imageUrl: imageUrl.trim(),
      ingredientsCount: ingredients.length,
      instructionsCount: instructions.length
    });

    // Build payload
    const basePayload = {
      title: title.trim(),
      description: description.trim(),
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings),
      difficulty,
      dietaryPreference,
      tags,
      ingredients: ingredients
        .filter(ing => ing.name.trim() && ing.amount.trim() && ing.unit.trim())
        .map(ing => ({
          name: ing.name.trim(),
          amount: ing.amount.trim(),
          unit: ing.unit.trim(),
          remarks: ing.remarks?.trim() || ''
        })),
      instructions: instructions
        .filter(inst => inst.description.trim())
        .map((inst, index) => ({
          step: index + 1,
          description: inst.description.trim()
        }))
    };

    let requestBody: any = basePayload;
    let useFormData = false;
    if (imageMode === 'upload') {
      const payload = new FormData();
      Object.entries(basePayload).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          payload.append(key, JSON.stringify(value));
        } else if (typeof value === 'object' && value !== null) {
          payload.append(key, JSON.stringify(value));
        } else {
          payload.append(key, String(value ?? ''));
        }
      });
      if (imageFile) payload.append('image', imageFile);
      requestBody = payload;
      useFormData = true;
    } else {
      requestBody = { ...basePayload, imageUrl: imageUrl.trim() };
    }

    try {
      const response = await recipeAPI.createRecipe(requestBody);
      
      if (response.success) {
        toast.success('Recipe created successfully!');
        navigate(`/recipe/${response.data.recipe._id}`);
      }
    } catch (error: any) {
      console.error('Recipe creation error:', error.response?.status, error.response?.data);
      
      // Check if the error is a server error but recipe might have been created
      if (error.response?.status === 500) {
        // Wait a moment and try to refetch recipes to see if it was created
        setTimeout(async () => {
          try {
            const recipesResponse = await recipeAPI.getRecipes();
            const latestRecipe = recipesResponse.data.recipes[0];
            if (latestRecipe && latestRecipe.title === basePayload.title) {
              toast.success('Recipe created successfully!');
              navigate(`/recipe/${latestRecipe._id}`);
              return;
            }
          } catch (refetchError) {
            console.error('Refetch error:', refetchError);
          }
          
          // If we get here, show the error
          toast.error('There was a server error, but your recipe may have been created. Please check your recipes.');
        }, 1000);
        return;
      }
      
      let message = 'Failed to create recipe';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.response?.data?.errors) {
        // Handle validation errors array
        const errors = error.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          message = errors.map(err => err.message || err.field).join(', ');
        }
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
      setLoading(false); // Ensure loading is reset on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/my-recipes')}
            >
              My Recipes
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Recipe
          </h1>
          <p className="text-gray-600">
            Share your culinary creation with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Recipe Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Grandma's Chocolate Chip Cookies"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your recipe..."
                  required
                  rows={3}
                />
              </div>
              
              <div className="grid gap-3">
                <Label>Recipe Image *</Label>
                <Tabs value={imageMode} onValueChange={(v) => setImageMode(v as 'upload' | 'link')}>
                  <TabsList>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="link">Link</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </TabsContent>
                  <TabsContent value="link">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Recipe Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Recipe Stats</CardTitle>
                  <CardDescription>Key information about your recipe</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Prep Time */}
                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-orange-700 mb-1">Prep Time</h3>
                      <div className="flex items-center justify-center space-x-2">
                        <Input
                          type="number"
                          value={prepTime}
                          onChange={(e) => setPrepTime(e.target.value)}
                          min="0"
                          className="w-20 text-center font-semibold text-lg"
                          placeholder="0"
                          required
                        />
                        <span className="text-orange-600 font-medium">min</span>
                      </div>
                    </div>

                    {/* Cook Time */}
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-blue-700 mb-1">Cook Time</h3>
                      <div className="flex items-center justify-center space-x-2">
                        <Input
                          type="number"
                          value={cookTime}
                          onChange={(e) => setCookTime(e.target.value)}
                          min="0"
                          className="w-20 text-center font-semibold text-lg"
                          placeholder="0"
                          required
                        />
                        <span className="text-blue-600 font-medium">min</span>
                      </div>
                    </div>

                    {/* Servings */}
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-green-700 mb-1">Servings</h3>
                      <div className="flex items-center justify-center space-x-2">
                        <Input
                          type="number"
                          value={servings}
                          onChange={(e) => setServings(e.target.value)}
                          min="1"
                          className="w-20 text-center font-semibold text-lg"
                          placeholder="1"
                          required
                        />
                        <span className="text-green-600 font-medium">people</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select value={difficulty} onValueChange={setDifficulty} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dietaryPreference">Dietary Preference *</Label>
                  <Select value={dietaryPreference} onValueChange={setDietaryPreference} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                      <SelectItem value="Vegan">Vegan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add tags to help others find your recipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>List all ingredients needed for your recipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Ingredient</Label>
                      <Input
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                        placeholder="e.g., Coriander Powder"
                      />
                    </div>
                    <div className="w-20">
                      <Label>Amount</Label>
                      <Input
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                        placeholder="2"
                      />
                    </div>
                    <div className="w-32">
                      <Label>Unit</Label>
                      {ingredient.unit === 'Other' ? (
                        <Input
                          value={ingredient.unit === 'Other' ? '' : ingredient.unit}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          placeholder="Custom unit"
                        />
                      ) : (
                        <Select value={ingredient.unit} onValueChange={(value) => updateIngredient(index, 'unit', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {predefinedUnits.map(unit => (
                              <SelectItem key={unit} value={unit}>
                                {unit.charAt(0).toUpperCase() + unit.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="w-32">
                      <Label>Remarks (Optional)</Label>
                      <Input
                        value={ingredient.remarks}
                        onChange={(e) => updateIngredient(index, 'remarks', e.target.value)}
                        placeholder="e.g., Dhania"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button type="button" onClick={addIngredient} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>Step-by-step cooking instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="w-12 h-10 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center text-sm font-medium text-orange-800 dark:text-orange-300 mt-1">
                      {instruction.step}
                    </div>
                    <div className="flex-1">
                      <Textarea
                        value={instruction.description}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder="Describe this step..."
                        rows={2}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      disabled={instructions.length === 1}
                      className="mt-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button type="button" onClick={addInstruction} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Recipe'
              )}
            </Button>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
} 