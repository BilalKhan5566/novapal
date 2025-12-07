import { AI_CONFIG, type GoogleCSEResponse, type SearchResult } from '@/config/ai';

/**
 * Search the web using Google Custom Search JSON API
 * @param query - The search query string
 * @returns Array of top 5 search results in normalized format
 */
export async function searchWebGoogleCSE(query: string): Promise<SearchResult[]> {
  try {
    const apiKey = AI_CONFIG.googleCSE.apiKey;
    const cx = AI_CONFIG.googleCSE.cx;

    if (!apiKey || !cx) {
      console.error('Missing Google CSE credentials');
      return [];
    }

    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('cx', cx);
    url.searchParams.set('q', query);
    url.searchParams.set('num', '5');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Google CSE API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: GoogleCSEResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.warn('No search results found');
      return [];
    }

    return data.items.slice(0, 5).map((item, index) => ({
      title: item.title,
      url: item.link,
      description: item.snippet,
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}&sz=32`,
      index: index + 1,
    }));
  } catch (error) {
    console.error('Google CSE search error:', error);
    return [];
  }
}