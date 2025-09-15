import { useCallback, useState } from 'react';
import {
  Address,
  concat,
  createPublicClient,
  createWalletClient,
  custom,
  encodePacked,
  Hash,
  Hex,
  keccak256,
} from 'viem';
import { bsc } from 'viem/chains';
import airdropAbi from './holo_airdrop.abi.json';
import { ConnectedWallet, useSendTransaction } from '@privy-io/react-auth';
import { evmContractAddress } from '@/utils/constants';
import { AirdropProof } from '@/api';

export interface EvmSignedData {
  user: Address;
  amount: bigint;
  proof: Hash[];
  expiredAt: bigint;
  signature: Hash;
  phase: number;
}

export function useAirdropClaimEvm() {
  //#region Main Functions

  const claim = async ({
    proofInfo,
    signedData,
    connectedReceiverWallet,
  }: {
    proofInfo: AirdropProof;
    signedData: EvmSignedData;
    connectedReceiverWallet: ConnectedWallet;
  }) => {
    try {
      // Get the ethereum provider from the ConnectedWallet
      const provider = await connectedReceiverWallet.getEthereumProvider();

      // Create a Viem wallet client from the provider
      const walletClient = createWalletClient({
        account: connectedReceiverWallet.address as Address,
        chain: bsc,
        transport: custom(provider),
      });

      // Create a Viem public client from the provider
      const publicClient = createPublicClient({
        chain: bsc,
        transport: custom(provider),
      });

      // Send the claim transaction using wallet client
      const hash = await walletClient.writeContract({
        address: evmContractAddress,
        abi: airdropAbi,
        functionName: 'claim',
        args: [signedData.phase, signedData.amount, signedData.proof],
      });

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return receipt;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const hasClaimed = async ({
    phase,
    address,
    amount,
    connectedVerifyWallet,
  }: {
    phase: number;
    address: string;
    amount: string;
    connectedVerifyWallet: ConnectedWallet;
  }): Promise<boolean> => {
    try {
      // Get the ethereum provider from the ConnectedWallet
      const provider = await connectedVerifyWallet.getEthereumProvider();

      // Create a Viem public client from the provider
      const publicClient = createPublicClient({
        transport: custom(provider),
      });

      const leaf = createLeaf(phase, address, amount);
      const result = await publicClient.readContract({
        address: evmContractAddress,
        abi: airdropAbi,
        functionName: 'claimed',
        args: [phase, '0x' + leaf.toString('hex')],
      });
      return result as boolean;
    } catch (error) {
      console.error('Error checking claim status:', error);
      return false;
    }
  };

  const signClaimReward = async ({
    chainId,
    receiverAddress,
    amount,
    proof,
    expireAt,
    phase,
    connectedReceiverWallet,
  }: {
    chainId: bigint;
    receiverAddress: Address;
    amount: bigint;
    proof: Hex[];
    expireAt: number;
    phase: number;
    connectedReceiverWallet: ConnectedWallet;
  }): Promise<EvmSignedData | undefined> => {
    try {
      // --- Step 1: Calculate proof hash ---
      // Use viem's concat and keccak256 to mimic abi.encodePacked(proof)
      const proofHash = keccak256(concat(proof));

      // --- Step 2: Build the message hash to sign ---
      // Mimic Solidity's abi.encodePacked(block.chainid, address(this), proofHash, _expectReciver, data.expiredAt)
      const messageHash = keccak256(
        encodePacked(
          ['uint256', 'address', 'bytes32', 'address', 'uint64'],
          [
            chainId,
            evmContractAddress,
            proofHash,
            receiverAddress,
            BigInt(expireAt),
          ]
        )
      );

      // --- Step 3: Sign the message hash ---
      // Use signMessageAsync to sign the hash (requires connected wallet)
      // const signature = await signMessageAsync({
      //   message: { raw: toBytes(messageHash) },
      // });
      const signature = await connectedReceiverWallet.sign(messageHash);

      // Return the complete SignData object
      return {
        user: connectedReceiverWallet.address as `0x${string}`,
        amount,
        proof,
        phase,
        expiredAt: BigInt(expireAt),
        signature: signature as `0x${string}`,
      };
    } catch (err) {
      console.error('Error generating signature:', err);
      throw err;
    }
  };

  //#endregion

  //#region Helpers

  function createLeaf(phase: number, address: string, amount: string): Buffer {
    const types = ['uint8', 'address', 'uint256'] as const;
    const values: any = [phase, address, BigInt(amount)];
    const packedData = encodePacked(types, values);
    const hash = keccak256(packedData).slice(2);

    return Buffer.from(hash, 'hex');
  }

  //#endregion

  return {
    claim,
    hasClaimed,
    signClaimReward,
  };
}
