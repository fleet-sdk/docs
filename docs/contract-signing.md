# Contract Signing

When working with smart contracts on Ergo, you'll encounter situations where the boxes you want to spend are protected by contracts, not just simple P2PK addresses. This guide covers how to handle transaction signatures for these cases.

## Understanding Contract-Protected Boxes

### P2PK vs Contract Boxes

| Type | Protection | Signing |
|------|------------|---------|
| **P2PK** | Public key (wallet address) | Wallet can sign directly |
| **Contract** | ErgoScript conditions | Requires context/proof satisfaction |

```typescript
// P2PK box - protected by an address
const p2pkBox = {
  ergoTree: "0008cd03...", // Starts with 0008cd = P2PK
  value: "1000000000"
};

// Contract box - protected by a script
const contractBox = {
  ergoTree: "100604...",  // Complex ErgoTree
  value: "1000000000"
};
```

## The Challenge

When input boxes are protected by contracts (not in your wallet), the standard wallet signing won't work because:

1. Wallet only holds keys for your addresses
2. Contract boxes require satisfying specific conditions
3. Some contracts need external context data

## Signing Strategies

### Strategy 1: Using Context Extension

For contracts that require specific context values:

```typescript
import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";

// Contract expects values in context extension
const unsignedTx = new TransactionBuilder(height)
  .from(contractBoxes)
  .to(/* outputs */)
  .configure((settings) => {
    settings.setContextExtension({
      0: "0e2001020304", // Extension index 0 with some value
      1: "04c801"        // Extension index 1 with another value
    });
  })
  .sendChangeTo(changeAddress)
  .payMinFee()
  .build();
```

### Strategy 2: Multi-Signature Transactions

For contracts requiring multiple signatures:

```typescript
import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";
import { Prover } from "@fleet-sdk/wallet";

// Build the transaction
const unsignedTx = new TransactionBuilder(height)
  .from(multiSigBoxes)
  .to(
    new OutputBuilder(SAFE_MIN_BOX_VALUE, recipientAddress)
  )
  .sendChangeTo(changeAddress)
  .payMinFee()
  .build();

// First signer signs
const partiallySignedTx = await firstProver.sign(unsignedTx);

// Second signer completes the signature
const fullySignedTx = await secondProver.sign(partiallySignedTx);
```

### Strategy 3: Combining Wallet and Contract Boxes

When mixing P2PK boxes (from wallet) with contract boxes:

```typescript
import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";

// Get wallet boxes
const walletBoxes = await ergo.get_utxos();

// Contract box (from explorer/dApp state)
const contractBox = {
  boxId: "abc123...",
  value: "1000000000",
  ergoTree: "100604...", // Contract script
  // ... other properties
};

// Build transaction with both types
const unsignedTx = new TransactionBuilder(height)
  .from([...walletBoxes, contractBox])
  .to(/* outputs */)
  .sendChangeTo(changeAddress)
  .payMinFee()
  .build()
  .toEIP12Object();

// Wallet signs what it can
const signedTx = await ergo.sign_tx(unsignedTx);
```

### Strategy 4: Prover for Local Signing

Using `@fleet-sdk/wallet` for full control:

```typescript
import { Prover, BIP32Path } from "@fleet-sdk/wallet";
import { Mnemonic } from "@fleet-sdk/crypto";

// Derive signing key
const mnemonic = Mnemonic.fromPhrase("your mnemonic phrase...");
const rootKey = mnemonic.toHDKey();
const signingKey = rootKey.derive(BIP32Path.fromString("m/44'/429'/0'/0/0"));

// Create prover with the key
const prover = new Prover(signingKey);

// Sign the transaction
const signedTx = prover.sign(unsignedTx, {
  inputBoxes: allInputBoxes,
  dataInputBoxes: dataBoxes
});
```

## Common Contract Patterns

### Pattern 1: Time-Locked Boxes

Boxes that become spendable after a certain height:

```typescript
// Contract: HEIGHT > unlockHeight && proveDlog(pk)
const timeLockBox = await fetchTimeLockBox();

// Only works if current height > unlockHeight
const unsignedTx = new TransactionBuilder(currentHeight)
  .from([timeLockBox, ...walletBoxes])
  .to(/* outputs */)
  .build();

// Wallet can sign the proveDlog part
const signedTx = await ergo.sign_tx(unsignedTx.toEIP12Object());
```

### Pattern 2: Oracle Data Contracts

Contracts that reference oracle data:

```typescript
// Contract: CONTEXT.dataInputs(0).R4[Long].get == expectedValue

const oracleBox = await fetchOracleBox();

const unsignedTx = new TransactionBuilder(height)
  .from(contractBoxes)
  .withDataFrom([oracleBox]) // Oracle as data input
  .to(/* outputs */)
  .build();
```

### Pattern 3: Threshold Signatures

Multi-party contracts (e.g., 2-of-3):

```typescript
import { TransactionBuilder } from "@fleet-sdk/core";
import { Prover } from "@fleet-sdk/wallet";

// Build transaction
const unsignedTx = new TransactionBuilder(height)
  .from(thresholdBox)
  .to(/* outputs */)
  .build();

// Collect required number of signatures
const hints = [];

// Party 1 signs and creates hint
const party1Signed = await party1Prover.signWithHints(unsignedTx);
hints.push(party1Signed.hint);

// Party 2 uses hint and completes
const fullySignedTx = await party2Prover.signWithHints(
  unsignedTx, 
  { previousHints: hints }
);
```

## Using dApp Connector with Contract Boxes

### Partial Signing

Some wallets support partial signing for contract boxes:

```typescript
// Tell wallet which inputs belong to it
const unsignedTx = new TransactionBuilder(height)
  .from([
    { ...walletBox, inputIndex: 0 },
    { ...contractBox, inputIndex: 1 }
  ])
  .to(/* outputs */)
  .build()
  .toEIP12Object();

// Request partial signing for wallet-owned inputs only
const partiallySignedTx = await ergo.sign_tx(unsignedTx);

// Contract inputs remain unsigned - handle separately
```

### Sign Input Data

Provide signing hints through the EIP-12 API:

```typescript
const signOptions = {
  // Specify which inputs to sign
  inputIndices: [0, 1],
  // Provide context for contract evaluation
  dataInputs: [oracleBox]
};

const signedTx = await ergo.sign_tx(unsignedTx, signOptions);
```

## Practical Example: DEX Swap

Implementing a DEX swap where you interact with a liquidity pool contract:

```typescript
import { 
  TransactionBuilder, 
  OutputBuilder, 
  SAFE_MIN_BOX_VALUE 
} from "@fleet-sdk/core";

async function swapErgForToken(
  poolBox: Box,          // DEX pool contract box
  ergAmount: bigint,     // ERG to swap
  minTokenOut: bigint,   // Minimum tokens expected
  userAddress: string
): Promise<any> {
  // Get wallet boxes for the ERG we're swapping
  const walletBoxes = await ergo.get_utxos();
  const height = await ergo.get_current_height();

  // Calculate new pool state after swap
  const poolErgReserve = BigInt(poolBox.value);
  const poolTokenReserve = BigInt(poolBox.assets[0].amount);
  
  // AMM formula: dy = y * dx / (x + dx)
  const tokenOut = (poolTokenReserve * ergAmount) / (poolErgReserve + ergAmount);
  
  if (tokenOut < minTokenOut) {
    throw new Error("Slippage too high");
  }

  // Build the swap transaction
  const unsignedTx = new TransactionBuilder(height)
    .from([poolBox, ...walletBoxes])
    .to([
      // New pool box with updated reserves
      new OutputBuilder(
        (poolErgReserve + ergAmount).toString(),
        poolBox.ergoTree // Same contract
      ).addTokens({
        tokenId: poolBox.assets[0].tokenId,
        amount: (poolTokenReserve - tokenOut).toString()
      }).setAdditionalRegisters(poolBox.additionalRegisters),

      // User receives tokens
      new OutputBuilder(SAFE_MIN_BOX_VALUE, userAddress)
        .addTokens({
          tokenId: poolBox.assets[0].tokenId,
          amount: tokenOut.toString()
        })
    ])
    .sendChangeTo(userAddress)
    .payMinFee()
    .build()
    .toEIP12Object();

  // Sign - wallet handles its inputs, pool contract validates conditions
  const signedTx = await ergo.sign_tx(unsignedTx);
  
  return signedTx;
}
```

## Troubleshooting

### Error: "Script verification failed"

The contract conditions weren't satisfied:

```typescript
// Check contract requirements:
// 1. Are all required context values provided?
// 2. Is the HEIGHT condition met?
// 3. Are outputs correctly formatted?
// 4. Are all required data-inputs included?
```

### Error: "Input not signed"

Wallet can't sign contract-protected inputs:

```typescript
// Solution: Ensure contract allows spending with provided conditions
// Some contracts are not designed to be spent by external parties
```

### Error: "Missing context extension"

Contract expects context data:

```typescript
// Add required context extension
.configure((settings) => {
  settings.setContextExtension({
    // Add required context values
  });
})
```

## Summary

| Scenario | Solution |
|----------|----------|
| Time-locked boxes | Wait for unlock height, then sign normally |
| Multi-sig | Collect signatures from required parties |
| Contract + wallet boxes | Wallet signs its inputs; contract validates conditions |
| Oracle-dependent | Include oracle as data-input |
| Complex contracts | Use context extension and proper output formatting |

## Further Reading

- [ErgoScript Documentation](https://docs.ergoplatform.com/dev/scs/)
- [EIP-12 dApp Connector](https://github.com/ergoplatform/eips/pull/23)
- [Fleet SDK Wallet Package](https://github.com/fleet-sdk/fleet/tree/master/packages/wallet)
- [Sigma Protocols](https://docs.ergoplatform.com/dev/scs/sigma/)
