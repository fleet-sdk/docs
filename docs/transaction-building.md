# Transaction Building

An Ergo transaction is a way to interact with the blockchain. A transaction takes Input boxes from the blockchain, describes how each must be spent, and generates new Output boxes. These Output boxes then serve as Input boxes for a later transaction.

### What is a box?

Briefly stated, a box is an **Extended Unspent Transaction Output (eUTxO)** data structure that extends Bitcoin's **Unspent Transaction Output (UTxO)** beyond coins to include tokens, registers, data, and smart contracts.

An Ergo Transaction is nothing more than changing boxes, inputs into outputs.

:::info Note
We will shorten "smart contract" to simply contract in the rest of this document.
:::

## Building a transaction

For transaction building, Fleet provides the `TransactionBuilder` and the `OutputBuilder` classes. Both deliver a seamless way to construct transactions with built-in validations, selection strategies, automatic change calculation, _et cetera_.

- Each and every Ergo transaction is an **atomic operation**, which means it can not be partially executed.

- Each transaction must contain **one or more** Input boxes, **one or more** Output boxes and **zero or more** Data-Input boxes.

```ts
import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";
```

## Step. 1: Instantiating and adding the Creation Height

The `TransactionBuilder` class requires a **Creation Height** as a constructor param.

Transactions end with newly created boxes, or Output boxes. Each newly created Output box needs to contain its creation block height. Usually, the Creation Height is the current block height at the time of the creation of the transaction. Creation height is a required parameter to begin building a transaction.

```ts
new TransactionBuilder(creationHeight);
```

## Step. 2: Add inputs

Input boxes are the source of the funds for the transaction.

To add inputs to the transaction body, use the `from()` method. This method can accept a single input box object or an array of input boxes.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  .from(inputs);
```

### Input box object type

Input boxes can be fetched from the blockchain or directly from the [user's wallet](./wallet-interaction.md#step-5-fetch-boxes).

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

The Data-Inputs are boxes whose data can be referenced and used by contracts, if required. A good use case for Data-Inputs is using oracle data. For example, the [SigmaUSD](https://sigmausd.io/) contract uses an oracle of Ergo price to set the exchange rate for SigUSD and SigRSV conversation to and from ERG at regular intervals.

- Any **unspent** box can be used as Data-Input.
- Data-Inputs are **optional** and must be only included in the transaction if required by a contract.
- Boxes will not be spent by the transaction if used as Data-Input in a transaction.

If required by a contract, use the `withDataFrom()` method to add Data-Inputs. Similar to the `from()` method, `withDataFrom()` can accept a single input box object or an array of input boxes.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  .from(inputs)
  .withDataFrom(dataInputs);
```

## Step. 4: Add outputs

Outputs boxes are the destination of funds held by the input boxes. When confirmed by the blockchain, output boxes are ready to be used as input boxes in further transactions.

In the following example, the `OutputBuilder` and the ` TransactionBuilder`'s `to()` methods are used to construct and include outputs in the transaction body.

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

If you want it to be added at the end of the list, you can pass `{ sum: false }` as a second parameter of the `addTokens()` method.

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

Tokens on Ergo can be minted, that is, created, by a transaction. To create a new token, set the `Token ID` equal to the first input's `Box ID` and add it to the outputs. Additionally, [EIP-4](https://github.com/ergoplatform/eips/blob/master/eip-0004.md) defines a pattern for uniform token minting across the ecosystem by setting values on additional registers.

The `OutputBuilder`'s `mintToken()` method provides a seamless way to mint EIP-4 tokens.

In the following example, a token named `TestToken` will be minted and and sent to the `9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j` address.

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

Often, all the funds included in the input boxes are not used by the transaction. An address needs to be set to receive these funds. This is referred to as the change from the eUTxO transaction.

To do so, call the `sendChangeTo()` method and pass an address as the only parameter.

In the following example, the change will be sent to the `9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j` address.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  // ...
  .sendChangeTo("9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"); // [!code focus]
```

## Step. 6: Set the fee amount

Each transaction on Ergo needs to have a mining fee box, use the `payFee()` method to specify the fee amount in `nanoergs`.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  // ...
  .payFee("1100000"); // [!code focus]
```

Alternatively, you can use the `payMinFee()` method to add the min recommended miner fee amount, which currently is `1100000 nanoergs` or `0.0011 ERG`.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  // ...
  .payMinFee(); // [!code focus]
```

## Step. 7: Build

Now that all pieces are put together, build the transaction and obtain the **Unsigned Transaction** object. For that use the `build()` method.

The `build()` method must be the last called method when building a transaction with `TransactionBuilder` as it will do all necessary validations, input selection, change calculations and return an unsigned transaction object. This object can then be signed by any Ergo signing tool, such as a wallet.

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

## Example

Build and sign a transaction using the [dApp Connector protocol](./wallet-interaction.md) to interact with the blockchain.

The following example is live and ready to play with at [stackblitz.com](https://stackblitz.com/fork/typescript-q1t3hl?file=index.ts).

```ts
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";

(async () => {
  // requests wallet access
  if (await ergoConnector.nautilus.connect()) {
    // get the current height from the the dApp Connector
    const height = await ergo.get_current_height();

    const unsignedTx = new TransactionBuilder(height)
      .from(await ergo.get_utxos()) // add inputs from dApp Connector
      .to(
        // Add output
        new OutputBuilder(
          "2000000000",
          "9gn5Jo6T7m4pAzCdD9JFdRMPxnfKLPgcX68rD8RQvPLyJsTpKcq"
        )
      )
      .sendChangeTo(await ergo.get_change_address()) // Set the change address to the user's default change address
      .payMinFee() // set minimal transaction fee
      .build("EIP-12"); // build the transaction as an dApp Connector compatible object

    // requests the signature
    const signedTx = await ergo.sign_tx(unsignedTx);

    // send the signed transaction to the mempool
    const txId = await ergo.submit_tx(signedTx);

    // prints the Transaction ID of the submitted transaction on the console
    console.log(txId);
  }
})();
```
