# [WIP] Wallet Interaction

One of the most common ways to interact with wallets, and consequently the blockchain, on Ergo Platform is thought EIP-12 protocol –also known as dApp Connector. That's the main protocol of extension wallets like Nautilus or SAFEW.

## The API

EIP-12 API is divided in two parts, as follows:

- **Connection API**: responsible for connection requesting and checking.
- **Ergo API**: responsible for actual wallet interaction, such as fetch balance, request transaction signatures, _et cetera_.

EIP-12 compatible browser wallets on Ergo automatically inject **Connection API** into every active, page so that any JavaScript API can call it directly thought the `ergoConnector` object.

::: tip
All EIP-12 methods are asynchronous, which means they will return a `Promise`. So you need to use `await` keyword or `Promise.then()` method to call any of them.
:::

## Step. 1: Check wallet presence

To check if the user has a EIP-12 wallet installed and running you can check for the presence of `ergoConnector` object and then fot the desired wallet.

<!-- prettier-ignore-start -->
```ts
if (ergoConnector) { // check if Connection API is injected // [!code focus]
  
  if (ergoConnector.nautilus) { // check if Nautilus Wallet available // [!code focus]
    console.log("Nautilus Wallet is ready to use");

  } else if (ergoConnector.safew) { // check if SAFEW Wallet available // [!code focus]
    console.log("SAFEW Wallet is ready to use");
  }
} else {
  console.log("No wallet available");
}
```
<!-- prettier-ignore-end -->

## Step. 2: Request access

In order to interact with the user's wallet you first need to request wallet access. From now on Nautilus Wallet will be used by default on examples.

```ts
const connected = await ergoConnector.nautilus.connect(); // [!code focus]

if (connected) {
  console.log("Connected!");
} else {
  console.log("Not connected!");
}
```

When you call `ergoConnector.nautilus.connect()` a wallet window will pop-up asking for the user to allow access for the selected wallet. If user rejects it will return `false`, otherwise it will return `true` and inject the **Ergo API**, so that the `ergo` object will be available for use.

## Step. 3: Interact with the wallet

Now that you have access to the Ergo API you can interact with the connected wallet.

### Get balance

```ts
// get only ERG balance
const ergBalance = await ergo.get_balance();

// get balance for a specific token
const sigUsdBalance = await ergo.get_balance(
  "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04"
);

// get balance for all assets owned by the connected wallet
const tokenBalance = await ergo.get_balance("all");
```

### Get inputs

```ts
const inputs = await ergo.get_utxos();
```

### Get the current height

```ts
const height = await ergo.get_current_height();
```

### Get ask for a transaction signature

```ts
const signedTransaction = await ergo.sign_tx(unsignedTransaction);
```

### Submit a transaction to the blockchain

```ts
const transactionId = await ergo.submit_tx(signedTransaction);
```
