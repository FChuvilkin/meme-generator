'use client';

import React, { useRef, useState } from 'react';
import MemeLibrary from './MemeLibrary';
import PublicMemesFeed from './PublicMemesFeed';

interface SidebarProps {
  templateImages: string[];
  selectedTemplate: number | null;
  onTemplateSelect: (index: number, src: string) => void;
  onImageUpload: (file: File) => void;
  onLoadMeme: (imageUrl: string, textBoxes: any[]) => void;
}

type TabType = 'templates' | 'my-memes' | 'community';

export const Sidebar: React.FC<SidebarProps> = ({
  templateImages,
  selectedTemplate,
  onTemplateSelect,
  onImageUpload,
  onLoadMeme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('templates');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'my-memes' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-memes')}
          >
            My Memes
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'community' ? 'active' : ''}`}
            onClick={() => setActiveTab('community')}
          >
            Community
          </button>
        </div>

        {activeTab === 'templates' && (
          <>
            <div className="template-gallery">
              {templateImages.map((src, index) => (
                <div
                  key={index}
                  className={`template-item ${selectedTemplate === index ? 'active' : ''}`}
                  onClick={() => onTemplateSelect(index, src)}
                >
                  <img
                    src={src}
                    alt={`Template ${index + 1}`}
                    className="template-img"
                  />
                </div>
              ))}
            </div>
            <label htmlFor="imageInput" className="upload-button">
              <input
                ref={fileInputRef}
                type="file"
                id="imageInput"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
              <span>Upload Image</span>
            </label>
          </>
        )}

        {activeTab === 'my-memes' && <MemeLibrary onLoadMeme={onLoadMeme} />}

        {activeTab === 'community' && <PublicMemesFeed onLoadMeme={onLoadMeme} />}
      </div>
    </aside>
  );
};

export default Sidebar;

