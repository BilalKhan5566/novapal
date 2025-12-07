"use client";

import { User, Sparkles } from 'lucide-react';
import StreamingAnswer from '@/components/StreamingAnswer';
import { type SearchResult } from '@/config/ai';
import { type PersonalizationSettings } from '@/components/PersonalizePanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ConversationViewProps {
  query: string;
  onSourcesReceived?: (sources: SearchResult[]) => void;
  onFollowupClick?: (question: string) => void;
  personalizationSettings?: PersonalizationSettings;
  onStopStreaming?: () => void;
  isGenerating?: boolean;
  onAnswerComplete?: (answer: string, modelUsed?: string) => void;
}

export default function ConversationView({
  query,
  onSourcesReceived,
  onFollowupClick,
  personalizationSettings,
  onStopStreaming,
  isGenerating = false,
  onAnswerComplete
}: ConversationViewProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* User Message */}
      <div className="flex gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div className="flex-1 pt-1">
          <p className="text-sm sm:text-base leading-relaxed">{query}</p>
        </div>
      </div>

      {/* NovaPal Response */}
      <div className="flex gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-teal-500/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div className="flex-1">
          {isGenerating ? (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="h-4 bg-muted rounded-md w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
              <div className="h-4 bg-muted rounded-md w-5/6 animate-pulse" />
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-4">
                <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Generating answer…</span>
              </div>
            </div>
          ) : (
            <StreamingAnswer
              query={query}
              answerStyle={personalizationSettings?.answerLength === 'concise' ? 'concise' : 'detailed'}
              personalizationSettings={personalizationSettings}
              onSourcesReceived={onSourcesReceived}
              onFollowupClick={onFollowupClick}
              onStopStreaming={onStopStreaming}
              onAnswerComplete={onAnswerComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}