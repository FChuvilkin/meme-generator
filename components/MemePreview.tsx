'use client';

import React, { useRef, useEffect, useState } from 'react';
import { TextBox } from '@/types';
import { deserializeTextBoxes } from '@/lib/instantdb-schema';

interface MemePreviewProps {
  imageUrl: string;
  textBoxes: string; // JSON serialized TextBox[]
  alt?: string;
  className?: string;
  onClick?: () => void;
}

export default function MemePreview({
  imageUrl,
  textBoxes,
  alt = 'Meme preview',
  className = '',
  onClick,
}: MemePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      // For preview, render at the image's natural dimensions (scaled down to fit preview)
      const maxPreviewSize = 300;
      const imageAspectRatio = image.width / image.height;
      
      let previewWidth: number, previewHeight: number;
      
      if (image.width > image.height) {
        previewWidth = Math.min(maxPreviewSize, image.width);
        previewHeight = previewWidth / imageAspectRatio;
      } else {
        previewHeight = Math.min(maxPreviewSize, image.height);
        previewWidth = previewHeight * imageAspectRatio;
      }

      canvas.width = previewWidth;
      canvas.height = previewHeight;

      // Draw the image to fill the canvas
      ctx.drawImage(image, 0, 0, previewWidth, previewHeight);

      // The text coordinates are now saved normalized to image dimensions
      // Scale them to the preview canvas size
      const scaleX = previewWidth / image.width;
      const scaleY = previewHeight / image.height;

      try {
        const boxes = deserializeTextBoxes(textBoxes);
        
        boxes.forEach((box: TextBox) => {
          ctx.save();
          
          // Scale the font size and positions from image space to preview space
          const scaledFontSize = box.fontSize * scaleX;
          ctx.font = `${scaledFontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          const lines = box.text.split('\n');
          const lineHeight = scaledFontSize * 1.4;
          const totalHeight = lines.length * lineHeight;
          
          const scaledY = box.y * scaleY;
          const startY = scaledY - totalHeight / 2 + lineHeight / 2;

          ctx.strokeStyle = 'black';
          ctx.lineWidth = 6 * scaleX;
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          ctx.fillStyle = box.color || '#ffffff';

          lines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            ctx.strokeText(line, box.x * scaleX, y);
            ctx.fillText(line, box.x * scaleX, y);
          });

          ctx.restore();
        });
      } catch (error) {
        console.error('Failed to render text boxes:', error);
      }

      setIsLoaded(true);
    };

    image.onerror = () => {
      console.error('Failed to load image:', imageUrl);
      setIsLoaded(true);
    };

    image.src = imageUrl;
  }, [imageUrl, textBoxes]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onClick={onClick}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        opacity: isLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
      aria-label={alt}
    />
  );
}

