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
    <div className="relative flex flex-col items-center h-screen w-screen overflow-auto bg-cover bg-no-repeat bg-center">
      <header className="w-full h-14 flex items-center justify-between py-2 px-4 border-b border-white/5">
        <LogoIcon className="" />
      </header>
      <div className="relative flex flex-col items-center w-full">
        <div className="absolute left-0 top-0 hidden lg:block pointer-events-none z-0">
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
