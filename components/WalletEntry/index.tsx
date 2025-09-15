import { AirdropProof } from '@/api';
import EthIcon from '@/assets/images/airdrop/eth.svg';
import SolIcon from '@/assets/images/airdrop/sol.svg';
import UnconnectedIcon from '@/assets/images/airdrop/unconnected.svg';
import { shortenAddress } from '@/utils';
import { EligibleIconMap } from '@/utils/constants';
import classNames from 'classnames';

export default function WalletEntry({
  airdrop,
  network,
  disconnectAddress,
}: {
  airdrop: AirdropProof | null;
  network: string;
  disconnectAddress: () => void;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-1 text-sm font-semibold">
        <span
          className={classNames(
            'flex items-center gap-1 text-sm font-semibold',
            'text-white'
          )}
        >
          <span className="flex items-center gap-0.5">
            {network === 'SOL' ? <SolIcon /> : <EthIcon />}
            {network}:
          </span>
          {airdrop && shortenAddress(airdrop.address)}
        </span>

        <span
          onClick={() => disconnectAddress()}
          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-[#FF3666]/20 text-[#FF3666]"
        >
          <UnconnectedIcon />
        </span>

        {airdrop?.detail && (
          <div className="flex items-center gap-1.5">
            {Object.entries(airdrop.detail).map(([type, amount]) => {
              const Icon = EligibleIconMap[type];
              return (
                <span
                  className="tooltip"
                  data-tip={type.replaceAll('_', ' ').toLocaleUpperCase()}
                  key={type}
                >
                  <Icon width={28} height={28} />
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
