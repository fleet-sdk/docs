# Retrieving Boxes From the Explorer

A connected wallet returns boxes it can spend. A dApp may also need boxes held
by a contract, or boxes carrying a particular token. The public Ergo Explorer
can find these without connecting a wallet.

This chapter assumes familiarity with [input boxes and data inputs](./transaction-building.md).
It covers the Explorer REST API and conversion to Fleet's input format. The
examples stop at unsigned transaction construction.

## Run the Example

The [companion example](https://github.com/fleet-sdk/docs/tree/master/examples/box-retrieval)
includes a recorded Explorer response and pinned dependencies. From a checkout
of this documentation repository, run:

```sh
cd examples/box-retrieval
npm ci --ignore-scripts
npm test
node demo.mjs
```

Use Node.js 18 or newer. The default run needs no wallet or network access
after installation. To fetch a fresh public page, run `node demo.mjs --live`.
The latter performs a GET request, with a 10-second timeout.

## Find Boxes by Address or Token

The [Explorer REST API](https://api.ergoplatform.com/api/v1/docs/) provides two
unspent-box endpoints:

| Filter | Endpoint |
| --- | --- |
| Address | `/boxes/unspent/byAddress/{address}` |
| Token ID | `/boxes/unspent/byTokenId/{tokenId}` |

Both return an object containing `items` and `total`. `items` is the current
page, not necessarily every matching box. Set `limit` and `offset` to choose
the page.

The companion's `fetchBoxPage()` returns converted boxes. In an ES module
beside `explorer.mjs`, either query can be used independently:

```js
import { fetchBoxPage } from './explorer.mjs';

const page = await fetchBoxPage({
  address: '9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j',
  limit: 20,
  offset: 0,
  signal: AbortSignal.timeout(10000)
});

console.log(page.boxes, page.total);
```

To query a token instead, replace `address` with `tokenId`:

```js
const page = await fetchBoxPage({
  tokenId: 'f60bff91f7ae3f3a5f0c2d35b46ef8991f213a61d7f7e453d344fa52a42d9f9a',
  limit: 20,
  offset: 0,
  signal: AbortSignal.timeout(10000)
});
```

The helper URL-encodes the filter and checks the HTTP status before reading
the body. It accepts exactly one filter and returns one page; request another
page with a larger `offset` when needed. Unspent boxes can change between
requests, so pagination does not provide a fixed snapshot. Deduplicate by
`boxId` when combining pages, and refresh the boxes needed for a transaction
before asking a wallet to sign it. An empty `boxes` array is a successful query
with no results at that offset.

## Preserve Amounts When Reading JSON

Explorer responses contain more information than Fleet needs. They also use
JSON numbers for amounts. Some token quantities exceed JavaScript's exact
integer range, so reading them with `response.json()` can change the quantity
before your mapping code runs. Calling `BigInt()` on that rounded number
cannot recover the original value.

The example parses the response text with `lossless-json`, retaining integer
tokens as `bigint` before projecting them into Fleet's shape:

```js
import { LosslessNumber, parse } from 'lossless-json';

const source = parse(text, undefined, (number) =>
  /^-?\d+$/.test(number) ? BigInt(number) : new LosslessNumber(number)
);
```

`text` above is the response body from `await response.text()`. This parser is
used inside `fetchBoxPage()`. The recorded response includes the quantity
`47997989999998290`; the tests check that the resulting amount string is
exactly the same.
Fractional or exponent-form numeric lexemes remain lossless objects; this
example rejects them in fields that require integer literals.

## Convert Explorer Fields to Fleet Boxes

Fleet accepts an input box with these fields:

```ts
type RetrievedBox = {
  boxId: string;
  transactionId: string;
  index: number;
  value: string;
  creationHeight: number;
  ergoTree: string;
  assets: { tokenId: string; amount: string }[];
  additionalRegisters: { [register: string]: string };
};
```

The companion's `toFleetBox()` makes the following conversions:

| Explorer field | Fleet field |
| --- | --- |
| `value` | Exact integer string, in nanoERG |
| `assets[].amount` | Exact integer string, in the token's smallest unit |
| `assets[].tokenId` | Token ID, without display metadata |
| `additionalRegisters.R4.serializedValue` | `additionalRegisters.R4` |
| `index`, `creationHeight` | Checked integer numbers |

It copies the box ID, creating transaction ID, and ErgoTree. Display fields
such as `address`, token `name`, and token `decimals` are omitted. Do not divide
token quantities by their display decimals when creating an input box.

Register values need particular care. Explorer may return this:

```js
{ R4: { serializedValue: '040e', sigmaType: 'SInt', renderedValue: '7' } }
```

Fleet needs `{ R4: '040e' }`. Use `serializedValue`, not `renderedValue`, and
preserve the register key. Registers without values remain absent.
Present registers must be contiguous from `R4`; for example, `R5` without
`R4` is invalid. The mapper also limits `index` to the protocol's unsigned
16-bit range. Its height limit is `2147483647`, a conservative compatibility
bound for Fleet 0.12.0's signed bitwise serialization, rather than the
protocol's full unsigned 32-bit range.

The mapper uses the real `ErgoBox.validate()` to check whether the resulting
serialized content matches its box ID. This can catch changed amounts or a
bad projection. It does not prove that a box remains unspent, that the response
belongs to the current chain, or that a wallet can spend it.

## Choose How a Transaction Uses the Box

Use `.from(boxes)` for funding inputs. Spending them requires satisfying
their ErgoTree contracts; retrieving someone else's box does not provide
that ability. Use `.withDataFrom(boxes)` when a contract needs to read box
data without spending the box. Data inputs do not fund the outputs or fee.

The demo uses a real retrieved box only as a data input. It creates a
synthetic funding box locally so that transaction construction can be checked
without an account:

```js
import { ErgoBox, OutputBuilder, TransactionBuilder } from '@fleet-sdk/core';

// `address`, `height`, and `retrievedBox` come from the preceding retrieval.
const funding = new ErgoBox(
  new OutputBuilder('10000000', address, height).build(),
  '11'.repeat(32), // Synthetic creating transaction ID, not a real UTXO.
  0
);

const unsigned = new TransactionBuilder(height)
  .from([funding])
  .withDataFrom([retrievedBox])
  .to(new OutputBuilder('1000000', address))
  .sendChangeTo(address)
  .payMinFee()
  .build()
  .toEIP12Object();
```

See `demo.mjs` for the complete runnable version. It prints the distinct
funding-input and data-input IDs. Fleet's EIP-12 object retains the full box
data in `dataInputs`, not only those printed IDs.

This example does not sign, submit, or prove spendability. Its synthetic
funding box cannot be used on chain, and its chosen creation height is for the
local demonstration. In a real application, obtain the current height and
spendable funding inputs from your wallet or node, and use the contract's
required data boxes. Continue with [Transaction Building](./transaction-building.md)
for output selection and [Wallet Interaction](./wallet-interaction.md) for the
wallet API.
