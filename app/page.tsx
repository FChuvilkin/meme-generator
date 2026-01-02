'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useMemeEditor } from '@/hooks/useMemeEditor';
import MemeCanvas from '@/components/MemeCanvas';
import Sidebar from '@/components/Sidebar';
import Toolbar from '@/components/Toolbar';
import SaveMemeDialog from '@/components/SaveMemeDialog';
import { useAuth } from '@/hooks/useAuth';
import { TextBox } from '@/types';

const TEMPLATE_IMAGES = [
  '/assets/9d4547330630963a9562c2ce895544b9.jpg',
  '/assets/best-meme-templates-04.avif',
  '/assets/no-yes-businessman-meme-pinup-260nw-2373493139.webp',
  '/assets/sad-pepe-the-frog-768x768-1.webp',
];

export default function Home() {
  const {
    memeState,
    dragState,
    setImage,
    addTextBox,
    updateTextBox,
    deleteTextBox,
    selectTextBox,
    startDrag,
    stopDrag,
  } = useMemeEditor();

  const { isAuthenticated } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState('#ffffff');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleTemplateSelect = useCallback(
    async (index: number, src: string) => {
      try {
        await setImage(src);
        setSelectedTemplate(index);
        setCurrentImageUrl(src);
      } catch (error) {
        alert('Failed to load template. Please try another one.');
      }
    },
    [setImage]
  );

  const handleImageUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const dataUrl = event.target?.result as string;
          await setImage(dataUrl);
          setSelectedTemplate(null);
          setCurrentImageUrl(dataUrl);
        } catch (error) {
          alert('Failed to load image. Please try another one.');
        }
      };
      reader.readAsDataURL(file);
    },
    [setImage]
  );

  const handleLoadMeme = useCallback(
    async (imageUrl: string, textBoxes: TextBox[]) => {
      try {
        await setImage(imageUrl);
        setCurrentImageUrl(imageUrl);
        setSelectedTemplate(null);
        // Load text boxes after image is loaded
        setTimeout(() => {
          textBoxes.forEach((box) => {
            addTextBox(box.x, box.y, box.fontSize, box.color);
            // Update the text for the newly added box
            const lastIndex = memeState.textBoxes.length;
            updateTextBox(lastIndex, { text: box.text });
          });
        }, 100);
      } catch (error) {
        alert('Failed to load meme. Please try again.');
      }
    },
    [setImage, addTextBox, updateTextBox, memeState.textBoxes.length]
  );

  const handleAddText = useCallback(() => {
    if (!memeState.image) {
      alert('Please upload an image first!');
      return;
    }

    const canvas = document.getElementById('memeCanvas') as HTMLCanvasElement;
    if (canvas) {
      const x = canvas.width / 2;
      const y = canvas.height / 2;
      addTextBox(x, y, fontSize, textColor);
    }
  }, [memeState.image, addTextBox, fontSize, textColor]);

  const handleSave = useCallback(() => {
    if (!isAuthenticated) {
      alert('Please sign in to save memes');
      return;
    }

    if (!memeState.image || !currentImageUrl) {
      alert('Please create a meme first!');
      return;
    }

    setShowSaveDialog(true);
  }, [isAuthenticated, memeState.image, currentImageUrl]);

  const getTextBoxAt = useCallback(
    (canvasX: number, canvasY: number): number | null => {
      const canvas = document.getElementById('memeCanvas') as HTMLCanvasElement;
      if (!canvas) return null;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      for (let i = memeState.textBoxes.length - 1; i >= 0; i--) {
        const textBox = memeState.textBoxes[i];

        ctx.save();
        ctx.font = `${textBox.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const lines = textBox.text.split('\n');
        let maxLineWidth = 0;
        lines.forEach((line) => {
          const metrics = ctx.measureText(line);
          if (metrics.width > maxLineWidth) {
            maxLineWidth = metrics.width;
          }
        });

        const lineHeight = textBox.fontSize * 1.4;
        const totalHeight = lines.length * lineHeight;

        ctx.restore();

        if (
          canvasX >= textBox.x - maxLineWidth / 2 - 5 &&
          canvasX <= textBox.x + maxLineWidth / 2 + 5 &&
          canvasY >= textBox.y - totalHeight / 2 - 5 &&
          canvasY <= textBox.y + totalHeight / 2 + 5
        ) {
          return i;
        }
      }
      return null;
    },
    [memeState.textBoxes]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!memeState.image) return;

      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = x * scaleX;
      const canvasY = y * scaleY;

      const clickedIndex = getTextBoxAt(canvasX, canvasY);

      if (clickedIndex !== null) {
        selectTextBox(clickedIndex);
        const textBox = memeState.textBoxes[clickedIndex];
        startDrag(canvasX - textBox.x, canvasY - textBox.y);
      } else {
        addTextBox(canvasX, canvasY, fontSize, textColor);
      }
    },
    [memeState.image, memeState.textBoxes, getTextBoxAt, selectTextBox, startDrag, addTextBox, fontSize, textColor]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragState.isDragging || memeState.selectedTextBox === null) return;

      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = x * scaleX;
      const canvasY = y * scaleY;

      const newX = canvasX - dragState.offset.x;
      const newY = canvasY - dragState.offset.y;

      updateTextBox(memeState.selectedTextBox, { x: newX, y: newY });
    },
    [dragState, memeState.selectedTextBox, updateTextBox]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = {
        currentTarget: e.currentTarget,
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as React.MouseEvent<HTMLCanvasElement>;
      handleMouseDown(mouseEvent);
    },
    [handleMouseDown]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = {
        currentTarget: e.currentTarget,
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as React.MouseEvent<HTMLCanvasElement>;
      handleMouseMove(mouseEvent);
    },
    [handleMouseMove]
  );

  const handleDownload = useCallback(() => {
    if (!memeState.image) return;

    const canvas = document.getElementById('memeCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = memeState.image.width;
    tempCanvas.height = memeState.image.height;

    const scaleX = memeState.image.width / canvas.width;
    const scaleY = memeState.image.height / canvas.height;

    tempCtx.drawImage(memeState.image, 0, 0);

    memeState.textBoxes.forEach((textBox) => {
      tempCtx.save();
      const scaledFontSize = textBox.fontSize * scaleX;
      tempCtx.font = `${scaledFontSize}px Arial`;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'top';

      const lines = textBox.text.split('\n');
      const lineHeight = scaledFontSize * 1.4;
      const totalHeight = lines.length * lineHeight;

      const scaledY = textBox.y * scaleY;
      const startY = scaledY - totalHeight / 2 + lineHeight / 2;

      tempCtx.strokeStyle = 'black';
      tempCtx.lineWidth = 6 * scaleX;
      tempCtx.lineJoin = 'round';
      tempCtx.miterLimit = 2;

      tempCtx.fillStyle = textBox.color || '#ffffff';

      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        tempCtx.strokeText(line, textBox.x * scaleX, y);
        tempCtx.fillText(line, textBox.x * scaleX, y);
      });

      tempCtx.restore();
    });

    tempCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meme.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }, [memeState]);

  const currentTextBox =
    memeState.selectedTextBox !== null
      ? memeState.textBoxes[memeState.selectedTextBox]
      : null;

  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Backspace' || e.key === 'Delete') &&
        memeState.selectedTextBox !== null
      ) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
          e.preventDefault();
          deleteTextBox(memeState.selectedTextBox);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [memeState.selectedTextBox, deleteTextBox]);

  return (
    <div className="app-container">
      <Sidebar
        templateImages={TEMPLATE_IMAGES}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={handleTemplateSelect}
        onImageUpload={handleImageUpload}
        onLoadMeme={handleLoadMeme}
      />

      <main className="canvas-area">
        <MemeCanvas
          image={memeState.image}
          textBoxes={memeState.textBoxes}
          selectedTextBox={memeState.selectedTextBox}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDrag}
        />
      </main>

      <Toolbar
        image={memeState.image}
        selectedTextBox={memeState.selectedTextBox}
        currentTextBox={currentTextBox}
        onAddText={handleAddText}
        onTextChange={(text) =>
          memeState.selectedTextBox !== null &&
          updateTextBox(memeState.selectedTextBox, { text: text || ' ' })
        }
        onFontSizeChange={(size) => {
          setFontSize(size);
          memeState.selectedTextBox !== null &&
            updateTextBox(memeState.selectedTextBox, { fontSize: size });
        }}
        onColorChange={(color) => {
          setTextColor(color);
          memeState.selectedTextBox !== null &&
            updateTextBox(memeState.selectedTextBox, { color });
        }}
        onDeleteText={() =>
          memeState.selectedTextBox !== null && deleteTextBox(memeState.selectedTextBox)
        }
        onDownload={handleDownload}
        onSave={handleSave}
      />

      {showSaveDialog && (
        <SaveMemeDialog
          imageUrl={currentImageUrl}
          textBoxes={memeState.textBoxes}
          onClose={() => setShowSaveDialog(false)}
          onSaved={() => {
            alert('Meme saved successfully!');
          }}
        />
      )}
    </div>
  );
}

