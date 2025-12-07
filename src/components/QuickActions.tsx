"use client";

import { useState } from 'react';
import { Copy, Minimize2, Maximize2, Lightbulb, Languages, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QuickActionsProps {
  answer: string;
  onAction: (action: string, result: string) => void;
}

export default function QuickActions({ answer, onAction }: QuickActionsProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      toast.success('Answer copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleTransform = async (action: 'shorten' | 'expand' | 'simplify' | 'translate') => {
    setLoading(action);
    try {
      const prompts = {
        shorten: `Make this answer more concise while keeping key information:\n\n${answer}`,
        expand: `Provide a more detailed and comprehensive version of this answer:\n\n${answer}`,
        simplify: `Explain this answer in simple terms that anyone can understand:\n\n${answer}`,
        translate: `Translate this answer to Urdu:\n\n${answer}`,
      };

      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: answer, 
          action,
          prompt: prompts[action]
        }),
      });

      if (!response.ok) {
        throw new Error('Transformation failed');
      }

      const data = await response.json();
      onAction(action, data.result);
      toast.success(`Answer ${action === 'translate' ? 'translated' : action === 'simplify' ? 'simplified' : action}ed`);
    } catch (error) {
      toast.error(`Failed to ${action} answer`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        disabled={loading !== null}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleTransform('shorten')}
        disabled={loading !== null}
        className="gap-2"
      >
        <Minimize2 className="h-4 w-4" />
        {loading === 'shorten' ? 'Shortening...' : 'Shorten'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleTransform('expand')}
        disabled={loading !== null}
        className="gap-2"
      >
        <Maximize2 className="h-4 w-4" />
        {loading === 'expand' ? 'Expanding...' : 'Expand'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleTransform('simplify')}
        disabled={loading !== null}
        className="gap-2"
      >
        <Lightbulb className="h-4 w-4" />
        {loading === 'simplify' ? 'Simplifying...' : 'Explain simply'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleTransform('translate')}
        disabled={loading !== null}
        className="gap-2"
      >
        <Languages className="h-4 w-4" />
        {loading === 'translate' ? 'Translating...' : 'Translate to Urdu'}
      </Button>
    </div>
  );
}
