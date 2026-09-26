# Carry State Across Successive Transactions

A box cannot be edited after it is created. To update application state on Ergo, spend the current box and create a successor containing the new state. A second interaction must spend that successor, not the original box.

This example stores a counter in register R4. Two successive transactions change it from 0 to 1, then from 1 to 2. It assumes familiarity with [transaction building](https://fleet-sdk.github.io/docs/transaction-building). Everything runs locally with Fleet's mock chain.

## Run the Example

The runnable files are in the repository's [examples/stateful-counter directory](https://github.com/fleet-sdk/docs/tree/master/examples/stateful-counter). Open that directory and use Node.js 18 or newer:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run demo
npm test
```

The demo prints three state records. Their counts are 0, 1, and 2; each has a different box ID. IDs vary between runs because the mock payer uses an ephemeral test key. The script does not contact a node or send a real transaction.

## Keep the Update Rule With the State

The counter box holds the current count in R4 as an Int. Its contract requires output 0 to preserve the contract, value, and tokens, while increasing the count by exactly one:

```scala
{
  val current = SELF.R4[Int].get
  val successor = OUTPUTS(0)
  sigmaProp(
    current < 2147483647 &&
    successor.propositionBytes == SELF.propositionBytes &&
    successor.value == SELF.value &&
    successor.tokens == SELF.tokens &&
    successor.R4[Int].get == current + 1
  )
}
```

SELF is the counter input being spent. The fixed output position gives the contract and transaction builder the same way to locate its successor. The upper bound prevents the largest Int from wrapping around.

Compile the script and create an initial box with count zero. In the accompanying module, createExample() funds that box using a separate mock payer and executes the creation transaction:

```js
const counterTree = compile(counterScript, { network: "testnet" });

new OutputBuilder(stateValue, counterTree.toAddress())
  .setAdditionalRegisters({ R4: SInt(0).toHex() });
```

The testnet option controls address encoding. The mock chain still runs entirely in memory.

## Consume the Latest Box

After creation, take the counter box from the mock chain's current UTXO set. Build output 0 with its value, assets, contract, and incremented register:

```js
const currentBox = counter.utxos.toArray()[0];

const successor = new OutputBuilder(currentBox.value, counterTree.toAddress())
  .addTokens(currentBox.assets)
  .setAdditionalRegisters({
    R4: SInt(readCount(currentBox) + 1).toHex()
  });

const transaction = new TransactionBuilder(chain.height)
  .from([currentBox, ...payer.utxos.toArray()])
  .to(successor)
  .sendChangeTo(payer.address)
  .payFee(fee)
  .build();

chain.execute(transaction, { signers: [payer] });
```

The counter input pays for the counter output. The payer's separate input pays the fee and receives change. This keeps the amount protected by the counter contract constant.

## Use the Successor in the Next Interaction

Read the current box again after execution:

```js
const example = createExample();

const initial = example.counter.utxos.toArray()[0];
const first = increment(example);
const second = increment(example);

console.log([initial, first, second].map(readCount));
// [0, 1, 2]
```

Each call to increment() reads the current counter UTXO. Retaining the original input for the second call would describe a spend of an already consumed box on a real chain.

## Check Invalid Transitions

The accompanying tests execute the compiled contract through Sigma.JS. They check that:

- Two successive spends leave exactly one current counter box with count two.
- The counter value remains constant and the payer covers all three transaction fees.
- A skipped count, repeated count, reduced value, or changed successor contract is rejected without changing the mock state.
- A token attached to the state stays in the successor; diverting it to payer change is rejected.
- A valid transition cannot spend the payer's funding input without its key.
- The largest Int cannot advance or wrap.

MockChain is a contract-testing tool, not a full node. This pinned version does not check that supplied input boxes are currently unspent: replaying an old input can appear to succeed in the mock even though a node would reject it. These tests verify the contract predicates and local state handling, not mainnet acceptance or spent-input rejection.

This is one box's state lineage, not a global singleton: another box can use the same script. Anyone can advance this counter, and the script provides no withdrawal path. Keep it in the local example; do not send real assets to it.
