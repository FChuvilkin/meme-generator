'use client';

import React, { useRef, useEffect } from 'react';
import { TextBox } from '@/types';

interface MemeCanvasProps {
  image: HTMLImageElement | null;
  textBoxes: TextBox[];
  selectedTextBox: number | null;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd: () => void;
}

export const MemeCanvas: React.FC<MemeCanvasProps> = ({
  image,
  textBoxes,
  selectedTextBox,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate canvas size
    const sidebarWidth = 240;
    const toolbarHeight = 72;
    const padding = 32;
    const toolbarSpacing = 24;

    const availableWidth = window.innerWidth - sidebarWidth - padding * 2;
    const availableHeight = window.innerHeight - toolbarHeight - toolbarSpacing - padding * 2;

    const imageAspectRatio = image.width / image.height;
    const availableAspectRatio = availableWidth / availableHeight;

    let width: number, height: number;

    if (imageAspectRatio > availableAspectRatio) {
      width = availableWidth;
      height = width / imageAspectRatio;
    } else {
      height = availableHeight;
      width = height * imageAspectRatio;
    }

    if (width < 200) {
      width = 200;
      height = width / imageAspectRatio;
    }
    if (height < 200) {
      height = 200;
      width = height * imageAspectRatio;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw text boxes
    textBoxes.forEach((textBox, index) => {
      drawTextBox(ctx, textBox, index === selectedTextBox);
    });
  }, [image, textBoxes, selectedTextBox]);

  const drawTextBox = (ctx: CanvasRenderingContext2D, textBox: TextBox, isSelected: boolean) => {
    ctx.save();

    ctx.font = `${textBox.fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const lines = textBox.text.split('\n');
    const lineHeight = textBox.fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    const startY = textBox.y - totalHeight / 2 + lineHeight / 2;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.fillStyle = textBox.color || '#ffffff';

    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.strokeText(line, textBox.x, y);
      ctx.fillText(line, textBox.x, y);
    });

    if (isSelected) {
      let maxLineWidth = 0;
      lines.forEach((line) => {
        const metrics = ctx.measureText(line);
        if (metrics.width > maxLineWidth) {
          maxLineWidth = metrics.width;
        }
      });

      const textTop = startY;
      const lastLineTop = startY + (lines.length - 1) * lineHeight;
      const textBottom = lastLineTop + textBox.fontSize;
      const actualTextHeight = textBottom - textTop;

      const padding = 5;

      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        textBox.x - maxLineWidth / 2 - padding,
        textTop - padding,
        maxLineWidth + padding * 2,
        actualTextHeight + padding * 2
      );
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  return (
    <div className="canvas-wrapper">
      {!image ? (
        <div className="canvas-placeholder">
          <div className="placeholder-content">
            <p className="placeholder-text">
              Choose a template or upload an image to get started
            </p>
          </div>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          id="memeCanvas"
          className="meme-canvas"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      )}
    </div>
  );
};

export default MemeCanvas;

