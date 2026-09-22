# Creating Boxes with Contracts

Every Ergo box is protected by an ErgoTree. For a normal wallet address, Fleet obtains the ErgoTree from the address automatically. For a custom contract, you can compile ErgoScript and pass the resulting `ErgoTree` directly to `OutputBuilder`.

Install the packages used in this guide:

```bash
npm install @fleet-sdk/core @fleet-sdk/compiler
```

## Compile a contract

`@fleet-sdk/compiler` compiles ErgoScript into an `ErgoTree` that can be used as an output recipient.

The following contract can only be spent when context variable `0` exists and contains the integer `42`. The next guide explains how to provide that variable when the box is spent.

```ts
import { compile } from "@fleet-sdk/compiler";

const contract = compile(
  "sigmaProp(getVar[Int](0).isDefined && getVar[Int](0).get == 42)"
);

console.log(contract.toHex());
```

The compiled script above produces an ErgoTree. You normally do not need to hard-code that hex value; keep the source script readable and compile it as part of your application or build process.

## Create the contract box

`OutputBuilder` accepts an address, a raw ErgoTree hex string, or an `ErgoTree` object as its recipient. This means a contract output is built with the same transaction builder used for ordinary payments.

```ts
import { compile } from "@fleet-sdk/compiler";
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";

const contract = compile(
  "sigmaProp(getVar[Int](0).isDefined && getVar[Int](0).get == 42)"
);

const contractOutput = new OutputBuilder(
  4_000_000n, // 0.004 ERG
  contract
);

const unsignedTx = new TransactionBuilder(creationHeight)
  .from(inputs)
  .to(contractOutput)
  .sendChangeTo(changeAddress)
  .payMinFee()
  .build();
```

In this example:

- `inputs` are boxes that fund the transaction.
- `contractOutput` becomes a new box protected by the compiled contract.
- `creationHeight` is the current block height.
- `changeAddress` receives funds not consumed by the contract output and miner fee.

To send the transaction through a dApp Connector wallet, convert it to EIP-12 format before signing:

```ts
const eip12Tx = unsignedTx.toEIP12Object();
const signedTx = await ergo.sign_tx(eip12Tx);
const txId = await ergo.submit_tx(signedTx);
```

:::tip
`OutputBuilder` also accepts the raw ErgoTree hex returned by `contract.toHex()`. Passing the `ErgoTree` object directly is less error-prone when the script is compiled in the same application.
:::

## What happens next?

After the transaction is confirmed, the new output is an ordinary unspent box. The difference is its spending condition: a future transaction must satisfy the ErgoScript contract before the box can be consumed.

For the example above, that future transaction must inject context variable `0` with value `42`. Continue with [Context variables](./context-variables.md) to build that spending transaction.
