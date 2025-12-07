import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About · NovaPal',
  description: 'Learn more about NovaPal, your AI research companion.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-xl bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">NovaPal</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-4">About NovaPal</h2>
            <p className="text-lg text-muted-foreground">
              Your AI research companion for the modern web.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              NovaPal is an experimental AI answer engine that combines the power of web search 
              with advanced language models to provide you with accurate, well-sourced answers 
              to your questions.
            </p>

            <h3>How it works</h3>
            <p>
              When you ask a question, NovaPal searches the web in real-time, analyzes multiple 
              sources, and synthesizes the information into a clear, concise answer. Every answer 
              includes citations so you can verify the information and explore further.
            </p>

            <h3>Our mission</h3>
            <p>
              We believe in making information more accessible and understanding easier. NovaPal 
              is designed to help you find answers quickly without having to sift through countless 
              search results.
            </p>

            <h3>Technology</h3>
            <p>
              NovaPal is powered by Google Custom Search for web results and Google Gemini for 
              AI-generated answers, ensuring you get both comprehensive coverage and intelligent 
              synthesis of information.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p className="mb-3">NovaPal — an experimental AI answer engine</p>
          <div className="flex items-center justify-center gap-6">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
