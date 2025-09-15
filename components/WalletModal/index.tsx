import CloseIcon from '@/assets/images/wallets/close.svg';
import { FC, useCallback, useState } from 'react';
import { useWalletChain } from '@/context/WalletChainContext';
// import { useConnect, useAccount } from 'wagmi';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

const WalletModal: FC<WalletModalProps> = ({ open, onClose }) => {
  const { activeChain } = useWalletChain();
  const [isConnecting, setIsConnecting] = useState(false);

  // EVM wallet hooks
  // const { connect: connectEvm } = useConnect();
  // const { isConnected: isEvmConnected } = useAccount();

  // Solana wallet hooks

  // const handleEvmConnect = useCallback(async (connector: any) => {
  //   try {
  //     setIsConnecting(true);
  //     await connectEvm({ connector });
  //     onClose();
  //   } catch (error) {
  //     console.error('Failed to connect EVM wallet:', error);
  //   } finally {
  //     setIsConnecting(false);
  //   }
  // }, [connectEvm, onClose]);

  // const handleSolanaConnect = useCallback(async (walletName: WalletName) => {
  //   try {
  //     setIsConnecting(true);
  //     select(walletName);
  //     // The actual connection will happen automatically after selection
  //     // due to autoConnect behavior
  //     setTimeout(() => {
  //       if (isSolConnected) {
  //         onClose();
  //       }
  //       setIsConnecting(false);
  //     }, 1000);
  //   } catch (error) {
  //     console.error('Failed to connect Solana wallet:', error);
  //     setIsConnecting(false);
  //   }
  // }, [select, isSolConnected, onClose]);

  // const wallets = activeChain === 'EVM' ? evmWallets : solanaWallets;

  return (
    <dialog open={open} className="modal bg-black/50">
      <div className="modal-box w-[90vw] rounded-[20px] bg-[#121212] p-6 lg:w-[440px] lg:max-w-[440px]">
        <button
          className="btn btn-circle btn-ghost btn-xs absolute right-6 top-6"
          onClick={onClose}
          disabled={isConnecting}
        >
          <CloseIcon />
        </button>

        <div className="flex flex-col gap-6">
          <div className="text-yellow text-center text-lg font-bold leading-tight">
            Connect {activeChain === 'EVM' ? 'EVM' : 'Solana'} Wallet
          </div>

          <div className="flex flex-col gap-3">
            {/* {activeChain === 'EVM' ? (
              // EVM Wallets
              evmWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  className="btn w-full justify-start gap-3 px-4 py-3"
                  // onClick={() => handleEvmConnect(wallet.connector)}
                  disabled={isConnecting}
                >
                  {wallet.icon && (
                    <img
                      className="h-6 w-6"
                      src={wallet.icon}
                      alt={wallet.name}
                    />
                  )}
                  <span className="flex-1 text-left">{wallet.name}</span>
                  {isConnecting && <span className="loading loading-spinner loading-sm"></span>}
                </button>
              ))
            ) : (
              // Solana Wallets
              solanaWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  className="btn w-full justify-start gap-3 px-4 py-3"
                  // onClick={() => handleSolanaConnect(wallet.adapter.name as WalletName)}
                  disabled={isConnecting}
                >
                  {wallet.icon && (
                    <img
                      className="h-6 w-6"
                      src={wallet.icon}
                      alt={wallet.name}
                    />
                  )}
                  <span className="flex-1 text-left">{wallet.name}</span>
                  {isConnecting && <span className="loading loading-spinner loading-sm"></span>}
                </button>
              ))
            )} */}
          </div>

          <div className="text-center text-xs text-gray-400">
            {activeChain === 'EVM'
              ? 'Connect your BNB Chain wallet to continue'
              : 'Connect your Solana wallet to continue'}
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default WalletModal;
