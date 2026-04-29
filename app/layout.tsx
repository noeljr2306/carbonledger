import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarbonLedger — Scope 3 Carbon Accounting",
  description: "Automated Scope 3 carbon accounting for supply chains",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}