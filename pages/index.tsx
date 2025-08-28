import Eligible1 from '@/assets/images/layout/eligible-1.svg';
import Eligible2 from '@/assets/images/layout/eligible-2.svg';
import Eligible3 from '@/assets/images/layout/eligible-3.svg';
import Eligible4 from '@/assets/images/layout/eligible-4.svg';
import Eligible5 from '@/assets/images/layout/eligible-5.svg';
import Eligible6 from '@/assets/images/layout/eligible-6.svg';
import VerifyAddress from '@/components/VerifyAddress';
import Cube from '@/assets/images/airdrop/cube.png';
import Envelope from '@/assets/images/airdrop/envelope.png';
import BackCube from '@/assets/images/airdrop/backcube.png';
import Image from 'next/image';
import { FC, useState } from 'react';
import EligibleCheck from '@/components/EligibleCheck';

const eligibleGroups = [
  {
    title: 'AVA Stakers',
    description: 'Eligible based on yourstaked amount andstaking duration',
    icon: Eligible1,
  },
  {
    title: 'AVA burners',
    description: `If you've burned AVA tokens during past campaigns, you qualify`,
    icon: Eligible2,
  },
  {
    title: 'Hololaunch $MIRAI + $LOUD pre-sale participants',
    description: 'Participants in SMIRAl or LOUD presales ',
    icon: Eligible3,
  },
  {
    title: 'Hologram app users',
    description:
      'Users of the Hologram Extension or Desktop App (hologram.xyz)',
    icon: Eligible4,
  },
  {
    title: '3D Pudgy Penguin claimers',
    description: 'Wallets that claimed a 3D Pudgy Penguin asset',
    icon: Eligible5,
  },
  {
    title: 'NFT Pass holders',
    description: 'Current NFT Pass holders are eligible for the airdrop',
    icon: Eligible6,
  },
];

const Home: FC = () => {
  const [state, setState] = useState<'check' | 'claim'>('check');

  const completeCheck = () => setState('claim');

  return (
    <div className="relative flex flex-col items-center py-7 gap-8 w-full max-w-[826px]">
      <div className="hidden lg:block z-[100] pointer-events-none">
        <Image
          src={Cube}
          alt=""
          className="absolute -left-[280px] top-[350px] w-[392px]"
        />
        <Image
          src={BackCube}
          alt=""
          className="absolute -right-[100px] top-[267px] w-[145px]"
        />
        <Image
          src={Envelope}
          alt=""
          className="absolute top-[495px] -right-[204px] w-[286px]"
        />
      </div>
      <div className="flex flex-col gap-6 items-center w-full">
        <div className="flex flex-col items-center gap-6 w-full max-w-[588px]">
          <div className="flex items-center justify-center gap-2 bg-[#FFFFFF5C] border-2 rounded-full w-full h-9 border-white">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
              }}
            ></span>
            <span className="text-base font-semibold text-black/80">
              $HOLO Airdrop Is Live
            </span>
          </div>
          <div className="font-[PPMonumentExtended] font-medium w-full leading-tight">
            <span className=" text-[64px] tracking-wide">Unlock Your </span>
            <span className=" text-[48px] text-nowrap">
              <div
                className="inline-block w-[260px] h-16 rounded-full text-center text-white font-bold mr-1.5"
                style={{
                  background:
                    'linear-gradient(150.13deg, #00ECDE 11.96%, #5BFA82 63.31%, #C1F74D 103.46%)',
                }}
              >
                $HOLO
              </div>
              Rewards
            </span>
          </div>
        </div>
        <div className="w-full py-8 bg-white/35 border-2 border-white rounded-3xl backdrop-blur-3xl">
          {/* {state === 'check' && <EligibleCheck completeCheck={completeCheck} />} */}
          {/* {state === 'claim' && <VerifyAddress />} */}
          <VerifyAddress />
        </div>
      </div>

      {/* eligible */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col items-center gap-2">
          <span className="font-bold text-black/95 text-base font-[PPMonumentExtended]">{`Who's Eligible For The Airdrop?`}</span>
          <span className="font-medium text-sm text-black/80">{`Connect your wallet to check if you're in one of these eligible groups:`}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full">
          {eligibleGroups.map((group) => (
            <div
              key={group.title}
              className="flex flex-col items-start gap-2 py-4 pl-5 pr-0 bg-white/80 border-2 border-white rounded-3xl backdrop-blur-3xl"
            >
              <group.icon className="mb-2" />
              <span className="font-bold text-black/95 text-base">
                {group.title}
              </span>
              <span className="font-medium text-black/65 text-xs">
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
