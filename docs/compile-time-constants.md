# Compile-Time Constants

Compile-time constants embed fixed parameters—such as owner public keys, token IDs, or block-height deadlines—directly into an `ErgoTree` when an ErgoScript contract is compiled.

Unlike registers (`R4`–`R9`) or context variables, compile-time constants become part of the box's `ergoTree` proposition itself, so no spender can alter them without changing the contract address.

## Segregated Constants and Contract Templates

By default, `@fleet-sdk/compiler` compiles scripts into **constant-segregated** `ErgoTree` bytecode (`segregateConstants: true`):

- **Constant pool**: Injected values are stored in a dedicated header array on the `ErgoTree`.
- **Reusable template**: The expression tree (`ergoTree.template`) references constants by index rather than inlining raw literals, so every contract instance shares an identical template hash while enforcing distinct parameters.

```sh
npm install @fleet-sdk/core @fleet-sdk/compiler @fleet-sdk/serializer @fleet-sdk/mock-chain
```

## Inject Named Constants with `compile()`

Pass a `map` of named Sigma constants (`SInt`, `SLong`, `SColl`, `SByte`, `SGroupElement`, `SSigmaProp`, or hex-encoded constant strings) to `compile()` from `@fleet-sdk/compiler`:

```ts
import { compile } from "@fleet-sdk/compiler";
import { ErgoAddress } from "@fleet-sdk/core";
import { SGroupElement, SInt, SSigmaProp } from "@fleet-sdk/serializer";

const owner = ErgoAddress.fromBase58("9fRusAarL1KkrWQVsxSRVYnvWxaAT2A96cKtNn9tvPh5XUyCisr");
const [ownerPubKey] = owner.getPublicKeys();

const script = `
  {
    val afterDeadline = HEIGHT >= minUnlockHeight
    sigmaProp(afterDeadline) && beneficiaryPk
  }
`;

const ergoTree = compile(script, {
  map: {
    minUnlockHeight: SInt(850_000),
    beneficiaryPk: SSigmaProp(SGroupElement(ownerPubKey))
  },
  segregateConstants: true
});

console.log("P2S Address:", ergoTree.toAddress().toString());
console.log("ErgoTree Hex:", ergoTree.toHex());
```

:::tip When to choose compile-time constants vs. registers
Use **compile-time constants** for immutable rules fixed for the lifetime of a contract address (vault owner, fee recipient hash, protocol token ID). Use **registers (`R4`–`R9`)** for state that updates across transactions or when multiple boxes must share the exact same `ergoTree` bytes.
:::

## Plug-and-Play Example (Verified on `MockChain`)

```ts
import { compile } from "@fleet-sdk/compiler";
import { OutputBuilder, RECOMMENDED_MIN_FEE_VALUE, SAFE_MIN_BOX_VALUE, TransactionBuilder } from "@fleet-sdk/core";
import { MockChain } from "@fleet-sdk/mock-chain";
import { SGroupElement, SInt, SSigmaProp } from "@fleet-sdk/serializer";

const mockChain = new MockChain({ height: 800_000 });
const alice = mockChain.newParty("Alice");
alice.addBalance({ nanoergs: 10_000_000_000n });

const [alicePk] = alice.address.getPublicKeys();

const contractTree = compile(
  `{ sigmaProp(HEIGHT >= unlockHeight) && ownerProp }`,
  {
    map: {
      unlockHeight: SInt(800_050),
      ownerProp: SSigmaProp(SGroupElement(alicePk))
    }
  }
);

const contractParty = mockChain.addParty(contractTree.toHex(), "ParameterizedVault");

const fundTx = new TransactionBuilder(mockChain.height)
  .from(alice.utxos.toArray())
  .to(new OutputBuilder(2_000_000_000n, contractTree))
  .sendChangeTo(alice.address)
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();

mockChain.execute(fundTx, { signers: [alice] });

mockChain.jumpTo(800_050);

const claimTx = new TransactionBuilder(mockChain.height)
  .from([...contractParty.utxos.toArray(), ...alice.utxos.toArray()])
  .to(new OutputBuilder(SAFE_MIN_BOX_VALUE, alice.address))
  .sendChangeTo(alice.address)
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();

const claimed = mockChain.execute(claimTx, { signers: [alice] });
console.log("Claim succeeded:", claimed); // true
```
