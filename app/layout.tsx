import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import React from "react";
import Header from "@/components/Header";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "My Dad Rocks",
  description: "The most awesome dad rock in the world!"
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body
      className={`{inter.className} text-rosePine-text bg-gradient-to-br from-rosePine-base to-rosePine-overlay`}>
    <Header/>
    <main className="flex flex-col min-h-screen justify-between">
      {children}
    </main>
    </body>
    </html>
  );
}
