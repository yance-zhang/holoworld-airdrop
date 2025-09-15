import { useAppStore } from '@/context/AppStoreContext';
import { useAirdropClaimEvm } from '@/contract/bnb';
import { useAirdropClaimSol } from '@/contract/solana';
import { checkSolanaAddress, shortenAddress } from '@/utils';
import { FC, useEffect, useMemo, useState } from 'react';
import { isAddress } from 'viem';
import DisclaimerModal from '../DisclaimerModal';
import { NetworkTabs } from '@/utils/constants';
import { useWalletChain } from '@/context/WalletChainContext';
import {
  ConnectedSolanaWallet,
  ConnectedWallet,
  useConnectWallet,
  useSolanaWallets,
  useWallets,
} from '@privy-io/react-auth';
import { useSolanaLedgerPlugin } from '@privy-io/react-auth/solana';
import classNames from 'classnames';
import { showError } from '@/utils/toasts';
import ClaimProgress from '../ClaimProgress/ClaimProgress';

export default function Claim({
  completeClaim,
}: {
  completeClaim: (amount: number) => void;
}) {
  //#region Hooks

  useSolanaLedgerPlugin();
  const {
    // EVM
    evmVerifyAddress,
    setEvmVerifyAddress,
    evmReceiverAddress,
    setEvmReceiverAddress,
    evmVerifyWalletSignData,
    evmVerifyWalletAidropProof,
    disconnectEvmVerifyAddress,
    onEvmVerifyAddressConnected,
    onEvmReceiverAddressConnected,

    // EVM
    solVerifyAddress,
    setSolVerifyAddress,
    solReceiverAddress,
    setSolReceiverAddress,
    solVerifyWalletSignData,
    solVerifyWalletAidropProof,
    disconnectSolVerifyAddress,
    onSolVerifyAddressConnected,
    onSolReceiverAddressConnected,
  } = useAppStore();

  const { claim: claimOnEvm } = useAirdropClaimEvm();
  const { claim: claimOnSol } = useAirdropClaimSol();
  const { wallets: connectedEvmWallets } = useWallets();
  const { wallets: connectedSolWallets } = useSolanaWallets();
  const { activeChain, setActiveChain } = useWalletChain();

  //#endregion

  //#region Refs

  //#endregion

  //#region State

  /**
   * 1) None => the user still needs to insert the verify and receiving address in the input fields
   * 2) Verify => the user needs to connect the verify address
   * 3) Reciver => the user needs to connect the reciver address
   * 4) Claim => the user needs to perform the claim
   */
  const [claimStatus, setClaimStatus] = useState<
    'none' | 'verify' | 'receiver' | 'claim'
  >('none');

  const [solValidInputAddresses, setSolValidInputAddresses] =
    useState<boolean>(true);
  const [evmValidInputAddresses, setEvmValidInputAddresses] =
    useState<boolean>(true);
  const [disclaimerOpen, setDisclaimerOpen] = useState<boolean>(false);

  //#endregion

  //#region UseEffects

  /**
   * SOL: Check if Verify and Receiver inputs are valid
   */
  useEffect(() => {
    if (!solReceiverAddress || !solVerifyAddress) {
      setSolValidInputAddresses(false);
      return;
    }

    if (solReceiverAddress && !checkSolanaAddress(solReceiverAddress).valid) {
      setSolValidInputAddresses(false);
      return;
    }

    if (solVerifyAddress && !checkSolanaAddress(solVerifyAddress).valid) {
      setSolValidInputAddresses(false);
      return;
    }

    // If the inputs are valid, we can proceed
    // to connect the verify wallet
    setSolValidInputAddresses(true);
  }, [solReceiverAddress, solVerifyAddress]);

  /**
   * EVM: Check if Verify and Receiver inputs are valid
   */
  useEffect(() => {
    if (!evmReceiverAddress || !evmVerifyAddress) {
      setEvmValidInputAddresses(false);
      return;
    }

    if (evmReceiverAddress && !isAddress(evmReceiverAddress)) {
      setEvmValidInputAddresses(false);
      return;
    }

    if (evmVerifyAddress && !isAddress(evmVerifyAddress)) {
      setEvmValidInputAddresses(false);
      return;
    }

    // If the inputs are valid, we can proceed
    // to connect the verify wallet
    setEvmValidInputAddresses(true);
  }, [evmReceiverAddress, evmVerifyAddress]);

  /**
   * Use this useEffect to figure out what stage of the claim process
   * are we on:
   * 1) None => the user still needs to insert the verify and receiving address in the input fields
   * 2) Verify => the user needs to connect the verify address
   * 3) Reciver => the user needs to connect the reciver address
   * 4) Claim => the user needs to perform the claim
   */
  useEffect(() => {
    if (activeChain === 'SOL') {
      handleUpdateClaimStatusSol();
    }

    if (activeChain === 'EVM') {
      handleUpdateClaimStatusEvm();
    }
  }, [
    activeChain,
    evmValidInputAddresses,
    solValidInputAddresses,
    evmVerifyWalletSignData,
    evmVerifyWalletAidropProof,
    solVerifyWalletSignData,
    solVerifyWalletAidropProof,
  ]);

  //#endregion

  //#region Memos

  const { totalAmount, claimedAmount, unlockedAmount, claimableAmount } =
    useMemo(() => {
      const proof =
        activeChain === 'SOL'
          ? solVerifyWalletAidropProof
          : evmVerifyWalletAidropProof;

      if (!proof) {
        return {
          totalAmount: 0,
          claimedAmount: 0,
          unlockedAmount: 0,
          claimableAmount: 0,
        };
      }

      return {
        totalAmount: Number(proof.total),
        claimedAmount: Number(proof.claimed),
        unlockedAmount: Number(proof.unlocked),
        claimableAmount: Number(proof.unlocked) - Number(proof.claimed),
      };
    }, [activeChain, evmVerifyWalletAidropProof, solVerifyWalletAidropProof]);

  //#endregion

  //#region Functions

  /**
   * Handles the connected Verify wallet callback
   */
  const handleOnVerifyWalletConnected = (
    wallet: ConnectedWallet | ConnectedSolanaWallet
  ) => {
    // Handle SOL
    if (activeChain === 'SOL') {
      handleOnVerifyWalletConnectedSol(wallet);
    }

    // Handle EVM
    if (activeChain === 'EVM') {
      handleOnVerifyWalletConnectedEvm(wallet);
    }
  };

  /**
   * Handles the connected Receiver wallet callback
   */
  const handleOnReceiverWalletConnected = async (
    wallet: ConnectedWallet | ConnectedSolanaWallet
  ) => {
    if (activeChain === 'SOL') {
      handleOnReceiverWalletConnectedSol(wallet);
    }

    if (activeChain === 'EVM') {
      handleOnReceiverWalletConnectedEvm(wallet);
    }
  };

  //#region SOL

  /**
   * Checks for the current claim process status on SOL
   */
  const handleUpdateClaimStatusSol = () => {
    // If the wallets have not been inserted
    if (!solValidInputAddresses) {
      setClaimStatus('none');
      return;
    }

    // If the verify wallet has not been connected
    if (solValidInputAddresses && !solVerifyWalletAidropProof) {
      setClaimStatus('verify');
      return;
    }

    // If the verify wallet has not been connected
    if (
      solValidInputAddresses &&
      solVerifyWalletAidropProof &&
      !solVerifyWalletSignData
    ) {
      setClaimStatus('receiver');
      return;
    }

    setClaimStatus('claim');
  };

  /**
   * SOL:
   * We use 1 single function to handle all the "on click"
   * on the main action button
   * based on the current claim status
   */
  const handleActionButtonClickedSol = () => {
    if (claimStatus === 'verify') {
      handleConnectVerifyWalletSol();
    }

    if (claimStatus === 'receiver') {
      handleConnectReceiverWalletSol();
    }

    if (claimStatus === 'claim') {
      // The modal will handle the callback
      setDisclaimerOpen(true);
    }
  };

  const handleConnectVerifyWalletSol = () => {
    // Disconnect any previous sol wallet
    for (const connectedWallet of connectedSolWallets) {
      connectedWallet.disconnect();
    }

    connectWallet({
      suggestedAddress: solVerifyAddress,
      walletChainType: 'solana-only',
      walletList: ['phantom', 'solflare', 'backpack'],
    });
  };

  const handleConnectReceiverWalletSol = () => {
    // Disconnect any previous sol wallet
    for (const connectedWallet of connectedSolWallets) {
      connectedWallet.disconnect();
    }

    connectWallet({
      suggestedAddress: solReceiverAddress,
      walletChainType: 'solana-only',
      walletList: ['phantom', 'solflare', 'backpack'],
    });
  };

  /**
   * SOL: Handles the callback for when the Verify wallet is connected
   */
  const handleOnVerifyWalletConnectedSol = async (
    wallet: ConnectedWallet | ConnectedSolanaWallet
  ) => {
    // Make sure the connected wallet is the right one
    if (wallet.address?.toLowerCase() !== solVerifyAddress?.toLowerCase()) {
      showError(
        `Invalid Verify wallet connected! Please connect ${shortenAddress(solVerifyAddress)}`
      );
      return;
    }

    // Handle the connection and the proof.
    // This will also handle the case that the wallet is not eligible
    const { isValid, errorMessage } = await onSolVerifyAddressConnected(
      wallet as ConnectedSolanaWallet
    );

    if (!isValid) {
      showError(errorMessage);
    }
  };

  /**
   * SOL: Handles the callback for when the Receiver wallet is connected
   */
  const handleOnReceiverWalletConnectedSol = async (
    wallet: ConnectedWallet | ConnectedSolanaWallet
  ) => {
    // Make sure the connected wallet is the right one
    if (wallet.address?.toLowerCase() !== solReceiverAddress?.toLowerCase()) {
      showError(
        `Invalid Receiver wallet connected! Please connect ${shortenAddress(solReceiverAddress)}`
      );
      return;
    }

    // Handle the connection and the proof.
    // This will also handle the case that the wallet is not eligible
    const { isValid, errorMessage } = await onSolReceiverAddressConnected(
      wallet as ConnectedSolanaWallet
    );

    if (!isValid) {
      showError(errorMessage);
    }
  };

  const handleClaimSol = async () => {
    const receiverWallet = connectedSolWallets.find(
      (x) => x.address.toLowerCase() === solReceiverAddress.toLowerCase()
    );
    if (!receiverWallet) {
      showError('Receiver wallet disconnected! Please re-connect it!');
      return;
    }

    if (!solVerifyWalletAidropProof || !solVerifyWalletSignData) {
      showError('Invalid verification data. Please try again');
      return;
    }

    const tx = await claimOnSol({
      proofInfo: solVerifyWalletAidropProof,
      signedData: solVerifyWalletSignData,
      connectedReceiverWallet: receiverWallet,
    });
    if (tx) {
      completeClaim(Number(solVerifyWalletSignData?.amount));
    } else {
      showError('Claim failed. Please try again later.');
    }
  };

  //#endregion

  //#region EVM

  /**
   * Checks for the current claim process status on EVM
   */
  const handleUpdateClaimStatusEvm = () => {
    // If the wallets have not been inserted
    if (!evmValidInputAddresses) {
      setClaimStatus('none');
      return;
    }

    // If the verify wallet has not been connected
    if (evmValidInputAddresses && !evmVerifyWalletAidropProof) {
      setClaimStatus('verify');
      return;
    }

    // If the verify wallet has not been connected
    if (
      evmValidInputAddresses &&
      evmVerifyWalletAidropProof &&
      !evmVerifyWalletSignData
    ) {
      setClaimStatus('receiver');
      return;
    }

    setClaimStatus('claim');
  };

  /**
   * EVM:
   * We use 1 single function to handle all the "on click"
   * on the main action button
   * based on the current claim status
   */
  const handleActionButtonClickedEvm = () => {
    if (claimStatus === 'verify') {
      handleConnectVerifyWalletEvm();
    }

    if (claimStatus === 'receiver') {
      handleConnectReceiverWalletEvm();
    }

    if (claimStatus === 'claim') {
      // The modal will handle the callback
      setDisclaimerOpen(true);
    }
  };

  const handleConnectVerifyWalletEvm = () => {
    // Disconnect any previous sol wallet
    for (const connectedWallet of connectedEvmWallets) {
      connectedWallet.disconnect();
    }

    connectWallet({
      suggestedAddress: evmVerifyAddress,
      walletChainType: 'ethereum-only',
      walletList: ['metamask', 'binance'],
    });
  };

  const handleConnectReceiverWalletEvm = () => {
    // Disconnect any previous sol wallet
    for (const connectedWallet of connectedEvmWallets) {
      connectedWallet.disconnect();
    }

    connectWallet({
      suggestedAddress: evmReceiverAddress,
      walletChainType: 'ethereum-only',
      walletList: ['metamask', 'binance'],
    });
  };

  /**
   * EVM: Handles the callback for when the Verify wallet is connected
   */
  const handleOnVerifyWalletConnectedEvm = async (
    wallet: ConnectedWallet | ConnectedSolanaWallet
  ) => {
    // Make sure the connected wallet is the right one
    if (wallet.address?.toLowerCase() !== evmVerifyAddress?.toLowerCase()) {
      showError(
        `Invalid Verify wallet connected! Please connect ${shortenAddress(evmVerifyAddress)}`
      );
      return;
    }

    // Handle the connection and the proof.
    // This will also handle the case that the wallet is not eligible
    const { isValid, errorMessage } = await onEvmVerifyAddressConnected(
      wallet as ConnectedWallet
    );

    if (!isValid) {
      showError(errorMessage);
    }
  };

  /**
   * EVM: Handles the callback for when the Receiver wallet is connected
   */
  const handleOnReceiverWalletConnectedEvm = async (
    wallet: ConnectedWallet | ConnectedSolanaWallet
  ) => {
    // Make sure the connected wallet is the right one
    if (wallet.address?.toLowerCase() !== evmReceiverAddress?.toLowerCase()) {
      showError(
        `Invalid Receiver wallet connected! Please connect ${shortenAddress(evmReceiverAddress)}`
      );
      return;
    }

    // Handle the connection and the proof.
    // This will also handle the case that the wallet is not eligible
    const { isValid, errorMessage } = await onEvmReceiverAddressConnected(
      wallet as ConnectedWallet
    );

    if (!isValid) {
      showError(errorMessage);
    }
  };

  const handleClaimEvm = async () => {
    const receiverWallet = connectedEvmWallets.find(
      (x) => x.address.toLowerCase() === evmReceiverAddress.toLowerCase()
    );
    if (!receiverWallet) {
      showError('Receiver wallet disconnected! Please re-connect it!');
      return;
    }

    if (!evmVerifyWalletAidropProof || !evmVerifyWalletSignData) {
      showError('Invalid verification data. Please try again');
      return;
    }

    const tx = await claimOnEvm({
      proofInfo: evmVerifyWalletAidropProof,
      signedData: evmVerifyWalletSignData,
      connectedReceiverWallet: receiverWallet,
    });
    if (tx) {
      completeClaim(Number(evmVerifyWalletSignData?.amount));
    } else {
      showError('Claim failed. Please try again later.');
    }
  };

  //#endregion

  const disconnectAddress = () => {
    if (activeChain === 'SOL') {
      disconnectSolVerifyAddress();
    }

    if (activeChain === 'EVM') {
      disconnectEvmVerifyAddress();
    }
  };

  const shouldDisableActionButton = (): boolean => {
    if (claimStatus === 'receiver') {
      if (claimableAmount === 0) {
        return true;
      }

      return false;
    }

    // For all other status
    return activeChain === 'SOL'
      ? !solValidInputAddresses
      : !evmValidInputAddresses;
  };

  //#endregion

  /**
   * Whenever a new wallet is connected, we get a callback here (onSuccess)
   * Based on the current claimStatus wer can easily figure out what type of
   * wallet is being connected (eg: a verify wallet or a receiver wallet)
   */
  const { connectWallet } = useConnectWallet({
    onSuccess: ({ wallet }) => {
      if (claimStatus === 'verify') {
        handleOnVerifyWalletConnected(
          wallet as ConnectedWallet | ConnectedSolanaWallet
        );
      }

      if (claimStatus === 'receiver') {
        handleOnReceiverWalletConnected(
          wallet as ConnectedWallet | ConnectedSolanaWallet
        );
      }
    },
  });

  return (
    <>
      <DisclaimerModal
        open={disclaimerOpen}
        onClose={() => setDisclaimerOpen(false)}
        onConfirm={
          activeChain === 'SOL'
            ? () => handleClaimSol()
            : () => handleClaimEvm()
        }
      />

      <div className="flex w-full flex-col items-center space-y-4">
        {/* Network swap */}
        <div className="flex w-full flex-col items-center space-y-2">
          <div className="flex w-full items-center gap-3 lg:w-[628px]">
            <div className="h-[1px] w-1/3 bg-white/20"></div>
            <span className="text-nowrap text-sm font-semibold text-white/60 lg:text-base">
              Select Claim Network
            </span>
            <div className="h-[1px] w-1/3 bg-white/20"></div>
          </div>
          <div
            role="tablist"
            className="tabs-box tabs w-[307px] rounded-full bg-white/10 p-1 lg:w-[360px]"
          >
            {NetworkTabs.map((network) => (
              <button
                className={`tab gap-0.5 rounded-full text-base ${activeChain === network.type ? 'bg-[#FDFDFD] font-bold text-black/95' : 'font-semibold text-white/35'}`}
                key={network.type}
                onClick={() => {
                  disconnectAddress();
                  setActiveChain(network.type);
                }}
              >
                {network.icon && <network.icon />}
                {network.type}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="w-full space-y-6 px-6 lg:max-w-3xl lg:px-0">
          {/* Verify Wallet Address */}
          <div className="flex w-full flex-col gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-semibold">
                Verify Wallet Address*
              </span>
              <span className="text-xs font-medium text-white/40">
                The wallet eligible for the airdrop.
              </span>
            </div>

            <label
              className={classNames(
                'input input-sm flex h-10 w-full max-w-full items-center justify-between gap-2 border bg-black/5',
                {
                  'border-red-500':
                    activeChain === 'SOL'
                      ? solVerifyAddress &&
                        !checkSolanaAddress(solVerifyAddress).valid
                      : evmVerifyAddress && !isAddress(evmVerifyAddress),
                  'border-white/30': !(activeChain === 'SOL'
                    ? solVerifyAddress &&
                      !checkSolanaAddress(solVerifyAddress).valid
                    : evmVerifyAddress && !isAddress(evmVerifyAddress)),
                  'focus-within:border-[#6FFFCB]': !(activeChain === 'SOL'
                    ? solVerifyAddress &&
                      !checkSolanaAddress(solVerifyAddress).valid
                    : evmVerifyAddress && !isAddress(evmVerifyAddress)),
                }
              )}
            >
              <input
                type="text"
                className="h-full w-full text-xs font-medium disabled:cursor-not-allowed"
                placeholder={activeChain === 'SOL' ? 'So1...' : '0x...'}
                value={
                  activeChain === 'SOL' ? solVerifyAddress : evmVerifyAddress
                }
                onChange={(e) =>
                  activeChain === 'SOL'
                    ? setSolVerifyAddress(e.target.value)
                    : setEvmVerifyAddress(e.target.value)
                }
              />
            </label>
          </div>

          {/* Receiving Address */}
          <div className="flex w-full flex-col gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-semibold">Receiving Address*</span>
              <span className="text-xs font-medium text-white/40">
                Assign a wallet to receive your $HOLO rewards
              </span>
            </div>
            <label
              className={classNames(
                'input input-sm flex h-10 w-full max-w-full items-center justify-between gap-2 border bg-black/5',
                {
                  'border-red-500':
                    activeChain === 'SOL'
                      ? solReceiverAddress &&
                        !checkSolanaAddress(solReceiverAddress).valid
                      : evmReceiverAddress && !isAddress(evmReceiverAddress),
                  'border-white/30': !(activeChain === 'SOL'
                    ? solReceiverAddress &&
                      !checkSolanaAddress(solReceiverAddress).valid
                    : evmReceiverAddress && !isAddress(evmReceiverAddress)),
                  'focus-within:border-[#6FFFCB]': !(activeChain === 'SOL'
                    ? solReceiverAddress &&
                      !checkSolanaAddress(solReceiverAddress).valid
                    : evmReceiverAddress && !isAddress(evmReceiverAddress)),
                }
              )}
            >
              <input
                type="text"
                className="h-full w-full text-xs font-medium"
                placeholder={activeChain === 'SOL' ? 'So1...' : '0x...'}
                value={
                  activeChain === 'SOL'
                    ? solReceiverAddress
                    : evmReceiverAddress
                }
                onChange={(e) =>
                  activeChain === 'SOL'
                    ? setSolReceiverAddress(e.target.value)
                    : setEvmReceiverAddress(e.target.value)
                }
              />
            </label>
          </div>
        </div>

        {/* Action button */}
        <div>
          <button
            className="btn mt-3 w-[280px] rounded-full border-none text-sm font-bold text-black/95 disabled:cursor-not-allowed disabled:text-black/50 lg:w-[360px]"
            onClick={
              activeChain === 'SOL'
                ? () => handleActionButtonClickedSol()
                : () => handleActionButtonClickedEvm()
            }
            disabled={shouldDisableActionButton()}
            style={{
              background:
                'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
            }}
          >
            {claimStatus === 'none' &&
              'Insert both valid addresses to continue'}

            {claimStatus === 'verify' && 'Connect Verify Wallet'}

            {claimStatus === 'receiver' && (
              <>
                {claimableAmount > 0
                  ? 'Connect Receiver Wallet'
                  : 'Already Claimed Unlocked Amount'}
              </>
            )}

            {claimStatus === 'claim' && 'Claim Airdrop!'}
          </button>
        </div>

        {((activeChain === 'EVM' && evmVerifyWalletAidropProof) ||
          (activeChain === 'SOL' && solVerifyWalletAidropProof)) && (
          <div className="w-full space-y-6 px-6 pt-4 lg:max-w-3xl lg:px-0">
            {/* Claim Progress */}
            <ClaimProgress
              claimed={claimedAmount}
              unlocked={unlockedAmount}
              total={totalAmount}
              airdrop={
                activeChain === 'SOL'
                  ? solVerifyWalletAidropProof
                  : evmVerifyWalletAidropProof
              }
              network={activeChain}
              disconnectAddress={() => disconnectAddress()}
            />
          </div>
        )}
      </div>
    </>
  );
}
