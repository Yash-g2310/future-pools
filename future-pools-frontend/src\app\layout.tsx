import { WagmiProvider } from './components/WagmiProvider';
import { AuthProvider } from './providers/AuthProvider';
import './styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}