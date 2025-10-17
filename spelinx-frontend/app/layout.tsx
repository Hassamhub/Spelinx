import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SPELINX - Premium Gaming Platform',
  description: 'Experience the ultimate gaming platform with premium features, stunning visuals, and endless entertainment.',
  keywords: 'gaming, premium, platform, multiplayer, achievements, leaderboards',
  authors: [{ name: 'SPELINX Team' }],
  openGraph: {
    title: 'SPELINX - Premium Gaming Platform',
    description: 'Play. Progress. Prevail.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
