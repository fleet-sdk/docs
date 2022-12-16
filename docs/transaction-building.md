# Transaction Building

An Ergo transaction is a way to interact with the blockchain by describing how and which Input boxes must be spent, and how to create new Output boxes.

- Ergo transaction is an **atomic operation**, which means it can't be partially executed.

- Each transaction must contain **one or more** Input boxes, **one or more** Output boxes and **zero or more** Data-Input boxes.

:::warning
**Work-in-Progress**: Non-reviewed text. You may find numerous writing errors throughout this guide.
:::

## What is a box?

A Box is an **Unspent Transaction Outputs (UTxO)** on steroids it's not simply a coin as it's commonly intended in blockchains like Bitcoin. Beyond protecting monetary values with a complex script (smart contract), it can also contain data, tokens, and registers. That's what eUTxO stands for.

An Ergo Transaction is nothing more than a set of boxes.

## Building a transaction

For transaction building, Fleet provides the `TransactionBuilder` and the `OutputBuilder`. Both deliver a seamless way to construct transactions with built-in validations, selection strategies, automatic change calculation, _et cetera_.

```ts
import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";
```

## Step. 1: Instantiating and adding the Creation Height

The `TransactionBuilder` class requires a **Creation Height** as a constructor param.

Each newly created output box needs to hold its creation block height. Usually, the Creation Height is the current block height at the time of the creation of the transaction.

```ts
new TransactionBuilder(creationHeight);
```

## Step. 2: Add Inputs

Input boxes are the source of the funds for the transaction. As they hold the funds to be spent by the transaction, the guard script, also known as `ErgoTree` in Ergo, in each input box must be successfully evaluated by the nodes for the transaction to be considered valid.

To add inputs to the transaction body, you can use the `from()` method, which accepts an array of or a single input box object.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  .from(inputs);
```

### Input box object type

You can fetch output boxes from the blockchain or directly from the [user's wallet](./wallet-interaction.md#step-5-fetch-boxes).

```ts
type Box = {
  boxId: string;
  value: string | bigint;
  assets: { tokenId: string; amount: string | bigint }[];
  ergoTree: string;
  creationHeight: number;
  additionalRegisters: NonMandatoryRegisters;
  index: number;
  transactionId: TransactionId;
};
```

## Step. 3: Add Data-Inputs

The Data-Inputs are boxes whose data can be referenced and used by smart contracts of the input boxes if required. A good use case for Data-Inputs is oracle data feeding.

- Any **unspent** box can be used as Data-Input.
- Data-Inputs are **optional** and must be only included in the transaction if required by a contract in input boxes.
- Boxes will not be spent by the transaction if used as Data-Input.

If required by a contract, you can use the `withDataFrom()` method to add Data-Inputs. Similarly to the `from()` method, it accepts an array of or a single box object.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  .from(inputs)
  .withDataFrom(dataInputs);
```

## Step. 4: Add Outputs

Outputs boxes are the destination of funds held by the input boxes. When confirmed by the blockchain, output boxes are ready to be used as input boxes in further transactions.

In the following example, we are using the `OutputBuilder` and the ` TransactionBuilder`'s `to()` method to construct and include outputs in the transaction body.

The `to()` method requires one or more `OutputBuilder` objects to be included in the transaction body.

The `OutputBuilder` provides a handy set of methods for output construction, such as token inclusion, register set, token minting, and so on. To be instantiated, the `OutputBuilder` requires two construction parameters: the amount of `nanoergs` that should be put in the output box and the recipient address.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  .from(inputs)
  .to(
    new OutputBuilder(
      "1000000", // amount of nanoergs
      "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j" // recipient address
    )
  );
```

### Step. 4.1: Add tokens

Additionally, you can use the ` OutputBuilder`'s `addTokens()` method to include tokens in the output.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  .from(inputs)
  .to(
    new OutputBuilder("1000000", "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j")
      .addTokens({ // [!code focus]
        tokenId: "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489", // [!code focus]
        amount: "100" // [!code focus]
      }) // [!code focus]
  );
```

:::tip
If you are trying to add a token that may already be present in the output's token list, the default behavior of the `addTokens()` method is to sum the amount of duplicated tokens and keep a single record per token.

If you want it to be added at the end of the list, you can pass `{ sum: false }` as a second parameter of `addTokens()` method.

<!-- prettier-ignore -->
```ts
// ...
addTokens(
  { tokenId: "1fd6e032e8476c4aa54c18c1a308dce83940e8f4a28f576440513ed7326ad489", amount: "100" },
  { sum: false } // [!code focus]
);
```

:::

### Step. 4.2: Mint a token

Tokens on Ergo can be minted out of thin air by a transaction if an inexistent token with the `Token ID` equal to the first input's `Box ID` is added to the outputs. Additionally, [EIP-4](https://github.com/ergoplatform/eips/blob/master/eip-0004.md) defines a pattern for uniform token minting across the ecosystem by settings values on additional registers.

The `OutputBuilder`'s `mintToken()` method provides a seamless way to mint EIP-4 tokens.

In the following example, we are minting a token named `TestToken` and sending it to `9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j` address.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  .from(inputs)
  .to(
    new OutputBuilder("1000000", "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j")
      .mintToken({ // [!code focus]
        amount: "100", // the amount of tokens being minted without decimals // [!code focus]
        name: "TestToken", // the name of the token // [!code focus]
        decimals: 2, // the number of decimals  // [!code focus]
        description: "This is a test token minted with Fleet SDK" // [!code focus]
      }) // [!code focus]
  );
```

:::warning
Only one token can be minted per transaction.
:::

## Step. 5: Set the change address

Often you do not use all the funds included in the input boxes, so you need to provide an address to receive these funds back. It's the so-called UTxO change.

To do so, you must call the `sendChangeTo()` method and pass an address as the only parameter.

In the following example, we are sending the change to `9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j` address.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  // ...
  .sendChangeTo("9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"); // [!code focus]
```

## Step. 6: Set the fee amount

Each transaction on Ergo needs to have a mining fee box, you can use the `payFee()` method to specify the fee amount in `nanoergs`.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  // ...
  .payFee("1100000"); // [!code focus]
```

Alternatively, you can use the `payMinFee()` method to add the min recommended miner fee amount, which is `1100000 nanoergs` or `0.0011 ERG`.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  // ...
  .payMinFee(); // [!code focus]
```

## Step. 7: Build

Now that all pieces are put together, it's time to build the transaction and obtain the **Unsigned Transaction** object. For that you can use the `build()` method.

The `build()` method must be the last called method on the `TransactionBuilder` as it will do all necessary validations, input selection, change calculations and return an unsigned transaction object which can be signed by any Ergo signing tool.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
   // ...
  .build(); // [!code focus]
```

By default, the `build()` method will return a default unsigned transaction object, if you want to send it to be signed by the user's wallet through [dApp Connector protocol](./wallet-interaction.md), you should include "EIP-12" as a parameter in the `build()` method so it will include additional information required by the protocol.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
   // ...
  .build("EIP-12"); // [!code focus]
```
