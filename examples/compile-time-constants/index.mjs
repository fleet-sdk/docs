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
