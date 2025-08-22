import { createConfig, http } from 'wagmi';
import { bsc, bscTestnet, mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, bsc, bscTestnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http('https://bsc-dataseed1.binance.org/'),
    [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545/'),
  },
});
