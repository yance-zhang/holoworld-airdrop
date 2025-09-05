import { AirdropProof, getSolanaAirdropProofApi } from '@/api';
import AddIcon from '@/assets/images/airdrop/add.svg';
import ArrowDown from '@/assets/images/airdrop/arrow-down.svg';
import EthIcon from '@/assets/images/airdrop/eth.svg';
import SolIcon from '@/assets/images/airdrop/sol.svg';
import UnconnectedIcon from '@/assets/images/airdrop/unconnected.svg';
import WalletIcon from '@/assets/images/layout/wallet.svg';
import { useAppStore } from '@/context/AppStoreContext';
import { useAirdropClaimOnBSC } from '@/contract/bnb';
import { useAirdropClaimOnSolana } from '@/contract/solana';
import { formatBalanceNumber, shortenAddress } from '@/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import clsx from 'clsx';
import { FC, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useDisconnect } from 'wagmi';
import AddWalletModal from '../AddWalletModal';
import ClaimModal from '../ClaimModal';
import DisclaimerModal from '../DisclaimerModal';

export const NetworkTabs = [
  { name: 'SOL', icon: SolIcon },
  { name: 'EVM', icon: EthIcon },
];

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
        'flex flex-col items-stretch p-[1px] rounded-xl transition-all bg-[#00000005]',
        showDetail ? 'max-h-[300px]' : 'max-h-[42px]',
      )}
    >
      <div className="flex items-center justify-between px-1.5 lg:px-3 py-1.5 bg-white/90 rounded-xl">
        <div className="flex items-center gap-1 font-semibold text-sm">
          <span className="flex items-center gap-0.5">
            {network === 'SOL' ? <SolIcon /> : <EthIcon />}
            {network}:
          </span>
          <span className="font-semibold text-xs lg:text-sm text-black/90">
            {shortenAddress(airdrop.address)}
          </span>
          <span
            onClick={disconnectWallet}
            className="inline-flex w-7 h-7 items-center justify-center rounded bg-black/5"
          >
            <UnconnectedIcon />
          </span>
        </div>
        <div
          onClick={() => setShowDetail(!showDetail)}
          className="flex items-center justify-between w-40 px-2 rounded-md bg-[#DAFF8052] cursor-pointer"
        >
          <span className="font-medium text-xs lg:text-sm text-black/80">
            <b className="font-bold text-black">
              {formatBalanceNumber(
                network === 'EVM'
                  ? formatEther(BigInt(airdrop.amount))
                  : Number(airdrop.amount) / LAMPORTS_PER_SOL,
              )}{' '}
              $HOLO
            </b>
          </span>
          <ArrowDown
            className={clsx('transition-all', showDetail && 'rotate-180')}
          />
        </div>
      </div>
      {showDetail && (
        <div className="flex flex-col p-2 gap-2">
          <span className="font-medium text-sm text-black/80">
            Eligible Types:
          </span>
          <div className="">
            {Object.entries(airdrop.detail).map(([type, amount]) => (
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

const VerifyAddress: FC = () => {
  const {
    evmAddressList,
    evmReceiverAddress,
    openEvm,
    evmSignData,
    solAddressList,
    solSignedData,
    openSol,
    solReceiverAddress,
  } = useAppStore();
  const { multiClaim } = useAirdropClaimOnBSC();
  const { claimAirdropWithReceiver } = useAirdropClaimOnSolana();
  const { address } = useAccount();
  const { publicKey } = useWallet();
  const [addWalletOpen, setAddWalletOpen] = useState<boolean>(false);
  const [claimOpen, setClaimOpen] = useState<boolean>(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState<boolean>(false);

  const networkTab = solReceiverAddress ? 'SOL' : 'EVM';

  const handleAddAddress = (addr: string, network: string) => {
    if (!addr) return;

    // setNetworkTab(network);
    // if (network === 'SOL') {
    //   setSolAddresses([...solAddresses, addr]);
    // } else if (network === 'BNB') {
    //   setevmAddressList([...evmAddressList, addr]);
    // }
  };

  const claimOnBsc = async () => {
    if (evmSignData.length === 0) {
      return;
    }
    try {
      const phase = 2;
      const res = await multiClaim(phase, evmSignData);

      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const claimOnSolana = async () => {
    if (!publicKey || !solSignedData) {
      return;
    }
    try {
      const proofInfo = await getSolanaAirdropProofApi(
        solSignedData.signer.toBase58(),
      );

      const res = await claimAirdropWithReceiver({
        proofInfo,
        signedData: solSignedData,
      });
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClaim = () => {
    setDisclaimerOpen(false);
    if (networkTab === 'SOL') {
      if (publicKey?.toBase58() !== solReceiverAddress) {
        openSol();
        return;
      }
      claimOnSolana();
    }
    if (networkTab === 'EVM') {
      if (address !== evmReceiverAddress) {
        openEvm();
        return;
      }
      claimOnBsc();
    }
  };

  const connectReceiverAddress = () => {
    if (evmReceiverAddress) {
      openEvm();
    } else {
      openSol();
    }
  };

  const verifiedCount =
    networkTab === 'SOL' ? solAddressList.length : evmAddressList.length;

  const totalAmount = (
    networkTab === 'SOL' ? solAddressList : evmAddressList
  ).reduce((pre, cur) => {
    return pre + BigInt(cur.amount);
  }, 0n);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* receive address */}
      <div className="flex flex-col gap-2 w-full lg:w-[522px] px-6">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-sm">Receiving Address*</span>
          <span className="font-medium text-xs text-black/65">
            Assign a wallet to receive your $HOLO rewards
          </span>
        </div>
        <label className="input input-sm flex items-center justify-between gap-2 h-10 bg-black/5 max-w-full w-full lg:w-[522px]">
          <span className="text-xs font-medium">
            {shortenAddress(
              networkTab === 'SOL' ? solReceiverAddress : evmReceiverAddress,
            )}
          </span>
          <button
            className={clsx(
              'btn btn-xs h-7 w-[140px] rounded-md border-none text-xs text-black/95 font-bold !bg-transparent',
            )}
            style={{
              background:
                'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
            }}
            onClick={connectReceiverAddress}
          >
            <AddIcon /> Connect Wallet
          </button>
        </label>
      </div>
      {/* address list */}
      <div className="flex flex-col items-center w-full px-3">
        {networkTab === 'EVM' && (
          <div className="flex items-center justify-between h-[83px] w-full lg:w-[698px] px-6 rounded-2xl border border-white bg-white/35">
            <span className="font-semibold text-sm">Total Eligible Token</span>
            <span className="flex items-end font-[PPMonumentExtended]">
              <span className="font-bold text-[30px]">
                {formatBalanceNumber(formatEther(totalAmount))}
              </span>
              <span className="font-medium text-xs text-black/80">$HOLO</span>
            </span>
          </div>
        )}
        <div className="flex flex-col w-full lg:w-[650px] py-3 gap-4 px-0 lg:px-16 bg-white/80 rounded-b-2xl">
          <div className="flex items-center justify-center gap-1 text-sm font-medium">
            <WalletIcon className="w-4 h-4 text-black/90" />
            Verified{' '}
            <b className="font-bold text-black">
              <b className="text-[#08EDDF]">{verifiedCount}</b>/
              {networkTab === 'SOL' ? 1 : 10}
            </b>{' '}
            wallets
          </div>
          <div className="flex flex-col gap-3">
            {(networkTab === 'SOL' ? solAddressList : evmAddressList).map(
              (airdrop, index) => (
                <AirdropItem
                  key={airdrop.address}
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
          onClick={() => setDisclaimerOpen(true)}
          disabled={
            (networkTab === 'EVM' && evmAddressList.length === 0) ||
            (networkTab === 'SOL' && !publicKey)
          }
          style={{
            background:
              'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
          }}
        >
          {(networkTab === 'EVM' && evmReceiverAddress !== address) ||
          (networkTab === 'SOL' && solReceiverAddress !== publicKey?.toBase58())
            ? 'Connect Receiver Account'
            : 'Claim Now'}
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

      <DisclaimerModal
        open={disclaimerOpen}
        onClose={() => setDisclaimerOpen(false)}
        onConfirm={handleClaim}
      />
    </div>
  );
};

export default VerifyAddress;
