import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/context/AuthProvider';
import { BetterAuthProvider } from '@/mocks/better-auth';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <BetterAuthProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </BetterAuthProvider>
  );
}