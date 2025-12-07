/**
 * Model configuration for LLM fallback system
 */

export const MODEL_CONFIG = {
  // Primary model - used by default for all requests
  PRIMARY_MODEL: 'gemini-2.5-flash',
  
  // Fallback model - used when primary model quota is exceeded
  FALLBACK_MODEL: 'gemini-2.0-flash-lite',
  
  // Enable automatic fallback when quota/rate limits are hit
  USE_FALLBACK_WHEN_QUOTA_EXCEEDED: true,
} as const;

/**
 * Check if an error indicates quota/rate limit exceeded
 */
export function isQuotaExceededError(error: any): boolean {
  // Check for HTTP 429 (Too Many Requests)
  if (error?.status === 429) return true;
  
  // Check for quota-related error messages
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorText = JSON.stringify(error).toLowerCase();
  
  return (
    errorMessage.includes('quota') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('exceeded') ||
    errorText.includes('quota') ||
    errorText.includes('rate_limit') ||
    errorText.includes('resource_exhausted')
  );
}