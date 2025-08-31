import AddIcon from '@/assets/images/airdrop/add.svg';
import { useAppStore } from '@/context/AppStoreContext';
import { useToast } from '@/context/ToastContext';
import { useWallet } from '@solana/wallet-adapter-react';
import clsx from 'clsx';
import { FC, useState } from 'react';
import { useAccount } from 'wagmi';

export const InputAddress: FC<{
  showButton: boolean;
  network: string;
  receiver?: string;
  onAdd: (address: string, network: string) => void;
}> = ({ showButton, network, receiver, onAdd }) => {
  const { addToast } = useToast();
  const { publicKey } = useWallet();
  const { address } = useAccount();
  const { openEvm, openSol } = useAppStore();
  const [value, setValue] = useState<string>('');

  const handleAdd = () => {
    if (!receiver) {
      addToast('Please enter receiver address.', 'warning');
      return;
    }
    if (network === 'BNB') {
      openEvm();
      // onAdd(value, 'BNB');
    }
    if (network === 'SOL') {
      openSol();
      // onAdd(value, 'SOL');
    }
    setValue('');
  };

  return (
    <div className="flex flex-col gap-2 w-[522px]">
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-sm">
          Verify Wallet Address To Claim From*
        </span>
        <span className="font-medium text-xs text-black/65">
          Connect eligible wallets to claim $HOLO
        </span>
      </div>
      {network === 'SOL' && publicKey ? null : (
        <label className="input input-sm flex items-center justify-between gap-2 h-10 bg-black/5 max-w-full w-[522px]">
          <span className="text-xs font-medium">
            {network === 'SOL' ? publicKey?.toBase58() : address}
          </span>
          {showButton ? (
            <button
              className={clsx(
                'btn btn-xs h-7 w-[140px] rounded-md border-none text-xs text-black/95 font-bold !bg-transparent',
                !value ? '' : 'opacity-35',
              )}
              style={{
                background: !value
                  ? 'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)'
                  : '',
              }}
              onClick={handleAdd}
            >
              <AddIcon /> Connect Wallet
            </button>
          ) : null}
        </label>
      )}
      {!showButton ? (
        <button
          className={clsx(
            'btn w-full rounded-full mt-5 text-sm text-black/95 font-bold  bg-black/30',
            value ? '' : 'opacity-35',
          )}
          onClick={handleAdd}
          style={{
            background:
              value.length > 0
                ? 'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)'
                : '',
          }}
        >
          Connect Another Wallet
        </button>
      ) : null}
    </div>
  );
};
