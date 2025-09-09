import axios from 'axios';

export const BaseUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
export const IS_DEV = !BaseUrl.includes('mainnet');

axios.defaults.baseURL = BaseUrl;

axios.interceptors.request.use(
  function (config) {
    config.baseURL = BaseUrl;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  function (response) {
    return response ? response.data : response;
  },
  function (error) {
    if (error.response?.data) {
      const { errno } = error.response.data;
    }

    return Promise.reject(error);
  },
);

declare module 'axios' {
  export interface AxiosResponse<T = any> extends Promise<T> {}
}

type Response<T> = {
  data: T;
  message: string;
  code: number;
};

export type PageParams = {
  page: number;
  size: number;
};

export type AirdropProof = {
  address: string;
  total: string;
  unlocked: string;
  detail: {
    launch_agent_token?: string;
    burn_airdrop?: string;
    nft_holder?: string;
    stake_airdrop?: string;
  };
  proofs: {
    phase: number;
    address: string;
    amount: string;
    index: number;
    proof: string[];
  }[];
  error?: string;
};

export const getBscAirdropProofApi = async (address: string) => {
  return axios.get<AirdropProof>(`/merkle_proof/bsc/${address}`);
};

export const getSolanaAirdropProofApi = async (address: string) => {
  return axios.get<AirdropProof>(`/merkle_proof/solana/${address}`);
};
