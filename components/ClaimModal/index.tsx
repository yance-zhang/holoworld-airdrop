import ClaimBg from '@/assets/images/airdrop/claim-bg.png';
import CloseIcon from '@/assets/images/wallets/close.svg';
import JSConfetti from 'js-confetti';
import { FC } from 'react';
import { createPortal } from 'react-dom';

const ClaimModal: FC<{
  open: boolean;
  onClose: () => void;
  network: { name: string; icon: FC };
}> = ({ open, onClose, network }) => {
  const handleClaim = () => {
    onClose();

    const jsConfetti = new JSConfetti();
    setTimeout(() => {
      jsConfetti.addConfetti({
        confettiColors: ['#9b5de5', '#f15bb5', '#fee440', '#00bbf9', '#00f5d4'],
        confettiNumber: 1000,
      });
    }, 200);
  };

  return createPortal(
    <dialog open={open} className="modal bg-black/50">
      <div className="modal-box w-[440px] max-w-[440px] rounded-[20px] bg-[#F6F6F6] p-6">
        <button
          className="btn btn-circle btn-ghost btn-xs absolute right-6 top-6"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
        <div className="flex flex-col gap-6">
          <div className="text-yellow text-center text-lg font-bold leading-tight">
            Claim Token
          </div>

          <div
            className="flex flex-col gap-3 rounded-2xl bg-cover bg-no-repeat px-3 py-8"
            style={{
              background: `url(${ClaimBg.src})`,
            }}
          >
            <span className="text-sm font-medium">
              Total amount to be claimed
            </span>
            <span className="flex items-end gap-2 font-[PPMonumentExtended]">
              <span className="text-[30px] font-bold">12,312</span>
              <span className="text-xs font-medium text-black/80">$HOLO</span>
            </span>
          </div>

          <div className="grid grid-cols-2 items-center gap-3">
            <span className="text-sm font-medium text-black/65">Network</span>
            <span className="flex items-center justify-end gap-2 self-end text-lg font-semibold text-black">
              <network.icon /> {network.name}
            </span>
            <span className="text-sm font-medium text-black/65">Gas Fee</span>
            <span className="flex items-center justify-end gap-2 self-end text-lg font-semibold text-black">
              0.0003{' '}
              <span className="pt-1 text-xs text-black/65">{network.name}</span>
            </span>
          </div>

          <button
            className="btn mt-3 w-full rounded-full border-none text-sm font-bold text-black/95"
            onClick={handleClaim}
            style={{
              background:
                'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
            }}
          >
            Claim Now
          </button>
        </div>
      </div>
    </dialog>,
    document.body
  );
};

export default ClaimModal;
