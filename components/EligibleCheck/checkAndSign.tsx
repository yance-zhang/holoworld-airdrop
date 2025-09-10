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
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { isAddress } from 'viem';
import { useAccount, useDisconnect } from 'wagmi';
import DisclaimerModal from '../DisclaimerModal';
import { NetworkTabs } from '../VerifyAddress';
import { EligibleIconMap } from '@/pages';
import ClaimProgress from './claimProgress';

const AirdropItem: FC<{
  airdrop: AirdropProof;
  network: string;
  disconnectAddress: () => void;
}> = ({ airdrop, network, disconnectAddress }) => {
  const { disconnect } = useDisconnect();
  const { disconnect: DisconnectSolana } = useWallet();
  const { reset } = useAppStore();

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
        'flex flex-col items-stretch p-[1px] rounded-xl transition-all lg:w-[814px]',
      )}
    >
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl">
        <div className="flex items-center gap-1 font-semibold text-sm">
          <span
            className={clsx(
              'flex items-center gap-1 font-semibold text-sm',
              'text-white',
            )}
          >
            <span className="flex items-center gap-0.5">
              {network === 'SOL' ? <SolIcon /> : <EthIcon />}
              {network}:
            </span>
            {shortenAddress(airdrop.address)}
          </span>

          <span
            onClick={() => disconnectAddress()}
            className="inline-flex w-7 h-7 items-center cursor-pointer justify-center rounded bg-[#FF3666]/20 text-[#FF3666]"
          >
            <UnconnectedIcon />
          </span>

          {airdrop.detail && (
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
        {airdrop.total ? (
          <div className="flex items-center justify-between gap-2 px-2 rounded-md border-[#15CE8C] border cursor-pointer">
            <span className="font-semibold text-sm">
              {formatBalanceNumber(airdrop.total)} $HOLO
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 h-7 px-2 rounded-md bg-[#FF3666]/20">
            <span className="font-semibold text-sm text-[#FF3666]">
              Ineligible
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckAndSign: FC<{
  completeClaim: (amount: number) => void;
}> = ({ completeClaim }) => {
  const { addToast } = useToast();
  const {
    evmAddressList,
    evmReceiverAddress,
    setEvmReceiverAddress,
    disconnectEvmAddress,
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
    disconnectSolAddress,
  } = useAppStore();
  const { multiClaim } = useAirdropClaimOnBSC();
  const { claimAirdropWithReceiver } = useAirdropClaimOnSolana();
  const { address } = useAccount();
  const { publicKey, disconnect: disconnectSolana } = useWallet();
  const disconnectEvm = useDisconnect();
  const [networkTab, setNetworkTab] = useState(NetworkTabs[0].name);
  const [disclaimerOpen, setDisclaimerOpen] = useState<boolean>(false);
  const connectType = useRef<'receiver' | 'sender' | 'none'>('none');

  const limitEvmAddress = evmAddressList.length === 10;
  const limitSolAddress = solAddressList.length === 1;

  const verifiedCount =
    networkTab === 'SOL' ? solAddressList.length : evmAddressList.length;

  const { totalAmount, claimedAmount, unlockedAmount } = useMemo(() => {
    const addressList = networkTab === 'SOL' ? solAddressList : evmAddressList;
    return addressList.reduce(
      (pre, cur) => {
        return {
          totalAmount: pre.totalAmount + Number(cur.total),
          claimedAmount: pre.claimedAmount + Number(0),
          unlockedAmount: pre.unlockedAmount + Number(cur.unlocked),
        };
      },
      {
        totalAmount: 0,
        claimedAmount: 0,
        unlockedAmount: 0,
      },
    );
  }, [evmAddressList, networkTab, solAddressList]);

  const claimOnBsc = async () => {
    if (evmSignData.length === 0) {
      return;
    }
    try {
      const phase = evmAddressList[0].proofs[0].phase;
      const res = await multiClaim(phase, evmSignData);

      console.log(res);
      completeClaim(Number(totalAmount));
    } catch (error) {
      console.log(error);
    }
  };

  const claimOnSolana = async () => {
    if (!publicKey || !solSignedData) {
      return;
    }
    try {
      const res = await claimAirdropWithReceiver({
        proofInfo: solAddressList[0],
        signedData: solSignedData,
      });
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClaim = () => {
    if (networkTab === 'SOL') {
      if (publicKey?.toBase58() !== solReceiverAddress) {
        openSol();
        return;
      }
    }
    if (networkTab === 'EVM') {
      if (address !== evmReceiverAddress) {
        openEvm();
        return;
      }
    }
    setDisclaimerOpen(true);
  };

  const doClaim = () => {
    setDisclaimerOpen(false);
    if (networkTab === 'SOL') {
      claimOnSolana();
    } else {
      claimOnBsc();
    }
  };

  const openConnect = () => {
    if (networkTab == 'EVM') {
      openEvm();
    }
    if (networkTab == 'SOL') {
      openSol();
    }
  };

  const disconnectAddress = (index: number) => {
    if (networkTab === 'EVM') {
      disconnectEvmAddress(index);
    } else {
      disconnectSolana();
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

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center gap-3 w-full lg:w-[628px]">
          <div className="h-[1px] w-1/3 bg-white/20"></div>
          <span className="font-semibold text-sm lg:text-base text-nowrap text-white/60">
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
        <div className="flex flex-col w-full py-3 gap-4 px-0 rounded-b-2xl">
          <div className="flex items-center justify-center gap-1 text-sm font-medium text-white/80">
            Verified{' '}
            <b className="font-bold text-white/80">
              <b className="text-[#08EDDF]">{verifiedCount}</b>/
              {networkTab === 'SOL' ? 1 : 10}
            </b>{' '}
            wallets <WalletIcon className="w-4 h-4 text-white/80" />
          </div>
          <div className="flex flex-col gap-3">
            {(networkTab === 'SOL' ? solAddressList : evmAddressList).map(
              (airdrop, index) => (
                <AirdropItem
                  key={index}
                  airdrop={airdrop}
                  network={networkTab}
                  disconnectAddress={() => disconnectAddress(index)}
                />
              ),
            )}
          </div>
        </div>
      </div>

      <ClaimProgress
        claimed={claimedAmount}
        unlocked={unlockedAmount}
        total={totalAmount}
        onClick={handleClaim}
        btnDisabled={
          (networkTab === 'EVM' &&
            (evmAddressList.length === 0 || !evmReceiverAddress)) ||
          (networkTab === 'SOL' &&
            (solAddressList.length === 0 || !solReceiverAddress))
        }
        isClaim={true}
        connectReceiver={
          (networkTab === 'EVM' && evmReceiverAddress !== address) ||
          (networkTab === 'SOL' && solReceiverAddress !== publicKey?.toBase58())
        }
      />

      <DisclaimerModal
        open={disclaimerOpen}
        onClose={() => setDisclaimerOpen(false)}
        onConfirm={doClaim}
      />
    </div>
  );
};

export default CheckAndSign;
