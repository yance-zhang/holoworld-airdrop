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
import { SolSignedData, useAirdropClaimOnSolana } from '@/contract/solana';
import { shortenAddress } from '@/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Address } from 'viem';
import { useChainId, useDisconnect } from 'wagmi';
import ConnectWallet from '../components/ConnectWallet';
import { useToast } from './ToastContext';

interface AppStoreContextType {
  evmReceiverAddress: string;
  setEvmReceiverAddress: (address: string) => void;
  reset: () => void;
  evmOpen: boolean;
  openEvm: () => void;
  closeEvm: () => void;
  evmAddressList: AirdropProof[];
  evmSignData: SignData[];
  onEvmConnected: (address: string) => void;
  solReceiverAddress: string;
  setSolReceiverAddress: (address: string) => void;
  openSol: () => void;
  closeSol: () => void;
  solAddressList: AirdropProof[];
  solSignedData?: SolSignedData;
  onSolConnected: (address: string) => void;
}

const AppStoreContext = createContext<AppStoreContextType>({
  evmReceiverAddress: '',
  setEvmReceiverAddress(address) {},
  reset() {},
  // evm
  evmOpen: false,
  evmAddressList: [],
  evmSignData: [],
  openEvm: () => {},
  closeEvm: () => {},
  onEvmConnected(address) {},

  // sol
  solReceiverAddress: '',
  setSolReceiverAddress(address) {},
  openSol: () => {},
  closeSol: () => {},
  solAddressList: [],
  onSolConnected(address) {},
});

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // EVM
  const { generateSignature, signature } = useGenerateAirdropSignature();
  const chainId = useChainId();
  const { addToast } = useToast();
  const { disconnect: disconnectEvm } = useDisconnect();
  const [evmReceiverAddress, setEvmReceiverAddress] = useState<string>('');
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
      if (index > -1 || !evmReceiverAddress) {
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
        receiverAddress: evmReceiverAddress as Address,
        amount: BigInt(res.proofs[0].amount),
        proof: res.proofs[0].proof as any[],
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
      evmReceiverAddress,
    ],
  );

  // SOL
  const { setVisible } = useWalletModal();
  const { signMessage, publicKey } = useWallet();
  const { signClaimReward } = useAirdropClaimOnSolana();
  // const [solOpen, setSolOpen] = useState<boolean>(false);
  const [solReceiverAddress, setSolReceiverAddress] = useState<string>('');
  const [solAddressList, setSolAddressList] = useState<AirdropProof[]>([]);
  const [solSignedData, setSolSignedData] = useState<SolSignedData>();

  const openSol = () => setVisible(true);

  const closeSol = () => setVisible(false);

  const onSolConnected = useCallback(
    async (address: string) => {
      console.log(address);
      if (
        solAddressList.find((addr) => addr.address === address) ||
        solAddressList.length === 1
      ) {
        return;
      }

      try {
        const res = await getSolanaAirdropProofApi(address);
        setSolAddressList([...solAddressList, res]);

        if (!solReceiverAddress) {
          return;
        }
        const proof = res.proofs[0].proof.map((x) => Buffer.from(x, 'hex'));
        const proofBuf = Buffer.concat(proof);
        const expireAt = Math.floor(Date.now() / 1000) + 3600;

        const signRes = await signClaimReward(
          proofBuf,
          new PublicKey(solReceiverAddress),
          expireAt,
        );

        setSolSignedData(signRes);
      } catch (error) {
        console.log(error);
      }
    },
    [publicKey, solAddressList, solReceiverAddress],
  );

  const reset = () => {
    setSolReceiverAddress('');
    setEvmReceiverAddress('');
    setEvmAddressList([]);
    setSolAddressList([]);
    setEvmSignData([]);
  };

  return (
    <AppStoreContext.Provider
      value={{
        // evm
        evmOpen,
        evmReceiverAddress,
        evmAddressList,
        evmSignData,
        openEvm,
        closeEvm,
        onEvmConnected,
        setEvmReceiverAddress,
        reset,
        // sol
        solReceiverAddress,
        solAddressList,
        solSignedData,
        openSol,
        closeSol,
        onSolConnected,
        setSolReceiverAddress,
      }}
    >
      {children}
      <ConnectWallet open={evmOpen} onClose={closeEvm} />
    </AppStoreContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppStoreContext);

  return context;
};
