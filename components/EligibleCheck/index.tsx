import AddIcon from '@/assets/images/airdrop/add.svg';
import ArrowDown from '@/assets/images/airdrop/arrow-down.svg';
import ClockIcon from '@/assets/images/airdrop/clock.svg';
import UnconnectedIcon from '@/assets/images/airdrop/unconnected.svg';
import WalletIcon from '@/assets/images/layout/wallet.svg';
import { shortenAddress } from '@/utils';
import clsx from 'clsx';
import { FC, useState } from 'react';

const AddressItem: FC<{
  address: string;
  expandable: boolean;
  disconnectAddress: (address: string) => void;
  defaultOpen: boolean;
}> = ({ address, expandable, disconnectAddress, defaultOpen }) => {
  const [showDetail, setShowDetail] = useState<boolean>(defaultOpen);

  return (
    <div
      key={address}
      className={clsx(
        'flex flex-col items-stretch p-[1px] rounded-xl transition-all bg-[#00000005]',
        expandable && showDetail ? 'h-[118px]' : 'h-[42px]',
      )}
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/90 rounded-xl">
        <div className="flex items-center gap-1 font-semibold text-sm">
          <span className="font-semibold text-sm text-black/90">
            {shortenAddress(address)}
          </span>

          {expandable && (
            <span className="inline-flex w-7 h-7 items-center justify-center rounded bg-black/5">
              <UnconnectedIcon />
            </span>
          )}
        </div>
        {expandable ? (
          <div
            onClick={() => setShowDetail(!showDetail)}
            className="flex items-center justify-between gap-2 h-7 px-2 rounded-md bg-[#6FFFCB29] cursor-pointer"
          >
            <span className="font-semibold text-sm text-[#15CE8C]">
              Eligible
            </span>
            <ArrowDown
              className={clsx('transition-all', showDetail && 'rotate-180')}
            />
          </div>
        ) : (
          <span
            onClick={() => disconnectAddress(address)}
            className="inline-flex gap-1 px-2 h-7 items-center justify-center rounded bg-black/5 cursor-pointer"
          >
            <UnconnectedIcon />
            <span className="text-sm font-semibold">Disconnect</span>
          </span>
        )}
      </div>
      {expandable && showDetail && (
        <div className="flex flex-col p-2 gap-2">
          <span className="font-medium text-sm text-black/80">
            Eligible Types:
          </span>
          <div className="">
            <span className="inline-flex items-center h-7 px-2 mr-2 rounded-md font-semibold text-sm text-[#15CE8C] bg-[#6FFFCB29]">
              3D Pudgy Penguin Claimer
            </span>
            <span className="inline-flex items-center h-7 px-2 mr-2 rounded-md font-semibold text-sm text-[#15CE8C] bg-[#6FFFCB29]">
              Staked AVA
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const EligibleCheck: FC<{ completeCheck: () => void }> = ({
  completeCheck,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [addressList, setAddressList] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean>(false);

  const handleAdd = () => {
    if (!inputValue) return;

    setAddressList([...addressList, inputValue]);
  };

  const handleCheck = () => {
    setChecked(true);
  };

  const disconnectAddress = (address: string) => {
    setAddressList(addressList.filter((addr) => addr !== address));
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* add address */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">Verify Wallet Address*</span>
        <label className="input input-sm flex items-center gap-2 h-10 bg-black/5 max-w-full w-[522px]">
          <input
            type="text"
            className="h-full w-full font-medium text-xs"
            placeholder="Enter and verify wallet address to claim airdrop"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            className={clsx(
              'btn btn-xs h-7 w-[140px] rounded-md border-none text-xs text-black/95 font-bold !bg-transparent',
              inputValue ? '' : 'opacity-35',
            )}
            style={{
              background: inputValue
                ? 'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)'
                : '',
            }}
            onClick={handleAdd}
          >
            <AddIcon /> Add Wallet
          </button>
        </label>
      </div>

      {/* address list */}
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col w-[650px] py-3 gap-4 px-16 bg-white/80 rounded-b-2xl">
          <div className="flex items-center justify-center gap-1 text-sm font-medium">
            <WalletIcon className="w-4 h-4 text-black/90" />
            Check Up to{' '}
            <b className="font-bold text-black">
              <b className="text-[#08EDDF]">{addressList.length}</b>/10
            </b>{' '}
            Wallets
          </div>
          <div className="flex flex-col gap-3">
            {addressList.map((address, index) => (
              <AddressItem
                key={address}
                expandable={checked}
                address={address}
                disconnectAddress={disconnectAddress}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </div>

        {checked ? (
          <button
            onClick={completeCheck}
            className="btn mt-3 w-full max-w-[650px] btn-sm h-10 max-h-10 bg-[#DAFF8029] border-none text-black/95 font-semibold text-xs"
          >
            <ClockIcon />
            Claim On 01/10/2025 00:00 UTC
          </button>
        ) : (
          <button
            className="btn mt-3 w-[360px] rounded-full border-none text-black/95 font-bold text-sm"
            onClick={handleCheck}
            style={{
              background:
                'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
            }}
          >
            Check Eligibility Now
          </button>
        )}
      </div>
    </div>
  );
};

export default EligibleCheck;
