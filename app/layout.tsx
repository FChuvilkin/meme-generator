import type { Metadata } from 'next';
import './globals.css';
import AuthButton from '@/components/AuthButton';

export const metadata: Metadata = {
  title: 'Meme Generator',
  description: 'Create custom memes with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <h1 className="app-title">Meme Generator</h1>
          <AuthButton />
        </header>
        {children}
      </body>
    </html>
  );
}

