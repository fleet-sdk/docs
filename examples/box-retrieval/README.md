# Retrieve Explorer Boxes

This example accompanies the [box retrieval chapter](../../docs/retrieving-boxes.md).
Use Node.js 18 or newer:

```sh
npm ci --ignore-scripts
npm test
node demo.mjs
```

The default demo reads a recorded public response. It converts the two boxes to
Fleet's input shape, then uses one as a data input in an unsigned transaction
with a synthetic funding box. The synthetic box is not a real UTXO. No wallet,
private key, signature, or transaction submission is involved.

To request a fresh two-item page from the public mainnet Explorer instead:

```sh
node demo.mjs --live
```

This makes one GET request with a 10-second timeout. The output may change as
boxes are spent. An empty page is a valid result; it skips the transaction demo.
HTTP, parsing, or mapping failures print an error and exit with status 1.

`fetchBoxPage()` accepts either `address` or `tokenId`, a `limit` of 1–100, an
`offset`, and an optional `AbortSignal`. It returns exactly one page. It does
not silently retrieve an entire address history or retry requests.

## Fixture Provenance

`fixtures/explorer-token-page.json` is the unmodified response body retrieved
on 2026-09-19 UTC (2026-09-18 Pacific) from:

```text
https://api.ergoplatform.com/api/v1/boxes/unspent/byTokenId/f60bff91f7ae3f3a5f0c2d35b46ef8991f213a61d7f7e453d344fa52a42d9f9a?limit=2&offset=0
```

The endpoint returned HTTP 200, `total: 5`, and two items. This is public
mainnet data, not evidence that the example author owns any of the boxes.
The tests preserve the original JSON number lexemes with `lossless-json`,
check exact large token amounts, and validate both serialized box IDs with
the actual Fleet SDK. Separate synthetic fixtures exercise registers and
unsigned transaction construction deterministically.
