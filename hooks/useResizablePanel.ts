import { useState, useCallback, useEffect, useRef } from 'react';

interface UseResizablePanelOptions {
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  storageKey?: string;
}

export function useResizablePanel({
  minWidth,
  maxWidth,
  defaultWidth,
  storageKey,
}: UseResizablePanelOptions) {
  // Load initial width from localStorage if available
  const getInitialWidth = () => {
    if (storageKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          return parsed;
        }
      }
    }
    return defaultWidth;
  };

  const [width, setWidth] = useState(getInitialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.min(
        Math.max(startWidthRef.current + deltaX, minWidth),
        maxWidth
      );
      setWidth(newWidth);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizing) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startXRef.current;
      const newWidth = Math.min(
        Math.max(startWidthRef.current + deltaX, minWidth),
        maxWidth
      );
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (!isResizing) return;
      
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Save to localStorage if storageKey is provided
      if (storageKey) {
        localStorage.setItem(storageKey, width.toString());
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isResizing, minWidth, maxWidth, storageKey, width]);

  return {
    width,
    isResizing,
    handleMouseDown,
    handleTouchStart,
  };
}

