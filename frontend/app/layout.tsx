import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormWise AI",
  description: "Smarter Forms. Instant Insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}