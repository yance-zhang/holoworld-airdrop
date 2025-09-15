import { AirdropProof } from '@/api';
import { BN, Idl, Program, web3 } from '@coral-xyz/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionError,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import IDL from './holo_token_airdrop_solana.json';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { useSendTransaction } from '@privy-io/react-auth/solana';
import {
  // airdropTokenMint,
  DevnetProgramId,
  // lutAddress,
  solanaRPCEndpoint,
  DevnetAirdropTokenMint,
  DevnetLutAddress,
} from '@/utils/constants';

const MERKLE_ROOT_SEEDS = Buffer.from('merkle_root');
const CLAIM_RECORD_SEEDS = Buffer.from('claim_record');

export type SolSignedData = {
  signer: PublicKey;
  data: Uint8Array;
  signature: Uint8Array;
  proof: Buffer;
  expireAt: number;
  amount: number;
};

export const useAirdropClaimSol = () => {
  const { sendTransaction } = useSendTransaction();

  //#region Main Functions

  // Set the devnet addresses
  IDL.address = DevnetProgramId.toBase58();
  const airdropTokenMint = DevnetAirdropTokenMint;
  const lutAddress = DevnetLutAddress;

  const claim = async ({
    proofInfo,
    signedData,
    connectedReceiverWallet,
  }: {
    proofInfo: AirdropProof;
    signedData: SolSignedData;
    connectedReceiverWallet: ConnectedSolanaWallet;
  }) => {
    const connection = new Connection(solanaRPCEndpoint);
    const program = new Program(IDL as Idl, {
      connection,
    });
    const signerPublicKey = new PublicKey(connectedReceiverWallet.address);

    try {
      const lookupTableAccountResponse =
        await connection.getAddressLookupTable(lutAddress);

      const lookupTableAccount: AddressLookupTableAccount | null =
        lookupTableAccountResponse.value;

      if (!lookupTableAccount) {
        throw new Error(
          `Unable to find address lookup table on-chain: ${lutAddress.toBase58()}`
        );
      }

      const userTokenVault = getAssociatedTokenAddressSync(
        airdropTokenMint,
        signerPublicKey,
        true,
        TOKEN_2022_PROGRAM_ID
      );

      let tx = newTransactionWithComputeUnitPriceAndLimit();

      let verifyInstIdx = 2;

      for (let i = 0; i < proofInfo.proofs.length; i++) {
        const proof = proofInfo.proofs[i];

        const phase = new BN(proof.phase);

        const [merkleRoot] = PublicKey.findProgramAddressSync(
          [
            MERKLE_ROOT_SEEDS,
            phase.toArrayLike(Buffer, 'le', 1),
            airdropTokenMint.toBuffer(),
          ],
          program.programId
        );

        const merkleTokenVault = getAssociatedTokenAddressSync(
          airdropTokenMint,
          merkleRoot,
          true,
          TOKEN_2022_PROGRAM_ID
        );

        const [claimRecord] = PublicKey.findProgramAddressSync(
          [
            CLAIM_RECORD_SEEDS,
            phase.toArrayLike(Buffer, 'le', 1),
            signedData.signer.toBuffer(),
            airdropTokenMint.toBuffer(),
          ],
          program.programId
        );

        // use claimRecord to check if already claimed
        const accountInfo = await connection.getAccountInfo(
          new PublicKey(claimRecord)
        );
        if (accountInfo) {
          throw Error('Account Already claimed!');
        }

        const verifySignInst =
          web3.Ed25519Program.createInstructionWithPublicKey({
            publicKey: signedData.signer.toBytes(),
            message: signedData.data,
            signature: signedData.signature,
          });

        tx.add(verifySignInst);

        const inst = await program.methods
          .claimAirdropWithReceiver(
            phase,
            signedData.signer,
            new BN(proof.amount), // amount
            signedData.proof, // proof hash
            new BN(signedData.expireAt), // expireAt
            signedData.signature,
            new BN(verifyInstIdx) // verify_ix_index
          )
          .accounts({
            signer: signerPublicKey,
            airdropTokenMint: airdropTokenMint,
            merkleRoot: merkleRoot,
            merkleTokenVault: merkleTokenVault,
            userTokenVault: userTokenVault,
            claimRecord: claimRecord,
            ixSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction();
        tx.add(inst);
      }

      const { blockhash } = await connection.getLatestBlockhash();

      const messageV0 = new TransactionMessage({
        payerKey: signerPublicKey,
        recentBlockhash: blockhash,
        instructions: tx.instructions,
      }).compileToV0Message([lookupTableAccount]);

      const versionedTx = new VersionedTransaction(messageV0);

      let txSignature = '';

      // Send transaction using Privy's sendTransaction
      const receipt = await sendTransaction({
        transaction: versionedTx,
        connection: connection,
        address: connectedReceiverWallet.address,
      });

      txSignature = receipt.signature;
      return txSignature;
    } catch (error: any) {
      console.error(error);
      return null;
    }
  };

  const hasClaimed = async ({
    phase,
    connectedVerifyWallet,
  }: {
    phase: number;
    connectedVerifyWallet: ConnectedSolanaWallet;
  }) => {
    const connection = new Connection(solanaRPCEndpoint);
    const program = new Program(IDL as Idl, {
      connection,
    });

    const signerPublicKey = new PublicKey(connectedVerifyWallet.address);

    const [claimRecord] = PublicKey.findProgramAddressSync(
      [
        CLAIM_RECORD_SEEDS,
        new BN(phase).toArrayLike(Buffer, 'le', 1),
        signerPublicKey.toBuffer(),
        airdropTokenMint.toBuffer(),
      ],
      program.programId
    );

    // use claimRecord to check if already claimed
    const accountInfo = await connection.getAccountInfo(
      new PublicKey(claimRecord)
    );
    if (accountInfo) {
      // addToast('Account Already claimed', 'warning');
      return true;
    } else {
      return false;
    }
  };

  const signClaimReward = async (
    proof: Buffer,
    connectedReceiverWallet: ConnectedSolanaWallet,
    expireAt: number,
    amount: number
  ): Promise<SolSignedData> => {
    if (!proof) {
      throw new Error('No proof found!');
    }

    const receiverPublicKey = new PublicKey(connectedReceiverWallet.address);

    const expireAtBytes = new Uint8Array(8);
    const dataView = new DataView(expireAtBytes.buffer);
    dataView.setBigInt64(0, BigInt(expireAt), true);

    const proofHash = await sha256(proof);

    const receiverBytes = receiverPublicKey.toBytes();
    const data = new Uint8Array([
      ...proofHash,
      ...receiverBytes,
      ...expireAtBytes,
    ]);

    const dataHash = await sha256(data);

    const dataHashStr = Array.from(dataHash)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    const messageToSign = new TextEncoder().encode(dataHashStr);

    const signature = await connectedReceiverWallet.signMessage(messageToSign);

    return {
      data: messageToSign,
      signature,
      proof,
      expireAt,
      signer: receiverPublicKey,
      amount,
    };
  };

  //#endregion

  //#region Helpers

  const sha256 = async (input: Uint8Array): Promise<Uint8Array> => {
    const hash = await crypto.subtle.digest('SHA-256', input as any);
    return new Uint8Array(hash);
  };

  const newTransactionWithComputeUnitPriceAndLimit = (): Transaction => {
    return new Transaction().add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 1000000,
      }),
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 30000,
      })
    );
  };

  //#endregion

  return {
    claim,
    hasClaimed,
    signClaimReward,
  };
};
