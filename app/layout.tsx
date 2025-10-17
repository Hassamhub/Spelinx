import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DevSafetyProvider } from '@/components/DevSafetyProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SPELINX - Play Games & Earn Rewards',
  description: 'The ultimate gaming platform with premium features and rewards',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DevSafetyProvider>
          {children}
        </DevSafetyProvider>
      </body>
    </html>
  )
}
