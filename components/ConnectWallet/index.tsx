import CloseIcon from '@/assets/images/wallets/close.svg';
import { FC } from 'react';
import { useConnect } from 'wagmi';

const ConnectWallet: FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const { connectors, connect } = useConnect();

  const filteredConnectors = connectors.filter(
    (c) => c.name !== 'Injected' && c.name !== 'Phantom',
  );

  return (
    <dialog open={open} className="modal bg-black/50">
      <div className="modal-box w-[90vw] lg:w-[440px] lg:max-w-[440px] p-6 bg-[#121212] rounded-[20px]">
        <button
          className="btn btn-xs btn-circle btn-ghost absolute right-6 top-6"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
        <div className="flex flex-col gap-6">
          <div className="text-center text-lg font-bold leading-tight text-yellow">
            Connect wallet
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {filteredConnectors.map((connector) => (
              <button
                className="btn w-[268px]"
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  onClose();
                }}
              >
                {connector.icon && (
                  <img
                    className="w-6 h-6"
                    src={connector.icon}
                    alt={connector.name}
                  />
                )}
                {connector.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default ConnectWallet;
