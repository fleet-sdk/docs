import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { compile } from "@fleet-sdk/compiler";
import { ErgoAddress, Network, OutputBuilder } from "@fleet-sdk/core";
import { SInt, SBool } from "@fleet-sdk/serializer";

const script = "sigmaProp(HEIGHT >= unlockHeight)";
const options = { version: 1, network: "testnet" };
const buildTree = (height) => compile(script, {
  ...options, map: { unlockHeight: SInt(height) }
});

test("named parameter compiles to the same condition as an explicit Int literal", () => {
  const tree = buildTree(1500000);
  assert.equal(tree.toHex(), compile("sigmaProp(HEIGHT >= 1500000)", options).toHex());
  assert.equal(tree.toHex(), "190b0104c08db701d192a37300");
  assert.equal(ErgoAddress.decode(tree.encode()).network, Network.Testnet);
});

test("changing the parameter changes the contract, not its shared template", () => {
  const first = buildTree(1500000);
  const second = buildTree(1600000);
  assert.notEqual(first.toHex(), second.toHex());
  assert.notEqual(first.encode(), second.encode());
  assert.deepEqual(first.template, second.template);
  assert.equal(first.toHex(), "190b0104c08db701d192a37300");
});

test("missing identifiers and incompatible typed constants fail compilation", () => {
  assert.throws(() => compile(script, options));
  assert.throws(() => compile(script, { ...options, map: { unlockHeight: SBool(true) } }));
  assert.throws(() => compile(script, { ...options, map: { unlockHeight: 1500000 } }));
});

test("the output contains the compiled contract and intended demonstration values", () => {
  const tree = buildTree(1500000);
  const output = new OutputBuilder(1000000n, tree.encode(), 1400000).build();
  assert.equal(output.ergoTree, tree.toHex());
  assert.equal(BigInt(output.value), 1000000n);
  assert.equal(output.creationHeight, 1400000);
});

test("the complete documented example is the executable example and its output matches", () => {
  const document = readFileSync(new URL("../../docs/compile-time-constants.md", import.meta.url), "utf8");
  const example = readFileSync(new URL("index.mjs", import.meta.url), "utf8");
  assert.ok(document.includes("```js\n" + example + "```"));
  const output = execFileSync(process.execPath, [new URL("index.mjs", import.meta.url).pathname], { encoding: "utf8" });
  assert.ok(document.includes("```text\n" + output + "```"));
});
