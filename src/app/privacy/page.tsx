import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Privacy · NovaPal',
  description: 'Privacy policy for NovaPal.',
};

export default function PrivacyPage() {
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
            <h2 className="text-4xl font-bold mb-4">Privacy Policy</h2>
            <p className="text-lg text-muted-foreground">
              Last updated: December 2024
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h3>Information We Collect</h3>
            <p>
              NovaPal collects minimal information to provide you with the best search experience:
            </p>
            <ul>
              <li>Search queries you submit</li>
              <li>Usage data to improve our service</li>
              <li>Technical information like browser type and IP address</li>
            </ul>

            <h3>How We Use Your Information</h3>
            <p>
              Your information is used to:
            </p>
            <ul>
              <li>Provide accurate search results and AI-generated answers</li>
              <li>Improve and optimize our service</li>
              <li>Analyze usage patterns and trends</li>
            </ul>

            <h3>Data Storage</h3>
            <p>
              Search history is stored locally in your browser using localStorage. We do not 
              permanently store your search queries on our servers beyond what is necessary 
              to process your request.
            </p>

            <h3>Third-Party Services</h3>
            <p>
              NovaPal uses the following third-party services:
            </p>
            <ul>
              <li>Google Custom Search API for web search results</li>
              <li>Google Gemini API for AI-generated answers</li>
            </ul>
            <p>
              These services have their own privacy policies which govern how they handle data.
            </p>

            <h3>Your Rights</h3>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Clear your local search history at any time</li>
              <li>Stop using the service</li>
              <li>Request information about data we may have collected</li>
            </ul>

            <h3>Contact</h3>
            <p>
              If you have any questions about this privacy policy or our practices, please 
              contact us through our about page.
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
