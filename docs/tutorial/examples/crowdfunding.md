# Example: Crowdfunding Contract

A complete multi-transaction example that composes everything from the earlier chapters: a compiled contract, registers, and several transactions interacting with the same box over time.

A crowdfunding campaign is a box that three different parties touch:

1. **Alice** creates the campaign box with an initial pledge.
2. **Bob** (or anyone) adds funds to the same box before the deadline.
3. After the deadline, **the project** collects the funds if the goal was met - otherwise **Alice** takes a refund.

## The contract

The campaign box stores its parameters in registers so every participant can verify them on-chain:

| Register | Content | Type |
| -------- | ------- | ---- |
| R4 | Deadline height | `Int` |
| R5 | Backer's public key (refund recipient) | `GroupElement` |
| R6 | Project's public key (collection recipient) | `GroupElement` |
| R7 | Funding goal in nanoERG | `Long` |

The contract allows exactly three spending paths:

- **Raise more** - before the deadline, anyone can spend the box as long as it is recreated with the same script and registers and a higher value. No signature is needed to *add* funds.
- **Collect** - at or after the deadline, if the goal is met, the project key signs and takes the funds.
- **Refund** - at or after the deadline, if the goal was missed, the original backer key signs and takes the funds back.

```ts
const script = `{
  val deadline = SELF.R4[Int].get
  val backer = SELF.R5[GroupElement].get
  val projectKey = SELF.R6[GroupElement].get
  val goal = SELF.R7[Long].get

  val raiseMore = sigmaProp({
    val out = OUTPUTS(0)
    out.propositionBytes == SELF.propositionBytes &&
    out.R4[Int].get == deadline &&
    out.R5[GroupElement].get == backer &&
    out.R6[GroupElement].get == projectKey &&
    out.R7[Long].get == goal &&
    out.value > SELF.value &&
    HEIGHT < deadline
  })

  val success = sigmaProp(HEIGHT >= deadline && SELF.value >= goal) && proveDlog(projectKey)
  val refund  = sigmaProp(HEIGHT >= deadline && SELF.value < goal)  && proveDlog(backer)

  raiseMore || success || refund
}`;

const contract = compile(script);
```

## Step 1: create the campaign

Alice compiles the contract, fills the registers, and seeds the campaign with 1 ERG. The register values come from the participants' public keys, extracted from their addresses:

```ts
import { SInt, SLong, SGroupElement } from "@fleet-sdk/serializer";

const pub = (party) =>
  ErgoAddress.fromBase58(party.address.toString()).getPublicKeys()[0];

const DEADLINE = chain.height + 100;
const GOAL = 2_000_000_000n; // 2 ERG

const regs = () => ({
  R4: SInt(DEADLINE).toHex(),
  R5: SGroupElement(pub(alice)).toHex(),
  R6: SGroupElement(pub(project)).toHex(),
  R7: SLong(GOAL).toHex()
});

const campaign = chain.addParty(contract.toHex(), "Campaign"); // tracks boxes at this script

const tx1 = new TransactionBuilder(chain.height)
  .from(alice.utxos.toArray())
  .to(new OutputBuilder(1_000_000_000n, contract).setAdditionalRegisters(regs()))
  .sendChangeTo(alice.address)
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();

chain.execute(tx1, { signers: [alice] }); // true
```

`chain.addParty(contract.toHex())` creates a watch-only party for the contract script, so `campaign.utxos` always lists the live campaign box - the same lookup a real app would do through the explorer.

## Step 2: pledge to the campaign

Bob spends the campaign box and recreates it with his 1.5 ERG added. The `raiseMore` path checks that the script and all registers survive unchanged, so no one can hijack the campaign mid-flight:

```ts
const box = campaign.utxos.toArray()[0];

const tx2 = new TransactionBuilder(chain.height)
  .from([box, ...bob.utxos.toArray()])
  .to(new OutputBuilder(box.value + 1_500_000_000n, contract).setAdditionalRegisters(regs()))
  .sendChangeTo(bob.address)
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();

chain.execute(tx2, { signers: [bob] }); // true
```

## Step 3: collect after a successful campaign

Once the deadline passes and the box holds at least the goal, the project signs and collects:

```ts
chain.newBlocks(101); // time passes, height > deadline

const current = campaign.utxos.toArray()[0];

const tx3 = new TransactionBuilder(chain.height)
  .from(current)
  .to(new OutputBuilder(current.value - RECOMMENDED_MIN_FEE_VALUE, project.address.toString()))
  .payFee(RECOMMENDED_MIN_FEE_VALUE)
  .build();

chain.execute(tx3, { signers: [project] }); // true - project receives 2.499 ERG
```

Had the campaign missed the goal, the same transaction shape with `signers: [alice]` and Alice's address would refund the backer instead. Every other combination is rejected by the contract: pledging after the deadline, collecting early, collecting below the goal, or refunding a successful campaign.

## Run it

The full script and a test suite covering all three paths live in [`examples/crowdfunding`](https://github.com/fleet-sdk/docs/tree/master/examples/crowdfunding):

```bash
cd examples/crowdfunding
npm install
node crowdfunding.mjs       # happy path: create, pledge, collect
node crowdfunding.test.mjs  # all six path checks
```

## On a live network

Only the inputs change. Replace the mock parties with boxes fetched from the explorer or a connected wallet, keep the current network height in the builder, and compile the same script with real public keys in the registers. The transaction-building code is identical.
