export const walletIcons = {
  metamask: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  binance: 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/binance/info/logo.png',
  ledger: 'https://raw.githubusercontent.com/LedgerHQ/ledger-live/develop/apps/ledger-live-desktop/assets/icons/ledger-logo.svg',
};

export const getWalletIcon = (walletId: string): string => {
  return walletIcons[walletId as keyof typeof walletIcons] || '';
};