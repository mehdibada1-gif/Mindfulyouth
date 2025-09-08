
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { UserProvider } from '@/components/auth/user-provider';
import { ChatProvider } from '@/context/chat-provider';
import { useRef } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mobileFrameRef = useRef<HTMLDivElement>(null);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <UserProvider>
          <ChatProvider>
            <div ref={mobileFrameRef} className="flex flex-col h-screen max-w-sm mx-auto border-4 border-black rounded-3xl shadow-2xl overflow-hidden my-4 relative">
                <AppSidebar container={mobileFrameRef}>{children}</AppSidebar>
            </div>
          </ChatProvider>
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
