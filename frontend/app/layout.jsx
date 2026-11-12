import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'Rustic Oven - Premium Wood-Fired Pizza & Food',
  description: 'Order artisan pizzas, gourmet burgers, premium sandwiches, and fresh beverages. Wood-fired, made with imported ingredients. Fast delivery with loyalty rewards.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.png', type: 'image/png', sizes: '64x64' },
    ],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png' }],
  },
}

export const viewport = {
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F3EE' },
  ],
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" className="light">
      <body className="antialiased bg-background text-foreground flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
