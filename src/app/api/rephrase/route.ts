import { rephraseQuery } from '@/lib/llm';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rephrased = await rephraseQuery(query);

    return new Response(
      JSON.stringify({ rephrased }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Rephrase API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to rephrase query', rephrased: query }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
