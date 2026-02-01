'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles, ChefHat, Camera, Link as LinkIcon, ArrowLeft,
  Clock, Users, X, Check, Upload, Loader2
} from 'lucide-react';
import { Button, Card, Input, Textarea, Badge } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { generateRecipe, extractRecipeFromUrl, extractRecipeFromImage } from '@/lib/xai';
import type { ExtractedRecipe, RecipeInputMode } from '@/types';
import type { Database } from '@/types/database';

type RecipeInsert = Database['public']['Tables']['recipes']['Insert'];

const CUISINES = ['Italian', 'Mexican', 'Chinese', 'Indian', 'American', 'Mediterranean', 'Japanese', 'Thai'];
const RESTRICTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb'];
const TIME_OPTIONS = [15, 30, 45, 60, 90];

export default function GeneratePage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<RecipeInputMode>('ingredients');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<ExtractedRecipe | null>(null);

  // Ingredients mode
  const [ingredients, setIngredients] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [time, setTime] = useState(30);
  const [servings, setServings] = useState(4);
  const [kidFriendly, setKidFriendly] = useState(false);

  // URL mode
  const [recipeUrl, setRecipeUrl] = useState('');

  // Image mode
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const toggleRestriction = (r: string) => {
    setRestrictions(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    );
  };

  const handleGenerateFromIngredients = async () => {
    setLoading(true);
    setError('');
    try {
      const recipe = await generateRecipe({
        ingredients: ingredients.split(',').map(i => i.trim()).filter(Boolean),
        restrictions,
        cuisine,
        time,
        servings,
        kidFriendly,
      });
      setPreview(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractFromUrl = async () => {
    if (!recipeUrl) return;
    setLoading(true);
    setError('');
    try {
      const recipe = await extractRecipeFromUrl(recipeUrl);
      setPreview(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setSelectedImage(event.target?.result as string);
      setLoading(true);
      setError('');
      try {
        const recipe = await extractRecipeFromImage(base64);
        setPreview(recipe);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to extract recipe');
        setSelectedImage(null);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!preview || !user) return;
    setLoading(true);
    try {
      const recipeData: RecipeInsert = {
        user_id: user.id,
        name: preview.name,
        description: preview.description,
        cuisine: preview.cuisine,
        prep_time: preview.prepTime,
        cook_time: preview.cookTime,
        servings: preview.servings,
        difficulty: preview.difficulty,
        dietary_tags: preview.dietaryTags,
        ingredients: preview.ingredients as unknown as Database['public']['Tables']['recipes']['Row']['ingredients'],
        instructions: preview.instructions,
        tips: preview.tips,
        nutrition: preview.nutrition as unknown as Database['public']['Tables']['recipes']['Row']['nutrition'],
        image_url: preview.imageUrl,
        source_url: preview.sourceUrl,
        is_ai_generated: true,
        is_favorite: false,
        category: preview.cuisine || 'Other',
      };
      const { error } = await supabase.from('recipes').insert(recipeData);

      if (error) throw error;
      router.push('/recipes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-lg border-b border-white/5 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <Link href="/dashboard">
            <ArrowLeft className="w-6 h-6 text-text-secondary hover:text-text-primary" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-neon-pink" />
            <h1 className="font-semibold text-text-primary">AI Generator</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {!preview ? (
          <>
            {/* Mode Selector */}
            <div className="flex bg-bg-card rounded-xl p-1">
              {[
                { key: 'ingredients', label: 'Ingredients', icon: ChefHat },
                { key: 'image', label: 'Image', icon: Camera },
                { key: 'url', label: 'URL', icon: LinkIcon },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setMode(key as RecipeInputMode)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                    mode === key ? 'bg-neon-pink text-white' : 'text-text-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Ingredients Mode */}
            {mode === 'ingredients' && (
              <div className="space-y-4">
                <Textarea
                  label="What ingredients do you have?"
                  placeholder="chicken, rice, bell peppers, onion..."
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                />

                <div>
                  <label className="block text-text-secondary text-sm mb-2">Cuisine (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {CUISINES.map((c) => (
                      <button key={c} onClick={() => setCuisine(cuisine === c ? '' : c)}>
                        <Badge variant={cuisine === c ? 'pink' : 'default'}>{c}</Badge>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">Dietary Restrictions</label>
                  <div className="flex flex-wrap gap-2">
                    {RESTRICTIONS.map((r) => (
                      <button key={r} onClick={() => toggleRestriction(r)}>
                        <Badge variant={restrictions.includes(r) ? 'purple' : 'default'}>{r}</Badge>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-text-secondary text-sm mb-2">
                      <Clock className="w-4 h-4 inline mr-1" /> Time
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TIME_OPTIONS.map((t) => (
                        <button key={t} onClick={() => setTime(t)}>
                          <Badge variant={time === t ? 'blue' : 'default'}>{t} min</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-text-secondary text-sm mb-2">
                      <Users className="w-4 h-4 inline mr-1" /> Servings
                    </label>
                    <div className="flex items-center">
                      <button
                        onClick={() => setServings(Math.max(1, servings - 1))}
                        className="bg-bg-card px-4 py-2 rounded-l-xl border border-white/10"
                      >
                        -
                      </button>
                      <div className="bg-bg-card px-6 py-2 border-y border-white/10">
                        {servings}
                      </div>
                      <button
                        onClick={() => setServings(Math.min(12, servings + 1))}
                        className="bg-bg-card px-4 py-2 rounded-r-xl border border-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-text-secondary text-sm mb-2">Kid-Friendly</label>
                    <button
                      onClick={() => setKidFriendly(!kidFriendly)}
                      className={`px-4 py-2 rounded-xl border transition-colors ${
                        kidFriendly ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'bg-bg-card border-white/10 text-text-secondary'
                      }`}
                    >
                      {kidFriendly ? '✓ Yes' : 'No'}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateFromIngredients}
                  loading={loading}
                  icon={<Sparkles className="w-4 h-4" />}
                  className="w-full"
                >
                  Generate Recipe
                </Button>
              </div>
            )}

            {/* Image Mode */}
            {mode === 'image' && (
              <Card className="space-y-4">
                <p className="text-text-secondary text-sm">
                  Upload a photo of a recipe card, cookbook page, or screenshot
                </p>

                {selectedImage ? (
                  <div className="relative">
                    <img src={selectedImage} alt="Recipe" className="w-full rounded-xl" />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center gap-2 hover:border-neon-pink/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-text-secondary" />
                    <span className="text-text-secondary">Tap to upload image</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {loading && (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-neon-pink" />
                    <p className="text-text-secondary mt-2">Analyzing image...</p>
                  </div>
                )}
              </Card>
            )}

            {/* URL Mode */}
            {mode === 'url' && (
              <Card className="space-y-4">
                <p className="text-text-secondary text-sm">
                  Paste a link from any recipe website
                </p>

                <Input
                  placeholder="https://www.allrecipes.com/recipe/..."
                  value={recipeUrl}
                  onChange={(e) => setRecipeUrl(e.target.value)}
                />

                <Button
                  onClick={handleExtractFromUrl}
                  loading={loading}
                  disabled={!recipeUrl}
                  icon={<LinkIcon className="w-4 h-4" />}
                  className="w-full"
                >
                  Extract Recipe
                </Button>
              </Card>
            )}

            {error && (
              <Card className="border-red-500/50 bg-red-500/10">
                <p className="text-red-500 text-sm">{error}</p>
              </Card>
            )}
          </>
        ) : (
          /* Preview */
          <div className="space-y-4">
            <Card>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-text-primary">{preview.name}</h2>
                <button onClick={() => setPreview(null)}>
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <p className="text-text-secondary mb-4">{preview.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="pink">{preview.cuisine}</Badge>
                <Badge variant="blue">{preview.prepTime + preview.cookTime} min</Badge>
                <Badge variant="cyan">{preview.servings} servings</Badge>
                <Badge variant="purple">{preview.difficulty}</Badge>
              </div>

              <h3 className="font-semibold text-text-primary mt-4 mb-2">Ingredients</h3>
              {preview.ingredients.map((ing, i) => (
                <p key={i} className="text-text-secondary text-sm">
                  • {ing.amount} {ing.unit} {ing.item}
                </p>
              ))}

              <h3 className="font-semibold text-text-primary mt-4 mb-2">Instructions</h3>
              {preview.instructions.map((step, i) => (
                <p key={i} className="text-text-secondary text-sm mb-2">
                  {i + 1}. {step}
                </p>
              ))}
            </Card>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setPreview(null)} className="flex-1">
                Regenerate
              </Button>
              <Button onClick={handleSave} loading={loading} icon={<Check className="w-4 h-4" />} className="flex-1">
                Save Recipe
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
