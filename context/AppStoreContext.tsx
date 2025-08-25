'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import ConnectEvmWallet from '../components/ConnectWallet';

interface AppStoreContextType {
  evmOpen: boolean;
  openEvm: () => void;
  closeEvm: () => void;
  evmAddressList: string[];
  openSol: () => void;
  closeSol: () => void;
  solAddressList: string[];
}

const AppStoreContext = createContext<AppStoreContextType>({
  // evm
  evmOpen: false,
  evmAddressList: [],
  openEvm: () => {},
  closeEvm: () => {},
  // sol
  openSol: () => {},
  closeSol: () => {},
  solAddressList: [],
});

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // EVM
  const [evmOpen, setEvmOpen] = useState<boolean>(false);
  const [evmAddressList, setEvmAddressList] = useState<string[]>([]);

  const openEvm = () => setEvmOpen(true);

  const closeEvm = () => setEvmOpen(false);

  const onEvmConnected = (address: string) => {
    if (evmAddressList.find((addr) => addr === address)) {
      return;
    }
    setEvmAddressList([...evmAddressList, address]);
  };

  // SOL
  const { setVisible } = useWalletModal();
  const { publicKey } = useWallet();
  const [solAddressList, setSolAddressList] = useState<string[]>([]);

  const openSol = () => {
    setVisible(true);
  };

  const closeSol = () => setVisible(false);

  const onSolConnected = useCallback(
    (address: string) => {
      if (solAddressList.find((addr) => addr === address)) {
        return;
      }
      setSolAddressList([...solAddressList, address]);
    },
    [solAddressList],
  );

  useEffect(() => {
    if (publicKey) {
      onSolConnected(publicKey.toBase58());
    }
  }, [onSolConnected, publicKey]);

  return (
    <AppStoreContext.Provider
      value={{
        openEvm,
        closeEvm,
        evmOpen,
        evmAddressList,
        openSol,
        closeSol,
        solAddressList,
      }}
    >
      {children}
      <ConnectEvmWallet
        open={evmOpen}
        onClose={closeEvm}
        onConnected={onEvmConnected}
      />
    </AppStoreContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppStoreContext);

  return context;
};
