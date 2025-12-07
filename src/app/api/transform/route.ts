import { AI_CONFIG } from '@/config/ai';
import { MODEL_CONFIG } from '@/config/models';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, action, prompt } = await req.json();

    if (!text || !action || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Text, action, and prompt are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_CONFIG.PRIMARY_MODEL}:generateContent?key=${AI_CONFIG.gemini.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Transformation failed');
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return new Response(
      JSON.stringify({ result: result || text }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Transform API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to transform text' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
