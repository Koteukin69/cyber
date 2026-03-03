import type { Metadata } from "next";
import "./globals.css";

import { Inter } from 'next/font/google'
import {ThemeProvider} from "next-themes";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Config from "@/lib/config";
const inter = Inter({ subsets: ['latin', 'cyrillic'] })


export const metadata: Metadata = {
  title: Config.name,
  description: Config.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
