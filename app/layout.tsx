import type { Metadata } from "next";
import "./globals.css";

import { Inter } from 'next/font/google'
import {ThemeProvider} from "next-themes";
import Header from "@/components/header";
import Footer from "@/components/footer";
const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: "Киберарена IT.Moscow",
  description: "Киберарена IT.Moscow",
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
