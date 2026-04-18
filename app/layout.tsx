import type { Metadata } from 'next'
import { Lexend_Deca } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/components/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"
import './globals.css'

const _geist = { subsets: ["latin"] }; // unused, keeping import to avoid breaking
const _geistMono = { subsets: ["latin"] };
const lexendDeca = Lexend_Deca({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-brand",
});

export const metadata: Metadata = {
  title: 'Đòi Nợ Thân Thiện | Đòi nợ tinh tế',
  description: 'Đòi nợ tinh tế, không hề mất lòng - Hệ thống nhắc nợ tự động thân thiện',
  generator: 'v0.app',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className="bg-background" suppressHydrationWarning>
      <body className={`font-sans antialiased ${lexendDeca.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
