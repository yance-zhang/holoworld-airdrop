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
  // const network = IS_DEV
  //   ? WalletAdapterNetwork.Devnet
  //   : WalletAdapterNetwork.Mainnet;

  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => {
    return network === WalletAdapterNetwork.Devnet
      ? clusterApiUrl(network)
      : 'https://boldest-patient-mound.solana-mainnet.quiknode.pro/f584bdb9ff535404170e4f40d5e63d02037ece73';
  }, [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
