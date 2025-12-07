import { searchWebGoogleCSE } from '@/lib/search';
import { streamGeminiAnswer } from '@/lib/llm';
import { NextRequest } from 'next/server';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  userLimit.count++;
  return { allowed: true };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let modelUsed = 'unknown';
  let errorType: string | null = null;

  try {
    const { query, answerStyle = 'concise', personalization } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = checkRateLimit(clientIP);

    if (!rateLimitResult.allowed) {
      console.log(`[RATE LIMIT] IP: ${clientIP}, Query: "${query.substring(0, 50)}..."`);
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfter} seconds.` 
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter)
          } 
        }
      );
    }

    console.log(`[REQUEST] Query: "${query}", Style: ${answerStyle}, IP: ${clientIP}, Personalization:`, personalization);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Fetch search results from Google Custom Search
          const searchStartTime = Date.now();
          const sources = await searchWebGoogleCSE(query);
          const searchDuration = Date.now() - searchStartTime;
          
          console.log(`[SEARCH] Duration: ${searchDuration}ms, Results: ${sources.length}`);
          
          // Send sources to client (even if empty)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'sources', sources })}\n\n`
            )
          );

          // If no sources found, still proceed with LLM but it will have no context
          if (sources.length === 0) {
            console.warn('[WARNING] No search results available for query:', query);
          }

          // Step 2: Stream AI answer with citations
          const llmStartTime = Date.now();
          const { followups, modelUsed: model } = await streamGeminiAnswer(
            query,
            sources,
            answerStyle,
            (chunk: string) => {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'token', content: chunk })}\n\n`
                )
              );
            },
            personalization
          );
          const llmDuration = Date.now() - llmStartTime;
          modelUsed = model;

          console.log(`[LLM] Duration: ${llmDuration}ms, Model: ${modelUsed}`);

          // Step 3: Send model used information
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'modelUsed', model: modelUsed })}\n\n`
            )
          );

          // Step 4: Send follow-up questions
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'followups', followups })}\n\n`
            )
          );

          // Step 5: Signal completion
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          );

          const totalDuration = Date.now() - startTime;
          console.log(`[SUCCESS] Total duration: ${totalDuration}ms, Model: ${modelUsed}`);

          controller.close();
        } catch (error) {
          errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          console.error(`[ERROR] Type: ${errorType}, Message: ${errorMessage}`);
          
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                type: 'error', 
                error: errorMessage
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
    const totalDuration = Date.now() - startTime;
    
    console.error(`[FATAL ERROR] Type: ${errorType}, Duration: ${totalDuration}ms, Error:`, error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}