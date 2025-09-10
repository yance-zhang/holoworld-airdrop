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
      <div className="modal-box w-[90vw] lg:w-[440px] max-w-[440px] p-6 bg-[#121212] rounded-[20px]">
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

          <div className="text-sm text-white/80 leading-5 tracking-tight max-h-[350px] max-w-prose whitespace-pre-wrap break-words overflow-scroll">
            <h3 className="text-lg text-center mb-2">
              Important Disclaimers and Acknowledgement of Terms of Use for the
              $HOLO Airdrop Programme
            </h3>
            {`Please Read Carefully Before Participating in the $HOLO Token Airdrop Programme. 

By participating in the $HOLO Token Airdrop Programme, and proceeding with the claim for the Tokens under the Airdrop Programme, you acknowledge and agree to the following: 

Participation in the Airdrop Programme and the claiming of any Tokens pursuant thereto is subject to acceptance of the following, and by continuing and clicking the “Accept” button below, you confirm that you have read, understood, and accepted all the following terms: 

Applicable Terms and Conditions

Your participation in the Airdrop Programme and the claiming of Tokens under the Airdrop Programme is governed by and subject to (i) the $HOLO Airdrop Terms and Conditions (“Airdrop Terms”), which govern eligibility, participation, distribution, and any associated terms for this Airdrop Programme, and (ii) the General Terms of the Holoworld Platform accessible at [docs.holoworld.com/guidelines/terms-of-service] (“General Terns”). You acknowledge and confirm that you have read and understood the Airdrop Terms and the General Terms, and that you agree to be bound by the Airdrop Terms and General Terms in respect of your participation in the Airdrop Programme and the claiming of the Tokens pursuant thereto. 
For avoidance of doubt, Orbit Technologies Limited (the “Company”) is solely responsible for the Airdrop Programme and for any and all matters relating to the Tokens, any Airdrop Round, Airdrop Terms, the Airdrop Programme, or the Airdrop Site. 
Capitalised terms herein shall have the meaning given to them in the Airdrop Terms, unless the context requires otherwise. 

Jurisdictional Limitation

The Airdrop Programme is subject to applicable laws and regulations and may not be available to residents of certain jurisdictions. By claiming the $HOLO tokens (“Tokens”), you warrant that (i) you are in compliance with all applicable laws regarding digital assets; (ii) you are not residing, domiciled or incorporated in any of the jurisdictions prohibited in the Airdrop Terms; and (iii) agree not to participate if such participation is restricted or prohibited in your jurisdiction. We reserve the right to refuse or revoke access to the Airdrop Programme in any location where distribution is restricted. 

Tax Obligation

Your receipt of tokens through the Airdrop Programme may be considered a taxable event under the laws of your jurisdiction and you may be required to report the receipt of such tokens. It is your responsibility to understand and comply with any tax obligations that may arise from receiving or holding tokens through this Airdrop Programme. We will not be responsible for advising on or fulfilling your tax obligations. 

Risks Warning

In addition to the nonexclusive list of risk disclaimers set out in our Airdrop Terms, you acknowledge and accept the market and security risks associated with your participation in our Airdrop Programme. The value of the Tokens distributed via the Airdrop Programme may be highly volatile and subject to significant fluctuations in response to market conditions, and your claiming of tokens through the Airdrop Programme may involve risks of network failures, delays, and security vulnerabilities. 

Information relating to the Airdrop 

You may be able to check your eligibility and other information relating to your tokens allocation (where applicable) by connecting your eligible Digital Wallet or logging into your User Account on the Airdrop Site. Any results or information provided through such a process (the “Airdrop Information”) is provided for your convenience only, and any results or information provided therein, including information relating to your eligibility and/or Token allocation, is an estimate only, and shall not be binding on the Company. Any Airdrop Information presented to you via the Airdrop Site is not intended to, and shall not, create any expectation on you in respect of your eligibility to receive any Tokens under the Airdrop Programme. No representation or warranty, express or implied, is made as to the fairness, accuracy, timeliness, correctness or completeness of any Airdrop Information provided on the Airdrop Site, and no reliance should be placed on it.  The Airdrop Information is provided solely to assist in assessing your preliminary eligibility for the Airdrop Programme for your convenience only. Results displayed as part of the Airdrop Information do not guarantee final eligibility, participation, or any right to receive tokens or rewards (or the amount thereof). We reserve the right to disqualify participants who are suspected of fraudulent or illegal activities, bypassing eligibility checks, or failing to meet any eligibility criteria. We reserve the right to change our decisions (and accordingly, any Airdrop Information displayed on the Airdrop Site) on or prior to the occurrence of the Airdrop. The final number of tokens that you may receive (if any) may differ from the results displayed as part of the Airdrop Information. 
Any statements, announcements or information we may have previously made relating to the Airdrop Programme, any Airdrop Round or any tokens (whether via the Airdrop Site or anywhere else) are not binding and do not constitute a representation or guarantee. We are not liable for any reliance on such past communications. Any information or communication provided by the Company (whether via the Airdrop Site or otherwise) relating to any token allocation shall not be deemed as, nor shall it create, any expectation, promise or guarantee of any allocation to any tokens, or any other form of incentives, benefits or rewards.

Transferability and Liquidity Limitations

The Tokens distributed in the Airdrop Programme may not be immediately transferable, and we make no guarantees regarding their tradability or liquidity on secondary markets. Transferability may be subject to future updates, regulatory limitations, network changes, or third-party restrictions. Any future ability to transfer, sell, or trade these Tokens is not assured and may depend on factors outside of our control. 

User Responsibility and Security

You are solely responsible for maintaining the security of your private keys, wallet credentials, and device. We will not be liable for any losses resulting from any unauthorised access, loss of keys, or compromised wallet security. 

Privacy and Data Usage

We may collect certain information relating to you when you participate in the Airdrop Programme or claim your Tokens, such as your wallet addresses or your past interactions with the Holoworld project and ecosystem, and the range of services and products that we provide, to assess your eligibility for the Token airdrop. For more information on how your data may be collected, used, disclosed and/or processed, please refer to our Privacy Policy accessible at [docs.holoworld.com/guidelines/privacy-policy]. You hereby consent to the collection, usage, disclosure and processing of information relating to you, including without limitation, your personal data, in accordance with our Privacy Policy. 
If you do not accept any of these terms, you may not proceed with the claim. `}
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
