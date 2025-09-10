import Eligible1 from '@/assets/images/layout/eligible-1.svg';
import Eligible2 from '@/assets/images/layout/eligible-2.svg';
import Eligible3 from '@/assets/images/layout/eligible-3.svg';
import Eligible5 from '@/assets/images/layout/eligible-5.svg';
import Eligible6 from '@/assets/images/layout/eligible-6.svg';
import HoloIcon from '@/assets/images/layout/holo.svg';
import EligibleCheck from '@/components/EligibleCheck';
import Head from 'next/head';
import { FC, SVGProps, useState } from 'react';

export const EligibleIconMap: Record<string, FC<SVGProps<any>>> = {
  launch_agent_token: Eligible3,
  burn_airdrop: Eligible2,
  nft_holder: Eligible6,
  stake_airdrop: Eligible1,
  '3d_pudgy_penguin': Eligible5,
};

const eligibleGroups = [
  {
    title: 'AVA Stakers',
    description: 'Eligible based on your staked amount and staking duration',
    icon: Eligible1,
  },
  {
    title: 'AVA burners',
    description: `If you've burned AVA tokens during past campaigns, you qualify`,
    icon: Eligible2,
  },
  {
    title: 'Launch on Agent Market',
    description:
      'If you have previously issued Agent Tokens on HoloLaunch, you are eligible.',
    icon: Eligible3,
  },
  {
    title: '3D Pudgy Penguin claimers',
    description: 'Wallets that claimed a 3D Pudgy Penguin asset',
    icon: Eligible5,
  },
  {
    title: 'NFT Pass Holders',
    description:
      'If you previously held a Holo NFT on opBNB or Arbitrum, please enter the same EVM wallet address here under the BNB section.\nYour eligibility is linked to your EVM address, not the network.',
    icon: Eligible6,
  },
];

const Home: FC = () => {
  const [state, setState] = useState<'check' | 'claim'>('check');

  const completeCheck = () => setState('claim');

  return (
    <>
      <Head>
        <title>HoloWorld Airdrop - Check Your $HOLO Eligibility</title>
        <meta name="description" content="Check your eligibility and claim your $HOLO tokens. Available for AVA stakers, burners, NFT holders, and more." />
      </Head>
      <div className="relative flex flex-col items-center max-w-[100vw] p-4">
        <div className="relative flex flex-col items-center py-7 gap-8 w-full lg:max-w-[826px]">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex flex-col items-center font-[PPMonumentExtended] font-medium w-full tracking-tighter uppercase">
              <span className="text-[32px] lg:text-[72px] tracking-wide">
                Unlock Your
              </span>
              <span className="flex items-center gap-4 text-[24px] lg:text-[72px] text-nowrap">
                <span
                  className="text-center text-transparent font-bold"
                  style={{
                    background:
                      'linear-gradient(170.33deg, #08EDDF 15.85%, #CEED8B 80.92%)',
                    backgroundClip: 'text',
                  }}
                >
                  $HOLO
                </span>
                <HoloIcon />
                Rewards
              </span>
            </div>
            <div
              className="mt-10 rounded-md py-1.5 px-3 text-base font-semibold text-black"
              style={{
                background: `linear-gradient(180deg, #08EDDF 0%, #CEED8B 100%)`,
              }}
            >
              Claim start at September 11, 2025 11:00 am UTC
            </div>
          </div>
          <div className="w-full py-8">
            <EligibleCheck completeCheck={completeCheck} />
          </div>
        </div>
      </div>

      {/* eligible */}
      <div className="flex flex-col gap-4 w-full max-w-[1236px]">
        <div className="flex flex-col items-start lg:items-center gap-2">
          <span className="font-semibold text-base lg:text-xl">{`Who's Eligible For The Airdrop?`}</span>
          <span className="font-semibold text-sm lg:text-base opacity-60">{`Connect your wallet to check if you're in one of these eligible groups:`}</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 w-full">
          {eligibleGroups.map((group) => (
            <div
              key={group.title}
              className="flex flex-col items-start gap-2 py-4 pl-5 pr-0 border-b border-white/10"
            >
              <group.icon
                width={37}
                height={36}
                className="mb-2"
                fill="white"
              />
              <span className="font-bold text-white text-base">
                {group.title}
              </span>
              <span className="font-medium text-white/60 text-xs whitespace-pre-line">
                {group.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default Home;
