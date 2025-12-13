# Core Concepts

Before diving into Fleet SDK, it's essential to understand the fundamental concepts of the Ergo blockchain. This chapter covers the core building blocks that make Ergo unique.

## The UTXO Model

Ergo uses an **Extended UTXO (eUTXO)** model, which is an evolution of Bitcoin's original UTXO design. Understanding this model is crucial for building applications on Ergo.

### What is UTXO?

**UTXO** stands for **Unspent Transaction Output**. Think of UTXOs like physical cash:

- When you receive money, you get specific "bills" (UTXOs)
- When you spend money, you use entire bills and get change back
- You can't spend half a bill - you spend the whole thing

```
┌─────────────────────────────────────────────────────────┐
│                    UTXO Model                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Input UTXOs              Transaction        Outputs    │
│  ┌─────────┐                                ┌────────┐  │
│  │ 5 ERG   │──┐                          ┌──│ 3 ERG  │  │
│  └─────────┘  │     ┌──────────────┐     │  └────────┘  │
│               ├────►│ Transaction  │─────┤             │
│  ┌─────────┐  │     └──────────────┘     │  ┌────────┐  │
│  │ 2 ERG   │──┘                          └──│ 4 ERG  │  │
│  └─────────┘                                └────────┘  │
│                                             (change)    │
│  Total: 7 ERG                        Total: 7 ERG       │
│                                      (minus fee)        │
└─────────────────────────────────────────────────────────┘
```

### UTXO vs Account Model

| Feature | UTXO (Ergo, Bitcoin) | Account (Ethereum) |
|---------|---------------------|-------------------|
| State | Distributed across UTXOs | Stored in accounts |
| Parallelism | Excellent - no global state | Limited - sequential nonces |
| Privacy | Better - new addresses per tx | Worse - reused addresses |
| Complexity | Transaction-focused | State-focused |
| Verification | Stateless - inputs contain proof | Stateful - global state needed |

## What is a Box?

In Ergo, UTXOs are called **Boxes**. A Box is an extended UTXO that contains much more than just a value:

```typescript
type Box = {
  boxId: string;              // Unique identifier (32 bytes, hex)
  value: bigint;              // Amount in nanoErg (1 ERG = 10^9 nanoErg)
  ergoTree: string;           // The protecting script (contract)
  creationHeight: number;     // Block height when created
  assets: Token[];            // List of tokens in this box
  additionalRegisters: {      // R4-R9 for custom data
    R4?: string;
    R5?: string;
    R6?: string;
    R7?: string;
    R8?: string;
    R9?: string;
  };
  transactionId: string;      // ID of creating transaction
  index: number;              // Output index in creating transaction
};
```

### Box Components Explained

#### 1. Value (ERG Amount)

Every box must contain a minimum amount of ERG (currently ~0.001 ERG) to exist on the blockchain:

```typescript
import { SAFE_MIN_BOX_VALUE } from "@fleet-sdk/core";

// SAFE_MIN_BOX_VALUE = 1000000n (0.001 ERG)
const output = new OutputBuilder(SAFE_MIN_BOX_VALUE, recipientAddress);
```

#### 2. ErgoTree (Contract)

The ErgoTree is a serialized script that defines who can spend this box. Common patterns:

```typescript
// Simple P2PK (Pay to Public Key) - most common
// Anyone with the private key for this address can spend
const p2pkErgoTree = "0008cd03a621f820dbed198b42a2dca799a571911f2dabbd2e4d441c9aad558da63f084d";

// The ErgoTree encodes spending conditions:
// - Who can spend this box?
// - Under what conditions?
// - What data must be provided?
```

#### 3. Tokens (Native Assets)

Boxes can hold multiple tokens alongside ERG:

```typescript
type Token = {
  tokenId: string;  // 32-byte hex identifier
  amount: bigint;   // Token amount
};

// Example: Box holding ERG + SigUSD + NFT
const box = {
  value: 1000000000n,  // 1 ERG
  assets: [
    { 
      tokenId: "03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04", 
      amount: 100n  // 100 SigUSD cents
    },
    { 
      tokenId: "unique-nft-token-id-here", 
      amount: 1n  // NFT (quantity = 1)
    }
  ]
};
```

#### 4. Registers (R4-R9)

Boxes have 10 registers (R0-R9). R0-R3 are reserved:

| Register | Purpose | Access |
|----------|---------|--------|
| R0 | Value (nanoErg) | Implicit |
| R1 | Guard script (ErgoTree) | Implicit |
| R2 | Tokens | Implicit |
| R3 | Creation info | Implicit |
| R4-R9 | User data | Custom |

```typescript
import { OutputBuilder } from "@fleet-sdk/core";
import { SInt, SColl, SByte } from "@fleet-sdk/serializer";

// Store custom data in registers
new OutputBuilder(SAFE_MIN_BOX_VALUE, address)
  .setAdditionalRegisters({
    R4: SInt(42),                                    // Integer
    R5: SColl(SByte, [0x01, 0x02, 0x03]),           // Byte array
    R6: "0e0b48656c6c6f20576f726c64"                // Raw hex (string)
  });
```

## Transactions

An Ergo transaction transforms input boxes into output boxes:

```
┌────────────────────────────────────────────────────────────────┐
│                       ERGO TRANSACTION                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUTS (boxes being spent)                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Box 1: 5 ERG + 100 SigUSD                                │  │
│  │ Box 2: 2 ERG                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  DATA-INPUTS (read-only boxes, not spent)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Oracle Box: Current ERG/USD price                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  OUTPUTS (new boxes created)                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Box A: 3 ERG (to recipient)                              │  │
│  │ Box B: 50 SigUSD (to recipient)                          │  │
│  │ Box C: 3.999 ERG + 50 SigUSD (change to sender)          │  │
│  │ Box D: 0.001 ERG (miner fee)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Transaction Rules

1. **Value Conservation**: Total input value = Total output value (minus fee)
2. **Token Conservation**: Tokens in = Tokens out (unless minting/burning)
3. **Minimum Box Value**: Every output must have at least min box value
4. **Valid Signatures**: All input boxes must be properly unlocked

### Building Transactions with Fleet

```typescript
import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";

const unsignedTx = new TransactionBuilder(creationHeight)
  .from(inputBoxes)           // Boxes to spend
  .withDataFrom(dataInputs)   // Read-only reference boxes
  .to(                        // Create new boxes
    new OutputBuilder("1000000000", recipientAddress)
  )
  .sendChangeTo(changeAddress)
  .payMinFee()
  .build();
```

## Token System

Ergo has a native token system without requiring smart contracts.

### Token Properties

| Property | Description |
|----------|-------------|
| Token ID | First input's box ID of minting transaction |
| Amount | Number of tokens (max: 2^63 - 1) |
| Decimals | Display decimals (stored in R4) |
| Name | Human-readable name (R4) |
| Description | Token description (R5) |

### Token Standards (EIPs)

| Standard | Purpose | Key Features |
|----------|---------|--------------|
| [EIP-4](https://github.com/ergoplatform/eips/blob/master/eip-0004.md) | Asset Standard | Name, description, decimals |
| [EIP-24](https://github.com/ergoplatform/eips/blob/master/eip-0024.md) | Artwork Standard | NFT metadata |
| [EIP-34](https://github.com/ergoplatform/eips/blob/master/eip-0034.md) | Token Minting | Enhanced minting |

### Minting Tokens with Fleet

```typescript
import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";

new TransactionBuilder(height)
  .from(inputs)
  .to(
    new OutputBuilder(SAFE_MIN_BOX_VALUE, myAddress)
      .mintToken({
        amount: "1000000",
        name: "MyToken",
        decimals: 2,
        description: "My first token on Ergo"
      })
  )
  .sendChangeTo(changeAddress)
  .payMinFee()
  .build();
```

## Addresses

Ergo addresses encode the spending conditions (ErgoTree) in a human-readable format.

### Address Types

| Prefix | Network | Type | Example Start |
|--------|---------|------|---------------|
| 9 | Mainnet | P2PK | `9f4QF...` |
| 3 | Testnet | P2PK | `3WwbY...` |
| 8 | Mainnet | P2S | `8UApt...` |
| ? | Testnet | P2S | Various |

### Address Components

```typescript
import { ErgoAddress } from "@fleet-sdk/core";

const address = ErgoAddress.fromBase58(
  "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"
);

// Get the ErgoTree (contract) from address
const ergoTree = address.ergoTree;

// Check network
const isMainnet = address.network === "mainnet";
```

## ErgoScript Basics

ErgoScript is the smart contract language for Ergo. While Fleet SDK is for off-chain code, understanding ErgoScript helps you work with contracts.

### Simple Contract Examples

```scala
// Anyone can spend (not recommended!)
{ true }

// Only owner can spend (P2PK)
{ proveDlog(ownerPubKey) }

// Multi-signature (2 of 3)
{ atLeast(2, Coll(pk1, pk2, pk3)) }

// Time-locked
{ HEIGHT > 1000000 && proveDlog(ownerPubKey) }

// Value threshold
{ OUTPUTS(0).value >= 1000000000L }
```

### Working with Contracts in Fleet

```typescript
import { compile } from "@fleet-sdk/compiler";
import { OutputBuilder } from "@fleet-sdk/core";

// Compile ErgoScript to ErgoTree
const ergoTree = compile("{ sigmaProp(true) }");

// Create output with custom contract
const output = new OutputBuilder(SAFE_MIN_BOX_VALUE, ergoTree);
```

## Block and Network Concepts

### Block Height

Block height is the number of blocks since genesis. Used for:

- Transaction creation height (required)
- Time-locking conditions
- Context reference

```typescript
// Get current height from wallet
const height = await ergo.get_current_height();

// Use in transaction
new TransactionBuilder(height)
  .from(inputs)
  // ...
```

### Network Types

| Network | Purpose | Explorer |
|---------|---------|----------|
| Mainnet | Production | [explorer.ergoplatform.com](https://explorer.ergoplatform.com) |
| Testnet | Development | [testnet.ergoplatform.com](https://testnet.ergoplatform.com) |

## Summary

| Concept | Description | Fleet SDK Usage |
|---------|-------------|-----------------|
| Box | Extended UTXO with value, tokens, registers | `OutputBuilder` creates boxes |
| Transaction | Transforms inputs to outputs | `TransactionBuilder` |
| Token | Native asset in boxes | `addTokens()`, `mintToken()` |
| ErgoTree | Spending conditions/contract | Encoded in addresses |
| Registers | Custom data storage (R4-R9) | `setAdditionalRegisters()` |
| Height | Block number | Required for `TransactionBuilder` |

## Next Steps

Now that you understand the core concepts:

1. **[Transaction Building](/transaction-building)** - Create your first transaction
2. **[Wallet Interaction](/wallet-interaction)** - Connect to user wallets
3. **[Token Operations](/token-burning)** - Work with tokens
