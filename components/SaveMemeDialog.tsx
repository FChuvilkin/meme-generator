'use client';

import React, { useState } from 'react';
import { db, id } from '@/lib/instant';
import { useAuth } from '@/hooks/useAuth';
import { TextBox } from '@/types';
import { createMemeData } from '@/lib/instantdb-schema';

interface SaveMemeDialogProps {
  imageUrl: string;
  textBoxes: TextBox[];
  canvasWidth: number;
  canvasHeight: number;
  imageWidth: number;
  imageHeight: number;
  onClose: () => void;
  onSaved?: () => void;
}

export default function SaveMemeDialog({
  imageUrl,
  textBoxes,
  canvasWidth,
  canvasHeight,
  imageWidth,
  imageHeight,
  onClose,
  onSaved,
}: SaveMemeDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be signed in to save memes');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Normalize text box coordinates to image dimensions
      // This ensures they can be correctly scaled when displayed at any size
      const scaleX = imageWidth / canvasWidth;
      const scaleY = imageHeight / canvasHeight;
      
      const normalizedTextBoxes = textBoxes.map(box => ({
        ...box,
        x: box.x * scaleX,
        y: box.y * scaleY,
        fontSize: box.fontSize * scaleX,
      }));

      const memeData = createMemeData(
        user.id,
        title.trim(),
        imageUrl,
        normalizedTextBoxes,
        isPublic
      );

      await db.transact([
        db.tx.memes[id()].update(memeData),
      ]);

      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Failed to save meme:', err);
      setError('Failed to save meme. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="dialog">
        <h2 className="dialog-title">Save Meme</h2>
        <form onSubmit={handleSave} className="dialog-form">
          <div>
            <label className="dialog-label">Title</label>
            <input
              type="text"
              className="dialog-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your meme"
              autoFocus
              disabled={isSaving}
            />
          </div>
          
          <div className="dialog-checkbox-wrapper">
            <input
              type="checkbox"
              id="isPublic"
              className="dialog-checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isSaving}
            />
            <label htmlFor="isPublic" className="dialog-label" style={{ margin: 0 }}>
              Make this meme public
            </label>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <div className="dialog-actions">
            <button
              type="button"
              className="dialog-btn dialog-btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dialog-btn dialog-btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

