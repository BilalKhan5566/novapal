import { AI_CONFIG, type SearchResult } from '@/config/ai';
import { MODEL_CONFIG, isQuotaExceededError } from '@/config/models';

type PersonalizationSettings = {
  tone?: 'neutral' | 'friendly' | 'formal';
  answerLength?: 'concise' | 'normal' | 'detailed';
  language?: 'english';
};

export async function streamGeminiAnswer(
  query: string,
  sources: SearchResult[],
  answerStyle: 'concise' | 'detailed' = 'concise',
  onChunk: (chunk: string) => void,
  personalization?: PersonalizationSettings
): Promise<{ followups: string[]; modelUsed: string }> {
  const context = sources
    .map((source, idx) => `[${idx + 1}] ${source.title}\n${source.description}\nURL: ${source.url}`)
    .join('\n\n');

  // Build personalized tone instructions
  const toneInstructions = personalization?.tone === 'friendly'
    ? 'Use a warm, conversational, and approachable tone. Be helpful and engaging.'
    : personalization?.tone === 'formal'
    ? 'Use professional, precise language. Maintain a formal and academic tone.'
    : 'Use a balanced, neutral tone. Be clear and informative without being overly casual or formal.';

  // Use personalization answer length if provided, otherwise use answerStyle
  const effectiveAnswerLength = personalization?.answerLength || answerStyle;
  const styleInstructions = effectiveAnswerLength === 'concise'
    ? 'Provide a clear, concise answer. Focus on the most important information. Keep your response brief but comprehensive.'
    : effectiveAnswerLength === 'detailed'
    ? 'Provide a detailed, comprehensive answer. Include relevant context, examples, and nuances. Be thorough and explanatory.'
    : 'Provide a balanced answer with moderate detail. Include key information and some context without being overly brief or exhaustive.';

  const languageInstructions = personalization?.language === 'english'
    ? 'Respond in English.'
    : 'Respond in English.';

  const prompt = `You are a helpful AI assistant that provides accurate, comprehensive answers based on search results. 

Tone: ${toneInstructions}
${languageInstructions}

User Query: ${query}

Search Results:
${context}

Instructions:
1. ${styleInstructions}
2. Use inline citations like [1], [2], etc. when referencing specific sources
3. Use markdown formatting for better readability
4. If the search results don't fully answer the query, acknowledge the limitations
5. Structure your answer with clear headings and bullet points where appropriate

Answer:`;

  // Try primary model first
  let modelUsed = MODEL_CONFIG.PRIMARY_MODEL;
  let lastError: any = null;

  try {
    const followups = await callGeminiStream(MODEL_CONFIG.PRIMARY_MODEL, prompt, onChunk);
    return { followups, modelUsed };
  } catch (error) {
    console.error('Primary model error:', error);
    lastError = error;

    // Check if we should fallback
    if (MODEL_CONFIG.USE_FALLBACK_WHEN_QUOTA_EXCEEDED && isQuotaExceededError(error)) {
      console.log(`Quota exceeded for ${MODEL_CONFIG.PRIMARY_MODEL}, falling back to ${MODEL_CONFIG.FALLBACK_MODEL}`);
      
      try {
        modelUsed = MODEL_CONFIG.FALLBACK_MODEL;
        const followups = await callGeminiStream(MODEL_CONFIG.FALLBACK_MODEL, prompt, onChunk);
        return { followups, modelUsed };
      } catch (fallbackError) {
        console.error('Fallback model error:', fallbackError);
        throw new Error('Both primary and fallback models failed. Please try again later.');
      }
    }

    // If not a quota error or fallback disabled, throw original error
    throw new Error('Failed to generate AI answer');
  }
}

async function callGeminiStream(
  model: string,
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<string[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:streamGenerateContent?key=${AI_CONFIG.gemini.apiKey}`,
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
          temperature: AI_CONFIG.gemini.temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: AI_CONFIG.gemini.maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw {
      status: response.status,
      message: `Gemini API error: ${response.statusText}`,
      details: errorText,
    };
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body');
  }

  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // Parse JSON array format from Gemini streaming API
    const lines = buffer.split('\n');
    
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line || line === '[' || line === ']') continue;
      
      const cleanLine = line.endsWith(',') ? line.slice(0, -1) : line;
      
      try {
        const json = JSON.parse(cleanLine);
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          fullText += text;
          onChunk(text);
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
    
    buffer = lines[lines.length - 1];
  }
  
  // Process any remaining buffer
  if (buffer.trim() && buffer !== ']') {
    const cleanLine = buffer.trim().endsWith(',') ? buffer.trim().slice(0, -1) : buffer.trim();
    try {
      const json = JSON.parse(cleanLine);
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        fullText += text;
        onChunk(text);
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }

  const followups = generateFollowUpQuestions(prompt, fullText);
  return followups;
}

function generateFollowUpQuestions(originalQuery: string, answer: string): string[] {
  // Generate contextual follow-up questions based on the query and answer
  const followups = [
    `What are the latest developments related to ${originalQuery}?`,
    `Can you explain more details about ${originalQuery}?`,
    `What are the alternatives or related topics to ${originalQuery}?`,
  ];

  return followups.slice(0, 3);
}

export async function rephraseQuery(query: string): Promise<string> {
  try {
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
                  text: `Rephrase the following search query to be more specific and optimized for web search. Return only the rephrased query without any explanation or quotes:\n\n${query}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (!response.ok) {
      return query;
    }

    const data = await response.json();
    const rephrasedQuery = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return rephrasedQuery || query;
  } catch (error) {
    console.error('Query rephrasing error:', error);
    return query;
  }
}