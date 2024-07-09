# Getting Started

Fleet SDK is an easy-to-use, modular, and extensible off-chain SDK (Software Development Kit) for the [Ergo Platform](https://ergoplatform.org/en/), written entirely in TypeScript.

## Step. 1: Install

Add Fleet SDK as a dependency for the project.

::: code-group

```bash [NPM]
npm i @fleet-sdk/core
```

```bash [Yarn]
yarn add @fleet-sdk/core
```

```bash [pnpm]
pnpm add @fleet-sdk/core
```

:::

## Step. 2: Import modules

Next, you need to import the necessary components for your use case.

```ts
import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";
```

## Step. 3: Use it!

You are ready to write awesome off-chain code!

```ts
const unsignedTransaction = new TransactionBuilder(creationHeight)
  .from(inputs) // add inputs
  .to(
    // add outputs
    new OutputBuilder(
      1000000n,
      "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"
    )
  )
  .sendChangeTo(changeAddress) // set change address
  .payMinFee() // set fee
  .build(); // build!
```

::: tip
If you do not know where `inputs` and `creationHeight` variables come from, please take a look at the [Wallet Interaction](/wallet-interaction.md) page.
:::

## Next steps

Follow along with the rest of this guide for an in-depth exploration of all Fleet packages. Or, if you prefer to get just what you need to start coding, pick the topic of your preference on the side panel.

If you are not yet familiar with Ergo transactions, you may want to look at the excellent "[Anatomy of Ergo](https://docs.ergoplatform.com/dev/data-model/box/)" section on Ergo Docs.
