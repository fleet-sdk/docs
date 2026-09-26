import assert from "node:assert/strict";
import test from "node:test";
import { createExample, increment, buildIncrement, readCount, fee, stateValue } from "./counter.mjs";

test("two successive spends carry state 0 -> 1 -> 2 through distinct boxes", () => {
  const example = createExample();
  const initialBox = example.counter.utxos.toArray()[0];
  const firstBox = increment(example);
  const secondBox = increment(example);
  assert.deepEqual([initialBox, firstBox, secondBox].map(readCount), [0, 1, 2]);
  assert.equal(new Set([initialBox.boxId, firstBox.boxId, secondBox.boxId]).size, 3);
  assert.equal(example.counter.utxos.length, 1);
  assert.equal(example.counter.utxos.toArray()[0].boxId, secondBox.boxId);
  assert.equal(BigInt(secondBox.value), stateValue);
  assert.equal(example.payer.balance.nanoergs, 1_000_000_000n - stateValue - 3n * fee);
});

for (const [label, changes] of [
  ["skip a state", () => ({ count: 2 })],
  ["repeat a state", () => ({ count: 0 })],
  ["drain the state box", () => ({ value: stateValue - 1n })],
  ["replace the contract", example => ({ recipient: example.payer.address })],
]) {
  test("contract rejects an attempt to " + label + " without changing mock state", () => {
    const example = createExample();
    const original = example.counter.utxos.toArray()[0];
    const oldHeight = example.chain.height;
    const oldBalance = example.payer.balance.nanoergs;
    const tx = buildIncrement(example, changes(example));
    assert.equal(example.chain.execute(tx, { signers: [example.payer], throw: false }), false);
    assert.equal(example.chain.height, oldHeight);
    assert.equal(example.payer.balance.nanoergs, oldBalance);
    assert.equal(example.counter.utxos.toArray()[0].boxId, original.boxId);
  });
}

test("a payer without the funding input key cannot execute a valid transition", () => {
  const example = createExample();
  const transaction = buildIncrement(example);
  assert.equal(example.chain.execute(transaction, { signers: [], throw: false }), false);
  assert.equal(readCount(example.counter.utxos.toArray()[0]), 0);
});

test("the largest Int state cannot wrap or advance", () => {
  const example = createExample(2147483647);
  const transaction = buildIncrement(example, { count: -2147483648 });
  assert.equal(example.chain.execute(transaction, { signers: [example.payer], throw: false }), false);
  assert.equal(readCount(example.counter.utxos.toArray()[0]), 2147483647);
});

test("a state token must remain in the successor instead of moving to payer change", () => {
  const tokens = [{ tokenId: "11".repeat(32), amount: 1n }];
  const example = createExample(0, tokens);
  const initial = example.counter.utxos.toArray()[0];
  const transaction = buildIncrement(example, { assets: [] });
  assert.equal(example.chain.execute(transaction, { signers: [example.payer], throw: false }), false);
  assert.equal(example.counter.utxos.toArray()[0].boxId, initial.boxId);
  const next = increment(example);
  assert.deepEqual(next.assets, initial.assets);
});
