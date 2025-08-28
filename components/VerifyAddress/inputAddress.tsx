import AddIcon from '@/assets/images/airdrop/add.svg';
import { useAppStore } from '@/context/AppStoreContext';
import { useToast } from '@/context/ToastContext';
import clsx from 'clsx';
import { FC, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export const InputAddress: FC<{
  showButton: boolean;
  network: string;
  receiver?: string;
  onAdd: (address: string, network: string) => void;
}> = ({ showButton, network, receiver, onAdd }) => {
  const { addToast } = useToast();
  const { openEvm, openSol } = useAppStore();
  const [value, setValue] = useState<string>('');

  const handleAdd = () => {
    if (network === 'BNB') {
      if (!receiver) {
        addToast('Please enter receiver address.', 'warning');
        return;
      }
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
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-sm">
          Verify Wallet Address To Claim From*
        </span>
        <span className="font-medium text-xs text-black/65">
          Connect eligible wallets to claim $HOLO
        </span>
      </div>
      <label className="input input-sm flex items-center gap-2 h-10 bg-black/5 max-w-full w-[522px]">
        <input
          type="text"
          className="h-full w-full font-medium text-xs"
          placeholder="Enter and verify wallet address to claim airdrop"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {showButton ? (
          <button
            className={clsx(
              'btn btn-xs h-7 w-[140px] rounded-md border-none text-xs text-black/95 font-bold !bg-transparent',
              value ? '' : 'opacity-35',
            )}
            style={{
              background: value
                ? 'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)'
                : '',
            }}
            onClick={handleAdd}
          >
            <AddIcon /> Connect Wallet
          </button>
        ) : null}
      </label>
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
