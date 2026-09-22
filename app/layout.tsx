import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafarPro - Travel Agency",
  description: "Umrah, Flight & Visa booking platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}