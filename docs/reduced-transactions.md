# Reduced Transactions and ErgoPay

Browser wallets sign transactions directly through the dApp Connector (`toEIP12Object()`). Mobile and cold wallets—such as the Ergo Mobile Wallet—sign transactions out-of-band via **ErgoPay (EIP-20)** using **Reduced Transactions (EIP-19)**.

## What is a Reduced Transaction?

An unsigned Ergo transaction spends input boxes whose `ErgoTree` scripts may reference blockchain headers, registers, or data inputs that an offline or mobile wallet does not store locally.

**Transaction reduction** evaluates every input script against the current blockchain context ahead of time and reduces each spending condition to a compact `SigmaBoolean` cryptographic challenge (such as `proveDlog(pk)`), bundled with the unsigned transaction bytes:

- **Offline & mobile signing**: The wallet inspects output addresses/amounts and signs the reduced `SigmaBoolean` challenges without needing full UTxO state.
- **Compact transport**: Encoded as unpadded URL-safe Base64, the reduced bytes fit cleanly inside an EIP-20 signing response opened via QR code or mobile deep link.

```sh
npm install @fleet-sdk/core @fleet-sdk/crypto @fleet-sdk/blockchain-providers @scure/base
```

## Step 1: Build and Reduce a Transaction

Construct the transaction with `TransactionBuilder`, convert it via `toPlainObject()`, call `reduceTransaction()` on `ErgoGraphQLProvider`, and encode the returned Base16 bytes into unpadded Base64URL:

```ts
import { ErgoGraphQLProvider } from "@fleet-sdk/blockchain-providers";
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";
import { hex } from "@fleet-sdk/crypto";
import { base64urlnopad } from "@scure/base";

export async function createErgoPayResponse(
  graphqlEndpoint: string,
  senderAddress: string,
  recipientAddress: string
) {
  const provider = new ErgoGraphQLProvider(graphqlEndpoint);
  const boxes = await provider.getBoxes({ where: { address: senderAddress } });
  const headers = await provider.getHeaders({ take: 1 });
  const currentHeight = headers[0].height;

  const unsignedTx = new TransactionBuilder(currentHeight)
    .from(boxes)
    .to(new OutputBuilder(1_000_000_000n, recipientAddress))
    .sendChangeTo(senderAddress)
    .payMinFee()
    .build()
    .toPlainObject();

  const reduction = await provider.reduceTransaction(unsignedTx);
  if (!reduction.success) {
    throw new Error(`Reduction failed: ${reduction.reason}`);
  }

  const reducedTx = base64urlnopad.encode(hex.decode(reduction.reducedTransaction));

  return {
    reducedTx,
    address: senderAddress,
    message: "Approve sending 1 ERG",
    messageSeverity: "INFORMATION"
  };
}
```

## Step 2: Serve an EIP-20 Endpoint

When a mobile wallet scans an ErgoPay QR code or opens an `ergopay` deep link containing the `#P2PK_ADDRESS#` placeholder in the path (`/api/pay/#P2PK_ADDRESS#`), the wallet substitutes the user's selected P2PK address and sends an HTTP `GET` request expecting the JSON signing payload:

```ts
import express from "express";
import { createErgoPayResponse } from "./ergopay";

const app = express();
const GRAPHQL_URL = process.env.ERGO_GRAPHQL_URL!;

app.get("/api/pay/:address", async (req, res) => {
  try {
    const response = await createErgoPayResponse(
      GRAPHQL_URL,
      req.params.address,
      "9fRusAarL1KkrWQVsxSRVYnvWxaAT2A96cKtNn9tvPh5XUyCisr"
    );
    res.json(response);
  } catch (err) {
    res.json({
      message: err instanceof Error ? err.message : "Failed to prepare transaction",
      messageSeverity: "ERROR"
    });
  }
});

app.listen(3000);
```
