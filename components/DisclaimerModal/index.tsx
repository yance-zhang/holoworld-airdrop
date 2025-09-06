import CloseIcon from '@/assets/images/wallets/close.svg';
import { FC } from 'react';
import { createPortal } from 'react-dom';

const DisclaimerModal: FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, onClose, onConfirm }) => {
  return createPortal(
    <dialog open={open} className="modal bg-black/50">
      <div className="modal-box w-[440px] max-w-[440px] p-6 bg-[#121212] rounded-[20px]">
        <button
          className="btn btn-xs btn-circle btn-ghost absolute right-6 top-6"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
        <div className="flex flex-col gap-4">
          <div className="text-center text-lg font-bold leading-tight text-yellow">
            Disclaimer
          </div>

          <div className="text-sm text-white/80 leading-5 tracking-tight max-w-prose whitespace-pre-wrap break-words max-h-[calc(100vh-243px)] overflow-scroll">
            {`Please read carefully before claiming your $HOLO tokens.
By continuing, you confirm that you have read, understood, and accepted the following:

1. Terms & Responsibility
This airdrop is run by Orbit Technologies Limited.
Your participation is governed by the Airdrop Terms and Conditions and the General Terms.
If you do not agree, you may not proceed with the claim.

2. Jurisdiction
Do not participate if you are located in a restricted jurisdiction or are a prohibited person.
Access may be revoked where distribution is legally restricted.

3. Taxes
Receiving tokens may be taxable in your country.
You are fully responsible for understanding and fulfilling any tax obligations.

4. Risks
Token value may be volatile or worth nothing.
Network failures, delays, and security vulnerabilities are possible.
Allocation displayed on-site is an estimate and may change.

5. Transferability & Liquidity
Tokens may have lockups or vesting.
Liquidity and tradability are not guaranteed.

6. Wallet Security
You are solely responsible for your wallet, private keys, and device security.
We cannot recover lost or compromised assets.

7. Data Usage
We may collect and process data (e.g., wallet addresses, ecosystem activity) per our Privacy Policy to verify eligibility and operate the programme.`}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              className="btn rounded-full border-none text-white/80 font-bold text-sm"
              onClick={onClose}
            >
              Decline
            </button>
            <button
              className="btn col-span-2 rounded-full border-none text-black/95 font-bold text-sm"
              onClick={onConfirm}
              style={{
                background:
                  'linear-gradient(156.17deg, #08EDDF -8.59%, #8FEDA6 73.29%, #CEED8B 104.51%)',
              }}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
};

export default DisclaimerModal;
