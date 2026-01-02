import { TextBox } from '@/types';

// Database types matching InstantDB schema
export interface DBMeme {
  id: string;
  userId: string;
  title: string;
  imageUrl: string;
  textBoxes: string; // JSON stringified TextBox[]
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DBUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
}

// Helper functions for serialization
export function serializeTextBoxes(textBoxes: TextBox[]): string {
  return JSON.stringify(textBoxes);
}

export function deserializeTextBoxes(textBoxesJson: string): TextBox[] {
  try {
    return JSON.parse(textBoxesJson);
  } catch (error) {
    console.error('Failed to deserialize textBoxes:', error);
    return [];
  }
}

// Helper to create a new meme object
export function createMemeData(
  userId: string,
  title: string,
  imageUrl: string,
  textBoxes: TextBox[],
  isPublic: boolean = false
): Omit<DBMeme, 'id'> {
  const now = Date.now();
  return {
    userId,
    title,
    imageUrl,
    textBoxes: serializeTextBoxes(textBoxes),
    isPublic,
    createdAt: now,
    updatedAt: now,
  };
}

