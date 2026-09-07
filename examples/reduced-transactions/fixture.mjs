import ergo from "ergo-lib-wasm-nodejs";

// Fabricated identifiers and headers: this is not a snapshot of either Ergo network.
export const height = 1000;
export const publicKey = "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";
export const ergoTree = `0008cd${publicKey}`;

export function fixtureInput() {
  const box = ergo.ErgoBox.from_json(JSON.stringify({
    value: "10000000", ergoTree, assets: [], additionalRegisters: {},
    creationHeight: height - 1, transactionId: "00".repeat(32), index: 0
  }));
  return JSON.parse(box.to_json());
}

export function fixtureContext() {
  const header = (h) => ({
    version: 2, id: "00".repeat(32), parentId: "00".repeat(32),
    adProofsRoot: "00".repeat(32), stateRoot: "00".repeat(33),
    transactionsRoot: "00".repeat(32), extensionHash: "00".repeat(32),
    timestamp: 1700000000000, nBits: 117586360, height: h, votes: "000000",
    powSolutions: { pk: publicKey, w: publicKey, n: "00".repeat(8), d: 0 }
  });
  const headers = ergo.BlockHeaders.from_json(Array.from({ length: 10 }, (_, i) => header(height - 1 - i)));
  const preHeader = ergo.PreHeader.from_block_header(ergo.BlockHeader.from_json(JSON.stringify(header(height))));
  return new ergo.ErgoStateContext(preHeader, headers, ergo.Parameters.default_parameters());
}
