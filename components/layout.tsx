import Bg from '@/assets/images/layout/airdrop-bg.png';
import LogoIcon from '@/assets/images/layout/logo.svg';
import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import ConnectWallet from './ConnectWallet';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div
      className="relative flex flex-col items-center h-screen w-screen overflow-auto bg-cover bg-no-repeat bg-center"
      style={{ background: `url(${Bg.src})` }}
    >
      <header className="w-full h-14 flex items-center justify-between py-2 px-4 border-b border-white/5 bg-[#f6f6f6]/80">
        <LogoIcon className="" />
      </header>
      {children}

      <ConnectWallet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
