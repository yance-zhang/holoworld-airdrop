import {
  AirdropProof,
  getBscAirdropProofApi,
  getSolanaAirdropProofApi,
} from '@/api';
import AddIcon from '@/assets/images/airdrop/add.svg';
import ArrowDown from '@/assets/images/airdrop/arrow-down.svg';
import ClockIcon from '@/assets/images/airdrop/clock.svg';
import UnconnectedIcon from '@/assets/images/airdrop/unconnected.svg';
import WalletIcon from '@/assets/images/layout/wallet.svg';
import { formatBalanceNumber, shortenAddress } from '@/utils';
import clsx from 'clsx';
import { FC, useState } from 'react';
import { isAddress } from 'viem';
import { NetworkTabs } from '../VerifyAddress';
import { useWallet } from '@solana/wallet-adapter-react';
import { reset } from 'viem/actions';
import { useAccount, useDisconnect } from 'wagmi';

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
}> = ({ address, expandable, disconnectAddress, defaultOpen }) => {
  const [showDetail, setShowDetail] = useState<boolean>(defaultOpen);

  return (
    <div
      className={clsx(
        'flex flex-col items-stretch p-[1px] rounded-xl transition-all bg-[#00000005]',
        expandable && showDetail ? 'max-h-[300px]' : 'max-h-[42px]',
      )}
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/90 rounded-xl">
        <div className="flex items-center gap-1 font-semibold text-sm">
          <span className="font-semibold text-sm text-black/90">
            {shortenAddress(address.address)}
          </span>

          {expandable && (
            <span className="inline-flex w-7 h-7 items-center cursor-pointer justify-center rounded bg-black/5">
              <UnconnectedIcon />
            </span>
          )}
        </div>
        {expandable ? (
          address.proof ? (
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
            <div className="flex items-center justify-between gap-2 h-7 px-2 rounded-md bg-[#FF366629]">
              <span className="font-semibold text-sm text-[#FF3666]">
                Unqualified
              </span>
            </div>
          )
        ) : (
          <span
            onClick={() => disconnectAddress(address.address)}
            className="inline-flex gap-1 px-2 h-7 items-center justify-center rounded bg-black/5 cursor-pointer"
          >
            <UnconnectedIcon />
            <span className="text-sm font-semibold">Disconnect</span>
          </span>
        )}
      </div>
      {expandable && showDetail && address.proof && (
        <div className="flex flex-col p-2 gap-2">
          <span className="font-medium text-sm text-black/80">
            Eligible Types:
          </span>
          <div className="">
            {Object.entries(address.proof.detail).map(([type, amount]) => (
              <span
                key={type}
                className="inline-block py-1.5 px-2 mr-2 mb-2 rounded-md text-[#ACC220] font-semibold text-xs lg:text-sm bg-[#DAFF8029] capitalize"
              >
                {type.replaceAll('_', ' ')}{' '}
                <span className="text-black/90">
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
  const { address } = useAccount();
  const { publicKey, disconnect: disconnectSolana } = useWallet();
  const disconnectEvm = useDisconnect();
  const [networkTab, setNetworkTab] = useState(NetworkTabs[0].name);

  const handleAdd = () => {
    if (!inputValue) return;

    setAddressList([
      ...addressList,
      {
        address: inputValue,
        network: isAddress(inputValue) ? 'EVM' : 'SOL',
      },
    ]);

    setInputValue('');
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
        <div className="flex items-center gap-3">
          <div
            className="h-[1px] w-[87.5px]"
            style={{
              background:
                'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.16) 100%)',
            }}
          ></div>
          <span className="font-semibold text-sm lg:text-base">
            Select Claim Network
          </span>
          <div
            className="h-[1px] w-[87.5px]"
            style={{
              background:
                'linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.16) 100%)',
            }}
          ></div>
        </div>
        <div
          role="tablist"
          className="tabs tabs-box p-1 bg-black/5 rounded-full w-[307px] lg:w-[360px]"
        >
          {NetworkTabs.map((network) => (
            <a
              role="tab"
              className={`tab gap-0.5 text-base rounded-full ${networkTab === network.name ? 'bg-[#FDFDFD] font-bold text-black/95' : 'text-[#0000005C] font-semibold'}`}
              key={network.name}
              onClick={() => {
                setNetworkTab(network.name);

                if (network.name === 'SOL') {
                  disconnectEvm.disconnect();
                } else {
                  disconnectSolana();
                }
                setAddressList([]);
              }}
            >
              {network.icon && <network.icon />}
              {network.name}
            </a>
          ))}
        </div>
      </div>
      {/* add address */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">Verify Wallet Address*</span>
        <label className="input input-sm flex items-center gap-2 h-10 bg-black/5 max-w-full w-full lg:w-[522px]">
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
        <div className="flex flex-col w-full lg:w-[650px] py-3 gap-4 px-3 lg:px-16 bg-white/80 rounded-b-2xl">
          <div className="flex items-center justify-center gap-1 text-sm font-medium">
            <WalletIcon className="w-4 h-4 text-black/90" />
            Check Up to{' '}
            <b className="font-bold text-black">
              <b className="text-[#08EDDF]">{addressList.length}</b>/
              {networkTab === 'SOL' ? 1 : 10}
            </b>{' '}
            Wallets
          </div>
          <div className="flex flex-col gap-3">
            {addressList.map((address, index) => (
              <AddressItem
                key={address.address}
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
            onClick={() => {
              if (addressList.find((addr) => !addr.proof)) {
                return;
              }
              completeCheck();
            }}
            className="btn mt-3 w-full lg:max-w-[650px] btn-sm h-10 max-h-10 bg-[#DAFF8029] border-none text-black/95 font-semibold text-xs"
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
