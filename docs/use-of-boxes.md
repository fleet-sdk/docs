# Retrieve and Use Boxes

When using the `TransactionBuilder` class, you will need to work with boxes, which are the fundamental building blocks of Ergo transactions. Boxes represent unspent transaction outputs (UTXOs) on the Ergo blockchain. Each box contains assets (such as ERG or tokens) and potentially additional data.

Boxes are created as outputs when a transaction is executed. They remain on the blockchain as unspent boxes until they are consumed (spent) as inputs in a subsequent transaction. When a box is used as an input, it is effectively destroyed, and new boxes are created as outputs of that transaction. This process forms the UTXO model that Ergo uses, where the blockchain's state is represented by the set of all unspent boxes at any given time

### Retrieving Boxes from the Connected Wallet

Ergo provides a blockchain explorer that allows you to query the blockchain for boxes that match specific criteria. You can use the explorer to retrieve boxes that you own or that you want to interact with in your transactions.

Listing Unspent Boxes

```ts
await ergo.get_utxos();
```

Structured as an array of objects, each box contains the following fields:

```ts
{
  boxId: string,
  value: string,
  assets: Array<{
    tokenId: string,
    amount: string
  }>,
  creationHeight: number,
  ergoTree: string,
  additionalRegisters: Record<string, string>,
  transactionId: string,
  index: number
}
```

### Retrieving Boxes from the Blockchain Explorer

You can also use the blockchain explorer to retrieve boxes that you do not own. This can be useful when you want to interact with specific boxes in your transactions.

Ergo provides an [API](https://api.ergoplatform.com/api/v1/docs/#operation/getApiV1BoxesUnspentByaddressP1) that allows you to query the blockchain for boxes that match specific criteria. You can use this API to retrieve boxes by address, token, or other criteria.

Full documentation for the API can be found [here](https://api.ergoplatform.com/api/v1/docs/).

Listing Boxes by Address from the Explorer

```ts
function fetchUnspentBoxes(address) {
  const url = `https://api.ergoplatform.com/api/v1/boxes/unspent/byAddress/${address}`;

  const headers = {
    accept: "application/json"
  };
  return fetch(url, { headers: headers })
    .then((response) => response.json())
    .catch((err) => console.error(err));
}
```

### Parsing Box to Input in Transactions

The Box Data gotten from this API has some extra fields that we need to take out for it to fulfil the interface for boxes.

```ts
(async () => {
  if (await ergoConnector.nautilus.connect()) {
    const height = await ergo.get_current_height();

    const boxFromExplorer = await fetchUnspentBoxes(
      await ergo.get_change_address()
    );
    const boxes = boxFromExplorer.map((box) => {
      return {
        boxId: box.boxId,
        value: box.value,
        assets: box.assets,
        creationHeight: box.creationHeight,
        ergoTree: box.ergoTree,
        additionalRegisters: box.additionalRegisters,
        transactionId: box.transactionId,
        index: box.index,
      };
    });

    const unsignedTx = new TransactionBuilder(height)
      .from(boxes)
      .to(
        new OutputBuilder(
          '100000000',
          '9efPWBBjL1pddkH9pxnEjjGZxABseEjeXAAMxMUSV7Ug6nN44Wr'
        )
      )
      .sendChangeTo(await ergo.get_change_address())
      .payMinFee()
      .build()
      .toEIP12Object();

    const signedTx = await ergo.sign_tx(unsignedTx);
    const txId = await ergo.submit_tx(signedTx);

    console.log(txId);
  }
})();
```

An example of this implementation can be found [here](https://stackblitz.com/edit/typescript-atujdp?file=index.ts)
