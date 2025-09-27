import type { Metadata } from "next";
import "./globals.css";
import WagmiWrapper from "./components/WagmiProvider";

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
      <body>
        <WagmiWrapper>
          {children}
        </WagmiWrapper>
      </body>
    </html>
  );
}
