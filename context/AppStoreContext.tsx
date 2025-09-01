'use client';

import {
  AirdropProof,
  getBscAirdropProofApi,
  getSolanaAirdropProofApi,
} from '@/api';
import {
  evmContractAddress,
  SignData,
  useGenerateAirdropSignature,
} from '@/contract/bnb';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Address } from 'viem';
import { useChainId, useDisconnect } from 'wagmi';
import ConnectEvmWallet from '../components/ConnectWallet';
import { useToast } from './ToastContext';
import { shortenAddress } from '@/utils';

interface AppStoreContextType {
  receiverAddress: string;
  setReceiverAddress: (address: string) => void;
  reset: () => void;
  evmOpen: boolean;
  openEvm: () => void;
  closeEvm: () => void;
  evmAddressList: AirdropProof[];
  evmSignData: SignData[];
  openSol: () => void;
  closeSol: () => void;
  solAddressList: AirdropProof[];
}

const AppStoreContext = createContext<AppStoreContextType>({
  receiverAddress: '',
  setReceiverAddress(address) {},
  reset() {},
  // evm
  evmOpen: false,
  evmAddressList: [],
  evmSignData: [],
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
  const { generateSignature, signature } = useGenerateAirdropSignature();
  const chainId = useChainId();
  const { addToast } = useToast();
  const { disconnect: disconnectEvm } = useDisconnect();
  const [receiverAddress, setReceiverAddress] = useState<string>('');
  const [evmOpen, setEvmOpen] = useState<boolean>(false);
  const [evmAddressList, setEvmAddressList] = useState<AirdropProof[]>([]);
  const [evmSignData, setEvmSignData] = useState<SignData[]>([]);

  const openEvm = () => setEvmOpen(true);

  const closeEvm = () => setEvmOpen(false);

  const onEvmConnected = useCallback(
    async (address: string) => {
      const index = evmAddressList.findIndex(
        (addr) => addr.address === address,
      );
      console.log(receiverAddress, index);
      if (index > -1 || !receiverAddress) {
        return;
      }
      const res = await getBscAirdropProofApi(address);

      if (res.error) {
        addToast(`Account: ${shortenAddress(address)} is not eligible.`);
        disconnectEvm();
        return;
      }

      const signData = await generateSignature({
        chainId: BigInt(chainId),
        contractAddress: evmContractAddress,
        receiverAddress: receiverAddress as Address,
        amount: BigInt(res.amount),
        proof: res.proof as any[],
        expiredAt: Math.floor(Date.now() / 1000) + 3600,
      });

      if (signData) {
        setEvmSignData([...evmSignData, signData]);
      }

      setEvmAddressList([...evmAddressList, res]);
    },
    [
      addToast,
      chainId,
      disconnectEvm,
      evmAddressList,
      evmSignData,
      generateSignature,
      receiverAddress,
    ],
  );

  // SOL
  const { setVisible } = useWalletModal();
  const { publicKey } = useWallet();
  const [solAddressList, setSolAddressList] = useState<AirdropProof[]>([]);

  const openSol = () => {
    setVisible(true);
  };

  const closeSol = () => setVisible(false);

  const onSolConnected = useCallback(
    async (address: string) => {
      if (solAddressList.find((addr) => addr.address === address)) {
        return;
      }
      const res = await getSolanaAirdropProofApi(address);
      setSolAddressList([...solAddressList, res]);
    },
    [solAddressList],
  );

  const reset = () => {
    setReceiverAddress('');
    setEvmAddressList([]);
    setSolAddressList([]);
    setEvmSignData([]);
  };

  useEffect(() => {
    if (publicKey) {
      onSolConnected(publicKey.toBase58());
    }
  }, [publicKey]);

  return (
    <AppStoreContext.Provider
      value={{
        receiverAddress,
        setReceiverAddress,
        openEvm,
        closeEvm,
        reset,
        evmOpen,
        evmAddressList,
        evmSignData,
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
