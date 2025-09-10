import {
  AirdropProof,
  getAuthTextTemplate,
  getBscAirdropProofApi,
  getBscEligibilityProof,
  getSolanaAirdropProofApi,
  getSolanaEligibilityProof,
} from '@/api';
import EthIcon from '@/assets/images/airdrop/eth.svg';
import SolIcon from '@/assets/images/airdrop/sol.svg';
import UnconnectedIcon from '@/assets/images/airdrop/unconnected.svg';
import { formatBalanceNumber, shortenAddress } from '@/utils';
import clsx from 'clsx';
import { FC, useEffect, useMemo, useState } from 'react';
import { isAddress } from 'viem';
import { NetworkTabs } from '../VerifyAddress';
import ClaimProgress from './claimProgress';
import { EligibleIconMap } from '@/pages';
import { useAppStore } from '@/context/AppStoreContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { PublicKey } from '@solana/web3.js';
import WalletIcon from '@/assets/images/layout/wallet.svg';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useToast } from '@/context/ToastContext';

type addressInfo = {
  address: string;
  network: string;
  proof?: AirdropProof;
};

const AddressItem: FC<{
  address: addressInfo;
  disconnectAddress: (address: string) => void;
  network: string;
  checked?: boolean;
}> = ({ address, disconnectAddress, network, checked }) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-stretch p-[1px] rounded-xl transition-all lg:w-[814px]',
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

          <span
            onClick={() => disconnectAddress(address.address)}
            className="inline-flex w-7 h-7 items-center cursor-pointer justify-center rounded bg-[#FF3666]/20 text-[#FF3666]"
          >
            <UnconnectedIcon />
          </span>

          {address.proof && (
            <div className="flex items-center gap-1.5">
              {Object.entries(address.proof.detail).map(([type, amount]) => {
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
        {checked ? (
          address.proof ? (
            <div className="flex items-center justify-between gap-2 px-2 rounded-md border-[#15CE8C] border cursor-pointer">
              <span className="font-semibold text-sm">
                {formatBalanceNumber(address.proof.total)} $HOLO
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 h-7 px-2 rounded-md bg-[#FF3666]/20">
              <span className="font-semibold text-sm text-[#FF3666]">
                Ineligible
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
    </div>
  );
};

const EligibleCheck: FC<{ completeCheck: () => void }> = ({
  completeCheck,
}) => {
  const { openEvm, openSol } = useAppStore();
  const { addToast } = useToast();
  const { signMessage, publicKey, disconnect: disconnectSolana } = useWallet();
  const { signMessageAsync } = useSignMessage();
  const { address: EvmAddress } = useAccount();
  const [inputValue, setInputValue] = useState<string>('');
  const [addressList, setAddressList] = useState<addressInfo[]>([]);
  const [checked, setChecked] = useState<boolean>(false);
  const disconnectEvm = useDisconnect();
  const [networkTab, setNetworkTab] = useState(NetworkTabs[0].name);

  const limitSolAddress = networkTab == 'SOL' && addressList.length == 1;

  const limitEvmAddress = networkTab == 'EVM' && addressList.length == 10;

  const { totalAmount, claimedAmount, unlockedAmount } = useMemo(() => {
    return addressList.reduce(
      (pre, cur) => {
        return {
          totalAmount: pre.totalAmount + Number(cur.proof?.total || 0),
          claimedAmount: pre.claimedAmount + Number(0),
          unlockedAmount: pre.unlockedAmount + Number(cur.proof?.unlocked || 0),
        };
      },
      {
        totalAmount: 0,
        claimedAmount: 0,
        unlockedAmount: 0,
      },
    );
  }, [addressList]);

  const onSolConnected = async (address: string) => {
    const res = await getAuthTextTemplate(address);
    if (!res) {
      console.log('error when getting template');
      return; // Add return here
    }

    const message = res.tip_info;

    try {
      const signature = await signMessage!(Buffer.from(message));
      const signatureString = bs58.encode(signature);

      const res = await getSolanaEligibilityProof(address, signatureString);

      if (res.error) {
        setAddressList([...addressList, { address, network: 'SOL' }]);
        return;
      }

      setAddressList([
        ...addressList,
        { address: res.address, network: 'SOL', proof: res },
      ]);
      // setChecked(true);
    } catch (error) {
      console.log(error);
    }
  };

  const onEvmConnected = async (address: string) => {
    try {
      const tipInfoRes = await getAuthTextTemplate(address);

      const { tip_info } = tipInfoRes;
      const signature = await signMessageAsync({ message: tip_info });

      const res = await getBscEligibilityProof(address, signature);

      if (res.error) {
        setAddressList([...addressList, { address, network: 'EVM' }]);
        return;
      }
      setAddressList([
        ...addressList,
        { address: res.address, network: 'EVM', proof: res },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (EvmAddress && networkTab === 'EVM') {
      onEvmConnected(EvmAddress);
    }
  }, [EvmAddress, networkTab]);

  useEffect(() => {
    if (publicKey && networkTab === 'SOL') {
      onSolConnected(publicKey.toBase58());
    }
  }, [publicKey, networkTab]);

  const disconnectAddress = (address: string) => {
    setAddressList(addressList.filter((addr) => addr.address !== address));
    if (networkTab === 'SOL') {
      disconnectSolana();
    } else {
      disconnectEvm.disconnect();
    }
  };

  const openConnect = () => {
    if (limitEvmAddress || limitSolAddress) {
      return;
    }
    if (networkTab == 'EVM') {
      openEvm();
    }
    if (networkTab == 'SOL') {
      openSol();
    }
  };

  useEffect(() => {
    disconnectEvm.disconnect();
    disconnectSolana();
  }, []);

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
                // setChecked(false);

                if (network.name === 'SOL') {
                  disconnectEvm.disconnect();
                } else {
                  disconnectSolana();
                }
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
        {/*<div className="flex items-center justify-between gap-3 w-full lg:max-w-[628px]">
          <div className="h-[1px] w-1/3 bg-white/20"></div>
          <span className="font-semibold text-sm text-nowrap opacity-60">
            Verify Wallet Address*
          </span>
          <div className="h-[1px] w-1/3 bg-white/20"></div>
        </div>*/}
        {/*<label
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
        </label> */}
      </div>

      {/* address list */}
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col w-full gap-4 rounded-b-2xl">
          <div className="flex flex-col gap-3">
            {addressList.map((address, index) => (
              <AddressItem
                key={address.address}
                checked={true}
                address={address}
                network={networkTab}
                disconnectAddress={disconnectAddress}
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

        <button
          className="btn mt-4 w-[240px] lg:w-[360px] rounded-full border-none text-black/95 font-bold text-sm disabled:text-black/50"
          onClick={openConnect}
          disabled={limitEvmAddress || limitSolAddress}
          style={{
            background:
              'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
          }}
        >
          Connect Wallet
        </button>

        {/*<button
          className="btn mt-3 w-[240px] lg:w-[360px] rounded-full border-none text-black/95 font-bold text-sm disabled:text-black/50"
          onClick={handleCheck}
          disabled={addressList.length === 0}
          style={{
            background:
              'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
          }}
        >
          Check Eligibility Now
        </button>*/}
      </div>

      <ClaimProgress
        claimed={claimedAmount}
        unlocked={unlockedAmount}
        total={totalAmount}
        onClick={() => {}}
        isChecked={checked}
      />
    </div>
  );
};

export default EligibleCheck;
