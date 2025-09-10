import { AirdropProof } from '@/api';
import { BN, Idl, Program, web3 } from '@coral-xyz/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionError,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import IDL from './holo_token_airdrop_solana.json';
import { useToast } from '@/context/ToastContext';

export const PROGRAMID_DEVNET = new PublicKey(
  'CFgjprV4jBBPD1yKjfADGE9nbtR3HhZ9fWCeYTHa4SbS',
);

export const airdropTokenMint = new PublicKey(
  '44jipRpRo1KfN3PqPAC1srL3nkRVjgxpGQr3pfWtbaXK',
);

export const lutAddress = new PublicKey(
  'F6yM2QhNqR2DH6gVZ6XoWVaNc3WSHuYpSLPwpbiWCJq1',
);

export const MERKLE_ROOT_SEEDS = Buffer.from('merkle_root');
export const CLAIM_RECORD_SEEDS = Buffer.from('claim_record');

export function newTransactionWithComputeUnitPriceAndLimit(): Transaction {
  return new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    }),
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 30000,
    }),
  );
}

export type SolSignedData = {
  signer: PublicKey;
  data: Uint8Array;
  signature: Uint8Array;
  proof: Buffer;
  expireAt: number;
};

export const useAirdropClaimOnSolana = () => {
  const { publicKey, sendTransaction, signMessage, signTransaction } =
    useWallet();
  const { connection } = useConnection();
  const { addToast } = useToast();

  async function sha256(input: Uint8Array): Promise<Uint8Array> {
    const hash = await crypto.subtle.digest('SHA-256', input as any);
    return new Uint8Array(hash);
  }

  async function signClaimReward(
    proof: Buffer,
    receiver: PublicKey,
    expireAt: number,
  ): Promise<SolSignedData> {
    if (!signMessage) {
      throw new Error('Sign message function is not available');
    }
    if (!receiver || !proof || !publicKey) {
      throw new Error('No receiver or proof or signer publicKey');
    }

    const expireAtBytes = new Uint8Array(8);
    const dataView = new DataView(expireAtBytes.buffer);
    dataView.setBigInt64(0, BigInt(expireAt), true);

    const proofHash = await sha256(proof);

    const receiverBytes = receiver.toBytes();
    const data = new Uint8Array([
      ...proofHash,
      ...receiverBytes,
      ...expireAtBytes,
    ]);

    const dataHash = await sha256(data);

    const dataHashStr = Array.from(dataHash)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    console.log('dataHashStr: ', dataHashStr);
    const messageToSign = new TextEncoder().encode(dataHashStr);

    console.log('messageToSign: ', messageToSign);
    const signature = await signMessage(messageToSign);

    return {
      data: messageToSign,
      signature,
      proof,
      expireAt,
      signer: publicKey,
    };
  }

  // const claimAirdrop = async ({
  //   receiverAddress,
  //   proofInfo,
  // }: {
  //   receiverAddress: string;
  //   proofInfo: AirdropProof;
  // }) => {
  //   if (!publicKey) {
  //     return;
  //   }
  //   const program = new Program(IDL as Idl, {
  //     connection,
  //   });

  //   const phase = solanaPhase;
  //   const receiver = new PublicKey(receiverAddress);

  //   const [merkleRoot, merkleRootBump] = PublicKey.findProgramAddressSync(
  //     [
  //       MERKLE_ROOT_SEEDS,
  //       phase.toArrayLike(Buffer, 'le', 1),
  //       airdropTokenMint.toBuffer(),
  //     ],
  //     program.programId,
  //   );
  //   console.log(
  //     'merkle_root(init), bump: ',
  //     merkleRoot.toBase58(),
  //     merkleRootBump,
  //   );

  //   const merkleRootInfo = await (program.account as any).merkleRoot.fetch(
  //     merkleRoot,
  //   );
  //   console.log('merkleRootInfo: ', JSON.stringify(merkleRootInfo));

  //   console.log(
  //     'merkleRoot: ',
  //     Buffer.from(merkleRootInfo.merkleRoot).toString('hex'),
  //   );

  //   const merkleTokenVault = getAssociatedTokenAddressSync(
  //     airdropTokenMint,
  //     merkleRoot,
  //     true,
  //     TOKEN_PROGRAM_ID,
  //   );
  //   console.log('merkleTokenVault: ', merkleTokenVault.toBase58());

  //   const userTokenVault = getAssociatedTokenAddressSync(
  //     airdropTokenMint,
  //     receiver,
  //     true,
  //     TOKEN_PROGRAM_ID,
  //   );
  //   console.log('userTokenVault: ', userTokenVault.toBase58());

  //   console.log('正在从链上获取地址查找表账户: ', lutAddress.toBase58());
  //   const lookupTableAccountResponse =
  //     await connection.getAddressLookupTable(lutAddress);

  //   const lookupTableAccount: AddressLookupTableAccount | null =
  //     lookupTableAccountResponse.value;

  //   if (!lookupTableAccount) {
  //     throw new Error(`无法在链上找到地址查找表: ${lutAddress.toBase58()}`);
  //   }

  //   let tx = newTransactionWithComputeUnitPriceAndLimit();

  //   const [claimRecord, claimRecordBump] = PublicKey.findProgramAddressSync(
  //     [
  //       CLAIM_RECORD_SEEDS,
  //       phase.toArrayLike(Buffer, 'le', 1),
  //       publicKey.toBuffer(),
  //       airdropTokenMint.toBuffer(),
  //     ],
  //     program.programId,
  //   );
  //   console.log(
  //     'claim record(init), bump: ',
  //     claimRecord.toBase58(),
  //     claimRecordBump,
  //   );

  //   const proof = proofInfo.proofs[0].proof.map((x) => Buffer.from(x, 'hex'));
  //   const proofBuf = Buffer.concat(proof);

  //   const inst = await program.methods
  //     .claimAirdrop(
  //       phase,
  //       new BN(proofInfo.proofs[0].amount), // amount
  //       proofBuf, // proof hash
  //       // new BN(proofInfo.proofs[0].index), // leaves index
  //     )
  //     .accounts({
  //       signer: publicKey,
  //       airdropTokenMint: airdropTokenMint,
  //       receiver: receiver,
  //       merkleRoot: merkleRoot,
  //       merkleTokenVault: merkleTokenVault,
  //       userTokenVault: userTokenVault,
  //       claimRecord: claimRecord,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .instruction();
  //   tx.add(inst);

  //   const { blockhash } = await connection.getLatestBlockhash();

  //   console.log(`blockhash: ${blockhash}`);

  //   const messageV0 = new TransactionMessage({
  //     payerKey: publicKey,
  //     recentBlockhash: blockhash,
  //     instructions: tx.instructions,
  //   }).compileToV0Message([lookupTableAccount]);

  //   const versionedTx = new VersionedTransaction(messageV0);
  //   const serializedTx = versionedTx.serialize();
  //   const txSize = serializedTx.length;

  //   let signature = '';

  //   try {
  //     // Sign transaction with wallet
  //     if (!signTransaction) {
  //       throw new Error('Wallet does not support transaction signing');
  //     }
  //     const signedTx = await signTransaction(versionedTx);

  //     // Send transaction
  //     signature = await connection.sendRawTransaction(signedTx.serialize());
  //     console.log(`Transaction sent: ${signature}`);

  //     // Confirm transaction
  //     const confirmation = await connection.confirmTransaction(
  //       signature,
  //       'confirmed',
  //     );
  //     console.log('Transaction confirmed:', confirmation);

  //     return signature;
  //   } catch (error: any) {
  //     console.error(error);
  //     // Handle SendTransactionError and fetch logs
  //     if (error.name === 'SendTransactionError') {
  //       const txError = error as TransactionError;
  //       const logs = await connection.getTransaction(signature, {
  //         commitment: 'confirmed',
  //         maxSupportedTransactionVersion: 0,
  //       });
  //       console.error(
  //         'Detailed transaction logs:',
  //         logs?.meta?.logMessages || [],
  //       );
  //       throw new Error(
  //         `SendTransactionError: ${error.message}, Logs: ${JSON.stringify(logs?.meta?.logMessages || [])}`,
  //       );
  //     }
  //   }
  // };

  const claimAirdropWithReceiver = async ({
    proofInfo,
    signedData,
  }: {
    proofInfo: AirdropProof;
    signedData: SolSignedData;
  }) => {
    if (!publicKey) {
      return;
    }

    const program = new Program(IDL as Idl, {
      connection,
    });

    console.log('正在从链上获取地址查找表账户...');
    const lookupTableAccountResponse =
      await connection.getAddressLookupTable(lutAddress);

    const lookupTableAccount: AddressLookupTableAccount | null =
      lookupTableAccountResponse.value;

    if (!lookupTableAccount) {
      throw new Error(`无法在链上找到地址查找表: ${lutAddress.toBase58()}`);
    }

    const userTokenVault = getAssociatedTokenAddressSync(
      airdropTokenMint,
      publicKey,
      true,
      TOKEN_PROGRAM_ID,
    );
    console.log('userTokenVault: ', userTokenVault.toBase58());

    let tx = newTransactionWithComputeUnitPriceAndLimit();

    let verifyInstIdx = 2;

    for (let i = 0; i < proofInfo.proofs.length; i++) {
      const proof = proofInfo.proofs[i];

      const phase = new BN(proof.phase);

      const [merkleRoot, merkleRootBump] = PublicKey.findProgramAddressSync(
        [
          MERKLE_ROOT_SEEDS,
          phase.toArrayLike(Buffer, 'le', 1),
          airdropTokenMint.toBuffer(),
        ],
        program.programId,
      );
      console.log(
        'merkle_root(init), bump: ',
        merkleRoot.toBase58(),
        merkleRootBump,
      );

      const merkleRootInfo = await (program.account as any).merkleRoot.fetch(
        merkleRoot,
      );
      console.log('merkleRootInfo: ', JSON.stringify(merkleRootInfo));

      console.log(
        'merkleRoot: ',
        Buffer.from(merkleRootInfo.merkleRoot).toString('hex'),
      );

      const merkleTokenVault = getAssociatedTokenAddressSync(
        airdropTokenMint,
        merkleRoot,
        true,
        TOKEN_PROGRAM_ID,
      );
      console.log('merkleTokenVault: ', merkleTokenVault.toBase58());

      const [claimRecord, claimRecordBump] = PublicKey.findProgramAddressSync(
        [
          CLAIM_RECORD_SEEDS,
          phase.toArrayLike(Buffer, 'le', 1),
          signedData.signer.toBuffer(),
          airdropTokenMint.toBuffer(),
        ],
        program.programId,
      );
      console.log(
        'claim record(init), bump: ',
        claimRecord.toBase58(),
        claimRecordBump,
      );

      // use claimRecord to check if already claimed
      const accountInfo = await connection.getAccountInfo(
        new PublicKey(claimRecord),
      );
      if (accountInfo) {
        console.log(
          'Account Balance:',
          accountInfo.lamports / 1_000_000_000,
          'SOL',
        );
        addToast('Account Already claimed', 'warning');
        return;
      }

      const verifySignInst = web3.Ed25519Program.createInstructionWithPublicKey(
        {
          publicKey: signedData.signer.toBytes(),
          message: signedData.data,
          signature: signedData.signature,
        },
      );

      tx.add(verifySignInst);

      const inst = await program.methods
        .claimAirdropWithReceiver(
          phase,
          signedData.signer,
          new BN(proof.amount), // amount
          signedData.proof, // proof hash
          new BN(signedData.expireAt), // expireAt
          signedData.signature,
          new BN(verifyInstIdx), // verify_ix_index
        )
        .accounts({
          signer: publicKey,
          airdropTokenMint: airdropTokenMint,
          merkleRoot: merkleRoot,
          merkleTokenVault: merkleTokenVault,
          userTokenVault: userTokenVault,
          claimRecord: claimRecord,
          ixSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction();
      tx.add(inst);
    }

    const { blockhash } = await connection.getLatestBlockhash();

    // console.log(`blockhash: ${blockhash}`);

    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: tx.instructions,
    }).compileToV0Message([lookupTableAccount]);

    const versionedTx = new VersionedTransaction(messageV0);
    const serializedTx = versionedTx.serialize();
    const txSize = serializedTx.length;

    // console.log(`✅ 这笔版本化交易的大小是: ${txSize} 字节`);

    let txSignature = '';

    try {
      // Sign transaction with wallet
      if (!signTransaction) {
        throw new Error('Wallet does not support transaction signing');
      }
      const signedTx = await signTransaction(versionedTx);

      // Send transaction
      txSignature = await connection.sendRawTransaction(signedTx.serialize());
      console.log(`Transaction sent: ${txSignature}`);

      // Confirm transaction
      // const confirmation = await connection.confirmTransaction(
      //   txSignature,
      //   'confirmed',
      // );
      // console.log('Transaction confirmed:', confirmation);

      return txSignature;
    } catch (error: any) {
      console.error(error);
      // Handle SendTransactionError and fetch logs
      if (error.name === 'SendTransactionError') {
        const txError = error as TransactionError;
        const logs = await connection.getTransaction(txSignature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        });
        console.error(
          'Detailed transaction logs:',
          logs?.meta?.logMessages || [],
        );
        throw new Error(
          `SendTransactionError: ${error.message}, Logs: ${JSON.stringify(logs?.meta?.logMessages || [])}`,
        );
      }
    }
  };

  return {
    // claimAirdrop,
    claimAirdropWithReceiver,
    signClaimReward,
  };
};
