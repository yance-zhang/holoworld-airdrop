import Eligible1 from '@/assets/images/layout/eligible-1.svg';
import Eligible2 from '@/assets/images/layout/eligible-2.svg';
import Eligible3 from '@/assets/images/layout/eligible-3.svg';
import Eligible5 from '@/assets/images/layout/eligible-5.svg';
import Eligible6 from '@/assets/images/layout/eligible-6.svg';
import HoloIcon from '@/assets/images/layout/holo.svg';
import CheckAndSign from '@/components/EligibleCheck/checkAndSign';
import Stake from '@/components/Stake';
import VerifyAddress from '@/components/VerifyAddress';
import { FC, useState } from 'react';

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
  const [state, setState] = useState<'check' | 'claim' | 'stake'>('check');
  const [claimAmount, setClaimAmount] = useState<number>(0);

  const completeCheck = () => {
    setState('claim');
  };

  const completeClaim = (amount: number) => {
    setState('stake');
    setClaimAmount(amount);
  };

  return (
    <div className="relative flex flex-col items-center max-w-[100vw] p-4">
      <div className="relative flex flex-col items-center py-7 gap-8 w-full lg:max-w-[826px]">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex items-center justify-center gap-2">
              <span className="text-base font-semibold text-white/80">
                $HOLO Airdrop Is Live
              </span>
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
                }}
              ></span>
            </div>
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
          </div>
          <div className="w-full py-8">
            {state === 'check' && (
              <CheckAndSign completeCheck={completeCheck} />
            )}
            {state === 'claim' && (
              <VerifyAddress completeClaim={completeClaim} />
            )}
            {state === 'stake' && <Stake amount={claimAmount} />}
          </div>
        </div>

        <a className="" href="#" target={'_blank'}>
          <button className="btn btn-sm bg-transparent border-white/60 text-white/60 rounded-full hover:bg-transparent hover:text-[#6FFFCB] hover:border-[#6FFFCB]">
            Terms and Conditions
          </button>
        </a>
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
              <group.icon className="mb-2" fill="white" />
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
  );
};

export default Home;
