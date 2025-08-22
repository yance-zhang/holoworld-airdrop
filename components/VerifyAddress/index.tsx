import AddIcon from '@/assets/images/airdrop/add.svg';
import BnbIcon from '@/assets/images/airdrop/bnb.svg';
import SolIcon from '@/assets/images/airdrop/sol.svg';
import UnconnectedIcon from '@/assets/images/airdrop/unconnected.svg';
import WalletIcon from '@/assets/images/layout/wallet.svg';
import clsx from 'clsx';
import { FC, useState } from 'react';
import AddWalletModal from '../AddWalletModal';
import ClaimModal from '../ClaimModal';

const NetworkTabs = [
  { name: 'SOL', icon: SolIcon },
  { name: 'BNB', icon: BnbIcon },
];

export const InputAddress: FC<{
  showButton: boolean;
  onAdd: (address: string) => void;
}> = ({ showButton, onAdd }) => {
  const [value, setValue] = useState<string>('');

  const handleAdd = () => {
    if (!value) {
      return;
    }
    onAdd(value);
    setValue('');
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold text-sm">Verify Wallet Address*</span>
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
              'btn btn-xs h-7 w-16 rounded-md text-xs text-black/95 font-bold !bg-transparent',
              value ? '' : 'opacity-35',
            )}
            style={{
              background: value
                ? 'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)'
                : '',
            }}
            onClick={handleAdd}
          >
            <AddIcon /> Add
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
          Add Another Wallet
        </button>
      ) : null}
    </div>
  );
};

const VerifyAddress: FC = () => {
  const [networkTab, setNetworkTab] = useState(NetworkTabs[0].name);
  const [solAddresses, setSolAddresses] = useState<string[]>([
    '3rJab3...1K2L',
    '5t8dsv...Hq6G',
    'Z1a23r...xW8y',
  ]);
  const [bnbAddresses, setBnbAddresses] = useState<string[]>([
    '0xAbCd...5678',
    '0xDefe...5678',
    '0xaBCq...5678',
  ]);
  const [addWalletOpen, setAddWalletOpen] = useState<boolean>(false);
  const [claimOpen, setClaimOpen] = useState<boolean>(false);

  const handleAddAddress = (addr: string) => {
    if (!addr) return;

    if (networkTab === 'SOL') {
      setSolAddresses([...solAddresses, addr]);
    } else if (networkTab === 'BNB') {
      setBnbAddresses([...bnbAddresses, addr]);
    }
  };

  const handleClaim = () => {
    if (networkTab === 'SOL') {
      setAddWalletOpen(true);
    } else {
      setClaimOpen(true);
    }
  };

  const verifiedCount =
    networkTab === 'SOL' ? solAddresses.length : bnbAddresses.length;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <div
            className="h-[1px] w-[87.5px]"
            style={{
              background:
                'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.16) 100%)',
            }}
          ></div>
          <span className="font-semibold text-base">Select Claim Network</span>
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
          className="tabs tabs-box p-1 bg-black/5 rounded-full w-[360px]"
        >
          {NetworkTabs.map((network) => (
            <a
              role="tab"
              className={`tab gap-0.5 text-base rounded-full ${networkTab === network.name ? 'bg-[#FDFDFD] font-bold text-black/95' : 'text-[#0000005C] font-semibold'}`}
              key={network.name}
              onClick={() => setNetworkTab(network.name)}
            >
              {network.icon && <network.icon />}
              {network.name}
            </a>
          ))}
        </div>
      </div>
      {/* add address */}
      <InputAddress onAdd={handleAddAddress} showButton />
      {/* address list */}
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center justify-between h-[83px] w-[698px] px-6 rounded-2xl border border-white bg-white/35">
          <span className="font-semibold text-sm">Total Eligible Token</span>
          <span className="flex items-end font-[PPMonumentExtended]">
            <span className="font-bold text-[30px]">12,312</span>
            <span className="font-medium text-xs text-black/80">$HOLO</span>
          </span>
        </div>
        <div className="flex flex-col w-[650px] py-3 gap-4 px-16 bg-white/80 rounded-b-2xl">
          <div className="flex items-center justify-center gap-1 text-sm font-medium">
            <WalletIcon className="w-4 h-4 text-black/90" />
            Verified{' '}
            <b className="font-bold text-black">
              <b className="text-[#08EDDF]">{verifiedCount}</b>/10
            </b>{' '}
            wallets
          </div>
          <div className="flex flex-col gap-3">
            {(networkTab === 'SOL' ? solAddresses : bnbAddresses).map(
              (address) => (
                <div
                  key={address}
                  className="flex items-center justify-between px-4 py-2.5 bg-white/90 border-black/5 border rounded-xl"
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm text-black/90">
                      {address}
                    </span>
                    <span className="inline-flex w-7 h-7 items-center justify-center rounded bg-black/5">
                      <UnconnectedIcon />
                    </span>
                  </div>
                  <span className="font-medium text-sm text-black/80">
                    <b className="font-bold text-black">1,234 $HOLO</b>
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <button
          className="btn mt-3 w-[360px] rounded-full border-none text-black/95 font-bold text-sm"
          onClick={handleClaim}
          style={{
            background:
              'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
          }}
        >
          Claim Now
        </button>
      </div>

      <div className="flex items-center justify-center gap-1 text-sm font-medium">
        <WalletIcon className="w-4 h-4 text-black/90" />
        Verify up to <b className="font-bold text-black">10</b> wallets
      </div>

      <AddWalletModal
        open={addWalletOpen}
        onClose={() => setAddWalletOpen(false)}
        onConfirm={handleAddAddress}
      />

      <ClaimModal
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        network={NetworkTabs[networkTab === 'SOL' ? 0 : 1]}
      />
    </div>
  );
};

export default VerifyAddress;
