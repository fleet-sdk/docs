# Burn a Token

Burning permanently destroys token supply: the burned tokens can never be spent again. By the end of this chapter you can burn part or all of a token balance.

## Concepts

A burn happens when a transaction spends inputs containing tokens but creates fewer of those tokens in its outputs. Because accidental burns are irreversible, Fleet blocks them by default - you declare the burn explicitly with `burnTokens()`.

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

// Mint 1000 tokens first, so there is something to burn
const mintTx = new TransactionBuilder(chain.height)
  .from(alice.utxos.toArray())
  .to(
    new OutputBuilder("1000000", alice.address)
      .mintToken({ amount: "1000", name: "TutorialToken", decimals: 2, description: "burn demo" })
  )
  .sendChangeTo(alice.address)
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();
chain.execute(mintTx, { signers: [alice] });
chain.newBlock();

// Find the token box created by the mint
const tokenBox = alice.utxos.toArray().find((b) => b.assets.length > 0);
const tokenId = tokenBox.assets[0].tokenId;

// Burn 400 of the 1000 tokens and return the remaining 600
const burnTx = new TransactionBuilder(chain.height)
  .from(alice.utxos.toArray())
  .to(
    new OutputBuilder("1000000", alice.address)
      .addTokens({ tokenId, amount: "600" })
  )
  .burnTokens({ tokenId, amount: "400" })
  .sendChangeTo(alice.address)
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();

const ok = chain.execute(burnTx, { signers: [alice] });

console.log("burn tx executed:", ok);
for (const t of alice.balance.tokens ?? []) {
  console.log("remaining amount:", t.amount.toString());
}
```

## Run it

```bash
node burn.mjs
```

Expected output:

```
burn tx executed: true
remaining amount: 600
```

600 tokens remain; 400 are gone for good.

## Notes

- `burnTokens()` accepts a single object or an array, so one transaction can burn several different tokens.
- To burn an entire balance, omit the token from the outputs and pass the full amount to `burnTokens()`.
- If you ever need manual control instead of `burnTokens()`, burning can be allowed globally with `configure((x) => x.allowTokenBurning(true))` - see [Token Burning](/token-burning).
