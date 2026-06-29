import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "OpenForge",
  title: {
    default: "OpenForge",
    template: "%s | OpenForge"
  },
  description: "AI-powered workspace for understanding repositories and contributing to open source.",
  openGraph: {
    title: "OpenForge",
    description: "AI-powered workspace for understanding repositories and contributing to open source.",
    siteName: "OpenForge",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "OpenForge",
    description: "AI-powered workspace for understanding repositories and contributing to open source."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
