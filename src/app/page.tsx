"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ConversationView from '@/components/ConversationView';
import SourcesPanel from '@/components/SourcesPanel';
import HistorySidebar from '@/components/HistorySidebar';
import AuthModal from '@/components/AuthModal';
import { type SearchResult } from '@/config/ai';
import { toast } from 'sonner';
import { type PersonalizationSettings } from '@/components/PersonalizePanel';

interface ChatMessage {
  id: string;
  query: string;
  answer?: string;
  sources?: SearchResult[];
  timestamp: number;
  conversationId?: number; // DB conversation ID for logged-in users
}

// Helper: Check if user is logged in (stub for now - always returns false until auth is wired)
const isUserLoggedIn = (): boolean => {
  // TODO: Replace with real auth check when authentication is implemented
  // For now, treat everyone as guest
  return false;
};

// Helper: Get current user ID (stub for now)
const getCurrentUserId = (): number => {
  // TODO: Replace with real user session when authentication is implemented
  return 1; // Placeholder user ID
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [activeChat, setActiveChat] = useState<ChatMessage | null>(null);
  const [sources, setSources] = useState<SearchResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [personalizationSettings, setPersonalizationSettings] = useState<PersonalizationSettings>({
    tone: 'neutral',
    answerLength: 'normal',
    language: 'english'
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [conversationRefreshTrigger, setConversationRefreshTrigger] = useState(0);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [hasShownAuthModal, setHasShownAuthModal] = useState(false);
  const timeOnSiteRef = useRef(0);

  // Load sidebar state, collapsed state, and personalization settings from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === 'true');
    }

    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setIsSidebarCollapsed(savedCollapsed === 'true');
    }

    const savedSettings = localStorage.getItem('personalizationSettings');
    if (savedSettings) {
      try {
        setPersonalizationSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse personalization settings:', e);
      }
    }

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Check if user has dismissed auth modal in this session
    const stayedLoggedOut = sessionStorage.getItem('stayedLoggedOut');
    if (stayedLoggedOut === 'true') {
      setHasShownAuthModal(true);
    }
  }, []);

  // Timer to show auth modal after 5 seconds
  useEffect(() => {
    if (hasShownAuthModal) return;

    const interval = setInterval(() => {
      timeOnSiteRef.current += 1;
      
      if (timeOnSiteRef.current >= 5) {
        setShowAuthModal(true);
        setHasShownAuthModal(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasShownAuthModal]);

  // Listen for changes to sidebarCollapsed in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCollapsed = localStorage.getItem('sidebarCollapsed');
      if (savedCollapsed !== null) {
        setIsSidebarCollapsed(savedCollapsed === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for same-window updates
    const interval = setInterval(() => {
      const savedCollapsed = localStorage.getItem('sidebarCollapsed');
      if (savedCollapsed !== null) {
        const collapsed = savedCollapsed === 'true';
        if (collapsed !== isSidebarCollapsed) {
          setIsSidebarCollapsed(collapsed);
        }
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isSidebarCollapsed]);

  const handlePersonalizationChange = (settings: PersonalizationSettings) => {
    setPersonalizationSettings(settings);
    localStorage.setItem('personalizationSettings', JSON.stringify(settings));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', String(newState));
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const isLoggedIn = isUserLoggedIn();
    let conversationId: number | undefined;

    // For logged-in users: Create a new conversation in the database
    if (isLoggedIn) {
      try {
        const userId = getCurrentUserId();
        const response = await fetch(`/api/conversations?userId=${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: searchQuery,
            userId
          })
        });

        if (response.ok) {
          const data = await response.json();
          conversationId = data.id;
          // Trigger sidebar refresh to show new conversation
          setConversationRefreshTrigger(prev => prev + 1);
        } else {
          console.error('Failed to create conversation:', await response.text());
          toast.error('Failed to save conversation');
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error('Failed to save conversation');
      }
    }

    const newChat: ChatMessage = {
      id: `chat-${Date.now()}`,
      query: searchQuery,
      timestamp: Date.now(),
      conversationId
    };

    setActiveChat(newChat);
    setSources([]);
    setIsGenerating(true);
    setQuery('');

    // Increment query count and check if we should show auth modal
    const newQueryCount = queryCount + 1;
    setQueryCount(newQueryCount);

    if (newQueryCount >= 3 && !hasShownAuthModal) {
      setShowAuthModal(true);
      setHasShownAuthModal(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleFollowupClick = (question: string) => {
    setQuery(question);
    handleSearch(question);
  };

  const handleHistorySelect = async (conversationIdOrQuery: string | number) => {
    const isLoggedIn = isUserLoggedIn();
    
    // If it's a number, load from database (logged-in user)
    if (typeof conversationIdOrQuery === 'number' && isLoggedIn) {
      try {
        const userId = getCurrentUserId();
        const response = await fetch(`/api/conversations/${conversationIdOrQuery}?userId=${userId}`);
        
        if (response.ok) {
          const conversation = await response.json();
          // Load the first user message as the query
          const firstUserMessage = conversation.messages.find((m: any) => m.role === 'user');
          if (firstUserMessage) {
            const chatMessage: ChatMessage = {
              id: `chat-${Date.now()}`,
              query: firstUserMessage.content,
              timestamp: new Date(conversation.createdAt).getTime(),
              conversationId: conversation.id
            };
            setActiveChat(chatMessage);
            setSources([]);
            setIsGenerating(false);
          }
        } else {
          toast.error('Failed to load conversation');
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast.error('Failed to load conversation');
      }
    } else {
      // Guest user or string query - just search
      const queryStr = typeof conversationIdOrQuery === 'string' ? conversationIdOrQuery : '';
      handleSearch(queryStr);
    }
  };

  const handleNewChat = () => {
    setActiveChat(null);
    setQuery('');
    setSources([]);
    setIsGenerating(false);
    setTimeout(() => {
      inputRef.current?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleSourcesReceived = (newSources: SearchResult[]) => {
    setSources(newSources);
    setIsGenerating(false);
  };

  const handleAnswerComplete = async (answer: string, modelUsed?: string) => {
    const isLoggedIn = isUserLoggedIn();
    
    // For logged-in users: Add assistant message to the database
    if (isLoggedIn && activeChat?.conversationId) {
      try {
        const userId = getCurrentUserId();
        const response = await fetch(`/api/conversations/${activeChat.conversationId}/messages?userId=${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'assistant',
            content: answer,
            modelUsed: modelUsed || 'google-gemini-2.0-flash-exp'
          })
        });

        if (!response.ok) {
          console.error('Failed to save assistant message:', await response.text());
        } else {
          // Trigger sidebar refresh to update conversation timestamp
          setConversationRefreshTrigger(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error saving assistant message:', error);
      }
    }
  };

  const handleStopStreaming = () => {
    setIsGenerating(false);
  };

  const handleStayLoggedOut = () => {
    sessionStorage.setItem('stayedLoggedOut', 'true');
  };

  // Calculate main content margin based on sidebar state
  const getMainContentMargin = () => {
    // On mobile/tablet: no margin (sidebar is overlay)
    // On desktop (lg): margin depends on collapsed state
    if (isSidebarCollapsed) {
      return 'lg:ml-20'; // Icon rail width (~72px = w-20)
    }
    return 'lg:ml-72'; // Full sidebar width
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        toast.info('Search focused');
      }

      if (e.key === 'Escape' && isGenerating) {
        setIsGenerating(false);
        toast.info('Search stopped');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <HistorySidebar
        onQuerySelect={handleHistorySelect}
        onNewChat={handleNewChat}
        currentQuery={activeChat?.query}
        isOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
        personalizationSettings={personalizationSettings}
        onPersonalizationChange={handlePersonalizationChange}
        theme={theme}
        onThemeChange={handleThemeChange}
        refreshTrigger={conversationRefreshTrigger} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onStayLoggedOut={handleStayLoggedOut} />

      {/* Main Content Area - Dynamic margin based on sidebar collapsed state */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${getMainContentMargin()}`}>
        {/* Header */}
        <header className="border-b border-border/40 backdrop-blur-xl bg-background/80 sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Hamburger/Sidebar toggle button - only visible on mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSidebarToggle}
                className="h-8 w-8 lg:hidden"
                aria-label="Toggle sidebar">
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Logo - always visible */}
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h1 className="text-lg sm:text-xl font-semibold">NovaPal</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
          {/* Hero Section - Centered (only when no active chat) */}
          {!activeChat && (
            <div className="min-h-[85vh] flex flex-col items-center justify-center py-12">
              <div className="max-w-5xl mx-auto w-full">
                {/* Centered Hero Content */}
                <div className="text-center space-y-8 mb-12">
                  {/* H1 + Subheading */}
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground">
                      Ask anything…
                    </h1>
                    
                    <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto" style={{ lineHeight: '1.5' }}>
                      Real-time search with AI-powered insights.
                    </p>
                  </div>

                  {/* Search Input - Slimmer hero version */}
                  <div className="mt-12">
                    <form onSubmit={handleSubmit}>
                      <div className="relative max-w-3xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-teal-500/20 rounded-xl blur-xl" />
                        <div className="relative bg-card/80 backdrop-blur-2xl rounded-xl border border-border/50 shadow-2xl">
                          <div className="flex items-center gap-2 py-2.5 px-4">
                            <Search className="h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
                            <Input
                              ref={inputRef}
                              type="text"
                              placeholder="What would you like to know?"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              className="px-0 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[16px] !w-[66.8%] !h-full"
                            />
                            <Button
                              type="submit"
                              disabled={!query.trim()}
                              size="sm"
                              className="rounded-lg h-8 px-4 text-sm font-medium flex-shrink-0">
                              Search
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                    
                    <p className="text-sm text-muted-foreground/70 text-center mt-3" style={{ lineHeight: '1.5' }}>
                      Press <kbd className="px-2 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border/50 text-xs font-medium">⌘K</kbd> to focus
                    </p>
                  </div>

                  {/* Minimal Example Prompts */}
                  <div className="mt-10 space-y-3">
                    <p className="text-sm text-muted-foreground/70">Try asking</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["Summarize today's tech news", "Explain quantum computers", "Plan a trip to Japan"].map((example) => (
                        <Button
                          key={example}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQuery(example);
                            handleSearch(example);
                          }}
                          className="rounded-full px-4 py-2 text-sm bg-card/30 backdrop-blur-sm hover:bg-card hover:border-primary/50 transition-all">
                          {example}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversation View (when active chat exists) */}
          {activeChat && (
            <div className="flex-1 pb-24 sm:pb-28 overflow-y-auto">
              <div className="py-6 sm:py-8">
                {/* Mobile & Tablet: Stacked Layout */}
                <div className="lg:hidden space-y-6">
                  <div>
                    <ConversationView
                      query={activeChat.query}
                      onSourcesReceived={handleSourcesReceived}
                      onFollowupClick={handleFollowupClick}
                      personalizationSettings={personalizationSettings}
                      onStopStreaming={handleStopStreaming}
                      isGenerating={isGenerating}
                      onAnswerComplete={handleAnswerComplete}
                    />
                  </div>

                  <div>
                    <SourcesPanel sources={sources} loading={isGenerating && sources.length === 0} />
                  </div>
                </div>

                {/* Desktop: Two-Column Layout */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  <div className="lg:col-span-2">
                    <ConversationView
                      query={activeChat.query}
                      onSourcesReceived={handleSourcesReceived}
                      onFollowupClick={handleFollowupClick}
                      personalizationSettings={personalizationSettings}
                      onStopStreaming={handleStopStreaming}
                      isGenerating={isGenerating}
                      onAnswerComplete={handleAnswerComplete}
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <div className="sticky top-24">
                      <SourcesPanel sources={sources} loading={isGenerating && sources.length === 0} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Fixed Bottom Input Bar (shown when conversation is active) */}
        {activeChat && (
          <div className={`fixed bottom-0 right-0 border-t border-border/40 bg-background/95 backdrop-blur-xl z-10 transition-all duration-200 ${isSidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-72'}`}>
            <div className="py-3 px-4 sm:px-6 lg:px-8">
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                <div className="relative">
                  <div className="flex items-center gap-2 py-2.5 px-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:border-border transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Ask a follow-up question..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      disabled={isGenerating}
                      className="h-7 px-0 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[16px]"
                    />
                    <Button
                      type="submit"
                      disabled={!query.trim() || isGenerating}
                      size="sm"
                      className="rounded-md h-7 px-4 text-sm font-medium flex-shrink-0">
                      Search
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer - Only show when no active chat */}
        {!activeChat && (
          <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground/70">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <p>NovaPal — AI answer engine</p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}