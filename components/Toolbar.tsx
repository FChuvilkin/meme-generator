'use client';

import React from 'react';
import { TextBox } from '@/types';

interface ToolbarProps {
  image: HTMLImageElement | null;
  selectedTextBox: number | null;
  currentTextBox: TextBox | null;
  onAddText: () => void;
  onTextChange: (text: string) => void;
  onFontSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  onDeleteText: () => void;
  onDownload: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  image,
  selectedTextBox,
  currentTextBox,
  onAddText,
  onTextChange,
  onFontSizeChange,
  onColorChange,
  onDeleteText,
  onDownload,
}) => {
  const showTextControls = selectedTextBox !== null && currentTextBox !== null;

  return (
    <div className="bottom-toolbar">
      <div className="toolbar-section">
        <button
          onClick={onAddText}
          className="toolbar-button toolbar-button-primary"
          disabled={!image}
        >
          Add Text
        </button>
      </div>

      {showTextControls && (
        <div className="toolbar-section text-controls">
          <div className="toolbar-group">
            <label htmlFor="textInput" className="toolbar-label">
              Text
            </label>
            <textarea
              id="textInput"
              className="toolbar-input toolbar-textarea"
              placeholder="Enter your text (Press Enter for new line)"
              rows={1}
              value={currentTextBox.text}
              onChange={(e) => onTextChange(e.target.value)}
            />
          </div>

          <div className="toolbar-group">
            <label htmlFor="fontSizeSlider" className="toolbar-label">
              Size: <span className="value-display">{currentTextBox.fontSize}</span>px
            </label>
            <input
              type="range"
              id="fontSizeSlider"
              className="toolbar-slider"
              min="20"
              max="100"
              value={currentTextBox.fontSize}
              onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
            />
          </div>

          <div className="toolbar-group">
            <label htmlFor="textColorPicker" className="toolbar-label">
              Color
            </label>
            <input
              type="color"
              id="textColorPicker"
              className="toolbar-color-picker"
              value={currentTextBox.color}
              onChange={(e) => onColorChange(e.target.value)}
            />
          </div>

          <div className="toolbar-group">
            <button
              onClick={onDeleteText}
              className="toolbar-button toolbar-button-danger"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="toolbar-section toolbar-section-right">
        <button
          onClick={onDownload}
          className="toolbar-button toolbar-button-success"
          disabled={!image}
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default Toolbar;

