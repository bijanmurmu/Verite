import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verité | The Anchor Protocol",
  description: "Cryptographic proof of reality through immutable hardware telemetry.",
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
