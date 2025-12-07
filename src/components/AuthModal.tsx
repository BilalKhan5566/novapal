"use client";

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStayLoggedOut: () => void;
}

export default function AuthModal({ isOpen, onClose, onStayLoggedOut }: AuthModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  const handleSignup = () => {
    onClose();
    router.push('/signup');
  };

  const handleStayLoggedOut = () => {
    onStayLoggedOut();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Save your NovaPal history?
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground pt-2">
            Create a free account to sync your chats and personalization across devices.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleLogin}
            size="lg"
            className="w-full h-11 font-medium">
            Log in
          </Button>

          <Button
            onClick={handleSignup}
            variant="outline"
            size="lg"
            className="w-full h-11 font-medium">
            Sign up
          </Button>

          <button
            onClick={handleStayLoggedOut}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors py-2">
            Stay logged out
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
