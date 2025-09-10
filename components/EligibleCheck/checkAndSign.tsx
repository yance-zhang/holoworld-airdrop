import { AirdropProof } from '@/api';
import AddIcon from '@/assets/images/airdrop/add.svg';
import ArrowDown from '@/assets/images/airdrop/arrow-down.svg';
import EthIcon from '@/assets/images/airdrop/eth.svg';
import SolIcon from '@/assets/images/airdrop/sol.svg';
import UnconnectedIcon from '@/assets/images/airdrop/unconnected.svg';
import WalletIcon from '@/assets/images/layout/wallet.svg';
import { useAppStore } from '@/context/AppStoreContext';
import { useToast } from '@/context/ToastContext';
import { useAirdropClaimOnBSC } from '@/contract/bnb';
import { useAirdropClaimOnSolana } from '@/contract/solana';
import {
  checkSolanaAddress,
  formatBalanceNumber,
  shortenAddress,
} from '@/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import clsx from 'clsx';
import { FC, useEffect, useRef, useState } from 'react';
import { isAddress } from 'viem';
import { useAccount, useDisconnect } from 'wagmi';
import AddWalletModal from '../AddWalletModal';
import ClaimModal from '../ClaimModal';
import { NetworkTabs } from '../VerifyAddress';

const AirdropItem: FC<{
  airdrop: AirdropProof;
  network: string;
  defaultOpen: boolean;
}> = ({ airdrop, network, defaultOpen }) => {
  const { disconnect } = useDisconnect();
  const { disconnect: DisconnectSolana } = useWallet();
  const { reset } = useAppStore();
  const [showDetail, setShowDetail] = useState<boolean>(defaultOpen);

  const disconnectWallet = () => {
    if (network === 'SOL') {
      DisconnectSolana();
    } else {
      disconnect();
    }

    reset();
  };

  return (
    <div
      className={clsx(
        'flex flex-col items-stretch p-[1px] rounded-xl transition-all',
        showDetail ? 'max-h-[300px]' : 'max-h-[42px]',
      )}
    >
      <div className="flex items-center justify-between px-1.5 lg:px-3 py-1.5 rounded-xl">
        <div className={clsx('flex items-center gap-1 font-semibold text-sm')}>
          <span className="flex items-center gap-0.5">
            {network === 'SOL' ? <SolIcon /> : <EthIcon />}
            {network}:
          </span>
          <span className="font-semibold text-xs lg:text-sm">
            {shortenAddress(airdrop.address)}
          </span>
          <span
            onClick={() => disconnectWallet()}
            className="inline-flex w-7 h-7 items-center justify-center rounded bg-[#FF3666]/20 text-[#FF3666]"
          >
            <UnconnectedIcon />
          </span>
        </div>
        <div
          onClick={() => setShowDetail(!showDetail)}
          className="flex items-center justify-between h-7 px-2 rounded-md cursor-pointer border border-[#15CE8C]"
        >
          <span className="font-medium text-xs lg:text-sm">
            <b className="font-bold text-white">
              {formatBalanceNumber(
                network === 'EVM' ? airdrop.total : airdrop.total,
              )}{' '}
              <span className="hidden lg:inline-block"> $HOLO</span>
            </b>
          </span>
          <ArrowDown
            className={clsx('transition-all', showDetail && 'rotate-180')}
          />
        </div>
      </div>
      {showDetail && (
        <div className="flex flex-col p-2 gap-2">
          <span className="font-medium text-sm text-white/50 pl-2">
            Eligible Types:
          </span>
          <div className="">
            {Object.entries(airdrop.detail).map(([type, amount]) => (
              <span
                key={type}
                className="inline-block py-1.5 px-2 mr-2 mb-2 rounded-md font-semibold text-xs lg:text-sm capitalize"
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

const CheckAndSign: FC<{ completeCheck: () => void }> = ({ completeCheck }) => {
  const { addToast } = useToast();
  const {
    evmAddressList,
    evmReceiverAddress,
    setEvmReceiverAddress,
    openEvm,
    evmSignData,
    onEvmConnected,
    reset,
    solAddressList,
    solSignedData,
    openSol,
    solReceiverAddress,
    setSolReceiverAddress,
    onSolConnected,
  } = useAppStore();
  const { multiClaim } = useAirdropClaimOnBSC();
  const { claimAirdropWithReceiver } = useAirdropClaimOnSolana();
  const { address } = useAccount();
  const { publicKey, disconnect: disconnectSolana, signMessage } = useWallet();
  const disconnectEvm = useDisconnect();
  const [networkTab, setNetworkTab] = useState(NetworkTabs[0].name);
  const [addWalletOpen, setAddWalletOpen] = useState<boolean>(false);
  const [claimOpen, setClaimOpen] = useState<boolean>(false);
  const connectType = useRef<'receiver' | 'sender' | 'none'>('none');

  const limitEvmAddress = evmAddressList.length === 10;
  const limitSolAddress = solAddressList.length === 1;

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
    completeCheck();
  };

  const openConnect = () => {
    if (networkTab == 'EVM') {
      openEvm();
    }
    if (networkTab == 'SOL') {
      openSol();
    }
  };

  const isValidReceiver = () => {
    if (networkTab === 'SOL') {
      return checkSolanaAddress(solReceiverAddress).valid;
    } else {
      return isAddress(evmReceiverAddress);
    }
  };

  const connectSenderAddress = () => {
    if (!isValidReceiver()) {
      addToast('Please input valid receiver address.', 'warning');
      return;
    }
    if (limitEvmAddress || limitSolAddress) {
      addToast('Exceed address maximum.');
      return;
    }
    connectType.current = 'sender';

    openConnect();
  };

  useEffect(() => {
    if (publicKey) {
      if (connectType.current === 'receiver') {
        setSolReceiverAddress(publicKey.toBase58());
      }
      if (connectType.current === 'sender') {
        onSolConnected(publicKey.toBase58());
      }
      connectType.current = 'none';
    }
  }, [connectType, publicKey]);

  useEffect(() => {
    if (address) {
      if (connectType.current === 'receiver') {
        setEvmReceiverAddress(address);
      }
      if (connectType.current === 'sender') {
        onEvmConnected(address);
      }
      connectType.current = 'none';
    }
  }, [connectType, address]);

  useEffect(() => {
    disconnectEvm.disconnect();
    disconnectSolana();
    reset();
  }, []);

  const verifiedCount =
    networkTab === 'SOL' ? solAddressList.length : evmAddressList.length;

  const totalAmount = (
    networkTab === 'SOL' ? solAddressList : evmAddressList
  ).reduce((pre, cur) => {
    return pre + Number(cur.total);
  }, 0);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center gap-3 w-full lg:w-[628px]">
          <div className="h-[1px] w-1/3 bg-white/20"></div>
          <span className="font-semibold text-sm lg:text-base text-nowrap">
            Select Claim Network
          </span>
          <div className="h-[1px] w-1/3 bg-white/20"></div>
        </div>
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
                setSolReceiverAddress('');
                setEvmReceiverAddress('');

                if (network.name === 'SOL') {
                  disconnectEvm.disconnect();
                } else {
                  disconnectSolana();
                }
                reset();
              }}
            >
              {network.icon && <network.icon />}
              {network.name}
            </a>
          ))}
        </div>
      </div>

      {/* receive address */}
      <div className="flex flex-col gap-2 w-full lg:w-[814px] px-6">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-sm">Receiving Address*</span>
          <span className="font-medium text-xs text-black/65">
            Assign a wallet to receive your $HOLO rewards
          </span>
        </div>
        <label className="input input-sm flex items-center justify-between gap-2 h-10 bg-black/5 max-w-full w-full border focus-within:border-[#6FFFCB]">
          <input
            type="text"
            className="h-full w-full font-medium text-xs"
            placeholder="Enter and verify wallet address to claim airdrop"
            value={
              networkTab === 'SOL' ? solReceiverAddress : evmReceiverAddress
            }
            onChange={(e) =>
              networkTab === 'SOL'
                ? setSolReceiverAddress(e.target.value)
                : setEvmReceiverAddress(e.target.value)
            }
          />
        </label>
      </div>
      {/* add address */}
      <div className="flex flex-col gap-2 w-full lg:w-[814px] px-6">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-sm">Verify Wallet Address*</span>
        </div>
        <label className="input input-sm flex items-center justify-between gap-2 h-10 bg-black/5 max-w-full w-full border focus-within:border-[#6FFFCB]">
          <input
            type="text"
            className="h-full w-full font-medium text-xs"
            placeholder="Connect and verify wallet address to claim airdrop"
          />
          <button
            className={clsx(
              'btn btn-xs h-7 w-[140px] rounded-md border-none text-xs font-bold !bg-transparent',
              'text-[#6FFFCB]',
            )}
            onClick={connectSenderAddress}
          >
            <AddIcon /> Connect Wallet
          </button>
        </label>
      </div>
      {/* address list */}
      <div className="flex flex-col items-center w-full px-3">
        {/* {networkTab === 'EVM' && (
          <div className="flex items-center justify-between h-[83px] w-full lg:w-[698px] px-6 rounded-2xl border border-white bg-white/35">
            <span className="font-semibold text-sm">Total Eligible Token</span>
            <span className="flex items-end font-[PPMonumentExtended]">
              <span className="font-bold text-[30px]">
                {formatBalanceNumber(formatEther(totalAmount))}
              </span>
              <span className="font-medium text-xs text-black/80">$HOLO</span>
            </span>
          </div>
        )} */}
        <div className="flex flex-col w-full py-3 gap-4 px-0 rounded-b-2xl">
          <div className="flex items-center justify-center gap-1 text-sm font-medium">
            Verified{' '}
            <b className="font-bold text-white">
              <b className="text-[#08EDDF]">{verifiedCount}</b>/
              {networkTab === 'SOL' ? 1 : 10}
            </b>{' '}
            wallets <WalletIcon className="w-4 h-4 text-white/90" />
          </div>
          <div className="flex flex-col gap-3">
            {(networkTab === 'SOL' ? solAddressList : evmAddressList).map(
              (airdrop, index) => (
                <AirdropItem
                  key={index}
                  airdrop={airdrop}
                  defaultOpen={index === 0}
                  network={networkTab}
                />
              ),
            )}
          </div>
        </div>

        <button
          className="btn mt-3 w-[280px] lg:w-[360px] rounded-full border-none text-black/95 font-bold text-sm disabled:text-black/50"
          onClick={handleClaim}
          disabled={
            (networkTab === 'EVM' &&
              (evmAddressList.length === 0 || !evmReceiverAddress)) ||
            (networkTab === 'SOL' &&
              (solAddressList.length === 0 || !solReceiverAddress))
          }
          style={{
            background:
              'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
          }}
        >
          {'Go to Claim'}
        </button>
      </div>

      {/* <div className="flex items-center justify-center gap-1 text-sm font-medium">
        <WalletIcon className="w-4 h-4 text-black/90" />
        Verify up to{' '}
        <b className="font-bold text-black">
          {networkTab === 'SOL' ? 1 : 10}
        </b>{' '}
        wallets
      </div> */}

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

export default CheckAndSign;
