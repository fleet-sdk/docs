import assert from "node:assert/strict";
import test from "node:test";
import ergo from "ergo-lib-wasm-nodejs";
import { createExample } from "./index.mjs";
import { fixtureContext, fixtureInput } from "./fixture.mjs";

test("actual reduction preserves the Fleet transaction ID and value accounting", () => {
  const { unsigned, bytes } = createExample();
  const parsed = ergo.ReducedTransaction.sigma_parse_bytes(bytes).unsigned_tx();
  const original = ergo.UnsignedTransaction.from_json(JSON.stringify(unsigned));
  assert.equal(parsed.id().to_str(), original.id().to_str());
  assert.equal(unsigned.inputs.length, 1);
  assert.equal(unsigned.outputs.reduce((sum, output) => sum + BigInt(output.value), 0n), 10000000n);
});

test("dynamic JSON and static URI carry identical reduced bytes", () => {
  const { bytes, response, staticUri } = createExample();
  const transported = JSON.parse(JSON.stringify(response));
  assert.match(transported.reducedTx, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(Buffer.from(transported.reducedTx, "base64url"), Buffer.from(bytes));
  assert.deepEqual(Buffer.from(staticUri.slice("ergopay:".length), "base64url"), Buffer.from(bytes));
  assert.equal(transported.messageSeverity, "WARNING");
});

test("an unsigned JSON document is not serialized ReducedTransaction data", () => {
  const { unsigned } = createExample();
  assert.throws(() => ergo.ReducedTransaction.sigma_parse_bytes(Buffer.from(JSON.stringify(unsigned))));
});

test("reduction needs the complete spending box", () => {
  const { unsigned } = createExample();
  assert.throws(() => ergo.ReducedTransaction.from_unsigned_tx(
    ergo.UnsignedTransaction.from_json(JSON.stringify(unsigned)),
    ergo.ErgoBoxes.empty(), ergo.ErgoBoxes.empty(), fixtureContext()
  ));
});

test("the fixture's output ID is derived from its fabricated box, not a claimed chain UTXO", () => {
  const input = fixtureInput();
  assert.equal(input.transactionId, "00".repeat(32));
  assert.equal(ergo.ErgoBox.from_json(JSON.stringify(input)).box_id().to_str(), input.boxId);
});
