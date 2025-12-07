"use client";

import { useEffect, useState } from 'react';
import { Sparkles, MessageSquare, Trash2, Info, X, FilePlus, ChevronDown, ChevronRight, User, Sliders, Settings as SettingsIcon, Moon, Sun, Monitor, ChevronLeft, ChevronRight as ChevronRightIcon, Plus, Search, Bookmark, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import AccountMenu from '@/components/AccountMenu';
import PersonalizePanel, { type PersonalizationSettings } from '@/components/PersonalizePanel';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { toast } from 'sonner';

export interface ChatHistory {
  id: string | number;
  title: string;
  createdAt: number;
  messageCount?: number;
}

interface HistorySidebarProps {
  onQuerySelect: (query: string | number) => void;
  onNewChat: () => void;
  currentQuery?: string;
  isOpen: boolean;
  onToggle: () => void;
  personalizationSettings: PersonalizationSettings;
  onPersonalizationChange: (settings: PersonalizationSettings) => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  refreshTrigger?: number;
}

// Helper: Check if user is logged in (stub for now)
const isUserLoggedIn = (): boolean => {
  // TODO: Replace with real auth check
  return false;
};

// Helper: Get current user ID (stub for now)
const getCurrentUserId = (): number => {
  // TODO: Replace with real user session
  return 1;
};

export default function HistorySidebar({
  onQuerySelect,
  onNewChat,
  currentQuery,
  isOpen,
  onToggle,
  personalizationSettings,
  onPersonalizationChange,
  theme,
  onThemeChange,
  refreshTrigger = 0
}: HistorySidebarProps) {
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [moreExpanded, setMoreExpanded] = useState(false);
  const [personalizePanelOpen, setPersonalizePanelOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setIsCollapsed(savedCollapsed === 'true');
    }
  }, []);

  // Load history from database (logged-in) or localStorage (guest)
  const loadHistory = async () => {
    const isLoggedIn = isUserLoggedIn();

    if (isLoggedIn) {
      // Load from database
      setIsLoadingHistory(true);
      try {
        const userId = getCurrentUserId();
        const response = await fetch(`/api/conversations?userId=${userId}`);
        
        if (response.ok) {
          const conversations = await response.json();
          const historyItems: ChatHistory[] = conversations.map((conv: any) => ({
            id: conv.id,
            title: conv.title,
            createdAt: new Date(conv.updatedAt).getTime(),
            messageCount: conv.messageCount
          }));
          setHistory(historyItems);
        } else {
          console.error('Failed to load conversations');
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    } else {
      // Load from localStorage (guest)
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to parse history:', e);
        }
      }
    }
  };

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  // Add current query to history (guest users only)
  useEffect(() => {
    const isLoggedIn = isUserLoggedIn();
    
    // Only update localStorage for guest users
    if (!isLoggedIn && currentQuery && currentQuery.trim()) {
      setHistory((prev) => {
        const existingIndex = prev.findIndex((item) => item.title === currentQuery);

        let newHistory: ChatHistory[];
        if (existingIndex !== -1) {
          const existing = prev[existingIndex];
          newHistory = [
            { ...existing, createdAt: Date.now() },
            ...prev.filter((_, i) => i !== existingIndex)
          ];
        } else {
          const newEntry: ChatHistory = {
            id: `chat-${Date.now()}`,
            title: currentQuery,
            createdAt: Date.now()
          };
          newHistory = [newEntry, ...prev].slice(0, 50);
        }

        localStorage.setItem('chatHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [currentQuery]);

  const handleCollapseToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  const deleteChat = async (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLoggedIn = isUserLoggedIn();

    if (isLoggedIn && typeof id === 'number') {
      // Delete from database
      try {
        const userId = getCurrentUserId();
        const response = await fetch(`/api/conversations/${id}?userId=${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setHistory((prev) => prev.filter((item) => item.id !== id));
          toast.success('Conversation deleted');
        } else {
          toast.error('Failed to delete conversation');
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        toast.error('Failed to delete conversation');
      }
    } else {
      // Delete from localStorage (guest)
      setHistory((prev) => {
        const newHistory = prev.filter((item) => item.id !== id);
        localStorage.setItem('chatHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  };

  const clearAllHistory = async () => {
    const isLoggedIn = isUserLoggedIn();

    if (isLoggedIn) {
      // Clear from database
      try {
        const userId = getCurrentUserId();
        const response = await fetch(`/api/conversations/clear?userId=${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setHistory([]);
          toast.success('All conversations cleared');
        } else {
          toast.error('Failed to clear conversations');
        }
      } catch (error) {
        console.error('Error clearing conversations:', error);
        toast.error('Failed to clear conversations');
      }
    } else {
      // Clear from localStorage (guest)
      setHistory([]);
      localStorage.removeItem('chatHistory');
    }
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const groupedHistory = history.reduce((acc, item) => {
    const label = formatDate(item.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {} as Record<string, ChatHistory[]>);

  const handleNewChat = () => {
    onNewChat();
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const handleSelectChat = (item: ChatHistory) => {
    // Pass the conversation ID for logged-in users, or title for guests
    const isLoggedIn = isUserLoggedIn();
    if (isLoggedIn && typeof item.id === 'number') {
      onQuerySelect(item.id);
    } else {
      onQuerySelect(item.title);
    }
    
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    onThemeChange(newTheme);
    applyTheme(newTheme);
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Mobile/Tablet Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-card border-r border-border z-50 flex flex-col transition-all duration-200 ease-in-out",
          // Mobile/Tablet: Always full width when open
          "w-72",
          // Desktop: Dynamic width based on collapse state
          "lg:w-72",
          isCollapsed && "lg:w-20",
          // Mobile: slide in/out
          "lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: Always visible (don't translate)
          "lg:translate-x-0"
        )}
      >
        {/* EXPANDED MODE - Full Sidebar */}
        <div className={cn(
          "flex-1 flex flex-col",
          isCollapsed && "hidden lg:hidden"
        )}>
          {/* Header - Logo + Close/Collapse Button */}
          <div className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">NovaPal</span>
              </div>
              {/* Mobile: X button, Desktop: Chevron left button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    handleCollapseToggle();
                  } else {
                    onToggle();
                  }
                }}
                className="h-8 w-8"
                aria-label="Collapse sidebar"
              >
                <X className="h-4 w-4 lg:hidden" />
                <ChevronLeft className="h-4 w-4 hidden lg:block" />
              </Button>
            </div>
          </div>

          {/* New Chat Button - Prominent */}
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <Button
              onClick={handleNewChat}
              className="w-full justify-center gap-2 h-11 font-medium text-base shadow-sm"
              size="lg"
            >
              <FilePlus className="h-5 w-5" />
              New Chat
            </Button>
          </div>

          {/* Guest Note - Sign in to save chats */}
          {!isUserLoggedIn() && (
            <div className="px-4 pb-3 flex-shrink-0">
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <LogIn className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <Link href="/login" className="font-medium text-foreground hover:underline underline-offset-2">
                        Sign in
                      </Link>
                      {' '}to save your chats. Guest conversations may not be stored.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat History - Scrollable */}
          <ScrollArea className="flex-1 px-2 py-2">
            {isLoadingHistory ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p>Loading conversations...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No conversations yet</p>
                <p className="text-xs mt-1 opacity-75">Start by asking a question</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="px-3 py-1">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Recent
                  </h4>
                </div>
                {Object.entries(groupedHistory).map(([date, items]) => (
                  <div key={date}>
                    <h5 className="text-xs text-muted-foreground/70 px-3 py-1.5">
                      {date}
                    </h5>
                    <div className="space-y-0.5">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectChat(item)}
                          className={cn(
                            "w-full text-left p-2.5 rounded-lg transition-colors group relative",
                            "hover:bg-accent",
                            item.title === currentQuery && "bg-accent"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                            <span className="text-sm line-clamp-2 flex-1 pr-6">
                              {item.title}
                            </span>
                            <button
                              onClick={(e) => deleteChat(item.id, e)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background rounded"
                              aria-label="Delete chat"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                {history.length > 0 && (
                  <div className="px-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllHistory}
                      className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive h-8"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* More Section - Collapsible */}
          <div className="border-t border-border flex-shrink-0">
            <div className="p-2">
              <button
                onClick={() => setMoreExpanded(!moreExpanded)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  SETTINGS
                </span>
                {moreExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              
              {moreExpanded && (
                <div className="mt-1 space-y-0.5">
                  {/* Account */}
                  <AccountMenu />
                  
                  {/* Personalize NovaPal */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPersonalizePanelOpen(true)}
                    className="w-full justify-start gap-2 text-sm font-normal h-9"
                  >
                    <Sliders className="h-4 w-4 text-muted-foreground" />
                    <span>Personalize NovaPal</span>
                  </Button>
                  
                  {/* Settings - Theme */}
                  <div className="py-1">
                    <div className="px-3 py-1">
                      <span className="text-xs text-muted-foreground">Theme</span>
                    </div>
                    <div className="space-y-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleThemeChange('light')}
                        className={cn(
                          "w-full justify-start gap-2 text-sm font-normal h-8 pl-6",
                          theme === 'light' && "bg-accent"
                        )}
                      >
                        <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">Light</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleThemeChange('dark')}
                        className={cn(
                          "w-full justify-start gap-2 text-sm font-normal h-8 pl-6",
                          theme === 'dark' && "bg-accent"
                        )}
                      >
                        <Moon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">Dark</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleThemeChange('system')}
                        className={cn(
                          "w-full justify-start gap-2 text-sm font-normal h-8 pl-6",
                          theme === 'system' && "bg-accent"
                        )}
                      >
                        <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">System</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* About NovaPal */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-sm font-normal h-9"
                    asChild
                  >
                    <a href="/about">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span>About NovaPal</span>
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLLAPSED MODE - Icon Rail (Desktop Only) */}
        <div className={cn(
          "hidden lg:flex flex-col items-center py-4 flex-1",
          !isCollapsed && "lg:hidden"
        )}>
          {/* Expand Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCollapseToggle}
                className="h-10 w-10 mb-6"
                aria-label="Expand sidebar"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>

          {/* Icon Navigation - Centered */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {/* New Chat Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNewChat}
                  className="h-11 w-11 rounded-lg hover:bg-accent"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New chat</TooltipContent>
            </Tooltip>

            {/* Search Chats Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-lg hover:bg-accent"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Search chats</TooltipContent>
            </Tooltip>

            {/* Library / Saved Items Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-lg hover:bg-accent"
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Library</TooltipContent>
            </Tooltip>

            {/* Settings / Personalization Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPersonalizePanelOpen(true)}
                  className="h-11 w-11 rounded-lg hover:bg-accent"
                >
                  <Sliders className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </div>

          {/* Account Avatar - Bottom */}
          <div className="mt-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-11 w-11 rounded-full p-0 hover:bg-accent"
                >
                  <Link href="/login">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        <LogIn className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign in</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Personalization Panel */}
      <PersonalizePanel
        isOpen={personalizePanelOpen}
        onClose={() => setPersonalizePanelOpen(false)}
        settings={personalizationSettings}
        onSettingsChange={onPersonalizationChange}
      />
    </>
  );
}