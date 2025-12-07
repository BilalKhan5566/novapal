export const AI_CONFIG = {
  // Google Gemini Configuration
  gemini: {
    apiKey: process.env.GOOGLE_GEMINI_API_KEY || '',
    model: 'gemini-2.5-flash',
    maxTokens: 2048,
    temperature: 0.7,
  },
  
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
    maxTokens: 2048,
    temperature: 0.7,
  },
  
  // Google Custom Search Configuration
  googleCSE: {
    apiKey: process.env.GOOGLE_CSE_API_KEY || '',
    cx: process.env.GOOGLE_CSE_CX || '',
  },
};

export type SearchResult = {
  title: string;
  url: string;
  description: string;
  favicon?: string;
  index: number;
};

export type AnswerStreamChunk = {
  type: 'token' | 'sources' | 'followups' | 'done' | 'error';
  content?: string;
  sources?: SearchResult[];
  followups?: string[];
  error?: string;
};

export type GoogleCSEResponse = {
  items?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
};