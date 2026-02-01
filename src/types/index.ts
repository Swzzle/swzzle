export interface Ingredient {
  item: string;
  amount: string;
  unit: string;
}

export interface Nutrition {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dietaryTags: string[];
  ingredients: Ingredient[];
  instructions: string[];
  tips: string[];
  nutrition: Nutrition | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  isFavorite: boolean;
  isAiGenerated: boolean;
  notes: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeGenerationParams {
  ingredients: string[];
  restrictions: string[];
  cuisine: string;
  time: number;
  servings: number;
  kidFriendly: boolean;
}

export interface ExtractedRecipe {
  name: string;
  description: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dietaryTags: string[];
  ingredients: Ingredient[];
  instructions: string[];
  tips: string[];
  nutrition: Nutrition | null;
  imageUrl: string | null;
  sourceUrl: string | null;
}

export type RecipeInputMode = 'ingredients' | 'image' | 'url';
