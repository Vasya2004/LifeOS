import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk, Tektur } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ServiceWorker } from '@/components/service-worker'
import { AuthProvider } from '@/lib/auth'
import { SyncProviderV2 } from '@/components/sync/sync-provider-v2'
import { RealtimeProvider } from '@/components/realtime-provider'
import { AuthInitializer } from '@/components/auth-initializer'
import { ErrorBoundary } from '@/components/error-boundary'
import { GlobalErrorHandler } from '@/components/global-error-handler'
import { StorageProvider } from '@/components/storage-provider'
import { HybridProvider } from '@/components/hybrid-provider'
import { getServerState } from '@/lib/storage/server'
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
    { media: '(prefers-color-scheme: dark)', color: '#030305' },
  ],
  userScalable: true,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get server state for SSR hydration
  const serverState = await getServerState()
  
  // Determine theme from server state or default
  const defaultTheme = serverState.settings?.theme ?? 'dark'

  return (
    <html lang="ru" suppressHydrationWarning data-theme="cosmic">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${tektur.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <HybridProvider initialState={serverState}>
            <StorageProvider>
              <GlobalErrorHandler>
                <AuthProvider>
                  <SyncProviderV2>
                    <ThemeProvider 
                      attribute="class" 
                      defaultTheme={defaultTheme}
                      enableSystem 
                      disableTransitionOnChange
                      forcedTheme={undefined}
                    >
                      <RealtimeProvider>
                        <AuthInitializer />
                        {children}
                        <Toaster />
                      </RealtimeProvider>
                      <ServiceWorker />
                    </ThemeProvider>
                  </SyncProviderV2>
                </AuthProvider>
              </GlobalErrorHandler>
            </StorageProvider>
          </HybridProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
