import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, X, ArrowLeft, Save } from 'lucide-react';
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

interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  tags: string[];
  imageUrl: string;
  nutrition?: any;
  isPublic: boolean;
  author: string;
}

export default function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

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
  const [imageUrl, setImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '', unit: '', remarks: '' }
  ]);
  const [instructions, setInstructions] = useState<Instruction[]>([
    { step: 1, description: '' }
  ]);
  const [isPublic, setIsPublic] = useState(true);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getRecipe(id!);
      
      if (response.success) {
        const recipeData = response.data.recipe;
        
        // Check if user is the author
        if (recipeData.author._id !== user?._id) {
          toast.error('You are not authorized to edit this recipe');
          navigate('/my-recipes');
          return;
        }

        setRecipe(recipeData);
        setTitle(recipeData.title);
        setDescription(recipeData.description);
        setPrepTime(recipeData.prepTime.toString());
        setCookTime(recipeData.cookTime.toString());
        setServings(recipeData.servings.toString());
        setDifficulty(recipeData.difficulty);
        setImageUrl(recipeData.imageUrl);
        setTags(recipeData.tags || []);
        setIngredients(recipeData.ingredients || [{ name: '', amount: '', unit: '', remarks: '' }]);
        setInstructions(recipeData.instructions || [{ step: 1, description: '' }]);
        setIsPublic(recipeData.isPublic);
      }
    } catch (error: any) {
      console.error('Error fetching recipe:', error);
      toast.error('Failed to load recipe');
      navigate('/my-recipes');
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);

    // Validation
    if (!title.trim()) {
      toast.error('Please enter a recipe title');
      setSaving(false);
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please enter a recipe description');
      setSaving(false);
      return;
    }
    
    if (!prepTime || prepTime <= 0) {
      toast.error('Please enter a valid prep time (greater than 0)');
      setSaving(false);
      return;
    }
    
    if (!cookTime || cookTime <= 0) {
      toast.error('Please enter a valid cook time (greater than 0)');
      setSaving(false);
      return;
    }
    
    if (!servings || servings <= 0) {
      toast.error('Please enter a valid number of servings (greater than 0)');
      setSaving(false);
      return;
    }
    
    if (!difficulty) {
      toast.error('Please select a difficulty level');
      setSaving(false);
      return;
    }
    
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      setSaving(false);
      return;
    }

    // Check ingredients
    const invalidIngredients = ingredients.filter(ing => !ing.name.trim() || !ing.amount.trim() || !ing.unit.trim());
    if (invalidIngredients.length > 0) {
      toast.error('Please complete all ingredient fields (name, amount, and unit are required)');
      setSaving(false);
      return;
    }

    // Check instructions
    const invalidInstructions = instructions.filter(inst => !inst.description.trim());
    if (invalidInstructions.length > 0) {
      toast.error('Please complete all instruction descriptions');
      setSaving(false);
      return;
    }

    const recipeData = {
      title: title.trim(),
      description: description.trim(),
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings),
      difficulty,
      imageUrl: imageUrl.trim(),
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
        })),
      isPublic
    };

    try {
      const response = await recipeAPI.updateRecipe(id!, recipeData);
      
      if (response.success) {
        toast.success('Recipe updated successfully!');
        navigate(`/recipe/${id}`);
      }
    } catch (error: any) {
      console.error('Recipe update error:', error);
      
      let message = 'Failed to update recipe';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Recipe not found</p>
          <Button onClick={() => navigate('/my-recipes')} className="mt-4">
            Back to My Recipes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-recipes')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Recipes
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Recipe
          </h1>
          <p className="text-gray-600">
            Update your culinary creation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your recipe details</CardDescription>
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
              
              <div>
                <Label htmlFor="imageUrl">Image URL *</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="isPublic">Make recipe public</Label>
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
            <Button type="button" variant="outline" onClick={() => navigate('/my-recipes')}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
}
