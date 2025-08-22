import Layout from '@/components/layout';
import { ToastProvider } from '@/context/ToastContext';
import '@/styles/global.scss';
import { config } from '@/utils/wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import clsx from 'clsx';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import 'normalize.css/normalize.css';
import { WagmiProvider } from 'wagmi';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const queryClient = new QueryClient();

const App = ({ Component, pageProps, router }: AppProps) => {
  const LayoutComponent = Layout;

  return (
    <main className={clsx(inter.variable, 'font-inter')}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <LayoutComponent>
              <Head>
                <meta
                  name="viewport"
                  content="width=device-width,minimum-scale=1,maximum-scale=1,user-scalable=no"
                />
                <link rel="icon" href="/favicon.ico" sizes="any" />
              </Head>
              <Component {...pageProps} />
            </LayoutComponent>
          </ToastProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </main>
  );
};

export default dynamic(() => Promise.resolve(App), { ssr: false });
