import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'ERP-Lite Pilot',
  description: 'An ERP-Lite application pilot.',
=======
  title: 'Lirco Engg',
  description: 'Lirco Engg ERP application.',
  icons: {
    icon: ['/lirco-logo.jpg'],
    apple: ['/lirco-logo.jpg'],
  },
>>>>>>> main
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
<<<<<<< HEAD
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
=======
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300..800&display=swap"
>>>>>>> main
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap"
          rel="stylesheet"
        />
<<<<<<< HEAD
=======
        <link rel="icon" href="/lirco-logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/lirco-logo.jpg" />
>>>>>>> main
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
