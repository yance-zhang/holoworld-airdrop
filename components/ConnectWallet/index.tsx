import CloseIcon from '@/assets/images/wallets/close.svg';
import { FC } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const ConnectWallet: FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();

  const filteredConnectors = connectors.filter((c) => c.name !== 'Injected');

  return (
    <dialog open={open} className="modal">
      <div className="modal-box w-96 max-w-96 p-8 bg-no-repeat bg-[#121212]">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-8 top-8"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
        <div className="flex flex-col gap-4">
          <div className="text-center text-[20px] font-[PPMonumentExtended] leading-tight text-yellow">
            Connect wallet
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {filteredConnectors.map((connector) => (
              <button
                className="btn w-[268px]"
                key={connector.id}
                onClick={() => connect({ connector }, { onSuccess: onClose })}
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
