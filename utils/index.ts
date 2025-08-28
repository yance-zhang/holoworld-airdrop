export const shortenAddress = (address: string) => {
  return address.slice(0, 6) + '...' + address.slice(-4);
};

export const copyText = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

export const randomInt = (min: number, max: number) => {
  return Math.round(Math.random() * (max - min)) + min;
};

export const formatNumber = (num: number = 0, precision: number = 3) => {
  const map = [
    { suffix: 'T', threshold: 1e12 },
    { suffix: 'B', threshold: 1e9 },
    { suffix: 'M', threshold: 1e6 },
    { suffix: 'K', threshold: 1e3 },
    // { suffix: '', threshold: 1 },
  ];

  const found = map.find((x) => Math.abs(num) >= x.threshold);
  if (found) {
    const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
    return formatted;
  }

  if (num.toString().length > precision + 2) {
    return num.toFixed(precision);
  }

  return num.toString();
};

export const formatBalanceNumber = (
  num: number | string,
  precision: number = 2,
) => {
  if (!num || !Number(num)) {
    return '0';
  }

  const baseNumber = Math.pow(10, precision);

  const balance = (
    Math.floor(Number(num) * baseNumber) / baseNumber
  ).toLocaleString('en-US', {
    minimumFractionDigits: precision,
  });

  return balance;
};

export const stringToHex = (string: string) => {
  let hex = '';
  for (let i = 0; i < string.length; i++) {
    hex += string.charCodeAt(i).toString(16);
  }

  return hex;
};
