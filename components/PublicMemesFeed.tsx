'use client';

import React from 'react';
import { db } from '@/lib/instant';
import { deserializeTextBoxes } from '@/lib/instantdb-schema';
import MemePreview from './MemePreview';

interface PublicMemesFeedProps {
  onLoadMeme: (imageUrl: string, textBoxes: any[], imageWidth: number, imageHeight: number) => void;
}

export default function PublicMemesFeed({ onLoadMeme }: PublicMemesFeedProps) {
  const { data, isLoading, error } = db.useQuery({
    memes: {
      $: {
        where: {
          isPublic: true,
        },
        order: {
          serverCreatedAt: 'desc',
        },
        limit: 50,
      },
    },
  });

  const handleLoad = (meme: any) => {
    try {
      const textBoxes = deserializeTextBoxes(meme.textBoxes);
      // Load the image to get its dimensions
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        onLoadMeme(meme.imageUrl, textBoxes, img.width, img.height);
      };
      img.onerror = () => {
        alert('Failed to load meme image.');
      };
      img.src = meme.imageUrl;
    } catch (err) {
      console.error('Failed to load meme:', err);
      alert('Failed to load meme. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <p className="empty-state-text">Loading public memes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <p className="empty-state-text" style={{ color: 'var(--color-danger)' }}>
          Failed to load public memes
        </p>
      </div>
    );
  }

  const memes = data?.memes || [];

  if (memes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🌐</div>
        <p className="empty-state-text">No public memes yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="template-gallery">
      {memes.map((meme: any) => (
        <div key={meme.id} className="meme-card">
          <MemePreview
            imageUrl={meme.imageUrl}
            textBoxes={meme.textBoxes}
            alt={meme.title}
            className="meme-card-image"
            onClick={() => handleLoad(meme)}
          />
          <div className="meme-card-info">
            <div className="meme-card-title">{meme.title}</div>
            <div className="meme-card-meta">
              <span>🌐 Public</span>
              <span>{new Date(meme.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="meme-card-actions">
            <button
              className="meme-card-action-btn"
              onClick={() => handleLoad(meme)}
            >
              Remix
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

