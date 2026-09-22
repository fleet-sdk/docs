# Context Variables

Context variables, also called **context extensions** or **injected variables**, provide values to an ErgoScript contract at spending time. They are attached to a transaction input and can be read in ErgoScript with `getVar[T](id)`.

They are different from additional registers:

- **Registers** (`R4` to `R9`) are stored in a box and remain available for the lifetime of that box.
- **Context variables** exist only on the input that spends a box. They are not persisted in the box itself.

This distinction is important: you do not create a box _containing_ an injected variable. You create a box whose contract expects a variable, then inject the value when that box is spent.

## A contract that expects a variable

The contract from the previous guide reads context variable `0` as an `Int` and only succeeds when its value is `42`:

```ts
import { compile } from "@fleet-sdk/compiler";

const contract = compile(
  "sigmaProp(getVar[Int](0).isDefined && getVar[Int](0).get == 42)"
);
```

The `isDefined` check makes the contract fail safely when the variable is missing instead of calling `.get` on an empty option.

## Inject a variable with Fleet

Fleet represents a spendable input with `ErgoUnsignedInput`. Call `setContextExtension()` and use serializer constants such as `SInt` to encode the value expected by the contract.

```bash
npm install @fleet-sdk/core @fleet-sdk/serializer
```

```ts
import {
  ErgoUnsignedInput,
  OutputBuilder,
  TransactionBuilder
} from "@fleet-sdk/core";
import { SInt } from "@fleet-sdk/serializer";

const contractInput = new ErgoUnsignedInput(contractBox)
  .setContextExtension({
    0: SInt(42)
  });

const unsignedTx = new TransactionBuilder(creationHeight)
  .from(contractInput)
  .to(new OutputBuilder(1_000_000n, recipientAddress))
  .sendChangeTo(changeAddress)
  .payMinFee()
  .build();
```

Here `contractBox` is the confirmed box created in [Creating Boxes with Contracts](./contract-boxes.md). Fleet serializes `SInt(42)` into the input's context extension. The contract reads it through `getVar[Int](0)` while the input is being validated.

If variable `0` is missing or contains a different integer, the example contract cannot be satisfied.

## Multiple context variables

Use different numeric IDs when a contract expects more than one value. The IDs and types must exactly match the contract.

For example, a script may expect an integer at `0` and a boolean at `1`:

```ts
import { SBool, SInt } from "@fleet-sdk/serializer";

const input = new ErgoUnsignedInput(contractBox)
  .setContextExtension({
    0: SInt(42),
    1: SBool(true)
  });
```

The corresponding ErgoScript must read the same IDs using compatible types. A mismatch between the serialized type and the type requested by `getVar` will not satisfy the contract.

## When to use context variables

Context variables are useful when a spending transaction needs to provide information that should not be stored permanently in the box, for example:

- selecting a branch of contract logic;
- pointing to an output or another item in the current transaction;
- supplying a value known only when the box is spent.

For data that must remain part of the box and be readable by later transactions, use additional registers through `OutputBuilder.setAdditionalRegisters()` instead.
