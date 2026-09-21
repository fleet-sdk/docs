# Mint a Token

Ergo has native tokens: no smart contract is required to create one. By the end of this chapter you can mint a token that follows the [EIP-4](https://github.com/ergoplatform/eips/blob/master/eip-0004.md) standard, so wallets and explorers display its name, description, and decimals correctly.

## Concepts

- A token is minted when a transaction creates an output containing a token that did not exist in the inputs.
- The **token ID** is the ID of the first input box of the minting transaction. Fleet derives it automatically.
- EIP-4 metadata lives in the output's registers: R4 = name, R5 = description, R6 = decimals. Fleet's `mintToken()` sets all three for you.

## Complete example

```ts
import { MockChain } from "@fleet-sdk/mock-chain";
import {
  TransactionBuilder,
  OutputBuilder,
  RECOMMENDED_MIN_FEE_VALUE
} from "@fleet-sdk/core";

const chain = new MockChain({ height: 1_000_000 });
const alice = chain.newParty("Alice");
alice.addBalance({ nanoergs: 10_000_000_000n });

const unsigned = new TransactionBuilder(chain.height)
  .from(alice.utxos.toArray())
  .to(
    new OutputBuilder("1000000", alice.address) // 0.001 ERG minimum box value
      .mintToken({
        amount: "1000",
        name: "TutorialToken",
        decimals: 2,
        description: "A token minted in the Fleet SDK tutorial"
      })
  )
  .sendChangeTo(alice.address)
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();

const ok = chain.execute(unsigned, { signers: [alice] });

console.log("mint tx executed:", ok);
for (const t of alice.balance.tokens ?? []) {
  console.log("token:", t.tokenId, "amount:", t.amount.toString());
}
```

## Run it

```bash
node mint.mjs
```

Expected output:

```
mint tx executed: true
token: <64-char token id> amount: 1000
```

Alice now holds 1000 TutorialToken. With `decimals: 2` that displays as 10.00 in wallets.

## Notes

- The minting box still needs the **minimum box value** (0.001 ERG) in addition to the token.
- Minting is one-time: the token ID is bound to the input box, so the same supply can never be minted again.
- To send tokens instead of minting them, use `.addTokens({ tokenId, amount })` on an `OutputBuilder`.
