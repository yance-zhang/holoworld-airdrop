'use client';

import {
  AirdropProof,
  getAuthTextTemplate,
  getBscEligibilityProof,
  getSolanaEligibilityProof,
} from '@/api';
import { EvmSignedData, useAirdropClaimEvm } from '@/contract/bnb';
import { SolSignedData, useAirdropClaimSol } from '@/contract/solana';
import { shortenAddress } from '@/utils';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Address, formatEther } from 'viem';
import { ConnectedSolanaWallet } from '@privy-io/react-auth/solana';
import { ConnectedWallet } from '@privy-io/react-auth';

interface AppStoreContextType {
  // EVM
  evmVerifyAddress: string;
  setEvmVerifyAddress: (evmVerifyAddress: string) => void;
  evmReceiverAddress: string;
  setEvmReceiverAddress: (evmReceiverAddress: string) => void;
  evmVerifyWalletSignData: EvmSignedData | null;
  evmVerifyWalletAidropProof: AirdropProof | null;
  disconnectEvmVerifyAddress: () => void;
  onEvmVerifyAddressConnected: (
    connectedVerifyWallet: ConnectedWallet
  ) => Promise<{ isValid: boolean; errorMessage: string }>;
  onEvmReceiverAddressConnected: (
    connectedVerifyWallet: ConnectedWallet
  ) => Promise<{
    isValid: boolean;
    errorMessage: string;
  }>;

  // SOL
  solVerifyAddress: string;
  setSolVerifyAddress: (solVerifyAddress: string) => void;
  solReceiverAddress: string;
  setSolReceiverAddress: (solReceiverAddress: string) => void;
  solVerifyWalletSignData: SolSignedData | null;
  solVerifyWalletAidropProof: AirdropProof | null;
  disconnectSolVerifyAddress: () => void;
  onSolVerifyAddressConnected: (
    connectedVerifyWallet: ConnectedSolanaWallet
  ) => Promise<{ isValid: boolean; errorMessage: string }>;
  onSolReceiverAddressConnected: (
    connectedVerifyWallet: ConnectedSolanaWallet
  ) => Promise<{
    isValid: boolean;
    errorMessage: string;
  }>;
}

const AppStoreContext = createContext<AppStoreContextType>(
  {} as AppStoreContextType
);

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  //#region EVM

  //#region Hooks

  const { signClaimReward: signClaimRewardEvm, hasClaimed: hasClaimedEvm } =
    useAirdropClaimEvm();

  //#endregion

  //#region State

  const [evmReceiverAddress, setEvmReceiverAddress] = useState<string>('');
  const [evmVerifyAddress, setEvmVerifyAddress] = useState<string>('');
  const [evmVerifyWalletAidropProof, setEvmVerifyWalletAidropProof] =
    useState<AirdropProof | null>(null);
  const [evmVerifyWalletSignData, setEvmVerifyWalletSignData] =
    useState<EvmSignedData | null>(null);

  //#endregion

  //#region Functions

  const onEvmVerifyAddressConnected = useCallback(
    async (
      connectedVerifyWallet: ConnectedWallet
    ): Promise<{ isValid: boolean; errorMessage: string }> => {
      try {
        const tipInfoRes = await getAuthTextTemplate(
          connectedVerifyWallet.address
        );
        const { tip_info } = tipInfoRes;
        const signature = await connectedVerifyWallet.sign(tip_info);
        let res = await getBscEligibilityProof(
          connectedVerifyWallet.address,
          signature
        );

        if (res.error) {
          throw Error(
            `Account: ${shortenAddress(connectedVerifyWallet.address)} is not eligible.`
          );
        }

        if (
          res.proofs[0].proof === undefined ||
          res.proofs[0].proof.length === 0
        ) {
          throw Error(`Server busy, please try again later.`);
        }

        let totalClaimed = 0;
        for (let index = 0; index < res.proofs.length; index++) {
          const currentProof = res.proofs[index];
          const claimed = await hasClaimedEvm({
            phase: currentProof.phase,
            address: currentProof.address,
            amount: currentProof.amount,
            connectedVerifyWallet: connectedVerifyWallet,
          });

          if (claimed) {
            totalClaimed += Number(formatEther(BigInt(currentProof.amount)));
          }

          res.proofs[index].claimed = claimed;
        }

        res.claimed = totalClaimed;
        setEvmVerifyWalletAidropProof(res);

        return {
          isValid: true,
          errorMessage: '',
        };
      } catch (error: any) {
        console.error(error);
        return {
          isValid: false,
          errorMessage:
            error.message ?? 'Unexpected erorr! Please try again later.',
        };
      }
    },
    [evmReceiverAddress, hasClaimedEvm]
  );

  const onEvmReceiverAddressConnected = useCallback(
    async (
      connectedReceiverWallet: ConnectedWallet
    ): Promise<{
      isValid: boolean;
      errorMessage: string;
    }> => {
      try {
        if (!evmVerifyWalletAidropProof) {
          throw Error(
            'Missing validation for wallet! Please re-connect verify wallet.'
          );
        }

        // check claimed and sign reward
        for (const currentProof of evmVerifyWalletAidropProof.proofs) {
          if (currentProof.proof === undefined) {
            continue;
          }

          if (currentProof.claimed) {
            continue;
          }

          // This is the first proof that is not claimed or undefined
          // so we are gonna use it for the sign and actual claim request
          const chainId = BigInt(56);
          const amount = BigInt(currentProof.amount);
          const proof = currentProof.proof as any[];
          const expireAt = Math.floor(Date.now() / 1000) + 3600;
          const phase = currentProof.phase;

          const signData = await signClaimRewardEvm({
            chainId,
            receiverAddress: evmReceiverAddress as Address,
            amount,
            proof,
            expireAt,
            phase,
            connectedReceiverWallet,
          });
          setEvmVerifyWalletSignData(signData ? signData : null);
          break;
        }

        return {
          isValid: true,
          errorMessage: '',
        };
      } catch (error: any) {
        console.error(error);
        return {
          isValid: false,
          errorMessage:
            error.message ?? 'Unexpected erorr! Please try again later.',
        };
      }
    },
    [evmReceiverAddress, hasClaimedEvm]
  );

  const disconnectEvmVerifyAddress = () => {
    setEvmVerifyWalletAidropProof(null);
    setEvmVerifyWalletSignData(null);
    // disconnectEvm();
  };

  //#endregion

  //#endregion

  //#region SOL

  //#region Hooks

  const { signClaimReward: signClaimRewardSol, hasClaimed: hasClaimedSol } =
    useAirdropClaimSol();

  //#endregion

  //#region State

  const [solReceiverAddress, setSolReceiverAddress] = useState<string>('');
  const [solVerifyAddress, setSolVerifyAddress] = useState<string>('');
  const [solVerifyWalletAidropProof, setSolVerifyWalletAidropProof] =
    useState<AirdropProof | null>(null);
  const [solVerifyWalletSignData, setSolVerifyWalletSignData] =
    useState<SolSignedData | null>(null);

  //#endregion

  //#region Functions

  const onSolVerifyAddressConnected = useCallback(
    async (
      connectedVerifyWallet: ConnectedSolanaWallet
    ): Promise<{ isValid: boolean; errorMessage: string }> => {
      try {
        const infoRes = await getAuthTextTemplate(
          connectedVerifyWallet.address
        );

        if (!infoRes) {
          throw Error('Error when getting template!');
        }

        const message = infoRes.tip_info;
        const signature = await connectedVerifyWallet.signMessage!(
          Buffer.from(message)
        );
        const signatureString = bs58.encode(signature);
        let res = await getSolanaEligibilityProof(
          connectedVerifyWallet.address,
          signatureString
        );

        if (res.error) {
          throw Error(
            `Account: ${shortenAddress(connectedVerifyWallet.address)} is not eligible.`
          );
        }

        if (
          res.proofs[0].proof === undefined ||
          res.proofs[0].proof.length === 0
        ) {
          throw Error('Server busy, please try again later.');
        }

        // Check if the user has already claimed (check for each phase)
        let totalClaimed = 0;
        for (let index = 0; index < res.proofs.length; index++) {
          const currentProof = res.proofs[index];
          const phase = currentProof.phase;
          const claimed = await hasClaimedSol({
            phase,
            connectedVerifyWallet,
          });

          if (claimed) {
            totalClaimed += Number(currentProof.amount) / LAMPORTS_PER_SOL;
          }

          res.proofs[index].claimed = claimed;
        }

        res.claimed = totalClaimed;

        // Set the proof
        setSolVerifyWalletAidropProof(res);

        return {
          isValid: true,
          errorMessage: '',
        };
      } catch (error: any) {
        console.error(error);

        return {
          isValid: false,
          errorMessage:
            error.message ?? 'Unexpected erorr! Please try again later.',
        };
      }
    },
    [
      hasClaimedSol,
      getAuthTextTemplate,
      getSolanaEligibilityProof,
      setSolVerifyWalletAidropProof,
      setSolVerifyWalletSignData,
      shortenAddress,
      solReceiverAddress,
    ]
  );

  const onSolReceiverAddressConnected = useCallback(
    async (
      connectedReceiverWallet: ConnectedSolanaWallet
    ): Promise<{
      isValid: boolean;
      errorMessage: string;
    }> => {
      try {
        if (!solVerifyWalletAidropProof) {
          throw Error(
            'Missing validation for wallet! Please re-connect verify wallet.'
          );
        }

        for (const currentProof of solVerifyWalletAidropProof.proofs) {
          if (currentProof.proof === undefined) {
            continue;
          }

          if (currentProof.claimed) {
            continue;
          }

          // This is the first proof that is not claimed or undefined
          // so we are gonna use it for the sign and actual claim request
          const proof = currentProof.proof.map((x) => Buffer.from(x, 'hex'));
          const proofBuf = Buffer.concat(proof);
          const expireAt = Math.floor(Date.now() / 1000) + 3600;
          const amount = currentProof.amount;
          const signRes = await signClaimRewardSol(
            proofBuf,
            connectedReceiverWallet,
            expireAt,
            Number(amount)
          );
          setSolVerifyWalletSignData(signRes);
          break;
        }

        return {
          isValid: true,
          errorMessage: '',
        };
      } catch (error: any) {
        console.error(error);

        return {
          isValid: false,
          errorMessage:
            error.message ?? 'Unexpected erorr! Please try again later.',
        };
      }
    },
    [
      hasClaimedSol,
      getAuthTextTemplate,
      getSolanaEligibilityProof,
      setSolVerifyWalletAidropProof,
      setSolVerifyWalletSignData,
      shortenAddress,
      signClaimRewardSol,
      solReceiverAddress,
    ]
  );

  const disconnectSolVerifyAddress = () => {
    setSolVerifyWalletAidropProof(null);
    setSolVerifyWalletSignData(null);
    // disconnectSol();
  };

  //#endregion

  //#endregion

  return (
    <AppStoreContext.Provider
      value={{
        // EVM
        evmVerifyAddress,
        setEvmVerifyAddress,
        evmReceiverAddress,
        setEvmReceiverAddress,
        evmVerifyWalletSignData,
        evmVerifyWalletAidropProof,
        disconnectEvmVerifyAddress,
        onEvmVerifyAddressConnected,
        onEvmReceiverAddressConnected,

        // SOL
        solVerifyAddress,
        setSolVerifyAddress,
        solReceiverAddress,
        setSolReceiverAddress,
        solVerifyWalletSignData,
        solVerifyWalletAidropProof,
        disconnectSolVerifyAddress,
        onSolVerifyAddressConnected,
        onSolReceiverAddressConnected,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppStoreContext);

  return context;
};
