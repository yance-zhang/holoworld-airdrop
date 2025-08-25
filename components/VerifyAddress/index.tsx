import BnbIcon from '@/assets/images/airdrop/bnb.svg';
import SolIcon from '@/assets/images/airdrop/sol.svg';
import UnconnectedIcon from '@/assets/images/airdrop/unconnected.svg';
import WalletIcon from '@/assets/images/layout/wallet.svg';
import { FC, useState } from 'react';
import AddWalletModal from '../AddWalletModal';
import ClaimModal from '../ClaimModal';
import { InputAddress } from './inputAddress';
import { useAppStore } from '@/context/AppStoreContext';
import { shortenAddress } from '@/utils';

const NetworkTabs = [
  { name: 'SOL', icon: SolIcon },
  { name: 'BNB', icon: BnbIcon },
];

const VerifyAddress: FC = () => {
  const { evmAddressList, solAddressList } = useAppStore();
  const [networkTab, setNetworkTab] = useState(NetworkTabs[0].name);
  const [addWalletOpen, setAddWalletOpen] = useState<boolean>(false);
  const [claimOpen, setClaimOpen] = useState<boolean>(false);

  const handleAddAddress = (addr: string, network: string) => {
    if (!addr) return;

    setNetworkTab(network);
    // if (network === 'SOL') {
    //   setSolAddresses([...solAddresses, addr]);
    // } else if (network === 'BNB') {
    //   setevmAddressList([...evmAddressList, addr]);
    // }
  };

  const handleClaim = () => {
    if (networkTab === 'SOL') {
      setAddWalletOpen(true);
    } else {
      setClaimOpen(true);
    }
  };

  const verifiedCount =
    networkTab === 'SOL' ? solAddressList.length : evmAddressList.length;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-[1px] w-[87.5px]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.16) 100%)',
              }}
            ></div>
            <span className="font-semibold text-base">
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
      }
      {/* add address */}
      <InputAddress onAdd={handleAddAddress} network={networkTab} showButton />
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
            {(networkTab === 'SOL' ? solAddressList : evmAddressList).map(
              (address) => (
                <div
                  key={address}
                  className="flex items-center justify-between px-4 py-2.5 bg-white/90 border-black/5 border rounded-xl"
                >
                  <div className="flex items-center gap-1 font-semibold text-sm">
                    <span className="flex items-center gap-0.5">
                      {networkTab === 'SOL' ? <SolIcon /> : <BnbIcon />}
                      {networkTab}:
                    </span>
                    <span className="font-semibold text-sm text-black/90">
                      {shortenAddress(address)}
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
        network={networkTab}
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
