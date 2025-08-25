'use client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { clusterApiUrl } from '@solana/web3.js';
import { FC, useMemo } from 'react';
import { IS_DEV } from '../api';

export const SolanaWalletProvider: FC<{ children: any }> = ({ children }) => {
  const network = IS_DEV
    ? WalletAdapterNetwork.Devnet
    : WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <ConnectionProvider
      endpoint={
        IS_DEV
          ? endpoint
          : 'https://boldest-patient-mound.solana-mainnet.quiknode.pro/f584bdb9ff535404170e4f40d5e63d02037ece73'
      }
    >
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
