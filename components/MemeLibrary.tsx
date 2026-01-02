'use client';

import React from 'react';
import { db } from '@/lib/instant';
import { useAuth } from '@/hooks/useAuth';
import { deserializeTextBoxes } from '@/lib/instantdb-schema';
import { SavedMeme } from '@/types';

interface MemeLibraryProps {
  onLoadMeme: (imageUrl: string, textBoxes: any[]) => void;
}

export default function MemeLibrary({ onLoadMeme }: MemeLibraryProps) {
  const { user, isAuthenticated } = useAuth();
  
  const { data, isLoading, error } = db.useQuery(
    isAuthenticated && user
      ? {
          memes: {
            $: {
              where: {
                userId: user.id,
              },
              order: {
                serverCreatedAt: 'desc',
              },
            },
          },
        }
      : null
  );

  const handleDelete = async (memeId: string) => {
    if (!confirm('Are you sure you want to delete this meme?')) {
      return;
    }

    try {
      await db.transact([db.tx.memes[memeId].delete()]);
    } catch (err) {
      console.error('Failed to delete meme:', err);
      alert('Failed to delete meme. Please try again.');
    }
  };

  const handleLoad = (meme: any) => {
    try {
      const textBoxes = deserializeTextBoxes(meme.textBoxes);
      onLoadMeme(meme.imageUrl, textBoxes);
    } catch (err) {
      console.error('Failed to load meme:', err);
      alert('Failed to load meme. Please try again.');
    }
  };

  const handleTogglePublish = async (meme: any) => {
    try {
      await db.transact([
        db.tx.memes[meme.id].update({
          isPublic: !meme.isPublic,
        }),
      ]);
    } catch (err) {
      console.error('Failed to update meme visibility:', err);
      alert('Failed to update meme visibility. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <p className="empty-state-text">Sign in to see your saved memes</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="empty-state">
        <p className="empty-state-text">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <p className="empty-state-text" style={{ color: 'var(--color-danger)' }}>
          Failed to load memes
        </p>
      </div>
    );
  }

  const memes = data?.memes || [];

  if (memes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📝</div>
        <p className="empty-state-text">No saved memes yet. Create and save your first meme!</p>
      </div>
    );
  }

  return (
    <div className="template-gallery">
      {memes.map((meme: any) => (
        <div key={meme.id} className="meme-card">
          <img
            src={meme.imageUrl}
            alt={meme.title}
            className="meme-card-image"
            onClick={() => handleLoad(meme)}
          />
          <div className="meme-card-info">
            <div className="meme-card-title">{meme.title}</div>
            <div className="meme-card-meta">
              <span>{meme.isPublic ? '🌐 Public' : '🔒 Private'}</span>
              <span>{new Date(meme.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="meme-card-actions">
            <button
              className="meme-card-action-btn"
              onClick={() => handleTogglePublish(meme)}
            >
              {meme.isPublic ? 'Unpublish' : 'Publish'}
            </button>
            <button
              className="meme-card-action-btn danger"
              onClick={() => handleDelete(meme.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

