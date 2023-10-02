
import { Inter, Lexend } from 'next/font/google'
import clsx from 'clsx'
import Head from 'next/head'
import '@/styles/tailwind.css'

export const metadata = {
  title: {
    template: '%s - Courser',
    default: 'Courser - An AI assistant for college students',
  },
  description:
    'Become a 10x student',
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
})

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={clsx(
        'h-full scroll-smooth bg-white antialiased',
        inter.variable,
        lexend.variable,
      )}
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className="flex h-full flex-col">{children}</body>
    </html>
  )
}
