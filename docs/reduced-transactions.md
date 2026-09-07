# Reduced Transactions and ErgoPay

An unsigned transaction describes which boxes to spend and which boxes to create. A wallet on another device also needs the result of evaluating the input contracts before it can produce their proofs. A **reduced transaction** packages the unsigned transaction with those script-reduction results. Reduction uses the spending boxes, data inputs, and blockchain context; it does not require private keys.

Fleet builds the unsigned transaction. This guide uses `ergo-lib-wasm-nodejs` to reduce it and prepare an ErgoPay payload. Read [Transaction building](./transaction-building.md) first.

## Run the Offline Example

The [complete example](https://github.com/fleet-sdk/docs/tree/master/examples/reduced-transactions) requires Node.js 18 or later. From its directory, run:

```sh
npm ci
npm test
npm start
```

It pins `@fleet-sdk/core` to `0.12.0` and `ergo-lib-wasm-nodejs` to `0.28.0`. It builds a transaction, actually reduces its input contract, and prints a JSON response containing 275 bytes of serialized reduced data, encoded as Base64url.

::: warning Offline fixture
The example invents an input box and ten block headers. Its public key is a test constant, not a wallet identity. These values do not describe spendable funds on either network. No network requests, wallet connections, signing, or broadcasting occur. Do not send the example payload to a wallet.
:::

## Build, Then Reduce

The example first uses `TransactionBuilder` to create an unsigned transaction. The bridge into ergo-lib is its EIP-12 JSON representation:

```js
const unsigned = new TransactionBuilder(height)
  .from([input])
  .to(new OutputBuilder(1000000n, address))
  .sendChangeTo(address)
  .payFee(1100000n)
  .build().toEIP12Object();
```

Amounts are nanoERG: this input contains 10,000,000 nanoERG, allocated to a 1,000,000 output, a 1,100,000 fee output, and 7,900,000 change.

Convert the complete box objects and the unsigned transaction into ergo-lib objects, then call the reducer:

```js
const reduced = ergo.ReducedTransaction.from_unsigned_tx(
  ergo.UnsignedTransaction.from_json(JSON.stringify(unsigned)),
  ergo.ErgoBoxes.from_boxes_json([input]),
  ergo.ErgoBoxes.empty(),
  fixtureContext()
);
```

The empty collection means this transaction has no data inputs. For a transaction that references data inputs, supply their complete boxes in the corresponding order. Likewise, supply the complete spending boxes matching the unsigned transaction's inputs. An input ID alone cannot provide its contract, value, tokens, or registers.

`fixtureContext()` constructs an `ErgoStateContext` from a pre-header, ten recent headers, and default parameters. Its fabricated history and genesis parameters serve this offline exercise only. A production integration must supply coherent current chain context and protocol parameters from its node, together with real unspent boxes; it must not reuse this fixture or assume genesis parameters are current. Contracts involving height, headers, or data inputs make that distinction particularly significant.

A successful reduction is not proof that these inputs exist or remain unspent on the network. It also does not sign the transaction.

## Encode the Reduced Bytes

Serialize the **reduced transaction**, not the unsigned JSON:

```js
const bytes = reduced.sigma_serialize_bytes();
const encoded = Buffer.from(bytes).toString("base64url");
```

The example checks the transport by parsing the bytes back with `ReducedTransaction.sigma_parse_bytes()` and comparing the embedded unsigned transaction ID. This checks serialization, not wallet compatibility or network acceptance.

## Choose an ErgoPay Transport

[EIP-0020](https://github.com/ergoplatform/eips/blob/master/eip-0020.md) defines two forms:

- **Static:** `ergopay:<Base64url reduced bytes>`. This embeds the transaction directly, without a message or callback.
- **Dynamic:** `ergopay://example.com/request/123`. The wallet fetches JSON from `https://example.com/request/123`. The URI omits the HTTPS prefix. Public endpoints use HTTPS; the protocol allows HTTP for IP addresses during local testing.

A dynamic endpoint returns a signing request such as:

```js
const response = {
  reducedTx: encoded,
  address,
  message: "Review the transaction details before signing.",
  messageSeverity: "INFORMATION"
};
```

`address` optionally helps the wallet select the signing key. A request needs a transaction or a message. The runnable example prints a warning instead of this production-facing message and demonstrates a JSON serialization round trip without starting an HTTP server.

For longer payloads, prefer dynamic delivery; EIP-0020 recommends it above 400 characters. After delivery, the user reviews the request in their wallet. Signing and submission are subsequent wallet operations. An optional `replyTo` callback is not guaranteed; monitor the transaction independently before treating a payment as confirmed.

For the underlying reduced-transaction format, see [EIP-0019](https://github.com/ergoplatform/eips/blob/master/eip-0019.md). Publishing an endpoint, connecting a wallet, and confirming a real payment are separate integration steps beyond this offline example.
