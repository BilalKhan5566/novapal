"use client";

import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, AlertCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type SearchResult } from '@/config/ai';
import QuickActions from '@/components/QuickActions';
import { toast } from 'sonner';
import { type PersonalizationSettings } from '@/components/PersonalizePanel';

interface StreamingAnswerProps {
  query: string;
  onSourcesReceived?: (sources: SearchResult[]) => void;
  onFollowupClick?: (question: string) => void;
  answerStyle?: 'concise' | 'detailed';
  onStopStreaming?: () => void;
  personalizationSettings?: PersonalizationSettings;
  onAnswerComplete?: (answer: string, modelUsed?: string) => void;
}

export default function StreamingAnswer({ 
  query, 
  onSourcesReceived, 
  onFollowupClick,
  answerStyle = 'concise',
  onStopStreaming,
  personalizationSettings,
  onAnswerComplete
}: StreamingAnswerProps) {
  const [answer, setAnswer] = useState('');
  const [followups, setFollowups] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('google-gemini-2.0-flash-exp');

  useEffect(() => {
    if (!query) return;

    setAnswer('');
    setFollowups([]);
    setError(null);
    setIsStreaming(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    const fetchAnswer = async () => {
      try {
        const response = await fetch('/api/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query, 
            answerStyle,
            personalization: personalizationSettings
          }),
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status === 503) {
            throw new Error('Service temporarily unavailable. The AI model may be overloaded. Please try again in a few moments.');
          } else {
            throw new Error(errorData.error || 'Failed to generate answer. Please try again.');
          }
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response stream available. Please refresh and try again.');
        }

        let completeAnswer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.replace('data:', '').trim());

              if (data.type === 'sources' && data.sources) {
                onSourcesReceived?.(data.sources);
              } else if (data.type === 'token' && data.content) {
                completeAnswer += data.content;
                setAnswer(prev => prev + data.content);
              } else if (data.type === 'followups' && data.followups) {
                setFollowups(data.followups);
              } else if (data.type === 'done') {
                setIsStreaming(false);
                // Notify parent that answer is complete
                onAnswerComplete?.(completeAnswer, modelUsed);
              } else if (data.type === 'error') {
                setError(data.error || 'An unexpected error occurred while generating the answer.');
                setIsStreaming(false);
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Streaming aborted by user');
          setIsStreaming(false);
          toast.info('Answer generation stopped');
          return;
        }
        
        console.error('Streaming error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
        setIsStreaming(false);
      }
    };

    fetchAnswer();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, answerStyle, personalizationSettings, onSourcesReceived, onAnswerComplete, modelUsed]);

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      onStopStreaming?.();
    }
  };

  const handleQuickAction = (action: string, result: string) => {
    setAnswer(result);
    toast.success(`Answer ${action}ed successfully`);
  };

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-destructive font-medium mb-1 text-sm sm:text-base">Error</p>
            <p className="text-destructive/90 text-xs sm:text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stop button when streaming */}
      {isStreaming && answer && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStopStreaming}
            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Stop generating</span>
          </Button>
        </div>
      )}

      {/* Answer content */}
      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            a: ({ node, ...props }) => (
              <a
                {...props}
                className="text-primary hover:underline font-medium break-words"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
            p: ({ node, ...props }) => (
              <p {...props} className="mb-3 sm:mb-4 last:mb-0 leading-relaxed text-sm sm:text-base" />
            ),
            ul: ({ node, ...props }) => (
              <ul {...props} className="mb-3 sm:mb-4 ml-4 sm:ml-6 list-disc space-y-1 sm:space-y-2 text-sm sm:text-base" />
            ),
            ol: ({ node, ...props }) => (
              <ol {...props} className="mb-3 sm:mb-4 ml-4 sm:ml-6 list-decimal space-y-1 sm:space-y-2 text-sm sm:text-base" />
            ),
            li: ({ node, ...props }) => (
              <li {...props} className="leading-relaxed text-sm sm:text-base" />
            ),
            h1: ({ node, ...props }) => (
              <h1 {...props} className="mb-3 sm:mb-4 mt-4 sm:mt-6 text-xl sm:text-2xl font-bold first:mt-0" />
            ),
            h2: ({ node, ...props }) => (
              <h2 {...props} className="mb-2 sm:mb-3 mt-4 sm:mt-5 text-lg sm:text-xl font-semibold first:mt-0" />
            ),
            h3: ({ node, ...props }) => (
              <h3 {...props} className="mb-2 mt-3 sm:mt-4 text-base sm:text-lg font-semibold first:mt-0" />
            ),
            code: ({ node, inline, ...props }: any) =>
              inline ? (
                <code
                  {...props}
                  className="rounded bg-muted px-1 sm:px-1.5 py-0.5 font-mono text-xs sm:text-sm break-words"
                />
              ) : (
                <code
                  {...props}
                  className="block rounded-lg bg-muted p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto"
                />
              ),
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>

      {/* Streaming indicator */}
      {isStreaming && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
          <span>Generating...</span>
        </div>
      )}
      
      {/* Quick actions */}
      {!isStreaming && answer && (
        <QuickActions answer={answer} onAction={handleQuickAction} />
      )}

      {/* Follow-up questions */}
      {followups.length > 0 && (
        <div className="space-y-2 sm:space-y-3 pt-4 animate-in fade-in duration-300">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Follow-up questions:</p>
          <div className="flex flex-wrap gap-2">
            {followups.map((question, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-secondary/80 transition-colors"
                onClick={() => onFollowupClick?.(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}