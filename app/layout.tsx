import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk, Tektur } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ServiceWorker } from '@/components/service-worker'
import { AuthProvider } from '@/lib/auth'
import { SyncProvider } from '@/components/sync-provider'
import { RealtimeProvider } from '@/components/realtime-provider'
import { AuthInitializer } from '@/components/auth-initializer'
import { ErrorBoundary } from '@/components/error-boundary'
import { GlobalErrorHandler } from '@/components/global-error-handler'
import { StorageProvider } from '@/components/storage-provider'
import './globals.css'

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: 'swap',
})

const tektur = Tektur({
  subsets: ["latin", "cyrillic"],
  variable: "--font-tektur",
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LifeOS - Personal Growth System',
  description: 'Turn your life into a game. Track goals, build habits, earn rewards.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LifeOS',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5ff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0f1a' },
  ],
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${tektur.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <StorageProvider>
            <GlobalErrorHandler>
              <AuthProvider>
                <SyncProvider>
                  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                    <RealtimeProvider>
                      <AuthInitializer />
                      {children}
                      <Toaster />
                    </RealtimeProvider>
                    <ServiceWorker />
                  </ThemeProvider>
                </SyncProvider>
              </AuthProvider>
            </GlobalErrorHandler>
          </StorageProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
