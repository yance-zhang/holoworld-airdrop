import LogoIcon from '@/assets/images/layout/logo.svg';
import AirdropBg from '@/assets/images/layout/airdrop-bg.png';
import Image from 'next/image';
import DisclaimerModal from './DisclaimerModal';
import { useEffect, useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);

  const closeDisclaimer = () => {
    setOpen(false);
    localStorage.setItem('FIRST_VISIT_HOLO', 'Visited');
  };

  useEffect(() => {
    const firstVisit = localStorage.getItem('FIRST_VISIT_HOLO');

    if (!firstVisit) {
      setTimeout(() => {
        setOpen(true);
      }, 1000);
    }
  }, []);

  return (
    <div className="relative flex h-screen w-screen flex-col items-center overflow-auto bg-cover bg-center bg-no-repeat">
      <header className="flex h-14 w-full items-center justify-between border-b border-white/5 px-4 py-2">
        <LogoIcon className="" />
      </header>
      <div className="relative flex w-full flex-col items-center">
        <div className="pointer-events-none absolute left-0 top-0 z-0 hidden lg:block">
          <Image src={AirdropBg} className="w-100vw" alt="" />
        </div>
        {children}
      </div>

      <DisclaimerModal
        open={open}
        onClose={() => {
          window.location.href = 'about:blank';
        }}
        onConfirm={closeDisclaimer}
      />
    </div>
  );
}
