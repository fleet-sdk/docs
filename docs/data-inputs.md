# Data Inputs

A data input lets an ErgoScript contract read an existing box without spending
it. The referenced box remains unspent after the transaction, so many
transactions can use the same public state, such as an oracle price or protocol
configuration.

Data inputs do not contribute ERG or tokens to a transaction. Use regular inputs
for value that the transaction spends and data inputs only for state that a
contract needs to inspect.

## Add a data input

Fetch the box required by the contract, then pass it to
`TransactionBuilder.withDataFrom()`. The method accepts one box or an array of
boxes.

```ts
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";

const unsignedTransaction = new TransactionBuilder(currentHeight)
  .from(inputs)
  .withDataFrom(oracleBox)
  .to(new OutputBuilder(2_000_000n, recipient))
  .sendChangeTo(changeAddress)
  .payMinFee()
  .build()
  .toEIP12Object();
```

Fleet includes the data input's box ID in the unsigned transaction. During
validation, the contract can inspect the referenced box's value, tokens,
registers, and proposition bytes.

## Fetch a box from the Explorer API

The Explorer API returns boxes in the shape accepted by Fleet. Check the HTTP
status and confirm the box is still unspent before building the transaction.

```ts
import type { Box } from "@fleet-sdk/common";

type ExplorerBox = Box & { spentTransactionId?: string | null };

async function getUnspentBox(boxId: string): Promise<ExplorerBox> {
  const response = await fetch(
    `https://api.ergoplatform.com/api/v1/boxes/${boxId}`
  );

  if (!response.ok) {
    throw new Error(`Explorer request failed: ${response.status}`);
  }

  const box = (await response.json()) as ExplorerBox;

  if (box.spentTransactionId) {
    throw new Error(`Box ${boxId} has already been spent`);
  }

  return box;
}

const oracleBox = await getUnspentBox(oracleBoxId);
```

If the service wraps the box in another response object, extract the box before
passing it to Fleet. Do not silently trust an arbitrary API response: verify the
expected box ID, contract, token, and register schema for your protocol.

## When to use data inputs

Data inputs work well when several transactions need to read shared state
without changing it. They can reduce contention because referencing a box does
not consume it.

They also have trade-offs:

- The box must still be unspent when miners validate the transaction.
- Every data input increases transaction size.
- A data input cannot fund outputs or fees.
- Contracts must validate the box identity and data instead of trusting the
  transaction builder.

Use the smallest reliable set of data inputs and handle a spent or replaced
reference by fetching the current box and rebuilding the transaction.
