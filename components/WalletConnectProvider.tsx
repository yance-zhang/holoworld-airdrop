import React from 'react';
import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
interface WalletConnectProviderProps {
  children: React.ReactNode;
}

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

export default function WalletConnectProvider({
  children,
}: WalletConnectProviderProps) {
  const queryClient = new QueryClient();
  const privyConfig: PrivyClientConfig = {
    appearance: {
      theme: `#000000`,
    },
    externalWallets: {
      solana: {
        connectors: solanaConnectors,
      },
    },
  };

  return (
    <PrivyProvider
      clientId={
        process.env.NODE_ENV !== 'production'
          ? process.env.NEXT_PUBLIC_LOCAL_PRIVY_CLIENT_ID
          : undefined
      }
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PrivyProvider>
  );
}
