import type { Metadata } from "next";
import "./globals.css";

import { Inter } from 'next/font/google'
import {ThemeProvider} from "next-themes";
import Header from "@/components/page/header";
import Footer from "@/components/page/footer";
import { getConfig } from "@/lib/config";
const inter = Inter({ subsets: ['latin', 'cyrillic'] })


export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return {
    title: config.name,
    description: config.description,
  };
}

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
          <main className={"min-h-dvh"}>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
