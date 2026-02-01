'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChefHat, Sparkles, BookOpen, Calendar, ShoppingCart,
  Package, UtensilsCrossed, Settings, Plus, Heart, Clock
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '@/types';

const navItems = [
  { href: '/generate', icon: Sparkles, label: 'AI Generate', color: 'text-neon-pink' },
  { href: '/recipes', icon: BookOpen, label: 'Recipes', color: 'text-neon-blue' },
  { href: '/planner', icon: Calendar, label: 'Meal Plan', color: 'text-neon-cyan' },
  { href: '/shopping', icon: ShoppingCart, label: 'Shopping', color: 'text-neon-purple' },
  { href: '/pantry', icon: Package, label: 'Pantry', color: 'text-yellow-500' },
  { href: '/leftovers', icon: UtensilsCrossed, label: 'Leftovers', color: 'text-orange-500' },
];

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userName, setUserName] = useState('Chef');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    // Load recent recipes
    const { data: recipesData } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);

    if (recipesData) {
      setRecipes(recipesData.map(r => ({
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

    // Load user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('user_name')
      .single();

    if (settings?.user_name) {
      setUserName(settings.user_name);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-lg border-b border-white/5 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neon-pink/20 rounded-full flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-neon-pink" />
            </div>
            <div>
              <h1 className="font-semibold text-text-primary">Hey, {userName}!</h1>
              <p className="text-sm text-text-secondary">What&apos;s cooking today?</p>
            </div>
          </div>
          <Link href="/settings">
            <Settings className="w-6 h-6 text-text-secondary hover:text-text-primary transition-colors" />
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {navItems.slice(0, 3).map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="flex flex-col items-center py-4 hover:border-white/20 transition-colors">
                <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
                <span className="text-xs text-text-secondary">{item.label}</span>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {navItems.slice(3).map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="flex flex-col items-center py-4 hover:border-white/20 transition-colors">
                <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
                <span className="text-xs text-text-secondary">{item.label}</span>
              </Card>
            </Link>
          ))}
        </div>

        {/* Generate CTA */}
        <Link href="/generate">
          <Card className="bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 border-neon-pink/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neon-pink/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-neon-pink" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">AI Recipe Generator</h3>
                <p className="text-sm text-text-secondary">Create from ingredients, photos, or URLs</p>
              </div>
              <Plus className="w-5 h-5 text-neon-pink" />
            </div>
          </Card>
        </Link>

        {/* Recent Recipes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-text-primary">Recent Recipes</h2>
            <Link href="/recipes" className="text-sm text-neon-pink">View all</Link>
          </div>

          {recipes.length === 0 ? (
            <Card className="text-center py-8">
              <BookOpen className="w-8 h-8 text-text-secondary mx-auto mb-2" />
              <p className="text-text-secondary">No recipes yet</p>
              <Link href="/generate">
                <Button size="sm" className="mt-4">Create your first recipe</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  <Card className="hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-text-primary">{recipe.name}</h3>
                          {recipe.isFavorite && <Heart className="w-4 h-4 text-neon-pink fill-neon-pink" />}
                        </div>
                        <p className="text-sm text-text-secondary line-clamp-1 mt-1">{recipe.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="pink">{recipe.cuisine || 'Other'}</Badge>
                          <Badge variant="blue">
                            <Clock className="w-3 h-3 mr-1" />
                            {recipe.prepTime + recipe.cookTime} min
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bg-secondary/90 backdrop-blur-lg border-t border-white/5 px-4 py-2 safe-area-pb">
        <div className="max-w-lg mx-auto flex justify-around">
          <Link href="/dashboard" className="flex flex-col items-center py-2 text-neon-pink">
            <ChefHat className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/generate" className="flex flex-col items-center py-2 text-text-secondary hover:text-text-primary">
            <Sparkles className="w-6 h-6" />
            <span className="text-xs mt-1">Generate</span>
          </Link>
          <Link href="/recipes" className="flex flex-col items-center py-2 text-text-secondary hover:text-text-primary">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs mt-1">Recipes</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center py-2 text-text-secondary hover:text-text-primary">
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
