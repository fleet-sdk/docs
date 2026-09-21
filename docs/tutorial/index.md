# Fleet SDK Tutorial

A hands-on course for building on Ergo with Fleet SDK. Each chapter is small, self-contained, and every code example runs as-is against a local mock blockchain - no node, no wallet, and no real funds required.

## How to run the examples

Every example in this tutorial is a plain Node.js script. Create a project once and reuse it for all chapters:

```bash
mkdir fleet-tutorial && cd fleet-tutorial
npm init -y
npm install @fleet-sdk/core @fleet-sdk/mock-chain
```

Save any example as an `.mjs` file (for example `send.mjs`) and run it:

```bash
node send.mjs
```

:::info Why a mock chain?
The examples use [`@fleet-sdk/mock-chain`](https://www.npmjs.com/package/@fleet-sdk/mock-chain), Fleet's in-memory Ergo blockchain. It executes real, fully signed transactions and validates them exactly like a node would, so the code you test locally is the same code you point at mainnet later. When you are ready for a live network, swap the mock inputs for boxes fetched from your wallet or the explorer - the transaction-building code does not change.
:::

## Chapters

### Basics

1. [Send ERG to a wallet](./basics/send-transactions) - inputs, outputs, change, and miner fees
2. [Mint a token](./basics/mint-tokens) - EIP-4 token standards
3. [Burn a token](./basics/burn-tokens) - destroying token supply
