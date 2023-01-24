# Burning Tokens

Burning tokens on Ergo is done similarly to [minting](./transaction-building.md#step-4-2-mint-a-token). As to mint, you need to add an inexistent token to outputs; to burn, you must add tokens as inputs and omit the number of tokens you want to burn from outputs.

Having such an implicit burning mechanism makes it easy to accidentally burn tokens. So that Fleet only allows burning through the `TransactionBuilder.BurnTokens()` method or by explicitly allowing it through `TransactionBuilder.configure(x => x.allowTokenBurning(true))` if a manual approach is needed.

The `BurnTokens` method accepts a single object or an array of objects describing which and how many tokens to burn.

<!-- prettier-ignore -->
```ts
new TransactionBuilder(creationHeight)
  .from(inputs)
  .burnTokens({ // [!code focus]
    tokenId: sigUSDTokenId, // [!code focus]
    amount: "10" // the amount of tokens you want to burn // [!code focus]
  }) // [!code focus]
  .sendChangeTo(changeAddress)
  .build();
```
