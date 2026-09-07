import { pathToFileURL } from "node:url";
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";
import ergo from "ergo-lib-wasm-nodejs";
import { fixtureContext, fixtureInput, height, publicKey } from "./fixture.mjs";

export function createExample() {
  const input = fixtureInput();
  const address = ergo.Address.from_public_key(Uint8Array.from(Buffer.from(publicKey, "hex"))).to_base58(ergo.NetworkPrefix.Testnet);
  const unsigned = new TransactionBuilder(height)
    .from([input])
    .to(new OutputBuilder(1000000n, address))
    .sendChangeTo(address)
    .payFee(1100000n)
    .build().toEIP12Object();
  const reduced = ergo.ReducedTransaction.from_unsigned_tx(
    ergo.UnsignedTransaction.from_json(JSON.stringify(unsigned)),
    ergo.ErgoBoxes.from_boxes_json([input]),
    ergo.ErgoBoxes.empty(),
    fixtureContext()
  );
  const bytes = reduced.sigma_serialize_bytes();
  const encoded = Buffer.from(bytes).toString("base64url");
  const response = {
    reducedTx: encoded,
    address,
    message: "Offline tutorial fixture. Do not sign or submit this transaction.",
    messageSeverity: "WARNING"
  };
  return { unsigned, bytes, response, staticUri: `ergopay:${encoded}` };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { bytes, response } = createExample();
  console.log("Offline fixture only; no signing, network requests, or broadcasting.");
  console.log("Reduced transaction bytes:", bytes.length);
  console.log(JSON.stringify(response, null, 2));
}
