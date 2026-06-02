import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Los Jefes Taco Catering",
  description:
    "Modern taco catering with live booking estimates, weekend reservations, and aguas frescas included."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
