'use client';

import { useState, useCallback } from 'react';
import { TextBox, MemeState, DragState } from '@/types';

export const useMemeEditor = () => {
  const [memeState, setMemeState] = useState<MemeState>({
    image: null,
    textBoxes: [],
    selectedTextBox: null,
  });

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    offset: { x: 0, y: 0 },
  });

  const loadImage = useCallback((src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }, []);

  const setImage = useCallback(async (src: string) => {
    try {
      const img = await loadImage(src);
      setMemeState({
        image: img,
        textBoxes: [],
        selectedTextBox: null,
      });
      return img;
    } catch (error) {
      console.error('Failed to load image:', error);
      throw error;
    }
  }, [loadImage]);

  const addTextBox = useCallback((x: number, y: number, fontSize: number, color: string) => {
    const newTextBox: TextBox = {
      text: 'Your text here',
      x,
      y,
      fontSize,
      color,
    };

    setMemeState((prev) => ({
      ...prev,
      textBoxes: [...prev.textBoxes, newTextBox],
      selectedTextBox: prev.textBoxes.length,
    }));

    return newTextBox;
  }, []);

  const updateTextBox = useCallback((index: number, updates: Partial<TextBox>) => {
    setMemeState((prev) => ({
      ...prev,
      textBoxes: prev.textBoxes.map((box, i) =>
        i === index ? { ...box, ...updates } : box
      ),
    }));
  }, []);

  const deleteTextBox = useCallback((index: number) => {
    setMemeState((prev) => {
      const newTextBoxes = prev.textBoxes.filter((_, i) => i !== index);
      return {
        ...prev,
        textBoxes: newTextBoxes,
        selectedTextBox: newTextBoxes.length > 0 ? newTextBoxes.length - 1 : null,
      };
    });
  }, []);

  const selectTextBox = useCallback((index: number | null) => {
    setMemeState((prev) => ({
      ...prev,
      selectedTextBox: index,
    }));
  }, []);

  const startDrag = useCallback((offsetX: number, offsetY: number) => {
    setDragState({
      isDragging: true,
      offset: { x: offsetX, y: offsetY },
    });
  }, []);

  const stopDrag = useCallback(() => {
    setDragState((prev) => ({
      ...prev,
      isDragging: false,
    }));
  }, []);

  return {
    memeState,
    dragState,
    setImage,
    addTextBox,
    updateTextBox,
    deleteTextBox,
    selectTextBox,
    startDrag,
    stopDrag,
  };
};

