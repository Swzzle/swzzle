'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Heart, Clock, Plus, Search } from 'lucide-react';
import { Card, Button, Badge, Input } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '@/types';
import type { Database } from '@/types/database';

type RecipeRow = Database['public']['Tables']['recipes']['Row'];

export default function RecipesPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadRecipes();
  }, [user]);

  const loadRecipes = async () => {
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false }) as { data: RecipeRow[] | null };

    if (data) {
      setRecipes(data.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        cuisine: r.cuisine || '',
        prepTime: r.prep_time,
        cookTime: r.cook_time,
        servings: r.servings,
        difficulty: r.difficulty as 'Easy' | 'Medium' | 'Hard',
        dietaryTags: r.dietary_tags || [],
        ingredients: (r.ingredients as any) || [],
        instructions: r.instructions || [],
        tips: r.tips || [],
        nutrition: r.nutrition as any,
        imageUrl: r.image_url,
        sourceUrl: r.source_url,
        isFavorite: r.is_favorite,
        isAiGenerated: r.is_ai_generated,
        notes: r.notes || '',
        category: r.category,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })));
    }
    setLoading(false);
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    await supabase.from('recipes').update({ is_favorite: !current } as Database['public']['Tables']['recipes']['Update']).eq('id', id);
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !current } : r));
  };

  const filtered = recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-primary pb-6">
      <header className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-lg border-b border-white/5 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 text-text-secondary hover:text-text-primary" />
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <BookOpen className="w-6 h-6 text-neon-blue" />
            <h1 className="font-semibold text-text-primary">Recipes</h1>
          </div>
          <Link href="/generate">
            <Plus className="w-6 h-6 text-neon-pink" />
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <Input
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />

        {loading ? (
          <div className="text-center py-12 text-text-secondary">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-8">
            <BookOpen className="w-8 h-8 text-text-secondary mx-auto mb-2" />
            <p className="text-text-secondary">
              {search ? 'No recipes match your search' : 'No recipes yet'}
            </p>
            <Link href="/generate">
              <Button size="sm" className="mt-4">Create a recipe</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((recipe) => (
              <Card key={recipe.id} className="hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between">
                  <Link href={`/recipes/${recipe.id}`} className="flex-1">
                    <h3 className="font-medium text-text-primary">{recipe.name}</h3>
                    <p className="text-sm text-text-secondary line-clamp-1 mt-1">{recipe.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="pink">{recipe.cuisine || 'Other'}</Badge>
                      <Badge variant="blue">
                        <Clock className="w-3 h-3 mr-1" />
                        {recipe.prepTime + recipe.cookTime} min
                      </Badge>
                    </div>
                  </Link>
                  <button onClick={() => toggleFavorite(recipe.id, recipe.isFavorite)}>
                    <Heart
                      className={`w-5 h-5 ${recipe.isFavorite ? 'text-neon-pink fill-neon-pink' : 'text-text-secondary'}`}
                    />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
