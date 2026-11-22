import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "../components/common/ClientProviders";

export const metadata: Metadata = {
  title: "GreenLedger | P2P Renewable Energy Trading & REC Settlement",
  description: "Decentralized, demand-aware peer-to-peer renewable energy trading platform on Ethereum Sepolia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-navy-100 antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
