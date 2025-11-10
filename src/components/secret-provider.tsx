'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';
import { useUser } from '@/firebase';

interface SecretContextType {
  isUnlocked: boolean;
  unlock: () => void;
}

const SecretContext = createContext<SecretContextType | undefined>(undefined);

const SECRET_PASSWORD = 'draglist';
const STORAGE_KEY_PREFIX = 'draglist-secret-unlocked-';

export function SecretProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const storageKey = user ? `${STORAGE_KEY_PREFIX}${user.uid}` : null;

  useEffect(() => {
    if (!storageKey) {
      setIsUnlocked(false);
      return;
    }
    // Check localStorage on mount to see if the user has already unlocked it.
    try {
      const storedValue = localStorage.getItem(storageKey);
      if (storedValue === 'true') {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }
    } catch (error) {
      // localStorage may not be available (e.g. in private browsing mode)
      console.warn('Could not access localStorage:', error);
      setIsUnlocked(false);
    }
  }, [storageKey]);

  const handleUnlock = () => {
    if (password === SECRET_PASSWORD) {
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, 'true');
        } catch (error) {
          console.warn('Could not write to localStorage:', error);
        }
      }
      setIsUnlocked(true);
      toast({
        title: 'Access Granted',
        description: 'Welcome to the secret area.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'The password you entered is incorrect.',
      });
    }
    setPassword('');
  };

  if (!user) {
    // Optional: show a loading or access denied state if there is no user
    return null;
  }

  if (!isUnlocked) {
    return (
      <Dialog open={true}>
        <DialogContent
          className="max-w-sm"
          onInteractOutside={(e) => e.preventDefault()}
          hideCloseButton={true}
        >
          <DialogHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <ShieldCheck className="h-12 w-12 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Secret Area</DialogTitle>
            <DialogDescription>
              This section is password protected. Please enter the password to
              continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
            </div>
            <Button onClick={handleUnlock} className="w-full">
              Unlock
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <SecretContext.Provider value={{ isUnlocked, unlock: handleUnlock }}>
      {children}
    </SecretContext.Provider>
  );
}

export function useSecret() {
  const context = useContext(SecretContext);
  if (context === undefined) {
    throw new Error('useSecret must be used within a SecretProvider');
  }
  return context;
}
