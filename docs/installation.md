# Installation Guide

This comprehensive guide will take you from a fresh installation to running your first Fleet SDK example scripts.

## Prerequisites

Before installing Fleet SDK, ensure you have the following:

### Node.js

Fleet SDK requires **Node.js 18.0.0 or higher**. Check your version:

```bash
node --version
```

If you don't have Node.js installed or need to upgrade:

- **macOS/Linux**: Use [nvm](https://github.com/nvm-sh/nvm) (recommended)
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 20
  nvm use 20
  ```

- **Windows**: Download from [nodejs.org](https://nodejs.org/) or use [nvm-windows](https://github.com/coreybutler/nvm-windows)

- **Using Volta** (cross-platform):
  ```bash
  curl https://get.volta.sh | bash
  volta install node@20
  ```

### Package Manager

You can use any of these package managers:

| Package Manager | Version | Install Command |
|-----------------|---------|-----------------|
| npm | 8.0.0+ | Included with Node.js |
| yarn | 1.22.0+ | `npm install -g yarn` |
| pnpm | 8.0.0+ | `npm install -g pnpm` |
| bun | 1.0.0+ | `curl -fsSL https://bun.sh/install \| bash` |

## Installation Methods

### Method 1: Quick Start (Recommended for beginners)

Create a new project and install Fleet SDK in one go:

::: code-group

```bash [npm]
mkdir my-ergo-dapp
cd my-ergo-dapp
npm init -y
npm install @fleet-sdk/core
```

```bash [yarn]
mkdir my-ergo-dapp
cd my-ergo-dapp
yarn init -y
yarn add @fleet-sdk/core
```

```bash [pnpm]
mkdir my-ergo-dapp
cd my-ergo-dapp
pnpm init
pnpm add @fleet-sdk/core
```

```bash [bun]
mkdir my-ergo-dapp
cd my-ergo-dapp
bun init
bun add @fleet-sdk/core
```

:::

### Method 2: Add to Existing Project

If you already have a project, simply add Fleet SDK:

::: code-group

```bash [npm]
npm install @fleet-sdk/core
```

```bash [yarn]
yarn add @fleet-sdk/core
```

```bash [pnpm]
pnpm add @fleet-sdk/core
```

```bash [bun]
bun add @fleet-sdk/core
```

:::

### Method 3: Full Fleet SDK Installation

For advanced use cases, install all Fleet SDK packages:

::: code-group

```bash [npm]
npm install @fleet-sdk/core @fleet-sdk/wallet @fleet-sdk/common @fleet-sdk/crypto @fleet-sdk/serializer @fleet-sdk/blockchain-providers
```

```bash [yarn]
yarn add @fleet-sdk/core @fleet-sdk/wallet @fleet-sdk/common @fleet-sdk/crypto @fleet-sdk/serializer @fleet-sdk/blockchain-providers
```

```bash [pnpm]
pnpm add @fleet-sdk/core @fleet-sdk/wallet @fleet-sdk/common @fleet-sdk/crypto @fleet-sdk/serializer @fleet-sdk/blockchain-providers
```

:::

## Fleet SDK Packages Overview

| Package | Description | When to Use |
|---------|-------------|-------------|
| `@fleet-sdk/core` | Transaction building, outputs, inputs | Always - core functionality |
| `@fleet-sdk/wallet` | Wallet operations, signing | Local wallet/signing needs |
| `@fleet-sdk/common` | Types, constants, utilities | Shared types across packages |
| `@fleet-sdk/crypto` | Cryptographic operations | Hashing, key derivation |
| `@fleet-sdk/serializer` | Sigma serialization | Box/register encoding |
| `@fleet-sdk/blockchain-providers` | Blockchain API integration | Fetching chain data |
| `@fleet-sdk/compiler` | ErgoScript compilation | Smart contract development |
| `@fleet-sdk/mock-chain` | Testing utilities | Unit/integration testing |

## TypeScript Configuration

For TypeScript projects, configure your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist",
    "lib": ["ES2020", "DOM"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Your First Script

### Step 1: Create the script file

Create a new file called `first-transaction.ts`:

```typescript
import { 
  TransactionBuilder, 
  OutputBuilder,
  SAFE_MIN_BOX_VALUE 
} from "@fleet-sdk/core";

// Example: Build a simple transaction structure
function buildSimpleTransaction() {
  // Sample input box (in real apps, fetch from wallet or explorer)
  const mockInput = {
    boxId: "e56847ed19b3dc6b72828fcfb992fdf7310828cf291221269b7ffc72fd66706e",
    value: "1000000000", // 1 ERG in nanoErg
    assets: [],
    ergoTree: "0008cd03a621f820dbed198b42a2dca799a571911f2dabbd2e4d441c9aad558da63f084d",
    creationHeight: 1000000,
    additionalRegisters: {},
    index: 0,
    transactionId: "9148408c04c2e38a6402a7950d6157730fa7d49e9ab3b9cadec481d7769918e9"
  };

  const recipientAddress = "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j";
  const changeAddress = "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j";

  // Build the transaction
  const unsignedTx = new TransactionBuilder(1000000)
    .from([mockInput])
    .to(
      new OutputBuilder(SAFE_MIN_BOX_VALUE, recipientAddress)
    )
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();

  console.log("✅ Transaction built successfully!");
  console.log("Inputs:", unsignedTx.inputs.length);
  console.log("Outputs:", unsignedTx.outputs.length);
  
  return unsignedTx;
}

// Run it!
buildSimpleTransaction();
```

### Step 2: Run with ts-node

Install ts-node and run:

```bash
npm install -D ts-node typescript @types/node
npx ts-node first-transaction.ts
```

### Step 3: Expected output

```
✅ Transaction built successfully!
Inputs: 1
Outputs: 2
```

## Browser Integration

Fleet SDK works in browsers too! Here's a minimal HTML setup:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Fleet SDK Demo</title>
</head>
<body>
  <h1>Fleet SDK Browser Demo</h1>
  <button id="connect">Connect Wallet</button>
  <div id="output"></div>

  <script type="module">
    import { TransactionBuilder, OutputBuilder } from 'https://esm.sh/@fleet-sdk/core';

    document.getElementById('connect').onclick = async () => {
      if (typeof ergoConnector !== 'undefined' && ergoConnector.nautilus) {
        const connected = await ergoConnector.nautilus.connect();
        if (connected) {
          const height = await ergo.get_current_height();
          const balance = await ergo.get_balance('ERG');
          document.getElementById('output').innerHTML = `
            <p>✅ Connected!</p>
            <p>Height: ${height}</p>
            <p>Balance: ${Number(balance) / 1e9} ERG</p>
          `;
        }
      } else {
        alert('Please install Nautilus Wallet!');
      }
    };
  </script>
</body>
</html>
```

## Framework Integration

### React / Next.js

```bash
npx create-next-app@latest my-ergo-app --typescript
cd my-ergo-app
npm install @fleet-sdk/core
```

### Vite

```bash
npm create vite@latest my-ergo-app -- --template vanilla-ts
cd my-ergo-app
npm install @fleet-sdk/core
```

### Node.js Backend

```bash
mkdir ergo-backend
cd ergo-backend
npm init -y
npm install @fleet-sdk/core @fleet-sdk/blockchain-providers
npm install -D typescript ts-node @types/node
```

## Troubleshooting

### Common Issues

**1. "Cannot find module '@fleet-sdk/core'"**
```bash
# Ensure you're in the right directory
pwd
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**2. TypeScript errors with BigInt**
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM"]
  }
}
```

**3. ESM/CommonJS conflicts**
Add to `package.json`:
```json
{
  "type": "module"
}
```

**4. Browser wallet not detected**
- Ensure Nautilus or SAFEW extension is installed
- Check the page is served via HTTP (not file://)
- Wallet extensions need time to inject - use `window.onload`

## Next Steps

Now that you have Fleet SDK installed:

1. **[Getting Started](/getting-started)** - Learn the basics
2. **[Core Concepts](/core-concepts)** - Understand Ergo's UTXO model
3. **[Transaction Building](/transaction-building)** - Build your first real transaction
4. **[Wallet Interaction](/wallet-interaction)** - Connect to user wallets

## Version Compatibility

| Fleet SDK | Node.js | TypeScript |
|-----------|---------|------------|
| 0.6.x | ≥18.0.0 | ≥4.7.0 |
| 0.5.x | ≥16.0.0 | ≥4.5.0 |
| 0.4.x | ≥14.0.0 | ≥4.3.0 |
