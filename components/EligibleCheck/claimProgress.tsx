import Days60Icon from '@/assets/images/airdrop/60days.svg';
import ProgressSvg from '@/assets/images/airdrop/claim-progress.svg';
import ReloadIcon from '@/assets/images/airdrop/reload.svg';
import { formatBalanceNumber } from '@/utils';
import { FC, useState } from 'react';
import TermsModal from '../DisclaimerModal/terms';

const HoloToken = () => {
  return (
    <div
      className="flex items-center gap-0.5 py-1 px-1.5 rounded-[3px] text-xs text-black"
      style={{
        background: `linear-gradient(180deg, #08EDDF 0%, #CEED8B 100%)`,
      }}
    >
      <svg
        width="15"
        height="16"
        viewBox="0 0 15 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.0156 0.75C10.5267 0.750063 10.9412 1.06149 11.2529 1.45703C11.5687 1.85772 11.834 2.4094 12.0479 3.05078C12.3171 3.85862 12.5179 4.8486 12.6309 5.94629C12.6537 5.9537 12.6767 5.96026 12.6992 5.96777C13.3406 6.18158 13.8923 6.44689 14.293 6.7627C14.6885 7.07444 14.9999 7.48891 15 8C15 8.51117 14.6886 8.9265 14.293 9.23828C13.8923 9.55398 13.3404 9.81847 12.6992 10.0322C12.6768 10.0397 12.6536 10.0454 12.6309 10.0527C12.5179 11.1508 12.3172 12.1411 12.0479 12.9492C11.834 13.5906 11.5687 14.1423 11.2529 14.543C10.9412 14.9385 10.5267 15.2499 10.0156 15.25C9.50445 15.25 9.08912 14.9386 8.77734 14.543C8.46165 14.1423 8.19715 13.5904 7.9834 12.9492C7.8973 12.6909 7.8216 12.4132 7.75 12.1201C7.67839 12.4133 7.60175 12.6909 7.51562 12.9492C7.30184 13.5905 7.03744 14.1423 6.72168 14.543C6.41 14.9384 5.99533 15.2498 5.48438 15.25C4.9732 15.25 4.55787 14.9386 4.24609 14.543C3.93034 14.1423 3.66593 13.5905 3.45215 12.9492C3.18268 12.1408 2.98011 11.1504 2.86719 10.0518C2.84515 10.0446 2.82256 10.0395 2.80078 10.0322C2.15956 9.81847 1.6077 9.55398 1.20703 9.23828C0.811443 8.9265 0.5 8.51117 0.5 8C0.500064 7.48891 0.811492 7.07444 1.20703 6.7627C1.60772 6.44689 2.1594 6.18158 2.80078 5.96777C2.82265 5.96048 2.84505 5.95446 2.86719 5.94727C2.98013 4.84905 3.18276 3.85892 3.45215 3.05078C3.66593 2.40948 3.93034 1.85771 4.24609 1.45703C4.55787 1.06144 4.9732 0.75 5.48438 0.75C5.99533 0.750191 6.41 1.06156 6.72168 1.45703C7.03744 1.85771 7.30184 2.40947 7.51562 3.05078C7.60166 3.30887 7.67844 3.58608 7.75 3.87891C7.82154 3.58617 7.89739 3.3088 7.9834 3.05078C8.19715 2.40956 8.46165 1.8577 8.77734 1.45703C9.08912 1.06144 9.50445 0.75 10.0156 0.75ZM3.81152 10.3105C3.92284 11.2095 4.09394 12.0104 4.31152 12.6631C4.50772 13.2516 4.73169 13.6953 4.95801 13.9824C5.18831 14.2746 5.36989 14.3438 5.48438 14.3438C5.59888 14.3436 5.77979 14.2741 6.00977 13.9824C6.23608 13.6953 6.46005 13.2516 6.65625 12.6631C6.84122 12.1082 6.99234 11.4461 7.10254 10.708C5.89716 10.6709 4.77363 10.5304 3.81152 10.3105ZM11.6865 10.3105C10.7243 10.5302 9.60085 10.671 8.39551 10.708C8.50571 11.4462 8.65779 12.1082 8.84277 12.6631C9.03898 13.2516 9.26293 13.6953 9.48926 13.9824C9.71962 14.2747 9.90112 14.3438 10.0156 14.3438C10.1301 14.3437 10.3117 14.2746 10.542 13.9824C10.7683 13.6953 10.9913 13.2515 11.1875 12.6631C11.4051 12.0104 11.5752 11.2095 11.6865 10.3105ZM7.21191 6.19629C5.89089 6.23156 4.6893 6.39589 3.71777 6.64551C3.68766 7.08164 3.6709 7.53464 3.6709 8C3.6709 8.46536 3.68766 8.91836 3.71777 9.35449C4.68931 9.60412 5.89086 9.76844 7.21191 9.80371C7.26556 9.23229 7.29688 8.62745 7.29688 8C7.29688 7.37255 7.26556 6.76771 7.21191 6.19629ZM8.28711 6.19629C8.23347 6.7677 8.20312 7.37256 8.20312 8C8.20312 8.62744 8.23347 9.2323 8.28711 9.80371C9.60813 9.7685 10.8096 9.60405 11.7812 9.35449C11.8114 8.91835 11.8281 8.46537 11.8281 8C11.8281 7.53463 11.8114 7.08165 11.7812 6.64551C10.8096 6.39596 9.6081 6.2315 8.28711 6.19629ZM2.79492 6.93457C2.35033 7.10398 2.00495 7.28658 1.76758 7.47363C1.47542 7.7039 1.40631 7.88549 1.40625 8C1.40625 8.1145 1.47531 8.29601 1.76758 8.52637C2.00494 8.71344 2.3503 8.896 2.79492 9.06543C2.77707 8.7174 2.76465 8.36167 2.76465 8C2.76465 7.63833 2.77707 7.2826 2.79492 6.93457ZM12.7041 6.93457C12.722 7.28261 12.7344 7.63832 12.7344 8C12.7344 8.36168 12.722 8.71739 12.7041 9.06543C13.1491 8.89592 13.4949 8.71356 13.7324 8.52637C14.0247 8.29601 14.0938 8.1145 14.0938 8C14.0937 7.88549 14.0246 7.7039 13.7324 7.47363C13.4949 7.28646 13.1491 7.10407 12.7041 6.93457ZM5.48438 1.65625C5.36989 1.65625 5.18831 1.72544 4.95801 2.01758C4.73169 2.30473 4.50772 2.74841 4.31152 3.33691C4.09402 3.98939 3.92285 4.78988 3.81152 5.68848C4.77358 5.46869 5.89726 5.32816 7.10254 5.29102C6.99235 4.55327 6.84114 3.89154 6.65625 3.33691C6.46005 2.74842 6.23608 2.30473 6.00977 2.01758C5.77979 1.72585 5.59888 1.65644 5.48438 1.65625ZM10.0156 1.65625C9.90112 1.65625 9.71961 1.72531 9.48926 2.01758C9.26293 2.30475 9.03898 2.74837 8.84277 3.33691C8.65787 3.89159 8.5057 4.55319 8.39551 5.29102C9.60075 5.32804 10.7244 5.46881 11.6865 5.68848C11.5752 4.78995 11.405 3.98935 11.1875 3.33691C10.9913 2.74855 10.7683 2.30472 10.542 2.01758C10.3117 1.72542 10.1301 1.65631 10.0156 1.65625Z"
          fill="black"
        />
      </svg>
      $HOLO
    </div>
  );
};

const ClaimProgress: FC<{
  claimed: number;
  unlocked: number;
  total: number;
  onClick: () => void;
  btnDisabled?: boolean;
  isClaim?: boolean;
  isChecked?: boolean;
}> = ({
  claimed,
  unlocked,
  total,
  onClick,
  btnDisabled,
  isClaim,
  isChecked,
}) => {
  const [termsOpen, setTermsOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col items-center gap-6 mt-4">
      {/* claimable */}
      <div className="flex flex-col items-stretch gap-1.5 w-full lg:w-[814px] py-7 px-8 rounded-xl bg-white/5">
        <span className="text-base font-medium text-white/60">
          Amount claimable on{' '}
          <span className="text-[#6FFFCB]">September 11th</span>
        </span>
        <div className="flex items-center justify-between">
          <span className="text-[32px] tracking-tighter">
            {formatBalanceNumber(unlocked, 0)}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white/60">
              Total allocation
            </span>
            <span className="text-[32px] tracking-tighter">
              {formatBalanceNumber(total, 0)}
            </span>
            <HoloToken />
          </div>
        </div>
        <div className="relative w-full h-2 rounded-full bg-white/15 mt-2.5">
          <div
            className="absolute min-w-2 h-2 rounded-full opacity-40"
            style={{
              width: `${(unlocked * 100) / total}%`,
              background: `linear-gradient(180deg, #08EDDF -450%, #CEED8B 600%)`,
            }}
          ></div>

          <div
            className="absolute left-0 top-0 min-w-2 h-2 rounded-full"
            style={{
              width: `${(claimed * 100) / total}%`,
              background: `linear-gradient(180deg, #08EDDF -450%, #CEED8B 600%)`,
            }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: `linear-gradient(180deg, #08EDDF -450%, #CEED8B 600%)`,
              }}
            ></div>
            Claimed
            <span className="">{formatBalanceNumber(claimed, 0)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full opacity-40"
              style={{
                background: `linear-gradient(180deg, #08EDDF -450%, #CEED8B 600%)`,
              }}
            ></div>
            Unlocked
            <span className="">{formatBalanceNumber(unlocked, 0)}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full opacity-40 bg-white/15"></div>
            Total allocation
            <span className="">{formatBalanceNumber(total, 0)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mt-3">
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm">Claimable Amount</span>
          <span className="text-[32px]">
            {formatBalanceNumber(unlocked, 0)}
          </span>
          <HoloToken />
        </div>

        {isClaim && (
          <button
            className="btn mt-3 w-[280px] lg:w-[360px] rounded-full border-none text-black/95 font-bold text-sm disabled:text-black/50"
            onClick={onClick}
            disabled={btnDisabled}
            style={{
              background:
                'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
            }}
          >
            Claim Now
          </button>
        )}
        {isChecked && (
          <button
            className="btn mt-3 w-[280px] lg:w-[360px] rounded-full border-none text-black/95 font-bold text-sm disabled:text-black/50"
            style={{
              background:
                'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
            }}
          >
            Come Back 11th Sep to Claim Your $HOLO
          </button>
        )}
      </div>

      {/* terms */}
      <button
        onClick={() => setTermsOpen(true)}
        className="btn btn-sm bg-transparent border-white/60 text-white/60 rounded-full hover:bg-transparent hover:text-[#6FFFCB] hover:border-[#6FFFCB]"
      >
        Terms and Conditions
      </button>

      {/* remaining */}
      <div className="flex flex-col items-center gap-3 mt-4">
        <span className="flex flex-col lg:flex-row items-center gap-3 min-h-14 text-base text-white/60">
          Total airdrop amount
          <span className="text-[32px] text-white">204,800,000</span>
          <span className="text-[32px] text-[#6FFFCB]">$HOLO</span>
        </span>

        <div className="flex flex-col items-center gap-7 w-full lg:w-[1125px] p-6 rounded-xl border border-white/30">
          <span className="flex flex-col lg:flex-row items-center gap-1.5 font-medium text-base">
            Rules: Vesting:
            <span className="flex items-center gap-1 text-[#6FFFCB]">
              30% at TGE
              <svg
                width="6"
                height="9"
                viewBox="0 0 6 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L4.5 4.5L1 8"
                  stroke="url(#paint0_linear_4503_395)"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_4503_395"
                    x1="2.75"
                    y1="1"
                    x2="2.75"
                    y2="8"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#08EDDF" />
                    <stop offset="1" stop-color="#CEED8B" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            Remaining unlocks on the 11th of each month over 6 months.
          </span>
          {/* <ProgressSvg /> */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 font-medium text-white/80 text-sm">
            <div className="flex items-center gap-1.5">
              <Days60Icon />
              <span className="">Claim window: 60 days</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ReloadIcon />
              <span className="">
                Unclaimed amounts roll over if the window is still active
              </span>
            </div>
          </div>
        </div>
      </div>

      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  );
};

export default ClaimProgress;
