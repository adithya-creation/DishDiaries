import { useQuery } from '@tanstack/react-query';
import { recipeAPI } from '@/lib/api';

interface UseRecipesParams {
  search?: string;
  difficulty?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export const useRecipes = (params: UseRecipesParams = {}) => {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => recipeAPI.getRecipes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipeAPI.getRecipe(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 