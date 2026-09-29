# Send ERG to a Wallet

The most common transaction on Ergo: move ERG from one wallet to another. By the end of this chapter you can build, sign, and execute a payment transaction with Fleet SDK.

## Concepts

Ergo uses the eUTxO model. A transaction spends existing **boxes** (inputs) and creates new ones (outputs). A payment needs three kinds of outputs:

1. **Payment** - the box going to the recipient.
2. **Change** - what is left over, sent back to yourself.
3. **Miner fee** - a small payment to the network (minimum 0.001 ERG).

Fleet's `TransactionBuilder` calculates and checks all of this for you.

## Complete example

```ts
import { MockChain } from "@fleet-sdk/mock-chain";
import {
  TransactionBuilder,
  OutputBuilder,
  RECOMMENDED_MIN_FEE_VALUE
} from "@fleet-sdk/core";

// A local mock blockchain at height 1,000,000
const chain = new MockChain({ height: 1_000_000 });
const alice = chain.newParty("Alice");
const bob = chain.newParty("Bob");

// Fund Alice with 10 ERG (amounts are in nanoERG: 1 ERG = 1e9 nanoERG)
alice.addBalance({ nanoergs: 10_000_000_000n });

const SEND_AMOUNT = 1_000_000_000n; // 1 ERG

const unsigned = new TransactionBuilder(chain.height)
  .from(alice.utxos.toArray())                // inputs: Alice's boxes
  .to(
    new OutputBuilder(SEND_AMOUNT, bob.address.toString()) // payment to Bob
  )
  .sendChangeTo(alice.address)                // change back to Alice
  .payFee(RECOMMENDED_MIN_FEE_VALUE)          // 0.001 ERG miner fee
  .build();

// Sign with Alice's key and execute on the chain
const ok = chain.execute(unsigned, { signers: [alice] });

console.log("tx executed:", ok);
console.log("Bob balance:", bob.balance.nanoergs.toString());
```

## Run it

```bash
node send.mjs
```

Expected output:

```
tx executed: true
Bob balance: 1000000000
```

Bob received exactly 1 ERG (1e9 nanoERG). Alice's balance dropped by 1.001 ERG: the payment plus the miner fee.

## How it works

- `new TransactionBuilder(chain.height)` starts a transaction. The creation height is required because every new box records the block height at which it was created.
- `.from(alice.utxos.toArray())` spends Alice's unspent boxes as inputs.
- `new OutputBuilder(amount, recipient)` creates the payment output. The recipient is any Ergo address string - paste a wallet address from Nautilus or any other wallet here.
- `.sendChangeTo(alice.address)` sends leftover funds back to Alice. Without it, the remainder would be burned.
- `.payFee(RECOMMENDED_MIN_FEE_VALUE)` attaches the minimum miner fee, 0.001 ERG.
- `chain.execute(unsigned, { signers: [alice] })` signs the transaction with Alice's key and executes it, applying all consensus validations.

## Sending to a real wallet

On a live network the only difference is where inputs and height come from. Fetch the current height from the explorer API and the sender's boxes from their wallet (see [Wallet Interaction](/wallet-interaction)), then build the transaction exactly as above. Read more about the builder methods in [Transaction Building](/transaction-building).
