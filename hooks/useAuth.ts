'use client';

import { db } from '@/lib/instant';

export function useAuth() {
  const { isLoading, user, error } = db.useAuth();

  const signInWithEmail = (email: string) => {
    db.auth.sendMagicCode({ email }).catch((err) => {
      console.error('Failed to send magic code:', err);
    });
  };

  const signInWithCode = (email: string, code: string) => {
    return db.auth.signInWithMagicCode({ email, code });
  };

  const signOut = () => {
    db.auth.signOut();
  };

  return {
    isLoading,
    user,
    error,
    signInWithEmail,
    signInWithCode,
    signOut,
    isAuthenticated: !!user,
  };
}

