# Wallet Interaction

On the [Ergo Platform](https://ergoplatform.org/), one of the most common ways to interact with wallets and the Ergo blockchain is through the dApp Connector protocol, also known as [EIP-12](https://github.com/ergoplatform/eips/pull/23). It is the main wallet interaction protocol for browser extension wallets like [Nautilus](https://github.com/capt-nemo429/nautilus-wallet) or [SAFEW](https://github.com/ThierryM1212/SAFEW).

:::warning
**Work-in-Progress**: Non-reviewed text. You may find numerous writing errors throughout this guide.
:::

## API overview

The EIP-12 API is divided into two parts, the Connection and Context APIs. All methods defined in EIP-12 are promise-based asynchronous methods. This means that they return a `Promise`. As a result, calling any EIP-12 method requires either an `await` keyword or `Promise.then()` method to wait for them to finish.

### Connection API

The Connection API is responsible for all connection and wallet information related methods, such as access requesting and connection state checking.

EIP-12 compatible browser wallets on Ergo will automatically inject the **Connection API** into every active page so that any JavaScript context can interact with it directly through the `ergoConnector` object.

#### Multi-wallet support

The Connection API is structured to allow support for multiple wallets. To connect to a wallet, you can use `ergoConnector.{walletName}.connect()` method, where `{walletName}` is the wallet of your choice.

#### Examples

Asking for Nautilus Wallet connection

```ts
await ergoConnector.nautilus.connect();
```

Asking for SAFEW Wallet connection

```ts
await ergoConnector.safew.connect();
```

Note that the API remains the same. Only the wallet name changes.

### Context API

The Context API is responsible for wallet interactions, such as balance fetching, transaction signing, _et cetera_.

Once the connection request is accepted by the user, this API will be injected in the same way as the [Connection API](#connection-api), and you can interact with it through the `ergo` object.

#### Example

```ts
await ergo.get_balance();
```

## Interacting with a wallet

### Step. 1: Check for a wallet

To check if the user has an EIP-12 wallet installed and running you need to check for the presence of `ergoConnector` object and then for the desired wallet.

<!-- prettier-ignore-start -->
```ts
if (ergoConnector) { // check if Connection API is injected // [!code focus]

  if (ergoConnector.nautilus) { // check if Nautilus Wallet is available // [!code focus]
    console.log("Nautilus Wallet is ready to use");
  } else {
    console.log("Nautilus Wallet is not active");
  }

} else {
  console.log("No wallet available");
}
```
<!-- prettier-ignore-end -->

:::info
For the sake of simplicity, Nautilus Wallet will be used for all examples. But this guide is suitable for any other EIP-12 compatible wallet. Please, refer to the [Connection API topic](#connection-api) for more information.
:::

### Step. 2: Request access

To interact with the user's wallet, you need to request wallet access.

```ts
const connected = await ergoConnector.nautilus.connect(); // [!code focus]

if (connected) {
  console.log("Connected!");
} else {
  console.log("Not connected!");
}
```

When you call `ergoConnector.nautilus.connect()` for the first time a wallet window will pop-up asking the user to allow access to the selected wallet. If the user rejects the prompt, it will return `false` otherwise, it will return `true` and inject the [Context API](#context-api), which will make the `ergo` object available for direct use.

### Step. 3: Get balance

Now that you have access to the [Context API](#context-api) you can interact with the connected wallet.

Let's start by getting the wallet's balance. For that, you can use the `ergo.get_balance()` method.

#### Get ERG balance

The following code will return a `string` with the total of `NanoErgs` owned by the connected wallet.

```ts
await ergo.get_balance("ERG");
```

#### Get balance by Token ID

Given a `Token ID`, the following code will return a `string` with the total of token units owned by the connected wallet.

```ts
await ergo.get_balance(
  "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04"
);
```

#### Get balance for all assets

The following code will return an `array` with the balance of all assets owned by the connected wallet.

```ts
await ergo.get_balance("all");
```

The returned array is structured as follows:

```ts
[{ tokenId: string, balance: string }];
```

### Step. 4: Get addresses

There are three methods to get user addresses:

#### Get the change/default address

The following code will return a `string` containing the wallet's default change address.

```ts
await ergo.get_change_address();
```

#### Get unused addresses

The following code will return an `array` of strings containing all wallet's unused addresses. By unused, read addresses that never sent or received any transaction.

```ts
await ergo.get_unused_addresses();
```

#### Get used addresses

The following code will return an `array` of strings containing all wallet's used addresses.

```ts
await ergo.get_used_addresses();
```

### Step. 5: Fetch boxes

Boxes are UTxOs on steroids, they play a crucial role in the Ergo blockchain by holding assets and data protected by a contract.

You can use the `ergo.get_utxos()` method to fetch unspent boxes owned by the selected wallet.

#### Get all unspent boxes

The following code will return an array of all unspent boxes owned by the selected wallet.

```ts
await ergo.get_utxos();
```

#### Filter unspent boxes

Unspent boxes can be also filtered by specific assets.

##### Example: Fetching all unspent boxes containing SigUSD tokens

```ts
await ergo.get_utxos({
  tokens: [
    {
      tokenId:
        "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04",
    },
  ],
});
```

If needed, a target amount can be specified, so that the wallet will only return unspent boxes until the target is met.

```ts
await ergo.get_utxos({
  tokens: [
    {
      tokenId:
        "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04",
      amount: "100", // [!code focus]
    },
  ],
});
```

:::tip
Note that the `tokens` field is an `array`, which means you can filter by various tokens in the same call.
:::

### Step. 6: Get the current height

The current height stands for the latest block number included in the blockchain. This is necessary for transaction building.

You can make use of `ergo.get_current_height()` to get it.

```ts
await ergo.get_current_height();
```

### Step. 7: Sign a transaction

The next step after building a transaction is signing it, for that you can call `ergo.sign_tx()` to ask the user to sign a previously built transaction.

```ts
const unsignedTransaction = new TransactionBuilder(creationHeight)
  .from(inputs)
  .to(new OutputBuilder(1000000n, recipientAddress))
  .sendChangeTo(changeAddress)
  .payMinFee()
  .build();

const signedTransaction = await ergo.sign_tx(unsignedTransaction); // [!code focus]
```

When `ergo.sign_tx()` is called a pop-up window will be displayed to the user asking to review and sign the transaction. If the user signs it successfully, then it will return a signed transaction `object` that can be submitted to the blockchain otherwise, it will throw an exception.

### Step. 8: Submit a transaction

Now you have a signed transaction you can submit it to the blockchain using the `ergo.submit_tx()` method.

```ts
const transactionId = await ergo.submit_tx(signedTransaction);
```

If the transaction is successfully accepted by the mempool, a `string` containing the `Transaction ID` will be returned otherwise, it will throw an exception.
