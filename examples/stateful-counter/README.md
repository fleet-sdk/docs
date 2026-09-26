# Stateful Counter Example

This local example accompanies the [stateful counter chapter](../../docs/stateful-counter.md). It uses Fleet SDK 0.12.0 and Sigma.JS to compile an ErgoScript contract, create a state box, and spend the counter twice, using the successor for the second spend.

Run from this directory with Node.js 18 or newer:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run demo
```

Verified with Node.js 22.17.1 on Windows. Direct and transitive package versions are recorded in package-lock.json. Tests use Node's built-in runner.

The demo prints states 0, 1, and 2 with distinct box IDs. Eight tests exercise the compiled contract, fee-input signature, token/value preservation, rejection of invalid transitions, and the Int boundary.

All balances and keys are ephemeral local test data. Nothing contacts an RPC endpoint, broadcasts a transaction, reads a real wallet, or writes a private key. The compiler's testnet option chooses address encoding; it does not connect to testnet.

MockChain is not a full node: it does not check that supplied input boxes are currently unspent. The example reads the current UTXO before each spend. These tests do not establish mainnet acceptance or replay protection.

The counter is a teaching contract with public advancement and no withdrawal path. It is not a global singleton; separate boxes can use the same script. Do not send real assets to it.
