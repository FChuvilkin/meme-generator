'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthButton() {
  const { user, isLoading, signInWithEmail, signInWithCode, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenModal = () => {
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEmail('');
    setCode('');
    setCodeSent(false);
    setError(null);
  };

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
      handleCloseModal();
    } catch (err) {
      setError('Invalid code. Please try again.');
      console.error(err);
    }
  };

  const handleSignOut = () => {
    signOut();
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
    <>
      <div className="auth-button">
        <button onClick={handleOpenModal} className="auth-submit-btn">
          Sign In
        </button>
      </div>

      {showModal && (
        <div className="auth-modal-overlay" onClick={handleCloseModal}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h2>Sign In</h2>
              <button className="auth-modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            {!codeSent ? (
              <form onSubmit={handleSendCode} className="auth-modal-form">
                <div className="auth-modal-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                    autoFocus
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="auth-submit-btn auth-modal-submit">
                  Send Verification Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="auth-modal-form">
                <p className="code-sent-message">
                  Check your email for the 6-digit verification code!
                </p>
                <div className="auth-modal-field">
                  <label htmlFor="code">Verification Code</label>
                  <input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="auth-input"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                <div className="auth-modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setCodeSent(false);
                      setCode('');
                      setError(null);
                    }}
                    className="auth-back-btn"
                  >
                    Back
                  </button>
                  <button type="submit" className="auth-submit-btn">
                    Verify Code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

