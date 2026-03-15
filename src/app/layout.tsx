import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuiteSpotter - Social Listening & Sales Outreach",
  description: "Social listening and sales outreach for Detroit Lions and Red Wings suite packages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
