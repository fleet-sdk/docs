# Tutorial: Building Your First Ergo dApp

This step-by-step tutorial will guide you through building a complete Ergo dApp using Fleet SDK. By the end, you'll have a working application that can:

- Connect to a wallet
- Display balances
- Build and send transactions
- Mint tokens

## Prerequisites

- Node.js 18+ installed ([Installation Guide](/installation))
- A browser wallet (Nautilus recommended)
- Basic TypeScript knowledge
- Testnet ERG for testing (get from [faucet](https://testnet-faucet.ergoplatform.com))

## Part 1: Project Setup

### Step 1: Create the project

```bash
mkdir ergo-dapp-tutorial
cd ergo-dapp-tutorial
npm init -y
npm install @fleet-sdk/core @fleet-sdk/common
npm install -D typescript vite
```

### Step 2: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

### Step 3: Create project structure

```bash
mkdir src
touch src/main.ts src/wallet.ts src/transactions.ts
touch index.html
```

## Part 2: Wallet Connection

### Step 1: Create the wallet module

Create `src/wallet.ts`:

```typescript
// Types for the EIP-12 wallet API
declare global {
  interface Window {
    ergoConnector: {
      nautilus: {
        connect: () => Promise<boolean>;
        isConnected: () => Promise<boolean>;
      };
    };
    ergo: {
      get_balance: (tokenId?: string) => Promise<string>;
      get_change_address: () => Promise<string>;
      get_used_addresses: () => Promise<string[]>;
      get_utxos: (params?: any) => Promise<Box[]>;
      get_current_height: () => Promise<number>;
      sign_tx: (tx: any) => Promise<any>;
      submit_tx: (tx: any) => Promise<string>;
    };
  }
}

export interface Box {
  boxId: string;
  value: string;
  assets: { tokenId: string; amount: string }[];
  ergoTree: string;
  creationHeight: number;
  additionalRegisters: Record<string, string>;
  transactionId: string;
  index: number;
}

export interface WalletState {
  connected: boolean;
  balance: string;
  address: string;
  height: number;
}

export class WalletManager {
  private state: WalletState = {
    connected: false,
    balance: "0",
    address: "",
    height: 0
  };

  async connect(): Promise<boolean> {
    // Check if wallet is available
    if (typeof window.ergoConnector === "undefined") {
      throw new Error("No wallet found. Please install Nautilus Wallet.");
    }

    if (!window.ergoConnector.nautilus) {
      throw new Error("Nautilus Wallet not found.");
    }

    // Request connection
    const connected = await window.ergoConnector.nautilus.connect();
    
    if (connected) {
      this.state.connected = true;
      await this.refreshState();
    }

    return connected;
  }

  async refreshState(): Promise<WalletState> {
    if (!this.state.connected) {
      throw new Error("Wallet not connected");
    }

    // Fetch all wallet state in parallel
    const [balance, address, height] = await Promise.all([
      window.ergo.get_balance("ERG"),
      window.ergo.get_change_address(),
      window.ergo.get_current_height()
    ]);

    this.state = {
      connected: true,
      balance,
      address,
      height
    };

    return this.state;
  }

  async getBoxes(amount?: string): Promise<Box[]> {
    if (!this.state.connected) {
      throw new Error("Wallet not connected");
    }

    const boxes = await window.ergo.get_utxos(
      amount ? { amount } : undefined
    );
    
    return boxes;
  }

  async signAndSubmit(unsignedTx: any): Promise<string> {
    // Sign the transaction
    const signedTx = await window.ergo.sign_tx(unsignedTx);
    
    // Submit to network
    const txId = await window.ergo.submit_tx(signedTx);
    
    return txId;
  }

  getState(): WalletState {
    return { ...this.state };
  }

  formatErg(nanoErg: string): string {
    const erg = Number(nanoErg) / 1_000_000_000;
    return erg.toFixed(4);
  }
}
```

## Part 3: Transaction Building

### Step 1: Create the transactions module

Create `src/transactions.ts`:

```typescript
import { 
  TransactionBuilder, 
  OutputBuilder, 
  SAFE_MIN_BOX_VALUE 
} from "@fleet-sdk/core";
import type { Box } from "./wallet";

export interface TransactionResult {
  unsignedTx: any;
  fee: string;
  inputs: number;
  outputs: number;
}

/**
 * Build a simple ERG transfer transaction
 */
export function buildTransfer(
  inputs: Box[],
  recipientAddress: string,
  amountNanoErg: string,
  changeAddress: string,
  height: number
): TransactionResult {
  const tx = new TransactionBuilder(height)
    .from(inputs)
    .to(
      new OutputBuilder(amountNanoErg, recipientAddress)
    )
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();

  return {
    unsignedTx: tx.toEIP12Object(),
    fee: "1100000",
    inputs: tx.inputs.length,
    outputs: tx.outputs.length
  };
}

/**
 * Build a token transfer transaction
 */
export function buildTokenTransfer(
  inputs: Box[],
  recipientAddress: string,
  tokenId: string,
  tokenAmount: string,
  changeAddress: string,
  height: number
): TransactionResult {
  const tx = new TransactionBuilder(height)
    .from(inputs)
    .to(
      new OutputBuilder(SAFE_MIN_BOX_VALUE, recipientAddress)
        .addTokens({ tokenId, amount: tokenAmount })
    )
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();

  return {
    unsignedTx: tx.toEIP12Object(),
    fee: "1100000",
    inputs: tx.inputs.length,
    outputs: tx.outputs.length
  };
}

/**
 * Build a token minting transaction
 */
export function buildMintToken(
  inputs: Box[],
  mintToAddress: string,
  tokenName: string,
  tokenDescription: string,
  tokenAmount: string,
  decimals: number,
  changeAddress: string,
  height: number
): TransactionResult {
  const tx = new TransactionBuilder(height)
    .from(inputs)
    .to(
      new OutputBuilder(SAFE_MIN_BOX_VALUE, mintToAddress)
        .mintToken({
          name: tokenName,
          description: tokenDescription,
          amount: tokenAmount,
          decimals
        })
    )
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();

  return {
    unsignedTx: tx.toEIP12Object(),
    fee: "1100000",
    inputs: tx.inputs.length,
    outputs: tx.outputs.length
  };
}

/**
 * Build a multi-output transaction (send to multiple recipients)
 */
export function buildMultiTransfer(
  inputs: Box[],
  recipients: { address: string; amount: string }[],
  changeAddress: string,
  height: number
): TransactionResult {
  let builder = new TransactionBuilder(height).from(inputs);

  // Add each recipient as an output
  for (const recipient of recipients) {
    builder = builder.to(
      new OutputBuilder(recipient.amount, recipient.address)
    );
  }

  const tx = builder
    .sendChangeTo(changeAddress)
    .payMinFee()
    .build();

  return {
    unsignedTx: tx.toEIP12Object(),
    fee: "1100000",
    inputs: tx.inputs.length,
    outputs: tx.outputs.length
  };
}
```

## Part 4: Building the UI

### Step 1: Create the HTML

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ergo dApp Tutorial</title>
  <style>
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #1a1a2e;
      color: #eee;
    }
    h1 { color: #00d9ff; }
    .card {
      background: #16213e;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    button {
      background: #00d9ff;
      color: #1a1a2e;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      font-size: 16px;
    }
    button:hover { background: #00b8d9; }
    button:disabled { background: #555; cursor: not-allowed; }
    input, select {
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      border: 1px solid #333;
      border-radius: 8px;
      background: #0f0f23;
      color: #fff;
    }
    .balance {
      font-size: 2em;
      color: #00d9ff;
    }
    .address {
      font-family: monospace;
      font-size: 0.9em;
      word-break: break-all;
      color: #888;
    }
    .success { color: #00ff88; }
    .error { color: #ff4444; }
    .hidden { display: none; }
    .form-group { margin: 15px 0; }
    label { display: block; margin-bottom: 5px; color: #aaa; }
  </style>
</head>
<body>
  <h1>🚀 Ergo dApp Tutorial</h1>

  <!-- Wallet Connection -->
  <div class="card" id="connect-section">
    <h2>Connect Wallet</h2>
    <button id="connect-btn">Connect Nautilus</button>
    <p id="connect-error" class="error hidden"></p>
  </div>

  <!-- Wallet Info (hidden until connected) -->
  <div class="card hidden" id="wallet-section">
    <h2>Wallet Info</h2>
    <p class="balance" id="balance">0 ERG</p>
    <p class="address" id="address"></p>
    <p>Height: <span id="height"></span></p>
    <button id="refresh-btn">Refresh</button>
  </div>

  <!-- Send ERG (hidden until connected) -->
  <div class="card hidden" id="send-section">
    <h2>Send ERG</h2>
    <div class="form-group">
      <label>Recipient Address</label>
      <input type="text" id="recipient" placeholder="9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j">
    </div>
    <div class="form-group">
      <label>Amount (ERG)</label>
      <input type="number" id="amount" placeholder="1.0" step="0.001" min="0.001">
    </div>
    <button id="send-btn">Send ERG</button>
    <p id="send-result" class="hidden"></p>
  </div>

  <!-- Mint Token (hidden until connected) -->
  <div class="card hidden" id="mint-section">
    <h2>Mint Token</h2>
    <div class="form-group">
      <label>Token Name</label>
      <input type="text" id="token-name" placeholder="MyToken">
    </div>
    <div class="form-group">
      <label>Description</label>
      <input type="text" id="token-desc" placeholder="My first token">
    </div>
    <div class="form-group">
      <label>Amount</label>
      <input type="number" id="token-amount" placeholder="1000" min="1">
    </div>
    <div class="form-group">
      <label>Decimals</label>
      <input type="number" id="token-decimals" placeholder="2" min="0" max="9">
    </div>
    <button id="mint-btn">Mint Token</button>
    <p id="mint-result" class="hidden"></p>
  </div>

  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### Step 2: Create the main application

Create `src/main.ts`:

```typescript
import { WalletManager } from "./wallet";
import { buildTransfer, buildMintToken } from "./transactions";

// Initialize wallet manager
const wallet = new WalletManager();

// DOM Elements
const connectBtn = document.getElementById("connect-btn") as HTMLButtonElement;
const connectError = document.getElementById("connect-error") as HTMLParagraphElement;
const connectSection = document.getElementById("connect-section") as HTMLDivElement;
const walletSection = document.getElementById("wallet-section") as HTMLDivElement;
const sendSection = document.getElementById("send-section") as HTMLDivElement;
const mintSection = document.getElementById("mint-section") as HTMLDivElement;

const balanceEl = document.getElementById("balance") as HTMLParagraphElement;
const addressEl = document.getElementById("address") as HTMLParagraphElement;
const heightEl = document.getElementById("height") as HTMLSpanElement;
const refreshBtn = document.getElementById("refresh-btn") as HTMLButtonElement;

const recipientInput = document.getElementById("recipient") as HTMLInputElement;
const amountInput = document.getElementById("amount") as HTMLInputElement;
const sendBtn = document.getElementById("send-btn") as HTMLButtonElement;
const sendResult = document.getElementById("send-result") as HTMLParagraphElement;

const tokenNameInput = document.getElementById("token-name") as HTMLInputElement;
const tokenDescInput = document.getElementById("token-desc") as HTMLInputElement;
const tokenAmountInput = document.getElementById("token-amount") as HTMLInputElement;
const tokenDecimalsInput = document.getElementById("token-decimals") as HTMLInputElement;
const mintBtn = document.getElementById("mint-btn") as HTMLButtonElement;
const mintResult = document.getElementById("mint-result") as HTMLParagraphElement;

// Update UI with wallet state
function updateUI(): void {
  const state = wallet.getState();
  
  if (state.connected) {
    connectSection.classList.add("hidden");
    walletSection.classList.remove("hidden");
    sendSection.classList.remove("hidden");
    mintSection.classList.remove("hidden");

    balanceEl.textContent = `${wallet.formatErg(state.balance)} ERG`;
    addressEl.textContent = state.address;
    heightEl.textContent = state.height.toString();
  }
}

// Connect wallet
connectBtn.addEventListener("click", async () => {
  try {
    connectBtn.disabled = true;
    connectBtn.textContent = "Connecting...";
    connectError.classList.add("hidden");

    await wallet.connect();
    updateUI();
  } catch (error) {
    connectError.textContent = (error as Error).message;
    connectError.classList.remove("hidden");
  } finally {
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect Nautilus";
  }
});

// Refresh wallet state
refreshBtn.addEventListener("click", async () => {
  try {
    refreshBtn.disabled = true;
    await wallet.refreshState();
    updateUI();
  } finally {
    refreshBtn.disabled = false;
  }
});

// Send ERG
sendBtn.addEventListener("click", async () => {
  try {
    sendBtn.disabled = true;
    sendBtn.textContent = "Building...";
    sendResult.classList.add("hidden");

    const recipient = recipientInput.value.trim();
    const amountErg = parseFloat(amountInput.value);

    if (!recipient || !amountErg) {
      throw new Error("Please fill in all fields");
    }

    // Convert ERG to nanoErg
    const amountNanoErg = Math.floor(amountErg * 1_000_000_000).toString();

    // Get current state
    const state = wallet.getState();
    
    // Get input boxes
    const boxes = await wallet.getBoxes(amountNanoErg);
    
    if (boxes.length === 0) {
      throw new Error("Insufficient funds");
    }

    // Build transaction
    const result = buildTransfer(
      boxes,
      recipient,
      amountNanoErg,
      state.address,
      state.height
    );

    sendBtn.textContent = "Signing...";

    // Sign and submit
    const txId = await wallet.signAndSubmit(result.unsignedTx);

    sendResult.className = "success";
    sendResult.innerHTML = `✅ Transaction submitted!<br>
      <a href="https://explorer.ergoplatform.com/en/transactions/${txId}" 
         target="_blank" style="color: #00d9ff;">View on Explorer</a>`;
    sendResult.classList.remove("hidden");

    // Refresh balance
    await wallet.refreshState();
    updateUI();

  } catch (error) {
    sendResult.className = "error";
    sendResult.textContent = `❌ ${(error as Error).message}`;
    sendResult.classList.remove("hidden");
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send ERG";
  }
});

// Mint Token
mintBtn.addEventListener("click", async () => {
  try {
    mintBtn.disabled = true;
    mintBtn.textContent = "Building...";
    mintResult.classList.add("hidden");

    const name = tokenNameInput.value.trim();
    const description = tokenDescInput.value.trim();
    const amount = tokenAmountInput.value;
    const decimals = parseInt(tokenDecimalsInput.value) || 0;

    if (!name || !amount) {
      throw new Error("Please fill in token name and amount");
    }

    // Get current state
    const state = wallet.getState();
    
    // Get input boxes (need some ERG for the transaction)
    const boxes = await wallet.getBoxes();
    
    if (boxes.length === 0) {
      throw new Error("Insufficient funds");
    }

    // Build transaction
    const result = buildMintToken(
      boxes,
      state.address,  // Mint to own address
      name,
      description,
      amount,
      decimals,
      state.address,
      state.height
    );

    mintBtn.textContent = "Signing...";

    // Sign and submit
    const txId = await wallet.signAndSubmit(result.unsignedTx);

    mintResult.className = "success";
    mintResult.innerHTML = `✅ Token minted!<br>
      <a href="https://explorer.ergoplatform.com/en/transactions/${txId}" 
         target="_blank" style="color: #00d9ff;">View on Explorer</a>`;
    mintResult.classList.remove("hidden");

    // Refresh balance
    await wallet.refreshState();
    updateUI();

  } catch (error) {
    mintResult.className = "error";
    mintResult.textContent = `❌ ${(error as Error).message}`;
    mintResult.classList.remove("hidden");
  } finally {
    mintBtn.disabled = false;
    mintBtn.textContent = "Mint Token";
  }
});

// Check if already connected on page load
window.addEventListener("load", async () => {
  if (typeof window.ergoConnector !== "undefined" && 
      window.ergoConnector.nautilus) {
    const connected = await window.ergoConnector.nautilus.isConnected();
    if (connected) {
      await wallet.connect();
      updateUI();
    }
  }
});
```

## Part 5: Running the Application

### Step 1: Start the development server

```bash
npx vite
```

### Step 2: Open in browser

Navigate to `http://localhost:5173` and:

1. Click "Connect Nautilus" 
2. Approve the connection in your wallet
3. Try sending ERG or minting a token!

## Part 6: Advanced Patterns

### Pattern 1: Handling Transaction Errors

```typescript
async function safeTransactionSubmit(unsignedTx: any): Promise<string | null> {
  try {
    const signedTx = await window.ergo.sign_tx(unsignedTx);
    const txId = await window.ergo.submit_tx(signedTx);
    return txId;
  } catch (error: any) {
    // User rejected signing
    if (error.code === 1) {
      console.log("User cancelled transaction");
      return null;
    }
    // Insufficient funds
    if (error.message?.includes("insufficient")) {
      throw new Error("Insufficient funds for this transaction");
    }
    // Re-throw unknown errors
    throw error;
  }
}
```

### Pattern 2: Waiting for Confirmation

```typescript
async function waitForConfirmation(
  txId: string, 
  timeout: number = 60000
): Promise<boolean> {
  const startTime = Date.now();
  const explorerApi = "https://api.ergoplatform.com/api/v1";

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(
        `${explorerApi}/transactions/${txId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.numConfirmations > 0) {
          return true;
        }
      }
    } catch {
      // Ignore fetch errors, keep polling
    }

    // Wait 5 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  return false;
}
```

### Pattern 3: Box Selection Strategy

```typescript
import { 
  TransactionBuilder,
  OutputBuilder,
  BoxSelector 
} from "@fleet-sdk/core";

// Use box selector for precise control
const selector = new BoxSelector(inputBoxes);
const selectedBoxes = selector.select({
  target: {
    nanoErgs: BigInt(amountToSend) + BigInt(fee)
  }
});

new TransactionBuilder(height)
  .from(selectedBoxes)
  .to(/* outputs */)
  .build();
```

## Exercises

To reinforce your learning, try these exercises:

### Exercise 1: Add Token Balance Display
Modify the UI to display all tokens the wallet holds, not just ERG.

### Exercise 2: Multi-Recipient Transaction
Implement a form that allows sending ERG to multiple addresses at once.

### Exercise 3: Transaction History
Use the Explorer API to display recent transactions for the connected wallet.

### Exercise 4: Token Transfer
Add functionality to send existing tokens (not just mint new ones).

## Summary

In this tutorial, you learned how to:

✅ Set up a Fleet SDK project  
✅ Connect to a browser wallet  
✅ Read wallet state (balance, address, UTXOs)  
✅ Build transfer transactions  
✅ Mint new tokens  
✅ Sign and submit transactions  
✅ Handle errors gracefully  

## Next Steps

- **[Transaction Building](/transaction-building)** - Deep dive into transaction building
- **[Wallet Interaction](/wallet-interaction)** - Complete EIP-12 reference
- **[Token Operations](/token-burning)** - Learn about burning tokens
- **[Core Concepts](/core-concepts)** - Understand Ergo's architecture
