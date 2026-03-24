import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AgriFlow - National Intelligence Platform',
  description: 'AI-driven agricultural intelligence platform for Sri Lanka',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha256-pvM+K1q4gP6P8P2qYvCy9MhTKyPp8Z1D8dJ9VpH1v8="
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin="anonymous"
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${outfit.variable} font-outfit antialiased`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
