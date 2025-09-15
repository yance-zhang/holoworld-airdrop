import { WalletListEntry } from '@privy-io/react-auth';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ChainType = 'SOL' | 'EVM';

interface WalletChainContextType {
  activeChain: ChainType;
  setActiveChain: (chain: ChainType) => void;
  walletList: WalletListEntry[];
  setWalletList: (walletList: WalletListEntry[]) => void;
}

const WalletChainContext = createContext<WalletChainContextType | undefined>(
  undefined
);

export const WalletChainProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeChain, setActiveChain] = useState<ChainType>('SOL');
  const [walletList, setWalletList] = useState<WalletListEntry[]>([]);

  return (
    <WalletChainContext.Provider
      value={{ activeChain, setActiveChain, walletList, setWalletList }}
    >
      {children}
    </WalletChainContext.Provider>
  );
};

export const useWalletChain = () => {
  const context = useContext(WalletChainContext);
  if (!context) {
    throw new Error('useWalletChain must be used within a WalletChainProvider');
  }
  return context;
};
