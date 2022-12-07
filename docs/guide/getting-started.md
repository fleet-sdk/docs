# Getting Started

Feet SDK is an easy-to-use, modular and extensible Ergo Platform's off-chain code SDK (Software Development Kit), written entirely in TypeScript.

::: warning
**Fleet SDK** is currently in alpha status. It is already suitable for out-of-the-box use, but the API may still change between minor releases.
:::

## Step. 1: Install

Add Fleet SDK as dependency for the project.

```bash
npm install @fleet-sdk/core
```

## Step. 2: Import modules

Next you need to import necessary components for your use case.

```ts
import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";
```

## Step. 3: Use it!

Now you are ready to write awesome off-chain code!

```ts
const unsignedTransaction = new TransactionBuilder(creationHeight)
  .from(inputs)
  .to(
    new OutputBuilder(
      1000000n,
      "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"
    )
  )
  .sendChangeTo("9i2bQmRpCPLmDdVgBNyeAy7dDXqBQfjvcxVVt5YMzbDud6AvJS8")
  .payMinFee()
  .build();
```

::: tip
No idea about where `inputs` and `creationHeight` variables come from? Please, take a look at [Wallet Interaction](/guide/wallet-interaction.md) page.
:::
