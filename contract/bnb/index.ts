import { useCallback, useState } from 'react';
import {
  Address,
  concat,
  encodePacked,
  Hash,
  Hex,
  keccak256,
  toBytes,
} from 'viem';
import {
  useAccount,
  usePublicClient,
  useSignMessage,
  useWriteContract,
} from 'wagmi';
import airdropAbi from './holo_airdrop.abi.json';

const contractAddress = '0x6A1E5F3955c095382c224B75859331f683E2d1ef';
export const evmContractAddress = contractAddress;

export interface SignData {
  user: Address;
  amount: bigint;
  proof: Hash[];
  expiredAt: bigint;
  signature: Hash;
}

interface ClaimStatus {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  transactionHash?: Hash;
}

// 定义生成签名的函数所需参数
interface GenerateSignatureParams {
  chainId: bigint; // Chain ID (e.g., Sepolia is 11155111n)
  contractAddress: Address; // Airdrop contract address
  receiverAddress: Address; // Receiver address for multiClaim
  amount: bigint; // Airdrop amount (in wei)
  proof: Hex[]; // Merkle Proof
  expiredAt: number; // Signature expiration timestamp (seconds)
}

/**
 * Custom hook to generate a signature for Airdrop contract's multiClaim
 * @param params - Parameters required for generating the signature
 * @returns - Object containing the SignData, loading state, and error
 */
export function useGenerateAirdropSignature() {
  // Get the connected account address using wagmi's useAccount
  const { address: userAddress } = useAccount();

  // Use wagmi's useSignMessage hook for signing
  const { signMessageAsync, data: signature, error } = useSignMessage();

  // Function to generate the signature
  const generateSignature = async (
    params: GenerateSignatureParams,
  ): Promise<SignData | undefined> => {
    const {
      chainId,
      contractAddress,
      receiverAddress,
      amount,
      proof,
      expiredAt,
    } = params;
    console.log('generate params: ', params);

    try {
      // --- Step 1: Calculate proof hash ---
      // Use viem's concat and keccak256 to mimic abi.encodePacked(proof)
      const proofHash = keccak256(concat(proof));
      console.log('Proof Hash:', proofHash);

      // --- Step 2: Build the message hash to sign ---
      // Mimic Solidity's abi.encodePacked(block.chainid, address(this), proofHash, _expectReciver, data.expiredAt)
      const messageHash = keccak256(
        encodePacked(
          ['uint256', 'address', 'bytes32', 'address', 'uint64'],
          [
            chainId,
            contractAddress,
            proofHash,
            receiverAddress,
            BigInt(expiredAt),
          ],
        ),
      );
      console.log('Message Hash to Sign:', messageHash);

      // --- Step 3: Sign the message hash ---
      // Use signMessageAsync to sign the hash (requires connected wallet)
      const signature = await signMessageAsync({
        message: { raw: toBytes(messageHash) },
      });

      if (!userAddress) {
        throw new Error('No connected wallet found');
      }

      // Return the complete SignData object
      return {
        user: userAddress,
        amount,
        proof,
        expiredAt: BigInt(expiredAt),
        signature,
      };
    } catch (err) {
      console.error('Error generating signature:', err);
      throw err;
    }
  };

  return {
    generateSignature,
    signature,
    error,
  };
}

export function useAirdropClaimOnBSC() {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  // Single claim function
  const claim = useCallback(
    async (phase: number, amount: bigint, proof: Hash[]) => {
      if (!publicClient) {
        throw new Error('Public client undefined');
      }
      setClaimStatus({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      try {
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: airdropAbi,
          functionName: 'claim',
          args: [phase, amount, proof],
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        setClaimStatus({
          isLoading: false,
          isSuccess: receipt.status === 'success',
          isError: false,
          error: null,
          transactionHash: hash,
        });

        return receipt;
      } catch (error) {
        setClaimStatus({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error instanceof Error ? error : new Error('Claim failed'),
        });
        throw error;
      }
    },
    [publicClient, writeContractAsync],
  );

  // Multi claim function
  const multiClaim = useCallback(
    async (phase: number, dataList: SignData[]) => {
      if (!publicClient) {
        throw new Error('Public client undefined');
      }
      setClaimStatus({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      try {
        console.log(phase, dataList);

        const hash = await writeContractAsync({
          address: contractAddress,
          abi: airdropAbi,
          functionName: 'multiClaim',
          args: [
            phase,
            dataList.map((data) => ({
              user: data.user,
              amount: data.amount,
              proof: data.proof,
              expredAt: data.expiredAt,
              signature: data.signature,
            })),
          ],
        });
        console.log(hash);

        // const receipt = await publicClient.waitForTransactionReceipt({ hash });

        setClaimStatus({
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
          transactionHash: hash,
        });

        return hash;
      } catch (error) {
        setClaimStatus({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error:
            error instanceof Error ? error : new Error('Multi claim failed'),
        });
        throw error;
      }
    },
    [publicClient, writeContractAsync],
  );

  // Check if address has claimed for a specific phase
  const hasClaimed = useCallback(
    async (phase: number, leaf: Hash): Promise<boolean> => {
      if (!publicClient) {
        throw new Error('Public client undefined');
      }
      try {
        const result = await publicClient.readContract({
          address: contractAddress,
          abi: airdropAbi,
          functionName: 'claimed',
          args: [phase, leaf],
        });
        return result as boolean;
      } catch (error) {
        console.error('Error checking claim status:', error);
        return false;
      }
    },
    [publicClient],
  );

  // Reset claim status
  const resetStatus = useCallback(() => {
    setClaimStatus({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      transactionHash: undefined,
    });
  }, []);

  return {
    claim,
    multiClaim,
    hasClaimed,
    claimStatus,
    resetStatus,
  };
}
