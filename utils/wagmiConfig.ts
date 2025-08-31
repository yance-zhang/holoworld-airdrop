import { createConfig, http } from 'wagmi';
import { bsc, bscTestnet, mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { getWagmiConnectorV2 } from '@binance/w3w-wagmi-connector-v2';

const binanceConnector = getWagmiConnectorV2();

export const config = createConfig({
  chains: [mainnet, bsc, bscTestnet],
  connectors: [injected(), binanceConnector()],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http('https://bsc-dataseed1.binance.org/'),
    [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545/'),
  },
});
