# Compile-Time Constants

Suppose you want to create several time-locked boxes, each with a different unlock height. You can reuse one ErgoScript contract and supply the height when compiling it, instead of editing the contract text for each box.

This guide assumes you know how to [build an output box](./transaction-building.md#step-4-add-outputs). The example runs locally in Node.js without a wallet or a blockchain connection.

## Choose What Is Fixed in the Contract

A compile-time constant is a value supplied before ErgoScript becomes an ErgoTree. It becomes part of the compiled spending condition. In this contract, `unlockHeight` is fixed during compilation, while `HEIGHT` is read from the blockchain context when a transaction attempts to spend the box:

```scala
sigmaProp(HEIGHT >= unlockHeight)
```

The condition allows **anyone** to spend the box at or after the chosen height. It does not require an owner's signature. We use it to demonstrate compilation; adding an owner condition is a separate contract-design step.

Changing a JavaScript variable later cannot change the ErgoTree of an existing box. Compile with another height to create a different contract for a new box.

## Step. 1: Install the Compiler

Create a folder and install the versions used in this example:

```bash
npm install --save-exact @fleet-sdk/compiler@0.12.0 @fleet-sdk/core@0.12.0 @fleet-sdk/serializer@0.11.0
```

`@fleet-sdk/compiler` compiles ErgoScript locally. `@fleet-sdk/serializer` provides typed constants, and `@fleet-sdk/core` builds the output.

## Step. 2: Supply a Typed Constant

Pass named constants through the compiler's `map` option. A key must match the identifier in the script. Here, `SInt(1500000)` gives `unlockHeight` the ErgoScript `Int` type, matching `HEIGHT`:

```js
map: { unlockHeight: SInt(1500000) }
```

Do not pass a bare JavaScript number as the map value. The compiler expects a typed constant (or its serialized representation). The `SInt` wrapper states the on-chain type; use a different serializer type only when the contract expects it.

## Step. 3: Compile and Build an Output

Save this complete example as `index.mjs`:

```js
import { compile } from "@fleet-sdk/compiler";
import { OutputBuilder } from "@fleet-sdk/core";
import { SInt } from "@fleet-sdk/serializer";

const contract = "sigmaProp(HEIGHT >= unlockHeight)";
const tree = compile(contract, {
  version: 1,
  network: "testnet",
  map: { unlockHeight: SInt(1500000) }
});

const output = new OutputBuilder(1000000n, tree.encode(), 1400000).build();
console.log("ErgoTree:", tree.toHex());
console.log("Testnet address:", tree.encode());
console.log("Output ErgoTree:", output.ergoTree);
```

Run it:

```bash
node index.mjs
```

With the pinned versions above, it prints:

```text
ErgoTree: 190b0104c08db701d192a37300
Testnet address: nwhHeDwivvm8YuWn5VEjDmTk
Output ErgoTree: 190b0104c08db701d192a37300
```

`compile()` returns an `ErgoTree`. Its `encode()` method produces the contract address, which `OutputBuilder` accepts as its destination. The compiler's `network` option selects a testnet address. The fixed creation height of `1400000` is demonstration data, not a query for the current height.

This builds an output candidate only. It does not select inputs, sign, broadcast, or evaluate a spending transaction. To include the output in a transaction, follow [Transaction Building](./transaction-building.md) and obtain current inputs and height from your wallet.

## Reuse the Contract with Another Height

Keep the same script and supply a different value:

```js
const laterTree = compile(contract, {
  version: 1,
  network: "testnet",
  map: { unlockHeight: SInt(1600000) }
});
```

The resulting ErgoTree and address differ. By default, the compiler segregates constants from the executable part of the tree, so these two contracts can share a template while containing different heights. A matching template alone does not mean the spending conditions are identical: compare the constants too. Constant positions in the compiled tree are not a replacement for the named `map` used when compiling the source.

## Choose Between Constants and Box Data

Use compile-time constants for parameters that should be fixed in a particular contract, such as this unlock height. Box registers store data on a box, while context variables are supplied for a spending input; a contract must explicitly read and validate either. Supplying a context variable called `unlockHeight` does not fill in a missing compile-time identifier.

If compilation reports an unresolved identifier, check that `map` contains the exact script name. If it reports a type mismatch, check that the serializer type matches the operation in the contract.

## Run the Reproducible Example

The documentation repository includes this example and checks for its compiled result, parameter changes, invalid maps, and output construction:

```bash
cd examples/compile-time-constants
npm ci
npm start
npm test
```

These checks exercise the real compiler and builder. They do not prove that a spending transaction is valid on-chain.
