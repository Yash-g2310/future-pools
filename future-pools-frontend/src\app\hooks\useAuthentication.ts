import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';

export function useAuthentication() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);
}