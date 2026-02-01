import type { RecipeGenerationParams, ExtractedRecipe } from '@/types';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

function getApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_XAI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('xAI API key not configured');
  }
  return apiKey;
}

export async function generateRecipe(params: RecipeGenerationParams): Promise<ExtractedRecipe> {
  const apiKey = getApiKey();

  const prompt = `You are a helpful recipe assistant. Generate a detailed recipe based on:
- Available ingredients: ${params.ingredients.join(', ') || 'any'}
- Dietary restrictions: ${params.restrictions.join(', ') || 'none'}
- Cuisine preference: ${params.cuisine || 'any'}
- Available time: ${params.time} minutes
- Servings needed: ${params.servings}
- Kid-friendly: ${params.kidFriendly ? 'Yes' : 'No preference'}

Return ONLY valid JSON:
{
  "name": "Recipe Name",
  "description": "Brief description",
  "cuisine": "Cuisine type",
  "prepTime": number,
  "cookTime": number,
  "servings": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "dietaryTags": ["tag1"],
  "ingredients": [{"item": "name", "amount": "qty", "unit": "unit"}],
  "instructions": ["Step 1", "Step 2"],
  "tips": ["Tip"],
  "nutrition": {"calories": 0, "protein": "0g", "carbs": "0g", "fat": "0g"},
  "imageUrl": null,
  "sourceUrl": null
}`;

  const response = await fetch(XAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-3-latest',
      messages: [
        { role: 'system', content: 'You are a helpful recipe assistant. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate recipe');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanJson);
}

export async function extractRecipeFromUrl(url: string): Promise<ExtractedRecipe> {
  const apiKey = getApiKey();

  // Fetch the webpage
  const pageResponse = await fetch(url);
  const html = await pageResponse.text();
  const truncatedHtml = html.slice(0, 15000);

  const prompt = `Extract the recipe from this webpage HTML and return ONLY valid JSON:
{
  "name": "Recipe Name",
  "description": "Brief description",
  "cuisine": "Cuisine type",
  "prepTime": number,
  "cookTime": number,
  "servings": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "dietaryTags": ["tag1"],
  "ingredients": [{"item": "name", "amount": "qty", "unit": "unit"}],
  "instructions": ["Step 1", "Step 2"],
  "tips": [],
  "nutrition": null,
  "imageUrl": "url or null",
  "sourceUrl": "${url}"
}

HTML:
${truncatedHtml}`;

  const response = await fetch(XAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-3-latest',
      messages: [
        { role: 'system', content: 'You are a recipe extraction assistant. Extract recipe details and return valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to extract recipe');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanJson);
}

export async function extractRecipeFromImage(base64Image: string): Promise<ExtractedRecipe> {
  const apiKey = getApiKey();

  const response = await fetch(XAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-2-vision-1212',
      messages: [
        { role: 'system', content: 'You are a recipe extraction assistant. Extract recipe details from images and return valid JSON only.' },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract the recipe from this image. Return ONLY valid JSON:
{
  "name": "Recipe Name",
  "description": "Brief description",
  "cuisine": "Cuisine type",
  "prepTime": number,
  "cookTime": number,
  "servings": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "dietaryTags": [],
  "ingredients": [{"item": "name", "amount": "qty", "unit": "unit"}],
  "instructions": ["Step 1", "Step 2"],
  "tips": [],
  "nutrition": null,
  "imageUrl": null,
  "sourceUrl": null
}`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to extract recipe from image');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanJson);
}
