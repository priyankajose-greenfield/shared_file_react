import React from 'react';
import type { Metadata } from 'next';
import ThemeLayout from './ThemeLayout';

export const metadata: Metadata = { title: 'LAN Shared Form', description: 'Offline-capable LAN shared JSON form' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeLayout>
          {children}
        </ThemeLayout>
      </body>
    </html>
  );
}