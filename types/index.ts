export interface TextBox {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export interface MemeState {
  image: HTMLImageElement | null;
  textBoxes: TextBox[];
  selectedTextBox: number | null;
}

export interface DragState {
  isDragging: boolean;
  offset: { x: number; y: number };
}

export interface SavedMeme {
  id: string;
  userId: string;
  title: string;
  imageUrl: string;
  textBoxes: TextBox[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

