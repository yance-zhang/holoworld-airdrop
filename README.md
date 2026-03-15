# HoloWorld Airdrop

## Project Intro
HoloWorld Airdrop is a multi-chain claim portal for the $HOLO token distribution campaign. The app allows eligible users to connect wallets, verify eligibility with signed messages, claim token allocations on Solana or EVM (BNB Chain), and review vesting/claim progress in a single interface.

## Tech Stack
- Next.js 14 (Pages Router)
- TypeScript + React 18
- Tailwind CSS + Sass + DaisyUI
- Privy (`@privy-io/react-auth`) for wallet authentication and wallet connectors
- TanStack Query for async state management
- viem + wagmi for EVM contract interactions
- Solana SDK stack: `@solana/web3.js`, `@coral-xyz/anchor`, `@solana/spl-token`
- Axios for API requests

## Features
- Multi-chain claim flow with SOL and EVM network switching
- Separate Verify Wallet and Receiver Wallet flow for safer eligibility verification
- Signature-based proof validation against airdrop eligibility APIs
- On-chain claim-state checks to avoid duplicate claim attempts
- Claim progress panel with allocation, unlocked, claimed, and locked breakdown
- Vesting schedule display and claim window guidance
- Terms/disclaimer confirmation before final claim submission
- Post-claim success state with token amount summary and celebration effects

## Demo Link
https://holoworld-airdrop.vercel.app/

## How to Run
1. Install dependencies.

```bash
npm install
```

2. Create your local environment file.

```bash
cp .env.example .env.local
```

3. Add required environment variables in `.env.local`.

```bash
NEXT_PUBLIC_API_URL=your_api_base_url
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_LOCAL_PRIVY_CLIENT_ID=your_privy_client_id_for_local_dev
```

4. Start the development server.

```bash
npm run dev
```

5. Open http://localhost:3000 in your browser.

### Production Build

```bash
npm run build
npm run start
```
