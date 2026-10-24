# 01 — Send Transactions to Wallets

**Goal:** send ERG to a user wallet with Fleet SDK.

**Concept:** a transaction consumes input boxes, creates output boxes, pays a fee, and returns change. Minimum box value applies.

## Prerequisites

```bash
npm i @fleet-sdk/core
```

Use testnet and a funded test mnemonic. Never hardcode mainnet keys.

## Code

Pass unspent input boxes and the current chain height from your provider or wallet. Full snippet: `docs/tutorial/_snippets/send-to-wallet.ts`.

```ts
import { ErgoAddress, OutputBuilder, RECOMMENDED_MIN_FEE_VALUE, TransactionBuilder, type Box } from "@fleet-sdk/core";

export function sendToWallet(
  inputs: Box<string>[],
  recipient: string,
  amountNanoErg: bigint,
  changeAddress: string,
  creationHeight: number
) {
  if (!ErgoAddress.validate(recipient)) throw new Error("Invalid recipient address");
  if (!ErgoAddress.validate(changeAddress)) throw new Error("Invalid change address");

  return new TransactionBuilder(creationHeight)
    .from(inputs)
    .to(new OutputBuilder(amountNanoErg, recipient))
    .sendChangeTo(changeAddress)
    .payFee(RECOMMENDED_MIN_FEE_VALUE)
    .build()
    .toEIP12Object();
}
```

## Verify

Sign and submit the unsigned tx, then check the tx id on the testnet explorer.

## Pitfalls

- Inputs must cover outputs + fee.
- Always set a change address.
- Respect min box value on every output.
