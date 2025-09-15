import Eligible1 from '@/assets/images/layout/eligible-1.svg';
import Eligible2 from '@/assets/images/layout/eligible-2.svg';
import Eligible3 from '@/assets/images/layout/eligible-3.svg';
import Eligible5 from '@/assets/images/layout/eligible-5.svg';
import Eligible6 from '@/assets/images/layout/eligible-6.svg';
import HoloIcon from '@/assets/images/layout/holo.svg';
import Claim from '@/components/Claim';
import Stake from '@/components/Stake';
import Head from 'next/head';
import { useState } from 'react';

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

export default function Home() {
  //#region State

  const [state, setState] = useState<'claim' | 'stake'>('claim');
  const [claimAmount, setClaimAmount] = useState<number>(0);

  //#endregion

  //#region Functions

  const onCompleteClaim = (amount: number) => {
    setClaimAmount(amount);
    setState('stake');
  };

  //#endregion

  return (
    <>
      <Head>
        <title>Claim $HOLO Airdrop - HoloWorld</title>
        <meta
          name="description"
          content="Claim your $HOLO airdrop tokens and stake them for additional rewards."
        />
      </Head>
      <div className="relative flex max-w-[100vw] flex-col items-center p-4">
        <div className="relative flex w-full flex-col items-center lg:max-w-3xl lg:px-0">
          <div className="flex w-full flex-col items-center gap-6">
            <div className="flex w-full flex-col items-center gap-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-base font-semibold text-white/80">
                  $HOLO Airdrop Is Live
                </span>
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    background:
                      'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
                  }}
                ></span>
              </div>
              <div className="flex w-full flex-col items-center font-[PPMonumentExtended] font-medium uppercase tracking-tighter">
                <span className="text-[32px] tracking-wide lg:text-[72px]">
                  Unlock Your
                </span>
                <span className="flex items-center gap-4 text-nowrap text-[24px] lg:text-[72px]">
                  <span
                    className="text-center font-bold text-transparent"
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
            </div>
            <div className="w-full py-8">
              {state === 'claim' && <Claim completeClaim={onCompleteClaim} />}
              {state === 'stake' && <Stake amount={claimAmount} />}
            </div>
          </div>
        </div>

        {/* eligible */}
        <div className="flex w-full flex-col gap-4 lg:max-w-3xl">
          <div className="mb-8 flex min-h-14 flex-col items-center justify-center gap-3 text-base text-white/60 lg:flex-row">
            Total airdrop amount
            <span className="text-[32px] text-white">204,800,000</span>
            <span className="text-[32px] text-[#6FFFCB]">$HOLO</span>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-center">
            <span className="text-base font-semibold lg:text-xl">{`Who's Eligible For The Airdrop?`}</span>
            <span className="text-sm font-semibold opacity-60 lg:text-base">{`Connect your wallet to check if you're in one of these eligible groups:`}</span>
          </div>

          {/* Grid */}
          <div className="flex w-full flex-col gap-4">
            {/* First row - 3 items */}
            <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3">
              {eligibleGroups.slice(0, 3).map((group) => (
                <div
                  key={group.title}
                  className="flex flex-col items-start gap-2 py-4 pl-5 pr-0"
                >
                  <group.icon
                    width={37}
                    height={36}
                    className="mb-2"
                    fill="white"
                  />
                  <span className="text-base font-bold text-white">
                    {group.title}
                  </span>
                  <span className="whitespace-pre-line text-xs font-medium text-white/60">
                    {group.description}
                  </span>
                </div>
              ))}
            </div>

            {/* Second row - 2 items centered */}
            <div className="grid w-full grid-cols-2 gap-4 lg:flex lg:justify-center lg:gap-4">
              {eligibleGroups.slice(3, 5).map((group) => (
                <div
                  key={group.title}
                  className="flex flex-col items-start gap-2 py-4 pl-5 pr-0 lg:w-1/3"
                >
                  <group.icon
                    width={37}
                    height={36}
                    className="mb-2"
                    fill="white"
                  />
                  <span className="text-base font-bold text-white">
                    {group.title}
                  </span>
                  <span className="whitespace-pre-line text-xs font-medium text-white/60">
                    {group.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
