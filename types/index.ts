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

