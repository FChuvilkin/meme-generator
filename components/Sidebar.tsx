'use client';

import React, { useRef } from 'react';

interface SidebarProps {
  templateImages: string[];
  selectedTemplate: number | null;
  onTemplateSelect: (index: number, src: string) => void;
  onImageUpload: (file: File) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  templateImages,
  selectedTemplate,
  onTemplateSelect,
  onImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
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
      </div>
    </aside>
  );
};

export default Sidebar;

