import type { Metadata } from 'next';
import './globals.css';
import AuthButton from '@/components/AuthButton';
import HeaderWithTabs from '@/components/HeaderWithTabs';

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
        <HeaderWithTabs />
        {children}
      </body>
    </html>
  );
}

