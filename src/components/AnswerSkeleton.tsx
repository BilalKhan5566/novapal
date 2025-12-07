"use client";

import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

export default function AnswerSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden animate-in fade-in duration-300">
      <div className="border-b border-border/40 px-6 py-3 bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>NovaPal · AI-powered answers from the live web</span>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[90%]" />
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[88%]" />
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-4 w-[96%]" />
          <Skeleton className="h-4 w-[85%]" />
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-75" />
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150" />
          <span className="text-sm text-muted-foreground ml-2">Generating answer...</span>
        </div>
      </div>
    </div>
  );
}
