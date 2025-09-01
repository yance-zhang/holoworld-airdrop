import WarningIcon from '@/assets/images/airdrop/warning.svg';
import CloseIcon from '@/assets/images/wallets/close.svg';
import { FC } from 'react';
import { createPortal } from 'react-dom';
import { InputAddress } from '../VerifyAddress/inputAddress';

const AddWalletModal: FC<{
  open: boolean;
  network: string;
  onClose: () => void;
  onConfirm: (address: string, network: string) => void;
}> = ({ open, network, onClose, onConfirm }) => {
  return createPortal(
    <dialog open={open} className="modal bg-black/50">
      <div className="modal-box w-[90vw] lg:w-[440px] lg:max-w-[440px] p-6 bg-[#F6F6F6] rounded-[20px]">
        <button
          className="btn btn-xs btn-circle btn-ghost absolute right-6 top-6"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
        <div className="flex flex-col gap-6">
          <div className="text-center text-lg font-bold leading-tight text-yellow">
            Add wallet
          </div>

          <div className="flex items-center gap-2 bg-[#FF36660A] p-3 rounded-lg">
            <WarningIcon />
            <span className="font-medium text-xs">
              This wallet has already been claimed
            </span>
          </div>

          <span className="font-medium text-sm text-black/80">
            {`Looks like you've already claimed your allocated $HOLO for this
            wallet. Please enter another one to claim the reward`}
          </span>

          <InputAddress
            onAdd={(addr, network) => {
              onConfirm(addr, network);
              onClose();
            }}
            showButton={false}
            network={network}
          />
        </div>
      </div>
    </dialog>,
    document.body,
  );
};

export default AddWalletModal;
