'use client';

import React, { useState, useEffect } from 'react';
import AuthButton from './AuthButton';

type TabType = 'templates' | 'my-memes' | 'community';

const HeaderWithTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');

  // Listen for tab changes from page
  useEffect(() => {
    const handleTabChange = (event: CustomEvent<{ tab: TabType }>) => {
      setActiveTab(event.detail.tab);
    };
    window.addEventListener('meme-tab-change', handleTabChange as any);
    return () => window.removeEventListener('meme-tab-change', handleTabChange as any);
  }, []);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    const event = new CustomEvent('meme-tab-change', { detail: { tab } });
    window.dispatchEvent(event);
  };

  return (
    <header className="app-header-unified">
      <h1 className="app-title">Meme Generator</h1>
      
      <div className="header-tabs-center">
        <button
          className={`header-tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => handleTabClick('templates')}
        >
          Templates
        </button>
        <button
          className={`header-tab ${activeTab === 'my-memes' ? 'active' : ''}`}
          onClick={() => handleTabClick('my-memes')}
        >
          My Memes
        </button>
        <button
          className={`header-tab ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => handleTabClick('community')}
        >
          Community
        </button>
      </div>

      <AuthButton />
    </header>
  );
};

export default HeaderWithTabs;

