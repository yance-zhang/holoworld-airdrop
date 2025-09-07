import { FC, useEffect } from 'react';
import StakeIcon from '@/assets/images/airdrop/stake.svg';
import { formatBalanceNumber } from '@/utils';
import JSConfetti from 'js-confetti';

const Stake: FC<{ amount: number }> = ({ amount }) => {
  useEffect(() => {
    const jsConfetti = new JSConfetti();
    setTimeout(() => {
      jsConfetti.addConfetti({
        confettiColors: ['#9b5de5', '#f15bb5', '#fee440', '#00bbf9', '#00f5d4'],
        confettiNumber: 1000,
      });
    }, 500);
  }, []);

  return (
    <div className="flex flex-col items-center gap-12 w-full">
      <div className="flex flex-col items-center gap-3">
        <StakeIcon />
        <div className="flex items-end">
          <span className="font-[PPMonumentExtended] text-[30px]">
            {formatBalanceNumber(amount)}
          </span>
          <span className="font-medium text-xs text-white/80">$HOLO</span>
        </div>
        <span className="text-sm text-white/80">Successfully Claimed</span>
        <span className="text-sm text-white/80">
          Successfully completed the claim, check the wallet for more details
        </span>
      </div>

      <button
        className="btn mt-3 w-[280px] lg:w-[360px] rounded-full border-none text-black/95 font-bold text-sm disabled:text-black/50"
        style={{
          background:
            'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
        }}
      >
        Stake $HOLO Now
      </button>
    </div>
  );
};

export default Stake;
