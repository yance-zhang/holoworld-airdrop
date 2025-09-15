import { FC, SVGProps } from 'react';
import Eligible1 from '@/assets/images/layout/eligible-1.svg';
import Eligible2 from '@/assets/images/layout/eligible-2.svg';
import Eligible3 from '@/assets/images/layout/eligible-3.svg';
import Eligible5 from '@/assets/images/layout/eligible-5.svg';
import Eligible6 from '@/assets/images/layout/eligible-6.svg';
import EthIcon from '@/assets/images/airdrop/eth.svg';
import SolIcon from '@/assets/images/airdrop/sol.svg';
import { ChainType } from '@/context/WalletChainContext';
import { PublicKey } from '@solana/web3.js';

export const EligibleIconMap: Record<string, FC<SVGProps<any>>> = {
  launch_agent_token: Eligible3,
  burn_airdrop: Eligible2,
  nft_holder: Eligible6,
  stake_airdrop: Eligible1,
  '3d_pudgy_penguin': Eligible5,
};

export const NetworkTabs = [
  { type: 'SOL' as ChainType, icon: SolIcon },
  { type: 'EVM' as ChainType, icon: EthIcon },
];

// SOL
export const solanaRPCEndpoint =
  'https://mainnet.helius-rpc.com/?api-key=29971f22-a8d6-4db6-baee-9b9864473598';
export const airdropTokenMint = new PublicKey(
  '69RX85eQoEsnZvXGmLNjYcWgVkp9r2JjahVm99KbJETU'
);
export const lutAddress = new PublicKey(
  'HjvYznDvnN2vwajwuWwpWwSJetpVydYF6pyAyxLvRAfR'
);

// SOL DEVNET
export const DevnetProgramId = new PublicKey(
  'CFgjprV4jBBPD1yKjfADGE9nbtR3HhZ9fWCeYTHa4SbS'
);
export const DevnetAirdropTokenMint = new PublicKey(
  'Gj9HJ5gNUt5gPztwqMsE49yRSUhHZaJgMA7A4TBwo6dK'
);
export const DevnetLutAddress = new PublicKey(
  'Ce1y1DpBfC9EaWqTGB4ADhzJvmhcLWB8fbHwtzW4oHLi'
);
export const DevnetAirdropPhase = 1;

// EVM
export const evmContractAddress = '0xC8f69699d08d5A94c837e51BFBa3AC466f9dB256';
