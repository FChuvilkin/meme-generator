# Meme Generator

A modern, feature-rich meme generator built with Next.js, React, and TypeScript.

## Features

- 🖼️ **Template Gallery**: Choose from pre-loaded meme templates
- 📤 **Custom Upload**: Upload your own images
- ✏️ **Text Customization**: Add, edit, and style text with:
  - Drag and drop positioning
  - Font size adjustment (20-100px)
  - Color picker
  - Multi-line text support
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 💾 **Download**: Export your memes as high-quality PNG images
- ⌨️ **Keyboard Shortcuts**: Delete selected text with Backspace/Delete

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Select a Template**: Click on any template in the sidebar, or upload your own image
2. **Add Text**: Click the "Add Text" button or click anywhere on the canvas
3. **Edit Text**: Select a text box to edit its content, size, and color
4. **Position Text**: Drag text boxes to reposition them
5. **Download**: Click "Download" to save your meme

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Canvas API**: Image manipulation and text rendering
- **CSS Variables**: Themeable design system
- **React Hooks**: Custom hooks for state management

## Project Structure

```
├── app/
│   ├── page.tsx          # Main meme generator page
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles
├── components/
│   ├── MemeCanvas.tsx    # Canvas component for rendering
│   ├── Sidebar.tsx       # Template gallery and upload
│   └── Toolbar.tsx       # Text controls toolbar
├── hooks/
│   └── useMemeEditor.ts  # Custom hook for meme state
├── types/
│   └── index.ts          # TypeScript type definitions
└── public/
    └── assets/           # Meme template images
```

## Building for Production

```bash
npm run build
npm start
```

## License

MIT

## Contributing

Feel free to submit issues and pull requests!

