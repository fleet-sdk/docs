# Registers

Every Ergo box has ten registers. `R0` through `R3` contain the box's value,
contract, tokens, and creation data. Applications can use the optional registers
`R4` through `R9` to store typed values that a contract can validate later.

Common examples include an order price, an owner key, or metadata associated
with a token. Register values are serialized as [Sigma
constants](https://docs.ergoplatform.com/dev/scs/sigma/), so both the application
and the contract must agree on each value's type and meaning.

## Set registers on an output

Use `OutputBuilder.setAdditionalRegisters()` to add optional registers to a new
box. Fleet's serializer constructors keep the values type-safe and serialize
them for you.

```ts
import { OutputBuilder } from "@fleet-sdk/core";
import { utf8 } from "@fleet-sdk/crypto";
import { SByte, SColl, SLong } from "@fleet-sdk/serializer";

const recipient = "9fMPy1XY3GW4T6t3LjYofqmzER6x9cV21n5UVJTWmma4Y9mAW6c";

const output = new OutputBuilder(2_000_000n, recipient)
  .setAdditionalRegisters({
    // Price in nanoERGs.
    R4: SLong(50_000_000n),
    // A short UTF-8 label stored as Coll[Byte].
    R5: SColl(SByte, utf8.decode("fixed-price order"))
  })
  .build();

console.log(output.additionalRegisters.R4);
console.log(output.additionalRegisters.R5);
```

`setAdditionalRegisters()` also accepts already serialized hexadecimal Sigma
constants. Prefer the serializer constructors for new values because they make
the intended type explicit.

## Keep registers densely packed

Optional registers must be consecutive. If `R4` and `R6` are present, `R5`
must also be present. Fleet checks this when the output is built and rejects a
box with a gap.

```ts
import { OutputBuilder } from "@fleet-sdk/core";
import { SInt } from "@fleet-sdk/serializer";

const invalidOutput = new OutputBuilder(2_000_000n, recipient)
  .setAdditionalRegisters({
    R4: SInt(1),
    R6: SInt(3) // Invalid: R5 is missing.
  });

invalidOutput.build(); // Throws InvalidRegistersPacking.
```

## Use registers in a transaction

An `OutputBuilder` with registers can be passed to `TransactionBuilder.to()`
like any other output. Once the transaction is confirmed, the values become
part of the created box and can be read by off-chain applications or validated
by its ErgoScript contract.

```ts
import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";
import { SLong } from "@fleet-sdk/serializer";

const orderOutput = new OutputBuilder(2_000_000n, recipient)
  .setAdditionalRegisters({ R4: SLong(50_000_000n) });

const unsignedTransaction = new TransactionBuilder(currentHeight)
  .from(inputs)
  .to(orderOutput)
  .sendChangeTo(changeAddress)
  .payMinFee()
  .build()
  .toEIP12Object();
```

Only store data that needs to be available on-chain. Registers increase the box
size and therefore its minimum value and transaction cost. Document the schema
of every register your application creates so that contracts, indexers, and
clients decode the same types.
