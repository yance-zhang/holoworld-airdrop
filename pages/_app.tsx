import Layout from '@/components/layout';
import { AppStoreProvider } from '@/context/AppStoreContext';
import { WalletChainProvider } from '@/context/WalletChainContext';
import '@/styles/global.scss';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import 'normalize.css/normalize.css';
import { Toaster } from 'react-hot-toast';
import classNames from 'classnames';
import WalletConnectProvider from '@/components/WalletConnectProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const App = ({ Component, pageProps }: AppProps) => {
  const LayoutComponent = Layout;

  return (
    <main className={classNames(inter.variable, 'font-inter')}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          success: { duration: 3000, className: 'bg-green-600' },
          error: { duration: 5000, className: 'bg-red-600' },
        }}
      />
      <Head>
        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <WalletChainProvider>
        <WalletConnectProvider>
          <AppStoreProvider>
            <LayoutComponent>
              <Component {...pageProps} />
            </LayoutComponent>
          </AppStoreProvider>
        </WalletConnectProvider>
      </WalletChainProvider>
    </main>
  );
};

export default dynamic(() => Promise.resolve(App), { ssr: false });
