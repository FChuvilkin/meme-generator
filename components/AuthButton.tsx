'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthButton() {
  const { user, isLoading, signInWithEmail, signInWithCode, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    try {
      await signInWithEmail(email);
      setCodeSent(true);
    } catch (err) {
      setError('Failed to send code. Please try again.');
      console.error(err);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    try {
      await signInWithCode(email, code);
      setCodeSent(false);
      setCode('');
      setEmail('');
    } catch (err) {
      setError('Invalid code. Please try again.');
      console.error(err);
    }
  };

  const handleSignOut = () => {
    signOut();
    setCodeSent(false);
    setEmail('');
    setCode('');
  };

  if (isLoading) {
    return (
      <div className="auth-button">
        <span>Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-button authenticated">
        <div className="user-info">
          <span className="user-email">{user.email}</span>
          <button onClick={handleSignOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-button">
      {!codeSent ? (
        <form onSubmit={handleSendCode} className="auth-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
          <button type="submit" className="auth-submit-btn">
            Send Code
          </button>
          {error && <p className="auth-error">{error}</p>}
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="auth-form">
          <p className="code-sent-message">Check your email for the code!</p>
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="auth-input"
          />
          <button type="submit" className="auth-submit-btn">
            Verify Code
          </button>
          <button
            type="button"
            onClick={() => {
              setCodeSent(false);
              setCode('');
            }}
            className="auth-back-btn"
          >
            Back
          </button>
          {error && <p className="auth-error">{error}</p>}
        </form>
      )}
    </div>
  );
}

