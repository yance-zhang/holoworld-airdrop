'use client';

import {
  AirdropProof,
  getAuthTextTemplate,
  getBscEligibilityProof,
  getSolanaEligibilityProof,
} from '@/api';
import {
  evmContractAddress,
  SignData,
  useAirdropClaimOnBSC,
  useGenerateAirdropSignature,
} from '@/contract/bnb';
import { SolSignedData, useAirdropClaimOnSolana } from '@/contract/solana';
import { shortenAddress } from '@/utils';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Address } from 'viem';
import { useChainId, useDisconnect, useSignMessage } from 'wagmi';
import ConnectWallet from '../components/ConnectWallet';
import { useToast } from './ToastContext';

interface AppStoreContextType {
  evmReceiverAddress: string;
  setEvmReceiverAddress: (address: string) => void;
  reset: () => void;
  evmOpen: boolean;
  openEvm: () => void;
  closeEvm: () => void;
  disconnectEvmAddress: (index: number) => void;
  evmAddressList: AirdropProof[];
  evmSignData: Record<string, SignData | undefined>[];
  onEvmConnected: (address: string) => void;
  solReceiverAddress: string;
  setSolReceiverAddress: (address: string) => void;
  openSol: () => void;
  closeSol: () => void;
  solAddressList: AirdropProof[];
  solSignedData?: SolSignedData;
  onSolConnected: (address: string) => void;
  disconnectSolAddress: () => void;
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
  disconnectEvmAddress(index) {},

  // sol
  solReceiverAddress: '',
  setSolReceiverAddress(address) {},
  openSol: () => {},
  closeSol: () => {},
  solAddressList: [],
  onSolConnected(address) {},
  disconnectSolAddress() {},
});

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // EVM
  const { generateSignature, signature } = useGenerateAirdropSignature();
  const chainId = useChainId();
  const { addToast } = useToast();
  const { disconnect: disconnectEvm } = useDisconnect();
  const { hasClaimed } = useAirdropClaimOnBSC();
  const [evmReceiverAddress, setEvmReceiverAddress] = useState<string>('');
  const [evmOpen, setEvmOpen] = useState<boolean>(false);
  const [evmAddressList, setEvmAddressList] = useState<AirdropProof[]>([]);
  const [evmSignData, setEvmSignData] = useState<
    Record<string, SignData | undefined>[]
  >([]);
  const { signMessageAsync } = useSignMessage();

  const openEvm = () => setEvmOpen(true);

  const closeEvm = () => setEvmOpen(false);

  const onEvmConnected = useCallback(
    async (address: string) => {
      try {
        const index = evmAddressList.findIndex(
          (addr) => addr.address === address,
        );
        if (index > -1 || !evmReceiverAddress) {
          return;
        }

        const tipInfoRes = await getAuthTextTemplate(address);

        const { tip_info } = tipInfoRes;
        const signature = await signMessageAsync({ message: tip_info });

        const res = await getBscEligibilityProof(address, signature);

        if (res.error) {
          addToast(`Account: ${shortenAddress(address)} is not eligible.`);
          disconnectEvm();
          return;
        }
        if (
          res.proofs[0].proof === undefined ||
          res.proofs[0].proof.length === 0
        ) {
          addToast(`Server busy, please try again later.`, 'warning');
          return;
        }

        // check claimed and sign reward
        let proofMap: Record<string, SignData | undefined> = {};
        for (let i = 0; i < res.proofs.length; i++) {
          const currentProof = res.proofs[i];
          const claimed = await hasClaimed({
            phase: currentProof.phase,
            address: currentProof.address,
            amount: currentProof.amount,
          });

          if (claimed) {
            proofMap[currentProof.phase] = undefined;
          } else {
            const signData = await generateSignature({
              chainId: BigInt(chainId),
              contractAddress: evmContractAddress,
              receiverAddress: evmReceiverAddress as Address,
              amount: BigInt(res.proofs[0].amount),
              proof: res.proofs[0].proof as any[],
              expiredAt: Math.floor(Date.now() / 1000) + 3600,
            });

            proofMap[currentProof.phase] = signData;
          }
        }

        setEvmSignData([...evmSignData, proofMap]);
        setEvmAddressList([...evmAddressList, res]);
        disconnectEvm();
      } catch (error) {
        console.log(error);
        disconnectEvm();
      }
    },
    [
      evmAddressList,
      evmReceiverAddress,
      signMessageAsync,
      generateSignature,
      chainId,
      addToast,
      disconnectEvm,
      evmSignData,
    ],
  );

  const disconnectEvmAddress = (index: number) => {
    if (index < 0 || index >= evmAddressList.length) {
      return;
    }
    const newEvmList = [...evmAddressList];
    newEvmList.splice(index, 1);
    setEvmAddressList(newEvmList);
    const newSignDataList = [...evmSignData];
    newSignDataList.splice(index, 1);
    setEvmSignData(newSignDataList);
    disconnectEvm();
  };

  // SOL
  const { setVisible } = useWalletModal();
  const { signMessage, publicKey, disconnect: disconnectSolana } = useWallet();
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
        const infoRes = await getAuthTextTemplate(address);
        console.log(infoRes);

        if (!infoRes) {
          console.log('error when getting template');
          return; // Add return here
        }

        const message = infoRes.tip_info;

        const signature = await signMessage!(Buffer.from(message));
        const signatureString = bs58.encode(signature);

        const res = await getSolanaEligibilityProof(address, signatureString);
        setSolAddressList([...solAddressList, res]);

        if (res.error) {
          addToast(`Account: ${shortenAddress(address)} is not eligible.`);
          disconnectSolana();
          return;
        }

        if (!solReceiverAddress) {
          return;
        }
        if (
          res.proofs[0].proof === undefined ||
          res.proofs[0].proof.length === 0
        ) {
          addToast(`Server busy, please try again later.`, 'warning');
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
        disconnectSolana();
        console.log(error);
      }
    },
    [publicKey, solAddressList, solReceiverAddress],
  );

  const disconnectSolAddress = () => {
    setSolAddressList([]);
    setSolSignedData(undefined);
    disconnectSolana();
  };

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
        disconnectEvmAddress,
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
        disconnectSolAddress,
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
