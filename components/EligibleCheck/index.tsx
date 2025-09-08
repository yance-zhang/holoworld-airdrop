import {
  AirdropProof,
  getBscAirdropProofApi,
  getSolanaAirdropProofApi,
} from '@/api';
import AddIcon from '@/assets/images/airdrop/add.svg';
import ArrowDown from '@/assets/images/airdrop/arrow-down.svg';
import ClockIcon from '@/assets/images/airdrop/clock.svg';
import EthIcon from '@/assets/images/airdrop/eth.svg';
import SolIcon from '@/assets/images/airdrop/sol.svg';
import UnconnectedIcon from '@/assets/images/airdrop/unconnected.svg';
import WalletIcon from '@/assets/images/layout/wallet.svg';
import { formatBalanceNumber, shortenAddress } from '@/utils';
import clsx from 'clsx';
import { FC, useState } from 'react';
import { formatEther, isAddress } from 'viem';
import { NetworkTabs } from '../VerifyAddress';

type addressInfo = {
  address: string;
  network: string;
  proof?: AirdropProof;
};

const AddressItem: FC<{
  address: addressInfo;
  expandable: boolean;
  disconnectAddress: (address: string) => void;
  defaultOpen: boolean;
  network: string;
}> = ({ address, expandable, disconnectAddress, network, defaultOpen }) => {
  const [showDetail, setShowDetail] = useState<boolean>(defaultOpen);

  return (
    <div
      className={clsx(
        'flex flex-col items-stretch p-[1px] rounded-xl transition-all lg:w-[814px]',
        expandable && showDetail ? 'max-h-[300px]' : 'max-h-[42px]',
      )}
    >
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl">
        <div className="flex items-center gap-1 font-semibold text-sm">
          <span
            className={clsx(
              'flex items-center gap-1 font-semibold text-sm',
              address.proof ? 'text-white' : 'text-white/50',
            )}
          >
            <span className="flex items-center gap-0.5">
              {network === 'SOL' ? <SolIcon /> : <EthIcon />}
              {network}:
            </span>
            {shortenAddress(address.address)}
          </span>

          {expandable && (
            <span
              onClick={() => disconnectAddress(address.address)}
              className="inline-flex w-7 h-7 items-center cursor-pointer justify-center rounded bg-[#FF3666]/20 text-[#FF3666]"
            >
              <UnconnectedIcon />
            </span>
          )}
        </div>
        {expandable ? (
          address.proof ? (
            <div
              onClick={() => setShowDetail(!showDetail)}
              className="flex items-center justify-between gap-2 h-7 px-2 rounded-md text-[#15CE8C] bg-[#6FFFCB29] cursor-pointer"
            >
              <span className="font-semibold text-sm">
                Eligible:{' '}
                {formatBalanceNumber(formatEther(BigInt(address.proof.amount)))}{' '}
                $HOLO
              </span>
              <ArrowDown
                className={clsx('transition-all', showDetail && 'rotate-180')}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 h-7 px-2 rounded-md bg-[#FF3666]/20">
              <span className="font-semibold text-sm text-[#FF3666]">
                Unqualified
              </span>
            </div>
          )
        ) : (
          <span
            onClick={() => disconnectAddress(address.address)}
            className="inline-flex gap-1 px-2 h-7 items-center justify-center text-[#FF3939] rounded bg-[#FF494933] cursor-pointer"
          >
            <UnconnectedIcon />
            <span className="text-sm font-semibold">Disconnect</span>
          </span>
        )}
      </div>
      {expandable && showDetail && address.proof && (
        <div className="flex flex-col p-2 gap-2">
          <span className="font-medium text-sm text-white/50 pl-2">
            Eligible Types:
          </span>
          <div className="">
            {Object.entries(address.proof.detail).map(([type, amount]) => (
              <span
                key={type}
                className="inline-block py-1.5 px-2 mr-2 mb-2 rounded-md text-white font-semibold text-xs lg:text-sm capitalize"
              >
                {type.replaceAll('_', ' ')}{' '}
                <span className="text-[#15CE8C]">
                  {formatBalanceNumber(amount)} $HOLO
                </span>
              </span>
            ))}
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
  const [addressList, setAddressList] = useState<addressInfo[]>([]);
  const [checked, setChecked] = useState<boolean>(false);
  const [networkTab, setNetworkTab] = useState(NetworkTabs[0].name);

  const limitSolAddress = networkTab == 'SOL' && addressList.length == 1;

  const limitEvmAddress = networkTab == 'EVM' && addressList.length == 10;

  const handleAdd = () => {
    if (!inputValue || limitEvmAddress || limitSolAddress) return;

    setAddressList([
      ...addressList,
      {
        address: inputValue,
        network: isAddress(inputValue) ? 'EVM' : 'SOL',
      },
    ]);

    setInputValue('');
    setChecked(false);
  };

  const handleCheck = async () => {
    let list = [];

    for (let index = 0; index < addressList.length; index++) {
      const addr = addressList[index];

      try {
        const request =
          networkTab === 'EVM'
            ? getBscAirdropProofApi
            : getSolanaAirdropProofApi;
        const res = await request(addr.address);

        if (res.error) {
          list.push(addr);
        } else {
          list.push({ ...addr, proof: res });
        }
      } catch (error) {
        list.push(addr);
      }
    }
    setAddressList(list);
    setChecked(true);
  };

  const disconnectAddress = (address: string) => {
    setAddressList(addressList.filter((addr) => addr.address !== address));
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="font-bold text-2xl">Check Eligibility</div>
        <div
          role="tablist"
          className="tabs tabs-box p-1 bg-white/10 rounded-full w-[307px] lg:w-[360px]"
        >
          {NetworkTabs.map((network) => (
            <a
              role="tab"
              className={`tab gap-0.5 text-base rounded-full ${networkTab === network.name ? 'bg-[#FDFDFD] font-bold text-black/95' : 'text-white/35 font-semibold'}`}
              key={network.name}
              onClick={() => {
                setNetworkTab(network.name);
                setAddressList([]);
                setChecked(false);
              }}
            >
              {network.icon && <network.icon />}
              {network.name}
            </a>
          ))}
        </div>
      </div>
      {/* add address */}
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex items-center justify-between gap-3 w-full lg:max-w-[628px]">
          <div className="h-[1px] w-1/3 bg-white/20"></div>
          <span className="font-semibold text-sm text-nowrap opacity-60">
            Verify Wallet Address*
          </span>
          <div className="h-[1px] w-1/3 bg-white/20"></div>
        </div>
        <label
          className={clsx(
            'input input-sm flex items-center gap-2 h-10 bg-white/5 max-w-full w-full border focus-within:border-[#6FFFCB]',
          )}
        >
          <input
            type="text"
            className="h-full w-full font-medium text-xs"
            placeholder="Enter and verify wallet address to check your eligibility"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            className={clsx(
              'btn btn-xs h-7 rounded-md border-none text-xs font-bold !bg-transparent',
              inputValue && !limitSolAddress && !limitEvmAddress
                ? 'text-[#6FFFCB]'
                : 'text-white/60',
            )}
            onClick={handleAdd}
          >
            <AddIcon /> Add Wallet
          </button>
        </label>
      </div>

      {/* address list */}
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col w-full py-3 gap-4 rounded-b-2xl">
          <div className="flex flex-col gap-3">
            {addressList.map((address, index) => (
              <AddressItem
                key={address.address}
                expandable={checked}
                address={address}
                network={networkTab}
                disconnectAddress={disconnectAddress}
                defaultOpen={index === 0}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm font-medium">
            Check Up to{' '}
            <b className="font-bold text-white">
              <b className="text-[#08EDDF]">{addressList.length}</b>/
              {networkTab === 'SOL' ? 1 : 10}
            </b>{' '}
            Wallets
            <WalletIcon className="w-4 h-4 text-white/90" />
          </div>
        </div>

        {checked ? (
          <button
            onClick={() => {
              if (addressList.find((addr) => !addr.proof)) {
                return;
              }
              completeCheck();
            }}
            className="btn mt-3 w-full lg:max-w-[650px] btn-sm h-10 max-h-10 border-none bg-black text-white font-semibold text-xs"
          >
            <ClockIcon />
            Claim On 01/10/2025 00:00 UTC
          </button>
        ) : (
          <button
            className="btn mt-3 w-[240px] lg:w-[360px] rounded-full border-none text-black/95 font-bold text-sm disabled:text-black/50"
            onClick={handleCheck}
            disabled={addressList.length === 0}
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
