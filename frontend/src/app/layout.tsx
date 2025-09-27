import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";
import WagmiWrapper from "./components/WagmiProvider";

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-vt323'
});

export const metadata: Metadata = {
  title: "Proof of Human - Wallet & Verification",
  description: "Connect wallet and verify passport for Proof of Human",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body className={vt323.variable}>
        <WagmiWrapper>
          {children}
        </WagmiWrapper>
      </body>
    </html>
  );
}
