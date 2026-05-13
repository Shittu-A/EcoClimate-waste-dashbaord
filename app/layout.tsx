import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EcoClimate Waste Dashboard',
  description: 'Interactive map of 6,479 dump sites across Nigeria — eHealth Africa / GRID3',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}
