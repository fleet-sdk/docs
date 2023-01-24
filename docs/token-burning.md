# Burning Tokens

Burning tokens on Ergo is similar to [minting](./transaction-building.md#step-4-2-mint-a-token). Minting occurs whenever a new token is added to a transaction's output. Burning occurs when a transaction has fewer outputs than inputs. Most transactions have outputs and inputs that are equal. 

To protect against accidently burning tokens, Fleet checks to make sure inputs and outputs are equal. To burn tokens, the `TransactionBuilder.BurnTokens()` method is used to declare the tokenId and amount to burn. 

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
If a manual approach is needed, burning can be explicitly allowed through a configuration option: `TransactionBuilder.configure(x => x.allowTokenBurning(true))`
