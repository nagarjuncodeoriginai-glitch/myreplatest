import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CodeOrigin.AI - HR Management System",
  description: "Advanced HR & Employee Management System by CodeOrigin.AI",
  keywords: ["HR", "Employee Management", "Leave Management", "CodeOrigin.AI", "HRMS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-white antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
