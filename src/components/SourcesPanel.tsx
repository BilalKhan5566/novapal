"use client";

import { type SearchResult } from '@/config/ai';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface SourcesPanelProps {
  sources: SearchResult[];
  loading?: boolean;
  error?: string;
}

export default function SourcesPanel({ sources, loading, error }: SourcesPanelProps) {
  if (loading) {
    return (
      <div className="space-y-3 animate-in fade-in duration-300">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Sources</h3>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card/50 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-start gap-2 sm:gap-3">
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 sm:h-4 w-3/4" />
                <Skeleton className="h-2.5 sm:h-3 w-full" />
                <Skeleton className="h-2.5 sm:h-3 w-5/6" />
                <Skeleton className="h-2.5 sm:h-3 w-1/2 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-destructive font-medium mb-1 text-sm sm:text-base">Unable to load sources</p>
            <p className="text-destructive/90 text-xs sm:text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Sources</h3>
      {sources.map((source) => (
        <a
          key={source.index}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border border-border bg-card/50 p-3 sm:p-4 backdrop-blur-sm transition-all hover:bg-card/80 hover:border-primary/50 hover:shadow-md group"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              {source.index}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                {source.favicon && (
                  <Image
                    src={source.favicon}
                    alt=""
                    width={16}
                    height={16}
                    className="mt-0.5 flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4"
                    unoptimized
                  />
                )}
                <h4 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {source.title}
                </h4>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5 sm:mb-2 leading-relaxed">
                {source.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="truncate">{new URL(source.url).hostname}</span>
                <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}